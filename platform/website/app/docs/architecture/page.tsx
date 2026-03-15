"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Shield,
  Brain,
  Server,
  Database,
  Globe,
  Monitor,
  Bot,
  BarChart3,
  Lock,
  Eye,
  Zap,
  Users,
  Mail,
  Settings,
  FileText,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Terminal,
  Layers,
  Network,
  Cpu,
  HardDrive,
  Key,
  AlertTriangle,
  CheckCircle,
  BookOpen,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Play,
  Search,
  GraduationCap,
  Target,
  Activity,
  Gauge,
  ShieldCheck,
  Crown,
  ScanLine,
  FileWarning,
  Radar,
  ClipboardCheck,
  TrendingDown,
  Webhook,
} from "lucide-react";
// Navbar and Footer removed — provided by docs layout

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG - Set NEXT_PUBLIC_DOMAIN for production subdomain-based URLs
// Example: NEXT_PUBLIC_DOMAIN=gwani.fr
// Falls back to localhost with ports for local development
// ─────────────────────────────────────────────────────────────────────────────

const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || "";

const SUBDOMAIN_MAP: Record<string, string> = {
  "8080": DOMAIN ? `https://cs-node.${DOMAIN}` : "",
  "3005": DOMAIN ? `https://cs-node.${DOMAIN}` : "",
  "3006": DOMAIN ? `https://cs-api.${DOMAIN}` : "",
  "5173": DOMAIN ? `https://cs-app.${DOMAIN}` : "",
  "5174": DOMAIN ? `https://cs-m365.${DOMAIN}` : "",
  "3300": DOMAIN ? `https://cs-monitoring.${DOMAIN}` : "",
  "9090": DOMAIN ? `https://cs-monitoring.${DOMAIN}` : "",
  "5175": DOMAIN ? `https://cs-bot.${DOMAIN}` : "",
  "5050": "",
};

function buildUrl(port: string, path = ""): string {
  if (DOMAIN && SUBDOMAIN_MAP[port]) {
    return SUBDOMAIN_MAP[port] + path;
  }
  return `http://localhost:${port}${path}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface ServiceInfo {
  id: string;
  name: string;
  shortName: string;
  icon: React.ReactNode;
  color: string;
  port: string;
  tech: string;
  techIcon: string;
  profile: string;
  description: string;
  longDescription: string;
  features: string[];
  endpoints?: { method: string; path: string; desc: string }[];
  usage?: string[];
  webUrl?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────────────────

const services: ServiceInfo[] = [
  {
    id: "postgres",
    name: "PostgreSQL Database",
    shortName: "PostgreSQL",
    icon: <Database className="w-6 h-6" />,
    color: "#336791",
    port: "5432",
    tech: "PostgreSQL 15",
    techIcon: "🐘",
    profile: "always",
    description:
      "Base de donnees relationnelle principale stockant toutes les donnees structurees de la plateforme.",
    longDescription:
      "PostgreSQL est le coeur de stockage de CyberSensei. Il heberge plusieurs bases de donnees isolees : une pour le module Node (on-premise), une pour Central (SaaS), et une pour AI Security. Chaque module dispose de son propre schema pour garantir l'isolation des donnees. Les migrations sont gerees automatiquement par Hibernate (Node/AI Security) et Liquibase (Central).",
    features: [
      "Multi-database : cybersensei_db, cybersensei_central, cybersensei_ai_security",
      "Healthcheck automatique toutes les 10 secondes",
      "Volume persistant pour les donnees",
      "Script d'initialisation automatique des bases",
    ],
  },
  {
    id: "mongo",
    name: "MongoDB",
    shortName: "MongoDB",
    icon: <HardDrive className="w-6 h-6" />,
    color: "#47A248",
    port: "27017",
    tech: "MongoDB 6",
    techIcon: "🍃",
    profile: "central, full",
    description:
      "Base de donnees NoSQL utilisee par Central pour stocker les fichiers binaires (packages de mises a jour).",
    longDescription:
      "MongoDB est utilise exclusivement par le module Central (SaaS). Il sert principalement de stockage GridFS pour les packages de mises a jour ZIP distribues aux instances Node on-premise. Les metadonnees des mises a jour (version, changelog, checksum) sont stockees dans PostgreSQL, tandis que les fichiers binaires volumineux sont dans MongoDB.",
    features: [
      "GridFS pour les fichiers binaires (packages ZIP)",
      "Utilise uniquement par le backend Central",
      "Authentification avec utilisateur dedie",
      "Volume persistant pour les donnees",
    ],
  },
  {
    id: "node-backend",
    name: "Node Backend (On-Premise)",
    shortName: "Node Backend",
    webUrl: buildUrl("8080", "/swagger-ui.html"),
    icon: <Server className="w-6 h-6" />,
    color: "#6DB33F",
    port: "8080",
    tech: "Java 21 + Spring Boot",
    techIcon: "☕",
    profile: "node, full",
    description:
      "API REST principale gerant la formation cybersecurite, les quiz, le phishing et la progression des utilisateurs.",
    longDescription:
      "Le Node Backend est le moteur principal de la plateforme de formation on-premise. Il gere l'authentification JWT, les exercices de sensibilisation (QCM, vrai/faux, simulations), les campagnes de phishing, le systeme de progression avec badges et XP, le coaching IA personnalise, et le glossaire de cybersecurite. Il communique avec le service AI Security pour l'analyse des prompts.",
    features: [
      "Authentification JWT + SSO Microsoft Teams",
      "Gestion des exercices (QCM, Vrai/Faux, Simulations)",
      "Campagnes de phishing (creation, planification, resultats)",
      "Systeme de progression : badges, XP, niveaux, streaks",
      "Profil IA personnalise avec recommandations",
      "Glossaire cybersecurite (20+ termes)",
      "Dashboard Manager avec metriques entreprise",
      "Configuration SMTP pour les emails de phishing",
      "Gestion des licences",
    ],
    endpoints: [
      { method: "POST", path: "/api/auth/login", desc: "Connexion utilisateur" },
      { method: "GET", path: "/api/quiz/today", desc: "Quiz personnalise du jour" },
      { method: "POST", path: "/api/exercise/{id}/submit", desc: "Soumettre un exercice" },
      { method: "GET", path: "/api/manager/metrics", desc: "Metriques entreprise" },
      { method: "POST", path: "/api/phishing/campaigns", desc: "Creer une campagne" },
      { method: "GET", path: "/api/progression/dashboard/{userId}", desc: "Dashboard progression" },
      { method: "POST", path: "/api/ai/chat", desc: "Chat avec l'IA" },
      { method: "GET", path: "/api/glossary/all", desc: "Tous les termes du glossaire" },
    ],
    usage: [
      "Connectez-vous avec vos identifiants sur le dashboard Node",
      "Completez le quiz quotidien pour gagner de l'XP",
      "Consultez votre progression et vos badges",
      "Les managers peuvent voir les metriques de leur equipe",
      "Creez des campagnes de phishing pour tester vos employes",
    ],
  },
  {
    id: "node-dashboard",
    name: "Node Dashboard",
    shortName: "Dashboard Node",
    icon: <Monitor className="w-6 h-6" />,
    color: "#61DAFB",
    port: "3005",
    webUrl: buildUrl("3005"),
    tech: "React + TypeScript + Vite",
    techIcon: "⚛️",
    profile: "minimal, node, full",
    description:
      "Interface web principale pour la gestion de la formation cybersecurite on-premise.",
    longDescription:
      "Le Node Dashboard est l'interface d'administration et de suivi de la plateforme on-premise. Il offre une vue d'ensemble des metriques de securite de l'entreprise, la gestion des utilisateurs, la creation et le suivi des exercices, la gestion des campagnes de phishing, et les parametres systeme. L'interface est responsive et utilise Tailwind CSS pour un design moderne.",
    features: [
      "Dashboard avec KPI de securite (score global, niveau de risque, taux de participation)",
      "Gestion des utilisateurs (CRUD, recherche, filtrage par departement)",
      "Panel d'exercices avec filtrage par type et difficulte",
      "Gestion complete des campagnes de phishing (creation, suivi, resultats)",
      "Parametres : SMTP, frequence, synchronisation, licence",
      "Gestion des mises a jour systeme et contenu",
      "Vue detaillee par utilisateur avec faiblesses identifiees",
    ],
    usage: [
      `Accedez a ${buildUrl("3005")} dans votre navigateur`,
      "Connectez-vous en tant qu'administrateur",
      "Le dashboard affiche les KPI globaux de l'entreprise",
      "Allez dans 'Utilisateurs' pour gerer les comptes",
      "Allez dans 'Exercices' pour creer ou modifier des exercices",
      "Allez dans 'Phishing' pour creer des campagnes de simulation",
      "Allez dans 'Parametres' pour configurer SMTP et frequence",
    ],
  },
  {
    id: "central-backend",
    name: "Central Backend (SaaS)",
    shortName: "Central Backend",
    icon: <Globe className="w-6 h-6" />,
    color: "#E0234E",
    port: "3006",
    webUrl: buildUrl("3006", "/api"),
    tech: "NestJS + TypeORM",
    techIcon: "🔴",
    profile: "central, full",
    description:
      "Plateforme SaaS multi-tenant gerant les tenants, les licences, la distribution des mises a jour et le monitoring M365.",
    longDescription:
      "Le Central Backend est le cerveau de la plateforme SaaS. Il gere le multi-tenancy (chaque client est un tenant isole), la creation et validation des licences, la distribution des mises a jour aux instances Node, la collecte de telemetrie, l'audit de securite Microsoft 365 via OAuth, et la generation de rapports avec analyse IA (Claude). Il utilise PostgreSQL pour les donnees structurees et MongoDB/GridFS pour les fichiers binaires.",
    features: [
      "Multi-tenant avec isolation des donnees",
      "Gestion des licences (creation, validation, renouvellement, revocation)",
      "Distribution des mises a jour (upload ZIP, versioning, checksum)",
      "Collecte de telemetrie depuis les instances Node",
      "Metriques globales et tendances d'utilisation",
      "Scan de securite Microsoft 365 (10 categories)",
      "Generation de rapports PDF avec resume IA (Claude)",
      "Systeme d'alertes pour les findings critiques",
      "Gestion des exercices (bibliotheque de contenu)",
      "Authentification admin avec roles (SUPERADMIN, SUPPORT)",
    ],
    endpoints: [
      { method: "POST", path: "/admin/tenants", desc: "Creer un tenant" },
      { method: "GET", path: "/api/license/validate", desc: "Valider une licence" },
      { method: "POST", path: "/admin/update/upload", desc: "Uploader une mise a jour" },
      { method: "POST", path: "/telemetry", desc: "Ingerer des metriques" },
      { method: "POST", path: "/m365/scan/trigger/{tenantId}", desc: "Lancer un scan M365" },
      { method: "GET", path: "/m365/score/tenant/{id}/latest", desc: "Score securite M365" },
      { method: "POST", path: "/m365/report/generate/{scanId}", desc: "Generer un rapport" },
      { method: "GET", path: "/admin/global/summary", desc: "Resume global plateforme" },
    ],
    usage: [
      "Connectez-vous au dashboard Central en tant qu'admin",
      "Creez des tenants pour vos clients",
      "Generez et attribuez des licences",
      "Uploadez les mises a jour de contenu",
      "Surveillez la sante des instances Node via la telemetrie",
    ],
  },
  {
    id: "central-dashboard",
    name: "Central Dashboard (Admin SaaS)",
    shortName: "Dashboard Central",
    icon: <Crown className="w-6 h-6" />,
    color: "#8B5CF6",
    port: "5173",
    webUrl: buildUrl("5173"),
    tech: "React + TypeScript + Vite",
    techIcon: "⚛️",
    profile: "central, full",
    description:
      "Interface d'administration SaaS pour gerer les tenants, les licences, les mises a jour et les administrateurs.",
    longDescription:
      "Le Central Dashboard est l'interface d'administration de la plateforme SaaS. Il permet aux super-administrateurs de gerer l'ensemble des clients (tenants), de surveiller la sante de chaque instance, de distribuer les mises a jour, et de gerer les comptes administrateurs. Il offre une vue globale de la plateforme avec des metriques en temps reel.",
    features: [
      "Vue globale : tenants actifs, utilisateurs, sante, alertes",
      "Liste des tenants avec recherche, sante et metriques",
      "Detail par tenant : metriques, historique, sante",
      "Gestion des mises a jour (upload ZIP, historique)",
      "Gestion des administrateurs (SUPERADMIN, SUPPORT)",
      "Distribution des licences",
    ],
    usage: [
      `Accedez a ${buildUrl("5173")}`,
      "Connectez-vous avec le compte admin",
      "Le dashboard affiche la vue globale de la plateforme",
      "Allez dans 'Tenants' pour gerer vos clients",
      "Allez dans 'Mises a jour' pour distribuer du contenu",
      "Allez dans 'Administrateurs' pour gerer les comptes",
    ],
  },
  {
    id: "m365-dashboard",
    name: "M365 Security Dashboard",
    shortName: "Dashboard M365",
    icon: <ShieldCheck className="w-6 h-6" />,
    color: "#0078D4",
    port: "5174",
    webUrl: buildUrl("5174"),
    tech: "React + TypeScript + Vite",
    techIcon: "⚛️",
    profile: "central, full",
    description:
      "Dashboard dedie a l'audit de securite Microsoft 365 avec scoring, findings et rapports.",
    longDescription:
      "Le M365 Dashboard est une interface specialisee pour l'audit de securite des environnements Microsoft 365. Il se connecte via OAuth au tenant M365 du client et scanne 10 categories de securite : MFA, Roles Admin, Transfert Email, Partage, Securite Email, Apps OAuth, Politique Mots de Passe, Acces Conditionnel, Boites Mail, et Connexions. Chaque scan produit un score de securite (0-100, note A-F) et identifie les problemes avec des recommandations de remediation.",
    features: [
      "Score de securite global (0-100) avec note A-F",
      "10 categories de securite avec scores individuels",
      "Liste des findings avec severite (CRITICAL, HIGH, MEDIUM, LOW)",
      "Historique des scans avec evolution du score",
      "Generation de rapports PDF avec resume IA",
      "Connexion OAuth lecture seule (14+ permissions)",
      "Filtrage des findings par categorie et severite",
      "Vue detaillee par categorie avec recommandations",
    ],
    usage: [
      `Accedez a ${buildUrl("5174")}`,
      "Allez dans 'Parametres' et entrez votre Tenant ID Microsoft",
      "Cliquez sur 'Connecter' pour lancer le flux OAuth M365",
      "De retour sur l'overview, cliquez 'Lancer un scan'",
      "Consultez le score global et les findings par categorie",
      "Generez un rapport PDF pour le partager avec votre equipe",
      "Suivez l'evolution du score dans l'historique",
    ],
  },
  {
    id: "ai-security-ai",
    name: "AI Security Engine (Python)",
    shortName: "AI Engine",
    webUrl: buildUrl("8002", "/health"),
    icon: <Brain className="w-6 h-6" />,
    color: "#FF6F00",
    port: "8002",
    tech: "Python + FastAPI + Mistral 7B",
    techIcon: "🐍",
    profile: "ai-security, full",
    description:
      "Moteur d'analyse IA dual-layer pour la detection de donnees sensibles dans les prompts envoyes aux outils IA.",
    longDescription:
      "Le AI Security Engine est le coeur de l'analyse DLP (Data Loss Prevention) de CyberSensei. Il utilise une architecture a deux couches : la Couche 1 (rapide, 5-20ms) combine Presidio (NER) + LLM Guard pour detecter les patterns connus (emails, telephones, numeros de secu, IBAN, SIREN/SIRET, etc.). La Couche 2 (semantique, ~500ms) utilise Mistral 7B localement pour detecter les donnees sensibles exprimees en langage naturel. Il integre aussi la detection RGPD Article 9 (donnees de sante, opinions politiques, etc.) et la validation via les API gouvernementales francaises.",
    features: [
      "Couche 1 : Presidio + 8 reconnaisseurs francais (NIR, IBAN, SIREN, SIRET, etc.)",
      "Couche 2 : Mistral 7B local pour analyse semantique",
      "Detection RGPD Article 9 (donnees de sante, opinions politiques, etc.)",
      "Validation via API gouvernementales (Recherche d'Entreprises, Geoplateforme)",
      "Score de risque 0-100 avec niveaux SAFE/LOW/MEDIUM/HIGH/CRITICAL",
      "Anonymisation automatique des donnees detectees",
      "8 categories de donnees sensibles detectees",
      "Fonctionne 100% en local (pas de cloud, souverainete)",
    ],
    endpoints: [
      { method: "POST", path: "/api/analyze", desc: "Analyser un texte (dual-layer)" },
      { method: "GET", path: "/health", desc: "Etat de sante du service" },
    ],
    usage: [
      "Ce service est appele automatiquement par le AI Security Backend",
      "Il ne necessite pas d'interaction directe",
      "Le modele Mistral 7B est telecharge au premier demarrage (~4 Go)",
      "Necessite minimum 4 Go de RAM (recommande: 8 Go)",
    ],
  },
  {
    id: "ai-security-backend",
    name: "AI Security Backend (Java)",
    shortName: "AI Security API",
    icon: <Shield className="w-6 h-6" />,
    color: "#DC2626",
    port: "8081",
    tech: "Java 21 + Spring Boot",
    techIcon: "☕",
    profile: "ai-security, full",
    description:
      "API REST pour la gouvernance IA, la persistence des analyses, les alertes et la conformite RGPD.",
    longDescription:
      "Le AI Security Backend est la couche API et persistance du module DLP. Il recoit les requetes d'analyse de l'extension Chrome, les transmet au moteur Python, persiste les resultats (sans stocker les prompts bruts, uniquement des hash SHA256), cree des alertes pour les risques HIGH/CRITICAL, et implemente la conformite RGPD complete (Articles 15, 17, 20, 30). Il dispose d'un mode fallback avec un analyseur regex local si le service Python est indisponible.",
    features: [
      "Orchestration de l'analyse avec fallback regex",
      "Persistence securisee (hash SHA256, jamais le texte brut)",
      "Systeme d'alertes avec cycle de vie (OPEN, RESOLVED, DISMISSED)",
      "Conformite RGPD complete : Articles 15, 17, 20, 30",
      "Politique de retention configurable (90j standard, 30j Article 9)",
      "Audit log automatique des operations RGPD",
      "Score de risque agrege par entreprise",
      "Statistiques d'utilisation des outils IA",
      "Authentification JWT + API Key (extension)",
    ],
    endpoints: [
      { method: "POST", path: "/api/ai-security/analyze", desc: "Analyser un prompt" },
      { method: "GET", path: "/api/ai-security/alerts", desc: "Lister les alertes" },
      { method: "GET", path: "/api/v1/rgpd/access/{userId}", desc: "Droit d'acces RGPD (Art. 15)" },
      { method: "DELETE", path: "/api/v1/rgpd/erasure/{userId}", desc: "Droit a l'oubli (Art. 17)" },
      { method: "GET", path: "/api/v1/rgpd/export/{userId}", desc: "Portabilite (Art. 20)" },
      { method: "GET", path: "/api/ai-security/risk-score", desc: "Score de risque agrege" },
      { method: "GET", path: "/api/ai-security/usage-stats", desc: "Statistiques d'utilisation" },
    ],
    usage: [
      "Installez l'extension Chrome CyberSensei",
      "L'extension intercepte les prompts envoyes a ChatGPT, Copilot, etc.",
      "Chaque prompt est analyse en temps reel avant envoi",
      "Les alertes HIGH/CRITICAL sont visibles dans le dashboard",
      "Le module RGPD permet l'exercice des droits des utilisateurs",
    ],
  },
  {
    id: "teams-bot",
    name: "Microsoft Teams Bot",
    shortName: "Teams Bot",
    icon: <Bot className="w-6 h-6" />,
    color: "#6264A7",
    port: "5175",
    tech: "Node.js + Bot Framework",
    techIcon: "🤖",
    profile: "teams, full",
    description:
      "Bot conversationnel integre a Microsoft Teams pour la formation cybersecurite interactive.",
    longDescription:
      "Le Teams Bot est un assistant de formation cybersecurite integre directement dans Microsoft Teams. Il propose des quiz quotidiens via des Adaptive Cards interactives, repond aux questions de cybersecurite avec un systeme de reconnaissance d'intentions avance (10 types d'intentions, 94 patterns regex), et offre un glossaire de 20+ termes. Il supporte les conversations en francais et s'adapte au niveau de l'utilisateur.",
    features: [
      "Quiz quotidiens avec Adaptive Cards interactives",
      "Reconnaissance d'intentions (10 types : quiz, score, glossaire, conseil, etc.)",
      "Glossaire de 20+ termes de cybersecurite",
      "Recommandations personnalisees basees sur les scores",
      "Detection de sentiment pour encouragements",
      "Suivi de session (exercices completes, score moyen)",
      "Support des medias (images, videos, GIFs)",
    ],
    usage: [
      "Installez l'application CyberSensei dans Microsoft Teams",
      "Ouvrez une conversation avec le bot",
      "Tapez 'quiz' pour demarrer un exercice",
      "Tapez 'score' pour voir votre progression",
      "Tapez 'aide' pour voir toutes les commandes",
      "Posez une question comme 'C'est quoi le phishing ?'",
    ],
  },
  {
    id: "teams-tabs",
    name: "Microsoft Teams Tabs",
    shortName: "Teams Tabs",
    icon: <Layers className="w-6 h-6" />,
    color: "#6264A7",
    port: "5176",
    tech: "React + TypeScript + Vite",
    techIcon: "⚛️",
    profile: "teams, full",
    description:
      "Onglets Microsoft Teams avec interface employe (formation) et interface manager (suivi d'equipe).",
    longDescription:
      "Les Teams Tabs sont deux interfaces React integrees comme onglets dans Microsoft Teams. L'onglet 'Formation' est l'interface employe avec un design conversationnel : quiz quotidiens, badges, statistiques, et chat avec l'IA. L'onglet 'Manager' est un dashboard de suivi d'equipe avec KPI, liste des utilisateurs, niveau de risque par employe, et filtrage par departement. Les donnees se rafraichissent automatiquement toutes les 60 secondes.",
    features: [
      "Onglet Employe : quiz, badges, statistiques, chat IA",
      "Onglet Manager : KPI, utilisateurs, risques, departements",
      "Authentification SSO Microsoft Teams",
      "Rafraichissement automatique toutes les 60 secondes",
      "Design responsive adapte a Teams",
      "Support media (videos, GIFs, images)",
    ],
    usage: [
      "Ouvrez l'application CyberSensei dans Teams",
      "Cliquez sur l'onglet 'Formation' pour acceder a l'interface employe",
      "Cliquez sur l'onglet 'Manager' pour le suivi d'equipe (role requis)",
      "Les quiz s'affichent automatiquement chaque jour",
      "Les statistiques se mettent a jour en temps reel",
    ],
  },
  {
    id: "website",
    name: "Website (Marketing)",
    shortName: "Website",
    icon: <Globe className="w-6 h-6" />,
    color: "#00e6b8",
    port: "3002",
    webUrl: buildUrl("3002"),
    tech: "Next.js 14 + Tailwind CSS",
    techIcon: "▲",
    profile: "website, full",
    description: "Site vitrine presentant CyberSensei avec tarifs, fonctionnalites et formulaire de contact.",
    longDescription:
      "Le Website est le site marketing de CyberSensei. C'est une Single Page Application Next.js avec 12 sections : Hero, Problematique, Fonctionnement, Plateformes, Fonctionnalites, Protection DLP, Captures d'ecran, Securite, Cas d'usage, Tarifs, FAQ, et Contact. Il utilise Framer Motion pour les animations, Radix UI pour les composants accessibles, et un design dark mode avec la palette cyber-teal.",
    features: [
      "Landing page avec 12 sections animees",
      "3 plans tarifaires (Starter, Business, Enterprise)",
      "FAQ interactive avec accordeon",
      "Formulaire de contact",
      "Pages Politique de confidentialite et Securite",
      "SEO optimise (OpenGraph, meta tags)",
      "Design responsive et accessible",
    ],
  },
  {
    id: "prometheus",
    name: "Prometheus",
    shortName: "Prometheus",
    icon: <Activity className="w-6 h-6" />,
    color: "#E6522C",
    port: "9090",
    webUrl: buildUrl("9090"),
    tech: "Prometheus",
    techIcon: "🔥",
    profile: "monitoring, full",
    description: "Collecte et stockage des metriques de performance de tous les services.",
    longDescription:
      "Prometheus est le systeme de monitoring de la plateforme. Il collecte les metriques de performance (CPU, memoire, latence, requetes) de tous les services via des endpoints /metrics. Les donnees sont stockees en time-series et peuvent etre interrogees via PromQL. Il alimente Grafana pour la visualisation.",
    features: [
      "Collecte automatique des metriques",
      "Stockage time-series",
      "Langage de requete PromQL",
      "Alerting configurable",
    ],
  },
  {
    id: "grafana",
    name: "Grafana",
    shortName: "Grafana",
    icon: <Gauge className="w-6 h-6" />,
    color: "#F46800",
    port: "3300",
    webUrl: buildUrl("3300"),
    tech: "Grafana",
    techIcon: "📊",
    profile: "monitoring, full",
    description:
      "Dashboards de visualisation pour le monitoring en temps reel de la plateforme.",
    longDescription:
      "Grafana est l'outil de visualisation du monitoring. Il consomme les metriques de Prometheus et les affiche dans des dashboards interactifs et configurables. Vous pouvez creer des dashboards personnalises pour suivre la sante de chaque service, les performances, les erreurs, et les tendances.",
    features: [
      "Dashboards interactifs personnalisables",
      "Connexion a Prometheus comme datasource",
      "Alerting visuel",
      "Multi-utilisateur avec roles",
    ],
    usage: [
      `Accedez a ${buildUrl("3300")}`,
      "Connectez-vous avec admin / changeme",
      "Ajoutez Prometheus comme datasource (http://prometheus:9090)",
      "Creez vos dashboards ou importez des templates",
    ],
  },
  {
    id: "scanner",
    name: "Scanner de Vulnerabilites",
    shortName: "Scanner",
    icon: <Eye className="w-6 h-6" />,
    color: "#3B82F6",
    port: "8000",
    tech: "Python 3.11 + asyncio",
    techIcon: "🔍",
    profile: "scanner, full",
    description:
      "Microservice Python qui orchestre 6 modules de scan en parallele pour analyser la surface d'attaque d'un domaine.",
    longDescription:
      "Le scanner lance simultanement nmap (ports), nuclei (CVE), testssl.sh (TLS/SSL + SPF/DKIM/DMARC), dnstwist (typosquatting), HIBP (breaches emails) et AbuseIPDB (reputation IP). Chaque module est autonome : si un outil est absent ou echoue, les autres continuent. Le score_engine calcule un score 0-100 avec une grille de penalites detaillee. Les scans sont declenches par les schedulers Spring Boot et NestJS.",
    features: [
      "6 modules en parallele via asyncio + run_in_executor",
      "nmap : scan des 1000 ports courants, detection ports critiques (22, 23, 445, 3389)",
      "nuclei : detection CVE avec scores CVSS, classement critique/haute/moyenne",
      "testssl.sh : protocoles TLS, certificats, SPF/DKIM/DMARC",
      "dnstwist : domaines typosquattes actifs (DNS resolution)",
      "HIBP v3 : verification breaches emails avec rate-limiting 1.6s",
      "AbuseIPDB v2 : score d'abus, signalements, geolocalisation",
      "Score 0-100 : depart 100, penalites par risque, plancher 0",
      "Graceful degradation : modules skipped si outil absent",
      "Dockerfile avec nmap, nuclei, testssl.sh, dnstwist preinstalles",
    ],
    endpoints: [
      { method: "POST", path: "/scan", desc: 'Lance un scan complet {domain, emails[]}' },
    ],
    usage: [
      "docker build -t cybersensei-scanner ./cybersensei-scanner",
      "docker run -e HIBP_API_KEY=xxx -e ABUSEIPDB_API_KEY=yyy cybersensei-scanner example.com",
      "python scanner.py example.com --emails admin@example.com",
    ],
  },
  {
    id: "ai-reports",
    name: "AI Reports (Claude API)",
    shortName: "AI Reports",
    icon: <FileText className="w-6 h-6" />,
    color: "#8B5CF6",
    port: "8001",
    tech: "Python 3.11 + Anthropic SDK + ReportLab",
    techIcon: "📄",
    profile: "reports, full",
    description:
      "Microservice generant des rapports de securite professionnels via Claude (claude-sonnet-4-6) avec export PDF.",
    longDescription:
      "Ce service recoit les resultats du scanner et genere des rapports adaptes a 5 audiences differentes. Chaque niveau a son propre prompt systeme complet stocke dans prompts/. Le SDK Anthropic est appele avec retry exponentiel (3 tentatives, backoff x2). Le PDF est genere via ReportLab avec en-tete CyberSensei, score colore (rouge/orange/vert), sections formatees et disclaimer legal. Envoi par email via SMTP integre.",
    features: [
      "SDK Anthropic officiel avec modele claude-sonnet-4-6",
      "5 niveaux : SOC1 (accessible), SOC2 (technique), SOC3 (kill chain MITRE ATT&CK), NIS2 (conformite), Mensuel (direction)",
      "Prompts systeme complets : 70-125 lignes chacun, structures operationnels",
      "PDF professionnel ReportLab : A4, en-tete/pied de page, score colore, tables, code blocks",
      "Retry exponentiel : 2s -> 4s -> 8s sur rate-limit et erreurs 5xx",
      "Envoi email SMTP avec PDF en piece jointe",
      "Conversion markdown -> flowables ReportLab (h1-h3, listes, code, paragraphes)",
      "Variables d'env : ANTHROPIC_API_KEY, SMTP_HOST/PORT/USER/PASSWORD",
    ],
    endpoints: [
      { method: "CLI", path: "report_generator.py scan.json -l soc1 -o rapport.pdf", desc: "Generer un rapport" },
    ],
    usage: [
      "pip install anthropic reportlab",
      "ANTHROPIC_API_KEY=sk-... python report_generator.py scan_results.json --level soc2 --company 'Acme' -o rapport.pdf",
      "python -c \"from pdf_builder import build_pdf; build_pdf('# Test', 'test.pdf', 'Acme', 75)\"",
    ],
  },
  {
    id: "compliance-nis2",
    name: "Module Conformite NIS2",
    shortName: "NIS2 Compliance",
    icon: <ShieldCheck className="w-6 h-6" />,
    color: "#10B981",
    port: "3006",
    tech: "NestJS + TypeORM (integre au Central Backend)",
    techIcon: "📋",
    profile: "central, full",
    description:
      "Module NestJS integre au backend Central offrant un questionnaire NIS2 complet avec scoring, plan d'action et rapport.",
    longDescription:
      "25 questions en francais couvrant les 10 domaines de la directive (UE) 2022/2555 : gouvernance, gestion des risques, continuite, chaine d'approvisionnement, gestion des incidents, cryptographie, securite RH, controle d'acces, securite physique, audit. Chaque question a un poids (1-5), une reference legale (Article 20/21/23) et une recommandation. Le scoring est une moyenne ponderee par domaine. Le plan d'action P1/P2/P3 est trie par criticite. Les sessions sont persistees en base (TypeORM + PostgreSQL).",
    features: [
      "25 questions en JSON, 10 domaines NIS2, poids 1-5, references legales",
      "Reponses : oui / non / partiel / na",
      "Score 0-100 par domaine : Non conforme (<40) / En cours (40-70) / Conforme (>70)",
      "Plan d'action P1 (critique, 30j) / P2 (important, 90j) / P3 (recommande, 6 mois)",
      "Rapport markdown avec tableau par domaine, articles NIS2, disclaimer",
      "Entite ComplianceSession avec migration TypeORM",
      "Cache du rapport en base pour re-telechargement",
      "DTOs valides avec class-validator",
    ],
    endpoints: [
      { method: "GET", path: "/compliance/questions", desc: "25 questions groupees par domaine" },
      { method: "POST", path: "/compliance/submit", desc: "Soumettre reponses, retourne score + plan d'action" },
      { method: "GET", path: "/compliance/report/:sessionId", desc: "Rapport markdown complet" },
    ],
    usage: [
      "curl http://localhost:3006/compliance/questions | jq '.totalQuestions'",
      "curl -X POST http://localhost:3006/compliance/submit -H 'Content-Type: application/json' -d '{\"companyName\": \"Acme\", \"answers\": {\"GOV-01\": \"oui\", ...}}'",
    ],
  },
  {
    id: "scheduler-pipeline",
    name: "Scheduler & Pipeline d'Alertes",
    shortName: "Scheduler",
    icon: <Zap className="w-6 h-6" />,
    color: "#F59E0B",
    port: "N/A",
    tech: "Spring Boot @Scheduled + NestJS @Cron",
    techIcon: "⏰",
    profile: "node, central, full",
    description:
      "Systeme de scans automatises avec comparaison inter-scans et notifications intelligentes (email + webhook).",
    longDescription:
      "Deux implementations paralleles : Spring Boot (on-premise, monoinstance) et NestJS (SaaS, multi-tenant). Les scans sont declenches par cron (quotidien 02h00, hebdomadaire lundi 03h00). Le ScanComparator detecte les nouveaux risques, les risques resolus et le delta de score. Le pipeline d'alertes envoie des emails HTML (CRITIQUE si delta < -10, IMPORTANT si nouveaux risques, POSITIF si risques resolus). Cote NestJS : file d'attente max 5 scans simultanes, webhooks optionnels par tenant.",
    features: [
      "Spring Boot : @Scheduled cron configurable, RestClient vers le scanner, JavaMailSender HTML",
      "NestJS : @Cron multi-tenant, Promise.allSettled par batchs de 5, EmailService + WebhookService",
      "ScanComparator : extraction des risques (port:22, cve:CVE-XXX, tls:weak, typosquat:domain, breach:email, abuseipdb:blacklisted)",
      "Pipeline alertes : CRITIQUE (rouge, delta < -10), IMPORTANT (orange, nouveaux risques), POSITIF (vert, resolus)",
      "Entites : ScanResult (Spring/JPA) + ScanHistory (NestJS/TypeORM) avec JSONB",
      "Migrations : Liquibase 024 (Spring) + TypeORM 1741900000000 (NestJS)",
      "Webhook payload : {tenant_id, domain, score, delta, new_risks, resolved_risks, timestamp}",
      "Emails HTML templates avec score colore, liste de risques, actions recommandees",
    ],
    usage: [
      "# Spring Boot : configure dans application.yml",
      "SCANNER_DOMAIN=example.com SCANNER_ALERT_EMAIL=admin@acme.com mvn spring-boot:run",
      "# NestJS : automatique pour chaque tenant actif",
      "# Les scans se declenchent a 02h00 (quotidien) et 03h00 le lundi (hebdomadaire)",
    ],
  },
];

const credentials = [
  {
    service: "Node Dashboard",
    url: buildUrl("3005"),
    icon: <Monitor className="w-5 h-5" />,
    color: "#61DAFB",
    clickable: true,
    creds: [
      { role: "Admin", user: "admin@cybersensei.io", pass: "Demo123!" },
    ],
    note: "Interface de gestion on-premise",
  },
  {
    service: "Central Dashboard (Admin SaaS)",
    url: buildUrl("5173"),
    icon: <Crown className="w-5 h-5" />,
    color: "#8B5CF6",
    clickable: true,
    creds: [
      { role: "SuperAdmin", user: "admin@cybersensei.com", pass: "CyberAdmin2026" },
    ],
    note: "Acces complet a la gestion des tenants et licences",
  },
  {
    service: "M365 Dashboard",
    url: buildUrl("5174"),
    icon: <ShieldCheck className="w-5 h-5" />,
    color: "#0078D4",
    clickable: true,
    creds: [],
    note: "Necessaire : OAuth M365 avec Tenant ID Microsoft configure",
  },
  {
    service: "API Central (Swagger)",
    url: DOMAIN ? `https://cs-api.${DOMAIN}/docs` : buildUrl("3006", "/docs"),
    icon: <FileText className="w-5 h-5" />,
    color: "#E0234E",
    clickable: true,
    creds: [
      { role: "Admin", user: "admin@cybersensei.com", pass: "CyberAdmin2026" },
    ],
    note: "Documentation Swagger de l'API. Authentifiez-vous via POST /admin/auth/login",
  },
  {
    service: "Node Backend (Swagger)",
    url: DOMAIN ? `https://cs-node.${DOMAIN}/swagger-ui/index.html` : buildUrl("8080", "/swagger-ui.html"),
    icon: <FileText className="w-5 h-5" />,
    color: "#6DB33F",
    clickable: true,
    creds: [
      { role: "Admin", user: "admin@cybersensei.io", pass: "Demo123!" },
    ],
    note: "Documentation Swagger Spring Boot",
  },
  {
    service: "Tabs Employee (QCM)",
    url: DOMAIN ? `https://cs-tabs.${DOMAIN}/tabs/employee/` : buildUrl("5176", "/tabs/employee/"),
    icon: <GraduationCap className="w-5 h-5" />,
    color: "#6366F1",
    clickable: true,
    creds: [],
    note: "QCM cybersecurite accessible depuis le navigateur",
  },
  {
    service: "Tabs Manager",
    url: DOMAIN ? `https://cs-tabs.${DOMAIN}/tabs/manager/` : buildUrl("5176", "/tabs/manager/"),
    icon: <Users className="w-5 h-5" />,
    color: "#8B5CF6",
    clickable: true,
    creds: [],
    note: "Dashboard manager accessible depuis le navigateur",
  },
  {
    service: "Grafana",
    url: buildUrl("3300"),
    icon: <Gauge className="w-5 h-5" />,
    color: "#F46800",
    clickable: true,
    creds: [
      { role: "Admin", user: "admin", pass: "GrafAdmin2026" },
    ],
    note: "Dashboards de monitoring",
  },
  {
    service: "PostgreSQL (interne)",
    url: DOMAIN ? `${DOMAIN}:5432 (non expose)` : "localhost:5432",
    icon: <Database className="w-5 h-5" />,
    color: "#336791",
    clickable: false,
    creds: [
      { role: "DB User", user: "cybersensei", pass: "(voir .env.prod)" },
    ],
    note: "Bases : cybersensei_db, cybersensei_central, cybersensei_ai_security",
  },
  {
    service: "MongoDB (interne)",
    url: DOMAIN ? `${DOMAIN}:27017 (non expose)` : "localhost:27017",
    icon: <HardDrive className="w-5 h-5" />,
    color: "#47A248",
    clickable: false,
    creds: [
      { role: "Root", user: "cybersensei", pass: "(voir .env.prod)" },
    ],
    note: "Base : cybersensei_central",
  },
];

const dockerProfiles = [
  {
    name: "minimal",
    command: "docker compose --profile minimal up -d",
    services: ["PostgreSQL", "Node Dashboard"],
    description: "Le minimum pour tester le frontend",
    color: "#22c55e",
  },
  {
    name: "node",
    command: "docker compose --profile node up -d",
    services: ["PostgreSQL", "PgAdmin", "Node Backend", "Node Dashboard"],
    description: "Stack on-premise complete",
    color: "#3b82f6",
  },
  {
    name: "central",
    command: "docker compose --profile central up -d",
    services: ["PostgreSQL", "PgAdmin", "MongoDB", "Central Backend", "Central Dashboard", "M365 Dashboard"],
    description: "Stack SaaS avec monitoring M365",
    color: "#8b5cf6",
  },
  {
    name: "ai-security",
    command: "docker compose --profile ai-security up -d",
    services: ["PostgreSQL", "AI Security Engine", "AI Security Backend"],
    description: "Module DLP avec analyse IA",
    color: "#f97316",
  },
  {
    name: "teams",
    command: "docker compose --profile teams up -d",
    services: ["Teams Bot", "Teams Tabs"],
    description: "Integration Microsoft Teams",
    color: "#6366f1",
  },
  {
    name: "full",
    command: "docker compose --profile full up -d",
    services: ["Tous les services"],
    description: "Tout demarrer (dev/test)",
    color: "#ef4444",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      className="p-1.5 rounded-md hover:bg-white/10 transition-colors"
      title="Copier"
    >
      {copied ? (
        <Check className="w-4 h-4 text-cyber-400" />
      ) : (
        <Copy className="w-4 h-4 text-white/50" />
      )}
    </button>
  );
}

function SectionTitle({
  icon,
  title,
  subtitle,
  id,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  id?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="text-center mb-16"
    >
      <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-cyber-500/10 border border-cyber-500/20 mb-6">
        <span className="text-cyber-400">{icon}</span>
        <span className="text-sm font-medium text-cyber-400 uppercase tracking-wider">
          {subtitle}
        </span>
      </div>
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white">
        {title}
      </h2>
    </motion.div>
  );
}

function AnimatedArchitecture() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const stacks = [
    {
      name: "On-Premise",
      color: "#22c55e",
      items: [
        { name: "Node Dashboard", port: "3005", icon: "⚛️" },
        { name: "Node Backend", port: "8080", icon: "☕" },
      ],
    },
    {
      name: "SaaS Central",
      color: "#8b5cf6",
      items: [
        { name: "Central Dashboard", port: "5173", icon: "⚛️" },
        { name: "M365 Dashboard", port: "5174", icon: "⚛️" },
        { name: "Central Backend", port: "3006", icon: "🔴" },
      ],
    },
    {
      name: "AI Security (DLP)",
      color: "#f97316",
      items: [
        { name: "AI Security API", port: "8081", icon: "☕" },
        { name: "AI Engine (Mistral)", port: "8002", icon: "🐍" },
      ],
    },
    {
      name: "Teams",
      color: "#6366f1",
      items: [
        { name: "Teams Tabs", port: "5176", icon: "⚛️" },
        { name: "Teams Bot", port: "5175", icon: "🤖" },
      ],
    },
  ];

  return (
    <div ref={ref} className="relative">
      {/* Background grid */}
      <div className="absolute inset-0 bg-grid opacity-30 rounded-3xl" />

      <div className="relative p-6 md:p-10">
        {/* Users layer */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <div className="flex items-center gap-4 px-6 py-3 rounded-2xl bg-white/5 border border-white/10">
            <Users className="w-6 h-6 text-cyber-400" />
            <span className="text-white font-medium">Utilisateurs</span>
            <div className="flex gap-2 ml-2">
              <span className="px-2 py-0.5 rounded bg-cyber-500/20 text-cyber-400 text-xs">
                Navigateur
              </span>
              <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 text-xs">
                Teams
              </span>
              <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 text-xs">
                Extension Chrome
              </span>
            </div>
          </div>
        </motion.div>

        {/* Animated arrows down */}
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <div className="w-px h-8 bg-gradient-to-b from-cyber-400/60 to-cyber-400/20" />
            <ChevronDown className="w-5 h-5 text-cyber-400/60 -mt-1" />
          </motion.div>
        </div>

        {/* Reverse Proxy */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <div className="px-6 py-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-3">
            <Network className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-300 font-medium text-sm">
              Traefik Reverse Proxy
            </span>
            <span className="text-yellow-500/50 text-xs">:80</span>
          </div>
        </motion.div>

        {/* Animated arrows to stacks */}
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex items-end gap-0">
            <div className="w-px h-6 bg-gradient-to-b from-yellow-400/40 to-transparent" />
          </motion.div>
        </div>

        {/* Service Stacks */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
          {stacks.map((stack, i) => (
            <motion.div
              key={stack.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.7 + i * 0.15, duration: 0.5 }}
              className="relative"
            >
              {/* Stack header */}
              <div
                className="text-center mb-3 pb-2 border-b"
                style={{ borderColor: stack.color + "40" }}
              >
                <span
                  className="text-sm font-bold uppercase tracking-wider"
                  style={{ color: stack.color }}
                >
                  {stack.name}
                </span>
              </div>
              {/* Stack items */}
              <div className="space-y-2">
                {stack.items.map((item, j) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{
                      delay: 0.9 + i * 0.15 + j * 0.1,
                      duration: 0.3,
                    }}
                    className="flex items-center justify-between px-3 py-2 rounded-lg border"
                    style={{
                      backgroundColor: stack.color + "08",
                      borderColor: stack.color + "25",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{item.icon}</span>
                      <span className="text-white/90 text-sm font-medium">
                        {item.name}
                      </span>
                    </div>
                    <span
                      className="text-xs font-mono px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: stack.color + "15",
                        color: stack.color,
                      }}
                    >
                      :{item.port}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Animated connection lines to databases */}
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="flex flex-col items-center"
          >
            <div className="w-px h-6 bg-gradient-to-b from-white/20 to-blue-400/40" />
            <div className="flex items-center gap-2 text-xs text-white/30">
              <span>JDBC / TypeORM / Mongoose</span>
            </div>
            <div className="w-px h-4 bg-gradient-to-b from-blue-400/40 to-blue-400/20" />
          </motion.div>
        </div>

        {/* Database Layer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.7, duration: 0.5 }}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-blue-900/20 border border-blue-500/30">
            <span className="text-2xl">🐘</span>
            <div>
              <div className="text-blue-300 font-semibold text-sm">
                PostgreSQL
              </div>
              <div className="text-blue-500/60 text-xs font-mono">:5432</div>
            </div>
          </div>
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-green-900/20 border border-green-500/30">
            <span className="text-2xl">🍃</span>
            <div>
              <div className="text-green-300 font-semibold text-sm">
                MongoDB
              </div>
              <div className="text-green-500/60 text-xs font-mono">:27017</div>
            </div>
          </div>
        </motion.div>

        {/* Monitoring layer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 2.0, duration: 0.5 }}
          className="mt-8 flex justify-center"
        >
          <div className="flex items-center gap-4 px-5 py-2.5 rounded-xl bg-orange-900/10 border border-orange-500/20">
            <Activity className="w-4 h-4 text-orange-400" />
            <span className="text-orange-300/80 text-sm font-medium">Monitoring</span>
            <span className="text-xs text-orange-500/50 font-mono">
              Prometheus :9090
            </span>
            <span className="text-orange-500/30">|</span>
            <span className="text-xs text-orange-500/50 font-mono">
              Grafana :3300
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function ServiceCard({
  service,
  index,
}: {
  service: ServiceInfo;
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      id={`service-${service.id}`}
      className="group"
    >
      <div
        className="rounded-2xl border transition-all duration-300 overflow-hidden"
        style={{
          backgroundColor: service.color + "06",
          borderColor: expanded ? service.color + "40" : "rgba(255,255,255,0.07)",
        }}
      >
        {/* Header */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full p-5 flex items-start gap-4 text-left hover:bg-white/[0.02] transition-colors"
        >
          <div
            className="p-2.5 rounded-xl shrink-0"
            style={{ backgroundColor: service.color + "15" }}
          >
            <span style={{ color: service.color }}>{service.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-lg font-semibold text-white">
                {service.name}
              </h3>
              {service.webUrl ? (
                <a
                  href={service.webUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs font-mono px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 transition-all hover:scale-105"
                  style={{
                    backgroundColor: service.color + "20",
                    color: service.color,
                  }}
                >
                  <ExternalLink className="w-3 h-3" />
                  Ouvrir :{service.port}
                </a>
              ) : (
                <span
                  className="text-xs font-mono px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: service.color + "15",
                    color: service.color,
                  }}
                >
                  :{service.port}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="text-xs text-white/40 flex items-center gap-1">
                <span>{service.techIcon}</span> {service.tech}
              </span>
              <span className="text-xs text-white/20">|</span>
              <span className="text-xs text-white/30">
                profile: {service.profile}
              </span>
            </div>
            <p className="text-sm text-white/60 mt-2 leading-relaxed">
              {service.description}
            </p>
          </div>
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="shrink-0 mt-1"
          >
            <ChevronDown className="w-5 h-5 text-white/30" />
          </motion.div>
        </button>

        {/* Expanded content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 space-y-5 border-t border-white/5 pt-5">
                {/* Long description */}
                <div>
                  <h4 className="text-sm font-semibold text-white/80 mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" style={{ color: service.color }} />
                    Description detaillee
                  </h4>
                  <p className="text-sm text-white/50 leading-relaxed">
                    {service.longDescription}
                  </p>
                </div>

                {/* Features */}
                <div>
                  <h4 className="text-sm font-semibold text-white/80 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" style={{ color: service.color }} />
                    Fonctionnalites
                  </h4>
                  <ul className="grid grid-cols-1 gap-1.5">
                    {service.features.map((f, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-white/50"
                      >
                        <CheckCircle
                          className="w-3.5 h-3.5 shrink-0 mt-0.5"
                          style={{ color: service.color }}
                        />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Endpoints */}
                {service.endpoints && (
                  <div>
                    <h4 className="text-sm font-semibold text-white/80 mb-2 flex items-center gap-2">
                      <Terminal className="w-4 h-4" style={{ color: service.color }} />
                      Endpoints principaux
                    </h4>
                    <div className="space-y-1.5">
                      {service.endpoints.map((ep, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 text-sm px-3 py-1.5 rounded-lg bg-white/[0.02]"
                        >
                          <span
                            className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                              ep.method === "GET"
                                ? "bg-green-500/15 text-green-400"
                                : ep.method === "POST"
                                ? "bg-blue-500/15 text-blue-400"
                                : ep.method === "DELETE"
                                ? "bg-red-500/15 text-red-400"
                                : "bg-yellow-500/15 text-yellow-400"
                            }`}
                          >
                            {ep.method}
                          </span>
                          <code className="text-xs text-white/40 font-mono">
                            {ep.path}
                          </code>
                          <span className="text-xs text-white/30 ml-auto hidden sm:block">
                            {ep.desc}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Usage */}
                {service.usage && (
                  <div>
                    <h4 className="text-sm font-semibold text-white/80 mb-2 flex items-center gap-2">
                      <Play className="w-4 h-4" style={{ color: service.color }} />
                      Comment utiliser
                    </h4>
                    <ol className="space-y-1.5">
                      {service.usage.map((u, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-3 text-sm text-white/50"
                        >
                          <span
                            className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                            style={{
                              backgroundColor: service.color + "15",
                              color: service.color,
                            }}
                          >
                            {i + 1}
                          </span>
                          {u}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function DataFlowDiagram() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const flows = [
    {
      from: "Extension Chrome",
      to: "AI Security Backend",
      then: "AI Engine (Python)",
      label: "Analyse DLP temps reel",
      color: "#f97316",
      detail: "Chaque prompt envoye a ChatGPT/Copilot/Gemini est intercepte et analyse avant envoi",
    },
    {
      from: "Teams Bot",
      to: "Node Backend",
      then: "PostgreSQL",
      label: "Quiz & progression",
      color: "#6366f1",
      detail: "Les quiz quotidiens et la progression sont geres par le backend Node via le bot Teams",
    },
    {
      from: "Node Instance",
      to: "Central Backend",
      then: "PostgreSQL + MongoDB",
      label: "Telemetrie & mises a jour",
      color: "#8b5cf6",
      detail: "Les instances on-premise envoient leur telemetrie et recuperent les mises a jour depuis Central",
    },
    {
      from: "Central Backend",
      to: "Microsoft Graph API",
      then: "M365 Dashboard",
      label: "Audit securite M365",
      color: "#0078D4",
      detail: "OAuth lecture seule vers le tenant M365 pour scanner 10 categories de securite",
    },
  ];

  return (
    <div ref={ref} className="space-y-4">
      {flows.map((flow, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ delay: i * 0.15, duration: 0.5 }}
          className="rounded-xl border p-4 hover:bg-white/[0.02] transition-colors"
          style={{
            borderColor: flow.color + "20",
            backgroundColor: flow.color + "04",
          }}
        >
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span
              className="px-2.5 py-1 rounded-lg text-sm font-medium"
              style={{
                backgroundColor: flow.color + "15",
                color: flow.color,
              }}
            >
              {flow.from}
            </span>
            <ArrowRight className="w-4 h-4 text-white/20" />
            <span className="px-2.5 py-1 rounded-lg text-sm font-medium bg-white/5 text-white/70">
              {flow.to}
            </span>
            <ArrowRight className="w-4 h-4 text-white/20" />
            <span className="px-2.5 py-1 rounded-lg text-sm font-medium bg-white/5 text-white/70">
              {flow.then}
            </span>
          </div>
          <p className="text-xs text-white/40 mt-1">{flow.detail}</p>
        </motion.div>
      ))}
    </div>
  );
}

function TechStackGrid() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const techs = [
    { name: "Java 21", icon: "☕", category: "Backend", color: "#ED8B00" },
    { name: "Spring Boot 3", icon: "🍃", category: "Backend", color: "#6DB33F" },
    { name: "NestJS", icon: "🔴", category: "Backend", color: "#E0234E" },
    { name: "Python FastAPI", icon: "🐍", category: "AI/ML", color: "#009688" },
    { name: "Mistral 7B", icon: "🧠", category: "AI/ML", color: "#FF6F00" },
    { name: "Presidio", icon: "🔍", category: "AI/ML", color: "#0078D4" },
    { name: "LLM Guard", icon: "🛡️", category: "AI/ML", color: "#7C3AED" },
    { name: "React 18", icon: "⚛️", category: "Frontend", color: "#61DAFB" },
    { name: "TypeScript", icon: "📘", category: "Frontend", color: "#3178C6" },
    { name: "Next.js 14", icon: "▲", category: "Frontend", color: "#ffffff" },
    { name: "Tailwind CSS", icon: "🎨", category: "Frontend", color: "#06B6D4" },
    { name: "Vite", icon: "⚡", category: "Frontend", color: "#646CFF" },
    { name: "PostgreSQL 15", icon: "🐘", category: "Data", color: "#336791" },
    { name: "MongoDB 6", icon: "🍃", category: "Data", color: "#47A248" },
    { name: "Docker", icon: "🐳", category: "Infra", color: "#2496ED" },
    { name: "Traefik", icon: "🔀", category: "Infra", color: "#24A1C1" },
    { name: "Prometheus", icon: "🔥", category: "Monitoring", color: "#E6522C" },
    { name: "Grafana", icon: "📊", category: "Monitoring", color: "#F46800" },
    { name: "Bot Framework", icon: "🤖", category: "Integration", color: "#6264A7" },
    { name: "Framer Motion", icon: "🎬", category: "Frontend", color: "#FF0055" },
  ];

  const categories = Array.from(new Set(techs.map((t) => t.category)));

  return (
    <div ref={ref} className="space-y-8">
      {categories.map((cat, ci) => (
        <div key={cat}>
          <h4 className="text-sm font-bold text-white/40 uppercase tracking-wider mb-3">
            {cat}
          </h4>
          <div className="flex flex-wrap gap-2">
            {techs
              .filter((t) => t.category === cat)
              .map((tech, i) => (
                <motion.div
                  key={tech.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: ci * 0.1 + i * 0.05, duration: 0.3 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
                  style={{ borderColor: tech.color + "20" }}
                >
                  <span className="text-lg">{tech.icon}</span>
                  <span className="text-sm text-white/70 font-medium">
                    {tech.name}
                  </span>
                </motion.div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NAV
// ─────────────────────────────────────────────────────────────────────────────

function DocNav() {
  const [active, setActive] = useState("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );

    const sections = document.querySelectorAll("section[id]");
    sections.forEach((s) => observer.observe(s));

    return () => observer.disconnect();
  }, []);

  const items = [
    { id: "architecture", label: "Architecture", icon: <Network className="w-4 h-4" /> },
    { id: "services", label: "Microservices", icon: <Server className="w-4 h-4" /> },
    { id: "flux", label: "Flux de donnees", icon: <Zap className="w-4 h-4" /> },
    { id: "techstack", label: "Technologies", icon: <Cpu className="w-4 h-4" /> },
    { id: "securite-soc", label: "Niveaux SOC", icon: <Radar className="w-4 h-4" /> },
    { id: "demarrage", label: "Demarrage", icon: <Play className="w-4 h-4" /> },
    { id: "admin", label: "Administration", icon: <Key className="w-4 h-4" /> },
  ];

  return (
    <nav className="hidden lg:block fixed left-6 top-1/2 -translate-y-1/2 z-40">
      <div className="glass-card p-2 space-y-1">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all duration-200 ${
              active === item.id
                ? "bg-cyber-500/15 text-cyber-400"
                : "text-white/40 hover:text-white/70 hover:bg-white/5"
            }`}
          >
            {item.icon}
            <span className="hidden xl:inline">{item.label}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-background">
      <DocNav />

      {/* Hero */}
      <div className="relative pt-32 pb-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyber-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px]" />

        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyber-500/10 border border-cyber-500/20 mb-8">
              <FileText className="w-4 h-4 text-cyber-400" />
              <span className="text-sm text-cyber-400 font-medium">
                Documentation Technique
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6">
              <span className="text-white">Architecture</span>{" "}
              <span className="text-gradient">CyberSensei</span>
            </h1>

            <p className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed">
              Guide complet de l&apos;architecture microservices, des
              technologies utilisees, et de l&apos;administration de la
              plateforme CyberSensei.
            </p>

            <div className="flex flex-wrap justify-center gap-3 mt-10">
              {[
                { label: "17 Services", icon: <Server className="w-4 h-4" /> },
                { label: "6 Profiles Docker", icon: <Layers className="w-4 h-4" /> },
                { label: "25+ Technologies", icon: <Cpu className="w-4 h-4" /> },
                { label: "Scanner + Rapports SOC + NIS2", icon: <Radar className="w-4 h-4" /> },
              ].map((badge) => (
                <div
                  key={badge.label}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white/60"
                >
                  <span className="text-cyber-400">{badge.icon}</span>
                  {badge.label}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-20 xl:px-32 pb-32 space-y-32">
        {/* ─── ARCHITECTURE ─────────────────────────────────────────────── */}
        <section id="architecture">
          <SectionTitle
            icon={<Network className="w-5 h-5" />}
            title="Architecture Globale"
            subtitle="Vue d'ensemble"
          />
          <div className="glass-card overflow-hidden">
            <AnimatedArchitecture />
          </div>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                icon: <Lock className="w-5 h-5 text-green-400" />,
                title: "On-Premise",
                desc: "Deploiement 100% local pour les donnees sensibles. Aucune donnee ne quitte votre infrastructure.",
              },
              {
                icon: <Globe className="w-5 h-5 text-violet-400" />,
                title: "SaaS Multi-Tenant",
                desc: "Plateforme centrale pour gerer plusieurs clients avec isolation des donnees par tenant.",
              },
              {
                icon: <Brain className="w-5 h-5 text-orange-400" />,
                title: "IA Souveraine",
                desc: "Mistral 7B tourne localement. Aucun prompt n'est envoye vers un cloud externe.",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="glass-card p-5 hover-lift"
              >
                <div className="flex items-center gap-3 mb-2">
                  {card.icon}
                  <h4 className="text-white font-semibold">{card.title}</h4>
                </div>
                <p className="text-sm text-white/40 leading-relaxed">
                  {card.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ─── SERVICES ────────────────────────────────────────────────── */}
        <section id="services">
          <SectionTitle
            icon={<Server className="w-5 h-5" />}
            title="Les Microservices"
            subtitle="Detail de chaque service"
          />
          <p className="text-center text-white/40 -mt-10 mb-10 max-w-2xl mx-auto">
            Cliquez sur un service pour voir sa description detaillee, ses
            fonctionnalites, ses endpoints API, et comment l&apos;utiliser.
          </p>
          <div className="space-y-3">
            {services.map((s, i) => (
              <ServiceCard key={s.id} service={s} index={i} />
            ))}
          </div>
        </section>

        {/* ─── FLUX DE DONNEES ─────────────────────────────────────────── */}
        <section id="flux">
          <SectionTitle
            icon={<Zap className="w-5 h-5" />}
            title="Flux de Donnees"
            subtitle="Comment les services communiquent"
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-cyber-400" />
                Flux principaux
              </h3>
              <DataFlowDiagram />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-cyber-400" />
                Protocoles & securite
              </h3>
              <div className="space-y-3">
                {[
                  {
                    title: "Authentification",
                    items: [
                      "JWT (JSON Web Tokens) pour tous les backends",
                      "API Key pour l'extension Chrome",
                      "SSO Microsoft Teams via MSAL",
                      "OAuth 2.0 pour Microsoft 365",
                    ],
                  },
                  {
                    title: "Communication inter-services",
                    items: [
                      "REST/HTTP sur reseau Docker interne",
                      "Pas d'exposition externe des ports internes",
                      "Healthchecks automatiques",
                      "Traefik reverse proxy pour le routage",
                    ],
                  },
                  {
                    title: "Protection des donnees",
                    items: [
                      "Prompts jamais stockes en clair (hash SHA256)",
                      "RGPD complet (Articles 15, 17, 20, 30)",
                      "Retention automatique (90j / 30j Article 9)",
                      "Audit log de toutes les operations RGPD",
                    ],
                  },
                ].map((group) => (
                  <div
                    key={group.title}
                    className="rounded-xl border border-white/10 p-4 bg-white/[0.02]"
                  >
                    <h4 className="text-sm font-semibold text-white/80 mb-2">
                      {group.title}
                    </h4>
                    <ul className="space-y-1">
                      {group.items.map((item, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-white/40"
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-cyber-500/50 shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── TECH STACK ──────────────────────────────────────────────── */}
        <section id="techstack">
          <SectionTitle
            icon={<Cpu className="w-5 h-5" />}
            title="Stack Technologique"
            subtitle="Technologies utilisees"
          />
          <div className="glass-card p-8">
            <TechStackGrid />
          </div>
        </section>

        {/* ─── SECURITE SOC / SCANNER / NIS2 ────────────────────────── */}
        <section id="securite-soc">
          <SectionTitle
            icon={<Radar className="w-5 h-5" />}
            title="Scanner, Rapports SOC & Conformite NIS2"
            subtitle="Les nouveaux modules de securite offensive"
          />
          <p className="text-center text-white/40 -mt-10 mb-10 max-w-3xl mx-auto">
            CyberSensei integre desormais un scanner de vulnerabilites automatise,
            des rapports de securite generes par IA (Claude) et un module de conformite NIS2.
            Voici comment chaque niveau fonctionne et a qui il s&apos;adresse.
          </p>

          {/* Scanner */}
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <ScanLine className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Scanner de vulnerabilites</h3>
                <p className="text-sm text-white/40">Microservice Python — 6 modules d&apos;analyse en parallele</p>
              </div>
            </div>
            <p className="text-sm text-white/50 mb-4 leading-relaxed">
              Le scanner analyse votre domaine sous 6 angles differents en meme temps,
              comme un bilan de sante complet pour votre infrastructure web.
              Chaque module est independant : si un outil n&apos;est pas disponible,
              les autres continuent normalement.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { name: "nmap", desc: "Verifie quelles portes sont ouvertes sur votre serveur (ports et services exposes)", color: "text-red-400" },
                { name: "nuclei", desc: "Cherche les failles connues (CVE) dans vos services, comme un rappel de securite automobile", color: "text-orange-400" },
                { name: "testssl.sh", desc: "Analyse la qualite du chiffrement de vos connexions HTTPS et vos certificats", color: "text-yellow-400" },
                { name: "dnstwist", desc: "Detecte les sites qui imitent le votre pour pieger vos clients (typosquatting)", color: "text-purple-400" },
                { name: "Have I Been Pwned", desc: "Verifie si les emails de votre entreprise apparaissent dans des fuites de donnees", color: "text-pink-400" },
                { name: "AbuseIPDB", desc: "Verifie si votre adresse IP est signalee comme malveillante par la communaute", color: "text-cyan-400" },
              ].map((tool) => (
                <div key={tool.name} className="rounded-lg border border-white/10 p-3 bg-white/[0.02]">
                  <h4 className={`text-sm font-semibold ${tool.color} mb-1`}>{tool.name}</h4>
                  <p className="text-xs text-white/40 leading-relaxed">{tool.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg bg-white/[0.03] border border-white/10 p-4">
              <h4 className="text-sm font-semibold text-white/80 mb-2 flex items-center gap-2">
                <Gauge className="w-4 h-4 text-cyber-400" />
                Score de securite (0 a 100)
              </h4>
              <p className="text-xs text-white/40 mb-3">
                Le score part de 100. Chaque probleme detecte fait baisser le score selon sa gravite.
                Un score de 80+ est bon, 50-79 necessite des actions, en dessous de 50 c&apos;est urgent.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                {[
                  { risk: "Port critique ouvert", pts: "-15 pts", max: "max -30" },
                  { risk: "Faille critique (CVE)", pts: "-20 pts", max: "par faille" },
                  { risk: "Chiffrement faible", pts: "-15 pts", max: "" },
                  { risk: "SPF/DKIM/DMARC absent", pts: "-7 a -10", max: "par record" },
                  { risk: "Site imitateur actif", pts: "-10 pts", max: "max -20" },
                  { risk: "Email dans une fuite", pts: "-5 pts", max: "max -20" },
                  { risk: "IP blacklistee", pts: "-10 pts", max: "" },
                  { risk: "Faille haute (CVE)", pts: "-10 pts", max: "par faille" },
                ].map((r) => (
                  <div key={r.risk} className="rounded bg-red-500/5 border border-red-500/10 p-2">
                    <span className="text-white/60 block">{r.risk}</span>
                    <span className="text-red-400 font-semibold">{r.pts}</span>
                    {r.max && <span className="text-white/30 block">{r.max}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Niveaux SOC */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Rapports de securite par niveau SOC</h3>
                <p className="text-sm text-white/40">Generes automatiquement par Claude (IA Anthropic)</p>
              </div>
            </div>
            <p className="text-sm text-white/50 mb-6 leading-relaxed">
              Un <strong className="text-white/70">SOC</strong> (Security Operations Center) est
              l&apos;equivalent d&apos;une salle de controle pour la cybersecurite.
              CyberSensei genere des rapports adaptes a chaque niveau d&apos;expertise,
              du responsable IT au specialiste en reponse aux incidents.
            </p>

            <div className="space-y-4">
              {[
                {
                  level: "SOC Niveau 1",
                  subtitle: "Le gardien de l'entree",
                  audience: "Responsables IT, DSI, chefs de projet",
                  color: "from-green-500/10 to-green-500/5",
                  border: "border-green-500/20",
                  badge: "bg-green-500/10 text-green-400",
                  icon: <Eye className="w-5 h-5 text-green-400" />,
                  analogy: "Comme le rapport du mecanicien apres le controle technique : \"Vos pneus sont uses, vos freins sont bons, il faut changer l'huile.\"",
                  contains: [
                    "Resume executif en langage simple, sans jargon technique",
                    "Score global avec explication concrete de ce qu'il signifie",
                    "Liste des problemes classes par urgence (critique, eleve, modere)",
                    "Plan d'action concret : 5 a 10 actions a faire, dans l'ordre",
                    "Recommandations pour le prochain scan",
                  ],
                  useCase: "Vous etes DSI et vous devez presenter l'etat de la securite au comite de direction. Ce rapport vous donne les elements cles en 5 minutes de lecture.",
                },
                {
                  level: "SOC Niveau 2",
                  subtitle: "Le technicien specialise",
                  audience: "Administrateurs systemes, DevOps, RSSI techniques",
                  color: "from-orange-500/10 to-orange-500/5",
                  border: "border-orange-500/20",
                  badge: "bg-orange-500/10 text-orange-400",
                  icon: <Settings className="w-5 h-5 text-orange-400" />,
                  analogy: "Comme le rapport detaille d'un expert automobile : references exactes des pieces, temps de main-d'oeuvre, mesures precises.",
                  contains: [
                    "Matrice de risques complete avec probabilites et impacts",
                    "Chaque CVE detaillee : score CVSS, vecteur d'attaque, patch exact",
                    "Configuration TLS analysee avec score equivalent SSL Labs (A+ a F)",
                    "Commandes de remediation directement copiables (nginx, Apache...)",
                    "Audit DNS complet : SPF, DKIM, DMARC, DNSSEC, CAA",
                    "Plan de remediation en 3 phases avec estimation d'effort",
                  ],
                  useCase: "Vous etes administrateur systeme et vous devez corriger les failles. Ce rapport vous donne exactement quoi faire, avec les commandes.",
                },
                {
                  level: "SOC Niveau 3",
                  subtitle: "Le detective",
                  audience: "Analystes SOC seniors, equipes de reponse aux incidents, RSSI strategiques",
                  color: "from-red-500/10 to-red-500/5",
                  border: "border-red-500/20",
                  badge: "bg-red-500/10 text-red-400",
                  icon: <Target className="w-5 h-5 text-red-400" />,
                  analogy: "Comme un expert en securite physique qui vous dit : \"Un cambrioleur pourrait entrer par cette fenetre, passer par ce couloir, et acceder au coffre en 3 minutes.\"",
                  contains: [
                    "Scenarios d'attaque realistes bases sur les failles trouvees",
                    "Mapping MITRE ATT&CK (referentiel mondial des techniques d'attaque)",
                    "Correlation entre les failles pour identifier des chaines d'attaque",
                    "Indicateurs de compromission (IoC) a surveiller dans vos logs",
                    "Regles de detection SIEM recommandees",
                    "Evaluation de maturite par rapport aux standards (NIST, ISO 27001)",
                  ],
                  useCase: "Vous etes analyste SOC et vous devez anticiper les attaques. Ce rapport vous montre exactement ce qu'un attaquant pourrait faire.",
                },
                {
                  level: "Rapport NIS2",
                  subtitle: "Le conseiller conformite",
                  audience: "DPO, RSSI, direction generale, audits reglementaires",
                  color: "from-blue-500/10 to-blue-500/5",
                  border: "border-blue-500/20",
                  badge: "bg-blue-500/10 text-blue-400",
                  icon: <ClipboardCheck className="w-5 h-5 text-blue-400" />,
                  analogy: "Comme un audit de conformite qui verifie chaque article de loi et vous dit exactement ou vous etes conforme et ou il faut agir.",
                  contains: [
                    "Evaluation article par article (Articles 20, 21, 23 de la directive NIS2)",
                    "Ecarts identifies avec niveau de severite par domaine",
                    "Plan de mise en conformite en 4 phases (immediat a 12 mois)",
                    "Estimation budgetaire indicative par categorie",
                    "Liste des documents requis : PSSI, PCA, PRA...",
                    "Sanctions encourues rappelees (jusqu'a 10M EUR ou 2% du CA)",
                  ],
                  useCase: "La directive NIS2 s'applique a votre entreprise et vous devez evaluer votre conformite. Ce rapport identifie vos ecarts et vous guide vers la mise en conformite.",
                },
                {
                  level: "Rapport Mensuel",
                  subtitle: "Le tableau de bord direction",
                  audience: "Direction generale, DAF, comite de direction",
                  color: "from-indigo-500/10 to-indigo-500/5",
                  border: "border-indigo-500/20",
                  badge: "bg-indigo-500/10 text-indigo-400",
                  icon: <BarChart3 className="w-5 h-5 text-indigo-400" />,
                  analogy: "Comme un rapport financier trimestriel, mais pour la securite : indicateurs cles, tendances, et decisions a prendre.",
                  contains: [
                    "Dashboard executif avec score global et tendance",
                    "Traduction des risques en impact financier (cout moyen d'une fuite, amendes RGPD/NIS2)",
                    "Points forts et points d'attention classes par impact business",
                    "Recommandations d'investissement avec estimation de ROI",
                    "Conformite reglementaire resumee (NIS2, RGPD)",
                    "Comparaison avec les standards du secteur",
                  ],
                  useCase: "Vous presentez au comite de direction. Ce rapport traduit la securite en langage business : risques financiers, investissements, tendances.",
                },
              ].map((soc) => (
                <div key={soc.level} className={`glass-card p-6 bg-gradient-to-br ${soc.color} border ${soc.border}`}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                      {soc.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <h4 className="text-lg font-semibold text-white">{soc.level}</h4>
                        <span className="text-sm text-white/40">— {soc.subtitle}</span>
                      </div>
                      <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${soc.badge}`}>
                        {soc.audience}
                      </span>
                    </div>
                  </div>

                  <div className="ml-14 space-y-3">
                    <div className="rounded-lg bg-white/[0.03] border border-white/10 p-3">
                      <p className="text-sm text-white/50 italic leading-relaxed">
                        &quot;{soc.analogy}&quot;
                      </p>
                    </div>

                    <div>
                      <h5 className="text-sm font-semibold text-white/70 mb-2">Ce que contient le rapport :</h5>
                      <ul className="space-y-1">
                        {soc.contains.map((item, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-white/40">
                            <CheckCircle className="w-3.5 h-3.5 text-cyber-500/50 shrink-0 mt-0.5" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-lg bg-cyber-500/5 border border-cyber-500/10 p-3">
                      <h5 className="text-xs font-semibold text-cyber-400 mb-1">Cas d&apos;usage concret :</h5>
                      <p className="text-sm text-white/50 leading-relaxed">{soc.useCase}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* NIS2 Compliance */}
          <div className="glass-card p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Module Conformite NIS2</h3>
                <p className="text-sm text-white/40">Questionnaire interactif — 25 questions, 10 domaines</p>
              </div>
            </div>
            <p className="text-sm text-white/50 mb-4 leading-relaxed">
              La <strong className="text-white/70">directive NIS2</strong> (Network and Information Security)
              est une loi europeenne qui oblige les entreprises de secteurs critiques a renforcer
              leur cybersecurite. CyberSensei propose un questionnaire d&apos;auto-evaluation
              qui couvre les 10 domaines de la directive et genere un plan d&apos;action personnalise.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
              {[
                "Gouvernance", "Gestion des risques", "Continuite",
                "Chaine d'approvisionnement", "Gestion des incidents",
                "Cryptographie", "Securite RH", "Controle d'acces",
                "Securite physique", "Audit",
              ].map((domain) => (
                <div key={domain} className="rounded-lg bg-emerald-500/5 border border-emerald-500/10 p-2 text-center">
                  <span className="text-xs text-emerald-400/80">{domain}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-lg border border-white/10 p-3 bg-white/[0.02]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm font-semibold text-white/70">Non conforme (&lt; 40)</span>
                </div>
                <p className="text-xs text-white/40">Actions urgentes requises. Plan P1 genere automatiquement.</p>
              </div>
              <div className="rounded-lg border border-white/10 p-3 bg-white/[0.02]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span className="text-sm font-semibold text-white/70">En cours (40-70)</span>
                </div>
                <p className="text-xs text-white/40">Des efforts significatifs sont necessaires. Plan P2 priorise.</p>
              </div>
              <div className="rounded-lg border border-white/10 p-3 bg-white/[0.02]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm font-semibold text-white/70">Conforme (&gt; 70)</span>
                </div>
                <p className="text-xs text-white/40">Bon niveau. Amelioration continue recommandee.</p>
              </div>
            </div>
          </div>

          {/* Scheduler & Alertes */}
          <div className="glass-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Scans automatises & Alertes</h3>
                <p className="text-sm text-white/40">Surveillance continue avec notifications intelligentes</p>
              </div>
            </div>
            <p className="text-sm text-white/50 mb-4 leading-relaxed">
              Les scans se declenchent automatiquement et comparent les resultats avec le scan precedent.
              Vous etes alerte uniquement quand quelque chose change.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  title: "Alerte CRITIQUE",
                  desc: "Le score a chute de plus de 10 points. Investigation immediate recommandee.",
                  color: "border-red-500/20 bg-red-500/5",
                  dot: "bg-red-500",
                  trigger: "Delta score < -10",
                },
                {
                  title: "Alerte IMPORTANTE",
                  desc: "De nouveaux risques ont ete detectes (nouvelle faille, port ouvert, etc.).",
                  color: "border-orange-500/20 bg-orange-500/5",
                  dot: "bg-orange-500",
                  trigger: "Nouveaux risques",
                },
                {
                  title: "Notification POSITIVE",
                  desc: "Des risques precedemment detectes ont ete corriges. Felicitations !",
                  color: "border-green-500/20 bg-green-500/5",
                  dot: "bg-green-500",
                  trigger: "Risques resolus",
                },
              ].map((alert) => (
                <div key={alert.title} className={`rounded-lg border p-4 ${alert.color}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${alert.dot}`} />
                    <h4 className="text-sm font-semibold text-white/80">{alert.title}</h4>
                  </div>
                  <p className="text-xs text-white/40 mb-2">{alert.desc}</p>
                  <span className="text-xs text-white/25">Declencheur : {alert.trigger}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { label: "Scan quotidien a 02h00", icon: <Activity className="w-3 h-3" /> },
                { label: "Scan hebdomadaire le lundi a 03h00", icon: <Activity className="w-3 h-3" /> },
                { label: "Alertes par email HTML", icon: <Mail className="w-3 h-3" /> },
                { label: "Webhooks optionnels par tenant", icon: <Webhook className="w-3 h-3" /> },
                { label: "Max 5 scans en parallele (SaaS)", icon: <Layers className="w-3 h-3" /> },
              ].map((tag) => (
                <div key={tag.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/40">
                  <span className="text-cyber-400">{tag.icon}</span>
                  {tag.label}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── DEMARRAGE ───────────────────────────────────────────────── */}
        <section id="demarrage">
          <SectionTitle
            icon={<Play className="w-5 h-5" />}
            title="Demarrage Rapide"
            subtitle="Docker Compose Profiles"
          />
          <p className="text-center text-white/40 -mt-10 mb-10 max-w-2xl mx-auto">
            CyberSensei utilise des profiles Docker Compose pour demarrer
            uniquement les services dont vous avez besoin.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dockerProfiles.map((profile, i) => (
              <motion.div
                key={profile.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="rounded-2xl border border-white/10 p-5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: profile.color }}
                    />
                    <span className="text-white font-semibold font-mono">
                      {profile.name}
                    </span>
                  </div>
                  <CopyButton text={profile.command} />
                </div>
                <div className="bg-navy-950 rounded-lg px-4 py-2.5 mb-3 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyber-500/50 shrink-0" />
                  <code className="text-xs text-cyber-400 font-mono break-all">
                    {profile.command}
                  </code>
                </div>
                <p className="text-xs text-white/40 mb-2">
                  {profile.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {profile.services.map((s) => (
                    <span
                      key={s}
                      className="text-xs px-2 py-0.5 rounded bg-white/5 text-white/30"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Env vars */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-8 glass-card p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-cyber-400" />
              Variables d&apos;environnement principales
            </h3>
            <div className="bg-navy-950 rounded-xl p-4 overflow-x-auto">
              <pre className="text-sm font-mono leading-relaxed">
                <span className="text-white/30"># .env (a la racine du projet)</span>
                {"\n\n"}
                <span className="text-cyan-400">POSTGRES_USER</span>
                <span className="text-white/30">=</span>
                <span className="text-green-400">cybersensei</span>
                {"\n"}
                <span className="text-cyan-400">POSTGRES_PASSWORD</span>
                <span className="text-white/30">=</span>
                <span className="text-green-400">cybersensei123</span>
                {"\n"}
                <span className="text-cyan-400">JWT_SECRET</span>
                <span className="text-white/30">=</span>
                <span className="text-green-400">votre-secret-jwt</span>
                {"\n\n"}
                <span className="text-white/30"># Microsoft 365 (optionnel)</span>
                {"\n"}
                <span className="text-cyan-400">M365_CLIENT_ID</span>
                <span className="text-white/30">=</span>
                <span className="text-green-400">votre-client-id</span>
                {"\n"}
                <span className="text-cyan-400">M365_CLIENT_SECRET</span>
                <span className="text-white/30">=</span>
                <span className="text-green-400">votre-secret</span>
                {"\n\n"}
                <span className="text-white/30"># IA (optionnel)</span>
                {"\n"}
                <span className="text-cyan-400">ANTHROPIC_API_KEY</span>
                <span className="text-white/30">=</span>
                <span className="text-green-400">sk-ant-...</span>
                {"\n"}
                <span className="text-cyan-400">SEMANTIC_THRESHOLD</span>
                <span className="text-white/30">=</span>
                <span className="text-green-400">40</span>
              </pre>
            </div>
          </motion.div>
        </section>

        {/* ─── ADMIN ───────────────────────────────────────────────────── */}
        <section id="admin">
          <SectionTitle
            icon={<Key className="w-5 h-5" />}
            title="Administration"
            subtitle="Acces & identifiants"
          />

          {/* Warning */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-start gap-4 p-5 rounded-2xl bg-yellow-500/5 border border-yellow-500/20 mb-8"
          >
            <AlertTriangle className="w-6 h-6 text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-yellow-300 font-semibold mb-1">
                Identifiants par defaut - A changer en production
              </h4>
              <p className="text-sm text-yellow-200/50">
                Les identifiants ci-dessous sont ceux par defaut pour le
                developpement. En production, modifiez-les via les variables
                d&apos;environnement dans votre fichier{" "}
                <code className="text-yellow-300/70">.env</code> ou votre
                orchestrateur.
              </p>
            </div>
          </motion.div>

          {/* Credentials grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {credentials.map((cred, i) => (
              <motion.div
                key={cred.service}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="rounded-2xl border border-white/10 overflow-hidden bg-white/[0.02]"
              >
                <div
                  className="px-5 py-3 flex items-center gap-3 border-b border-white/5"
                  style={{ backgroundColor: cred.color + "08" }}
                >
                  <span style={{ color: cred.color }}>{cred.icon}</span>
                  <div className="flex-1 min-w-0">
                    {cred.clickable ? (
                      <a
                        href={cred.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/link"
                      >
                        <h4 className="text-white font-semibold text-sm group-hover/link:text-cyber-400 transition-colors inline-flex items-center gap-2">
                          {cred.service}
                          <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                        </h4>
                        <span className="text-xs font-mono text-cyber-400/70 group-hover/link:text-cyber-400 transition-colors">
                          {cred.url}
                        </span>
                      </a>
                    ) : (
                      <>
                        <h4 className="text-white font-semibold text-sm">
                          {cred.service}
                        </h4>
                        <span className="text-xs text-white/30 font-mono">
                          {cred.url}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  {cred.creds.length > 0 ? (
                    cred.creds.map((c, j) => (
                      <div
                        key={j}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg bg-navy-950"
                      >
                        <span className="text-xs text-white/30 w-20 shrink-0">
                          {c.role}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Users className="w-3 h-3 text-white/20" />
                            <code className="text-xs text-white/60 font-mono truncate">
                              {c.user}
                            </code>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Key className="w-3 h-3 text-white/20" />
                            <code className="text-xs text-cyber-400/70 font-mono">
                              {c.pass}
                            </code>
                          </div>
                        </div>
                        <CopyButton text={`${c.user}\n${c.pass}`} />
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-white/30 italic px-3 py-2">
                      Pas d&apos;identifiants - authentification OAuth
                    </div>
                  )}
                  {cred.note && (
                    <p className="text-xs text-white/25 mt-2 px-1">
                      {cred.note}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Admin Guide */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 glass-card p-8"
          >
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
              <Crown className="w-6 h-6 text-cyber-400" />
              Guide d&apos;administration rapide
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                {
                  title: "1. Deployer la stack On-Premise",
                  icon: <Server className="w-5 h-5" />,
                  color: "#22c55e",
                  steps: [
                    "Lancez : docker compose --profile node up -d",
                    `Accedez au dashboard : ${buildUrl("3005")}`,
                    "Connectez-vous en admin",
                    "Creez les comptes utilisateurs",
                    "Configurez le SMTP pour le phishing",
                    "Creez votre premiere campagne de phishing",
                  ],
                },
                {
                  title: "2. Configurer l'AI Security (DLP)",
                  icon: <Brain className="w-5 h-5" />,
                  color: "#f97316",
                  steps: [
                    "Lancez : docker compose --profile ai-security up -d",
                    "Attendez le telechargement de Mistral (~4 Go)",
                    `Verifiez la sante : ${buildUrl("8002", "/health")}`,
                    "Installez l'extension Chrome CyberSensei",
                    "Les prompts vers ChatGPT/Copilot seront analyses",
                    "Consultez les alertes sur le dashboard",
                  ],
                },
                {
                  title: "3. Gerer la plateforme SaaS",
                  icon: <Globe className="w-5 h-5" />,
                  color: "#8b5cf6",
                  steps: [
                    "Lancez : docker compose --profile central up -d",
                    `Accedez a ${buildUrl("5173")} (admin SaaS)`,
                    "Creez des tenants pour vos clients",
                    "Generez des licences",
                    "Uploadez les mises a jour de contenu",
                    "Surveillez la telemetrie des instances",
                  ],
                },
                {
                  title: "4. Auditer Microsoft 365",
                  icon: <ShieldCheck className="w-5 h-5" />,
                  color: "#0078D4",
                  steps: [
                    "Configurez M365_CLIENT_ID dans le .env",
                    `Accedez a ${buildUrl("5174")} (M365 Dashboard)`,
                    "Entrez votre Tenant ID dans les parametres",
                    "Autorisez l'acces OAuth (lecture seule)",
                    "Lancez un scan de securite",
                    "Generez un rapport PDF avec resume IA",
                  ],
                },
              ].map((guide) => (
                <div
                  key={guide.title}
                  className="rounded-xl border p-5"
                  style={{
                    borderColor: guide.color + "20",
                    backgroundColor: guide.color + "04",
                  }}
                >
                  <h4
                    className="font-semibold mb-3 flex items-center gap-2"
                    style={{ color: guide.color }}
                  >
                    {guide.icon}
                    {guide.title}
                  </h4>
                  <ol className="space-y-2">
                    {guide.steps.map((step, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-2 text-sm text-white/50"
                      >
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                          style={{
                            backgroundColor: guide.color + "15",
                            color: guide.color,
                          }}
                        >
                          {j + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Useful commands */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-8 glass-card p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-cyber-400" />
              Commandes utiles
            </h3>
            <div className="space-y-2">
              {[
                { cmd: "docker compose down", desc: "Arreter tous les services" },
                { cmd: "docker compose --profile full logs -f", desc: "Voir les logs en temps reel" },
                { cmd: "docker compose --profile full ps", desc: "Etat de tous les services" },
                { cmd: "docker compose --profile node restart node-backend", desc: "Redemarrer un service specifique" },
                { cmd: "docker volume prune", desc: "Nettoyer les volumes inutilises" },
                { cmd: "docker compose --profile full build --no-cache", desc: "Reconstruire toutes les images" },
              ].map((c) => (
                <div
                  key={c.cmd}
                  className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-navy-950 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-cyber-500/40 shrink-0">$</span>
                    <code className="text-sm text-white/60 font-mono truncate">
                      {c.cmd}
                    </code>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <span className="text-xs text-white/25 hidden md:block">
                      {c.desc}
                    </span>
                    <CopyButton text={c.cmd} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>
      </div>

    </main>
  );
}
