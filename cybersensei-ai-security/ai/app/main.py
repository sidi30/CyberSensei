"""
CyberSensei AI Security Service — Point d'entrée FastAPI.

Architecture dual-layer conforme RGPD :
  Layer 1 : Presidio (NER/BERT + recognizers FR) + LLM Guard (secrets, code)
  Layer 2 : Mistral 7B (analyse sémantique + classification RGPD Art. 9)
"""

import asyncio
from contextlib import asynccontextmanager
from typing import List, Optional

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from loguru import logger
from pydantic import BaseModel, Field

from app.analyzers.llm_guard_analyzer import LlmGuardAnalyzer
from app.analyzers.mistral_analyzer import MistralAnalyzer
from app.validators.gov_api_validator import validate_detections
from app.utils.scoring import compute_combined_score
from app.config import (
    API_PORT, LLAMA_URL, MODEL_PATH, SEMANTIC_THRESHOLD,
    GOV_API_VALIDATION_ENABLED,
)


# ── Pydantic models ─────────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=50000)
    source: Optional[str] = Field(None, description="LLM cible (CHATGPT, GEMINI, etc.)")


class DetectionResponse(BaseModel):
    category: str
    confidence: int = Field(ge=0, le=100)
    method: str
    snippet: Optional[str] = None


class AnalyzeResponse(BaseModel):
    risk_score: int = Field(ge=0, le=100)
    risk_level: str
    detections: List[DetectionResponse] = []
    sanitized_prompt: Optional[str] = None
    semantic_analysis: Optional[str] = None
    article9_detected: bool = False
    article9_categories: List[str] = []


class HealthResponse(BaseModel):
    status: str
    layer1: str
    layer2_mistral: str
    model_path: str
    recognizers_fr: int


# ── Globals ──────────────────────────────────────────────────────────

layer1: Optional[LlmGuardAnalyzer] = None
layer2: Optional[MistralAnalyzer] = None
mistral_available: bool = False


# ── Lifespan ─────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    global layer1, layer2, mistral_available

    logger.info("Demarrage CyberSensei AI Security Service")
    logger.info(f"Model: {MODEL_PATH}")
    logger.info(f"Mistral: {LLAMA_URL}")
    logger.info(f"Seuil semantique: {SEMANTIC_THRESHOLD}")

    # Layer 1 : Presidio + LLM Guard (toujours disponible)
    layer1 = LlmGuardAnalyzer()
    logger.info("Layer 1 pret (Presidio FR + LLM Guard)")

    # Layer 2 : Mistral (attente du serveur)
    layer2 = MistralAnalyzer()
    mistral_available = await _wait_for_mistral()
    if mistral_available:
        logger.info("Layer 2 pret (Mistral 7B + RGPD Art. 9)")
    else:
        logger.warning("Layer 2 indisponible — mode degrade (Layer 1 seul)")

    logger.info("Service pret")
    yield

    logger.info("Arret du service")
    if layer2:
        await layer2.close()


async def _wait_for_mistral(max_attempts: int = 30, delay: int = 2) -> bool:
    """Attend que le serveur llama.cpp soit prêt."""
    for attempt in range(max_attempts):
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(f"{LLAMA_URL}/health")
                if resp.status_code == 200:
                    return True
        except Exception:
            pass
        await asyncio.sleep(delay)
    return False


# ── App ──────────────────────────────────────────────────────────────

app = FastAPI(
    title="CyberSensei AI Security",
    description="DLP dual-layer conforme RGPD : Presidio FR + Mistral semantique",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Endpoints ────────────────────────────────────────────────────────

PII_ENTITY_TYPES = {"PERSON", "EMAIL_ADDRESS", "PHONE_NUMBER", "FR_NIR", "FR_CARTE_VITALE"}


@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze_prompt(request: AnalyzeRequest) -> AnalyzeResponse:
    """
    Analyse dual-layer d'un prompt.
    Layer 1 (Presidio+LLM Guard) : toujours actif, ~5-20ms
    Layer 2 (Mistral) : conditionnel si score L1 > seuil ou prompt long
    """
    text = request.prompt
    logger.info(f"Analyse prompt ({len(text)} chars) depuis {request.source or 'inconnu'}")

    # ── Layer 1 ──
    l1_detections, sanitized, l1_score = layer1.analyze(text)
    logger.info(f"L1: {len(l1_detections)} detections, score={l1_score:.2f}")

    # Vérifier si des PII identifiants ont été trouvés
    has_pii = any(d.method.startswith("presidio_") and
                  any(e in d.method for e in ["person", "email", "phone", "fr_nir"])
                  for d in l1_detections)

    # ── Layer 2 (conditionnel) ──
    l2_detections = []
    article9_result = None
    semantic_explanation = None
    l1_pct = int(l1_score * 100)

    should_run_l2 = (
        mistral_available
        and (l1_pct >= SEMANTIC_THRESHOLD or len(text) > 500)
    )

    if should_run_l2:
        try:
            l2_dets, art9, explanation = await layer2.analyze(text, has_pii_from_layer1=has_pii)
            l2_detections = l2_dets
            article9_result = art9
            semantic_explanation = explanation
            logger.info(f"L2: {len(l2_detections)} detections, art9={art9.has_article9_data}")
        except Exception as e:
            logger.error(f"L2 erreur: {e}")
            semantic_explanation = "Analyse semantique indisponible"
    else:
        if not mistral_available:
            logger.info("L2 ignore (Mistral indisponible)")
        else:
            logger.info("L2 ignore (sous le seuil)")

    # ── Validation via APIs État français (SIREN/SIRET, adresses) ──
    if GOV_API_VALIDATION_ENABLED and l1_detections:
        try:
            l1_detections = await validate_detections(l1_detections)
            logger.info("Validation API État terminée")
        except Exception as e:
            logger.warning(f"Validation API État échouée (ignorée): {e}")

    # ── Scoring combiné ──
    from app.analyzers.rgpd_article9 import Article9Result
    if article9_result is None:
        article9_result = Article9Result()

    risk_score, risk_level = compute_combined_score(
        l1_detections=l1_detections,
        l1_score=l1_score,
        l2_detections=l2_detections,
        article9_result=article9_result,
        has_pii_in_l1=has_pii,
    )

    # ── Construire la réponse ──
    all_detections = []
    for d in l1_detections + l2_detections:
        all_detections.append(DetectionResponse(
            category=d.category,
            confidence=d.confidence,
            method=d.method,
            snippet=d.snippet,
        ))

    art9_cats = [c.type for c in article9_result.categories] if article9_result.has_article9_data else []

    logger.info(f"Resultat: score={risk_score}, level={risk_level}, detections={len(all_detections)}, art9={art9_cats}")

    return AnalyzeResponse(
        risk_score=risk_score,
        risk_level=risk_level,
        detections=all_detections,
        sanitized_prompt=sanitized if sanitized != text else None,
        semantic_analysis=semantic_explanation,
        article9_detected=article9_result.has_article9_data,
        article9_categories=art9_cats,
    )


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    """Vérification de santé du service."""
    l1_status = "ready" if layer1 else "not_initialized"

    l2_status = "unknown"
    if mistral_available:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(f"{LLAMA_URL}/health")
                l2_status = "healthy" if resp.status_code == 200 else "unhealthy"
        except Exception:
            l2_status = "unavailable"
    else:
        l2_status = "unavailable"

    from app.recognizers.fr_recognizers import get_all_fr_recognizers
    n_recognizers = len(get_all_fr_recognizers())

    return HealthResponse(
        status="healthy" if l1_status == "ready" else "degraded",
        layer1=l1_status,
        layer2_mistral=l2_status,
        model_path=MODEL_PATH,
        recognizers_fr=n_recognizers,
    )


class ValidateEntityRequest(BaseModel):
    entity_type: str = Field(..., description="Type: SIREN, SIRET, ADDRESS")
    value: str = Field(..., min_length=1)


@app.post("/api/validate")
async def validate_entity(request: ValidateEntityRequest):
    """
    Valide une entité française via les APIs de l'État.
    Utile pour le dashboard ou validation manuelle.
    """
    from app.validators.gov_api_validator import validate_siren, validate_siret, validate_address

    entity_type = request.entity_type.upper()
    if entity_type == "SIREN":
        result = await validate_siren(request.value)
    elif entity_type == "SIRET":
        result = await validate_siret(request.value)
    elif entity_type == "ADDRESS":
        result = await validate_address(request.value)
    else:
        raise HTTPException(400, f"Type non supporté: {entity_type}. Utilisez SIREN, SIRET ou ADDRESS.")

    return {
        "entity_type": entity_type,
        "value": request.value,
        "validated": result is not None,
        "details": result,
    }


@app.get("/")
async def root():
    return {
        "service": "CyberSensei AI Security",
        "version": "2.0.0",
        "architecture": {
            "layer_1": "Presidio (NER/BERT + 8 recognizers FR) + LLM Guard (secrets, code)",
            "layer_2": "Mistral 7B (semantique + RGPD Art. 9)",
            "validation": "APIs État français (Recherche Entreprises, Geoplateforme)",
        },
        "rgpd_article9": [
            "HEALTH_DATA", "POLITICAL_OPINION", "UNION_MEMBERSHIP",
            "RELIGIOUS_BELIEF", "SEXUAL_ORIENTATION", "ETHNIC_ORIGIN",
            "BIOMETRIC_DATA", "CRIMINAL_DATA",
        ],
        "endpoints": {
            "analyze": "POST /api/analyze",
            "health": "GET /health",
        },
    }


@app.exception_handler(Exception)
async def global_exception_handler(request, exc: Exception):
    logger.error(f"Erreur non geree: {exc}")
    return JSONResponse(
        status_code=500,
        content={"error": "Erreur interne", "detail": str(exc)},
    )
