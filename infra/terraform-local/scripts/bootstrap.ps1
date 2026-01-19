# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CyberSensei Local Infrastructure - Bootstrap Script (Windows)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# This script builds local Docker images from source

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = (Get-Item "$ScriptDir\..\..\..").FullName

$ImagePrefix = "cybersensei"
$Tag = "local"

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "      CyberSensei Local Docker Images Builder (Windows)" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "Project root: $ProjectRoot" -ForegroundColor Gray
Write-Host ""

# ─────────────────────────────────────────────────────────────────────────────
# Build Functions
# ─────────────────────────────────────────────────────────────────────────────

function Build-CentralBackend {
    Write-Host "`n[1/5] Building Central Backend..." -ForegroundColor Yellow
    
    $Path = "$ProjectRoot\cybersensei-central\backend"
    
    if (Test-Path $Path) {
        docker build -t "${ImagePrefix}-central-backend:${Tag}" -f "$Path\Dockerfile" $Path
        Write-Host "✓ Central Backend built successfully" -ForegroundColor Green
    } else {
        Write-Host "✗ Central Backend not found at $Path" -ForegroundColor Red
    }
}

function Build-CentralDashboard {
    Write-Host "`n[2/5] Building Central Dashboard..." -ForegroundColor Yellow
    
    $Path = "$ProjectRoot\cybersensei-central\dashboard"
    
    if (Test-Path $Path) {
        docker build -t "${ImagePrefix}-central-dashboard:${Tag}" -f "$Path\Dockerfile" $Path
        Write-Host "✓ Central Dashboard built successfully" -ForegroundColor Green
    } else {
        Write-Host "✗ Central Dashboard not found at $Path" -ForegroundColor Red
    }
}

function Build-NodeBackend {
    Write-Host "`n[3/5] Building Node Backend..." -ForegroundColor Yellow
    
    $Path = "$ProjectRoot\cybersensei-node\backend"
    
    if (Test-Path $Path) {
        docker build -t "${ImagePrefix}-node-backend:${Tag}" -f "$Path\Dockerfile" $Path
        Write-Host "✓ Node Backend built successfully" -ForegroundColor Green
    } else {
        Write-Host "✗ Node Backend not found at $Path" -ForegroundColor Red
    }
}

function Build-NodeDashboard {
    Write-Host "`n[4/5] Building Node Dashboard..." -ForegroundColor Yellow
    
    $Path = "$ProjectRoot\cybersensei-node\dashboard"
    
    if (Test-Path $Path) {
        docker build -t "${ImagePrefix}-node-dashboard:${Tag}" -f "$Path\Dockerfile" $Path
        Write-Host "✓ Node Dashboard built successfully" -ForegroundColor Green
    } else {
        Write-Host "✗ Node Dashboard not found at $Path" -ForegroundColor Red
    }
}

function Build-NodeAI {
    Write-Host "`n[5/5] Building Node AI Service..." -ForegroundColor Yellow
    
    $Path = "$ProjectRoot\cybersensei-node\ai"
    
    if (Test-Path $Path) {
        docker build -t "${ImagePrefix}-node-ai:${Tag}" -f "$Path\Dockerfile" $Path
        Write-Host "✓ Node AI built successfully" -ForegroundColor Green
    } else {
        Write-Host "⚠ Node AI not found - creating placeholder" -ForegroundColor Yellow
        
        # Create placeholder AI service
        $PlaceholderDockerfile = @"
FROM python:3.11-slim
RUN pip install flask
COPY <<EOF /app.py
from flask import Flask, jsonify
app = Flask(__name__)

@app.route('/health')
def health():
    return jsonify({"status": "ok"})

@app.route('/api/generate', methods=['POST'])
def generate():
    return jsonify({"response": "AI service placeholder"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
EOF
EXPOSE 8000
CMD ["python", "/app.py"]
"@
        
        $TempDir = New-TemporaryFile | ForEach-Object { Remove-Item $_; New-Item -ItemType Directory -Path $_ }
        $PlaceholderDockerfile | Out-File -FilePath "$TempDir\Dockerfile" -Encoding utf8
        
        docker build -t "${ImagePrefix}-node-ai:${Tag}" $TempDir
        
        Remove-Item -Recurse -Force $TempDir
    }
}

# ─────────────────────────────────────────────────────────────────────────────
# Pre-flight checks
# ─────────────────────────────────────────────────────────────────────────────

Write-Host "Checking Docker..." -ForegroundColor Gray
try {
    docker info | Out-Null
    Write-Host "✓ Docker is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker is not running. Please start Docker Desktop." -ForegroundColor Red
    exit 1
}

# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────

$BuildAll = $true

if ($args.Count -gt 0) {
    $BuildAll = $false
    
    foreach ($arg in $args) {
        switch ($arg) {
            "--central-backend"   { Build-CentralBackend }
            "--central-dashboard" { Build-CentralDashboard }
            "--node-backend"      { Build-NodeBackend }
            "--node-dashboard"    { Build-NodeDashboard }
            "--node-ai"           { Build-NodeAI }
            "--help" {
                Write-Host @"
Usage: .\bootstrap.ps1 [OPTIONS]

Options:
  --central-backend    Build Central Backend only
  --central-dashboard  Build Central Dashboard only
  --node-backend       Build Node Backend only
  --node-dashboard     Build Node Dashboard only
  --node-ai            Build Node AI only
  --help               Show this help

Without options, builds all images.
"@
                exit 0
            }
            default {
                Write-Host "Unknown option: $arg" -ForegroundColor Red
                exit 1
            }
        }
    }
}

if ($BuildAll) {
    Build-CentralBackend
    Build-CentralDashboard
    Build-NodeBackend
    Build-NodeDashboard
    Build-NodeAI
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "      Build Complete!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green

Write-Host "`nBuilt images:" -ForegroundColor Cyan
docker images | Select-String $ImagePrefix | Select-String $Tag

Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "  1. cd infra\terraform-local"
Write-Host "  2. terraform init"
Write-Host "  3. terraform apply"

