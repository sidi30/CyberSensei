# Quick Start - CyberSensei AI Service

## ⚡ Installation Rapide (5 minutes)

### 1️⃣ Télécharger le Modèle

```bash
mkdir models
cd models
wget https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF/resolve/main/mistral-7b-instruct-v0.2.Q4_K_M.gguf -O mistral-7b-instruct.Q4_K_M.gguf
cd ..
```

**⏱️ Temps**: ~5-10 min (dépend de votre connexion)  
**📦 Taille**: 4.1 GB

### 2️⃣ Build Docker

```bash
docker build -t cybersensei-ai:latest .
```

**⏱️ Temps**: ~5-10 min (compilation llama.cpp)

### 3️⃣ Lancer

```bash
docker-compose up -d
```

**⏱️ Temps**: ~30-60s (chargement du modèle)

### 4️⃣ Tester

```bash
# Health check
curl http://localhost:8000/health

# Test chat
curl -X POST http://localhost:8000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Qu'\''est-ce que le phishing ?"}'
```

---

## 🎯 Commandes Essentielles

### Logs
```bash
docker logs -f cybersensei-ai
```

### Restart
```bash
docker restart cybersensei-ai
```

### Stop
```bash
docker-compose down
```

### Stats
```bash
docker stats cybersensei-ai
```

---

## 🔥 Test Complet

```python
import requests

# Chat simple
response = requests.post(
    "http://localhost:8000/api/ai/chat",
    json={"prompt": "Comment créer un mot de passe sécurisé ?"}
)

print(response.json()["response"])
```

---

## 📊 Requis Système

| Composant | Minimum | Recommandé |
|-----------|---------|------------|
| CPU | 2 cores | 4+ cores |
| RAM | 6 GB | 16 GB |
| Disk | 10 GB | 20 GB |
| Docker | 20.10+ | 24.0+ |

---

## 🐛 Problèmes Courants

### ❌ Modèle non trouvé
```bash
# Vérifier
ls -lh models/mistral-7b-instruct.Q4_K_M.gguf

# Re-télécharger
rm models/*.gguf
wget https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF/resolve/main/mistral-7b-instruct-v0.2.Q4_K_M.gguf -O models/mistral-7b-instruct.Q4_K_M.gguf
```

### ❌ Out of Memory
```bash
# Réduire le context
docker run -e CONTEXT_SIZE=2048 cybersensei-ai:latest
```

### ❌ Port occupé
```bash
# Changer le port
docker run -p 8888:8000 cybersensei-ai:latest
```

---

## 🚀 Production

```bash
# Build avec tag
docker build -t registry.company.com/cybersensei-ai:1.0.0 .

# Push
docker push registry.company.com/cybersensei-ai:1.0.0

# Deploy
docker stack deploy -c docker-compose.yml cybersensei
```

---

## 📚 Documentation Complète

Voir [README.md](README.md) pour la documentation complète.

---

**Temps total**: ~15-20 minutes ⚡  
**Prêt à l'emploi** ✅


