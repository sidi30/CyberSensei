# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CyberSensei Local Infrastructure - Outputs
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

# ─────────────────────────────────────────────────────────────────────────────
# Access URLs
# ─────────────────────────────────────────────────────────────────────────────

output "urls" {
  description = "All service URLs"
  value = {
    traefik_dashboard = "http://localhost:${var.http_port}/dashboard/"
    
    central = var.deploy_central ? {
      dashboard = "http://${local.central_dashboard_host}:${var.http_port}"
      api       = "http://${local.central_api_host}:${var.http_port}"
    } : null
    
    node = var.deploy_node ? {
      dashboard = "http://${local.node_dashboard_host}:${var.http_port}"
      api       = "http://${local.node_api_host}:${var.http_port}"
    } : null
    
    monitoring = var.enable_monitoring ? {
      grafana      = "http://${local.grafana_host}:${var.http_port}"
      prometheus   = "http://${local.prometheus_host}:${var.http_port}"
      alertmanager = "http://${local.alertmanager_host}:${var.http_port}"
    } : null
    
    mailhog = var.enable_mailhog ? "http://${local.mailhog_host}:${var.http_port}" : null
    
    teams = var.deploy_teams_app ? {
      bot_api      = "http://${local.teams_bot_host}:${var.teams_bot_port}"
      employee_tab = "http://${local.teams_tabs_host}:${var.teams_tabs_port}/tabs/employee/"
      manager_tab  = "http://${local.teams_tabs_host}:${var.teams_tabs_port}/tabs/manager/"
    } : null
  }
}

# ─────────────────────────────────────────────────────────────────────────────
# Hosts File Entries
# ─────────────────────────────────────────────────────────────────────────────

output "hosts_entries" {
  description = "Add these entries to your hosts file"
  value = <<-EOT
    # CyberSensei Local Development
    127.0.0.1 ${local.central_dashboard_host}
    127.0.0.1 ${local.central_api_host}
    127.0.0.1 ${local.node_dashboard_host}
    127.0.0.1 ${local.node_api_host}
    127.0.0.1 ${local.grafana_host}
    127.0.0.1 ${local.prometheus_host}
    127.0.0.1 ${local.alertmanager_host}
    127.0.0.1 ${local.mailhog_host}
    127.0.0.1 ${local.teams_bot_host}
    127.0.0.1 ${local.teams_tabs_host}
  EOT
}

# ─────────────────────────────────────────────────────────────────────────────
# Quick Access
# ─────────────────────────────────────────────────────────────────────────────

output "quick_access" {
  description = "Quick access commands"
  value = <<-EOT
    
    ╔══════════════════════════════════════════════════════════════════════════╗
    ║                     CyberSensei Local Environment                        ║
    ╠══════════════════════════════════════════════════════════════════════════╣
    ║                                                                          ║
    ║  CENTRAL (SaaS):                                                         ║
    ║    Dashboard: http://central.local:${var.http_port}                                  ║
    ║    API:       http://api.central.local:${var.http_port}                              ║
    ║                                                                          ║
    ║  NODE (On-Prem):                                                         ║
    ║    Dashboard: http://node.local:${var.http_port}                                     ║
    ║    API:       http://api.node.local:${var.http_port}                                 ║
    ║                                                                          ║
    ║  MONITORING:                                                             ║
    ║    Grafana:   http://grafana.local:${var.http_port}  (admin/[see terraform.tfvars])     ║
    ║    Prometheus: http://prometheus.local:${var.http_port}                              ║
    ║                                                                          ║
    ║  TEAMS APP:                                                              ║
    ║    Bot:       http://bot.local:${var.teams_bot_port}                                       ║
    ║    Tabs:      http://tabs.local:${var.teams_tabs_port}                                      ║
    ║                                                                          ║
    ║  UTILITIES:                                                              ║
    ║    Mailhog:   http://mailhog.local:${var.http_port}                                  ║
    ║    Traefik:   http://localhost:${var.http_port}/dashboard/                           ║
    ║                                                                          ║
    ╚══════════════════════════════════════════════════════════════════════════╝
    
  EOT
}

# ─────────────────────────────────────────────────────────────────────────────
# Network Info
# ─────────────────────────────────────────────────────────────────────────────

output "network_name" {
  description = "Docker network name"
  value       = docker_network.cybersensei.name
}

# ─────────────────────────────────────────────────────────────────────────────
# Database Connection Strings
# ─────────────────────────────────────────────────────────────────────────────

output "database_connections" {
  description = "Database connection strings (internal network)"
  sensitive   = true
  value = {
    central_postgres = var.deploy_central ? "postgresql://${var.central_postgres_user}:${var.central_postgres_password}@${local.containers.central_postgres}:5432/${var.central_postgres_db}" : null
    central_mongo    = var.deploy_central ? "mongodb://${var.central_mongo_user}:${var.central_mongo_password}@${local.containers.central_mongo}:27017" : null
    node_postgres    = var.deploy_node ? "postgresql://${var.node_postgres_user}:${var.node_postgres_password}@${local.containers.node_postgres}:5432/${var.node_postgres_db}" : null
  }
}

