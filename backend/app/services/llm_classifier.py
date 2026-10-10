import os
import json
import re
from typing import Dict, Any, Optional
import httpx

SYSTEM_PROMPT = """You are BankShield AI, an expert bank fraud detection classifier.
Analyze the provided SMS or WhatsApp message for bank fraud, phishing, or social engineering indicators.
Respond strictly in JSON format with NO markdown wrapping or code blocks:
{
  "risk_score": <integer 0-100>,
  "scam_type": "<e.g. Credential Phishing, KYC Fraud, Remote Access Scam, Lottery / Reward Fraud, or Genuine Communication>",
  "reasoning": ["<concise point 1>", "<concise point 2>"]
}"""

class LLMClassifier:
    def __init__(self):
        self.api_key: Optional[str] = os.environ.get("LLM_API_KEY")
        self.timeout = 5.0  # Strict 5 second timeout

    def _strip_fences(self, text: str) -> str:
        """Strip markdown ```json code blocks safely."""
        text = text.strip()
        text = re.sub(r'^```(?:json)?\s*', '', text, flags=re.MULTILINE)
        text = re.sub(r'\s*```$', '', text, flags=re.MULTILINE)
        return text.strip()

    def _call_provider(self, message: str, api_key: str) -> Optional[Dict[str, Any]]:
        """
        Pluggable provider call.
        Defaults to Google Gemini generateContent REST API or OpenAI-compatible endpoint.
        """
        # If user specified a custom provider or OpenAI URL:
        provider = os.environ.get("LLM_PROVIDER", "gemini").lower()
        
        if provider == "openai":
            base_url = os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1")
            url = f"{base_url}/chat/completions"
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            body = {
                "model": os.environ.get("LLM_MODEL", "gpt-4o-mini"),
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": f"Message to analyze:\n{message}"}
                ],
                "response_format": {"type": "json_object"},
                "temperature": 0.1
            }
            with httpx.Client(timeout=self.timeout) as client:
                res = client.post(url, headers=headers, json=body)
                res.raise_for_status()
                content = res.json()["choices"][0]["message"]["content"]
                return json.loads(self._strip_fences(content))
        else:
            # Default: Gemini REST API (gemini-1.5-flash / gemini-2.5-flash)
            model_name = os.environ.get("LLM_MODEL", "gemini-1.5-flash")
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
            headers = {"Content-Type": "application/json"}
            body = {
                "systemInstruction": {"parts": [{"text": SYSTEM_PROMPT}]},
                "contents": [{"parts": [{"text": f"Message to analyze:\n{message}"}]}],
                "generationConfig": {
                    "temperature": 0.1,
                    "responseMimeType": "application/json"
                }
            }
            with httpx.Client(timeout=self.timeout) as client:
                res = client.post(url, headers=headers, json=body)
                res.raise_for_status()
                data = res.json()
                content = data["candidates"][0]["content"]["parts"][0]["text"]
                return json.loads(self._strip_fences(content))

    def analyze(self, message: str) -> Dict[str, Any]:
        """
        Analyze message using LLM.
        Always gracefully falls back to neutral score if API key is absent, call fails, or times out.
        """
        api_key = os.environ.get("LLM_API_KEY")
        if not api_key:
            return {
                "score": None,
                "scam_type": None,
                "reasoning": [],
                "is_available": False
            }

        try:
            parsed = self._call_provider(message, api_key)
            if not parsed or not isinstance(parsed, dict):
                return {
                    "score": None,
                    "scam_type": None,
                    "reasoning": [],
                    "is_available": False
                }

            score = parsed.get("risk_score")
            if isinstance(score, (int, float)):
                score = max(0, min(100, int(score)))
            else:
                score = None

            return {
                "score": score,
                "scam_type": parsed.get("scam_type"),
                "reasoning": parsed.get("reasoning", []),
                "is_available": True
            }
        except Exception:
            # Never let LLM failure break the demo
            return {
                "score": None,
                "scam_type": None,
                "reasoning": [],
                "is_available": False
            }

# Global singleton
llm_classifier = LLMClassifier()
