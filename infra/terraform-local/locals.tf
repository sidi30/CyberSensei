# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CyberSensei Local Infrastructure - Locals
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

locals {
  # Naming
  prefix = var.project_name

  # Hostnames
  central_dashboard_host = "central.${var.domain_suffix}"
  central_api_host       = "api.central.${var.domain_suffix}"
  node_dashboard_host    = "node.${var.domain_suffix}"
  node_api_host          = "api.node.${var.domain_suffix}"
  grafana_host           = "grafana.${var.domain_suffix}"
  prometheus_host        = "prometheus.${var.domain_suffix}"
  alertmanager_host      = "alertmanager.${var.domain_suffix}"
  mailhog_host           = "mailhog.${var.domain_suffix}"
  teams_bot_host         = "bot.${var.domain_suffix}"
  teams_tabs_host        = "tabs.${var.domain_suffix}"

  # Networks
  network_name = "${local.prefix}-network"

  # Container names
  containers = {
    traefik              = "${local.prefix}-traefik"
    central_backend      = "${local.prefix}-central-backend"
    central_dashboard    = "${local.prefix}-central-dashboard"
    central_postgres     = "${local.prefix}-central-postgres"
    central_mongo        = "${local.prefix}-central-mongo"
    node_backend         = "${local.prefix}-node-backend"
    node_dashboard       = "${local.prefix}-node-dashboard"
    node_postgres        = "${local.prefix}-node-postgres"
    node_ai              = "${local.prefix}-node-ai"
    prometheus           = "${local.prefix}-prometheus"
    grafana              = "${local.prefix}-grafana"
    alertmanager         = "${local.prefix}-alertmanager"
    mailhog              = "${local.prefix}-mailhog"
    teams_bot            = "${local.prefix}-teams-bot"
    teams_tabs           = "${local.prefix}-teams-tabs"
  }

  # Image references
  images = {
    traefik       = "traefik:v3.0"
    postgres      = "postgres:16-alpine"
    mongo         = "mongo:7"
    prometheus    = "prom/prometheus:v2.48.0"
    grafana       = "grafana/grafana:10.2.2"
    alertmanager  = "prom/alertmanager:v0.26.0"
    mailhog       = "mailhog/mailhog:latest"
    mistral       = "ghcr.io/mistralai/mistral-inference:latest"
  }

  # Remote images
  remote_images = {
    central_backend   = "${var.registry}/central-backend:${var.image_tag}"
    central_dashboard = "${var.registry}/central-dashboard:${var.image_tag}"
    node_backend      = "${var.registry}/node-backend:${var.image_tag}"
    node_dashboard    = "${var.registry}/node-dashboard:${var.image_tag}"
    node_ai           = "${var.registry}/node-ai:${var.image_tag}"
    teams_bot         = "${var.registry}/teams-bot:${var.image_tag}"
    teams_tabs        = "${var.registry}/teams-tabs:${var.image_tag}"
  }

  # Local images (built from source)
  local_images = {
    central_backend   = "${local.prefix}-central-backend:local"
    central_dashboard = "${local.prefix}-central-dashboard:local"
    node_backend      = "${local.prefix}-node-backend:local"
    node_dashboard    = "${local.prefix}-node-dashboard:local"
    node_ai           = "${local.prefix}-node-ai:local"
    teams_bot         = "${local.prefix}-teams-bot:local"
    teams_tabs        = "${local.prefix}-teams-tabs:local"
  }

  # Common labels
  common_labels = {
    "com.cybersensei.managed" = "terraform"
    "com.cybersensei.project" = var.project_name
  }

  # Traefik common labels
  traefik_enable = {
    "traefik.enable" = "true"
  }
}

