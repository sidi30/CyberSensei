output "container_id" {
  description = "Traefik container ID"
  value       = docker_container.traefik.id
}

output "container_name" {
  description = "Traefik container name"
  value       = docker_container.traefik.name
}

