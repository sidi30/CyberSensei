# ============================================================================
# CyberSensei - Setup Coolify Port Proxy
# ============================================================================
# Run as Administrator after each WSL restart.
# Redirects Coolify ports from Windows localhost to WSL2 IP.
#
# Usage (PowerShell Admin):
#   .\scripts\setup-coolify-proxy.ps1
# ============================================================================

# Get WSL2 IP
$wslIp = (wsl hostname -I).Trim().Split(" ")[0]
if (-not $wslIp) {
    Write-Error "Cannot get WSL2 IP. Is WSL running?"
    exit 1
}
Write-Host "WSL2 IP: $wslIp" -ForegroundColor Cyan

# Clear old rules
netsh interface portproxy reset | Out-Null

# Coolify ports to forward
$ports = @(
    @{ port = 8000; desc = "Coolify Dashboard" },
    @{ port = 6001; desc = "Coolify Realtime" },
    @{ port = 6002; desc = "Coolify Realtime WS" }
)

foreach ($p in $ports) {
    netsh interface portproxy add v4tov4 `
        listenport=$($p.port) listenaddress=127.0.0.1 `
        connectport=$($p.port) connectaddress=$wslIp | Out-Null
    Write-Host "  localhost:$($p.port) -> ${wslIp}:$($p.port)  ($($p.desc))" -ForegroundColor Green
}

Write-Host ""
Write-Host "Port proxy configured. Coolify accessible at http://localhost:8000" -ForegroundColor Yellow
Write-Host ""

# Verify
netsh interface portproxy show all
