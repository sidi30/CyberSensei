#!/bin/bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CyberSensei Local Infrastructure - Bootstrap Script
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# This script builds local Docker images from source

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}      CyberSensei Local Docker Images Builder${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Configuration
IMAGE_PREFIX="cybersensei"
TAG="local"

# ─────────────────────────────────────────────────────────────────────────────
# Build Central Backend (NestJS)
# ─────────────────────────────────────────────────────────────────────────────
build_central_backend() {
    echo -e "\n${YELLOW}[1/5] Building Central Backend...${NC}"
    
    CENTRAL_BACKEND_PATH="$PROJECT_ROOT/cybersensei-central/backend"
    
    if [ -d "$CENTRAL_BACKEND_PATH" ]; then
        docker build \
            -t "${IMAGE_PREFIX}-central-backend:${TAG}" \
            -f "$CENTRAL_BACKEND_PATH/Dockerfile" \
            "$CENTRAL_BACKEND_PATH"
        echo -e "${GREEN}✓ Central Backend built successfully${NC}"
    else
        echo -e "${RED}✗ Central Backend not found at $CENTRAL_BACKEND_PATH${NC}"
        return 1
    fi
}

# ─────────────────────────────────────────────────────────────────────────────
# Build Central Dashboard (React)
# ─────────────────────────────────────────────────────────────────────────────
build_central_dashboard() {
    echo -e "\n${YELLOW}[2/5] Building Central Dashboard...${NC}"
    
    CENTRAL_DASHBOARD_PATH="$PROJECT_ROOT/cybersensei-central/dashboard"
    
    if [ -d "$CENTRAL_DASHBOARD_PATH" ]; then
        docker build \
            -t "${IMAGE_PREFIX}-central-dashboard:${TAG}" \
            -f "$CENTRAL_DASHBOARD_PATH/Dockerfile" \
            "$CENTRAL_DASHBOARD_PATH"
        echo -e "${GREEN}✓ Central Dashboard built successfully${NC}"
    else
        echo -e "${RED}✗ Central Dashboard not found at $CENTRAL_DASHBOARD_PATH${NC}"
        return 1
    fi
}

# ─────────────────────────────────────────────────────────────────────────────
# Build Node Backend (Spring Boot)
# ─────────────────────────────────────────────────────────────────────────────
build_node_backend() {
    echo -e "\n${YELLOW}[3/5] Building Node Backend...${NC}"
    
    NODE_BACKEND_PATH="$PROJECT_ROOT/cybersensei-node/backend"
    
    if [ -d "$NODE_BACKEND_PATH" ]; then
        # Build with Maven first if needed
        if [ -f "$NODE_BACKEND_PATH/pom.xml" ]; then
            echo "  Building JAR with Maven..."
            (cd "$NODE_BACKEND_PATH" && mvn clean package -DskipTests -q)
        fi
        
        docker build \
            -t "${IMAGE_PREFIX}-node-backend:${TAG}" \
            -f "$NODE_BACKEND_PATH/Dockerfile" \
            "$NODE_BACKEND_PATH"
        echo -e "${GREEN}✓ Node Backend built successfully${NC}"
    else
        echo -e "${RED}✗ Node Backend not found at $NODE_BACKEND_PATH${NC}"
        return 1
    fi
}

# ─────────────────────────────────────────────────────────────────────────────
# Build Node Dashboard (React)
# ─────────────────────────────────────────────────────────────────────────────
build_node_dashboard() {
    echo -e "\n${YELLOW}[4/5] Building Node Dashboard...${NC}"
    
    NODE_DASHBOARD_PATH="$PROJECT_ROOT/cybersensei-node/dashboard"
    
    if [ -d "$NODE_DASHBOARD_PATH" ]; then
        docker build \
            -t "${IMAGE_PREFIX}-node-dashboard:${TAG}" \
            -f "$NODE_DASHBOARD_PATH/Dockerfile" \
            "$NODE_DASHBOARD_PATH"
        echo -e "${GREEN}✓ Node Dashboard built successfully${NC}"
    else
        echo -e "${RED}✗ Node Dashboard not found at $NODE_DASHBOARD_PATH${NC}"
        return 1
    fi
}

# ─────────────────────────────────────────────────────────────────────────────
# Build Node AI Service
# ─────────────────────────────────────────────────────────────────────────────
build_node_ai() {
    echo -e "\n${YELLOW}[5/5] Building Node AI Service...${NC}"
    
    NODE_AI_PATH="$PROJECT_ROOT/cybersensei-node/ai"
    
    if [ -d "$NODE_AI_PATH" ]; then
        docker build \
            -t "${IMAGE_PREFIX}-node-ai:${TAG}" \
            -f "$NODE_AI_PATH/Dockerfile" \
            "$NODE_AI_PATH"
        echo -e "${GREEN}✓ Node AI built successfully${NC}"
    else
        echo -e "${YELLOW}⚠ Node AI not found at $NODE_AI_PATH - Using placeholder${NC}"
        # Create a simple placeholder image
        echo "FROM python:3.11-slim
RUN pip install flask
RUN echo 'from flask import Flask, jsonify; app = Flask(__name__); @app.route(\"/health\"); def health(): return jsonify({\"status\": \"ok\"}); app.run(host=\"0.0.0.0\", port=8000) if __name__ == \"__main__\" else None' > /app.py
EXPOSE 8000
CMD [\"python\", \"/app.py\"]" | docker build -t "${IMAGE_PREFIX}-node-ai:${TAG}" -
    fi
}

# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────
main() {
    echo -e "\n${BLUE}Project root: $PROJECT_ROOT${NC}\n"

    # Parse arguments
    BUILD_ALL=true
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --central-backend)
                BUILD_ALL=false
                build_central_backend
                ;;
            --central-dashboard)
                BUILD_ALL=false
                build_central_dashboard
                ;;
            --node-backend)
                BUILD_ALL=false
                build_node_backend
                ;;
            --node-dashboard)
                BUILD_ALL=false
                build_node_dashboard
                ;;
            --node-ai)
                BUILD_ALL=false
                build_node_ai
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --central-backend    Build Central Backend only"
                echo "  --central-dashboard  Build Central Dashboard only"
                echo "  --node-backend       Build Node Backend only"
                echo "  --node-dashboard     Build Node Dashboard only"
                echo "  --node-ai            Build Node AI only"
                echo "  --help               Show this help"
                echo ""
                echo "Without options, builds all images."
                exit 0
                ;;
            *)
                echo -e "${RED}Unknown option: $1${NC}"
                exit 1
                ;;
        esac
        shift
    done

    if [ "$BUILD_ALL" = true ]; then
        build_central_backend || true
        build_central_dashboard || true
        build_node_backend || true
        build_node_dashboard || true
        build_node_ai || true
    fi

    echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}      Build Complete!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    echo -e "\n${BLUE}Built images:${NC}"
    docker images | grep "${IMAGE_PREFIX}" | grep "${TAG}"
    
    echo -e "\n${BLUE}Next steps:${NC}"
    echo "  1. cd infra/terraform-local"
    echo "  2. terraform init"
    echo "  3. terraform apply"
}

main "$@"

