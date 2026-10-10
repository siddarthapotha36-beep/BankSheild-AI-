import json
import re
from pathlib import Path
from urllib.parse import urlparse
from typing import Dict, Any, List
from app.utils.text_cleaner import extract_urls

DATA_FILE = Path(__file__).parent.parent / "data" / "bank_domains.json"

def levenshtein_distance(s1: str, s2: str) -> int:
    """Calculate the Levenshtein edit distance between two strings."""
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)
    if len(s2) == 0:
        return len(s1)

    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row

    return previous_row[-1]

class URLAnalyzer:
    def __init__(self, data_path: Path = DATA_FILE):
        self.verified_bank_domains = set()
        self.bank_keywords = []
        self.shortener_domains = set()
        self.suspicious_tlds = []

        if data_path.exists():
            with open(data_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                self.verified_bank_domains = set(data.get("verified_bank_domains", []))
                self.bank_keywords = data.get("bank_keywords", [])
                self.shortener_domains = set(data.get("shortener_domains", []))
                self.suspicious_tlds = data.get("suspicious_tlds", [])

    def is_verified_domain(self, hostname: str) -> bool:
        """Check if hostname belongs to an authentic whitelisted bank."""
        hostname = hostname.lower()
        if hostname in self.verified_bank_domains:
            return True
        for vd in self.verified_bank_domains:
            if hostname.endswith("." + vd):
                return True
        return False

    def check_lookalike(self, hostname: str) -> bool:
        """Check if hostname appears to impersonate a legitimate bank."""
        lowered = hostname.lower()
        # If it's already authentic, it's not a lookalike
        if self.is_verified_domain(lowered):
            return False

        # Extract domain labels
        labels = lowered.split(".")
        main_part = labels[0] if len(labels) > 0 else lowered

        # 1. Contains a bank keyword directly in host/subdomain (e.g., sbi-kyc, yono-update, icicibank-login)
        for kw in self.bank_keywords:
            if kw in lowered:
                return True

        # 2. Levenshtein fuzzy distance against primary bank names
        for kw in self.bank_keywords:
            if len(kw) >= 4 and len(main_part) >= 4:
                dist = levenshtein_distance(main_part, kw)
                if dist in [1, 2]:
                    return True
            for vd in self.verified_bank_domains:
                vd_main = vd.split(".")[0]
                dist = levenshtein_distance(main_part, vd_main)
                if dist in [1, 2]:
                    return True

        return False

    def analyze(self, message: str) -> Dict[str, Any]:
        """
        Analyze all URLs in a message.
        Returns:
            - score (0-100)
            - warnings: List[Dict[str, str]]
            - extracted_urls: List[str]
            - is_lookalike: bool
            - has_urls: bool
        """
        urls = extract_urls(message)
        if not urls:
            return {
                "score": 0,
                "warnings": [],
                "extracted_urls": [],
                "is_lookalike": False,
                "has_urls": False,
                "has_verified_url": False
            }

        total_score = 0
        warnings: List[Dict[str, str]] = []
        is_lookalike = False
        has_verified_url = False

        for raw_url in urls:
            url_to_parse = raw_url if raw_url.startswith(("http://", "https://")) else "http://" + raw_url
            parsed = urlparse(url_to_parse)
            hostname = parsed.hostname or parsed.netloc or raw_url
            hostname = hostname.lower()

            # Check 1: Insecure HTTP
            if raw_url.startswith("http://"):
                total_score += 20
                warnings.append({
                    "type": "insecure_http",
                    "text": f"Insecure link ({raw_url}): Official bank portals mandate encrypted HTTPS."
                })

            # Check 2: '@' symbol in URL
            if "@" in raw_url:
                total_score += 25
                warnings.append({
                    "type": "malformed_url",
                    "text": f"URL contains '@' symbol: Often used to obscure true destination host."
                })

            # Check 3: IP-based host
            if re.match(r'^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$', hostname):
                total_score += 40
                warnings.append({
                    "type": "ip_host",
                    "text": f"Numeric IP host detected ({hostname}): Legitimate banks never use raw IP links."
                })

            # Check 4: URL shortener
            if hostname in self.shortener_domains or any(hostname.endswith("." + s) for s in self.shortener_domains):
                total_score += 25
                warnings.append({
                    "type": "url_shortener",
                    "text": f"URL shortener detected ({hostname}): Obscures the actual destination webpage."
                })

            # Check 5: Suspicious TLD
            for tld in self.suspicious_tlds:
                if hostname.endswith(tld):
                    total_score += 25
                    warnings.append({
                        "type": "suspicious_tld",
                        "text": f"High-risk domain extension '{tld}' detected ({hostname}), commonly used in phishing campaigns."
                    })
                    break

            # Check 6: Excessive hyphens in hostname (e.g. sbi-yono-kyc-portal.com)
            if hostname.count("-") >= 2:
                total_score += 15
                warnings.append({
                    "type": "excessive_hyphens",
                    "text": f"Domain '{hostname}' contains multiple hyphens, typically used to spoof brand names."
                })

            # Check 7: Too many subdomains
            domain_parts = hostname.split(".")
            if len(domain_parts) > 3:
                total_score += 15
                warnings.append({
                    "type": "excessive_subdomains",
                    "text": f"Excessive subdomains in '{hostname}' masking true domain ownership."
                })

            # Check 8: Bank lookalike / spoofing
            if not self.is_verified_domain(hostname):
                if self.check_lookalike(hostname):
                    is_lookalike = True
                    total_score += 50
                    warnings.append({
                        "type": "lookalike_domain",
                        "text": f"Unverified bank lookalike domain '{hostname}': Impersonates official financial institution."
                    })
            else:
                has_verified_url = True

        score = min(100, total_score)

        return {
            "score": score,
            "warnings": warnings,
            "extracted_urls": urls,
            "is_lookalike": is_lookalike,
            "has_urls": True,
            "has_verified_url": has_verified_url
        }

# Global singleton
url_analyzer = URLAnalyzer()
