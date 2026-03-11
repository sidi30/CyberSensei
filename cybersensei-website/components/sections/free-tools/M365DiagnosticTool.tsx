"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  Shield,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  Lock,
  Mail,
  Users,
  Key,
  Globe,
  FileText,
  Loader2,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

type Step = "intro" | "form" | "connecting" | "scanning" | "results";

interface CategoryScore {
  category: string;
  label: string;
  score: number;
  grade: string;
  icon: typeof Shield;
  findingsCount: number;
}

const scanSteps = [
  { label: "Authentification multi-facteur (MFA)", icon: Key },
  { label: "Rôles administrateurs", icon: Users },
  { label: "Transfert d'emails", icon: Mail },
  { label: "Partage SharePoint/OneDrive", icon: Globe },
  { label: "Sécurité email (SPF/DKIM/DMARC)", icon: Shield },
  { label: "Applications OAuth", icon: Lock },
  { label: "Politique de mots de passe", icon: Key },
  { label: "Accès conditionnel", icon: Shield },
  { label: "Boîtes mail", icon: Mail },
  { label: "Connexions suspectes", icon: AlertTriangle },
];

function getGradeColor(grade: string) {
  switch (grade) {
    case "A":
      return "text-green-400";
    case "B":
      return "text-green-300";
    case "C":
      return "text-yellow-400";
    case "D":
      return "text-orange-400";
    case "E":
      return "text-red-400";
    case "F":
      return "text-red-500";
    default:
      return "text-gray-400";
  }
}

function getGradeBg(grade: string) {
  switch (grade) {
    case "A":
      return "bg-green-500/20 border-green-500/30";
    case "B":
      return "bg-green-400/20 border-green-400/30";
    case "C":
      return "bg-yellow-500/20 border-yellow-500/30";
    case "D":
      return "bg-orange-500/20 border-orange-500/30";
    case "E":
    case "F":
      return "bg-red-500/20 border-red-500/30";
    default:
      return "bg-white/5 border-white/10";
  }
}

function getSeverityIcon(severity: string) {
  switch (severity) {
    case "CRITICAL":
      return <XCircle className="w-5 h-5 text-red-500" />;
    case "HIGH":
      return <AlertTriangle className="w-5 h-5 text-orange-400" />;
    case "MEDIUM":
      return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
    default:
      return <Info className="w-5 h-5 text-blue-400" />;
  }
}

export function M365DiagnosticTool() {
  const [step, setStep] = useState<Step>("intro");
  const [formData, setFormData] = useState({ email: "", companyName: "" });
  const [currentScanStep, setCurrentScanStep] = useState(0);
  const [error, setError] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3006";

  const handleStartDiagnostic = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStep("connecting");

    try {
      const response = await fetch(`${API_URL}/api/diagnostic/m365/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Erreur lors du démarrage du diagnostic");
      }

      const data = await response.json();

      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
      setStep("form");
    }
  };

  const simulateScan = () => {
    setStep("scanning");
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setCurrentScanStep(i);
      if (i >= scanSteps.length) {
        clearInterval(interval);
        setTimeout(() => setStep("results"), 500);
      }
    }, 800);
  };

  // Demo results for preview
  const demoResults = {
    globalScore: 47,
    grade: "D",
    totalFindings: 18,
    criticalCount: 3,
    highCount: 7,
    mediumCount: 5,
    topFindings: [
      {
        severity: "CRITICAL",
        title: "MFA non activé pour 12 comptes administrateurs",
        category: "MFA",
      },
      {
        severity: "CRITICAL",
        title: "Transfert d'emails externe détecté sur 3 boîtes mail",
        category: "EMAIL_FORWARDING",
      },
      {
        severity: "CRITICAL",
        title: "SPF et DMARC non configurés sur le domaine principal",
        category: "EMAIL_SECURITY",
      },
    ],
    categoryScores: [
      { category: "MFA", label: "Authentification MFA", score: 25, grade: "E", icon: Key, findingsCount: 4 },
      { category: "ADMIN_ROLES", label: "Rôles Admin", score: 60, grade: "C", icon: Users, findingsCount: 2 },
      { category: "EMAIL_SECURITY", label: "Sécurité Email", score: 20, grade: "F", icon: Mail, findingsCount: 3 },
      { category: "SHARING", label: "Partage", score: 45, grade: "D", icon: Globe, findingsCount: 2 },
      { category: "OAUTH_APPS", label: "Apps OAuth", score: 70, grade: "C", icon: Lock, findingsCount: 1 },
    ] as CategoryScore[],
  };

  return (
    <section className="relative min-h-screen pt-24 pb-16 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute inset-0 bg-grid opacity-30" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <Link
            href="/outils-gratuits"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-cyber-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux outils gratuits
          </Link>
        </motion.div>

        {/* STEP: Intro */}
        {step === "intro" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="text-center mb-12">
              <div className="w-20 h-20 rounded-2xl bg-cyber-500/20 flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-cyber-400" />
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
                Diagnostic <span className="text-gradient">Microsoft 365</span>
              </h1>
              <p className="text-lg text-gray-400 max-w-xl mx-auto">
                Connectez votre tenant Microsoft 365 et obtenez un audit de
                sécurité complet en 5 minutes. 10 catégories analysées.
              </p>
            </div>

            <div className="glass-card p-8 mb-8">
              <h3 className="font-display text-lg font-bold text-white mb-6">
                Ce que nous analysons :
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {scanSteps.map((s) => (
                  <div key={s.label} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                      <s.icon className="w-4 h-4 text-cyber-400" />
                    </div>
                    <span className="text-sm text-gray-300">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card p-6 mb-8 border-cyber-500/20">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-cyber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-300 font-medium mb-1">
                    Vos données sont protégées
                  </p>
                  <p className="text-xs text-gray-400">
                    Nous utilisons uniquement des permissions en lecture seule.
                    Aucune donnée n&apos;est stockée après l&apos;analyse. Les tokens
                    d&apos;accès sont chiffrés (AES-256) et supprimés après le scan.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                className="group"
                onClick={() => setStep("form")}
              >
                Commencer le diagnostic
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={simulateScan}
              >
                Voir un exemple de résultat
              </Button>
            </div>
          </motion.div>
        )}

        {/* STEP: Form */}
        {step === "form" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg mx-auto"
          >
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl font-bold text-white mb-2">
                Vos informations
              </h2>
              <p className="text-gray-400">
                Pour recevoir votre rapport de diagnostic
              </p>
            </div>

            <div className="glass-card p-8 glow">
              <form onSubmit={handleStartDiagnostic} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email professionnel
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((p) => ({ ...p, email: e.target.value }))
                    }
                    placeholder="vous@entreprise.fr"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Nom de l&apos;entreprise
                  </label>
                  <Input
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData((p) => ({
                        ...p,
                        companyName: e.target.value,
                      }))
                    }
                    placeholder="Votre entreprise"
                    required
                  />
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                <Button type="submit" size="lg" className="w-full group">
                  <Shield className="mr-2 w-4 h-4" />
                  Connecter Microsoft 365
                  <ExternalLink className="ml-2 w-4 h-4" />
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Vous serez redirigé vers Microsoft pour autoriser l&apos;accès
                  en lecture seule.
                </p>
              </form>
            </div>
          </motion.div>
        )}

        {/* STEP: Connecting */}
        {step === "connecting" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto text-center"
          >
            <Loader2 className="w-16 h-16 text-cyber-400 animate-spin mx-auto mb-6" />
            <h2 className="font-display text-2xl font-bold text-white mb-2">
              Connexion en cours...
            </h2>
            <p className="text-gray-400">
              Redirection vers Microsoft pour autorisation
            </p>
          </motion.div>
        )}

        {/* STEP: Scanning */}
        {step === "scanning" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg mx-auto"
          >
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl font-bold text-white mb-2">
                Analyse en cours...
              </h2>
              <p className="text-gray-400">
                {currentScanStep}/{scanSteps.length} contrôles effectués
              </p>
            </div>

            <div className="glass-card p-6">
              {/* Progress bar */}
              <div className="w-full bg-white/5 rounded-full h-2 mb-6">
                <motion.div
                  className="bg-gradient-to-r from-cyber-500 to-cyber-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(currentScanStep / scanSteps.length) * 100}%`,
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              <div className="space-y-3">
                {scanSteps.map((s, i) => (
                  <div
                    key={s.label}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                      i < currentScanStep
                        ? "bg-cyber-500/10"
                        : i === currentScanStep
                          ? "bg-white/5"
                          : "opacity-40"
                    }`}
                  >
                    {i < currentScanStep ? (
                      <CheckCircle className="w-5 h-5 text-cyber-400" />
                    ) : i === currentScanStep ? (
                      <Loader2 className="w-5 h-5 text-cyber-400 animate-spin" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-white/20" />
                    )}
                    <span className="text-sm text-gray-300">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP: Results */}
        {step === "results" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            {/* Global Score */}
            <div className="text-center mb-12">
              <h2 className="font-display text-2xl font-bold text-white mb-6">
                Résultat de votre diagnostic
              </h2>
              <div
                className={`inline-flex items-center justify-center w-32 h-32 rounded-full border-4 ${getGradeBg(demoResults.grade)}`}
              >
                <div className="text-center">
                  <div
                    className={`font-display text-5xl font-bold ${getGradeColor(demoResults.grade)}`}
                  >
                    {demoResults.grade}
                  </div>
                  <div className="text-sm text-gray-400">
                    {demoResults.globalScore}/100
                  </div>
                </div>
              </div>
              <p className="text-gray-400 mt-4">
                <span className="font-bold text-white">
                  {demoResults.totalFindings} vulnérabilités
                </span>{" "}
                détectées dont{" "}
                <span className="text-red-400 font-bold">
                  {demoResults.criticalCount} critiques
                </span>
              </p>
            </div>

            {/* Critical Findings (visible) */}
            <div className="glass-card p-6 mb-8">
              <h3 className="font-display text-lg font-bold text-white mb-4">
                Vulnérabilités critiques détectées
              </h3>
              <div className="space-y-3">
                {demoResults.topFindings.map((finding, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-4 rounded-lg bg-red-500/5 border border-red-500/10"
                  >
                    {getSeverityIcon(finding.severity)}
                    <div>
                      <p className="text-sm text-white font-medium">
                        {finding.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Catégorie : {finding.category}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Scores (partially blurred) */}
            <div className="glass-card p-6 mb-8">
              <h3 className="font-display text-lg font-bold text-white mb-4">
                Scores par catégorie
              </h3>
              <div className="space-y-4">
                {demoResults.categoryScores.map((cat, i) => (
                  <div key={cat.category}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <cat.icon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-300">
                          {cat.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-bold ${getGradeColor(cat.grade)}`}
                        >
                          {cat.grade}
                        </span>
                        <span className="text-xs text-gray-400">
                          {cat.score}/100
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          cat.score >= 75
                            ? "bg-green-400"
                            : cat.score >= 50
                              ? "bg-yellow-400"
                              : "bg-red-400"
                        }`}
                        style={{ width: `${cat.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Blurred remaining categories */}
              <div className="relative mt-6">
                <div className="blur-sm pointer-events-none space-y-4 opacity-50">
                  {["Politique mots de passe", "Accès conditionnel", "Boîtes mail", "Connexions", "Transfert emails"].map(
                    (label) => (
                      <div key={label}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-300">{label}</span>
                          <span className="text-sm text-gray-400">--/100</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-2">
                          <div className="h-2 rounded-full bg-gray-500 w-1/3" />
                        </div>
                      </div>
                    )
                  )}
                </div>

                {/* Overlay CTA */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="glass-card p-6 text-center border-cyber-500/30">
                    <Lock className="w-8 h-8 text-cyber-400 mx-auto mb-3" />
                    <p className="text-white font-medium mb-2">
                      +{demoResults.highCount + demoResults.mediumCount}{" "}
                      vulnérabilités détectées
                    </p>
                    <p className="text-xs text-gray-400 mb-4">
                      Obtenez le rapport complet avec toutes les recommandations
                    </p>
                    <Link href="/#contact">
                      <Button size="sm" className="group">
                        Obtenir le rapport complet
                        <ArrowRight className="ml-2 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="glass-card p-8 text-center glow">
              <h3 className="font-display text-xl font-bold text-white mb-2">
                Votre score : {demoResults.grade} ({demoResults.globalScore}/100)
              </h3>
              <p className="text-gray-400 mb-6">
                CyberSensei peut vous aider à passer de{" "}
                <span className={`font-bold ${getGradeColor(demoResults.grade)}`}>
                  {demoResults.grade}
                </span>{" "}
                à{" "}
                <span className="font-bold text-green-400">A</span> avec la
                formation continue et les audits réguliers.
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
