"""
Tests unitaires pour le validateur API gouvernementales.
Mock complet des appels HTTP — aucun appel reseau reel.
"""

import pytest
import httpx
from unittest.mock import patch, AsyncMock, MagicMock

from app.validators.gov_api_validator import (
    validate_siren,
    validate_siret,
    validate_address,
    validate_detections,
)


# ── Helpers ──────────────────────────────────────────────────────────


class FakeDetection:
    """Objet detection minimal pour les tests."""

    def __init__(self, category: str, confidence: int, method: str, snippet: str = ""):
        self.category = category
        self.confidence = confidence
        self.method = method
        self.snippet = snippet


def _mock_response(status_code: int = 200, json_data: dict = None):
    """Cree un mock httpx.Response."""
    resp = MagicMock(spec=httpx.Response)
    resp.status_code = status_code
    resp.json.return_value = json_data or {}
    return resp


# ── validate_siren ───────────────────────────────────────────────────


class TestValidateSiren:

    @pytest.mark.asyncio
    async def test_valid_siren_found(self):
        """SIREN valide trouve dans l'API → retourne dict avec infos."""
        api_response = _mock_response(200, {
            "results": [{
                "siren": "443061841",
                "nom_complet": "ACME SAS",
                "nature_juridique": "SAS",
                "activite_principale": "62.01Z",
                "tranche_effectif_salarie": "50-99",
                "etat_administratif": "A",
            }]
        })

        with patch("app.validators.gov_api_validator.httpx.AsyncClient") as mock_client_cls:
            mock_client = AsyncMock()
            mock_client.get = AsyncMock(return_value=api_response)
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=False)
            mock_client_cls.return_value = mock_client

            result = await validate_siren("443061841")

        assert result is not None
        assert result["siren"] == "443061841"
        assert result["nom"] == "ACME SAS"
        assert result["validated"] is True

    @pytest.mark.asyncio
    async def test_siren_not_found_empty_results(self):
        """SIREN valide format mais pas dans la base → None."""
        api_response = _mock_response(200, {"results": []})

        with patch("app.validators.gov_api_validator.httpx.AsyncClient") as mock_client_cls:
            mock_client = AsyncMock()
            mock_client.get = AsyncMock(return_value=api_response)
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=False)
            mock_client_cls.return_value = mock_client

            result = await validate_siren("999999999")

        assert result is None

    @pytest.mark.asyncio
    async def test_siren_invalid_format_too_short(self):
        """SIREN avec moins de 9 chiffres → None sans appel API."""
        result = await validate_siren("12345")
        assert result is None

    @pytest.mark.asyncio
    async def test_siren_invalid_format_letters(self):
        """SIREN avec des lettres → None."""
        result = await validate_siren("ABCDEFGHI")
        assert result is None

    @pytest.mark.asyncio
    async def test_siren_invalid_format_too_long(self):
        """SIREN avec plus de 9 chiffres → None."""
        result = await validate_siren("1234567890")
        assert result is None

    @pytest.mark.asyncio
    async def test_siren_with_spaces(self):
        """SIREN avec espaces — nettoyage automatique."""
        api_response = _mock_response(200, {
            "results": [{
                "siren": "443061841",
                "nom_complet": "ACME",
                "nature_juridique": "",
                "activite_principale": "",
                "tranche_effectif_salarie": "",
                "etat_administratif": "A",
            }]
        })

        with patch("app.validators.gov_api_validator.httpx.AsyncClient") as mock_client_cls:
            mock_client = AsyncMock()
            mock_client.get = AsyncMock(return_value=api_response)
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=False)
            mock_client_cls.return_value = mock_client

            result = await validate_siren("443 061 841")

        assert result is not None
        assert result["siren"] == "443061841"

    @pytest.mark.asyncio
    async def test_siren_api_timeout(self):
        """Timeout API → None."""
        with patch("app.validators.gov_api_validator.httpx.AsyncClient") as mock_client_cls:
            mock_client = AsyncMock()
            mock_client.get = AsyncMock(side_effect=httpx.TimeoutException("timeout"))
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=False)
            mock_client_cls.return_value = mock_client

            result = await validate_siren("443061841")

        assert result is None

    @pytest.mark.asyncio
    async def test_siren_api_http_error(self):
        """Erreur HTTP 500 → None."""
        api_response = _mock_response(500)

        with patch("app.validators.gov_api_validator.httpx.AsyncClient") as mock_client_cls:
            mock_client = AsyncMock()
            mock_client.get = AsyncMock(return_value=api_response)
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=False)
            mock_client_cls.return_value = mock_client

            result = await validate_siren("443061841")

        assert result is None

    @pytest.mark.asyncio
    async def test_siren_no_exact_match(self):
        """API retourne des resultats mais aucun ne matche exactement le SIREN → None."""
        api_response = _mock_response(200, {
            "results": [{"siren": "999999999", "nom_complet": "Other Corp"}]
        })

        with patch("app.validators.gov_api_validator.httpx.AsyncClient") as mock_client_cls:
            mock_client = AsyncMock()
            mock_client.get = AsyncMock(return_value=api_response)
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=False)
            mock_client_cls.return_value = mock_client

            result = await validate_siren("443061841")

        assert result is None


# ── validate_siret ───────────────────────────────────────────────────


class TestValidateSiret:

    @pytest.mark.asyncio
    async def test_valid_siret_delegates_to_siren(self):
        """SIRET valide → extrait SIREN et valide via validate_siren."""
        with patch("app.validators.gov_api_validator.validate_siren", new_callable=AsyncMock) as mock_siren:
            mock_siren.return_value = {
                "siren": "443061841",
                "nom": "ACME",
                "validated": True,
            }

            result = await validate_siret("44306184100015")

        assert result is not None
        assert result["siret"] == "44306184100015"
        assert result["validated"] is True
        mock_siren.assert_awaited_once_with("443061841")

    @pytest.mark.asyncio
    async def test_siret_invalid_format_too_short(self):
        """SIRET avec moins de 14 chiffres → None."""
        result = await validate_siret("4430618410001")
        assert result is None

    @pytest.mark.asyncio
    async def test_siret_invalid_format_letters(self):
        """SIRET avec des lettres → None."""
        result = await validate_siret("ABCDEFGHIJKLMN")
        assert result is None

    @pytest.mark.asyncio
    async def test_siret_invalid_format_too_long(self):
        """SIRET avec plus de 14 chiffres → None."""
        result = await validate_siret("443061841000151")
        assert result is None

    @pytest.mark.asyncio
    async def test_siret_siren_not_found(self):
        """SIRET valide format mais SIREN non trouve → None."""
        with patch("app.validators.gov_api_validator.validate_siren", new_callable=AsyncMock) as mock_siren:
            mock_siren.return_value = None

            result = await validate_siret("44306184100015")

        assert result is None


# ── validate_address ─────────────────────────────────────────────────


class TestValidateAddress:

    @pytest.mark.asyncio
    async def test_valid_address_high_score(self):
        """Adresse avec score eleve → retourne dict."""
        api_response = _mock_response(200, {
            "features": [{
                "properties": {
                    "label": "12 Rue de la Paix, 75002 Paris",
                    "city": "Paris",
                    "postcode": "75002",
                    "score": 0.92,
                    "type": "housenumber",
                },
            }]
        })

        with patch("app.validators.gov_api_validator.httpx.AsyncClient") as mock_client_cls:
            mock_client = AsyncMock()
            mock_client.get = AsyncMock(return_value=api_response)
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=False)
            mock_client_cls.return_value = mock_client

            result = await validate_address("12 rue de la Paix 75002 Paris")

        assert result is not None
        assert result["city"] == "Paris"
        assert result["score"] == 0.92
        assert result["validated"] is True

    @pytest.mark.asyncio
    async def test_address_low_score(self):
        """Adresse avec score < 0.5 → None."""
        api_response = _mock_response(200, {
            "features": [{
                "properties": {
                    "label": "Somewhere",
                    "city": "Unknown",
                    "postcode": "00000",
                    "score": 0.3,
                    "type": "street",
                },
            }]
        })

        with patch("app.validators.gov_api_validator.httpx.AsyncClient") as mock_client_cls:
            mock_client = AsyncMock()
            mock_client.get = AsyncMock(return_value=api_response)
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=False)
            mock_client_cls.return_value = mock_client

            result = await validate_address("adresse vague quelque part")

        assert result is None

    @pytest.mark.asyncio
    async def test_address_too_short(self):
        """Adresse trop courte (< 5 chars) → None sans appel API."""
        result = await validate_address("ab")
        assert result is None

    @pytest.mark.asyncio
    async def test_address_empty(self):
        """Adresse vide → None."""
        result = await validate_address("")
        assert result is None

    @pytest.mark.asyncio
    async def test_address_none(self):
        """Adresse None → None."""
        result = await validate_address(None)
        assert result is None

    @pytest.mark.asyncio
    async def test_address_api_timeout(self):
        """Timeout geocodage → None."""
        with patch("app.validators.gov_api_validator.httpx.AsyncClient") as mock_client_cls:
            mock_client = AsyncMock()
            mock_client.get = AsyncMock(side_effect=httpx.TimeoutException("timeout"))
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=False)
            mock_client_cls.return_value = mock_client

            result = await validate_address("12 rue de la Paix 75002 Paris")

        assert result is None

    @pytest.mark.asyncio
    async def test_address_no_features(self):
        """API retourne pas de features → None."""
        api_response = _mock_response(200, {"features": []})

        with patch("app.validators.gov_api_validator.httpx.AsyncClient") as mock_client_cls:
            mock_client = AsyncMock()
            mock_client.get = AsyncMock(return_value=api_response)
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=False)
            mock_client_cls.return_value = mock_client

            result = await validate_address("une adresse inconnue quelque part")

        assert result is None

    @pytest.mark.asyncio
    async def test_address_api_http_error(self):
        """Erreur HTTP geocodage → None."""
        api_response = _mock_response(503)

        with patch("app.validators.gov_api_validator.httpx.AsyncClient") as mock_client_cls:
            mock_client = AsyncMock()
            mock_client.get = AsyncMock(return_value=api_response)
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=False)
            mock_client_cls.return_value = mock_client

            result = await validate_address("12 rue de la Paix 75002 Paris")

        assert result is None


# ── validate_detections ──────────────────────────────────────────────


class TestValidateDetections:

    @pytest.mark.asyncio
    async def test_boost_confidence_for_validated_siren(self):
        """SIREN valide par API → confidence +15, method +gov_validated."""
        det = FakeDetection(
            category="COMPANY_CONFIDENTIAL",
            confidence=60,
            method="presidio_fr_siren",
            snippet="SIREN: 443061841",
        )

        with patch("app.validators.gov_api_validator.validate_siren", new_callable=AsyncMock) as mock_siren:
            mock_siren.return_value = {"siren": "443061841", "validated": True}

            result = await validate_detections([det])

        assert result[0].confidence == 75  # 60 + 15
        assert "+gov_validated" in result[0].method

    @pytest.mark.asyncio
    async def test_reduce_confidence_for_not_found_siren(self):
        """SIREN non trouve par API → confidence -20, method +gov_not_found."""
        det = FakeDetection(
            category="COMPANY_CONFIDENTIAL",
            confidence=60,
            method="presidio_fr_siren",
            snippet="SIREN: 999999999",
        )

        with patch("app.validators.gov_api_validator.validate_siren", new_callable=AsyncMock) as mock_siren:
            mock_siren.return_value = None

            result = await validate_detections([det])

        assert result[0].confidence == 40  # 60 - 20
        assert "+gov_not_found" in result[0].method

    @pytest.mark.asyncio
    async def test_boost_confidence_for_validated_address(self):
        """Adresse validee par API → confidence +10, method +gov_validated."""
        det = FakeDetection(
            category="PERSONAL_DATA",
            confidence=50,
            method="presidio_fr_address",
            snippet="[FR_ADDRESS] 12 rue de la Paix 75002 Paris",
        )

        with patch("app.validators.gov_api_validator.validate_address", new_callable=AsyncMock) as mock_addr:
            mock_addr.return_value = {"label": "12 Rue de la Paix", "validated": True}

            result = await validate_detections([det])

        assert result[0].confidence == 60  # 50 + 10
        assert "+gov_validated" in result[0].method

    @pytest.mark.asyncio
    async def test_empty_detections_list(self):
        """Liste vide → retourne liste vide sans appels API."""
        result = await validate_detections([])
        assert result == []

    @pytest.mark.asyncio
    async def test_mixed_detections_some_validatable(self):
        """Detections mixtes — seules les validables sont traitees."""
        det_siren = FakeDetection(
            category="COMPANY_CONFIDENTIAL",
            confidence=60,
            method="presidio_fr_siren",
            snippet="SIREN: 443061841",
        )
        det_email = FakeDetection(
            category="PERSONAL_DATA",
            confidence=80,
            method="presidio_email",
            snippet="test@example.com",
        )
        det_address = FakeDetection(
            category="PERSONAL_DATA",
            confidence=50,
            method="presidio_fr_address",
            snippet="[FR_ADDRESS] 12 rue de la Paix 75002 Paris",
        )

        with patch("app.validators.gov_api_validator.validate_siren", new_callable=AsyncMock) as mock_siren, \
             patch("app.validators.gov_api_validator.validate_address", new_callable=AsyncMock) as mock_addr:
            mock_siren.return_value = {"siren": "443061841", "validated": True}
            mock_addr.return_value = {"label": "12 Rue de la Paix", "validated": True}

            result = await validate_detections([det_siren, det_email, det_address])

        # SIREN boosted
        assert result[0].confidence == 75
        assert "+gov_validated" in result[0].method
        # Email unchanged
        assert result[1].confidence == 80
        assert "+gov" not in result[1].method
        # Address boosted
        assert result[2].confidence == 60
        assert "+gov_validated" in result[2].method

    @pytest.mark.asyncio
    async def test_non_validatable_detections_unchanged(self):
        """Detections sans methode validable → inchangees."""
        det = FakeDetection(
            category="CREDENTIALS_SECRETS",
            confidence=90,
            method="llm_guard_secrets",
            snippet="API_KEY=sk-xxx",
        )

        result = await validate_detections([det])

        assert result[0].confidence == 90
        assert result[0].method == "llm_guard_secrets"

    @pytest.mark.asyncio
    async def test_siret_validation(self):
        """SIRET valide par API → confidence +15."""
        det = FakeDetection(
            category="COMPANY_CONFIDENTIAL",
            confidence=55,
            method="presidio_fr_siret",
            snippet="SIRET: 44306184100015",
        )

        with patch("app.validators.gov_api_validator.validate_siret", new_callable=AsyncMock) as mock_siret:
            mock_siret.return_value = {"siret": "44306184100015", "validated": True}

            result = await validate_detections([det])

        assert result[0].confidence == 70  # 55 + 15
        assert "+gov_validated" in result[0].method

    @pytest.mark.asyncio
    async def test_confidence_clamped_at_100(self):
        """Boost ne depasse pas 100."""
        det = FakeDetection(
            category="COMPANY_CONFIDENTIAL",
            confidence=95,
            method="presidio_fr_siren",
            snippet="SIREN: 443061841",
        )

        with patch("app.validators.gov_api_validator.validate_siren", new_callable=AsyncMock) as mock_siren:
            mock_siren.return_value = {"siren": "443061841", "validated": True}

            result = await validate_detections([det])

        assert result[0].confidence == 100  # min(100, 95 + 15)

    @pytest.mark.asyncio
    async def test_confidence_floored_at_10(self):
        """Reduction ne descend pas sous 10."""
        det = FakeDetection(
            category="COMPANY_CONFIDENTIAL",
            confidence=15,
            method="presidio_fr_siren",
            snippet="SIREN: 999999999",
        )

        with patch("app.validators.gov_api_validator.validate_siren", new_callable=AsyncMock) as mock_siren:
            mock_siren.return_value = None

            result = await validate_detections([det])

        assert result[0].confidence == 10  # max(10, 15 - 20)

    @pytest.mark.asyncio
    async def test_validation_exception_ignored(self):
        """Exception pendant validation → detection inchangee."""
        det = FakeDetection(
            category="COMPANY_CONFIDENTIAL",
            confidence=60,
            method="presidio_fr_siren",
            snippet="SIREN: 443061841",
        )

        with patch("app.validators.gov_api_validator.validate_siren", new_callable=AsyncMock) as mock_siren:
            mock_siren.side_effect = Exception("network error")

            result = await validate_detections([det])

        # Detection unchanged — exception was caught by gather(return_exceptions=True)
        assert result[0].confidence == 60
