# BankShield AI 🛡️

**Intelligent Real-Time Bank Fraud & Phishing Detection for SMS & WhatsApp**

BankShield AI is a full-stack cybersecurity application built for hackathons that empowers users to detect banking scams, lookalike phishing links, spoofed sender headers, and OTP theft attempts before clicking or sharing sensitive credentials.

---

## 🎯 The Problem
Every day, thousands of bank customers fall victim to deceptive SMS and WhatsApp messages claiming:
- *"Your account is blocked! Click here to update KYC within 24 hours."*
- *"Dear customer, call our manager and share the OTP to unblock your debit card."*
- *"Power will be disconnected tonight. Install support app from this link."*

Because modern scams mimic authentic bank notifications, spoof sender names, and utilize deceptive lookalike domains (e.g. `sbi-yono-kyc.xyz`), ordinary users cannot reliably tell genuine alerts from malicious fraud.

## 💡 The Solution
BankShield AI provides instantaneous, in-depth fraud intelligence for any pasted message:
1. **0–100 Fraud Risk Score** with an animated semicircle visual meter.
2. **Clear Verdict Band**:
   - `0 - 30`: **Likely Safe** (Green)
   - `31 - 65`: **Suspicious** (Amber)
   - `66 - 100`: **Dangerous** (Red)
3. **TRAI DLT Sender Verification**: Analyzes official telecom DLT alphanumeric headers (e.g. `VK-HDFCBK`, `AD-SBIINB`) vs unverified personal mobile numbers (`+91 9xxxx`).
4. **Telecom Circle & Geolocation Intelligence**: Identifies sender telecom circle, carrier, and detects **origin discrepancies** (e.g. domestic bank claim hosted on bulletproof overseas cloud).
5. **Exact Substring Highlighting**: Malicious phrases and deceptive links are highlighted directly inside the message text.
6. **Plain-Language Explanations & Actionable Advice**: Including immediate reporting guidance (Cyber Crime Helpline: **1930** / [cybercrime.gov.in](https://cybercrime.gov.in)).
7. **User Profile & Session System**: Sign in or choose from 3 instant demo personas (Personal Banking Customer, Senior Fraud Risk Investigator, Cyber Crime Nodal Officer).
8. **Local Scan History**: Preserves previous analyses locally on the user's device for easy reload.
9. **Zero Data Storage Guarantee**: Messages are evaluated purely in-memory; no messages or user data are ever stored or persisted on any remote server.

---

## 🏗️ Multi-Layer Detection Architecture

```
                 [ Incoming Message & Sender Header ]
                                   │
      ┌────────────────────────────┼───────────────────────────┐
      ▼                            ▼                           ▼
[ Layer 1: Rule Engine ]  [ Layer 2: URL Analyzer ]  [ Layer 3: Sender & Geo ]
• OTP/PIN/CVV (+30)       • Whitelist vs Lookalike   • TRAI DLT header check
• Urgency threats (+20)   • Levenshtein fuzzy match  • Carrier & Circle map
• KYC / Prize bait (+15)  • URL shorteners (+25)     • Personal mobile spoof
• AnyDesk / APK (+25)     • Insecure HTTP (+20)      • Host route discrepancy
• Unverified phone (+15)  • IP host & high-risk TLDs
      │                            │                           │
      └────────────────────────────┼───────────────────────────┘
                                   ▼
                   [ Hybrid Scorer & Explainer ]
                   • Formula: 0.35*Rules + 0.35*URL + 0.30*LLM
                   • Critical Override: OTP OR Lookalike Domain => Min Score 70
                   • Deduplication, text highlight mapping & safety guidance
```

---

## 🚀 Quickstart Guide

### Prerequisites
- Python 3.11+
- Node.js 18+ and npm

### 1. Start the Backend API
```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- Backend will be live at: `http://127.0.0.1:8000`
- Interactive API Docs: `http://127.0.0.1:8000/docs`
- Health check: `http://127.0.0.1:8000/health`

### 2. Start the Frontend
```bash
cd frontend
npm run dev
```
- Open your browser at: `http://localhost:5173`

---

## 🧪 Running Pytest Tests
```bash
pytest backend/tests -v
```
All 9 test suites validate authentic bank alerts, phishing scams, lookalike domain overrides, OTP overrides, and sender DLT header verification.

---

## 🔒 Privacy & Compliance
- **Zero Remote Storage**: User messages are evaluated ephemerally in volatile memory. No database is connected, and messages are discarded immediately following analysis.
- **Client Resilience**: Rule and URL analysis engines operate completely offline with zero third-party dependencies, guaranteeing 100% demo availability.
