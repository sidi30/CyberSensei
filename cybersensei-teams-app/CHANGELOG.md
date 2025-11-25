# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [1.0.0] - 2024-11-24

### Ajouté

#### Onglet Employee
- Interface utilisateur pour les employés
- Quiz quotidien avec soumission de réponses
- Historique des exercices complétés
- Chat avec l'assistant IA CyberSensei
- Intégration Microsoft Graph pour le profil utilisateur
- Support des thèmes Teams (clair/sombre)

#### Onglet Manager
- Tableau de bord avec métriques en temps réel
- Vue d'ensemble des scores de l'entreprise
- Tableau des utilisateurs avec recherche et filtres
- Graphiques par département
- Informations de licence avec alertes d'expiration
- Contrôle d'accès basé sur les rôles (MANAGER/ADMIN)

#### Bot CyberSensei Assistant
- Commande `quiz` - Lance le quiz du jour
- Commande `score` - Affiche les résultats
- Commande `help` - Affiche l'aide
- Commande `explain` - Obtient une explication
- Chat conversationnel avec IA
- Cartes adaptives pour une meilleure UX
- Support des conversations en équipe et personnelles

#### Infrastructure
- Module common partagé avec client API et Graph
- Configuration centralisée
- Scripts de build et packaging
- Support TypeScript complet
- Configuration ESLint
- Documentation complète

### Technique

#### Stack
- TypeScript 5.3
- React 18.2 avec Vite
- Node.js 18+
- Bot Framework SDK 4.21
- Fluent UI React Components
- Microsoft Teams JS SDK 2.19
- Microsoft Graph SDK 3.0
- Axios pour les requêtes HTTP

#### Architecture
- Architecture modulaire avec séparation des responsabilités
- Hooks React personnalisés pour la logique métier
- Client API typé pour le backend
- Adaptive Cards pour le bot
- Build optimisé avec Vite et webpack

## [Non publié]

### À venir
- Support multilingue
- Notifications push
- Mode hors ligne
- Tests unitaires et e2e
- Amélioration des performances
- Analytics avancées

