# ============================================================================
# CyberSensei Node - Installation Script (PowerShell)
# ============================================================================
# This script checks Docker, configures environment, and starts services
# Requires: Docker Desktop for Windows

param(
    [switch]$SkipBuild = $false,
    [switch]$Dev = $false
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$ComposeDir = Join-Path $ProjectRoot "compose"

# ============================================================================
# Helper Functions
# ============================================================================

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    } catch {
        return $false
    }
}

# ============================================================================
# System Check
# ============================================================================

Write-Info "Starting CyberSensei Node installation..."
Write-Info "Checking system requirements..."

# Check Docker
if (-not (Test-Command "docker")) {
    Write-Error "Docker is not installed"
    Write-Info "Please install Docker Desktop for Windows:"
    Write-Info "https://docs.docker.com/desktop/install/windows-install/"
    exit 1
}
Write-Success "Docker is installed"

# Check Docker daemon
try {
    docker ps | Out-Null
    Write-Success "Docker daemon is running"
} catch {
    Write-Error "Docker daemon is not running"
    Write-Info "Please start Docker Desktop"
    exit 1
}

# Check Docker Compose
try {
    docker compose version | Out-Null
    Write-Success "Docker Compose is available"
} catch {
    Write-Error "Docker Compose plugin not found"
    Write-Info "Please update Docker Desktop to the latest version"
    exit 1
}

# ============================================================================
# Environment Configuration
# ============================================================================

Write-Info "Configuring environment..."

Set-Location $ComposeDir

if (-not (Test-Path ".env")) {
    if (Test-Path "ENV_TEMPLATE") {
        Write-Info "Creating .env from ENV_TEMPLATE..."
        Copy-Item "ENV_TEMPLATE" ".env"
        Write-Warning "Please edit .env and configure your settings"
        Write-Warning "Important: Change default passwords and secrets!"
        
        $response = Read-Host "Open .env for editing now? (y/n)"
        if ($response -eq "y" -or $response -eq "Y") {
            notepad .env
        }
    } else {
        Write-Error "ENV_TEMPLATE not found"
        exit 1
    }
} else {
    Write-Success ".env already exists"
}

# ============================================================================
# Pre-pull Images
# ============================================================================

$response = Read-Host "Pre-pull Docker images? (Recommended) (y/n)"
if ($response -eq "y" -or $response -eq "Y") {
    Write-Info "Pulling images..."
    try {
        docker compose pull
        Write-Success "Images pulled"
    } catch {
        Write-Warning "Some images may need to be built"
    }
}

# ============================================================================
# Build Services
# ============================================================================

if (-not $SkipBuild) {
    Write-Info "Building services..."
    try {
        docker compose build
        Write-Success "Services built successfully"
    } catch {
        Write-Error "Build failed"
        Write-Info "Check logs above for details"
        exit 1
    }
}

# ============================================================================
# Start Services
# ============================================================================

Write-Info "Starting services..."

$profile = if ($Dev) { "--profile dev" } else { "" }

try {
    if ($profile) {
        docker compose $profile.Split() up -d
    } else {
        docker compose up -d
    }
    Write-Success "Services started"
} catch {
    Write-Error "Failed to start services"
    Write-Info "Check logs with: docker compose logs"
    exit 1
}

# ============================================================================
# Wait for Services
# ============================================================================

Write-Info "Waiting for services to be healthy..."
Write-Info "This may take 1-2 minutes..."

$maxRetries = 60
$backendReady = $false

for ($i = 1; $i -le $maxRetries; $i++) {
    $status = docker compose ps backend 2>$null
    if ($status -match "healthy") {
        $backendReady = $true
        break
    }
    Write-Host "." -NoNewline
    Start-Sleep -Seconds 2
}

Write-Host ""

if ($backendReady) {
    Write-Success "Backend is healthy"
} else {
    Write-Warning "Backend health check timed out"
    Write-Info "Check logs with: docker compose logs backend"
}

# ============================================================================
# Status Check
# ============================================================================

Write-Info "Service status:"
docker compose ps

# ============================================================================
# Success Message
# ============================================================================

Write-Host ""
Write-Success "CyberSensei Node installation complete!"
Write-Host ""
Write-Info "Access the services:"
Write-Host "  - Dashboard: http://localhost:3005"
Write-Host "  - Backend API: http://localhost:8080"
Write-Host "  - API Docs: http://localhost:8080/swagger-ui.html"
Write-Host "  - Health: http://localhost:8080/actuator/health"
Write-Host ""
Write-Info "Useful commands:"
Write-Host "  - View logs: docker compose logs -f"
Write-Host "  - Stop services: docker compose down"
Write-Host "  - Restart: docker compose restart"
Write-Host "  - Update: docker compose pull; docker compose up -d"
Write-Host ""
Write-Info "For debug tools (MailCatcher, PgAdmin):"
Write-Host "  docker compose --profile dev up -d"
Write-Host "  - MailCatcher: http://localhost:1080"
Write-Host "  - PgAdmin: http://localhost:5050"
Write-Host ""

if (-not $backendReady) {
    Write-Warning "Some services may still be starting. Monitor with:"
    Write-Info "  docker compose logs -f"
}

Write-Success "Installation script completed"

