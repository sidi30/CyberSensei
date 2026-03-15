# ── Stage 1: Build llama.cpp ─────────────────────────────────────────
FROM python:3.11-slim AS builder

LABEL maintainer="CyberSensei Team"
LABEL version="2.0.0"
LABEL description="AI Security DLP - Presidio FR + LLM Guard + Mistral 7B"

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential cmake git wget curl libcurl4-openssl-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build
RUN git clone --depth 1 https://github.com/ggerganov/llama.cpp.git && \
    cd llama.cpp && mkdir build && cd build && \
    cmake .. -DLLAMA_BUILD_SERVER=ON && \
    cmake --build . --config Release -j$(nproc)

# ── Stage 2: Runtime ─────────────────────────────────────────────────
FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

RUN useradd -m -u 1001 aiuser

WORKDIR /app

# Copy llama-server binary
COPY --from=builder /build/llama.cpp/build/bin/llama-server /app/llama-server
RUN chmod +x /app/llama-server

# Install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download spaCy French model (pour NER Presidio)
RUN python -m spacy download fr_core_news_lg && \
    python -m spacy download en_core_web_lg

# Pre-download LLM Guard / Presidio NER models (évite cold start)
RUN python -c "\
from presidio_analyzer import AnalyzerEngine; \
engine = AnalyzerEngine(); \
print('Presidio models cached'); \
from llm_guard.input_scanners import Secrets, Code; \
Secrets(redact_mode='all'); \
Code(languages=['Python'], is_blocked=True); \
print('LLM Guard models cached')"

# Copy application
COPY server.py .
COPY run.sh .
COPY app/ app/
RUN chmod +x run.sh

# Models directory
RUN mkdir -p /app/models && chown -R aiuser:aiuser /app

USER aiuser

EXPOSE 8000 8001

ENV PYTHONUNBUFFERED=1 \
    MODEL_PATH=/app/models/mistral-7b-instruct.Q4_K_M.gguf \
    LLAMA_HOST=127.0.0.1 \
    LLAMA_PORT=8001 \
    API_PORT=8000 \
    SEMANTIC_THRESHOLD=30

HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["./run.sh"]
