# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Traefik Reverse Proxy Module
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

resource "docker_image" "traefik" {
  name = "traefik:v3.0"
}

resource "docker_container" "traefik" {
  name  = var.container_name
  image = docker_image.traefik.image_id

  networks_advanced {
    name = var.network_name
  }

  # Host port bindings - ONLY Traefik exposes ports
  ports {
    internal = 80
    external = var.http_port
  }

  ports {
    internal = 443
    external = var.https_port
  }

  # Mount Docker socket - Docker Desktop exposes this inside the VM
  # Works on Windows/Mac/Linux with Docker Desktop
  volumes {
    host_path      = "/var/run/docker.sock"
    container_path = "/var/run/docker.sock"
    read_only      = true
  }

  # Traefik CLI configuration (no external config file needed)
  command = [
    "--api.dashboard=true",
    "--api.insecure=true",
    "--entrypoints.web.address=:80",
    "--entrypoints.websecure.address=:443",
    "--providers.docker=true",
    "--providers.docker.exposedbydefault=false",
    "--providers.docker.network=${var.network_name}",
    "--providers.docker.watch=true",
    "--log.level=INFO"
  ]

  dynamic "labels" {
    for_each = var.common_labels
    content {
      label = labels.key
      value = labels.value
    }
  }

  # Traefik dashboard routing
  labels {
    label = "traefik.enable"
    value = "true"
  }
  labels {
    label = "traefik.http.routers.traefik.rule"
    value = "Host(`traefik.${var.domain_suffix}`) || PathPrefix(`/api`) || PathPrefix(`/dashboard`)"
  }
  labels {
    label = "traefik.http.routers.traefik.service"
    value = "api@internal"
  }

  healthcheck {
    test         = ["CMD", "traefik", "healthcheck"]
    interval     = "10s"
    timeout      = "5s"
    retries      = 3
    start_period = "10s"
  }

  restart = "unless-stopped"
}

