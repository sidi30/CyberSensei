# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CyberSensei Teams App Module - Variables
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# ─────────────────────────────────────────────────────────────────────────────
# Network Configuration
# ─────────────────────────────────────────────────────────────────────────────

variable "network_name" {
  description = "Docker network name"
  type        = string
}

variable "container_prefix" {
  description = "Prefix for container names"
  type        = string
}

variable "common_labels" {
  description = "Common labels to apply to all resources"
  type        = map(string)
  default     = {}
}

# ─────────────────────────────────────────────────────────────────────────────
# Hostnames
# ─────────────────────────────────────────────────────────────────────────────

variable "bot_host" {
  description = "Hostname for bot (Traefik routing)"
  type        = string
}

variable "tabs_host" {
  description = "Hostname for tabs (Traefik routing)"
  type        = string
}

# ─────────────────────────────────────────────────────────────────────────────
# Ports
# ─────────────────────────────────────────────────────────────────────────────

variable "bot_port" {
  description = "Host port for bot"
  type        = number
  default     = 3978
}

variable "tabs_port" {
  description = "Host port for tabs"
  type        = number
  default     = 5175
}

# ─────────────────────────────────────────────────────────────────────────────
# Microsoft Azure Configuration
# ─────────────────────────────────────────────────────────────────────────────

variable "bot_id" {
  description = "Microsoft Bot ID"
  type        = string
  default     = ""
}

variable "bot_password" {
  description = "Microsoft Bot Password"
  type        = string
  default     = ""
  sensitive   = true
}

variable "microsoft_app_id" {
  description = "Microsoft App ID (Azure AD)"
  type        = string
  default     = ""
}

variable "microsoft_app_password" {
  description = "Microsoft App Password (Azure AD)"
  type        = string
  default     = ""
  sensitive   = true
}

variable "microsoft_app_tenant_id" {
  description = "Microsoft Tenant ID (Azure AD)"
  type        = string
  default     = ""
}

# ─────────────────────────────────────────────────────────────────────────────
# Backend Configuration
# ─────────────────────────────────────────────────────────────────────────────

variable "backend_url" {
  description = "URL of the CyberSensei Node backend"
  type        = string
  default     = "http://cybersensei-node-backend:8080"
}

# ─────────────────────────────────────────────────────────────────────────────
# Image Configuration
# ─────────────────────────────────────────────────────────────────────────────

variable "use_remote_images" {
  description = "Whether to use remote images or local builds"
  type        = bool
  default     = false
}

variable "bot_image_remote" {
  description = "Remote image for bot"
  type        = string
  default     = "ghcr.io/cybersensei/teams-bot:latest"
}

variable "bot_image_local" {
  description = "Local image for bot"
  type        = string
  default     = "cybersensei-teams-bot:local"
}

variable "tabs_image_remote" {
  description = "Remote image for tabs"
  type        = string
  default     = "ghcr.io/cybersensei/teams-tabs:latest"
}

variable "tabs_image_local" {
  description = "Local image for tabs"
  type        = string
  default     = "cybersensei-teams-tabs:local"
}
