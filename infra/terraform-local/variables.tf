# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CyberSensei Local Infrastructure - Variables
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# ─────────────────────────────────────────────────────────────────────────────
# Docker Configuration
# ─────────────────────────────────────────────────────────────────────────────

variable "docker_host" {
  description = "Docker host connection string (auto-detected if not set)"
  type        = string
  # Windows default: npipe:////./pipe/docker_engine
  # Linux/Mac default: unix:///var/run/docker.sock
  default     = "npipe:////./pipe/docker_engine"  # Windows default
}

variable "project_name" {
  description = "Project name prefix for all resources"
  type        = string
  default     = "cybersensei"
}

# ─────────────────────────────────────────────────────────────────────────────
# Feature Toggles (Profiles)
# ─────────────────────────────────────────────────────────────────────────────

variable "deploy_central" {
  description = "Deploy CyberSensei Central (SaaS) stack"
  type        = bool
  default     = true
}

variable "deploy_node" {
  description = "Deploy CyberSensei Node (On-Prem) stack"
  type        = bool
  default     = true
}

variable "enable_monitoring" {
  description = "Enable monitoring stack (Prometheus, Grafana, Alertmanager)"
  type        = bool
  default     = true
}

variable "enable_mailhog" {
  description = "Enable Mailhog for SMTP testing"
  type        = bool
  default     = true
}

variable "use_remote_images" {
  description = "Use remote images from registry (false = build locally)"
  type        = bool
  default     = false
}

# ─────────────────────────────────────────────────────────────────────────────
# Network Configuration
# ─────────────────────────────────────────────────────────────────────────────

variable "http_port" {
  description = "Host port for HTTP traffic (Traefik)"
  type        = number
  default     = 8088
}

variable "https_port" {
  description = "Host port for HTTPS traffic (Traefik)"
  type        = number
  default     = 8443
}

variable "domain_suffix" {
  description = "Local domain suffix"
  type        = string
  default     = "local"
}

# ─────────────────────────────────────────────────────────────────────────────
# Image Configuration
# ─────────────────────────────────────────────────────────────────────────────

variable "registry" {
  description = "Container registry for remote images"
  type        = string
  default     = "ghcr.io/cybersensei"
}

variable "image_tag" {
  description = "Default image tag"
  type        = string
  default     = "latest"
}

# Local build paths (relative to terraform-local directory)
variable "central_backend_path" {
  description = "Path to Central backend source"
  type        = string
  default     = "../../cybersensei-central/backend"
}

variable "central_dashboard_path" {
  description = "Path to Central dashboard source"
  type        = string
  default     = "../../cybersensei-central/dashboard"
}

variable "node_backend_path" {
  description = "Path to Node backend source"
  type        = string
  default     = "../../cybersensei-node/backend"
}

variable "node_dashboard_path" {
  description = "Path to Node dashboard source"
  type        = string
  default     = "../../cybersensei-node/dashboard"
}

# ─────────────────────────────────────────────────────────────────────────────
# Central Database Configuration
# ─────────────────────────────────────────────────────────────────────────────

variable "central_postgres_user" {
  description = "Central PostgreSQL username"
  type        = string
  default     = "cybersensei_central"
}

variable "central_postgres_password" {
  description = "Central PostgreSQL password"
  type        = string
  default     = "central_secret_2024"
  sensitive   = true
}

variable "central_postgres_db" {
  description = "Central PostgreSQL database name"
  type        = string
  default     = "cybersensei_central"
}

variable "central_mongo_user" {
  description = "Central MongoDB username"
  type        = string
  default     = "cybersensei"
}

variable "central_mongo_password" {
  description = "Central MongoDB password"
  type        = string
  default     = "mongo_secret_2024"
  sensitive   = true
}

# ─────────────────────────────────────────────────────────────────────────────
# Node Database Configuration
# ─────────────────────────────────────────────────────────────────────────────

variable "node_postgres_user" {
  description = "Node PostgreSQL username"
  type        = string
  default     = "cybersensei"
}

variable "node_postgres_password" {
  description = "Node PostgreSQL password"
  type        = string
  default     = "node_secret_2024"
  sensitive   = true
}

variable "node_postgres_db" {
  description = "Node PostgreSQL database name"
  type        = string
  default     = "cybersensei"
}

# ─────────────────────────────────────────────────────────────────────────────
# Monitoring Configuration
# ─────────────────────────────────────────────────────────────────────────────

variable "grafana_admin_user" {
  description = "Grafana admin username"
  type        = string
  default     = "admin"
}

variable "grafana_admin_password" {
  description = "Grafana admin password"
  type        = string
  default     = "admin123"
  sensitive   = true
}

