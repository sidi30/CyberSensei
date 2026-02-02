#!/bin/bash

# ============================================================================
# CyberSensei Node - Installation Script
# ============================================================================
# This script installs Docker, pulls required images, and starts services
# Tested on: Ubuntu 20.04+, Debian 11+, CentOS 8+

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
COMPOSE_DIR="$PROJECT_ROOT/compose"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# Helper Functions
# ============================================================================

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_command() {
    if command -v "$1" &> /dev/null; then
        log_success "$1 is installed"
        return 0
    else
        log_warning "$1 is not installed"
        return 1
    fi
}

# ============================================================================
# System Check
# ============================================================================

log_info "Starting CyberSensei Node installation..."
log_info "Checking system requirements..."

# Check OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    log_success "OS: Linux detected"
    OS_TYPE="linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    log_success "OS: macOS detected"
    OS_TYPE="macos"
else
    log_error "Unsupported OS: $OSTYPE"
    exit 1
fi

# Check if running as root (needed for Docker installation)
if [[ $EUID -eq 0 ]]; then
    log_warning "Running as root"
    SUDO=""
else
    log_info "Running as non-root user"
    SUDO="sudo"
fi

# ============================================================================
# Docker Installation
# ============================================================================

install_docker() {
    log_info "Installing Docker..."
    
    if [[ "$OS_TYPE" == "linux" ]]; then
        # Detect Linux distribution
        if [ -f /etc/os-release ]; then
            . /etc/os-release
            DISTRO=$ID
        else
            log_error "Cannot detect Linux distribution"
            exit 1
        fi
        
        case "$DISTRO" in
            ubuntu|debian)
                log_info "Installing Docker on Ubuntu/Debian..."
                $SUDO apt-get update
                $SUDO apt-get install -y \
                    ca-certificates \
                    curl \
                    gnupg \
                    lsb-release
                
                # Add Docker's official GPG key
                $SUDO mkdir -p /etc/apt/keyrings
                curl -fsSL https://download.docker.com/linux/$DISTRO/gpg | $SUDO gpg --dearmor -o /etc/apt/keyrings/docker.gpg
                
                # Set up repository
                echo \
                  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/$DISTRO \
                  $(lsb_release -cs) stable" | $SUDO tee /etc/apt/sources.list.d/docker.list > /dev/null
                
                # Install Docker Engine
                $SUDO apt-get update
                $SUDO apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
                ;;
                
            centos|rhel|fedora)
                log_info "Installing Docker on CentOS/RHEL/Fedora..."
                $SUDO yum install -y yum-utils
                $SUDO yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
                $SUDO yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
                $SUDO systemctl start docker
                $SUDO systemctl enable docker
                ;;
                
            *)
                log_error "Unsupported Linux distribution: $DISTRO"
                log_info "Please install Docker manually: https://docs.docker.com/engine/install/"
                exit 1
                ;;
        esac
        
        # Add current user to docker group
        if [[ $EUID -ne 0 ]]; then
            $SUDO usermod -aG docker $USER
            log_warning "Added $USER to docker group. Please log out and log back in for changes to take effect."
        fi
        
    elif [[ "$OS_TYPE" == "macos" ]]; then
        log_warning "Please install Docker Desktop for Mac manually:"
        log_info "https://docs.docker.com/desktop/install/mac-install/"
        exit 1
    fi
    
    log_success "Docker installed successfully"
}

# Check Docker
if ! check_command docker; then
    read -p "Docker is not installed. Install now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        install_docker
    else
        log_error "Docker is required. Exiting."
        exit 1
    fi
fi

# Check Docker Compose
if ! check_command "docker compose"; then
    log_error "Docker Compose plugin not found"
    log_info "Please install Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

# Check Docker daemon
if ! docker ps &> /dev/null; then
    log_error "Docker daemon is not running"
    log_info "Starting Docker..."
    $SUDO systemctl start docker || {
        log_error "Failed to start Docker. Please start it manually."
        exit 1
    }
fi

log_success "Docker is ready"

# ============================================================================
# Environment Configuration
# ============================================================================

log_info "Configuring environment..."

cd "$COMPOSE_DIR"

if [ ! -f .env ]; then
    if [ -f ENV_TEMPLATE ]; then
        log_info "Creating .env from ENV_TEMPLATE..."
        cp ENV_TEMPLATE .env
        log_warning "Please edit .env and configure your settings before starting services"
        log_warning "Important: Change default passwords and secrets!"
        
        read -p "Open .env for editing now? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            ${EDITOR:-nano} .env
        fi
    else
        log_error "ENV_TEMPLATE not found"
        exit 1
    fi
else
    log_success ".env already exists"
fi

# ============================================================================
# Pre-pull Images (optional but recommended)
# ============================================================================

log_info "Do you want to pre-pull Docker images? (Recommended for production)"
log_info "This will download all required images before starting services."
read -p "Pre-pull images? (y/n) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    log_info "Pulling images..."
    docker compose pull || log_warning "Some images may need to be built"
    log_success "Images pulled"
fi

# ============================================================================
# Build Services
# ============================================================================

log_info "Building services..."
docker compose build || {
    log_error "Build failed"
    exit 1
}
log_success "Services built successfully"

# ============================================================================
# AI Model Download
# ============================================================================

log_info "Checking AI models..."
log_warning "The AI service requires Mistral 7B model (~4 GB)"
log_info "Model will be downloaded on first startup if not present"
log_info "You can pre-download it to:"
log_info "  Docker volume: cybersensei-ai-models"
log_info "  Or manually: docker run --rm -v cybersensei-ai-models:/models alpine sh"

# ============================================================================
# Start Services
# ============================================================================

log_info "Starting services..."
docker compose up -d || {
    log_error "Failed to start services"
    log_info "Check logs with: docker compose logs"
    exit 1
}

log_success "Services started"

# ============================================================================
# Wait for Services
# ============================================================================

log_info "Waiting for services to be healthy..."
log_info "This may take 1-2 minutes..."

# Wait for backend to be healthy
RETRIES=60
BACKEND_READY=false

for i in $(seq 1 $RETRIES); do
    if docker compose ps backend | grep -q "healthy"; then
        BACKEND_READY=true
        break
    fi
    echo -n "."
    sleep 2
done

echo ""

if [ "$BACKEND_READY" = true ]; then
    log_success "Backend is healthy"
else
    log_warning "Backend health check timed out"
    log_info "Check logs with: docker compose logs backend"
fi

# ============================================================================
# Status Check
# ============================================================================

log_info "Service status:"
docker compose ps

# ============================================================================
# Success Message
# ============================================================================

echo ""
log_success "CyberSensei Node installation complete!"
echo ""
log_info "Access the services:"
echo "  - Dashboard: http://localhost:3005"
echo "  - Backend API: http://localhost:8080"
echo "  - API Docs: http://localhost:8080/swagger-ui.html"
echo "  - Health: http://localhost:8080/actuator/health"
echo ""
log_info "Useful commands:"
echo "  - View logs: docker compose logs -f"
echo "  - Stop services: docker compose down"
echo "  - Restart: docker compose restart"
echo "  - Update: docker compose pull && docker compose up -d"
echo ""
log_info "For debug tools (MailCatcher, PgAdmin):"
echo "  docker compose --profile dev up -d"
echo "  - MailCatcher: http://localhost:1080"
echo "  - PgAdmin: http://localhost:5050"
echo ""

if [ "$BACKEND_READY" = false ]; then
    log_warning "Some services may still be starting. Monitor with:"
    log_info "  docker compose logs -f"
fi

log_success "Installation script completed"

