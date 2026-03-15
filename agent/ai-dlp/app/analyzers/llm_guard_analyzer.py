"""
Layer 1 : Analyse via LLM Guard + recognizers Presidio français.

Détection rapide (~5-20ms) par NER (BERT) + regex + recognizers custom FR.
"""

from typing import List, Tuple

from loguru import logger
from presidio_analyzer import AnalyzerEngine, RecognizerRegistry
from presidio_analyzer.nlp_engine import NlpEngineProvider
from presidio_anonymizer import AnonymizerEngine
from presidio_anonymizer.entities import OperatorConfig

from llm_guard.input_scanners import Code, Secrets
from llm_guard.vault import Vault

from app.recognizers.fr_recognizers import get_all_fr_recognizers
from app.config import PRIMARY_LANGUAGE, SUPPORTED_LANGUAGES


class Detection:
    """Représente une détection de donnée sensible."""

    def __init__(self, category: str, confidence: int, method: str, snippet: str = ""):
        self.category = category
        self.confidence = confidence
        self.method = method
        self.snippet = snippet


class LlmGuardAnalyzer:
    """
    Layer 1 : combine Presidio (avec recognizers FR custom) + LLM Guard scanners.
    """

    # Mapping des entités Presidio vers nos catégories internes
    ENTITY_TO_CATEGORY = {
        # Entités FR custom
        "FR_NIR": "PERSONAL_DATA",
        "FR_IBAN": "FINANCIAL_DATA",
        "FR_SIREN": "CLIENT_INFORMATION",
        "FR_SIRET": "CLIENT_INFORMATION",
        "FR_TAX_NUMBER": "PERSONAL_DATA",
        "FR_CARTE_VITALE": "MEDICAL_DATA",
        "FR_LICENSE_PLATE": "PERSONAL_DATA",
        "FR_ADDRESS": "PERSONAL_DATA",
        # Entités Presidio built-in
        "PERSON": "PERSONAL_DATA",
        "EMAIL_ADDRESS": "PERSONAL_DATA",
        "PHONE_NUMBER": "PERSONAL_DATA",
        "CREDIT_CARD": "FINANCIAL_DATA",
        "IBAN_CODE": "FINANCIAL_DATA",
        "IP_ADDRESS": "CREDENTIALS_SECRETS",
        "LOCATION": "PERSONAL_DATA",
        "DATE_TIME": "PERSONAL_DATA",
        "NRP": "PERSONAL_DATA",
        "MEDICAL_LICENSE": "MEDICAL_DATA",
        "URL": "PERSONAL_DATA",
    }

    def __init__(self):
        self._init_presidio()
        self._init_llm_guard()
        logger.info("Layer 1 initialized (Presidio FR + LLM Guard)")

    def _init_presidio(self):
        """Initialise Presidio avec les recognizers FR custom."""
        # Configure NLP engine with French + English spaCy models
        nlp_config = {
            "nlp_engine_name": "spacy",
            "models": [
                {"lang_code": "fr", "model_name": "fr_core_news_lg"},
                {"lang_code": "en", "model_name": "en_core_web_lg"},
            ],
        }
        nlp_engine = NlpEngineProvider(nlp_configuration=nlp_config).create_engine()

        registry = RecognizerRegistry(supported_languages=SUPPORTED_LANGUAGES)
        registry.load_predefined_recognizers(
            languages=SUPPORTED_LANGUAGES,
            nlp_engine=nlp_engine,
        )

        # Ajouter les recognizers français
        for recognizer in get_all_fr_recognizers():
            registry.add_recognizer(recognizer)
            logger.info(f"  Registered FR recognizer: {recognizer.supported_entities}")

        self.analyzer = AnalyzerEngine(
            registry=registry,
            nlp_engine=nlp_engine,
            supported_languages=SUPPORTED_LANGUAGES,
        )
        self.anonymizer = AnonymizerEngine()

    def _init_llm_guard(self):
        """Initialise les scanners LLM Guard complémentaires."""
        self.vault = Vault()
        self.secrets_scanner = Secrets(redact_mode="all")
        self.code_scanner = Code(
            languages=["Java", "Python", "JavaScript", "Go", "PHP", "C"],
            is_blocked=True,
        )

    def analyze(self, text: str) -> Tuple[List[Detection], str, float]:
        """
        Analyse un texte via Layer 1.
        Retourne : (détections, texte anonymisé, score 0.0-1.0)
        """
        detections: List[Detection] = []
        max_score = 0.0

        # ── Presidio : NER + recognizers FR ──
        presidio_results = self.analyzer.analyze(
            text=text,
            language=PRIMARY_LANGUAGE,
            score_threshold=0.3,
        )

        if presidio_results:
            for result in presidio_results:
                category = self.ENTITY_TO_CATEGORY.get(result.entity_type, "PERSONAL_DATA")
                confidence = int(result.score * 100)
                span = text[result.start:result.end]
                # Redacter le span pour le snippet
                redacted_span = self._redact_span(span)

                detections.append(Detection(
                    category=category,
                    confidence=confidence,
                    method=f"presidio_{result.entity_type.lower()}",
                    snippet=f"[{result.entity_type}] {redacted_span}",
                ))
                max_score = max(max_score, result.score)

        # Anonymiser le texte via Presidio
        if presidio_results:
            anonymized = self.anonymizer.anonymize(
                text=text,
                analyzer_results=presidio_results,
                operators={
                    "DEFAULT": OperatorConfig("replace", {"new_value": "[MASQUE]"}),
                    "FR_NIR": OperatorConfig("replace", {"new_value": "[NIR]"}),
                    "FR_IBAN": OperatorConfig("replace", {"new_value": "[IBAN]"}),
                    "FR_SIREN": OperatorConfig("replace", {"new_value": "[SIREN]"}),
                    "FR_SIRET": OperatorConfig("replace", {"new_value": "[SIRET]"}),
                    "FR_TAX_NUMBER": OperatorConfig("replace", {"new_value": "[NUM_FISCAL]"}),
                    "FR_CARTE_VITALE": OperatorConfig("replace", {"new_value": "[CARTE_VITALE]"}),
                    "FR_LICENSE_PLATE": OperatorConfig("replace", {"new_value": "[IMMAT]"}),
                    "FR_ADDRESS": OperatorConfig("replace", {"new_value": "[ADRESSE]"}),
                    "PERSON": OperatorConfig("replace", {"new_value": "[NOM]"}),
                    "EMAIL_ADDRESS": OperatorConfig("replace", {"new_value": "[EMAIL]"}),
                    "PHONE_NUMBER": OperatorConfig("replace", {"new_value": "[TELEPHONE]"}),
                    "CREDIT_CARD": OperatorConfig("replace", {"new_value": "[CARTE_BANCAIRE]"}),
                    "IBAN_CODE": OperatorConfig("replace", {"new_value": "[IBAN]"}),
                },
            )
            sanitized_text = anonymized.text
        else:
            sanitized_text = text

        # ── LLM Guard : Secrets ──
        _, is_valid, risk_score = self.secrets_scanner.scan(text)
        if not is_valid and risk_score >= 0:
            score = min(1.0, 1.0 - risk_score)
            max_score = max(max_score, score)
            detections.append(Detection(
                category="CREDENTIALS_SECRETS",
                confidence=min(100, int(score * 100)),
                method="llm_guard_secrets",
                snippet="Secrets/credentials detectes",
            ))

        # ── LLM Guard : Code ──
        _, is_valid, risk_score = self.code_scanner.scan(text)
        if not is_valid and risk_score >= 0:
            score = min(1.0, 1.0 - risk_score)
            max_score = max(max_score, score)
            detections.append(Detection(
                category="SOURCE_CODE",
                confidence=min(100, int(score * 100)),
                method="llm_guard_code",
                snippet="Code source detecte",
            ))

        return detections, sanitized_text, max_score

    @staticmethod
    def _redact_span(span: str) -> str:
        """Masque le milieu d'un span pour le snippet."""
        if len(span) <= 4:
            return "****"
        return span[:2] + "****" + span[-2:]
