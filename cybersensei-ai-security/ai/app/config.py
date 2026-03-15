"""Configuration centralisée du service AI Security."""

import os


# ── Serveur ──
API_PORT: int = int(os.getenv("API_PORT", "8000"))

# ── Mistral / llama.cpp ──
LLAMA_HOST: str = os.getenv("LLAMA_HOST", "127.0.0.1")
LLAMA_PORT: int = int(os.getenv("LLAMA_PORT", "8001"))
LLAMA_URL: str = f"http://{LLAMA_HOST}:{LLAMA_PORT}"
MODEL_PATH: str = os.getenv("MODEL_PATH", "/app/models/mistral-7b-instruct.Q4_K_M.gguf")

# ── Seuils ──
SEMANTIC_THRESHOLD: int = int(os.getenv("SEMANTIC_THRESHOLD", "30"))
ARTICLE9_CONFIDENCE_MIN: float = float(os.getenv("ARTICLE9_CONFIDENCE_MIN", "0.8"))
ARTICLE9_SCORE_BOOST: int = int(os.getenv("ARTICLE9_SCORE_BOOST", "40"))
ARTICLE9_WITH_PII_BOOST: int = int(os.getenv("ARTICLE9_WITH_PII_BOOST", "60"))

# ── Langues ──
PRIMARY_LANGUAGE: str = "fr"
SUPPORTED_LANGUAGES: list[str] = ["fr", "en"]

# ── Validation APIs État français ──
GOV_API_VALIDATION_ENABLED: bool = os.getenv("GOV_API_VALIDATION", "true").lower() == "true"
