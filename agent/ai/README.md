# CyberSensei AI Service 🤖

Microservice IA basé sur **Mistral 7B Instruct** avec **llama.cpp** et **FastAPI**.

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         CyberSensei Backend             │
│      (Spring Boot - Port 8080)          │
└───────────────┬─────────────────────────┘
                │ POST /api/ai/chat
                ↓
┌─────────────────────────────────────────┐
│          AI Service Container           │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │      FastAPI Server (8000)       │  │
│  │         server.py                │  │
│  └────────────┬─────────────────────┘  │
│               │ HTTP                    │
│               ↓                         │
│  ┌──────────────────────────────────┐  │
│  │   llama.cpp Server (8001)        │  │
│  │   Mistral 7B Instruct Q4_K_M     │  │
│  └──────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

## 📋 Spécifications

- **Modèle**: Mistral 7B Instruct v0.2 (GGUF)
- **Quantization**: Q4_K_M (~4.1 GB)
- **Runtime**: llama.cpp server
- **API**: FastAPI (Python 3.11)
- **Context**: 4096 tokens
- **Language**: Français
- **RAG**: In-memory knowledge base with keyword/topic matching
- **Features**: Personalized responses, topic suggestions, risk hints

## 🚀 Installation

### Prérequis

- Docker & Docker Compose
- ~5 GB d'espace disque (modèle + image)
- 8 GB RAM minimum (16 GB recommandé)

### 1. Télécharger le Modèle

Le modèle n'est **pas inclus** dans l'image Docker. Vous devez le télécharger :

**Option A: wget (recommandé)**
```bash
mkdir -p models
cd models
wget https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF/resolve/main/mistral-7b-instruct-v0.2.Q4_K_M.gguf -O mistral-7b-instruct.Q4_K_M.gguf
```

**Option B: curl**
```bash
mkdir -p models
cd models
curl -L https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF/resolve/main/mistral-7b-instruct-v0.2.Q4_K_M.gguf -o mistral-7b-instruct.Q4_K_M.gguf
```

**Option C: Téléchargement manuel**
1. Aller sur [Hugging Face](https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF)
2. Télécharger `mistral-7b-instruct-v0.2.Q4_K_M.gguf` (~4.1 GB)
3. Placer dans le dossier `models/` et renommer en `mistral-7b-instruct.Q4_K_M.gguf`

**Vérification:**
```bash
ls -lh models/mistral-7b-instruct.Q4_K_M.gguf
# Doit afficher ~4.1G
```

### 2. Build de l'Image Docker

```bash
docker build -t cybersensei-ai:latest .
```

**Build time**: ~5-10 minutes (compilation llama.cpp)

### 3. Lancer le Service

**Option A: Docker simple**
```bash
docker run -d \
  --name cybersensei-ai \
  -p 8000:8000 \
  -v $(pwd)/models:/app/models \
  cybersensei-ai:latest
```

**Option B: Docker Compose (recommandé)**
```bash
docker-compose up -d
```

### 4. Vérifier le Statut

```bash
# Health check
curl http://localhost:8000/health

# Logs
docker logs -f cybersensei-ai
```

## 📡 API Endpoints

### POST /api/ai/chat

**Request (CyberSensei format with RAG):**
```bash
curl -X POST http://localhost:8000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-123",
    "role": "EMPLOYEE",
    "message": "Qu'\''est-ce que le phishing ?",
    "context": {
      "topic": "PHISHING",
      "difficulty": "EASY",
      "lastResults": {
        "score": 7,
        "maxScore": 10
      }
    },
    "temperature": 0.7,
    "max_tokens": 512
  }'
```

**Response:**
```json
{
  "response": "Le phishing est une technique d'escroquerie par email visant à obtenir des informations personnelles. Les attaquants se font passer pour des entités de confiance...",
  "suggestedNextExerciseTopic": "PASSWORDS",
  "riskHints": [
    "Vérifiez toujours l'expéditeur avant de cliquer sur un lien",
    "Cherchez les fautes d'orthographe dans les emails suspects",
    "Ne partagez jamais vos identifiants par email"
  ]
}
```

**Paramètres:**

| Paramètre | Type | Default | Description |
|-----------|------|---------|-------------|
| `userId` | string | null | ID utilisateur pour personnalisation |
| `role` | string | "EMPLOYEE" | Rôle (EMPLOYEE, MANAGER, ADMIN) |
| `message` | string | **required** | Question/message de l'utilisateur |
| `context` | object | null | Contexte d'apprentissage |
| `context.topic` | string | null | Sujet actuel (PHISHING, PASSWORDS, etc.) |
| `context.difficulty` | string | null | Niveau (EASY, MEDIUM, HARD) |
| `context.lastResults` | object | null | Derniers résultats d'exercice |
| `temperature` | float | 0.7 | Créativité (0.0-2.0) |
| `max_tokens` | int | 512 | Tokens maximum à générer |

**Topics supportés pour RAG:**
- `PHISHING` - Attaques par email/SMS
- `PASSWORDS` - Gestion des mots de passe
- `MALWARE` - Virus et logiciels malveillants
- `SOCIAL_ENGINEERING` - Ingénierie sociale
- `NETWORK_SECURITY` - Sécurité réseau
- `DATA_PROTECTION` - Protection des données

### GET /health

**Request:**
```bash
curl http://localhost:8000/health
```

**Response:**
```json
{
  "status": "healthy",
  "llama_server": "healthy",
  "model_loaded": true,
  "model_path": "/app/models/mistral-7b-instruct.Q4_K_M.gguf"
}
```

### GET /

**Request:**
```bash
curl http://localhost:8000/
```

**Response:**
```json
{
  "service": "CyberSensei AI",
  "version": "1.0.0",
  "model": "Mistral 7B Instruct",
  "status": "operational",
  "endpoints": {
    "chat": "POST /api/ai/chat",
    "health": "GET /health"
  }
}
```

## 🔧 Configuration

### Variables d'Environnement

```bash
# Modèle
MODEL_PATH=/app/models/mistral-7b-instruct.Q4_K_M.gguf

# llama.cpp server
LLAMA_HOST=127.0.0.1
LLAMA_PORT=8001
CONTEXT_SIZE=4096
THREADS=4

# FastAPI
API_PORT=8000
```

### Docker Compose

```yaml
version: '3.8'

services:
  ai:
    build: .
    container_name: cybersensei-ai
    ports:
      - "8000:8000"
    volumes:
      - ./models:/app/models
    environment:
      - MODEL_PATH=/app/models/mistral-7b-instruct.Q4_K_M.gguf
      - CONTEXT_SIZE=4096
      - THREADS=4
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
```

## 🧪 Tests

### Test Manuel

```python
import requests

response = requests.post(
    "http://localhost:8000/api/ai/chat",
    json={
        "prompt": "Explique-moi ce qu'est un ransomware",
        "max_tokens": 256
    }
)

print(response.json()["response"])
```

### Test cURL

```bash
# Question simple
curl -X POST http://localhost:8000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Comment créer un mot de passe sécurisé ?"}'

# Avec contexte
curl -X POST http://localhost:8000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Donne-moi 3 exemples",
    "context": "Nous parlons de techniques de phishing courantes"
  }'
```

## 🎯 Intégration Backend

### Spring Boot (cybersensei-node-backend)

```yaml
# application.yml
cybersensei:
  ai:
    service-url: http://ai:8000
    timeout: 30000
```

```java
// AIService.java
@Service
public class AIService {
    @Value("${cybersensei.ai.service-url}")
    private String aiServiceUrl;
    
    public AIChatResponse chat(AIChatRequest request) {
        WebClient webClient = WebClient.builder()
            .baseUrl(aiServiceUrl)
            .build();
            
        return webClient.post()
            .uri("/api/ai/chat")
            .bodyValue(request)
            .retrieve()
            .bodyToMono(AIChatResponse.class)
            .block();
    }
}
```

## 📊 Performance

### Benchmarks

**Hardware**: CPU 4 cores, 8GB RAM

| Metric | Value |
|--------|-------|
| Startup time | ~30-60s |
| First request | ~5-10s |
| Subsequent requests | ~2-5s |
| Tokens/sec | ~10-20 |
| Memory usage | ~4.5 GB |

### Optimisations

**GPU Support (NVIDIA):**
```bash
docker run --gpus all \
  -e N_GPU_LAYERS=35 \
  cybersensei-ai:latest
```

**Plus de threads:**
```bash
docker run -e THREADS=8 cybersensei-ai:latest
```

**Context réduit (moins de RAM):**
```bash
docker run -e CONTEXT_SIZE=2048 cybersensei-ai:latest
```

## 🐛 Troubleshooting

### Problème: Modèle non trouvé

**Erreur:**
```
❌ Error: Model file not found at /app/models/mistral-7b-instruct.Q4_K_M.gguf
```

**Solution:**
```bash
# Vérifier le volume
docker exec cybersensei-ai ls -lh /app/models/

# Télécharger le modèle
wget https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF/resolve/main/mistral-7b-instruct-v0.2.Q4_K_M.gguf -O models/mistral-7b-instruct.Q4_K_M.gguf
```

### Problème: Out of Memory

**Erreur:**
```
llama.cpp: error: failed to load model
```

**Solution:**
```bash
# Utiliser un modèle plus petit (Q3_K_S ~2.9GB)
wget https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF/resolve/main/mistral-7b-instruct-v0.2.Q3_K_S.gguf

# Ou réduire le context
docker run -e CONTEXT_SIZE=2048 cybersensei-ai:latest
```

### Problème: Réponses lentes

**Solution:**
```bash
# Plus de threads
docker run -e THREADS=8 cybersensei-ai:latest

# Réduire max_tokens
curl -d '{"prompt": "test", "max_tokens": 256}'
```

### Problème: llama.cpp crash

**Logs:**
```bash
docker logs cybersensei-ai
```

**Restart:**
```bash
docker restart cybersensei-ai
```

## 📚 Modèles Alternatifs

### Mistral 7B (autres quantizations)

| Quantization | Taille | RAM | Qualité |
|--------------|--------|-----|---------|
| Q2_K | 2.5 GB | 5 GB | Faible |
| Q3_K_S | 2.9 GB | 5.5 GB | Moyenne |
| Q4_K_M | 4.1 GB | 6.5 GB | **Recommandé** |
| Q5_K_M | 4.8 GB | 7.3 GB | Haute |
| Q8_0 | 7.2 GB | 9.7 GB | Très haute |

### Autres Modèles

**Llama 2 7B Chat:**
```bash
wget https://huggingface.co/TheBloke/Llama-2-7B-Chat-GGUF/resolve/main/llama-2-7b-chat.Q4_K_M.gguf
```

**Phi-2 (plus léger, 2.7B):**
```bash
wget https://huggingface.co/TheBloke/phi-2-GGUF/resolve/main/phi-2.Q4_K_M.gguf
```

## 🔒 Sécurité

### Production

1. **Limiter CORS:**
```python
# server.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://cybersensei.company.com"],
    allow_credentials=True,
    allow_methods=["POST"],
    allow_headers=["*"],
)
```

2. **Rate Limiting:**
```python
from fastapi_limiter import FastAPILimiter

@app.post("/api/ai/chat")
@limiter.limit("10/minute")
async def chat(request: ChatRequest):
    ...
```

3. **API Key:**
```python
from fastapi import Header

@app.post("/api/ai/chat")
async def chat(request: ChatRequest, api_key: str = Header(...)):
    if api_key != os.getenv("API_KEY"):
        raise HTTPException(status_code=401)
    ...
```

## 📈 Monitoring

### Métriques

```bash
# CPU/RAM usage
docker stats cybersensei-ai

# Logs en temps réel
docker logs -f cybersensei-ai

# Health check continu
watch -n 5 curl -s http://localhost:8000/health
```

### Prometheus (optionnel)

```python
# requirements.txt
prometheus-client==0.19.0

# server.py
from prometheus_client import Counter, Histogram

requests_total = Counter('ai_requests_total', 'Total requests')
response_time = Histogram('ai_response_seconds', 'Response time')
```

## 🚀 Déploiement

### Docker Swarm

```bash
docker stack deploy -c docker-compose.yml cybersensei
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: cybersensei-ai
spec:
  replicas: 1
  template:
    spec:
      containers:
      - name: ai
        image: cybersensei-ai:latest
        ports:
        - containerPort: 8000
        resources:
          limits:
            memory: "6Gi"
            cpu: "2"
```

## 📝 Licence

Proprietary - CyberSensei Platform

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/cybersensei/issues)
- **Email**: ai@cybersensei.io
- **Docs**: [docs.cybersensei.io](https://docs.cybersensei.io)

---

**Version**: 1.0.0  
**Model**: Mistral 7B Instruct v0.2  
**Runtime**: llama.cpp  
**Maintainer**: CyberSensei Team


