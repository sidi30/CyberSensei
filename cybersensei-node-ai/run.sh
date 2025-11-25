#!/bin/bash
# Startup script for CyberSensei AI Service
# Launches llama.cpp server and FastAPI wrapper

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════╗"
echo "║       CyberSensei AI Service Startup          ║"
echo "╚═══════════════════════════════════════════════╝"
echo -e "${NC}"

# Configuration
MODEL_PATH="${MODEL_PATH:-/app/models/mistral-7b-instruct.Q4_K_M.gguf}"
LLAMA_HOST="${LLAMA_HOST:-127.0.0.1}"
LLAMA_PORT="${LLAMA_PORT:-8001}"
API_PORT="${API_PORT:-8000}"
CONTEXT_SIZE="${CONTEXT_SIZE:-4096}"
THREADS="${THREADS:-4}"

echo -e "${YELLOW}📋 Configuration:${NC}"
echo "  Model: $MODEL_PATH"
echo "  llama.cpp: $LLAMA_HOST:$LLAMA_PORT"
echo "  FastAPI: 0.0.0.0:$API_PORT"
echo "  Context: $CONTEXT_SIZE tokens"
echo "  Threads: $THREADS"
echo ""

# Check if model exists
if [ ! -f "$MODEL_PATH" ]; then
    echo -e "${RED}❌ Error: Model file not found at $MODEL_PATH${NC}"
    echo ""
    echo -e "${YELLOW}Please download the model:${NC}"
    echo "  1. Visit: https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF"
    echo "  2. Download: mistral-7b-instruct-v0.2.Q4_K_M.gguf"
    echo "  3. Place it at: $MODEL_PATH"
    echo ""
    echo "Or use this command:"
    echo "  wget https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF/resolve/main/mistral-7b-instruct-v0.2.Q4_K_M.gguf -O $MODEL_PATH"
    exit 1
fi

# Get model size
MODEL_SIZE=$(du -h "$MODEL_PATH" | cut -f1)
echo -e "${GREEN}✅ Model found: $MODEL_SIZE${NC}"
echo ""

# Start llama.cpp server in background
echo -e "${YELLOW}🚀 Starting llama.cpp server...${NC}"
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
echo -e "${GREEN}✅ llama.cpp started (PID: $LLAMA_PID)${NC}"

# Wait a bit for llama.cpp to initialize
sleep 3

# Start FastAPI server
echo -e "${YELLOW}🚀 Starting FastAPI server...${NC}"
python3 server.py &

API_PID=$!
echo -e "${GREEN}✅ FastAPI started (PID: $API_PID)${NC}"
echo ""

# Trap signals to gracefully shutdown
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Shutting down services...${NC}"
    kill $API_PID 2>/dev/null || true
    kill $LLAMA_PID 2>/dev/null || true
    echo -e "${GREEN}✅ Services stopped${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Keep script running and monitor processes
echo -e "${GREEN}✅ All services running${NC}"
echo -e "${BLUE}📡 Endpoints:${NC}"
echo "  FastAPI: http://0.0.0.0:$API_PORT"
echo "  Health:  http://0.0.0.0:$API_PORT/health"
echo "  Chat:    POST http://0.0.0.0:$API_PORT/api/ai/chat"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
echo ""

# Monitor processes
while true; do
    if ! kill -0 $LLAMA_PID 2>/dev/null; then
        echo -e "${RED}❌ llama.cpp server died${NC}"
        kill $API_PID 2>/dev/null || true
        exit 1
    fi
    
    if ! kill -0 $API_PID 2>/dev/null; then
        echo -e "${RED}❌ FastAPI server died${NC}"
        kill $LLAMA_PID 2>/dev/null || true
        exit 1
    fi
    
    sleep 5
done


