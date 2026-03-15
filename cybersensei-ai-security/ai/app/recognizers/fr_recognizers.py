"""
Recognizers Presidio custom pour les identifiants français.

Chaque recognizer inclut :
- Regex de détection (formats courants avec/sans espaces/tirets)
- Validation par checksum quand applicable (Luhn, modulo 97, clé NIR)
- Score de confiance ajusté selon la validation

Catégories : FR_NIR, FR_IBAN, FR_SIREN, FR_SIRET, FR_TAX_NUMBER,
             FR_CARTE_VITALE, FR_LICENSE_PLATE, FR_ADDRESS
"""

import re
from typing import List, Optional

from presidio_analyzer import Pattern, PatternRecognizer, RecognizerResult


# ── Utilitaires de validation ────────────────────────────────────────

def _luhn_check(number: str) -> bool:
    """Validation Luhn (ISO/IEC 7812) pour SIREN/SIRET/CB."""
    digits = [int(d) for d in number if d.isdigit()]
    if not digits:
        return False
    checksum = 0
    reverse = digits[::-1]
    for i, d in enumerate(reverse):
        if i % 2 == 1:
            d *= 2
            if d > 9:
                d -= 9
        checksum += d
    return checksum % 10 == 0


def _validate_nir_key(nir_digits: str) -> bool:
    """Valide la clé de contrôle du NIR (97 - (numéro % 97))."""
    if len(nir_digits) < 15:
        return False
    number_part = nir_digits[:13]
    key_part = nir_digits[13:15]
    try:
        number = int(number_part)
        key = int(key_part)
        return key == (97 - (number % 97))
    except ValueError:
        return False


def _normalize_nir(raw: str) -> Optional[str]:
    """
    Normalise un NIR brut (avec espaces/tirets) en 15 chiffres.
    Gère la Corse : 2A → remplace par 19, 2B → remplace par 18.
    """
    cleaned = re.sub(r"[\s\-.]", "", raw)
    # Gestion Corse
    cleaned = cleaned.replace("2A", "19").replace("2a", "19")
    cleaned = cleaned.replace("2B", "18").replace("2b", "18")
    if len(cleaned) == 15 and cleaned.isdigit():
        return cleaned
    return None


def _validate_iban_fr(iban: str) -> bool:
    """Validation IBAN français par modulo 97 (ISO 13616)."""
    cleaned = re.sub(r"[\s\-]", "", iban).upper()
    if not cleaned.startswith("FR") or len(cleaned) != 27:
        return False
    # Déplacer les 4 premiers caractères à la fin
    rearranged = cleaned[4:] + cleaned[:4]
    # Remplacer les lettres par des chiffres (A=10, B=11, ..., Z=35)
    numeric = ""
    for char in rearranged:
        if char.isdigit():
            numeric += char
        elif char.isalpha():
            numeric += str(ord(char) - ord("A") + 10)
        else:
            return False
    try:
        return int(numeric) % 97 == 1
    except ValueError:
        return False


# ── 1. NIR (Numéro de Sécurité Sociale) ─────────────────────────────

class FrNirRecognizer(PatternRecognizer):
    """
    Détecte les numéros de Sécurité Sociale français (NIR).
    Format : [12] XX XX XX(2A/2B) XXX XXX XX (13 chiffres + clé 2 chiffres)
    Validation : clé = 97 - (numéro % 97), Corse : 2A→19, 2B→18
    """

    PATTERNS = [
        Pattern(
            "nir_spaced",
            r"\b[12]\s?\d{2}\s?(?:\d{2}|2[AaBb])\s?\d{2}\s?\d{3}\s?\d{3}\s?\d{2}\b",
            0.7,
        ),
        Pattern(
            "nir_dashed",
            r"\b[12]-?\d{2}-?(?:\d{2}|2[AaBb])-?\d{2}-?\d{3}-?\d{3}-?\d{2}\b",
            0.7,
        ),
    ]

    CONTEXT = [
        "sécurité sociale", "sécu", "nir", "numéro de sécurité",
        "immatriculation", "assuré social", "cpam", "ameli",
    ]

    def __init__(self):
        super().__init__(
            supported_entity="FR_NIR",
            patterns=self.PATTERNS,
            context=self.CONTEXT,
            supported_language="fr",
        )

    def validate_result(self, pattern_text: str) -> Optional[bool]:
        """Valide le NIR via la clé de contrôle."""
        normalized = _normalize_nir(pattern_text)
        if normalized and _validate_nir_key(normalized):
            return True
        return None  # pas de validation possible, garder le score regex


# ── 2. IBAN français ─────────────────────────────────────────────────

class FrIbanRecognizer(PatternRecognizer):
    """
    Détecte les IBAN français.
    Format : FR76 XXXX XXXX XXXX XXXX XXXX XXX (27 caractères)
    Validation : modulo 97 ISO 13616
    """

    PATTERNS = [
        Pattern(
            "iban_fr_spaced",
            r"\bFR\s?\d{2}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\s?\d{3}\b",
            0.8,
        ),
        Pattern(
            "iban_fr_compact",
            r"\bFR\d{25}\b",
            0.8,
        ),
    ]

    CONTEXT = [
        "iban", "virement", "rib", "compte bancaire", "banque",
        "bénéficiaire", "prélèvement", "coordonnées bancaires",
    ]

    def __init__(self):
        super().__init__(
            supported_entity="FR_IBAN",
            patterns=self.PATTERNS,
            context=self.CONTEXT,
            supported_language="fr",
        )

    def validate_result(self, pattern_text: str) -> Optional[bool]:
        if _validate_iban_fr(pattern_text):
            return True
        return None


# ── 3. SIREN ─────────────────────────────────────────────────────────

class FrSirenRecognizer(PatternRecognizer):
    """
    Détecte les numéros SIREN (9 chiffres, validation Luhn).
    """

    PATTERNS = [
        Pattern(
            "siren_spaced",
            r"\b\d{3}\s?\d{3}\s?\d{3}\b",
            0.4,  # score bas car 9 chiffres = beaucoup de faux positifs
        ),
    ]

    CONTEXT = [
        "siren", "siret", "entreprise", "société", "raison sociale",
        "rcs", "registre du commerce", "kbis", "infogreffe",
    ]

    def __init__(self):
        super().__init__(
            supported_entity="FR_SIREN",
            patterns=self.PATTERNS,
            context=self.CONTEXT,
            supported_language="fr",
        )

    def validate_result(self, pattern_text: str) -> Optional[bool]:
        digits = re.sub(r"\s", "", pattern_text)
        if len(digits) == 9 and digits.isdigit() and _luhn_check(digits):
            return True
        return None


# ── 4. SIRET ─────────────────────────────────────────────────────────

class FrSiretRecognizer(PatternRecognizer):
    """
    Détecte les numéros SIRET (14 chiffres = SIREN + NIC).
    Validation Luhn sur les 14 chiffres.
    Exception La Poste (SIREN 356000000) : pas de Luhn sur SIRET.
    """

    PATTERNS = [
        Pattern(
            "siret_spaced",
            r"\b\d{3}\s?\d{3}\s?\d{3}\s?\d{5}\b",
            0.6,
        ),
        Pattern(
            "siret_compact",
            r"\b\d{14}\b",
            0.4,
        ),
    ]

    CONTEXT = [
        "siret", "établissement", "entreprise", "société",
        "facture", "bon de commande", "prestataire", "fournisseur",
    ]

    LA_POSTE_SIREN = "356000000"

    def __init__(self):
        super().__init__(
            supported_entity="FR_SIRET",
            patterns=self.PATTERNS,
            context=self.CONTEXT,
            supported_language="fr",
        )

    def validate_result(self, pattern_text: str) -> Optional[bool]:
        digits = re.sub(r"\s", "", pattern_text)
        if len(digits) != 14 or not digits.isdigit():
            return None
        # Exception La Poste
        if digits[:9] == self.LA_POSTE_SIREN:
            return True
        if _luhn_check(digits):
            return True
        return None


# ── 5. Numéro fiscal (SPI) ──────────────────────────────────────────

class FrTaxNumberRecognizer(PatternRecognizer):
    """
    Détecte les numéros fiscaux français (SPI).
    Format : 13 chiffres commençant par 0, 1, 2 ou 3.
    """

    PATTERNS = [
        Pattern(
            "tax_number",
            r"\b[0-3]\d{12}\b",
            0.5,
        ),
        Pattern(
            "tax_number_spaced",
            r"\b[0-3]\d{2}\s?\d{3}\s?\d{3}\s?\d{4}\b",
            0.5,
        ),
    ]

    CONTEXT = [
        "fiscal", "impôt", "impots", "avis d'imposition", "spi",
        "numéro fiscal", "déclaration", "trésor public",
        "direction générale des finances", "dgfip",
    ]

    def __init__(self):
        super().__init__(
            supported_entity="FR_TAX_NUMBER",
            patterns=self.PATTERNS,
            context=self.CONTEXT,
            supported_language="fr",
        )


# ── 6. Carte Vitale ─────────────────────────────────────────────────

class FrCarteVitaleRecognizer(PatternRecognizer):
    """
    Détecte les numéros de Carte Vitale.
    Même format que le NIR, mais contexte d'usage différent.
    Tagué FR_CARTE_VITALE si le contexte mentionne carte vitale/CPAM/assurance maladie.
    """

    PATTERNS = [
        Pattern(
            "carte_vitale",
            r"\b[12]\s?\d{2}\s?(?:\d{2}|2[AaBb])\s?\d{2}\s?\d{3}\s?\d{3}\s?\d{2}\b",
            0.7,
        ),
    ]

    CONTEXT = [
        "carte vitale", "vitale", "assurance maladie", "cpam",
        "caisse primaire", "mutuelle", "tiers payant", "ameli",
        "feuille de soins",
    ]

    def __init__(self):
        super().__init__(
            supported_entity="FR_CARTE_VITALE",
            patterns=self.PATTERNS,
            context=self.CONTEXT,
            supported_language="fr",
        )

    def validate_result(self, pattern_text: str) -> Optional[bool]:
        normalized = _normalize_nir(pattern_text)
        if normalized and _validate_nir_key(normalized):
            return True
        return None


# ── 7. Immatriculation véhicule ──────────────────────────────────────

class FrLicensePlateRecognizer(PatternRecognizer):
    """
    Détecte les plaques d'immatriculation françaises.
    Nouveau format (SIV) : AA-123-BB
    Ancien format (FNI) : 1234 AB 75
    """

    PATTERNS = [
        # Nouveau format SIV : AA-123-BB (avec ou sans tirets)
        Pattern(
            "plate_siv",
            r"\b[A-HJ-NP-TV-Z]{2}[\s\-]?\d{3}[\s\-]?[A-HJ-NP-TV-Z]{2}\b",
            0.75,
        ),
        # Ancien format FNI : 1234 AB 75 (avec ou sans espaces)
        Pattern(
            "plate_fni",
            r"\b\d{1,4}\s?[A-Z]{1,3}\s?\d{2,3}\b",
            0.4,
        ),
    ]

    CONTEXT = [
        "immatriculation", "plaque", "véhicule", "voiture",
        "carte grise", "certificat d'immatriculation", "auto",
    ]

    def __init__(self):
        super().__init__(
            supported_entity="FR_LICENSE_PLATE",
            patterns=self.PATTERNS,
            context=self.CONTEXT,
            supported_language="fr",
        )


# ── 8. Adresses postales françaises ─────────────────────────────────

class FrAddressRecognizer(PatternRecognizer):
    """
    Détecte les adresses postales françaises.
    - Code postal 5 chiffres + commune
    - Adresse complète : numéro + voie + CP + ville
    """

    PATTERNS = [
        # Code postal + ville
        Pattern(
            "cp_ville",
            r"\b\d{5}\s+[A-ZÀ-Ÿ][a-zà-ÿ]+(?:[\s\-][A-ZÀ-Ÿa-zà-ÿ]+){0,4}\b",
            0.5,
        ),
        # Adresse complète : numéro + type de voie + nom + CP + ville
        Pattern(
            "adresse_complete",
            r"\b\d{1,4}[\s,]+(?:rue|avenue|boulevard|place|chemin|impasse|allée|passage|cours|route|bd|av)\s+[A-ZÀ-Ÿa-zà-ÿ\s\-']{3,50}[\s,]+\d{5}\s+[A-ZÀ-Ÿ][a-zà-ÿ]+",
            0.75,
        ),
        # Avec "bis", "ter"
        Pattern(
            "adresse_bis_ter",
            r"\b\d{1,4}\s*(?:bis|ter|quater)?[\s,]+(?:rue|avenue|boulevard|place|chemin|impasse|allée|bd|av)\s+[A-ZÀ-Ÿa-zà-ÿ\s\-']{3,50}",
            0.55,
        ),
    ]

    CONTEXT = [
        "adresse", "domicile", "résidence", "habite", "situé",
        "courrier", "livraison", "facturation", "domicilié",
    ]

    def __init__(self):
        super().__init__(
            supported_entity="FR_ADDRESS",
            patterns=self.PATTERNS,
            context=self.CONTEXT,
            supported_language="fr",
        )


# ── Registry : tous les recognizers FR ───────────────────────────────

def get_all_fr_recognizers() -> List[PatternRecognizer]:
    """Retourne la liste de tous les recognizers français."""
    return [
        FrNirRecognizer(),
        FrIbanRecognizer(),
        FrSirenRecognizer(),
        FrSiretRecognizer(),
        FrTaxNumberRecognizer(),
        FrCarteVitaleRecognizer(),
        FrLicensePlateRecognizer(),
        FrAddressRecognizer(),
    ]
