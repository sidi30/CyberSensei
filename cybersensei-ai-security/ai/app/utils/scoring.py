"""
Scoring combiné Layer 1 + Layer 2 + RGPD Art. 9.

Le score final (0-100) détermine l'action :
  0-19  SAFE    → laisser passer
  20-39 LOW     → laisser passer avec log
  40-59 MEDIUM  → warning utilisateur
  60-79 HIGH    → warning fort + proposition d'anonymisation
  80-100 CRITICAL → blocage
"""

from typing import List, Tuple

from app.analyzers.rgpd_article9 import Article9Result
from app.config import ARTICLE9_CONFIDENCE_MIN, ARTICLE9_SCORE_BOOST, ARTICLE9_WITH_PII_BOOST


# Poids par catégorie de données
CATEGORY_WEIGHTS = {
    # RGPD Art. 9 — les plus sensibles
    "HEALTH_DATA": 1.6,
    "POLITICAL_OPINION": 1.5,
    "UNION_MEMBERSHIP": 1.5,
    "RELIGIOUS_BELIEF": 1.5,
    "SEXUAL_ORIENTATION": 1.6,
    "ETHNIC_ORIGIN": 1.6,
    "BIOMETRIC_DATA": 1.6,
    "CRIMINAL_DATA": 1.5,
    # Données classiques
    "CREDENTIALS_SECRETS": 1.5,
    "PERSONAL_DATA": 1.3,
    "MEDICAL_DATA": 1.4,
    "FINANCIAL_DATA": 1.2,
    "LEGAL_DOCUMENTS": 1.2,
    "CLIENT_INFORMATION": 1.1,
    "COMPANY_CONFIDENTIAL": 1.1,
    "SOURCE_CODE": 1.0,
    "INTELLECTUAL_PROPERTY": 1.0,
}


def compute_combined_score(
    l1_detections: list,
    l1_score: float,
    l2_detections: list,
    article9_result: Article9Result,
    has_pii_in_l1: bool,
) -> Tuple[int, str]:
    """
    Calcule le score combiné des deux couches + bonus RGPD Art. 9.

    Args:
        l1_detections: détections Layer 1 (LLM Guard/Presidio)
        l1_score: score Layer 1 (0.0-1.0)
        l2_detections: détections Layer 2 (Mistral sémantique)
        article9_result: résultat de l'analyse Art. 9
        has_pii_in_l1: True si Layer 1 a détecté des PII identifiants (nom, email, NIR)

    Returns:
        (score 0-100, risk_level string)
    """
    all_detections = l1_detections + l2_detections

    if not all_detections and not article9_result.has_article9_data:
        return 0, "SAFE"

    # ── Score de base : moyenne pondérée des détections ──
    if all_detections:
        weighted_sum = sum(
            d.confidence * CATEGORY_WEIGHTS.get(d.category, 1.0)
            for d in all_detections
        )
        base_score = weighted_sum / len(all_detections)

        # Bonus diversité (plus de catégories = plus risqué)
        unique_cats = len(set(d.category for d in all_detections))
        base_score *= (1 + unique_cats * 0.1)
    else:
        base_score = 0.0

    # ── Boost Layer 1 hard signals ──
    if l1_score > 0.7:
        base_score = max(base_score, 75)

    # ── Boost RGPD Art. 9 ──
    if article9_result.has_article9_data:
        high_confidence_art9 = [
            c for c in article9_result.categories
            if c.confidence >= ARTICLE9_CONFIDENCE_MIN
        ]

        if high_confidence_art9:
            if has_pii_in_l1:
                # Art. 9 + PII identifiant = très critique
                base_score = max(base_score, base_score + ARTICLE9_WITH_PII_BOOST)
            else:
                # Art. 9 seul
                base_score = max(base_score, base_score + ARTICLE9_SCORE_BOOST)

    # ── Clamp et classification ──
    score = min(100, max(0, int(base_score)))
    level = _to_risk_level(score)

    return score, level


def _to_risk_level(score: int) -> str:
    if score >= 80:
        return "CRITICAL"
    if score >= 60:
        return "HIGH"
    if score >= 40:
        return "MEDIUM"
    if score >= 20:
        return "LOW"
    return "SAFE"
