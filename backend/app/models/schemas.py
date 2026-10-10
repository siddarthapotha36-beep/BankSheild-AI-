from typing import List, Literal, Optional
from pydantic import BaseModel, Field

class AnalyzeRequest(BaseModel):
    message: str = Field(..., min_length=1, description="Raw SMS or WhatsApp message text to analyze")
    sender: Optional[str] = Field(default=None, description="Sender ID, phone number, or SMS header (e.g. VK-HDFCBK or +91 9876543210)")

class WarningItem(BaseModel):
    type: str = Field(..., description="Category of warning: e.g. urgent, credential, lookalike_url, remote_app, generic_bait, sender_spoof")
    text: str = Field(..., description="Plain-language description of warning sign")

class SenderAnalysis(BaseModel):
    raw_sender: Optional[str] = Field(default=None, description="Raw sender identifier provided")
    sender_type: str = Field(default="Unknown", description="Classification: DLT Registered Header, Personal Mobile Number, etc.")
    is_authentic_header: bool = Field(default=False, description="True if conforms to official TRAI DLT header format for banks")
    telecom_operator: Optional[str] = Field(default=None, description="Identified carrier (e.g. Airtel, Jio, Vodafone-Idea, BSNL)")
    telecom_circle: Optional[str] = Field(default=None, description="Telecom service area circle (e.g. Mumbai, Delhi, Gujarat)")
    flag: Optional[str] = Field(default=None, description="Security assessment on sender identifier")

class LocationAnalysis(BaseModel):
    origin_region: str = Field(default="India (General)", description="Inferred telecom circle or server geographical origin")
    telecom_circle: Optional[str] = Field(default=None, description="Sender telecom service area")
    ip_origin: Optional[str] = Field(default=None, description="Geographical location of IP or web host if links are present")
    receiver_region: Optional[str] = Field(default="India (Domestic Handset)", description="Receiver location / telecom termination circle")
    receiver_telecom: Optional[str] = Field(default="National Telecom Route", description="Receiver cellular carrier network")
    cyber_crime_helpline: Optional[str] = Field(default="1930", description="National Cyber Crime Helpline Number")
    helpline_hours: Optional[str] = Field(default="24/7 Round the Clock (Instant Golden Hour Freeze)", description="Operating hours of cyber helpline")
    discrepancy_detected: bool = Field(default=False, description="Whether sender claimed origin mismatches actual route or server host")
    discrepancy_reason: Optional[str] = Field(default=None, description="Explanation of origin discrepancy")

class AnalyzeResponse(BaseModel):
    risk_score: int = Field(..., ge=0, le=100, description="Fraud risk score from 0 to 100")
    verdict: Literal["Likely Safe", "Suspicious", "Dangerous", "CANNOT VERIFY"] = Field(..., description="Risk category verdict")
    scam_type: str = Field(..., description="Identified scam type or 'Genuine Communication' if safe")
    warnings: List[WarningItem] = Field(default_factory=list, description="List of detected warning signals")
    highlights: List[str] = Field(default_factory=list, description="Exact substrings from the message to visually highlight")
    advice: List[str] = Field(default_factory=list, description="Actionable safety guidance for the user")
    sender_details: Optional[SenderAnalysis] = Field(default=None, description="Analysis of the message sender")
    location_details: Optional[LocationAnalysis] = Field(default=None, description="Geographical and telecom location intelligence")

