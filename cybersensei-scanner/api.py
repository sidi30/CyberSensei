"""
CyberSensei Scanner API — FastAPI wrapper pour le scanner de sécurité.
Expose les fonctions de scan via une API REST.
"""

import asyncio
import logging
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field

from scanner import scan
from score_engine import compute_score

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger("cybersensei-scanner-api")

# Stockage en mémoire des scans en cours
_active_scans: dict[str, dict] = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Scanner API démarré")
    yield
    logger.info("Scanner API arrêté")


app = FastAPI(
    title="CyberSensei Scanner API",
    description="API REST pour le scanner de sécurité infrastructure",
    version="1.0.0",
    lifespan=lifespan,
)


class ScanRequest(BaseModel):
    domain: str = Field(..., description="Domaine cible à scanner", examples=["example.com"])
    emails: list[str] = Field(default=[], description="Emails à vérifier dans les breaches HIBP")
    callback_url: Optional[str] = Field(None, description="URL de callback pour notification de fin de scan")


class ScanResponse(BaseModel):
    domain: str
    score: int
    details: dict
    timestamp: str


class ScanStatusResponse(BaseModel):
    domain: str
    status: str
    result: Optional[ScanResponse] = None


@app.get("/health")
async def health():
    return {"status": "ok", "service": "cybersensei-scanner"}


@app.post("/api/scan", response_model=ScanResponse)
async def run_scan(request: ScanRequest):
    """Lance un scan synchrone et retourne les résultats."""
    try:
        logger.info("Scan demandé pour %s", request.domain)
        result = await scan(request.domain, request.emails)
        return ScanResponse(
            domain=result["domain"],
            score=result["score"],
            details=result["details"],
            timestamp=result["timestamp"],
        )
    except Exception as exc:
        logger.error("Erreur lors du scan de %s: %s", request.domain, exc)
        raise HTTPException(status_code=500, detail=str(exc))


async def _background_scan(domain: str, emails: list[str], callback_url: Optional[str]):
    """Exécute un scan en arrière-plan."""
    scan_key = domain
    try:
        _active_scans[scan_key] = {"status": "in_progress", "result": None}
        result = await scan(domain, emails)
        _active_scans[scan_key] = {"status": "completed", "result": result}

        if callback_url:
            import httpx
            try:
                async with httpx.AsyncClient() as client:
                    await client.post(callback_url, json=result, timeout=10)
            except Exception as exc:
                logger.error("Callback échoué pour %s: %s", callback_url, exc)

    except Exception as exc:
        logger.error("Scan background échoué pour %s: %s", domain, exc)
        _active_scans[scan_key] = {"status": "failed", "result": {"error": str(exc)}}


@app.post("/api/scan/async", status_code=202)
async def run_scan_async(request: ScanRequest, background_tasks: BackgroundTasks):
    """Lance un scan asynchrone en arrière-plan."""
    logger.info("Scan async demandé pour %s", request.domain)
    background_tasks.add_task(_background_scan, request.domain, request.emails, request.callback_url)
    return {"message": "Scan lancé", "domain": request.domain, "status": "in_progress"}


@app.get("/api/scan/status/{domain}", response_model=ScanStatusResponse)
async def get_scan_status(domain: str):
    """Vérifie le statut d'un scan en cours."""
    scan_info = _active_scans.get(domain)
    if not scan_info:
        raise HTTPException(status_code=404, detail=f"Aucun scan trouvé pour {domain}")

    result = None
    if scan_info["status"] == "completed" and scan_info.get("result"):
        r = scan_info["result"]
        result = ScanResponse(
            domain=r["domain"],
            score=r["score"],
            details=r["details"],
            timestamp=r["timestamp"],
        )

    return ScanStatusResponse(
        domain=domain,
        status=scan_info["status"],
        result=result,
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003)
