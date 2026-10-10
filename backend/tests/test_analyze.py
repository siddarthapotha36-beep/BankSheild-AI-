import json
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.rule_engine import rule_engine
from app.services.url_analyzer import url_analyzer
from app.services.scorer import scorer

client = TestClient(app)

DATA_PATH = Path(__file__).parent.parent / "app" / "data" / "sample_messages.json"

@pytest.fixture
def sample_messages():
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_empty_message_validation():
    response = client.post("/analyze", json={"message": "   "})
    assert response.status_code == 400

def test_genuine_messages_scoring(sample_messages):
    """All 10 genuine bank communications must fall strictly in the 'Likely Safe' band (score <= 30)."""
    genuine = [m for m in sample_messages if m["category"] == "genuine"]
    assert len(genuine) == 10

    for msg in genuine:
        response = client.post("/analyze", json={"message": msg["message"]})
        assert response.status_code == 200, f"Failed on message: {msg['label']}"
        data = response.json()
        assert data["risk_score"] <= 30, f"Expected safe (<=30) for '{msg['label']}', got {data['risk_score']}"
        assert data["verdict"] == "Likely Safe", f"Expected 'Likely Safe' for '{msg['label']}', got {data['verdict']}"
        assert data["scam_type"] == "Genuine Banking Notification"

def test_scam_messages_scoring(sample_messages):
    """All 10 scam messages must be flagged as Suspicious or Dangerous (score > 30)."""
    scams = [m for m in sample_messages if m["category"] == "scam"]
    assert len(scams) == 10

    for msg in scams:
        response = client.post("/analyze", json={"message": msg["message"]})
        assert response.status_code == 200, f"Failed on scam: {msg['label']}"
        data = response.json()
        assert data["risk_score"] > 30, f"Expected risk > 30 for '{msg['label']}', got {data['risk_score']}"
        assert data["verdict"] in ["Suspicious", "Dangerous"], f"Expected Suspicious/Dangerous for '{msg['label']}', got {data['verdict']}"
        assert len(data["warnings"]) > 0, f"Expected warnings for '{msg['label']}'"
        assert len(data["highlights"]) > 0, f"Expected text highlights for '{msg['label']}'"

def test_otp_override_enforces_minimum_70():
    """Any message requesting OTP must enforce risk score >= 70 and Dangerous verdict."""
    msg = "Dear customer, your bank card is suspended. Please share your OTP with manager to reactivate."
    response = client.post("/analyze", json={"message": msg})
    assert response.status_code == 200
    data = response.json()
    assert data["risk_score"] >= 70
    assert data["verdict"] == "Dangerous"
    assert "OTP" in data["scam_type"] or "Credential" in data["scam_type"]

def test_lookalike_domain_override_enforces_minimum_70():
    """Any message with a spoofed/lookalike domain must enforce risk score >= 70 and Dangerous verdict."""
    msg = "Update KYC now at http://sbi-yono-kyc.xyz or services will stop."
    response = client.post("/analyze", json={"message": msg})
    assert response.status_code == 200
    data = response.json()
    assert data["risk_score"] >= 70
    assert data["verdict"] == "Dangerous"

def test_url_analyzer_whitelist_and_heuristics():
    # Authentic domain
    safe_res = url_analyzer.analyze("Visit https://www.onlinesbi.sbi/login")
    assert safe_res["score"] == 0
    assert not safe_res["is_lookalike"]

    # Shortener link
    short_res = url_analyzer.analyze("Check http://bit.ly/claim-prize")
    assert short_res["score"] >= 25
    assert any(w["type"] == "url_shortener" for w in short_res["warnings"])

    # IP address host
    ip_res = url_analyzer.analyze("Verify at http://192.168.1.5/bank")
    assert ip_res["score"] >= 40
    assert any(w["type"] == "ip_host" for w in ip_res["warnings"])

def test_rule_engine_genuine_disclaimer_no_false_positive():
    """Legitimate alert with 'Do not share OTP' disclaimer should NOT trigger OTP credential warning."""
    legit_msg = "Your OTP is 492011. Do NOT share OTP with anyone including bank staff."
    res = rule_engine.analyze(legit_msg)
    assert not res["signals"]["has_otp_request"]
    assert res["score"] == 0

def test_sender_and_location_analysis():
    # Test authentic TRAI DLT header
    payload_dlt = {
        "message": "Salary credited to A/C XX9876.",
        "sender": "VK-HDFCBK"
    }
    res_dlt = client.post("/analyze", json=payload_dlt).json()
    assert res_dlt["sender_details"]["is_authentic_header"] is True
    assert "HDFC" in res_dlt["sender_details"]["flag"]
    assert "Vodafone" in res_dlt["sender_details"]["telecom_operator"]
    assert res_dlt["location_details"]["telecom_circle"] == "Kolkata"

    # Test personal mobile number sending bank scam
    payload_mobile = {
        "message": "Dear customer account blocked kindly update PAN card.",
        "sender": "+91 9823456789"
    }
    res_mobile = client.post("/analyze", json=payload_mobile).json()
    assert res_mobile["sender_details"]["is_authentic_header"] is False
    assert any(w["type"] == "sender_spoof" for w in res_mobile["warnings"])
    assert res_mobile["risk_score"] >= 50

def test_ambiguous_messages_scoring(sample_messages):
    """Ambiguous messages lacking sufficient verifiable banking signals must return CANNOT VERIFY."""
    ambiguous = [m for m in sample_messages if m.get("category") == "ambiguous"]
    assert len(ambiguous) >= 3

    for msg in ambiguous:
        response = client.post("/analyze", json={"message": msg["message"]})
        assert response.status_code == 200, f"Failed on ambiguous message: {msg['label']}"
        data = response.json()
        assert data["verdict"] == "CANNOT VERIFY", f"Expected CANNOT VERIFY for '{msg['label']}', got {data['verdict']}"
        assert data["scam_type"] == "Ambiguous / Insufficient Evidence"
        assert any(w["type"] == "insufficient_evidence" for w in data["warnings"])
        assert len(data["advice"]) > 0

def test_directory_endpoints():
    """Verify banks and police stations directories return populated datasets."""
    res_banks = client.get("/banks")
    assert res_banks.status_code == 200
    banks = res_banks.json()
    assert len(banks) >= 5
    assert any("Union Bank" in b["name"] for b in banks)
    assert any("State Bank of India" in b["name"] for b in banks)

    res_police = client.get("/police-stations")
    assert res_police.status_code == 200
    police = res_police.json()
    assert "national_helplines" in police
    assert police["national_helplines"]["cyber_fraud_helpline"] == "1930"
    assert "city_stations" in police
    assert "mumbai" in police["city_stations"]

    res_samples = client.get("/sample-messages")
    assert res_samples.status_code == 200
    samples = res_samples.json()
    assert len(samples) >= 20

