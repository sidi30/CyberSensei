variable "network_name" {
  description = "Docker network name"
  type        = string
}

variable "container_name" {
  description = "Container name for Traefik"
  type        = string
}

variable "http_port" {
  description = "Host HTTP port"
  type        = number
}

variable "https_port" {
  description = "Host HTTPS port"
  type        = number
}

variable "common_labels" {
  description = "Common labels for all containers"
  type        = map(string)
}

variable "domain_suffix" {
  description = "Domain suffix for routing"
  type        = string
}

