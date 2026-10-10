from fastapi import APIRouter, HTTPException
from app.models.schemas import AnalyzeRequest, AnalyzeResponse, WarningItem
from app.services.rule_engine import rule_engine
from app.services.url_analyzer import url_analyzer
from app.services.llm_classifier import llm_classifier
from app.services.scorer import scorer
from app.services.explainer import explainer
from app.services.sender_analyzer import sender_analyzer

router = APIRouter()

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_message(payload: AnalyzeRequest):
    """
    Analyze incoming SMS or WhatsApp bank message for fraudulent indicators.
    Executes:
      1. Rule engine (keyword/pattern matching)
      2. URL analyzer (Levenshtein lookalike detection, heuristics)
      3. LLM classifier (JSON prompt with safe fallback)
      4. Sender & Geolocation analyzer (TRAI DLT header, circle, personal mobile spoofing)
      5. Scorer (weighted score, critical overrides)
      6. Explainer (deduplication, substring highlights, advice)
    """
    raw_message = payload.message.strip()
    if not raw_message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # Layer 1: Rule Engine
    rule_result = rule_engine.analyze(raw_message)

    # Layer 2: URL Analyzer
    url_result = url_analyzer.analyze(raw_message)

    # Layer 3: LLM Classifier (with resilient 5s fallback)
    llm_result = llm_classifier.analyze(raw_message)

    # Layer 4: Sender & Geolocation Intelligence
    sender_details, location_details, sender_risk, sender_warning = sender_analyzer.analyze(
        sender_input=payload.sender,
        message=raw_message,
        extracted_urls=url_result["extracted_urls"],
        is_lookalike=url_result["is_lookalike"]
    )

    # Combine warnings including sender spoofing if detected
    all_rule_warnings = list(rule_result["warnings"])
    if sender_warning:
        all_rule_warnings.append(sender_warning)

    # Effective rule score considering sender fraud adjustment
    adjusted_rule_score = min(100, rule_result["score"] + sender_risk)

    # Layer 5: Scorer
    risk_score, verdict = scorer.calculate_score(
        rule_score=adjusted_rule_score,
        url_score=url_result["score"],
        llm_score=llm_result["score"],
        has_urls=url_result["has_urls"],
        has_otp_request=rule_result["signals"]["has_otp_request"],
        is_lookalike=url_result["is_lookalike"],
        has_genuine_banking_signals=rule_result.get("has_genuine_banking_signals", False),
        is_authentic_header=sender_details.is_authentic_header,
        has_verified_url=url_result.get("has_verified_url", False),
        is_ambiguous=rule_result.get("is_ambiguous", False),
        sender_risk=sender_risk
    )

    # Layer 6: Explainer
    explanation = explainer.explain(
        message=raw_message,
        verdict=verdict,
        rule_warnings=all_rule_warnings,
        url_warnings=url_result["warnings"],
        rule_phrases=rule_result["matched_phrases"],
        extracted_urls=url_result["extracted_urls"],
        signals=rule_result["signals"],
        is_lookalike=url_result["is_lookalike"],
        llm_scam_type=llm_result.get("scam_type"),
        llm_reasoning=llm_result.get("reasoning")
    )

    # Add sender advice if personal number spoofed bank
    if sender_warning and "NEVER share OTP" not in explanation["advice"]:
        explanation["advice"].insert(0, "Beware: Official banks will never contact you regarding urgent banking matters from personal 10-digit mobile numbers.")

    return AnalyzeResponse(
        risk_score=risk_score,
        verdict=verdict,
        scam_type=explanation["scam_type"],
        warnings=explanation["warnings"],
        highlights=explanation["highlights"],
        advice=explanation["advice"],
        sender_details=sender_details,
        location_details=location_details
    )

@router.get("/banks")
async def get_banks():
    """Return verified Indian banks directory with contact numbers, fraud reporting, and URLs."""
    import json
    from pathlib import Path
    data_file = Path(__file__).parent.parent / "data" / "banks_directory.json"
    if data_file.exists():
        with open(data_file, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

@router.get("/police-stations")
async def get_police_stations():
    """Return cyber crime police stations, national helplines, and filing instructions."""
    import json
    from pathlib import Path
    data_file = Path(__file__).parent.parent / "data" / "police_directory.json"
    if data_file.exists():
        with open(data_file, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

@router.get("/sample-messages")
async def get_sample_messages():
    """Return categorized sample messages (genuine, scam, ambiguous) for testing."""
    import json
    from pathlib import Path
    data_file = Path(__file__).parent.parent / "data" / "sample_messages.json"
    if data_file.exists():
        with open(data_file, "r", encoding="utf-8") as f:
            return json.load(f)
    return []

