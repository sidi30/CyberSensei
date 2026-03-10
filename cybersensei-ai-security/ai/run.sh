#!/bin/bash
set -e

echo "========================================"
echo " CyberSensei AI Security Service v2.0"
echo " Layer 1: Presidio FR + LLM Guard"
echo " Layer 2: Mistral 7B (Semantic + RGPD Art.9)"
echo "========================================"

MODEL_PATH="${MODEL_PATH:-/app/models/mistral-7b-instruct.Q4_K_M.gguf}"
LLAMA_HOST="${LLAMA_HOST:-127.0.0.1}"
LLAMA_PORT="${LLAMA_PORT:-8001}"
API_PORT="${API_PORT:-8000}"
CONTEXT_SIZE="${CONTEXT_SIZE:-4096}"
THREADS="${THREADS:-4}"

echo ""
echo "Config:"
echo "  MODEL_PATH:         $MODEL_PATH"
echo "  LLAMA:              $LLAMA_HOST:$LLAMA_PORT"
echo "  API_PORT:           $API_PORT"
echo "  CONTEXT_SIZE:       $CONTEXT_SIZE"
echo "  THREADS:            $THREADS"
echo "  SEMANTIC_THRESHOLD: ${SEMANTIC_THRESHOLD:-30}"
echo ""

# Check if model exists
LLAMA_PID=""
if [ ! -f "$MODEL_PATH" ]; then
    echo "WARNING: Model not found at $MODEL_PATH"
    echo "Running in LAYER 1 ONLY mode (Presidio + LLM Guard)"
    echo ""
    echo "To enable Layer 2 (Mistral semantic analysis), download with:"
    echo "  wget -O models/mistral-7b-instruct.Q4_K_M.gguf \\"
    echo "    https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF/resolve/main/mistral-7b-instruct-v0.2.Q4_K_M.gguf"
    echo ""
    export LAYER2_ENABLED=false
else
    echo "Model size: $(du -h "$MODEL_PATH" | cut -f1)"
    echo ""
    export LAYER2_ENABLED=true

    # Start llama.cpp server (backend for Layer 2)
    echo "Starting llama.cpp server..."
    ./llama-server \
        --model "$MODEL_PATH" \
        --host "$LLAMA_HOST" \
        --port "$LLAMA_PORT" \
        --ctx-size "$CONTEXT_SIZE" \
        --threads "$THREADS" \
        --n-gpu-layers 0 \
        --log-disable \
        &
    LLAMA_PID=$!
    echo "llama.cpp started (PID: $LLAMA_PID)"

    sleep 3
fi

# Start FastAPI (orchestrates Layer 1 + optional Layer 2)
echo "Starting AI Security API..."
python3 server.py &
API_PID=$!
echo "API started (PID: $API_PID)"

echo ""
echo "Service ready:"
echo "  Analyze: POST http://0.0.0.0:$API_PORT/api/analyze"
echo "  Health:  GET  http://0.0.0.0:$API_PORT/health"
if [ "$LAYER2_ENABLED" = "false" ]; then
    echo "  Mode:    Layer 1 only (Presidio + LLM Guard)"
fi
echo ""

# Cleanup handler
cleanup() {
    echo ""
    echo "Shutting down..."
    kill $API_PID 2>/dev/null || true
    [ -n "$LLAMA_PID" ] && kill $LLAMA_PID 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM

# Monitor
while true; do
    if [ -n "$LLAMA_PID" ] && ! kill -0 $LLAMA_PID 2>/dev/null; then
        echo "llama.cpp died, shutting down"
        kill $API_PID 2>/dev/null || true
        exit 1
    fi
    if ! kill -0 $API_PID 2>/dev/null; then
        echo "API died, shutting down"
        [ -n "$LLAMA_PID" ] && kill $LLAMA_PID 2>/dev/null || true
        exit 1
    fi
    sleep 5
done
