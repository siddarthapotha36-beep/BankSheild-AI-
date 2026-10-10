import re
from typing import List

# Regex to match URLs including http/https with domains, IP addresses, ports, or high-risk TLDs
URL_REGEX = re.compile(
    r'(?:https?:\/\/|www\.)(?:(?:[0-9]{1,3}\.){3}[0-9]{1,3}|[a-zA-Z0-9.\-_]+(?:\.[a-zA-Z]{2,})+)(?::\d+)?(?:\/[^\s]*)?|'
    r'[a-zA-Z0-9.\-_]+\.(?:xyz|top|click|info|live|work|loan|tk|ml|ga|cf|gq|club|online|site|app)(?::\d+)?(?:\/[^\s]*)?',
    re.IGNORECASE
)

# Regex to detect phone numbers in Indian banking messages (+91, 10 digits, or 1800 toll free)
PHONE_REGEX = re.compile(
    r'(?:\+?91[\-\s]?)?[6-9]\d{9}|(?:1800[\-\s]?\d{3}[\-\s]?\d{3,4})',
    re.IGNORECASE
)

def clean_text(text: str) -> str:
    """Normalize text: replace zero-width spaces, strip control chars, standardize whitespace."""
    if not text:
        return ""
    cleaned = re.sub(r'[\u200B-\u200D\uFEFF]', '', text)
    cleaned = re.sub(r'[ \t]+', ' ', cleaned).strip()
    return cleaned

def extract_urls(text: str) -> List[str]:
    """Extract all potential URLs or web links from the message."""
    if not text:
        return []
    matches = URL_REGEX.findall(text)
    seen = set()
    urls = []
    for m in matches:
        m = m.strip('.,;:\'"()[]{}')
        if m and m.lower() not in seen:
            seen.add(m.lower())
            urls.append(m)
    return urls

def extract_phone_numbers(text: str) -> List[str]:
    """Extract phone / helpline numbers from the message."""
    if not text:
        return []
    matches = PHONE_REGEX.findall(text)
    seen = set()
    phones = []
    for p in matches:
        cleaned_p = p.strip()
        if cleaned_p and cleaned_p not in seen:
            seen.add(cleaned_p)
            phones.append(cleaned_p)
    return phones
