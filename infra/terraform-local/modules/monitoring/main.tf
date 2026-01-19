# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Monitoring Module (Prometheus + Grafana + Alertmanager)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

locals {
  container_names = {
    prometheus   = "${var.container_prefix}-prometheus"
    grafana      = "${var.container_prefix}-grafana"
    alertmanager = "${var.container_prefix}-alertmanager"
  }
}

# ─────────────────────────────────────────────────────────────────────────────
# Volumes
# ─────────────────────────────────────────────────────────────────────────────

resource "docker_volume" "prometheus_data" {
  name = "${var.container_prefix}-prometheus-data"
}

resource "docker_volume" "grafana_data" {
  name = "${var.container_prefix}-grafana-data"
}

resource "docker_volume" "alertmanager_data" {
  name = "${var.container_prefix}-alertmanager-data"
}

# ─────────────────────────────────────────────────────────────────────────────
# Images
# ─────────────────────────────────────────────────────────────────────────────

resource "docker_image" "prometheus" {
  name = var.prometheus_image
}

resource "docker_image" "grafana" {
  name = var.grafana_image
}

resource "docker_image" "alertmanager" {
  name = var.alertmanager_image
}

# ─────────────────────────────────────────────────────────────────────────────
# Prometheus Configuration
# ─────────────────────────────────────────────────────────────────────────────

resource "local_file" "prometheus_config" {
  filename = "${path.module}/prometheus.yml"
  content  = <<-EOT
    global:
      scrape_interval: 15s
      evaluation_interval: 15s

    alerting:
      alertmanagers:
        - static_configs:
            - targets:
              - ${local.container_names.alertmanager}:9093

    rule_files:
      # - "alerts/*.yml"

    scrape_configs:
      - job_name: 'prometheus'
        static_configs:
          - targets: ['localhost:9090']

      - job_name: 'central-backend'
        static_configs:
          - targets: ['${var.central_backend_target}']
        metrics_path: /metrics
        scrape_interval: 30s

      - job_name: 'node-backend'
        static_configs:
          - targets: ['${var.node_backend_target}']
        metrics_path: /actuator/prometheus
        scrape_interval: 30s
  EOT
}

# ─────────────────────────────────────────────────────────────────────────────
# Alertmanager Configuration
# ─────────────────────────────────────────────────────────────────────────────

resource "local_file" "alertmanager_config" {
  filename = "${path.module}/alertmanager.yml"
  content  = <<-EOT
    global:
      resolve_timeout: 5m

    route:
      group_by: ['alertname', 'severity']
      group_wait: 30s
      group_interval: 5m
      repeat_interval: 4h
      receiver: 'default'

    receivers:
      - name: 'default'
        # Configure webhook, email, slack, etc.
  EOT
}

# ─────────────────────────────────────────────────────────────────────────────
# Grafana Provisioning
# ─────────────────────────────────────────────────────────────────────────────

resource "local_file" "grafana_datasources" {
  filename = "${path.module}/grafana/provisioning/datasources/datasources.yml"
  content  = <<-EOT
    apiVersion: 1

    datasources:
      - name: Prometheus
        type: prometheus
        access: proxy
        url: http://${local.container_names.prometheus}:9090
        isDefault: true
        editable: false
  EOT
}

resource "local_file" "grafana_dashboards_config" {
  filename = "${path.module}/grafana/provisioning/dashboards/dashboards.yml"
  content  = <<-EOT
    apiVersion: 1

    providers:
      - name: 'CyberSensei'
        orgId: 1
        folder: 'CyberSensei'
        type: file
        disableDeletion: false
        editable: true
        options:
          path: /etc/grafana/provisioning/dashboards
  EOT
}

# ─────────────────────────────────────────────────────────────────────────────
# Prometheus Container
# ─────────────────────────────────────────────────────────────────────────────

resource "docker_container" "prometheus" {
  name  = local.container_names.prometheus
  image = docker_image.prometheus.image_id

  networks_advanced {
    name = var.network_name
  }

  volumes {
    volume_name    = docker_volume.prometheus_data.name
    container_path = "/prometheus"
  }

  volumes {
    host_path      = abspath(local_file.prometheus_config.filename)
    container_path = "/etc/prometheus/prometheus.yml"
    read_only      = true
  }

  command = [
    "--config.file=/etc/prometheus/prometheus.yml",
    "--storage.tsdb.path=/prometheus",
    "--web.console.libraries=/etc/prometheus/console_libraries",
    "--web.console.templates=/etc/prometheus/consoles",
    "--web.enable-lifecycle"
  ]

  # Traefik labels for routing
  labels {
    label = "traefik.enable"
    value = "true"
  }
  labels {
    label = "traefik.http.routers.prometheus.rule"
    value = "Host(`${var.prometheus_host}`)"
  }
  labels {
    label = "traefik.http.routers.prometheus.entrypoints"
    value = "web"
  }
  labels {
    label = "traefik.http.services.prometheus.loadbalancer.server.port"
    value = "9090"
  }

  dynamic "labels" {
    for_each = var.common_labels
    content {
      label = labels.key
      value = labels.value
    }
  }

  healthcheck {
    test         = ["CMD", "wget", "-q", "--spider", "http://localhost:9090/-/healthy"]
    interval     = "15s"
    timeout      = "10s"
    retries      = 3
    start_period = "30s"
  }

  restart = "unless-stopped"
}

# ─────────────────────────────────────────────────────────────────────────────
# Alertmanager Container
# ─────────────────────────────────────────────────────────────────────────────

resource "docker_container" "alertmanager" {
  name  = local.container_names.alertmanager
  image = docker_image.alertmanager.image_id

  networks_advanced {
    name = var.network_name
  }

  volumes {
    volume_name    = docker_volume.alertmanager_data.name
    container_path = "/alertmanager"
  }

  volumes {
    host_path      = abspath(local_file.alertmanager_config.filename)
    container_path = "/etc/alertmanager/alertmanager.yml"
    read_only      = true
  }

  command = [
    "--config.file=/etc/alertmanager/alertmanager.yml",
    "--storage.path=/alertmanager"
  ]

  # Traefik labels for routing
  labels {
    label = "traefik.enable"
    value = "true"
  }
  labels {
    label = "traefik.http.routers.alertmanager.rule"
    value = "Host(`${var.alertmanager_host}`)"
  }
  labels {
    label = "traefik.http.routers.alertmanager.entrypoints"
    value = "web"
  }
  labels {
    label = "traefik.http.services.alertmanager.loadbalancer.server.port"
    value = "9093"
  }

  dynamic "labels" {
    for_each = var.common_labels
    content {
      label = labels.key
      value = labels.value
    }
  }

  healthcheck {
    test         = ["CMD", "wget", "-q", "--spider", "http://localhost:9093/-/healthy"]
    interval     = "15s"
    timeout      = "10s"
    retries      = 3
    start_period = "30s"
  }

  restart = "unless-stopped"
}

# ─────────────────────────────────────────────────────────────────────────────
# Grafana Container
# ─────────────────────────────────────────────────────────────────────────────

resource "docker_container" "grafana" {
  name  = local.container_names.grafana
  image = docker_image.grafana.image_id

  networks_advanced {
    name = var.network_name
  }

  env = [
    "GF_SECURITY_ADMIN_USER=${var.grafana_admin_user}",
    "GF_SECURITY_ADMIN_PASSWORD=${var.grafana_admin_password}",
    "GF_USERS_ALLOW_SIGN_UP=false",
    "GF_SERVER_ROOT_URL=http://${var.grafana_host}:8088",
  ]

  volumes {
    volume_name    = docker_volume.grafana_data.name
    container_path = "/var/lib/grafana"
  }

  volumes {
    host_path      = abspath("${path.module}/grafana/provisioning")
    container_path = "/etc/grafana/provisioning"
    read_only      = true
  }

  # Traefik labels for routing
  labels {
    label = "traefik.enable"
    value = "true"
  }
  labels {
    label = "traefik.http.routers.grafana.rule"
    value = "Host(`${var.grafana_host}`)"
  }
  labels {
    label = "traefik.http.routers.grafana.entrypoints"
    value = "web"
  }
  labels {
    label = "traefik.http.services.grafana.loadbalancer.server.port"
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
    test         = ["CMD-SHELL", "wget -q --spider http://localhost:3000/api/health || exit 1"]
    interval     = "15s"
    timeout      = "10s"
    retries      = 3
    start_period = "30s"
  }

  restart = "unless-stopped"

  depends_on = [
    docker_container.prometheus,
    local_file.grafana_datasources,
    local_file.grafana_dashboards_config
  ]
}

