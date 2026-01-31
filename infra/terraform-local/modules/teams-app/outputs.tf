# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CyberSensei Teams App Module - Outputs
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

output "bot_container_id" {
  description = "ID of the bot container"
  value       = docker_container.bot.id
}

output "bot_container_name" {
  description = "Name of the bot container"
  value       = docker_container.bot.name
}

output "tabs_container_id" {
  description = "ID of the tabs container"
  value       = docker_container.tabs.id
}

output "tabs_container_name" {
  description = "Name of the tabs container"
  value       = docker_container.tabs.name
}

output "bot_url" {
  description = "URL for bot access"
  value       = "http://${var.bot_host}:${var.bot_port}"
}

output "tabs_url" {
  description = "URL for tabs access"
  value       = "http://${var.tabs_host}:${var.tabs_port}"
}

output "employee_tab_url" {
  description = "URL for employee tab"
  value       = "http://${var.tabs_host}:${var.tabs_port}/tabs/employee/"
}

output "manager_tab_url" {
  description = "URL for manager tab"
  value       = "http://${var.tabs_host}:${var.tabs_port}/tabs/manager/"
}

output "bot_messaging_endpoint" {
  description = "Endpoint for Azure Bot Service configuration"
  value       = "http://${var.bot_host}:${var.bot_port}/api/messages"
}
