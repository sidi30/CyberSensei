# CyberSensei Local Infrastructure

> **Infrastructure-as-Code for local development using Terraform + Docker**

Deploy the complete CyberSensei system on a single developer machine with zero port conflicts.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Host Machine                                    │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                        Traefik Reverse Proxy                          │  │
│  │                    Ports: 8088 (HTTP) / 8443 (HTTPS)                  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    │                                        │
│         ┌──────────────────────────┼──────────────────────────┐            │
│         │                          │                          │            │
│         ▼                          ▼                          ▼            │
│  ┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐    │
│  │  CENTRAL (SaaS) │      │  NODE (On-Prem) │      │   MONITORING    │    │
│  │                 │      │                 │      │                 │    │
│  │  • Backend      │      │  • Backend      │      │  • Prometheus   │    │
│  │  • Dashboard    │      │  • Dashboard    │      │  • Grafana      │    │
│  │  • PostgreSQL   │      │  • PostgreSQL   │      │  • Alertmanager │    │
│  │  • MongoDB      │      │  • AI Service   │      │                 │    │
│  └─────────────────┘      └─────────────────┘      └─────────────────┘    │
│                                                                             │
│  ┌─────────────────┐                                                       │
│  │    UTILITIES    │                                                       │
│  │                 │                                                       │
│  │  • Mailhog      │                                                       │
│  └─────────────────┘                                                       │
│                                                                             │
│                        Docker Network: cybersensei-network                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 📋 Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (Docker Desktop for Windows/Mac)
- [Terraform](https://developer.hashicorp.com/terraform/downloads) >= 1.5.0
- Git

## 🚀 Quick Start

### 1. Clone and Navigate

```bash
cd infra/terraform-local
```

### 2. Configure Hosts File

Add these entries to your hosts file (`/etc/hosts` on Linux/Mac, `C:\Windows\System32\drivers\etc\hosts` on Windows):

```
127.0.0.1 central.local
127.0.0.1 api.central.local
127.0.0.1 node.local
127.0.0.1 api.node.local
127.0.0.1 grafana.local
127.0.0.1 prometheus.local
127.0.0.1 alertmanager.local
127.0.0.1 mailhog.local
```

See [scripts/hosts-help.md](scripts/hosts-help.md) for detailed instructions.

### 3. Build Local Images (if not using remote images)

```bash
chmod +x scripts/bootstrap.sh
./scripts/bootstrap.sh
```

### 4. Initialize Terraform

```bash
terraform init
```

### 5. Deploy

```bash
terraform apply
```

Type `yes` when prompted.

### 6. Access Services

| Service | URL |
|---------|-----|
| Central Dashboard | http://central.local:8088 |
| Central API | http://api.central.local:8088 |
| Node Dashboard | http://node.local:8088 |
| Node API | http://api.node.local:8088 |
| Grafana | http://grafana.local:8088 |
| Prometheus | http://prometheus.local:8088 |
| Mailhog | http://mailhog.local:8088 |
| Traefik Dashboard | http://localhost:8088/dashboard/ |

## ⚙️ Configuration

### Feature Toggles

Use variables to enable/disable components:

```bash
# Deploy only Central
terraform apply -var="deploy_node=false" -var="enable_monitoring=false"

# Deploy only Node
terraform apply -var="deploy_central=false"

# Disable monitoring
terraform apply -var="enable_monitoring=false"

# Disable Mailhog
terraform apply -var="enable_mailhog=false"
```

### Using Remote Images

To use pre-built images from a registry:

```bash
terraform apply -var="use_remote_images=true" -var="registry=ghcr.io/your-org"
```

### Environment File

Copy and customize the example environment file:

```bash
cp env/local.example.env env/local.env
# Edit env/local.env with your settings

# Apply with environment
export $(cat env/local.env | xargs) && terraform apply
```

### Custom Ports

Change the exposed ports (default 8088/8443):

```bash
terraform apply -var="http_port=80" -var="https_port=443"
```

## 📁 Directory Structure

```
terraform-local/
├── main.tf              # Main configuration
├── variables.tf         # Input variables
├── outputs.tf           # Output definitions
├── providers.tf         # Provider configuration
├── versions.tf          # Version constraints
├── locals.tf            # Local values
├── modules/
│   ├── reverse-proxy/   # Traefik reverse proxy
│   ├── central/         # Central SaaS stack
│   ├── node/            # Node on-prem stack
│   └── monitoring/      # Prometheus + Grafana
├── env/
│   └── local.example.env
├── scripts/
│   ├── bootstrap.sh     # Build local images
│   └── hosts-help.md    # Hosts file guide
└── README.md
```

## 🔧 Common Operations

### View Container Logs

```bash
# All containers
docker logs cybersensei-central-backend

# Follow logs
docker logs -f cybersensei-node-backend
```

### Restart a Service

```bash
docker restart cybersensei-central-backend
```

### Access Container Shell

```bash
docker exec -it cybersensei-central-postgres psql -U cybersensei_central
```

### Destroy Everything

```bash
terraform destroy
```

### Destroy and Remove Volumes

```bash
terraform destroy
docker volume prune -f
```

## 🔐 Default Credentials

| Service | Username | Password |
|---------|----------|----------|
| Central PostgreSQL | cybersensei_central | central_secret_2024 |
| Central MongoDB | cybersensei | mongo_secret_2024 |
| Node PostgreSQL | cybersensei | node_secret_2024 |
| Grafana | admin | admin123 |

> ⚠️ **Warning**: These are development credentials. Never use in production!

## 🐛 Troubleshooting

### Container won't start

```bash
# Check container status
docker ps -a

# Check logs
docker logs cybersensei-<container-name>

# Check health
docker inspect cybersensei-<container-name> | grep -A 20 Health
```

### Port already in use

If port 8088 is in use:

```bash
# Find what's using it
lsof -i :8088  # Linux/Mac
netstat -ano | findstr :8088  # Windows

# Use different port
terraform apply -var="http_port=9000"
```

### DNS not resolving

1. Verify hosts file entries
2. Flush DNS cache:
   - **macOS**: `sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder`
   - **Linux**: `sudo systemctl restart systemd-resolved`
   - **Windows**: `ipconfig /flushdns`

### Database connection issues

Wait for containers to be healthy:

```bash
docker ps --format "table {{.Names}}\t{{.Status}}"
```

All containers should show `(healthy)` status.

### Image build fails

```bash
# Check Docker daemon is running
docker info

# Try building individually
./scripts/bootstrap.sh --node-backend
```

## 🔄 Updating

Pull latest changes and re-apply:

```bash
git pull
terraform apply
```

To rebuild images after code changes:

```bash
./scripts/bootstrap.sh
terraform apply -replace="module.central[0].docker_container.backend"
```

## 📊 Monitoring

### Grafana

- URL: http://grafana.local:8088
- Default login: admin / admin123
- Pre-configured Prometheus datasource

### Prometheus

- URL: http://prometheus.local:8088
- Scrapes:
  - Central Backend: `/metrics`
  - Node Backend: `/actuator/prometheus`

## 🎯 Next Steps

1. **Development**: Access dashboards and start developing
2. **Testing**: Use Mailhog to test email functionality
3. **Production**: Use this as reference for production deployment

## 📚 Related Documentation

- [Hosts File Configuration](scripts/hosts-help.md)
- [CyberSensei Central Documentation](../../cybersensei-central/README.md)
- [CyberSensei Node Documentation](../../cybersensei-node/README.md)

