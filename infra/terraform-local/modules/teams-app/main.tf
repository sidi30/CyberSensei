# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CyberSensei Teams App Module
# Deploys Bot and Tabs containers for Microsoft Teams integration
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

locals {
  container_names = {
    bot  = "${var.container_prefix}-teams-bot"
    tabs = "${var.container_prefix}-teams-tabs"
  }

  bot_image  = var.use_remote_images ? var.bot_image_remote : var.bot_image_local
  tabs_image = var.use_remote_images ? var.tabs_image_remote : var.tabs_image_local
}

# ─────────────────────────────────────────────────────────────────────────────
# Images
# ─────────────────────────────────────────────────────────────────────────────

resource "docker_image" "bot" {
  count = var.use_remote_images ? 1 : 0
  name  = var.bot_image_remote
}

resource "docker_image" "tabs" {
  count = var.use_remote_images ? 1 : 0
  name  = var.tabs_image_remote
}

# ─────────────────────────────────────────────────────────────────────────────
# Teams Bot Container
# ─────────────────────────────────────────────────────────────────────────────

resource "docker_container" "bot" {
  name  = local.container_names.bot
  image = local.bot_image

  networks_advanced {
    name = var.network_name
  }

  env = [
    "NODE_ENV=production",
    "PORT=3978",
    "BOT_ID=${var.bot_id}",
    "BOT_PASSWORD=${var.bot_password}",
    "MICROSOFT_APP_ID=${var.microsoft_app_id}",
    "MICROSOFT_APP_PASSWORD=${var.microsoft_app_password}",
    "MICROSOFT_APP_TENANT_ID=${var.microsoft_app_tenant_id}",
    "BACKEND_BASE_URL=${var.backend_url}",
  ]

  # Expose port to host
  ports {
    internal = 3978
    external = var.bot_port
  }

  # Traefik labels for routing
  labels {
    label = "traefik.enable"
    value = "true"
  }
  labels {
    label = "traefik.http.routers.teams-bot.rule"
    value = "Host(`${var.bot_host}`)"
  }
  labels {
    label = "traefik.http.routers.teams-bot.entrypoints"
    value = "web"
  }
  labels {
    label = "traefik.http.services.teams-bot.loadbalancer.server.port"
    value = "3978"
  }

  dynamic "labels" {
    for_each = var.common_labels
    content {
      label = labels.key
      value = labels.value
    }
  }

  healthcheck {
    test         = ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:3978/health || exit 1"]
    interval     = "30s"
    timeout      = "10s"
    retries      = 3
    start_period = "15s"
  }

  restart = "unless-stopped"
}

# ─────────────────────────────────────────────────────────────────────────────
# Teams Tabs Container (Employee + Manager)
# ─────────────────────────────────────────────────────────────────────────────

resource "docker_container" "tabs" {
  name  = local.container_names.tabs
  image = local.tabs_image

  networks_advanced {
    name = var.network_name
  }

  env = [
    "NODE_ENV=production",
  ]

  # Expose port to host
  ports {
    internal = 80
    external = var.tabs_port
  }

  # Traefik labels for routing
  labels {
    label = "traefik.enable"
    value = "true"
  }
  labels {
    label = "traefik.http.routers.teams-tabs.rule"
    value = "Host(`${var.tabs_host}`)"
  }
  labels {
    label = "traefik.http.routers.teams-tabs.entrypoints"
    value = "web"
  }
  labels {
    label = "traefik.http.services.teams-tabs.loadbalancer.server.port"
    value = "80"
  }

  # Teams requires specific headers for iframe embedding
  labels {
    label = "traefik.http.middlewares.teams-headers.headers.customresponseheaders.X-Frame-Options"
    value = "ALLOW-FROM https://teams.microsoft.com"
  }
  labels {
    label = "traefik.http.middlewares.teams-headers.headers.customresponseheaders.Content-Security-Policy"
    value = "frame-ancestors 'self' https://teams.microsoft.com https://*.teams.microsoft.com"
  }
  labels {
    label = "traefik.http.routers.teams-tabs.middlewares"
    value = "teams-headers"
  }

  dynamic "labels" {
    for_each = var.common_labels
    content {
      label = labels.key
      value = labels.value
    }
  }

  healthcheck {
    test         = ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:80/health.json || exit 1"]
    interval     = "30s"
    timeout      = "10s"
    retries      = 3
    start_period = "10s"
  }

  restart = "unless-stopped"
}
