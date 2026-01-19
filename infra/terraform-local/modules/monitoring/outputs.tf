output "prometheus_container_id" {
  description = "Prometheus container ID"
  value       = docker_container.prometheus.id
}

output "grafana_container_id" {
  description = "Grafana container ID"
  value       = docker_container.grafana.id
}

output "alertmanager_container_id" {
  description = "Alertmanager container ID"
  value       = docker_container.alertmanager.id
}

output "prometheus_internal_url" {
  description = "Prometheus internal URL"
  value       = "http://${local.container_names.prometheus}:9090"
}

