provider "docker" {
  # Automatically detect OS and use appropriate Docker host
  # Windows: npipe:////./pipe/docker_engine
  # Linux/Mac: unix:///var/run/docker.sock
  host = var.docker_host
}

provider "random" {}

provider "local" {}

