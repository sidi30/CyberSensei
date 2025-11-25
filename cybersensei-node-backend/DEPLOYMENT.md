# Guide de Déploiement - CyberSensei Backend

## 🚀 Déploiement Rapide

### Option 1: Docker Compose (Recommandé pour développement)

```bash
# Cloner le projet
git clone <repository-url>
cd cybersensei-node-backend

# Lancer tous les services
docker-compose up -d

# Vérifier les logs
docker-compose logs -f backend

# Accéder à l'application
open http://localhost:8080/swagger-ui.html
```

### Option 2: Build et Run manuel

```bash
# Build
mvn clean package -DskipTests

# Run
java -jar target/cybersensei-node-backend-1.0.0.jar
```

## 🔧 Configuration Production

### Variables d'Environnement Obligatoires

```bash
# Base de données
export DB_HOST=your-postgres-host
export DB_PORT=5432
export DB_NAME=cybersensei
export DB_USERNAME=your-username
export DB_PASSWORD=your-secure-password

# JWT Secret (IMPORTANT: changer en production!)
export JWT_SECRET=your-256-bit-secret-key-here

# SMTP pour emails phishing
export SMTP_HOST=smtp.gmail.com
export SMTP_PORT=587
export SMTP_USERNAME=your-email@company.com
export SMTP_PASSWORD=your-app-password

# Tenant ID pour sync central
export TENANT_ID=your-company-id

# URL de tracking pour phishing
export TRACKING_URL=https://cybersensei.yourcompany.com
```

### Variables Optionnelles

```bash
# MS Teams SSO
export TEAMS_SSO_ENABLED=true
export TEAMS_TENANT_ID=your-tenant-id
export TEAMS_CLIENT_ID=your-client-id
export TEAMS_CLIENT_SECRET=your-client-secret

# AI Service
export AI_SERVICE_URL=http://your-ai-service:8000

# Désactiver features
export PHISHING_ENABLED=false
export SYNC_ENABLED=false
```

## 🐳 Déploiement Docker

### Build Image

```bash
docker build -t cybersensei-backend:1.0.0 .
```

### Tag et Push vers Registry

```bash
# Docker Hub
docker tag cybersensei-backend:1.0.0 yourcompany/cybersensei-backend:1.0.0
docker push yourcompany/cybersensei-backend:1.0.0

# AWS ECR
aws ecr get-login-password --region eu-west-1 | docker login --username AWS --password-stdin your-ecr-url
docker tag cybersensei-backend:1.0.0 your-ecr-url/cybersensei-backend:1.0.0
docker push your-ecr-url/cybersensei-backend:1.0.0

# Azure ACR
az acr login --name yourregistry
docker tag cybersensei-backend:1.0.0 yourregistry.azurecr.io/cybersensei-backend:1.0.0
docker push yourregistry.azurecr.io/cybersensei-backend:1.0.0
```

### Run Container

```bash
docker run -d \
  --name cybersensei-backend \
  -p 8080:8080 \
  -e DB_HOST=postgres \
  -e DB_PASSWORD=secure-password \
  -e JWT_SECRET=your-secret \
  --restart unless-stopped \
  cybersensei-backend:1.0.0
```

## ☸️ Déploiement Kubernetes

### Fichiers Kubernetes (exemples)

**deployment.yaml**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cybersensei-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: cybersensei-backend
  template:
    metadata:
      labels:
        app: cybersensei-backend
    spec:
      containers:
      - name: backend
        image: yourregistry/cybersensei-backend:1.0.0
        ports:
        - containerPort: 8080
        env:
        - name: DB_HOST
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: host
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: password
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: jwt-secret
              key: secret
        livenessProbe:
          httpGet:
            path: /api/health
            port: 8080
          initialDelaySeconds: 60
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 5
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
```

**service.yaml**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: cybersensei-backend
spec:
  selector:
    app: cybersensei-backend
  ports:
  - port: 80
    targetPort: 8080
  type: LoadBalancer
```

**secrets.yaml**
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-secret
type: Opaque
stringData:
  host: postgres-service
  password: your-secure-password

---
apiVersion: v1
kind: Secret
metadata:
  name: jwt-secret
type: Opaque
stringData:
  secret: your-256-bit-jwt-secret
```

### Déployer

```bash
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

# Vérifier
kubectl get pods
kubectl logs -f deployment/cybersensei-backend
```

## 🌐 Reverse Proxy (Nginx)

### Configuration Nginx

```nginx
upstream cybersensei_backend {
    server localhost:8080;
}

server {
    listen 80;
    server_name cybersensei.yourcompany.com;
    
    # Redirect to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name cybersensei.yourcompany.com;
    
    ssl_certificate /etc/ssl/certs/cybersensei.crt;
    ssl_certificate_key /etc/ssl/private/cybersensei.key;
    
    location / {
        proxy_pass http://cybersensei_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support (si nécessaire)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## 📊 Monitoring Production

### Prometheus

**prometheus.yml**
```yaml
scrape_configs:
  - job_name: 'cybersensei'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['cybersensei-backend:8080']
```

### Grafana Dashboard

Importer le dashboard depuis:
- Spring Boot 2.1 Statistics (ID: 6756)
- JVM (Micrometer) (ID: 4701)

### Alerting

```yaml
# alerts.yml
groups:
- name: cybersensei
  rules:
  - alert: HighErrorRate
    expr: rate(http_server_requests_seconds_count{status="500"}[5m]) > 0.05
    for: 5m
    labels:
      severity: critical
    annotations:
      summary: "High error rate detected"
```

## 🔐 Sécurité Production

### Checklist

- [ ] Changer `JWT_SECRET` (minimum 256 bits)
- [ ] Utiliser mots de passe forts pour DB
- [ ] Activer HTTPS uniquement
- [ ] Configurer CORS strictement
- [ ] Activer rate limiting
- [ ] Scanner vulnérabilités (Trivy, Snyk)
- [ ] Chiffrer secrets (Vault, AWS Secrets Manager)
- [ ] Désactiver actuator endpoints publics
- [ ] Configurer firewall (security groups)
- [ ] Activer logging audit

### Rotation Secrets

```bash
# Générer nouveau JWT secret
openssl rand -base64 32

# Mettre à jour
kubectl create secret generic jwt-secret \
  --from-literal=secret=NEW_SECRET \
  --dry-run=client -o yaml | kubectl apply -f -

# Redéployer
kubectl rollout restart deployment/cybersensei-backend
```

## 📈 Scaling

### Horizontal Pod Autoscaling (K8s)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: cybersensei-backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: cybersensei-backend
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### Database Scaling

- **Read replicas** pour queries lourdes
- **Connection pooling** (HikariCP déjà configuré)
- **Caching** (Redis pour sessions futures)

## 🔄 CI/CD Pipeline

### GitLab CI (.gitlab-ci.yml)

```yaml
stages:
  - build
  - test
  - deploy

build:
  stage: build
  script:
    - mvn clean package -DskipTests
  artifacts:
    paths:
      - target/*.jar

test:
  stage: test
  script:
    - mvn verify

deploy-prod:
  stage: deploy
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_TAG .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_TAG
    - kubectl set image deployment/cybersensei-backend backend=$CI_REGISTRY_IMAGE:$CI_COMMIT_TAG
  only:
    - tags
```

## 🆘 Troubleshooting

### Logs

```bash
# Docker
docker logs -f cybersensei-backend

# Kubernetes
kubectl logs -f deployment/cybersensei-backend

# Fichier
tail -f logs/cybersensei.log
```

### Health Check

```bash
curl http://localhost:8080/api/health
curl http://localhost:8080/actuator/health
```

### Database Connection

```bash
# Tester depuis le pod
kubectl exec -it cybersensei-backend-xxx -- sh
wget --spider http://postgres:5432
```

---

**Support**: support@cybersensei.io  
**Documentation**: https://docs.cybersensei.io


