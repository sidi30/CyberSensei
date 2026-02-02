# 🛡️ CyberSensei

> **Plateforme de Formation en Cybersécurité avec IA Adaptive**  
> Conçue pour les PME et Organismes Publics

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🚀 **Démarrage Ultra-Rapide**

### **3 Commandes, 3 Choix :**

```powershell
# 🟢 DÉMO (2 minutes)
.\cybersensei.ps1 start minimal

# 🟡 DÉVELOPPEMENT (5 minutes)  
.\cybersensei.ps1 start node

# 🔴 PRODUCTION-LIKE (10 minutes)
.\cybersensei.ps1 start full
```

**Ou via Make (Linux/Mac) :**
```bash
make start-minimal    # Démo
make start-node       # Dev
make start-full       # Prod
```

---

## 🎯 **Qu'est-ce que CyberSensei ?**

**CyberSensei** forme vos équipes à la cybersécurité via :

- 🧠 **Coach IA conversationnel** (Mistral 7B) dans Microsoft Teams
- 🎣 **Simulations de phishing** réalistes et sécurisées  
- 📊 **Tableaux de bord managers** pour le suivi d'équipe
- 🏢 **Déploiement on-premise** (souveraineté des données)
- 🎮 **Gamification** : badges, progression, niveaux
- 📚 **160+ exercices** adaptatifs par niveau

---

## 🏗️ **Architecture**

```
cybersensei/
├── 🚀 cybersensei.ps1              # Script de lancement unifié
├── 📋 Makefile                     # Commandes cross-platform
├── 🐳 docker-compose.unified.yml   # Configuration Docker unique
├── ⚙️  .env.template               # Configuration centralisée
├── 📖 DEPLOYMENT_GUIDE.md         # Documentation complète
│
├── 📁 cybersensei-node/            # Solution On-Premise
│   ├── backend/     (Spring Boot + Java 21)
│   ├── dashboard/   (React + TypeScript)
│   └── ai/          (Python + Mistral 7B)
│
├── 📁 cybersensei-central/         # Platform SaaS Multi-tenant
│   ├── backend/     (NestJS + TypeScript)
│   └── dashboard/   (React Admin Panel)
│
├── 📁 cybersensei-teams-app/       # Microsoft Teams Integration
│   ├── bot/         (Teams Bot Framework)
│   └── tabs/        (React Teams Tabs)
│
├── 📁 cybersensei-website/         # Site Marketing
└── 📁 infra/terraform-local/       # Infrastructure as Code
```

---

## 🌐 **Services & Ports**

| Service | Port | URL | Description |
|---------|------|-----|-------------|
| **Node Dashboard** | 3005 | http://localhost:3005 | Interface utilisateur |
| **Node API** | 8080 | http://localhost:8080 | API Spring Boot |
| **Central Dashboard** | 5173 | http://localhost:5173 | Admin SaaS |
| **Central API** | 3006 | http://localhost:3006 | API NestJS |
| **Teams Bot** | 5175 | http://localhost:5175 | Bot conversationnel |
| **Node AI** | 8000 | http://localhost:8000 | Service IA Mistral |
| **Website** | 3002 | http://localhost:3002 | Site marketing |
| **PostgreSQL** | 5432 | localhost:5432 | Base de données |
| **PgAdmin** | 5050 | http://localhost:5050 | Interface DB |

---

## 💻 **Prérequis**

- ✅ **Docker Desktop** 24.0+ : [Télécharger](https://www.docker.com/products/docker-desktop/)
- ✅ **16 GB RAM** minimum (pour l'IA)
- ✅ **20 GB disque** libre

**Optionnel pour développement :**
- Node.js 18+, Java 21, Maven 3.9+

---

## 📦 **Modes de Déploiement**

### **🟢 Minimal** - Démo Rapide
```powershell
.\cybersensei.ps1 start minimal
```
- **Services** : Database + Node Dashboard
- **Temps** : ~2 minutes
- **RAM** : ~500 MB
- **Usage** : Démonstration interface

### **🟡 Node** - Développement  
```powershell
.\cybersensei.ps1 start node
```
- **Services** : Database + Node Backend + Dashboard + PgAdmin
- **Temps** : ~5 minutes  
- **RAM** : ~2 GB
- **Usage** : Développement, tests API

### **🟠 Central** - SaaS Admin
```powershell
.\cybersensei.ps1 start central
```
- **Services** : Database + Central Backend + Dashboard
- **Temps** : ~5 minutes
- **RAM** : ~2 GB
- **Usage** : Administration multi-tenant

### **🔴 Full** - Stack Complet
```powershell
.\cybersensei.ps1 start full
```
- **Services** : Tout (Node + Central + Teams + AI + Monitoring)
- **Temps** : ~10 minutes
- **RAM** : ~8 GB  
- **Usage** : Production-like, tests d'intégration

---

## 🔧 **Commandes Essentielles**

```powershell
# Démarrage
.\cybersensei.ps1 start [minimal|node|central|full]

# Gestion
.\cybersensei.ps1 status          # État des services
.\cybersensei.ps1 logs -Follow    # Logs en continu
.\cybersensei.ps1 stop            # Arrêter tout
.\cybersensei.ps1 clean -Force    # Reset complet

# Aide
.\cybersensei.ps1 help            # Documentation
```

**Linux/Mac :**
```bash
make start-node     # Démarrage
make status         # État  
make logs           # Logs
make stop          # Arrêt
make clean         # Reset
make help          # Aide
```

---

## 🎓 **Fonctionnalités**

### **Pour les Employés**
- ✅ Coach IA dans Teams (5 min/jour)
- ✅ 160+ exercices adaptatifs (Débutant → Avancé)
- ✅ Simulations phishing réalistes
- ✅ Gamification (badges, progression)
- ✅ Feedback immédiat et bienveillant

### **Pour les Managers**  
- ✅ Dashboard suivi d'équipe
- ✅ Niveau de risque par employé
- ✅ Taux de réussite simulations
- ✅ Rapports exportables
- ✅ Campagnes configurables

### **Pour les Admins IT**
- ✅ Déploiement on-premise
- ✅ Souveraineté des données
- ✅ Configuration SMTP personnalisée
- ✅ Branding entreprise
- ✅ Monitoring intégré

---

## 🔒 **Sécurité**

- ✅ **Données souveraines** : Déploiement on-premise
- ✅ **Chiffrement** : AES-256 pour les secrets
- ✅ **Conformité RGPD** : Mode anonymisation
- ✅ **Rate Limiting** : Protection anti-abus
- ✅ **Audit logs** : Traçabilité complète
- ✅ **HTTPS/TLS 1.3** : Production ready

---

## 📚 **Documentation**

- 📖 **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Guide complet de déploiement
- 🏗️ **Architecture détaillée** et diagrammes
- 🔧 **Résolution de problèmes**
- 💡 **Exemples d'usage**

---

## 🚨 **Résolution de Problèmes**

### **Port déjà utilisé**
```powershell
.\cybersensei.ps1 start node -Force   # Force le démarrage
```

### **Docker non démarré**
```powershell
# Le script vérifie automatiquement et guide l'utilisateur
.\cybersensei.ps1 start minimal
```

### **Reset complet**
```powershell
.\cybersensei.ps1 clean -Force        # Supprime tout
.\cybersensei.ps1 start node          # Redémarrage propre
```

---

## 📊 **Statut du Projet**

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Docker](https://img.shields.io/badge/docker-ready-blue)

- **Version** : 2.0.0
- **Phase** : Production Ready
- **Architecture** : Unifiée et standardisée
- **Déploiement** : 1-click via scripts

---

## 🤝 **Contribution**

```bash
git checkout -b feature/ma-fonctionnalite
git commit -m "feat: nouvelle fonctionnalité"
git push origin feature/ma-fonctionnalite
# Créer une Pull Request
```

---

## 📄 **Licence**

MIT License - Voir [LICENSE](LICENSE)

---

## 👥 **Équipe**

**CyberSensei Team** - Formation en cybersécurité

- 📧 Contact : contact@cybersensei.fr
- 💼 LinkedIn : [CyberSensei](https://www.linkedin.com/company/cybersensei)

---

**🚀 Prêt à sécuriser votre entreprise ?**

```powershell
.\cybersensei.ps1 start node
```

**Accès immédiat :** http://localhost:3005

---

**Fait avec ❤️ pour la cybersécurité**