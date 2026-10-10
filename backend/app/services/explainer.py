from typing import List, Dict, Any, Optional
from app.models.schemas import WarningItem

class Explainer:
    def explain(
        self,
        message: str,
        verdict: str,
        rule_warnings: List[Dict[str, str]],
        url_warnings: List[Dict[str, str]],
        rule_phrases: List[str],
        extracted_urls: List[str],
        signals: Dict[str, bool],
        is_lookalike: bool,
        llm_scam_type: Optional[str] = None,
        llm_reasoning: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Merge reasons from all detection layers, deduplicate, extract highlight substrings,
        and generate tailored safety advice and scam classification.
        """
        # 1. Merge and deduplicate warnings
        combined_warnings: List[WarningItem] = []
        seen_texts = set()

        for w in rule_warnings:
            text = w.get("text", "")
            if text and text not in seen_texts:
                seen_texts.add(text)
                combined_warnings.append(WarningItem(type=w.get("type", "warning"), text=text))

        for w in url_warnings:
            text = w.get("text", "")
            if text and text not in seen_texts:
                seen_texts.add(text)
                combined_warnings.append(WarningItem(type=w.get("type", "url"), text=text))

        if llm_reasoning:
            for reason in llm_reasoning:
                if reason and reason not in seen_texts:
                    seen_texts.add(reason)
                    combined_warnings.append(WarningItem(type="llm_insight", text=reason))

        # 2. Extract substrings to highlight in the message
        highlights: List[str] = []
        seen_hl = set()

        # Phrases matched by rules
        for p in rule_phrases:
            p_strip = p.strip()
            if p_strip and p_strip not in seen_hl:
                seen_hl.add(p_strip)
                highlights.append(p_strip)

        # Suspicious URLs extracted
        if url_warnings:
            for u in extracted_urls:
                u_strip = u.strip()
                if u_strip and u_strip not in seen_hl:
                    seen_hl.add(u_strip)
                    highlights.append(u_strip)

        # 3. Determine scam type
        if verdict == "Likely Safe":
            scam_type = "Genuine Banking Notification"
        elif verdict == "CANNOT VERIFY":
            scam_type = "Ambiguous / Insufficient Evidence"
            # Add explicit warning explaining why authenticity cannot be verified
            if not any(w.type == "insufficient_evidence" for w in combined_warnings):
                combined_warnings.insert(0, WarningItem(
                    type="insufficient_evidence",
                    text="Insufficient Evidence: Message lacks verifiable banking markers (such as masked account number, official UTR/Ref ID, or verified TRAI DLT sender). Authenticity cannot be confirmed."
                ))
        elif llm_scam_type and verdict in ["Suspicious", "Dangerous"]:
            scam_type = llm_scam_type
        elif signals.get("has_otp_request"):
            scam_type = "Credential / OTP Phishing"
        elif is_lookalike:
            scam_type = "Lookalike Bank Impersonation"
        elif signals.get("has_remote_app"):
            scam_type = "Remote Access Trojan Scam"
        elif signals.get("has_kyc_bait"):
            scam_type = "KYC / Reward Bait Fraud"
        elif signals.get("has_urgency"):
            scam_type = "Social Engineering / Panic Bait"
        else:
            scam_type = "Unverified Financial Alert"

        # 4. Compile tailored safety advice
        advice: List[str] = []

        if verdict == "Likely Safe":
            advice.append("This communication matches legitimate bank transaction patterns.")
            advice.append("Always monitor your bank statements and verify unexpected debits via your bank's official app.")
        elif verdict == "CANNOT VERIFY":
            advice.append("Exercise extreme caution: Message does not contain verifiable bank authorization markers.")
            advice.append("NEVER share OTP, PIN, or net banking credentials in response to unverified or ambiguous texts.")
            advice.append("Do NOT call phone numbers or click links contained within this message.")
            advice.append("Verify your real account status directly through your bank's official mobile app or website.")
            advice.append("In case of suspected financial loss, call the National Cyber Crime Helpline at 1930 immediately.")
        else:
            if signals.get("has_otp_request"):
                advice.append("NEVER share OTP, MPIN, or CVV. Real bank officials will NEVER ask you to read out or forward an OTP.")

            if is_lookalike or url_warnings:
                advice.append("Do NOT tap on links received in SMS or WhatsApp. Always access net banking by typing the bank's official URL yourself.")

            if signals.get("has_remote_app"):
                advice.append("NEVER download AnyDesk, TeamViewer, or third-party APK files on instruction. They give fraudsters full control over your phone.")

            if signals.get("has_urgency"):
                advice.append("Banks do not block accounts instantly via SMS. Call the official customer helpline on the back of your debit card to verify.")

            # General cyber safety advice for fraud
            advice.append("If money has been deducted, immediately call the National Cyber Crime Helpline at 1930 or file a report at cybercrime.gov.in.")

        return {
            "scam_type": scam_type,
            "warnings": combined_warnings,
            "highlights": highlights,
            "advice": advice
        }

# Global singleton
explainer = Explainer()
