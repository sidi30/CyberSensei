"""
Tests unitaires pour les endpoints FastAPI.
Mock des layers ML pour eviter le chargement de modeles lourds.
"""

import pytest
import pytest_asyncio
from unittest.mock import patch, AsyncMock, MagicMock

import httpx
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.analyzers.rgpd_article9 import Article9Result


# ── Helpers ──────────────────────────────────────────────────────────


class FakeDetection:
    """Objet detection minimal pour les tests."""

    def __init__(self, category: str, confidence: int, method: str, snippet: str = ""):
        self.category = category
        self.confidence = confidence
        self.method = method
        self.snippet = snippet


# ── Fixtures ─────────────────────────────────────────────────────────


@pytest_asyncio.fixture
async def client():
    """Client HTTP asynchrone pour tester les endpoints sans lifespan."""
    transport = ASGITransport(app=app, raise_app_exceptions=False)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


# ── GET / ────────────────────────────────────────────────────────────


class TestRootEndpoint:

    @pytest.mark.asyncio
    async def test_root_returns_service_info(self, client):
        """GET / → retourne les infos du service avec architecture."""
        resp = await client.get("/")
        assert resp.status_code == 200
        data = resp.json()
        assert data["service"] == "CyberSensei AI Security"
        assert data["version"] == "2.0.0"
        assert "architecture" in data
        assert "layer_1" in data["architecture"]
        assert "layer_2" in data["architecture"]
        assert "validation" in data["architecture"]

    @pytest.mark.asyncio
    async def test_root_contains_endpoints(self, client):
        """GET / → contient la liste des endpoints."""
        resp = await client.get("/")
        data = resp.json()
        assert "endpoints" in data
        assert "analyze" in data["endpoints"]
        assert "health" in data["endpoints"]

    @pytest.mark.asyncio
    async def test_root_contains_rgpd_article9(self, client):
        """GET / → contient les categories Art. 9."""
        resp = await client.get("/")
        data = resp.json()
        assert "rgpd_article9" in data
        assert "HEALTH_DATA" in data["rgpd_article9"]
        assert len(data["rgpd_article9"]) == 8


# ── GET /health ──────────────────────────────────────────────────────


class TestHealthEndpoint:

    @pytest.mark.asyncio
    async def test_health_layer1_ready(self, client):
        """GET /health avec layer1 initialise → status healthy."""
        mock_l1 = MagicMock()

        with patch("app.main.layer1", mock_l1), \
             patch("app.main.mistral_available", False), \
             patch("app.recognizers.fr_recognizers.get_all_fr_recognizers", return_value=[1, 2, 3]):
            resp = await client.get("/health")

        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "healthy"
        assert data["layer1"] == "ready"
        assert data["layer2_mistral"] == "unavailable"

    @pytest.mark.asyncio
    async def test_health_layer1_not_initialized(self, client):
        """GET /health sans layer1 → status degraded."""
        with patch("app.main.layer1", None), \
             patch("app.main.mistral_available", False), \
             patch("app.recognizers.fr_recognizers.get_all_fr_recognizers", return_value=[]):
            resp = await client.get("/health")

        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "degraded"
        assert data["layer1"] == "not_initialized"


# ── POST /api/analyze ────────────────────────────────────────────────


class TestAnalyzeEndpoint:

    @pytest.mark.asyncio
    async def test_empty_prompt_returns_422(self, client):
        """POST /api/analyze avec prompt vide → 422 validation error."""
        resp = await client.post("/api/analyze", json={"prompt": ""})
        assert resp.status_code == 422

    @pytest.mark.asyncio
    async def test_missing_prompt_returns_422(self, client):
        """POST /api/analyze sans prompt → 422."""
        resp = await client.post("/api/analyze", json={})
        assert resp.status_code == 422

    @pytest.mark.asyncio
    async def test_safe_prompt_returns_zero_score(self, client):
        """Prompt safe → score 0, pas de detections."""
        mock_l1 = MagicMock()
        mock_l1.analyze.return_value = ([], "bonjour", 0.0)

        with patch("app.main.layer1", mock_l1), \
             patch("app.main.mistral_available", False), \
             patch("app.main.GOV_API_VALIDATION_ENABLED", False):
            resp = await client.post("/api/analyze", json={"prompt": "bonjour"})

        assert resp.status_code == 200
        data = resp.json()
        assert data["risk_score"] == 0
        assert data["risk_level"] == "SAFE"
        assert data["detections"] == []

    @pytest.mark.asyncio
    async def test_prompt_with_detections(self, client):
        """Prompt avec donnees sensibles → retourne les detections."""
        det = FakeDetection("PERSONAL_DATA", 70, "presidio_person", "Jean Dupont")
        mock_l1 = MagicMock()
        mock_l1.analyze.return_value = ([det], "****", 0.5)

        with patch("app.main.layer1", mock_l1), \
             patch("app.main.mistral_available", False), \
             patch("app.main.GOV_API_VALIDATION_ENABLED", False):
            resp = await client.post("/api/analyze", json={"prompt": "Jean Dupont habite ici"})

        assert resp.status_code == 200
        data = resp.json()
        assert data["risk_score"] > 0
        assert len(data["detections"]) == 1
        assert data["detections"][0]["category"] == "PERSONAL_DATA"
        assert data["detections"][0]["confidence"] == 70

    @pytest.mark.asyncio
    async def test_layer2_disabled_only_l1_results(self, client):
        """Mistral indisponible → seuls les resultats Layer 1."""
        det = FakeDetection("CREDENTIALS_SECRETS", 85, "llm_guard_secrets", "API_KEY=sk-xxx")
        mock_l1 = MagicMock()
        mock_l1.analyze.return_value = ([det], "****", 0.6)

        with patch("app.main.layer1", mock_l1), \
             patch("app.main.mistral_available", False), \
             patch("app.main.GOV_API_VALIDATION_ENABLED", False):
            resp = await client.post("/api/analyze", json={"prompt": "my API_KEY=sk-xxx"})

        assert resp.status_code == 200
        data = resp.json()
        assert data["semantic_analysis"] is None
        assert data["article9_detected"] is False
        assert len(data["detections"]) == 1

    @pytest.mark.asyncio
    async def test_analyze_with_source(self, client):
        """POST /api/analyze avec source → accepte le champ."""
        mock_l1 = MagicMock()
        mock_l1.analyze.return_value = ([], "hello", 0.0)

        with patch("app.main.layer1", mock_l1), \
             patch("app.main.mistral_available", False), \
             patch("app.main.GOV_API_VALIDATION_ENABLED", False):
            resp = await client.post("/api/analyze", json={
                "prompt": "hello",
                "source": "CHATGPT",
            })

        assert resp.status_code == 200

    @pytest.mark.asyncio
    async def test_sanitized_prompt_returned_when_different(self, client):
        """Si le prompt est anonymise, sanitized_prompt est retourne."""
        det = FakeDetection("PERSONAL_DATA", 70, "presidio_person", "Jean Dupont")
        mock_l1 = MagicMock()
        mock_l1.analyze.return_value = ([det], "<PERSON>", 0.5)

        with patch("app.main.layer1", mock_l1), \
             patch("app.main.mistral_available", False), \
             patch("app.main.GOV_API_VALIDATION_ENABLED", False):
            resp = await client.post("/api/analyze", json={"prompt": "Jean Dupont"})

        assert resp.status_code == 200
        data = resp.json()
        assert data["sanitized_prompt"] == "<PERSON>"

    @pytest.mark.asyncio
    async def test_sanitized_prompt_none_when_same(self, client):
        """Si le prompt n'est pas modifie, sanitized_prompt est None."""
        mock_l1 = MagicMock()
        mock_l1.analyze.return_value = ([], "bonjour", 0.0)

        with patch("app.main.layer1", mock_l1), \
             patch("app.main.mistral_available", False), \
             patch("app.main.GOV_API_VALIDATION_ENABLED", False):
            resp = await client.post("/api/analyze", json={"prompt": "bonjour"})

        assert resp.status_code == 200
        data = resp.json()
        assert data["sanitized_prompt"] is None


# ── POST /api/validate ───────────────────────────────────────────────


class TestValidateEndpoint:

    @pytest.mark.asyncio
    async def test_validate_siren(self, client):
        """POST /api/validate avec SIREN → appelle validate_siren."""
        with patch("app.main.validate_siren", new_callable=AsyncMock) as mock_siren:
            mock_siren.return_value = {"siren": "443061841", "validated": True}

            resp = await client.post("/api/validate", json={
                "entity_type": "SIREN",
                "value": "443061841",
            })

        assert resp.status_code == 200
        data = resp.json()
        assert data["validated"] is True
        assert data["entity_type"] == "SIREN"
        mock_siren.assert_awaited_once_with("443061841")

    @pytest.mark.asyncio
    async def test_validate_siret(self, client):
        """POST /api/validate avec SIRET → appelle validate_siret."""
        with patch("app.main.validate_siret", new_callable=AsyncMock) as mock_siret:
            mock_siret.return_value = {"siret": "44306184100015", "validated": True}

            resp = await client.post("/api/validate", json={
                "entity_type": "SIRET",
                "value": "44306184100015",
            })

        assert resp.status_code == 200
        data = resp.json()
        assert data["validated"] is True

    @pytest.mark.asyncio
    async def test_validate_address(self, client):
        """POST /api/validate avec ADDRESS → appelle validate_address."""
        with patch("app.main.validate_address", new_callable=AsyncMock) as mock_addr:
            mock_addr.return_value = {"label": "12 Rue de la Paix", "validated": True}

            resp = await client.post("/api/validate", json={
                "entity_type": "ADDRESS",
                "value": "12 rue de la Paix 75002 Paris",
            })

        assert resp.status_code == 200
        data = resp.json()
        assert data["validated"] is True

    @pytest.mark.asyncio
    async def test_validate_unsupported_type_returns_400(self, client):
        """POST /api/validate avec type non supporte → 400."""
        resp = await client.post("/api/validate", json={
            "entity_type": "PASSPORT",
            "value": "12AB34567",
        })
        assert resp.status_code == 400

    @pytest.mark.asyncio
    async def test_validate_not_found(self, client):
        """POST /api/validate avec SIREN non trouve → validated=False."""
        with patch("app.main.validate_siren", new_callable=AsyncMock) as mock_siren:
            mock_siren.return_value = None

            resp = await client.post("/api/validate", json={
                "entity_type": "SIREN",
                "value": "999999999",
            })

        assert resp.status_code == 200
        data = resp.json()
        assert data["validated"] is False
        assert data["details"] is None

    @pytest.mark.asyncio
    async def test_validate_case_insensitive_type(self, client):
        """POST /api/validate avec type en minuscules → fonctionne."""
        with patch("app.main.validate_siren", new_callable=AsyncMock) as mock_siren:
            mock_siren.return_value = {"siren": "443061841", "validated": True}

            resp = await client.post("/api/validate", json={
                "entity_type": "siren",
                "value": "443061841",
            })

        assert resp.status_code == 200
        data = resp.json()
        assert data["validated"] is True

    @pytest.mark.asyncio
    async def test_validate_empty_value_returns_422(self, client):
        """POST /api/validate avec valeur vide → 422."""
        resp = await client.post("/api/validate", json={
            "entity_type": "SIREN",
            "value": "",
        })
        assert resp.status_code == 422
