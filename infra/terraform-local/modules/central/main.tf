# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CyberSensei Central Module (SaaS)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

locals {
  container_names = {
    backend   = "${var.container_prefix}-central-backend"
    dashboard = "${var.container_prefix}-central-dashboard"
    postgres  = "${var.container_prefix}-central-postgres"
    mongo     = "${var.container_prefix}-central-mongo"
  }

  backend_image   = var.use_remote_images ? var.backend_image_remote : var.backend_image_local
  dashboard_image = var.use_remote_images ? var.dashboard_image_remote : var.dashboard_image_local
}

# ─────────────────────────────────────────────────────────────────────────────
# Volumes
# ─────────────────────────────────────────────────────────────────────────────

resource "docker_volume" "postgres_data" {
  name = "${var.container_prefix}-central-postgres-data"
}

resource "docker_volume" "mongo_data" {
  name = "${var.container_prefix}-central-mongo-data"
}

# ─────────────────────────────────────────────────────────────────────────────
# Images
# ─────────────────────────────────────────────────────────────────────────────

resource "docker_image" "postgres" {
  name = var.postgres_image
}

resource "docker_image" "mongo" {
  name = var.mongo_image
}

resource "docker_image" "backend" {
  count = var.use_remote_images ? 1 : 0
  name  = var.backend_image_remote
}

resource "docker_image" "dashboard" {
  count = var.use_remote_images ? 1 : 0
  name  = var.dashboard_image_remote
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
# MongoDB
# ─────────────────────────────────────────────────────────────────────────────

resource "docker_container" "mongo" {
  name  = local.container_names.mongo
  image = docker_image.mongo.image_id

  networks_advanced {
    name = var.network_name
  }

  env = [
    "MONGO_INITDB_ROOT_USERNAME=${var.mongo_user}",
    "MONGO_INITDB_ROOT_PASSWORD=${var.mongo_password}",
  ]

  volumes {
    volume_name    = docker_volume.mongo_data.name
    container_path = "/data/db"
  }

  dynamic "labels" {
    for_each = var.common_labels
    content {
      label = labels.key
      value = labels.value
    }
  }

  healthcheck {
    test         = ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
    interval     = "10s"
    timeout      = "5s"
    retries      = 5
    start_period = "30s"
  }

  restart = "unless-stopped"
}

# ─────────────────────────────────────────────────────────────────────────────
# Central Backend (NestJS)
# ─────────────────────────────────────────────────────────────────────────────

resource "docker_container" "backend" {
  name  = local.container_names.backend
  image = local.backend_image

  networks_advanced {
    name = var.network_name
  }

  env = [
    "NODE_ENV=development",
    "PORT=3000",
    "DATABASE_URL=postgresql://${var.postgres_user}:${var.postgres_password}@${local.container_names.postgres}:5432/${var.postgres_db}",
    "MONGODB_URI=mongodb://${var.mongo_user}:${var.mongo_password}@${local.container_names.mongo}:27017",
    "JWT_SECRET=central_jwt_secret_dev_2024",
  ]

  # Traefik labels for routing
  labels {
    label = "traefik.enable"
    value = "true"
  }
  labels {
    label = "traefik.http.routers.central-api.rule"
    value = "Host(`${var.api_host}`)"
  }
  labels {
    label = "traefik.http.routers.central-api.entrypoints"
    value = "web"
  }
  labels {
    label = "traefik.http.services.central-api.loadbalancer.server.port"
    value = "3000"
  }

  dynamic "labels" {
    for_each = var.common_labels
    content {
      label = labels.key
      value = labels.value
    }
  }

  healthcheck {
    test         = ["CMD-SHELL", "node -e \"require('http').get('http://localhost:3000/api', (r) => process.exit(r.statusCode === 200 ? 0 : 1))\" || exit 1"]
    interval     = "15s"
    timeout      = "10s"
    retries      = 5
    start_period = "60s"
  }

  restart = "unless-stopped"

  depends_on = [
    docker_container.postgres,
    docker_container.mongo
  ]
}

# ─────────────────────────────────────────────────────────────────────────────
# Central Dashboard (React)
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
    label = "traefik.http.routers.central-dashboard.rule"
    value = "Host(`${var.dashboard_host}`)"
  }
  labels {
    label = "traefik.http.routers.central-dashboard.entrypoints"
    value = "web"
  }
  labels {
    label = "traefik.http.services.central-dashboard.loadbalancer.server.port"
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

