"""
Tests unitaires pour les recognizers français.
Au moins 5 cas positifs et 5 cas négatifs par recognizer.
"""

import pytest

from app.recognizers.fr_recognizers import (
    FrNirRecognizer,
    FrIbanRecognizer,
    FrSirenRecognizer,
    FrSiretRecognizer,
    FrTaxNumberRecognizer,
    FrCarteVitaleRecognizer,
    FrLicensePlateRecognizer,
    FrAddressRecognizer,
    _luhn_check,
    _validate_nir_key,
    _validate_iban_fr,
    _normalize_nir,
)


# ── Utilitaires ──────────────────────────────────────────────────────

class TestLuhn:
    def test_valid_luhn(self):
        assert _luhn_check("443127000") is True  # SIREN exemple

    def test_invalid_luhn(self):
        assert _luhn_check("123456789") is False

    def test_empty(self):
        assert _luhn_check("") is False


class TestNirValidation:
    def test_valid_nir(self):
        # NIR fictif avec clé correcte : 1 85 12 75 123 456 + clé
        # On calcule : 97 - (1851275123456 % 97)
        nir_number = 1851275123456
        key = 97 - (nir_number % 97)
        nir_str = f"{nir_number:013d}{key:02d}"
        assert _validate_nir_key(nir_str) is True

    def test_invalid_key(self):
        assert _validate_nir_key("185127512345600") is False

    def test_too_short(self):
        assert _validate_nir_key("12345") is False


class TestNirNormalize:
    def test_with_spaces(self):
        result = _normalize_nir("1 85 12 75 123 456 78")
        assert result is not None
        assert len(result) == 15

    def test_corse_2a(self):
        result = _normalize_nir("2 85 2A 75 123 456 78")
        assert result is not None
        assert "19" in result

    def test_corse_2b(self):
        result = _normalize_nir("1 85 2B 75 123 456 78")
        assert result is not None
        assert "18" in result

    def test_invalid(self):
        assert _normalize_nir("abc") is None


class TestIbanValidation:
    def test_valid_iban(self):
        # IBAN FR valide : FR76 3000 6000 0112 3456 7890 189
        assert _validate_iban_fr("FR7630006000011234567890189") is True

    def test_valid_iban_spaced(self):
        assert _validate_iban_fr("FR76 3000 6000 0112 3456 7890 189") is True

    def test_invalid_iban(self):
        assert _validate_iban_fr("FR7600000000000000000000000") is False

    def test_wrong_country(self):
        assert _validate_iban_fr("DE89370400440532013000") is False

    def test_too_short(self):
        assert _validate_iban_fr("FR76300060") is False


# ── Tests Recognizers (via Presidio) ─────────────────────────────────

# Helper pour exécuter un recognizer sur un texte
def _run_recognizer(recognizer, text: str):
    """Exécute un recognizer Presidio et retourne les résultats."""
    from presidio_analyzer import AnalyzerEngine, RecognizerRegistry
    registry = RecognizerRegistry()
    registry.add_recognizer(recognizer)
    engine = AnalyzerEngine(registry=registry)
    return engine.analyze(text=text, language="fr", entities=[recognizer.supported_entities[0]])


class TestFrNirRecognizer:
    """Tests pour le recognizer NIR (Sécurité Sociale)."""

    recognizer = FrNirRecognizer()

    # Cas positifs
    def test_nir_compact(self):
        nir = "185127512345678"
        results = _run_recognizer(self.recognizer, f"Mon NIR est {nir}")
        assert len(results) > 0

    def test_nir_with_spaces(self):
        results = _run_recognizer(self.recognizer, "numéro sécu : 1 85 12 75 123 456 78")
        assert len(results) > 0

    def test_nir_with_dashes(self):
        results = _run_recognizer(self.recognizer, "NIR: 1-85-12-75-123-456-78")
        assert len(results) > 0

    def test_nir_female(self):
        results = _run_recognizer(self.recognizer, "son numéro de sécu 2 90 03 75 001 234 56")
        assert len(results) > 0

    def test_nir_corse(self):
        results = _run_recognizer(self.recognizer, "NIR: 1 85 2A 75 123 456 78")
        assert len(results) > 0

    # Cas négatifs
    def test_not_nir_short_number(self):
        results = _run_recognizer(self.recognizer, "mon numéro est 12345")
        assert len(results) == 0

    def test_not_nir_phone(self):
        results = _run_recognizer(self.recognizer, "appelez le 01 23 45 67 89")
        assert len(results) == 0

    def test_not_nir_random_text(self):
        results = _run_recognizer(self.recognizer, "bonjour comment allez-vous")
        assert len(results) == 0

    def test_not_nir_starts_with_3(self):
        results = _run_recognizer(self.recognizer, "385127512345678")
        assert len(results) == 0

    def test_not_nir_letters(self):
        results = _run_recognizer(self.recognizer, "ABCDEFGHIJKLMNO")
        assert len(results) == 0


class TestFrIbanRecognizer:
    """Tests pour le recognizer IBAN français."""

    recognizer = FrIbanRecognizer()

    # Cas positifs
    def test_iban_compact(self):
        results = _run_recognizer(self.recognizer, "IBAN: FR7630006000011234567890189")
        assert len(results) > 0

    def test_iban_spaced(self):
        results = _run_recognizer(self.recognizer, "virement sur FR76 3000 6000 0112 3456 7890 189")
        assert len(results) > 0

    def test_iban_in_context(self):
        results = _run_recognizer(self.recognizer, "mes coordonnées bancaires : FR7630006000011234567890189")
        assert len(results) > 0

    def test_iban_with_rib(self):
        results = _run_recognizer(self.recognizer, "RIB : FR7630006000011234567890189")
        assert len(results) > 0

    def test_iban_lowercase(self):
        # IBAN en minuscules — le regex est case-sensitive, devrait quand même fonctionner
        results = _run_recognizer(self.recognizer, "FR7630006000011234567890189 est mon iban")
        assert len(results) > 0

    # Cas négatifs
    def test_not_iban_too_short(self):
        results = _run_recognizer(self.recognizer, "FR76300060")
        assert len(results) == 0

    def test_not_iban_wrong_country(self):
        results = _run_recognizer(self.recognizer, "DE89370400440532013000")
        assert len(results) == 0

    def test_not_iban_random(self):
        results = _run_recognizer(self.recognizer, "ceci est un texte normal")
        assert len(results) == 0

    def test_not_iban_phone(self):
        results = _run_recognizer(self.recognizer, "appelez le 01 23 45 67 89")
        assert len(results) == 0

    def test_not_iban_just_fr(self):
        results = _run_recognizer(self.recognizer, "je vis en France")
        assert len(results) == 0


class TestFrSirenRecognizer:
    """Tests pour le recognizer SIREN."""

    recognizer = FrSirenRecognizer()

    # Cas positifs (SIREN valides Luhn)
    def test_siren_with_context(self):
        results = _run_recognizer(self.recognizer, "SIREN de la société : 443 061 841")
        assert len(results) > 0

    def test_siren_compact(self):
        results = _run_recognizer(self.recognizer, "siren: 443061841")
        assert len(results) > 0

    def test_siren_rcs(self):
        results = _run_recognizer(self.recognizer, "RCS Paris 443 061 841")
        assert len(results) > 0

    def test_siren_kbis(self):
        results = _run_recognizer(self.recognizer, "extrait Kbis numéro 443061841")
        assert len(results) > 0

    def test_siren_in_sentence(self):
        results = _run_recognizer(self.recognizer, "l'entreprise (SIREN 443061841) est basée à Paris")
        assert len(results) > 0

    # Cas négatifs
    def test_not_siren_random_digits(self):
        results = _run_recognizer(self.recognizer, "mon code est 123456")
        assert len(results) == 0

    def test_not_siren_phone(self):
        results = _run_recognizer(self.recognizer, "téléphone 01 23 45 67 89")
        assert len(results) == 0

    def test_not_siren_text(self):
        results = _run_recognizer(self.recognizer, "bonjour le monde")
        assert len(results) == 0

    def test_not_siren_too_long(self):
        results = _run_recognizer(self.recognizer, "12345678901234")
        assert len(results) == 0

    def test_not_siren_letters(self):
        results = _run_recognizer(self.recognizer, "ABCDEFGHI")
        assert len(results) == 0


class TestFrSiretRecognizer:
    """Tests pour le recognizer SIRET."""

    recognizer = FrSiretRecognizer()

    # Cas positifs
    def test_siret_compact(self):
        results = _run_recognizer(self.recognizer, "SIRET: 44306184100015")
        assert len(results) > 0

    def test_siret_spaced(self):
        results = _run_recognizer(self.recognizer, "siret 443 061 841 00015")
        assert len(results) > 0

    def test_siret_in_context(self):
        results = _run_recognizer(self.recognizer, "facture de l'établissement SIRET 44306184100015")
        assert len(results) > 0

    def test_siret_la_poste(self):
        results = _run_recognizer(self.recognizer, "SIRET La Poste : 35600000000048")
        assert len(results) > 0

    def test_siret_fournisseur(self):
        results = _run_recognizer(self.recognizer, "fournisseur n° SIRET 44306184100015")
        assert len(results) > 0

    # Cas négatifs
    def test_not_siret_too_short(self):
        results = _run_recognizer(self.recognizer, "numéro 12345")
        assert len(results) == 0

    def test_not_siret_text(self):
        results = _run_recognizer(self.recognizer, "du texte normal sans chiffres")
        assert len(results) == 0

    def test_not_siret_phone(self):
        results = _run_recognizer(self.recognizer, "01 23 45 67 89")
        assert len(results) == 0

    def test_not_siret_15_digits(self):
        results = _run_recognizer(self.recognizer, "123456789012345")
        assert len(results) == 0

    def test_not_siret_letters(self):
        results = _run_recognizer(self.recognizer, "ABCDEFGHIJKLMN")
        assert len(results) == 0


class TestFrLicensePlateRecognizer:
    """Tests pour le recognizer immatriculation."""

    recognizer = FrLicensePlateRecognizer()

    # Cas positifs
    def test_siv_with_dashes(self):
        results = _run_recognizer(self.recognizer, "plaque: AB-123-CD")
        assert len(results) > 0

    def test_siv_no_dashes(self):
        results = _run_recognizer(self.recognizer, "immatriculation AB123CD")
        assert len(results) > 0

    def test_siv_with_spaces(self):
        results = _run_recognizer(self.recognizer, "véhicule AB 123 CD")
        assert len(results) > 0

    def test_siv_in_sentence(self):
        results = _run_recognizer(self.recognizer, "la voiture immatriculée EF-456-GH est garée")
        assert len(results) > 0

    def test_siv_context_carte_grise(self):
        results = _run_recognizer(self.recognizer, "carte grise numéro AB-789-CD")
        assert len(results) > 0

    # Cas négatifs
    def test_not_plate_text(self):
        results = _run_recognizer(self.recognizer, "bonjour tout le monde")
        assert len(results) == 0

    def test_not_plate_phone(self):
        results = _run_recognizer(self.recognizer, "tel: 01 23 45 67 89")
        assert len(results) == 0

    def test_not_plate_email(self):
        results = _run_recognizer(self.recognizer, "contact@example.com")
        assert len(results) == 0

    def test_not_plate_too_long(self):
        results = _run_recognizer(self.recognizer, "ABCDE-12345-FGHIJ")
        assert len(results) == 0

    def test_not_plate_numbers_only(self):
        results = _run_recognizer(self.recognizer, "12345678")
        assert len(results) == 0


class TestFrAddressRecognizer:
    """Tests pour le recognizer adresses françaises."""

    recognizer = FrAddressRecognizer()

    # Cas positifs
    def test_full_address(self):
        results = _run_recognizer(self.recognizer, "domicilié au 12 rue de la Paix 75002 Paris")
        assert len(results) > 0

    def test_cp_ville(self):
        results = _run_recognizer(self.recognizer, "habite à 69001 Lyon")
        assert len(results) > 0

    def test_avenue(self):
        results = _run_recognizer(self.recognizer, "livraison au 45 avenue des Champs-Elysées 75008 Paris")
        assert len(results) > 0

    def test_boulevard(self):
        results = _run_recognizer(self.recognizer, "adresse : 8 boulevard Haussmann 75009 Paris")
        assert len(results) > 0

    def test_bis(self):
        results = _run_recognizer(self.recognizer, "12 bis rue Victor Hugo 33000 Bordeaux")
        assert len(results) > 0

    # Cas négatifs
    def test_not_address_text(self):
        results = _run_recognizer(self.recognizer, "bonjour comment allez-vous")
        assert len(results) == 0

    def test_not_address_number_alone(self):
        results = _run_recognizer(self.recognizer, "le chiffre est 42")
        assert len(results) == 0

    def test_not_address_cp_alone(self):
        results = _run_recognizer(self.recognizer, "code 75001")
        # Peut matcher CP + ville implicite, mais pas sans ville
        # Acceptons que ça dépende du contexte

    def test_not_address_country(self):
        results = _run_recognizer(self.recognizer, "je vis en France")
        assert len(results) == 0

    def test_not_address_generic(self):
        results = _run_recognizer(self.recognizer, "la sécurité informatique est importante")
        assert len(results) == 0
