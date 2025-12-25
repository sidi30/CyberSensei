# 📛 GitHub Actions Status Badges

Ajouter ces badges au README.md principal :

```markdown
## 🚀 CI/CD Status

[![Central Backend](https://github.com/{owner}/cybersensei/actions/workflows/central-backend.yml/badge.svg?branch=main)](https://github.com/{owner}/cybersensei/actions/workflows/central-backend.yml)
[![Central Dashboard](https://github.com/{owner}/cybersensei/actions/workflows/central-dashboard.yml/badge.svg?branch=main)](https://github.com/{owner}/cybersensei/actions/workflows/central-dashboard.yml)
[![Node Backend](https://github.com/{owner}/cybersensei/actions/workflows/node-backend.yml/badge.svg?branch=main)](https://github.com/{owner}/cybersensei/actions/workflows/node-backend.yml)
[![Node AI](https://github.com/{owner}/cybersensei/actions/workflows/node-ai.yml/badge.svg?branch=main)](https://github.com/{owner}/cybersensei/actions/workflows/node-ai.yml)
[![Node Dashboard](https://github.com/{owner}/cybersensei/actions/workflows/node-dashboard.yml/badge.svg?branch=main)](https://github.com/{owner}/cybersensei/actions/workflows/node-dashboard.yml)
[![Teams App](https://github.com/{owner}/cybersensei/actions/workflows/teams-app.yml/badge.svg?branch=main)](https://github.com/{owner}/cybersensei/actions/workflows/teams-app.yml)

## 📦 Docker Images

Toutes les images sont disponibles sur GitHub Container Registry (GHCR):

- **Central Backend**: `ghcr.io/{owner}/cybersensei/central-backend:latest`
- **Central Dashboard**: `ghcr.io/{owner}/cybersensei/central-dashboard:latest`
- **Node Backend**: `ghcr.io/{owner}/cybersensei/node-backend:latest`
- **Node AI**: `ghcr.io/{owner}/cybersensei/node-ai:latest`
- **Node Dashboard**: `ghcr.io/{owner}/cybersensei/node-dashboard:latest`

```bash
# Pull une image
docker pull ghcr.io/{owner}/cybersensei/central-backend:latest

# Run l'image
docker run -p 3000:3000 ghcr.io/{owner}/cybersensei/central-backend:latest
```
```

---

## Badges Alternatifs

### Avec Logo GitHub

```markdown
[![CI](https://img.shields.io/github/actions/workflow/status/{owner}/cybersensei/central-backend.yml?branch=main&logo=github&label=Central%20Backend)](https://github.com/{owner}/cybersensei/actions/workflows/central-backend.yml)
```

### Style Shields.io

```markdown
![Central Backend](https://img.shields.io/github/actions/workflow/status/{owner}/cybersensei/central-backend.yml?branch=main&style=flat-square&label=Central%20Backend)
![Central Dashboard](https://img.shields.io/github/actions/workflow/status/{owner}/cybersensei/central-dashboard.yml?branch=main&style=flat-square&label=Central%20Dashboard)
![Node Backend](https://img.shields.io/github/actions/workflow/status/{owner}/cybersensei/node-backend.yml?branch=main&style=flat-square&label=Node%20Backend)
![Node AI](https://img.shields.io/github/actions/workflow/status/{owner}/cybersensei/node-ai.yml?branch=main&style=flat-square&label=Node%20AI)
![Node Dashboard](https://img.shields.io/github/actions/workflow/status/{owner}/cybersensei/node-dashboard.yml?branch=main&style=flat-square&label=Node%20Dashboard)
![Teams App](https://img.shields.io/github/actions/workflow/status/{owner}/cybersensei/teams-app.yml?branch=main&style=flat-square&label=Teams%20App)
```

### Avec Coverage Badges (Codecov)

```markdown
[![Coverage](https://codecov.io/gh/{owner}/cybersensei/branch/main/graph/badge.svg?flag=central-backend)](https://codecov.io/gh/{owner}/cybersensei)
[![Coverage](https://codecov.io/gh/{owner}/cybersensei/branch/main/graph/badge.svg?flag=node-backend)](https://codecov.io/gh/{owner}/cybersensei)
```

---

## Variables à Remplacer

Remplacer `{owner}` par votre nom d'utilisateur ou organisation GitHub :

- `{owner}` → Votre username GitHub (ex: `johndoe`)
- `{owner}/cybersensei` → `johndoe/cybersensei`

Exemple complet :

```markdown
[![Central Backend](https://github.com/johndoe/cybersensei/actions/workflows/central-backend.yml/badge.svg)](https://github.com/johndoe/cybersensei/actions/workflows/central-backend.yml)
```

