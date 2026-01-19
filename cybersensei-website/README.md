# CyberSensei - Site Marketing

Site vitrine professionnel pour CyberSensei, la solution de sensibilisation cybersécurité B2B.

## 🚀 Technologies

- **Next.js 14** (App Router) + TypeScript
- **TailwindCSS** pour le styling
- **Framer Motion** pour les animations
- **shadcn/ui** pour les composants UI
- **Lucide React** pour les icônes

## 📦 Installation

```bash
# Cloner et naviguer
cd cybersensei-website

# Installer les dépendances
npm install

# Lancer en développement
npm run dev
```

Le site sera accessible sur [http://localhost:3001](http://localhost:3001)

## 🏗️ Structure

```
cybersensei-website/
├── app/
│   ├── layout.tsx          # Layout principal
│   ├── page.tsx            # Page d'accueil
│   ├── globals.css         # Styles globaux
│   ├── privacy/page.tsx    # Page Confidentialité
│   └── security/page.tsx   # Page Sécurité
├── components/
│   ├── Navbar.tsx          # Navigation
│   ├── ui/                 # Composants shadcn/ui
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   ├── accordion.tsx
│   │   ├── toast.tsx
│   │   └── toaster.tsx
│   └── sections/           # Sections de la landing
│       ├── Hero.tsx
│       ├── Problem.tsx
│       ├── HowItWorks.tsx
│       ├── Features.tsx
│       ├── Screens.tsx
│       ├── Security.tsx
│       ├── UseCases.tsx
│       ├── Pricing.tsx
│       ├── FAQ.tsx
│       ├── CTA.tsx
│       └── Footer.tsx
├── hooks/
│   └── use-toast.ts        # Hook pour les notifications
├── lib/
│   └── utils.ts            # Utilitaires
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 🎨 Design

- **Thème sombre** : Navy/Charcoal (#0a0f1f → #121b3a)
- **Accent** : Cyber Teal (#00e6b8)
- **Typographie** :
  - Display : Outfit
  - Body : Inter
  - Code : JetBrains Mono

## ✨ Fonctionnalités

- ✅ Responsive (mobile-first)
- ✅ Animations au scroll (Framer Motion)
- ✅ Formulaire de contact avec validation
- ✅ Toast notifications
- ✅ Accessibilité (focus states, contraste)
- ✅ SEO optimisé (metadata)
- ✅ Dark mode natif

## 📝 Sections

1. **Hero** - Accroche principale + CTA
2. **Problem** - Statistiques sur le risque humain
3. **How It Works** - 4 étapes du produit
4. **Features** - Grille de fonctionnalités
5. **Screens** - Aperçus interface (mockups)
6. **Security** - Souveraineté & vie privée
7. **Use Cases** - Secteurs d'activité
8. **Pricing** - 3 offres (Starter/Business/Enterprise)
9. **FAQ** - Questions fréquentes (accordion)
10. **CTA** - Formulaire de contact

## 🔧 Scripts

```bash
npm run dev      # Développement (port 3001)
npm run build    # Build production
npm run start    # Serveur production
npm run lint     # Linting ESLint
```

## 📧 Contact

Pour toute question : contact@cybersensei.fr

