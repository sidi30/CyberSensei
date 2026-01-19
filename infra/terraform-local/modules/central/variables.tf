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

variable "dashboard_host" {
  description = "Dashboard hostname for routing"
  type        = string
}

variable "api_host" {
  description = "API hostname for routing"
  type        = string
}

# Database
variable "postgres_user" {
  description = "PostgreSQL username"
  type        = string
}

variable "postgres_password" {
  description = "PostgreSQL password"
  type        = string
  sensitive   = true
}

variable "postgres_db" {
  description = "PostgreSQL database name"
  type        = string
}

variable "mongo_user" {
  description = "MongoDB username"
  type        = string
}

variable "mongo_password" {
  description = "MongoDB password"
  type        = string
  sensitive   = true
}

# Images
variable "use_remote_images" {
  description = "Use remote images"
  type        = bool
}

variable "backend_image_remote" {
  description = "Remote backend image"
  type        = string
}

variable "backend_image_local" {
  description = "Local backend image"
  type        = string
}

variable "dashboard_image_remote" {
  description = "Remote dashboard image"
  type        = string
}

variable "dashboard_image_local" {
  description = "Local dashboard image"
  type        = string
}

variable "postgres_image" {
  description = "PostgreSQL image"
  type        = string
}

variable "mongo_image" {
  description = "MongoDB image"
  type        = string
}

