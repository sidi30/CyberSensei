# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CyberSensei Local Infrastructure - Main
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# ─────────────────────────────────────────────────────────────────────────────
# Docker Network
# ─────────────────────────────────────────────────────────────────────────────

resource "docker_network" "cybersensei" {
  name   = local.network_name
  driver = "bridge"

  ipam_config {
    subnet  = "172.28.0.0/16"
    gateway = "172.28.0.1"
  }

  labels {
    label = "com.cybersensei.managed"
    value = "terraform"
  }
}

# ─────────────────────────────────────────────────────────────────────────────
# Reverse Proxy Module (Traefik)
# ─────────────────────────────────────────────────────────────────────────────

module "reverse_proxy" {
  source = "./modules/reverse-proxy"

  network_name    = docker_network.cybersensei.name
  container_name  = local.containers.traefik
  http_port       = var.http_port
  https_port      = var.https_port
  common_labels   = local.common_labels
  domain_suffix   = var.domain_suffix

  depends_on = [docker_network.cybersensei]
}

# ─────────────────────────────────────────────────────────────────────────────
# Central Module (SaaS)
# ─────────────────────────────────────────────────────────────────────────────

module "central" {
  source = "./modules/central"
  count  = var.deploy_central ? 1 : 0

  network_name      = docker_network.cybersensei.name
  container_prefix  = local.prefix
  common_labels     = local.common_labels
  
  # Hostnames
  dashboard_host    = local.central_dashboard_host
  api_host          = local.central_api_host
  
  # Database
  postgres_user     = var.central_postgres_user
  postgres_password = var.central_postgres_password
  postgres_db       = var.central_postgres_db
  mongo_user        = var.central_mongo_user
  mongo_password    = var.central_mongo_password

  # Images
  use_remote_images     = var.use_remote_images
  backend_image_remote  = local.remote_images.central_backend
  backend_image_local   = local.local_images.central_backend
  dashboard_image_remote = local.remote_images.central_dashboard
  dashboard_image_local  = local.local_images.central_dashboard

  # Infrastructure images
  postgres_image    = local.images.postgres
  mongo_image       = local.images.mongo

  depends_on = [module.reverse_proxy]
}

# ─────────────────────────────────────────────────────────────────────────────
# Node Module (On-Prem)
# ─────────────────────────────────────────────────────────────────────────────

module "node" {
  source = "./modules/node"
  count  = var.deploy_node ? 1 : 0

  network_name      = docker_network.cybersensei.name
  container_prefix  = local.prefix
  common_labels     = local.common_labels
  
  # Hostnames
  dashboard_host    = local.node_dashboard_host
  api_host          = local.node_api_host
  
  # Database
  postgres_user     = var.node_postgres_user
  postgres_password = var.node_postgres_password
  postgres_db       = var.node_postgres_db

  # Images
  use_remote_images     = var.use_remote_images
  backend_image_remote  = local.remote_images.node_backend
  backend_image_local   = local.local_images.node_backend
  dashboard_image_remote = local.remote_images.node_dashboard
  dashboard_image_local  = local.local_images.node_dashboard
  ai_image_remote       = local.remote_images.node_ai
  ai_image_local        = local.local_images.node_ai

  # Infrastructure images
  postgres_image    = local.images.postgres

  # SMTP (Mailhog)
  smtp_host         = var.enable_mailhog ? local.containers.mailhog : ""
  smtp_port         = 1025

  depends_on = [module.reverse_proxy]
}

# ─────────────────────────────────────────────────────────────────────────────
# Monitoring Module
# ─────────────────────────────────────────────────────────────────────────────

module "monitoring" {
  source = "./modules/monitoring"
  count  = var.enable_monitoring ? 1 : 0

  network_name     = docker_network.cybersensei.name
  container_prefix = local.prefix
  common_labels    = local.common_labels
  
  # Hostnames
  grafana_host      = local.grafana_host
  prometheus_host   = local.prometheus_host
  alertmanager_host = local.alertmanager_host

  # Images
  prometheus_image   = local.images.prometheus
  grafana_image      = local.images.grafana
  alertmanager_image = local.images.alertmanager

  # Credentials
  grafana_admin_user     = var.grafana_admin_user
  grafana_admin_password = var.grafana_admin_password

  # Targets
  central_backend_target = var.deploy_central ? "${local.containers.central_backend}:3000" : ""
  node_backend_target    = var.deploy_node ? "${local.containers.node_backend}:8080" : ""

  depends_on = [module.reverse_proxy]
}

# ─────────────────────────────────────────────────────────────────────────────
# Teams App Module (Bot + Tabs)
# ─────────────────────────────────────────────────────────────────────────────

module "teams_app" {
  source = "./modules/teams-app"
  count  = var.deploy_teams_app ? 1 : 0

  network_name     = docker_network.cybersensei.name
  container_prefix = local.prefix
  common_labels    = local.common_labels

  # Hostnames
  bot_host  = local.teams_bot_host
  tabs_host = local.teams_tabs_host

  # Ports
  bot_port  = var.teams_bot_port
  tabs_port = var.teams_tabs_port

  # Microsoft Azure Configuration
  bot_id                  = var.teams_bot_id
  bot_password            = var.teams_bot_password
  microsoft_app_id        = var.teams_microsoft_app_id
  microsoft_app_password  = var.teams_microsoft_app_password
  microsoft_app_tenant_id = var.teams_microsoft_app_tenant_id

  # Backend URL
  backend_url = var.deploy_node ? "http://${local.containers.node_backend}:8080" : var.teams_backend_url

  # Images
  use_remote_images  = var.use_remote_images
  bot_image_remote   = local.remote_images.teams_bot
  bot_image_local    = local.local_images.teams_bot
  tabs_image_remote  = local.remote_images.teams_tabs
  tabs_image_local   = local.local_images.teams_tabs

  depends_on = [module.reverse_proxy, module.node]
}

# ─────────────────────────────────────────────────────────────────────────────
# Mailhog (SMTP Testing)
# ─────────────────────────────────────────────────────────────────────────────

resource "docker_image" "mailhog" {
  count = var.enable_mailhog ? 1 : 0
  name  = local.images.mailhog
}

resource "docker_container" "mailhog" {
  count = var.enable_mailhog ? 1 : 0
  
  name  = local.containers.mailhog
  image = docker_image.mailhog[0].image_id

  networks_advanced {
    name = docker_network.cybersensei.name
  }

  labels {
    label = "traefik.enable"
    value = "true"
  }
  labels {
    label = "traefik.http.routers.mailhog.rule"
    value = "Host(`${local.mailhog_host}`)"
  }
  labels {
    label = "traefik.http.routers.mailhog.entrypoints"
    value = "web"
  }
  labels {
    label = "traefik.http.services.mailhog.loadbalancer.server.port"
    value = "8025"
  }

  dynamic "labels" {
    for_each = local.common_labels
    content {
      label = labels.key
      value = labels.value
    }
  }

  healthcheck {
    test         = ["CMD", "wget", "-q", "--spider", "http://localhost:8025"]
    interval     = "10s"
    timeout      = "5s"
    retries      = 3
    start_period = "10s"
  }

  restart = "unless-stopped"

  depends_on = [module.reverse_proxy]
}

