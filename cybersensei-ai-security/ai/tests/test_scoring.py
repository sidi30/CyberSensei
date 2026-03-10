"""
Tests unitaires pour le module de scoring combine.
Couvre les poids par categorie, bonus diversite, boosts Art. 9,
hard signals Layer 1 et classification par niveau de risque.
"""

import pytest
from unittest.mock import MagicMock

from app.utils.scoring import compute_combined_score, _to_risk_level, CATEGORY_WEIGHTS
from app.analyzers.rgpd_article9 import Article9Result, Article9Detection


# ── Helpers ──────────────────────────────────────────────────────────


class FakeDetection:
    """Objet detection minimal pour les tests."""

    def __init__(self, category: str, confidence: int, method: str, snippet: str = ""):
        self.category = category
        self.confidence = confidence
        self.method = method
        self.snippet = snippet


def _empty_article9() -> Article9Result:
    """Article9Result sans donnees sensibles."""
    return Article9Result(categories=[], has_article9_data=False, explanation="")


def _article9_with_health(confidence: float = 0.9) -> Article9Result:
    """Article9Result avec detection HEALTH_DATA."""
    return Article9Result(
        categories=[Article9Detection(type="HEALTH_DATA", confidence=confidence)],
        has_article9_data=True,
        explanation="Donnees de sante detectees",
    )


# ── Tests risk level thresholds ──────────────────────────────────────


class TestRiskLevel:

    def test_safe_threshold(self):
        assert _to_risk_level(0) == "SAFE"
        assert _to_risk_level(19) == "SAFE"

    def test_low_threshold(self):
        assert _to_risk_level(20) == "LOW"
        assert _to_risk_level(39) == "LOW"

    def test_medium_threshold(self):
        assert _to_risk_level(40) == "MEDIUM"
        assert _to_risk_level(59) == "MEDIUM"

    def test_high_threshold(self):
        assert _to_risk_level(60) == "HIGH"
        assert _to_risk_level(79) == "HIGH"

    def test_critical_threshold(self):
        assert _to_risk_level(80) == "CRITICAL"
        assert _to_risk_level(100) == "CRITICAL"


# ── Tests compute_combined_score ─────────────────────────────────────


class TestComputeCombinedScore:

    def test_empty_detections_no_article9(self):
        """Aucune detection, pas d'Art. 9 → score 0, SAFE."""
        score, level = compute_combined_score(
            l1_detections=[],
            l1_score=0.0,
            l2_detections=[],
            article9_result=_empty_article9(),
            has_pii_in_l1=False,
        )
        assert score == 0
        assert level == "SAFE"

    def test_single_low_confidence_detection(self):
        """Une seule detection a faible confiance → score faible."""
        det = FakeDetection("SOURCE_CODE", 20, "llm_guard")
        # weight=1.0, base_score = 20*1.0 / 1 = 20
        # diversity: 1 unique cat => 20 * (1 + 0.1) = 22
        score, level = compute_combined_score(
            l1_detections=[det],
            l1_score=0.1,
            l2_detections=[],
            article9_result=_empty_article9(),
            has_pii_in_l1=False,
        )
        assert score == 22
        assert level == "LOW"

    def test_high_confidence_credentials(self):
        """CREDENTIALS_SECRETS a haute confiance → score eleve (poids 1.5)."""
        det = FakeDetection("CREDENTIALS_SECRETS", 90, "llm_guard_secrets")
        # weight=1.5, base_score = 90*1.5 / 1 = 135
        # diversity: 1 unique cat => 135 * 1.1 = 148.5
        # clamped to 100
        score, level = compute_combined_score(
            l1_detections=[det],
            l1_score=0.5,
            l2_detections=[],
            article9_result=_empty_article9(),
            has_pii_in_l1=False,
        )
        assert score == 100
        assert level == "CRITICAL"

    def test_multiple_categories_diversity_bonus(self):
        """Plusieurs categories differentes → bonus diversite applique."""
        det1 = FakeDetection("PERSONAL_DATA", 40, "presidio_person")
        det2 = FakeDetection("FINANCIAL_DATA", 40, "presidio_iban")
        # weight: 1.3 and 1.2
        # base = (40*1.3 + 40*1.2) / 2 = (52+48)/2 = 50
        # diversity: 2 unique cats => 50 * (1 + 0.2) = 60
        score, level = compute_combined_score(
            l1_detections=[det1, det2],
            l1_score=0.3,
            l2_detections=[],
            article9_result=_empty_article9(),
            has_pii_in_l1=False,
        )
        assert score == 60
        assert level == "HIGH"

    def test_single_category_no_extra_diversity(self):
        """Meme categorie repetee → bonus diversite = 1 categorie seulement."""
        det1 = FakeDetection("PERSONAL_DATA", 30, "presidio_person")
        det2 = FakeDetection("PERSONAL_DATA", 30, "presidio_email")
        # weight: 1.3 each
        # base = (30*1.3 + 30*1.3) / 2 = 39
        # diversity: 1 unique cat => 39 * 1.1 = 42.9 => 42
        score, level = compute_combined_score(
            l1_detections=[det1, det2],
            l1_score=0.2,
            l2_detections=[],
            article9_result=_empty_article9(),
            has_pii_in_l1=False,
        )
        assert score == 42
        assert level == "MEDIUM"

    def test_article9_with_pii_boost(self):
        """Art. 9 + PII identifiant → boost +60."""
        det = FakeDetection("PERSONAL_DATA", 20, "presidio_person")
        # base = 20*1.3/1 = 26, diversity => 26*1.1 = 28.6
        # article9 boost: 28.6 + 60 = 88.6 => 88
        score, level = compute_combined_score(
            l1_detections=[det],
            l1_score=0.2,
            l2_detections=[],
            article9_result=_article9_with_health(0.9),
            has_pii_in_l1=True,
        )
        assert score >= 80
        assert level == "CRITICAL"

    def test_article9_without_pii_boost(self):
        """Art. 9 sans PII → boost +40."""
        det = FakeDetection("SOURCE_CODE", 20, "llm_guard")
        # base = 20*1.0/1 = 20, diversity => 20*1.1 = 22
        # article9 boost: 22 + 40 = 62
        score, level = compute_combined_score(
            l1_detections=[det],
            l1_score=0.1,
            l2_detections=[],
            article9_result=_article9_with_health(0.9),
            has_pii_in_l1=False,
        )
        assert score >= 60
        assert level in ("HIGH", "CRITICAL")

    def test_article9_low_confidence_no_boost(self):
        """Art. 9 avec confiance < seuil minimum → pas de boost."""
        det = FakeDetection("SOURCE_CODE", 20, "llm_guard")
        art9 = Article9Result(
            categories=[Article9Detection(type="HEALTH_DATA", confidence=0.3)],
            has_article9_data=True,
            explanation="Low confidence",
        )
        score, level = compute_combined_score(
            l1_detections=[det],
            l1_score=0.1,
            l2_detections=[],
            article9_result=art9,
            has_pii_in_l1=False,
        )
        # No boost applied — should be same as without Art. 9
        # base = 20*1.0/1=20, diversity => 20*1.1=22
        assert score == 22
        assert level == "LOW"

    def test_l1_hard_signal_forces_minimum_75(self):
        """l1_score > 0.7 → score force a minimum 75."""
        det = FakeDetection("SOURCE_CODE", 10, "llm_guard")
        # base = 10*1.0/1 = 10, diversity => 10*1.1 = 11
        # l1_score > 0.7 => max(11, 75) = 75
        score, level = compute_combined_score(
            l1_detections=[det],
            l1_score=0.8,
            l2_detections=[],
            article9_result=_empty_article9(),
            has_pii_in_l1=False,
        )
        assert score >= 75
        assert level in ("HIGH", "CRITICAL")

    def test_l1_score_at_threshold_no_force(self):
        """l1_score = 0.7 exactement → pas de forcage."""
        det = FakeDetection("SOURCE_CODE", 10, "llm_guard")
        score, level = compute_combined_score(
            l1_detections=[det],
            l1_score=0.7,
            l2_detections=[],
            article9_result=_empty_article9(),
            has_pii_in_l1=False,
        )
        # base = 10*1.0 = 10, diversity => 11
        assert score == 11
        assert level == "SAFE"

    def test_score_clamped_at_100(self):
        """Score ne depasse jamais 100."""
        det = FakeDetection("HEALTH_DATA", 95, "mistral_semantic")
        # weight=1.6, base = 95*1.6/1=152, diversity => 152*1.1=167.2
        # clamped to 100
        score, level = compute_combined_score(
            l1_detections=[],
            l1_score=0.0,
            l2_detections=[det],
            article9_result=_empty_article9(),
            has_pii_in_l1=False,
        )
        assert score == 100
        assert level == "CRITICAL"

    def test_score_minimum_zero(self):
        """Score ne descend pas sous 0."""
        score, level = compute_combined_score(
            l1_detections=[],
            l1_score=0.0,
            l2_detections=[],
            article9_result=_empty_article9(),
            has_pii_in_l1=False,
        )
        assert score >= 0

    def test_l2_detections_included(self):
        """Les detections Layer 2 sont prises en compte."""
        l2_det = FakeDetection("MEDICAL_DATA", 70, "mistral_semantic")
        # weight=1.4, base = 70*1.4/1 = 98
        # diversity => 98 * 1.1 = 107.8 => clamped 100
        score, level = compute_combined_score(
            l1_detections=[],
            l1_score=0.0,
            l2_detections=[l2_det],
            article9_result=_empty_article9(),
            has_pii_in_l1=False,
        )
        assert score == 100
        assert level == "CRITICAL"

    def test_combined_l1_and_l2(self):
        """Mix L1 + L2 → moyenne ponderee de toutes les detections."""
        l1_det = FakeDetection("PERSONAL_DATA", 40, "presidio_person")
        l2_det = FakeDetection("FINANCIAL_DATA", 60, "mistral_semantic")
        # weights: 1.3, 1.2
        # base = (40*1.3 + 60*1.2) / 2 = (52+72)/2 = 62
        # diversity: 2 cats => 62 * 1.2 = 74.4 => 74
        score, level = compute_combined_score(
            l1_detections=[l1_det],
            l1_score=0.3,
            l2_detections=[l2_det],
            article9_result=_empty_article9(),
            has_pii_in_l1=False,
        )
        assert score == 74
        assert level == "HIGH"

    def test_unknown_category_weight_defaults_to_1(self):
        """Categorie inconnue → poids par defaut 1.0."""
        det = FakeDetection("UNKNOWN_CATEGORY", 50, "custom_method")
        # weight=1.0, base = 50/1=50, diversity => 50*1.1=55
        score, level = compute_combined_score(
            l1_detections=[det],
            l1_score=0.0,
            l2_detections=[],
            article9_result=_empty_article9(),
            has_pii_in_l1=False,
        )
        assert score == 55
        assert level == "MEDIUM"

    def test_only_article9_no_detections(self):
        """Art. 9 seul sans detections → score 0 + boost Art. 9."""
        art9 = _article9_with_health(0.9)
        # No detections => base_score = 0
        # article9 with PII: 0 + 60 = 60
        score, level = compute_combined_score(
            l1_detections=[],
            l1_score=0.0,
            l2_detections=[],
            article9_result=art9,
            has_pii_in_l1=True,
        )
        assert score == 60
        assert level == "HIGH"
