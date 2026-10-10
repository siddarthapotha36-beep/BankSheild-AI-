import json
import re
from pathlib import Path
from typing import Dict, Any, List
from app.utils.text_cleaner import clean_text

DATA_FILE = Path(__file__).parent.parent / "data" / "scam_patterns.json"

class RuleEngine:
    def __init__(self, patterns_path: Path = DATA_FILE):
        self.patterns_path = patterns_path
        self._load_rules()

    def _load_rules(self):
        if self.patterns_path.exists():
            with open(self.patterns_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                self.rules = data.get("rules", [])
        else:
            self.rules = []

    def analyze(self, message: str) -> Dict[str, Any]:
        """
        Analyze message against rule engine patterns.
        Returns:
            - score (0-100)
            - warnings: List[Dict[str, str]]
            - matched_phrases: List[str]
            - signals: Dict[str, bool]
        """
        self._load_rules()
        cleaned = clean_text(message)
        lowered = cleaned.lower()

        total_score = 0
        warnings: List[Dict[str, str]] = []
        matched_phrases: List[str] = []
        signals: Dict[str, bool] = {
            "has_otp_request": False,
            "has_urgency": False,
            "has_remote_app": False,
            "has_kyc_bait": False,
            "has_unverified_contact": False
        }

        # Detection for legitimate transactional banking patterns
        genuine_regexes = [
            r'\b(?:debited|credited|withdrawn|transferred|deposited)\b',
            r'\ba\/c\s*(?:no\.?\s*)?(?:ending\s*)?(?:xx|\*+)?[0-9]{3,6}\b',
            r'\b(?:account|acct)\s*(?:ending\s*(?:in\s*)?|xx|\*+)[0-9]{3,6}\b',
            r'\bcard\s*(?:ending\s*(?:in\s*)?|xx|\*+)[0-9]{3,6}\b',
            r'\b(?:ref|rrn|utr|txn\s*id|transaction\s*id)[\s\:\#]+[a-z0-9]{5,28}\b',
            r'\bavail(?:able)?\s+bal(?:ance)?\b',
            r'\b(?:neft|rtgs|imps|upi\s+txn|online\s+transaction)\b',
            r'\b(?:successful\s+login|login\s+to|netbanking|net\s*banking|baroda\s*connect|mobile\s*banking)\b',
            r'\b(?:sms\s+block|block\s+to\s+[0-9]+)\b',
            r'\b(?:state\s+bank|hdfc|icici|axis|kotak|pnb|punjab\s+national|bob|bank\s+of\s+baroda|canara|idfc|indusind|union\s+bank)\b'
        ]
        has_genuine_banking_signals = any(re.search(pat, lowered) for pat in genuine_regexes)

        # Ambiguous message indicators (vague, lacking verifiable proof)
        ambiguous_regexes = [
            r'\bverify\s+(?:your\s+)?account\b',
            r'\bconfirm\s+(?:your\s+)?(?:recent\s+)?transaction\b',
            r'\bverification\s+is\s+pending\b',
            r'\bconfirm\s+by\s+replying\b',
            r'\bcontact\s+helpdesk\b',
            r'\bcall\s+me\s+back\b',
            r'\bpayment\s+request\s+of\b',
            r'\bpackage\s+delivery\b',
            r'\bparcel\s+(?:is\s+)?(?:on\s+hold|pending)\b',
            r'\bprofile\s+details\s+need\s+review\b'
        ]
        is_ambiguous_text = any(re.search(pat, lowered) for pat in ambiguous_regexes)

        # Check for legitimate security disclaimers (e.g. "Do not share OTP", "Bank never asks for OTP/PIN")
        has_legit_otp_disclaimer = False
        for rule in self.rules:
            if rule.get("id") == "credential_request":
                for disc_pat in rule.get("disclaimer_patterns", []):
                    if re.search(disc_pat, lowered):
                        has_legit_otp_disclaimer = True
                        break

        for rule in self.rules:
            rule_id = rule.get("id")
            points = rule.get("points", 0)
            warning_text = rule.get("warning_template", "")
            rule_type = rule.get("type", "general")
            patterns = rule.get("patterns", [])

            rule_matched = False
            for pat in patterns:
                matches = list(re.finditer(pat, lowered))
                if matches:
                    # Filter out benign negative disclaimers like "Never share OTP/PIN"
                    if rule_id == "credential_request":
                        valid_phishing_matches = []
                        for m in matches:
                            start_idx = max(0, m.start() - 30)
                            prefix_context = lowered[start_idx:m.start()]
                            is_negative = any(neg in prefix_context for neg in ["never ", "don't ", "do not ", "not to ", "caution "])
                            if not (is_negative or has_legit_otp_disclaimer):
                                valid_phishing_matches.append(m)

                        if not valid_phishing_matches:
                            continue

                        matches = valid_phishing_matches

                    rule_matched = True
                    for m in matches:
                        start, end = m.span()
                        phrase = cleaned[start:end]
                        if phrase and phrase not in matched_phrases:
                            matched_phrases.append(phrase)

            if rule_matched:
                total_score += points
                warnings.append({
                    "type": rule_type,
                    "text": warning_text
                })

                if rule_id == "credential_request":
                    signals["has_otp_request"] = True
                elif rule_id == "urgency_threat":
                    signals["has_urgency"] = True
                elif rule_id == "remote_app_apk":
                    signals["has_remote_app"] = True
                elif rule_id == "kyc_reward_bait":
                    signals["has_kyc_bait"] = True
                elif rule_id == "generic_bait_phone":
                    signals["has_unverified_contact"] = True

        score = min(100, total_score)

        # Message is ambiguous if:
        # - Has vague text without explicit threat triggers, OR
        # - Lacks verifiable banking proof and has zero threat triggers
        has_any_threat = any(signals.values()) or len(warnings) > 0
        is_ambiguous = (is_ambiguous_text and not has_any_threat) or (not has_genuine_banking_signals and not has_any_threat)


        return {
            "score": score,
            "warnings": warnings,
            "matched_phrases": matched_phrases,
            "signals": signals,
            "has_genuine_banking_signals": has_genuine_banking_signals,
            "is_ambiguous": is_ambiguous
        }


# Global singleton
rule_engine = RuleEngine()
