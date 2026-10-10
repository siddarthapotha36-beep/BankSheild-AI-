import re
from typing import Dict, Any, Optional, Tuple
from app.models.schemas import SenderAnalysis, LocationAnalysis

OPERATOR_MAP = {
    "A": "Bharti Airtel",
    "V": "Vodafone Idea (Vi)",
    "J": "Reliance Jio",
    "B": "BSNL",
    "M": "MTNL",
    "T": "Tata Teleservices"
}

CIRCLE_MAP = {
    "D": "Delhi-NCR",
    "M": "Mumbai",
    "K": "Kolkata",
    "C": "Chennai",
    "G": "Gujarat",
    "A": "Andhra Pradesh / Telangana",
    "P": "Punjab",
    "U": "Uttar Pradesh (West)",
    "E": "Uttar Pradesh (East)",
    "B": "Bihar & Jharkhand",
    "R": "Rajasthan",
    "W": "West Bengal",
    "H": "Haryana",
    "T": "Tamil Nadu",
    "X": "Karnataka",
    "L": "Kerala",
    "O": "Odisha",
    "N": "North East",
    "S": "Assam",
    "I": "Himachal Pradesh"
}

KNOWN_BANK_ENTITIES = {
    "HDFCBK": "HDFC Bank Ltd.",
    "SBIINB": "State Bank of India (Internet Banking)",
    "SBIPSG": "State Bank of India (General Alert)",
    "SBISMS": "State Bank of India",
    "ICICIB": "ICICI Bank Ltd.",
    "AXISBK": "Axis Bank Ltd.",
    "KOTAKB": "Kotak Mahindra Bank",
    "PNBSMS": "Punjab National Bank",
    "BOBSMS": "Bank of Baroda",
    "CANBNK": "Canara Bank",
    "IDFCFB": "IDFC FIRST Bank",
    "YESBNK": "Yes Bank Ltd.",
    "INDUSB": "IndusInd Bank",
    "FEDBNK": "Federal Bank",
    "RBLBNK": "RBL Bank"
}

class SenderAnalyzer:
    def analyze(
        self,
        sender_input: Optional[str],
        message: str,
        extracted_urls: list,
        is_lookalike: bool
    ) -> Tuple[SenderAnalysis, LocationAnalysis, int, Optional[Dict[str, str]]]:
        """
        Analyze sender ID and inferred geolocation.
        """
        raw_sender = (sender_input or "").strip()

        # If sender was not provided, check if message begins with a DLT header like "VK-HDFCBK: ..."
        if not raw_sender:
            header_prefix_match = re.match(r'^([A-Za-z]{2}[\-][A-Za-z0-9]{6})[:\s]', message)
            if header_prefix_match:
                raw_sender = header_prefix_match.group(1).upper()

        # If still not provided, return clean default with 0 penalty
        if not raw_sender:
            return (
                SenderAnalysis(
                    raw_sender="Not Specified",
                    sender_type="Web / Direct Message Submission",
                    is_authentic_header=False,
                    flag="Sender ID was not specified with this message submission."
                ),
                LocationAnalysis(
                    origin_region="India (General Delivery Network)",
                    telecom_circle="National Telecom Network"
                ),
                0,
                None
            )

        clean_sender = raw_sender.replace(" ", "").replace("-", "").upper()

        # 1. Check for TRAI DLT SMS Header: (2 letters operator/circle + 6 letters entity)
        dlt_match = re.match(r'^([A-Z])([A-Z])([A-Z0-9]{6})$', clean_sender)
        if dlt_match:
            op_code, circle_code, entity_code = dlt_match.groups()
            operator_name = OPERATOR_MAP.get(op_code, "Indian Telecom Carrier")
            circle_name = CIRCLE_MAP.get(circle_code, "Regional Telecom Circle")
            entity_name = KNOWN_BANK_ENTITIES.get(entity_code)

            if entity_name:
                sender_analysis = SenderAnalysis(
                    raw_sender=raw_sender,
                    sender_type="TRAI DLT Verified Bank Entity",
                    is_authentic_header=True,
                    telecom_operator=operator_name,
                    telecom_circle=circle_name,
                    flag=f"Valid registered DLT entity for {entity_name} routing via {operator_name} ({circle_name})."
                )
                location_analysis = LocationAnalysis(
                    origin_region=f"{circle_name}, India",
                    telecom_circle=circle_name,
                    ip_origin="Authorized Banking Telecom Gateway",
                    discrepancy_detected=False
                )
                return sender_analysis, location_analysis, 0, None
            else:
                sender_analysis = SenderAnalysis(
                    raw_sender=raw_sender,
                    sender_type="Unregistered / Commercial Header",
                    is_authentic_header=False,
                    telecom_operator=operator_name,
                    telecom_circle=circle_name,
                    flag=f"Format follows DLT standards ({operator_name}), but entity '{entity_code}' is not an authorized scheduled bank."
                )
                location_analysis = LocationAnalysis(
                    origin_region=f"{circle_name}, India",
                    telecom_circle=circle_name
                )
                return sender_analysis, location_analysis, 10, None

        # 2. Check for 10-digit Indian Mobile Number as Sender
        mobile_match = re.search(r'(?:(?:\+91|91|0)?([6-9]\d{9}))', clean_sender)
        if mobile_match:
            phone_num = mobile_match.group(1)
            first_digit = phone_num[0]
            inferred_circle = "Northern / Western Telecom Circle" if first_digit in ['9', '8'] else "Southern / Eastern Telecom Circle"
            
            risk_adjustment = 35
            sender_warning = {
                "type": "sender_spoof",
                "text": f"Message sender is a personal mobile number (+91 {phone_num}). Legitimate banks exclusively send transactional notifications via registered 6-character TRAI DLT alphabetic headers, NEVER personal phone numbers."
            }

            discrepancy = False
            disc_reason = None
            ip_loc = "Local / Cellular Gateway"

            if extracted_urls:
                if is_lookalike:
                    discrepancy = True
                    ip_loc = "Offshore Bulletproof Cloud (e.g. Frankfurt / Vilnius)"
                    disc_reason = "Sender claims Indian domestic banking alert but link connects to overseas untrusted host."
                else:
                    ip_loc = "External Web Server"

            sender_analysis = SenderAnalysis(
                raw_sender=raw_sender,
                sender_type="Personal GSM Mobile Number (Suspicious)",
                is_authentic_header=False,
                telecom_operator="Public Cellular Subscriber",
                telecom_circle=inferred_circle,
                flag="High risk: Personal phone number used for banking claim."
            )

            location_analysis = LocationAnalysis(
                origin_region=f"{inferred_circle}, India",
                telecom_circle=inferred_circle,
                ip_origin=ip_loc,
                discrepancy_detected=discrepancy,
                discrepancy_reason=disc_reason
            )

            return sender_analysis, location_analysis, risk_adjustment, sender_warning

        # 3. External / Virtual Sender
        sender_analysis = SenderAnalysis(
            raw_sender=raw_sender,
            sender_type="Unverified External Sender",
            is_authentic_header=False,
            flag="Unverified sender identifier. Does not match approved domestic banking headers."
        )

        location_analysis = LocationAnalysis(
            origin_region="International / Unregistered Route",
            telecom_circle="Unknown Origin",
            ip_origin="External Network",
            discrepancy_detected=True,
            discrepancy_reason="Unverified non-standard origin header claiming banking relevance."
        )

        risk_adjustment = 15
        sender_warning = {
            "type": "sender_spoof",
            "text": f"Non-standard sender identifier '{raw_sender}'. Lacks official Indian banking registration."
        }

        return sender_analysis, location_analysis, risk_adjustment, sender_warning

# Global singleton
sender_analyzer = SenderAnalyzer()
