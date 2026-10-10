from typing import Dict, Any, Optional, Tuple

class Scorer:
    def calculate_score(
        self,
        rule_score: int,
        url_score: int,
        llm_score: Optional[int],
        has_urls: bool,
        has_otp_request: bool,
        is_lookalike: bool,
        has_genuine_banking_signals: bool = False,
        is_authentic_header: bool = False,
        has_verified_url: bool = False,
        is_ambiguous: bool = False,
        sender_risk: int = 0
    ) -> Tuple[int, str]:
        """
        Calculate final fraud score (0-100) and verdict based on detection layers.
        Enforces minimum score of 70 if OTP request or lookalike domain is detected.
        
        Verdicts:
          - Likely Safe: Verifiable bank transaction indicators or authentic TRAI DLT header, zero threat triggers.
          - Suspicious: Notable indicators (urgency, unverified phone, URL shortener, high-risk TLD).
          - Dangerous: Critical indicators (OTP/PIN harvesting, lookalike domain, APK trojan, remote screen sharing).
          - CANNOT VERIFY: Insufficient banking evidence to confirm authenticity or confirm fraud.
        """
        effective_llm = llm_score if (llm_score is not None) else 0

        if has_urls:
            if llm_score is not None:
                final_calc = (0.35 * rule_score) + (0.35 * url_score) + (0.30 * effective_llm)
            else:
                final_calc = (0.50 * rule_score) + (0.50 * url_score)
        else:
            if llm_score is not None:
                final_calc = (0.60 * rule_score) + (0.40 * effective_llm)
            else:
                final_calc = float(rule_score)

        score = int(round(final_calc))

        # Enforce critical override: minimum score of 70 for OTP request or lookalike domain
        if has_otp_request or is_lookalike:
            score = max(score, 70)
            return min(100, score), "Dangerous"

        # Cap between 0 and 100
        score = max(0, min(100, score))

        # Critical danger threshold
        if score >= 66:
            return score, "Dangerous"

        # Check for genuine banking verification evidence
        is_verified_genuine = (has_genuine_banking_signals or is_authentic_header or has_verified_url) and (url_score == 0 and sender_risk == 0)

        if is_verified_genuine and score <= 30:
            return score, "Likely Safe"

        # Suspicious with clear risk signals
        if score >= 35 and not is_ambiguous:
            return score, "Suspicious"

        # When evidence is insufficient to verify authentic bank origin or determine malice:
        # Avoid false safe rating and false alarm: return CANNOT VERIFY
        if is_ambiguous or (not is_verified_genuine and score < 66):
            neutral_score = max(score, 38)
            neutral_score = min(50, neutral_score)
            return neutral_score, "CANNOT VERIFY"

        if score <= 30:
            return score, "Likely Safe"
        else:
            return score, "Suspicious"

# Global singleton
scorer = Scorer()

