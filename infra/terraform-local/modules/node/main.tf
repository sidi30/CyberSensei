# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CyberSensei Node Module (On-Prem)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

locals {
  container_names = {
    backend   = "${var.container_prefix}-node-backend"
    dashboard = "${var.container_prefix}-node-dashboard"
    postgres  = "${var.container_prefix}-node-postgres"
    ai        = "${var.container_prefix}-node-ai"
  }

  backend_image   = var.use_remote_images ? var.backend_image_remote : var.backend_image_local
  dashboard_image = var.use_remote_images ? var.dashboard_image_remote : var.dashboard_image_local
  ai_image        = var.use_remote_images ? var.ai_image_remote : var.ai_image_local
}

# ─────────────────────────────────────────────────────────────────────────────
# Volumes
# ─────────────────────────────────────────────────────────────────────────────

resource "docker_volume" "postgres_data" {
  name = "${var.container_prefix}-node-postgres-data"
}

resource "docker_volume" "ai_models" {
  name = "${var.container_prefix}-node-ai-models"
}

# ─────────────────────────────────────────────────────────────────────────────
# Images
# ─────────────────────────────────────────────────────────────────────────────

resource "docker_image" "postgres" {
  name = var.postgres_image
}

resource "docker_image" "backend" {
  count = var.use_remote_images ? 1 : 0
  name  = var.backend_image_remote
}

resource "docker_image" "dashboard" {
  count = var.use_remote_images ? 1 : 0
  name  = var.dashboard_image_remote
}

resource "docker_image" "ai" {
  count = var.use_remote_images ? 1 : 0
  name  = var.ai_image_remote
}

# ─────────────────────────────────────────────────────────────────────────────
# PostgreSQL Database
# ─────────────────────────────────────────────────────────────────────────────

resource "docker_container" "postgres" {
  name  = local.container_names.postgres
  image = docker_image.postgres.image_id

  networks_advanced {
    name = var.network_name
  }

  env = [
    "POSTGRES_USER=${var.postgres_user}",
    "POSTGRES_PASSWORD=${var.postgres_password}",
    "POSTGRES_DB=${var.postgres_db}",
  ]

  volumes {
    volume_name    = docker_volume.postgres_data.name
    container_path = "/var/lib/postgresql/data"
  }

  dynamic "labels" {
    for_each = var.common_labels
    content {
      label = labels.key
      value = labels.value
    }
  }

  healthcheck {
    test         = ["CMD-SHELL", "pg_isready -U ${var.postgres_user} -d ${var.postgres_db}"]
    interval     = "10s"
    timeout      = "5s"
    retries      = 5
    start_period = "30s"
  }

  restart = "unless-stopped"
}

# ─────────────────────────────────────────────────────────────────────────────
# AI Service (Mistral)
# ─────────────────────────────────────────────────────────────────────────────

resource "docker_container" "ai" {
  name  = local.container_names.ai
  image = local.ai_image

  networks_advanced {
    name = var.network_name
  }

  volumes {
    volume_name    = docker_volume.ai_models.name
    container_path = "/models"
  }

  env = [
    "MODEL_PATH=/models",
    "API_PORT=8000",
  ]

  dynamic "labels" {
    for_each = var.common_labels
    content {
      label = labels.key
      value = labels.value
    }
  }

  healthcheck {
    test         = ["CMD-SHELL", "curl -f http://localhost:8000/health || wget -q --spider http://localhost:8000/health || exit 1"]
    interval     = "30s"
    timeout      = "10s"
    retries      = 3
    start_period = "120s"
  }

  restart = "unless-stopped"
}

# ─────────────────────────────────────────────────────────────────────────────
# Node Backend (Spring Boot)
# ─────────────────────────────────────────────────────────────────────────────

resource "docker_container" "backend" {
  name  = local.container_names.backend
  image = local.backend_image

  networks_advanced {
    name = var.network_name
  }

  env = [
    "SPRING_PROFILES_ACTIVE=docker",
    "SERVER_PORT=8080",
    "SPRING_DATASOURCE_URL=jdbc:postgresql://${local.container_names.postgres}:5432/${var.postgres_db}",
    "SPRING_DATASOURCE_USERNAME=${var.postgres_user}",
    "SPRING_DATASOURCE_PASSWORD=${var.postgres_password}",
    "AI_SERVICE_URL=http://${local.container_names.ai}:8000",
    "SPRING_MAIL_HOST=${var.smtp_host}",
    "SPRING_MAIL_PORT=${var.smtp_port}",
    "JWT_SECRET=node_jwt_secret_dev_2024",
    "CYBERSENSEI_PHISHING_TRACKING_BASE_URL=http://${var.api_host}:8088",
  ]

  # Traefik labels for routing
  labels {
    label = "traefik.enable"
    value = "true"
  }
  labels {
    label = "traefik.http.routers.node-api.rule"
    value = "Host(`${var.api_host}`)"
  }
  labels {
    label = "traefik.http.routers.node-api.entrypoints"
    value = "web"
  }
  labels {
    label = "traefik.http.services.node-api.loadbalancer.server.port"
    value = "8080"
  }

  dynamic "labels" {
    for_each = var.common_labels
    content {
      label = labels.key
      value = labels.value
    }
  }

  healthcheck {
    test         = ["CMD-SHELL", "wget -q --spider http://localhost:8080/api/health || curl -f http://localhost:8080/api/health || exit 1"]
    interval     = "15s"
    timeout      = "10s"
    retries      = 5
    start_period = "90s"
  }

  restart = "unless-stopped"

  depends_on = [
    docker_container.postgres,
    docker_container.ai
  ]
}

# ─────────────────────────────────────────────────────────────────────────────
# Node Dashboard (React)
# ─────────────────────────────────────────────────────────────────────────────

resource "docker_container" "dashboard" {
  name  = local.container_names.dashboard
  image = local.dashboard_image

  networks_advanced {
    name = var.network_name
  }

  env = [
    "NODE_ENV=development",
    "VITE_API_URL=http://${var.api_host}:8088",
  ]

  # Traefik labels for routing
  labels {
    label = "traefik.enable"
    value = "true"
  }
  labels {
    label = "traefik.http.routers.node-dashboard.rule"
    value = "Host(`${var.dashboard_host}`)"
  }
  labels {
    label = "traefik.http.routers.node-dashboard.entrypoints"
    value = "web"
  }
  labels {
    label = "traefik.http.services.node-dashboard.loadbalancer.server.port"
    value = "80"
  }

  dynamic "labels" {
    for_each = var.common_labels
    content {
      label = labels.key
      value = labels.value
    }
  }

  healthcheck {
    test         = ["CMD-SHELL", "curl -f http://localhost:80 || wget -q --spider http://localhost:80 || exit 1"]
    interval     = "15s"
    timeout      = "10s"
    retries      = 3
    start_period = "30s"
  }

  restart = "unless-stopped"

  depends_on = [docker_container.backend]
}

