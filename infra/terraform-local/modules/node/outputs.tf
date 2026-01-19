output "backend_container_id" {
  description = "Backend container ID"
  value       = docker_container.backend.id
}

output "dashboard_container_id" {
  description = "Dashboard container ID"
  value       = docker_container.dashboard.id
}

output "postgres_container_id" {
  description = "PostgreSQL container ID"
  value       = docker_container.postgres.id
}

output "ai_container_id" {
  description = "AI service container ID"
  value       = docker_container.ai.id
}

output "backend_internal_url" {
  description = "Backend internal URL"
  value       = "http://${local.container_names.backend}:8080"
}

