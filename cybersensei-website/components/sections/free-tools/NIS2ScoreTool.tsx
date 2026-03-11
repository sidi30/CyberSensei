"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import {
  Scale,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Shield,
  Lock,
  Users,
  Server,
  FileSearch,
  Eye,
  Key,
  HardDrive,
  Network,
  MessageSquare,
  Building2,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

type Step = "intro" | "company" | "questionnaire" | "results";

interface NIS2Question {
  id: string;
  category: string;
  categoryLabel: string;
  categoryIcon: typeof Shield;
  question: string;
  description: string;
  options: { value: number; label: string }[];
  weight: number;
}

const categories = [
  { key: "RISK_ANALYSIS", label: "Analyse de risques", icon: FileSearch },
  { key: "INCIDENT_HANDLING", label: "Gestion des incidents", icon: AlertTriangle },
  { key: "BUSINESS_CONTINUITY", label: "Continuité d'activité", icon: Server },
  { key: "SUPPLY_CHAIN", label: "Chaîne d'approvisionnement", icon: Network },
  { key: "NETWORK_SECURITY", label: "Sécurité réseau", icon: Shield },
  { key: "VULNERABILITY_MANAGEMENT", label: "Gestion des vulnérabilités", icon: Eye },
  { key: "CYBER_HYGIENE", label: "Cyber-hygiène & formation", icon: Users },
  { key: "CRYPTOGRAPHY", label: "Cryptographie", icon: Lock },
  { key: "ACCESS_CONTROL", label: "Contrôle d'accès", icon: Key },
  { key: "ASSET_MANAGEMENT", label: "Gestion des actifs", icon: HardDrive },
];

const questions: NIS2Question[] = [
  {
    id: "ra-1", category: "RISK_ANALYSIS", categoryLabel: "Analyse de risques", categoryIcon: FileSearch,
    question: "Avez-vous réalisé une analyse de risques cybersécurité au cours des 12 derniers mois ?",
    description: "L'article 21.2.a de NIS2 exige une politique d'analyse des risques et de sécurité des systèmes d'information.",
    options: [
      { value: 0, label: "Non, aucune analyse de risques réalisée" },
      { value: 1, label: "Une analyse informelle a été faite" },
      { value: 2, label: "Une analyse formelle existe mais n'est pas régulièrement mise à jour" },
      { value: 3, label: "Une analyse formelle est réalisée et mise à jour au moins annuellement" },
    ],
    weight: 3,
  },
  {
    id: "ra-2", category: "RISK_ANALYSIS", categoryLabel: "Analyse de risques", categoryIcon: FileSearch,
    question: "Disposez-vous d'un registre des actifs informatiques critiques ?",
    description: "Identification et classification des systèmes et données essentiels à votre activité.",
    options: [
      { value: 0, label: "Non, nous n'avons pas de registre" },
      { value: 1, label: "Nous avons une liste partielle et informelle" },
      { value: 2, label: "Un registre existe mais n'est pas maintenu régulièrement" },
      { value: 3, label: "Un registre complet est maintenu et mis à jour régulièrement" },
    ],
    weight: 2,
  },
  {
    id: "ih-1", category: "INCIDENT_HANDLING", categoryLabel: "Gestion des incidents", categoryIcon: AlertTriangle,
    question: "Avez-vous un plan de réponse aux incidents de cybersécurité ?",
    description: "NIS2 impose la gestion des incidents, incluant la prévention, la détection et la réponse.",
    options: [
      { value: 0, label: "Non, aucun plan défini" },
      { value: 1, label: "Des procédures informelles existent" },
      { value: 2, label: "Un plan existe mais n'a jamais été testé" },
      { value: 3, label: "Un plan documenté existe et est testé régulièrement" },
    ],
    weight: 3,
  },
  {
    id: "ih-2", category: "INCIDENT_HANDLING", categoryLabel: "Gestion des incidents", categoryIcon: AlertTriangle,
    question: "Êtes-vous en mesure de notifier un incident cyber aux autorités sous 24h ?",
    description: "NIS2 exige une notification initiale à l'ANSSI sous 24h et un rapport complet sous 72h.",
    options: [
      { value: 0, label: "Non, nous ne savons pas comment faire" },
      { value: 1, label: "Nous connaissons la procédure mais elle n'est pas formalisée" },
      { value: 2, label: "La procédure est documentée mais les contacts ne sont pas identifiés" },
      { value: 3, label: "La procédure est documentée, les contacts identifiés et l'équipe formée" },
    ],
    weight: 3,
  },
  {
    id: "bc-1", category: "BUSINESS_CONTINUITY", categoryLabel: "Continuité d'activité", categoryIcon: Server,
    question: "Disposez-vous d'un plan de continuité d'activité (PCA) en cas de cyberattaque ?",
    description: "Capacité à maintenir les activités essentielles pendant et après un incident.",
    options: [
      { value: 0, label: "Non, aucun PCA" },
      { value: 1, label: "Des procédures de base existent (sauvegardes)" },
      { value: 2, label: "Un PCA existe mais n'a pas été testé récemment" },
      { value: 3, label: "Un PCA complet est documenté, testé et mis à jour annuellement" },
    ],
    weight: 3,
  },
  {
    id: "bc-2", category: "BUSINESS_CONTINUITY", categoryLabel: "Continuité d'activité", categoryIcon: Server,
    question: "Vos sauvegardes sont-elles chiffrées et stockées hors-ligne ?",
    description: "Protection des sauvegardes contre les ransomwares et les accès non autorisés.",
    options: [
      { value: 0, label: "Pas de sauvegardes régulières" },
      { value: 1, label: "Sauvegardes en ligne uniquement (cloud ou réseau)" },
      { value: 2, label: "Sauvegardes hors-ligne mais non chiffrées" },
      { value: 3, label: "Sauvegardes chiffrées, hors-ligne, avec tests de restauration réguliers" },
    ],
    weight: 2,
  },
  {
    id: "sc-1", category: "SUPPLY_CHAIN", categoryLabel: "Chaîne d'approvisionnement", categoryIcon: Network,
    question: "Évaluez-vous la sécurité de vos fournisseurs et prestataires IT ?",
    description: "NIS2 impose la sécurité de la chaîne d'approvisionnement et des relations avec les fournisseurs.",
    options: [
      { value: 0, label: "Non, aucune évaluation" },
      { value: 1, label: "Évaluation informelle pour certains fournisseurs critiques" },
      { value: 2, label: "Clauses de sécurité dans les contrats mais pas de suivi" },
      { value: 3, label: "Évaluation systématique, clauses contractuelles et audits réguliers" },
    ],
    weight: 2,
  },
  {
    id: "sc-2", category: "SUPPLY_CHAIN", categoryLabel: "Chaîne d'approvisionnement", categoryIcon: Network,
    question: "Avez-vous une liste de vos fournisseurs ayant accès à vos systèmes ou données ?",
    description: "Visibilité sur les tiers ayant des accès à votre infrastructure.",
    options: [
      { value: 0, label: "Non, pas de liste" },
      { value: 1, label: "Liste partielle et informelle" },
      { value: 2, label: "Liste complète mais sans revue des accès" },
      { value: 3, label: "Liste complète avec revue trimestrielle des accès et permissions" },
    ],
    weight: 2,
  },
  {
    id: "ns-1", category: "NETWORK_SECURITY", categoryLabel: "Sécurité réseau", categoryIcon: Shield,
    question: "Votre réseau est-il segmenté (séparation des environnements critiques) ?",
    description: "Sécurité dans l'acquisition, le développement et la maintenance des réseaux et systèmes.",
    options: [
      { value: 0, label: "Non, réseau plat sans segmentation" },
      { value: 1, label: "Segmentation basique (WiFi invité séparé)" },
      { value: 2, label: "Segmentation par VLAN mais sans contrôle d'accès entre segments" },
      { value: 3, label: "Segmentation complète avec pare-feu inter-segments et monitoring" },
    ],
    weight: 2,
  },
  {
    id: "ns-2", category: "NETWORK_SECURITY", categoryLabel: "Sécurité réseau", categoryIcon: Shield,
    question: "Utilisez-vous un pare-feu et un système de détection d'intrusion ?",
    description: "Protection périmétrique et détection des menaces réseau.",
    options: [
      { value: 0, label: "Non, pas de pare-feu dédié" },
      { value: 1, label: "Pare-feu basique (box opérateur)" },
      { value: 2, label: "Pare-feu professionnel mais sans IDS/IPS" },
      { value: 3, label: "Pare-feu next-gen avec IDS/IPS et journalisation centralisée" },
    ],
    weight: 2,
  },
  {
    id: "vm-1", category: "VULNERABILITY_MANAGEMENT", categoryLabel: "Gestion des vulnérabilités", categoryIcon: Eye,
    question: "Appliquez-vous les mises à jour de sécurité dans un délai défini ?",
    description: "Gestion et divulgation des vulnérabilités.",
    options: [
      { value: 0, label: "Pas de politique de mise à jour" },
      { value: 1, label: "Mises à jour appliquées quand on y pense" },
      { value: 2, label: "Mises à jour mensuelles mais sans priorisation" },
      { value: 3, label: "Mises à jour critiques sous 48h, politique documentée et suivie" },
    ],
    weight: 2,
  },
  {
    id: "vm-2", category: "VULNERABILITY_MANAGEMENT", categoryLabel: "Gestion des vulnérabilités", categoryIcon: Eye,
    question: "Réalisez-vous des scans de vulnérabilités ou des tests d'intrusion ?",
    description: "Détection proactive des failles de sécurité.",
    options: [
      { value: 0, label: "Jamais" },
      { value: 1, label: "Ponctuellement, sans régularité" },
      { value: 2, label: "Scans automatisés réguliers mais pas de pentest" },
      { value: 3, label: "Scans automatisés + pentest annuel par un tiers qualifié" },
    ],
    weight: 2,
  },
  {
    id: "ch-1", category: "CYBER_HYGIENE", categoryLabel: "Cyber-hygiène & formation", categoryIcon: Users,
    question: "Vos employés reçoivent-ils une formation cybersécurité régulière ?",
    description: "Pratiques de base en matière de cyber-hygiène et formation à la cybersécurité.",
    options: [
      { value: 0, label: "Non, aucune formation" },
      { value: 1, label: "Formation ponctuelle à l'embauche uniquement" },
      { value: 2, label: "Formation annuelle obligatoire" },
      { value: 3, label: "Formation continue avec simulations de phishing et suivi individuel" },
    ],
    weight: 3,
  },
  {
    id: "ch-2", category: "CYBER_HYGIENE", categoryLabel: "Cyber-hygiène & formation", categoryIcon: Users,
    question: "Avez-vous une politique de mots de passe et d'authentification forte ?",
    description: "Règles de complexité, renouvellement et authentification multi-facteur.",
    options: [
      { value: 0, label: "Pas de politique de mots de passe" },
      { value: 1, label: "Politique basique (longueur minimale)" },
      { value: 2, label: "Politique stricte mais MFA non généralisé" },
      { value: 3, label: "Politique stricte + MFA obligatoire sur tous les systèmes critiques" },
    ],
    weight: 3,
  },
  {
    id: "cr-1", category: "CRYPTOGRAPHY", categoryLabel: "Cryptographie", categoryIcon: Lock,
    question: "Vos données sensibles sont-elles chiffrées au repos et en transit ?",
    description: "Politiques et procédures relatives à l'utilisation de la cryptographie.",
    options: [
      { value: 0, label: "Pas de chiffrement" },
      { value: 1, label: "HTTPS en place mais données non chiffrées au repos" },
      { value: 2, label: "Chiffrement en transit (TLS) et partiel au repos" },
      { value: 3, label: "Chiffrement systématique en transit et au repos, gestion des clés documentée" },
    ],
    weight: 2,
  },
  {
    id: "cr-2", category: "CRYPTOGRAPHY", categoryLabel: "Cryptographie", categoryIcon: Lock,
    question: "Gérez-vous vos certificats et clés de chiffrement de manière centralisée ?",
    description: "Gestion du cycle de vie des certificats et des clés cryptographiques.",
    options: [
      { value: 0, label: "Non, pas de gestion centralisée" },
      { value: 1, label: "Gestion manuelle avec tableur ou documentation" },
      { value: 2, label: "Outil de gestion en place mais renouvellement manuel" },
      { value: 3, label: "Gestion centralisée avec renouvellement automatique et alertes d'expiration" },
    ],
    weight: 1,
  },
  {
    id: "ac-1", category: "ACCESS_CONTROL", categoryLabel: "Contrôle d'accès", categoryIcon: Key,
    question: "Appliquez-vous le principe du moindre privilège pour les accès ?",
    description: "Sécurité des ressources humaines, politiques de contrôle d'accès et gestion des actifs.",
    options: [
      { value: 0, label: "Non, les employés ont des accès larges par défaut" },
      { value: 1, label: "Les accès admin sont limités mais les accès utilisateurs sont larges" },
      { value: 2, label: "Accès basés sur les rôles mais sans revue régulière" },
      { value: 3, label: "RBAC strict avec revue trimestrielle et désactivation automatique au départ" },
    ],
    weight: 2,
  },
  {
    id: "ac-2", category: "ACCESS_CONTROL", categoryLabel: "Contrôle d'accès", categoryIcon: Key,
    question: "Avez-vous un processus de gestion des arrivées/départs ?",
    description: "Création et suppression des comptes et accès lors des mouvements de personnel.",
    options: [
      { value: 0, label: "Non, pas de processus défini" },
      { value: 1, label: "Processus informel, dépend de la bonne volonté" },
      { value: 2, label: "Processus documenté mais pas toujours suivi" },
      { value: 3, label: "Processus automatisé avec checklist et vérification systématique" },
    ],
    weight: 2,
  },
  {
    id: "am-1", category: "ASSET_MANAGEMENT", categoryLabel: "Gestion des actifs", categoryIcon: HardDrive,
    question: "Utilisez-vous des solutions EDR/XDR sur les postes de travail ?",
    description: "Utilisation de solutions de détection et réponse sur les endpoints.",
    options: [
      { value: 0, label: "Non, antivirus basique ou aucun" },
      { value: 1, label: "Antivirus professionnel mais pas d'EDR" },
      { value: 2, label: "EDR déployé mais sans monitoring actif" },
      { value: 3, label: "EDR/XDR avec monitoring 24/7 et réponse automatisée" },
    ],
    weight: 2,
  },
  {
    id: "am-2", category: "ASSET_MANAGEMENT", categoryLabel: "Gestion des actifs", categoryIcon: HardDrive,
    question: "Vos communications internes sensibles sont-elles sécurisées ?",
    description: "Communications vocales, vidéo et texte sécurisées, y compris en situation d'urgence.",
    options: [
      { value: 0, label: "Utilisation de messageries grand public sans contrôle" },
      { value: 1, label: "Messagerie d'entreprise mais sans politique de sécurité" },
      { value: 2, label: "Messagerie chiffrée avec politique d'usage" },
      { value: 3, label: "Messagerie chiffrée, canaux d'urgence dédiés, communications de crise testées" },
    ],
    weight: 1,
  },
];

function getGradeColor(grade: string) {
  switch (grade) {
    case "A": return "text-green-400";
    case "B": return "text-green-300";
    case "C": return "text-yellow-400";
    case "D": return "text-orange-400";
    case "E": return "text-red-400";
    case "F": return "text-red-500";
    default: return "text-gray-400";
  }
}

function getGradeBg(grade: string) {
  switch (grade) {
    case "A": return "bg-green-500/20 border-green-500/30";
    case "B": return "bg-green-400/20 border-green-400/30";
    case "C": return "bg-yellow-500/20 border-yellow-500/30";
    case "D": return "bg-orange-500/20 border-orange-500/30";
    case "E": case "F": return "bg-red-500/20 border-red-500/30";
    default: return "bg-white/5 border-white/10";
  }
}

function getStatusLabel(score: number) {
  if (score >= 75) return { label: "Conforme", color: "text-green-400", bg: "bg-green-500/10" };
  if (score >= 40) return { label: "Partiel", color: "text-yellow-400", bg: "bg-yellow-500/10" };
  return { label: "Non conforme", color: "text-red-400", bg: "bg-red-500/10" };
}

function getGrade(score: number) {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 40) return "D";
  if (score >= 20) return "E";
  return "F";
}

export function NIS2ScoreTool() {
  const [step, setStep] = useState<Step>("intro");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [companyInfo, setCompanyInfo] = useState({
    companyName: "",
    email: "",
    sector: "",
    employeeCount: "",
  });

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion((p) => p + 1), 300);
    }
  };

  const results = useMemo(() => {
    if (Object.keys(answers).length < questions.length) return null;

    const categoryScores: Record<string, { score: number; maxScore: number; totalWeight: number }> = {};

    for (const q of questions) {
      if (!categoryScores[q.category]) {
        categoryScores[q.category] = { score: 0, maxScore: 0, totalWeight: 0 };
      }
      categoryScores[q.category].score += (answers[q.id] || 0) * q.weight;
      categoryScores[q.category].maxScore += 3 * q.weight;
      categoryScores[q.category].totalWeight += q.weight;
    }

    const catResults = categories.map((cat) => {
      const data = categoryScores[cat.key] || { score: 0, maxScore: 1 };
      const score = Math.round((data.score / data.maxScore) * 100);
      return {
        key: cat.key,
        label: cat.label,
        icon: cat.icon,
        score,
        grade: getGrade(score),
        status: getStatusLabel(score),
      };
    });

    const totalWeightedScore = catResults.reduce((sum, c) => sum + c.score, 0);
    const globalScore = Math.round(totalWeightedScore / catResults.length);
    const conformeCount = catResults.filter((c) => c.score >= 75).length;

    const employeeNum = parseInt(companyInfo.employeeCount) || 0;
    const isNIS2Subject = employeeNum >= 50;

    return {
      globalScore,
      grade: getGrade(globalScore),
      categoryScores: catResults,
      conformeCount,
      isNIS2Subject,
      deadline: "17 octobre 2026",
    };
  }, [answers, companyInfo.employeeCount]);

  const allAnswered = Object.keys(answers).length >= questions.length;
  const q = questions[currentQuestion];

  return (
    <section className="relative min-h-screen pt-24 pb-16 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute inset-0 bg-grid opacity-30" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8">
          <Link
            href="/outils-gratuits"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-cyber-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux outils gratuits
          </Link>
        </motion.div>

        {/* INTRO */}
        {step === "intro" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="text-center mb-12">
              <div className="w-20 h-20 rounded-2xl bg-purple-500/20 flex items-center justify-center mx-auto mb-6">
                <Scale className="w-10 h-10 text-purple-400" />
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
                Score de conformité <span className="text-gradient">NIS2</span>
              </h1>
              <p className="text-lg text-gray-400 max-w-xl mx-auto">
                La directive NIS2 entre en vigueur le{" "}
                <span className="text-white font-bold">17 octobre 2026</span>.
                Évaluez votre niveau de conformité en 5 minutes.
              </p>
            </div>

            <div className="glass-card p-6 mb-8">
              <h3 className="text-white font-bold mb-4">
                10 domaines évalués (Article 21 NIS2)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categories.map((cat) => (
                  <div key={cat.key} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                      <cat.icon className="w-4 h-4 text-cyber-400" />
                    </div>
                    <span className="text-sm text-gray-300">{cat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-5 mb-8 border-purple-500/20">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-300 font-medium mb-1">
                    Qui est concerné par NIS2 ?
                  </p>
                  <p className="text-xs text-gray-400">
                    Entreprises de 50+ employés OU 10M+ EUR de CA dans les
                    secteurs essentiels ou importants (énergie, transport,
                    banque, santé, numérique, industrie, etc.).
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Button
                size="lg"
                className="group"
                onClick={() => setStep("company")}
              >
                Commencer l&apos;évaluation
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* COMPANY INFO */}
        {step === "company" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg mx-auto"
          >
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl font-bold text-white mb-2">
                Votre entreprise
              </h2>
              <p className="text-gray-400">
                Ces informations permettent d&apos;adapter les recommandations
              </p>
            </div>

            <div className="glass-card p-8">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Nom de l&apos;entreprise
                  </label>
                  <Input
                    value={companyInfo.companyName}
                    onChange={(e) =>
                      setCompanyInfo((p) => ({ ...p, companyName: e.target.value }))
                    }
                    placeholder="Votre entreprise"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Email professionnel
                  </label>
                  <Input
                    type="email"
                    value={companyInfo.email}
                    onChange={(e) =>
                      setCompanyInfo((p) => ({ ...p, email: e.target.value }))
                    }
                    placeholder="vous@entreprise.fr"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Secteur d&apos;activité
                  </label>
                  <select
                    value={companyInfo.sector}
                    onChange={(e) =>
                      setCompanyInfo((p) => ({ ...p, sector: e.target.value }))
                    }
                    className="w-full h-11 px-4 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm focus:border-cyber-500/50 focus:outline-none"
                  >
                    <option value="">Sélectionnez votre secteur</option>
                    <option value="energy">Énergie</option>
                    <option value="transport">Transport</option>
                    <option value="banking">Banque / Finance</option>
                    <option value="health">Santé</option>
                    <option value="digital">Numérique / IT</option>
                    <option value="industry">Industrie</option>
                    <option value="government">Administration publique</option>
                    <option value="telecom">Télécommunications</option>
                    <option value="food">Agroalimentaire</option>
                    <option value="retail">Commerce / Distribution</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Nombre d&apos;employés
                  </label>
                  <Input
                    type="number"
                    value={companyInfo.employeeCount}
                    onChange={(e) =>
                      setCompanyInfo((p) => ({
                        ...p,
                        employeeCount: e.target.value,
                      }))
                    }
                    placeholder="50"
                    min="1"
                  />
                </div>
              </div>

              <Button
                size="lg"
                className="w-full mt-6 group"
                onClick={() => setStep("questionnaire")}
                disabled={!companyInfo.companyName || !companyInfo.email}
              >
                Démarrer le questionnaire
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* QUESTIONNAIRE */}
        {step === "questionnaire" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            {/* Progress */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">
                  Question {currentQuestion + 1}/{questions.length}
                </span>
                <span className="text-sm text-gray-400">
                  {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-white/5 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-cyber-500 to-cyber-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>
              {/* Category indicator */}
              <div className="flex items-center gap-2 mt-3">
                {q && <q.categoryIcon className="w-4 h-4 text-cyber-400" />}
                <span className="text-xs text-cyber-400">
                  {q?.categoryLabel}
                </span>
              </div>
            </div>

            {/* Question */}
            <AnimatePresence mode="wait">
              {q && (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="glass-card p-8 mb-6">
                    <h3 className="font-display text-xl font-bold text-white mb-2">
                      {q.question}
                    </h3>
                    <p className="text-sm text-gray-400 mb-6">
                      {q.description}
                    </p>

                    <div className="space-y-3">
                      {q.options.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleAnswer(q.id, opt.value)}
                          className={`w-full text-left p-4 rounded-xl border transition-all ${
                            answers[q.id] === opt.value
                              ? "bg-cyber-500/20 border-cyber-500/50"
                              : "bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                answers[q.id] === opt.value
                                  ? "border-cyber-400 bg-cyber-400"
                                  : "border-gray-500"
                              }`}
                            >
                              {answers[q.id] === opt.value && (
                                <CheckCircle className="w-3 h-3 text-navy-950" />
                              )}
                            </div>
                            <span
                              className={`text-sm ${
                                answers[q.id] === opt.value
                                  ? "text-white"
                                  : "text-gray-300"
                              }`}
                            >
                              {opt.label}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() =>
                  currentQuestion > 0
                    ? setCurrentQuestion((p) => p - 1)
                    : setStep("company")
                }
              >
                <ArrowLeft className="mr-2 w-4 h-4" />
                {currentQuestion > 0 ? "Précédent" : "Retour"}
              </Button>

              {allAnswered ? (
                <Button
                  size="lg"
                  className="group"
                  onClick={() => setStep("results")}
                >
                  Voir mes résultats
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestion((p) => Math.min(p + 1, questions.length - 1))}
                  disabled={answers[q?.id] === undefined}
                >
                  Suivant
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              )}
            </div>
          </motion.div>
        )}

        {/* RESULTS */}
        {step === "results" && results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            {/* NIS2 applicability */}
            {results.isNIS2Subject && (
              <div className="glass-card p-5 mb-8 border-amber-500/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-white font-medium">
                      Votre entreprise est probablement soumise à NIS2
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Avec {companyInfo.employeeCount}+ employés dans le secteur{" "}
                      {companyInfo.sector}, vous devez être conforme avant le{" "}
                      <span className="text-amber-400 font-bold">
                        {results.deadline}
                      </span>
                      .
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Global Score */}
            <div className="text-center mb-12">
              <h2 className="font-display text-2xl font-bold text-white mb-6">
                Score de conformité NIS2
              </h2>
              <div
                className={`inline-flex items-center justify-center w-36 h-36 rounded-full border-4 ${getGradeBg(results.grade)}`}
              >
                <div className="text-center">
                  <div
                    className={`font-display text-5xl font-bold ${getGradeColor(results.grade)}`}
                  >
                    {results.grade}
                  </div>
                  <div className="text-sm text-gray-400">
                    {results.globalScore}/100
                  </div>
                </div>
              </div>
              <p className="text-gray-400 mt-4">
                <span className="font-bold text-white">
                  {results.conformeCount}/10
                </span>{" "}
                domaines conformes
              </p>
            </div>

            {/* Category Breakdown */}
            <div className="glass-card p-6 mb-8">
              <h3 className="font-display text-lg font-bold text-white mb-6">
                Détail par domaine
              </h3>
              <div className="space-y-5">
                {results.categoryScores.map((cat) => (
                  <div key={cat.key}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <cat.icon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-300">
                          {cat.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${cat.status.bg} ${cat.status.color}`}
                        >
                          {cat.status.label}
                        </span>
                        <span
                          className={`text-sm font-bold ${getGradeColor(cat.grade)}`}
                        >
                          {cat.score}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          cat.score >= 75
                            ? "bg-green-400"
                            : cat.score >= 40
                              ? "bg-yellow-400"
                              : "bg-red-400"
                        }`}
                        style={{ width: `${cat.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="glass-card p-6 mb-8">
              <h3 className="font-display text-lg font-bold text-white mb-4">
                Recommandations prioritaires
              </h3>
              <div className="space-y-3">
                {results.categoryScores
                  .filter((c) => c.score < 75)
                  .sort((a, b) => a.score - b.score)
                  .slice(0, 5)
                  .map((cat, i) => (
                    <div
                      key={cat.key}
                      className="flex items-start gap-3 p-4 rounded-lg bg-white/5"
                    >
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${
                          i < 2
                            ? "bg-red-500/20 text-red-400"
                            : "bg-amber-500/20 text-amber-400"
                        }`}
                      >
                        {i < 2 ? "CRITIQUE" : "IMPORTANT"}
                      </span>
                      <div>
                        <p className="text-sm text-white font-medium">
                          {cat.label} — Score : {cat.score}%
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {cat.score < 40
                            ? `Ce domaine nécessite une action immédiate pour atteindre la conformité NIS2 avant ${results.deadline}.`
                            : "Des améliorations sont nécessaires pour atteindre un niveau de conformité satisfaisant."}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* CTA */}
            <div className="glass-card p-8 text-center glow">
              <Building2 className="w-10 h-10 text-cyber-400 mx-auto mb-4" />
              <h3 className="font-display text-xl font-bold text-white mb-2">
                Atteignez la conformité NIS2 avec CyberSensei
              </h3>
              <p className="text-gray-400 mb-6 max-w-lg mx-auto">
                Formation cybersécurité continue, simulations de phishing, audit
                M365 automatisé et suivi de conformité — tout ce dont vous avez
                besoin pour être prêt avant octobre 2026.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/#contact">
                  <Button size="lg" className="group">
                    Demander une démo
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/#tarifs">
                  <Button variant="outline" size="lg">
                    Voir les offres
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
