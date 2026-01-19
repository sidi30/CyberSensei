variable "network_name" {
  description = "Docker network name"
  type        = string
}

variable "container_prefix" {
  description = "Prefix for container names"
  type        = string
}

variable "common_labels" {
  description = "Common labels for containers"
  type        = map(string)
}

variable "grafana_host" {
  description = "Grafana hostname for routing"
  type        = string
}

variable "prometheus_host" {
  description = "Prometheus hostname for routing"
  type        = string
}

variable "alertmanager_host" {
  description = "Alertmanager hostname for routing"
  type        = string
}

variable "prometheus_image" {
  description = "Prometheus image"
  type        = string
}

variable "grafana_image" {
  description = "Grafana image"
  type        = string
}

variable "alertmanager_image" {
  description = "Alertmanager image"
  type        = string
}

variable "grafana_admin_user" {
  description = "Grafana admin username"
  type        = string
}

variable "grafana_admin_password" {
  description = "Grafana admin password"
  type        = string
  sensitive   = true
}

variable "central_backend_target" {
  description = "Central backend target for scraping"
  type        = string
}

variable "node_backend_target" {
  description = "Node backend target for scraping"
  type        = string
}

