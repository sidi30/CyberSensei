# 💬 CyberSensei Teams App - Microsoft Teams Extension

> **Native Microsoft Teams integration for cybersecurity training**

---

## 📋 Overview

**CyberSensei Teams App** brings cybersecurity training directly into Microsoft Teams with:

- 📱 **Personal Tabs** (Employee & Manager views)
- 🤖 **Conversational Bot** with AI
- 🔔 **Proactive Notifications** for training
- 🔐 **SSO Integration** with Microsoft 365
- 📊 **In-app Analytics** and reports

---

## 🏗️ Architecture

```
cybersensei-teams-app/
├── tabs/                 # React Tabs Application
│   ├── src/
│   ├── package.json
│   └── README.md
│
├── bot/                  # Bot Framework Bot
│   ├── src/
│   ├── package.json
│   └── README.md
│
└── manifest/             # Teams App Manifest
    ├── manifest.json
    ├── color.png
    ├── outline.png
    └── README.md
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **Microsoft 365** Developer Account
- **Teams** Desktop or Web client
- **ngrok** or Azure tunnel (for local dev)

### Setup

```bash
# 1. Clone repository
cd cybersensei-teams-app

# 2. Install dependencies
cd tabs && npm install
cd ../bot && npm install

# 3. Setup environment
cp .env.example .env
# Edit .env with your Bot credentials

# 4. Start ngrok (for local dev)
ngrok http 3978

# 5. Update manifest with ngrok URL
cd manifest
# Edit manifest.json

# 6. Run tabs
cd ../tabs
npm run dev

# 7. Run bot (separate terminal)
cd ../bot
npm start
```

### Sideload to Teams

1. Zip the `manifest/` folder
2. Go to Teams → Apps → Upload a custom app
3. Select the zip file
4. Add to a team or use personally

---

## 📦 Components

### 1. Tabs (React)

**Employee Tab:**
- ✅ Daily quiz
- ✅ AI chat interface
- ✅ Progress dashboard
- ✅ Training history

**Manager Tab:**
- ✅ Team overview
- ✅ Individual user details
- ✅ Company metrics
- ✅ Campaign management

**Tech Stack:**
- React 18 + TypeScript
- Teams UI Kit (@fluentui/react)
- Microsoft Teams SDK
- Axios

📖 [Tabs Documentation](./tabs/README.md)

---

### 2. Bot (Bot Framework)

**Features:**
- ✅ Conversational interface
- ✅ Quiz delivery via bot
- ✅ Training reminders
- ✅ AI-powered responses
- ✅ Proactive messages

**Commands:**
- `/quiz` - Get daily quiz
- `/progress` - View progress
- `/help` - Show help
- Natural language queries to AI

**Tech Stack:**
- Bot Framework SDK v4
- Node.js + TypeScript
- Azure Bot Service
- Adaptive Cards

📖 [Bot Documentation](./bot/README.md)

---

### 3. Manifest

**Configuration:**
- App metadata
- Tab configuration
- Bot configuration
- Permissions
- Icons

📖 [Manifest Documentation](./manifest/README.md)

---

## 🔧 Features

### Personal Tabs

#### Employee Tab

```typescript
// Embedded in Teams
- View daily exercise
- Submit quiz answers
- Chat with CyberSensei AI
- Track personal progress
- Review past exercises
```

#### Manager Tab

```typescript
// Team management
- View team metrics
- User performance
- Risk assessment
- Campaign results
- Export reports
```

### Conversational Bot

```typescript
// Interactive bot
User: "What is phishing?"
Bot: [AI-generated explanation]

User: "/quiz"
Bot: [Adaptive Card with quiz]

User: "/progress"
Bot: [Progress summary]
```

### Notifications

```typescript
// Proactive messages
- Daily training reminder
- Quiz available
- Phishing simulation alert
- Achievement unlocked
- Manager: Team alerts
```

---

## 🗄️ Integration with Backend

### API Calls

The Teams app connects to CyberSensei Node backend:

```typescript
// Auth with Teams SSO token
const teamsToken = await microsoftTeams.authentication.getAuthToken();

// Exchange for backend JWT
const backendToken = await api.post('/auth/teams', { teamsToken });

// Use backend API
const user = await api.get('/user/me', {
  headers: { Authorization: `Bearer ${backendToken}` }
});
```

### SSO Flow

```
Teams Client
    │
    ├─ 1. Get Teams Token
    │
    ▼
Teams App (Tab/Bot)
    │
    ├─ 2. Exchange Token
    │
    ▼
CyberSensei Backend
    │
    ├─ 3. Validate Token
    │
    ├─ 4. Return JWT
    │
    ▼
Teams App
    │
    └─ 5. Use JWT for API calls
```

---

## 🔐 Security

### Authentication

- Microsoft 365 SSO
- Teams token validation
- Backend JWT exchange
- Secure token storage

### Permissions

```json
{
  "permissions": [
    "identity",
    "messageTeamMembers"
  ],
  "validDomains": [
    "cybersensei.your-domain.com",
    "*.ngrok.io"
  ]
}
```

---

## 📱 Adaptive Cards

### Quiz Card

```json
{
  "type": "AdaptiveCard",
  "body": [
    {
      "type": "TextBlock",
      "text": "Daily Cybersecurity Quiz",
      "weight": "Bolder",
      "size": "Large"
    },
    {
      "type": "TextBlock",
      "text": "What is the primary purpose of a firewall?",
      "wrap": true
    },
    {
      "type": "Input.ChoiceSet",
      "id": "answer",
      "choices": [
        { "title": "Block all network traffic", "value": "A" },
        { "title": "Filter network traffic", "value": "B" },
        { "title": "Encrypt data", "value": "C" }
      ]
    }
  ],
  "actions": [
    {
      "type": "Action.Submit",
      "title": "Submit",
      "data": { "action": "submitQuiz" }
    }
  ]
}
```

---

## 🧪 Testing

### Local Testing

```bash
# Tabs
cd tabs
npm test

# Bot
cd bot
npm test

# E2E with Bot Framework Emulator
# Download: https://github.com/Microsoft/BotFramework-Emulator
```

### Teams Testing

1. Use [Teams Toolkit](https://aka.ms/teams-toolkit) for VS Code
2. Or manually sideload app
3. Test in Teams web or desktop

---

## 🚀 Deployment

### Azure Deployment

```bash
# Deploy Bot
cd bot
az bot create --resource-group <rg> --name <bot-name>
npm run build
az webapp deploy --src-path ./dist

# Deploy Tabs (Static Web App)
cd tabs
npm run build
az staticwebapp create --name <app-name>
```

### Update Manifest

```json
{
  "tabs": [
    {
      "configurationUrl": "https://your-app.azurewebsites.net/config",
      "contentUrl": "https://your-app.azurewebsites.net/tabs/employee"
    }
  ],
  "bots": [
    {
      "botId": "<your-bot-id>",
      "scopes": ["personal", "team"]
    }
  ]
}
```

---

## 📊 Analytics

### Track Usage

```typescript
// In tabs
import { app } from "@microsoft/teams-js";

app.initialize().then(() => {
  // Track page view
  analytics.track('TabView', {
    tab: 'employee',
    userId: context.user.id
  });
});
```

### Bot Analytics

```typescript
// In bot
this.onMessage(async (context, next) => {
  // Track message
  analytics.track('BotMessage', {
    userId: context.activity.from.id,
    message: context.activity.text
  });
  
  await next();
});
```

---

## 🔄 CI/CD

GitHub Actions workflows:

- `.github/workflows/teams-tabs.yml`
- `.github/workflows/teams-bot.yml`
- `.github/workflows/teams-deploy.yml`

---

## 📚 Documentation

- [Tabs Guide](./tabs/README.md)
- [Bot Guide](./bot/README.md)
- [Manifest Guide](./manifest/README.md)
- [SSO Setup](./docs/SSO.md)
- [Deployment](./docs/DEPLOYMENT.md)

---

## 🛠️ Development

### Debug Tabs

```bash
cd tabs
npm run dev
# Open in Teams with https://localhost:3000
```

### Debug Bot

```bash
cd bot
npm run dev
# Use Bot Framework Emulator
# Connect to http://localhost:3978/api/messages
```

---

## 📋 Manifest Reference

### Key Fields

```json
{
  "id": "<app-id>",
  "version": "1.0.0",
  "name": {
    "short": "CyberSensei",
    "full": "CyberSensei - Cybersecurity Training"
  },
  "description": {
    "short": "AI-powered cybersecurity training",
    "full": "Complete cybersecurity training platform..."
  },
  "developer": {
    "name": "Your Company",
    "websiteUrl": "https://cybersensei.io",
    "privacyUrl": "https://cybersensei.io/privacy",
    "termsOfUseUrl": "https://cybersensei.io/terms"
  }
}
```

---

## 🤝 Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) at repository root.

---

## 📝 License

MIT License - See [LICENSE](../LICENSE)

---

## 📞 Resources

- [Teams Platform Docs](https://docs.microsoft.com/microsoftteams/platform/)
- [Bot Framework Docs](https://docs.microsoft.com/azure/bot-service/)
- [Teams Toolkit](https://aka.ms/teams-toolkit)
- [Adaptive Cards](https://adaptivecards.io/)

---

**Version**: 1.0.0  
**Status**: 🚧 In Development

