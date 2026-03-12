#!/bin/bash
# =============================================================================
# CyberSensei - Server Hardening Script
# =============================================================================
# Execute sur le serveur AVANT le deploiement.
# Usage: sudo bash scripts/server-hardening.sh
#
# Ce script configure :
#   1. UFW Firewall (seuls ports 22, 80, 443)
#   2. fail2ban (anti brute-force SSH)
#   3. SSH hardening (cle uniquement, pas de root)
#   4. Sysctl network hardening
#   5. Automatic security updates
# =============================================================================

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()  { echo -e "${GREEN}[+]${NC} $1"; }
warn() { echo -e "${YELLOW}[!]${NC} $1"; }
err()  { echo -e "${RED}[x]${NC} $1"; exit 1; }
info() { echo -e "${BLUE}[i]${NC} $1"; }

[[ $EUID -eq 0 ]] || err "Ce script doit etre execute en tant que root (sudo)"

info "=== CyberSensei Server Hardening ==="
echo ""

# =============================================================================
# 1. UFW FIREWALL
# =============================================================================
info "--- Firewall UFW ---"

apt-get install -y ufw > /dev/null 2>&1
log "UFW installe"

# Reset rules
ufw --force reset > /dev/null 2>&1

# Default policies
ufw default deny incoming
ufw default allow outgoing

# Allow only essential ports
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP (Traefik)'
ufw allow 443/tcp comment 'HTTPS (Traefik)'

# Enable
ufw --force enable
log "UFW active : seuls ports 22, 80, 443 ouverts"
ufw status numbered
echo ""

# =============================================================================
# 2. FAIL2BAN
# =============================================================================
info "--- fail2ban ---"

apt-get install -y fail2ban > /dev/null 2>&1
log "fail2ban installe"

cat > /etc/fail2ban/jail.local << 'FAIL2BAN'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5
backend = systemd
banaction = ufw

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 7200
FAIL2BAN

systemctl enable fail2ban
systemctl restart fail2ban
log "fail2ban configure : 3 echecs SSH = ban 2h"
echo ""

# =============================================================================
# 3. SSH HARDENING
# =============================================================================
info "--- SSH Hardening ---"

SSHD_CONFIG="/etc/ssh/sshd_config"
cp "$SSHD_CONFIG" "${SSHD_CONFIG}.backup.$(date +%Y%m%d)"

# Apply hardening (only if not already set)
apply_ssh_config() {
  local key="$1"
  local value="$2"
  if grep -qE "^\s*${key}\s+" "$SSHD_CONFIG"; then
    sed -i "s/^\s*${key}\s.*/${key} ${value}/" "$SSHD_CONFIG"
  else
    echo "${key} ${value}" >> "$SSHD_CONFIG"
  fi
}

apply_ssh_config "PermitRootLogin" "no"
apply_ssh_config "PasswordAuthentication" "no"
apply_ssh_config "MaxAuthTries" "3"
apply_ssh_config "LoginGraceTime" "30"
apply_ssh_config "X11Forwarding" "no"
apply_ssh_config "AllowTcpForwarding" "yes"
apply_ssh_config "ClientAliveInterval" "300"
apply_ssh_config "ClientAliveCountMax" "2"
apply_ssh_config "Protocol" "2"

# Verify config before restarting
if sshd -t; then
  systemctl restart sshd
  log "SSH durci : root interdit, mot de passe interdit, 3 tentatives max"
else
  cp "${SSHD_CONFIG}.backup."* "$SSHD_CONFIG"
  warn "Config SSH invalide — restauree depuis backup"
fi
echo ""

# =============================================================================
# 4. SYSCTL NETWORK HARDENING
# =============================================================================
info "--- Sysctl Network Hardening ---"

cat > /etc/sysctl.d/99-cybersensei-security.conf << 'SYSCTL'
# Disable IP forwarding (not a router)
net.ipv4.ip_forward = 0

# Disable ICMP redirect acceptance
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv6.conf.all.accept_redirects = 0

# Disable source routing
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0

# Enable SYN cookies (SYN flood protection)
net.ipv4.tcp_syncookies = 1

# Log martian packets
net.ipv4.conf.all.log_martians = 1
net.ipv4.conf.default.log_martians = 1

# Ignore ICMP broadcast requests
net.ipv4.icmp_echo_ignore_broadcasts = 1

# Ignore bogus ICMP responses
net.ipv4.icmp_ignore_bogus_error_responses = 1

# Enable reverse path filtering (anti-spoofing)
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1

# Disable IPv6 if not needed
net.ipv6.conf.all.disable_ipv6 = 1
net.ipv6.conf.default.disable_ipv6 = 1
SYSCTL

sysctl --system > /dev/null 2>&1
log "Sysctl durci : SYN cookies, anti-spoofing, ICMP restreint"
echo ""

# =============================================================================
# 5. AUTOMATIC SECURITY UPDATES
# =============================================================================
info "--- Mises a jour automatiques ---"

apt-get install -y unattended-upgrades > /dev/null 2>&1

cat > /etc/apt/apt.conf.d/20auto-upgrades << 'AUTOUPDATE'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::AutocleanInterval "7";
AUTOUPDATE

log "Mises a jour de securite automatiques activees"
echo ""

# =============================================================================
# SUMMARY
# =============================================================================
info "=== Hardening termine ==="
echo ""
log "UFW           : Ports 22, 80, 443 uniquement"
log "fail2ban      : SSH brute-force protection (ban 2h apres 3 echecs)"
log "SSH           : Root interdit, password interdit, cle SSH obligatoire"
log "Sysctl        : SYN cookies, anti-spoofing, ICMP restreint"
log "Auto-updates  : Patchs de securite automatiques"
echo ""
warn "IMPORTANT : Assurez-vous d'avoir une cle SSH configuree avant de vous deconnecter !"
warn "Testez la connexion SSH dans un nouveau terminal avant de fermer la session."
echo ""
info "Prochaine etape : configurez Cloudflare pour masquer l'IP du serveur."
