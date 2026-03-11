"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  Fish,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Mail,
  Users,
  Building2,
  Loader2,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

type Step = "intro" | "config" | "emails" | "confirm" | "sending" | "results";

const templates = [
  {
    id: "password-reset",
    name: "Réinitialisation urgente",
    description: "Email alertant d'une expiration de compte sous 24h",
    difficulty: "Facile",
    type: "Hameçonnage de credentials",
    preview: "⚠️ ALERTE SÉCURITÉ - Votre compte expire dans 24h",
  },
  {
    id: "invoice",
    name: "Facture impayée",
    description: "Fausse facture avec pièce jointe à télécharger",
    difficulty: "Moyen",
    type: "Compromission email",
    preview: "Facture N°2026-0847 - Paiement en attente (487,50 €)",
  },
  {
    id: "microsoft-alert",
    name: "Activité suspecte M365",
    description: "Alerte de connexion suspecte depuis un pays étranger",
    difficulty: "Difficile",
    type: "Spear phishing",
    preview: "Activité inhabituelle détectée sur votre compte Microsoft",
  },
  {
    id: "dhl-package",
    name: "Colis DHL en attente",
    description: "Colis bloqué en douane avec frais à payer",
    difficulty: "Facile",
    type: "Hameçonnage de credentials",
    preview: "Votre colis DHL est en attente - Frais de douane : 3,50 €",
  },
  {
    id: "tax-refund",
    name: "Remboursement impôts",
    description: "Faux remboursement des impôts avec lien frauduleux",
    difficulty: "Moyen",
    type: "Hameçonnage de credentials",
    preview: "Remboursement de 523,40 € en attente de validation",
  },
  {
    id: "linkedin-premium",
    name: "LinkedIn Premium",
    description: "Offre gratuite LinkedIn Premium pendant 3 mois",
    difficulty: "Difficile",
    type: "Spear phishing",
    preview: "Offre exclusive : LinkedIn Premium gratuit pendant 3 mois",
  },
];

export function PhishingTestTool() {
  const [step, setStep] = useState<Step>("intro");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [companyInfo, setCompanyInfo] = useState({
    companyName: "",
    adminEmail: "",
    adminName: "",
  });
  const [employeeEmails, setEmployeeEmails] = useState("");
  const [sendProgress, setSendProgress] = useState(0);

  const emailList = employeeEmails
    .split("\n")
    .map((e) => e.trim())
    .filter((e) => e.includes("@"));

  const handleSend = async () => {
    setStep("sending");
    // Simulate sending progress
    for (let i = 0; i <= emailList.length; i++) {
      await new Promise((r) => setTimeout(r, 500));
      setSendProgress(i);
    }
    setTimeout(() => setStep("results"), 1000);
  };

  // Demo results
  const demoResults = {
    totalSent: emailList.length || 25,
    opened: Math.round((emailList.length || 25) * 0.76),
    clicked: Math.round((emailList.length || 25) * 0.43),
    submitted: Math.round((emailList.length || 25) * 0.12),
    reported: Math.round((emailList.length || 25) * 0.08),
    riskScore: 68,
    riskLevel: "HIGH" as const,
  };

  function getRiskColor(level: string) {
    switch (level) {
      case "CRITICAL":
        return "text-red-500";
      case "HIGH":
        return "text-orange-400";
      case "MODERATE":
        return "text-yellow-400";
      default:
        return "text-green-400";
    }
  }

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
              <div className="w-20 h-20 rounded-2xl bg-orange-500/20 flex items-center justify-center mx-auto mb-6">
                <Fish className="w-10 h-10 text-orange-400" />
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
                Test de <span className="text-gradient">Phishing</span>
              </h1>
              <p className="text-lg text-gray-400 max-w-xl mx-auto">
                Envoyez un email de phishing simulé à votre équipe et mesurez
                combien d&apos;employés cliqueraient sur un vrai email malveillant.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                {
                  icon: Users,
                  title: "Jusqu'à 25 employés",
                  desc: "Testez gratuitement une équipe complète",
                },
                {
                  icon: Mail,
                  title: "6 templates réalistes",
                  desc: "Scénarios basés sur des attaques réelles",
                },
                {
                  icon: AlertTriangle,
                  title: "Résultats détaillés",
                  desc: "Taux de clic, ouverture, soumission",
                },
              ].map((item) => (
                <div key={item.title} className="glass-card p-6 text-center">
                  <item.icon className="w-8 h-8 text-cyber-400 mx-auto mb-3" />
                  <h3 className="text-white font-medium mb-1">{item.title}</h3>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="glass-card p-5 mb-8 border-amber-500/20">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-300">
                  Les emails de simulation contiennent une page éducative
                  expliquant que c&apos;est un test. Aucune donnée n&apos;est collectée
                  lors de la soumission de formulaire.
                </p>
              </div>
            </div>

            <div className="text-center">
              <Button
                size="lg"
                className="group"
                onClick={() => setStep("config")}
              >
                Configurer le test
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* CONFIG */}
        {step === "config" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl font-bold text-white mb-2">
                1. Choisissez un template
              </h2>
              <p className="text-gray-400">
                Sélectionnez le type d&apos;email de phishing à envoyer
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {templates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t.id)}
                  className={`glass-card p-5 text-left transition-all ${
                    selectedTemplate === t.id
                      ? "border-cyber-500/50 glow-sm"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-white font-medium">{t.name}</h4>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        t.difficulty === "Facile"
                          ? "bg-green-500/10 text-green-400"
                          : t.difficulty === "Moyen"
                            ? "bg-yellow-500/10 text-yellow-400"
                            : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {t.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{t.description}</p>
                  <p className="text-xs text-gray-500 italic">
                    Objet : {t.preview}
                  </p>
                </button>
              ))}
            </div>

            <div className="glass-card p-6 mb-8">
              <h3 className="text-white font-medium mb-4">
                Informations de l&apos;entreprise
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Nom de l&apos;entreprise
                  </label>
                  <Input
                    value={companyInfo.companyName}
                    onChange={(e) =>
                      setCompanyInfo((p) => ({
                        ...p,
                        companyName: e.target.value,
                      }))
                    }
                    placeholder="Votre entreprise"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Email administrateur
                  </label>
                  <Input
                    type="email"
                    value={companyInfo.adminEmail}
                    onChange={(e) =>
                      setCompanyInfo((p) => ({
                        ...p,
                        adminEmail: e.target.value,
                      }))
                    }
                    placeholder="admin@entreprise.fr"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => setStep("intro")}>
                <ArrowLeft className="mr-2 w-4 h-4" />
                Retour
              </Button>
              <Button
                className="group"
                onClick={() => setStep("emails")}
                disabled={!selectedTemplate || !companyInfo.companyName || !companyInfo.adminEmail}
              >
                Suivant
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* EMAILS */}
        {step === "emails" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl font-bold text-white mb-2">
                2. Emails des employés
              </h2>
              <p className="text-gray-400">
                Entrez les adresses email de vos employés (max 25)
              </p>
            </div>

            <div className="glass-card p-6 mb-6">
              <label className="block text-sm text-gray-300 mb-2">
                Adresses email (une par ligne)
              </label>
              <Textarea
                value={employeeEmails}
                onChange={(e) => setEmployeeEmails(e.target.value)}
                placeholder={`employee1@entreprise.fr\nemployee2@entreprise.fr\nemployee3@entreprise.fr`}
                className="min-h-[200px] font-mono text-sm"
              />
              <div className="flex items-center justify-between mt-3">
                <p className="text-xs text-gray-400">
                  {emailList.length}/25 adresses valides détectées
                </p>
                {emailList.length > 25 && (
                  <p className="text-xs text-red-400">
                    Maximum 25 adresses pour le test gratuit
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => setStep("config")}>
                <ArrowLeft className="mr-2 w-4 h-4" />
                Retour
              </Button>
              <Button
                className="group"
                onClick={() => setStep("confirm")}
                disabled={emailList.length === 0 || emailList.length > 25}
              >
                Aperçu
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* CONFIRM */}
        {step === "confirm" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl font-bold text-white mb-2">
                3. Confirmation
              </h2>
              <p className="text-gray-400">
                Vérifiez les paramètres avant l&apos;envoi
              </p>
            </div>

            <div className="glass-card p-6 mb-6 space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-gray-400">Template</span>
                <span className="text-white font-medium">
                  {templates.find((t) => t.id === selectedTemplate)?.name}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-gray-400">Entreprise</span>
                <span className="text-white">{companyInfo.companyName}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-gray-400">Destinataires</span>
                <span className="text-white">{emailList.length} employés</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-400">Résultats envoyés à</span>
                <span className="text-white">{companyInfo.adminEmail}</span>
              </div>
            </div>

            <div className="glass-card p-5 mb-8 border-amber-500/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-300">
                  Les emails seront envoyés immédiatement. Chaque email contient
                  un lien vers une page éducative. Les résultats seront
                  disponibles sous 24-48h.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={() => setStep("emails")}>
                <ArrowLeft className="mr-2 w-4 h-4" />
                Modifier
              </Button>
              <Button size="lg" className="group" onClick={handleSend}>
                <Mail className="mr-2 w-4 h-4" />
                Lancer le test de phishing
              </Button>
            </div>
          </motion.div>
        )}

        {/* SENDING */}
        {step === "sending" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto text-center"
          >
            <Loader2 className="w-16 h-16 text-cyber-400 animate-spin mx-auto mb-6" />
            <h2 className="font-display text-2xl font-bold text-white mb-2">
              Envoi en cours...
            </h2>
            <p className="text-gray-400 mb-4">
              {sendProgress}/{emailList.length || 25} emails envoyés
            </p>
            <div className="w-full bg-white/5 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-cyber-500 to-cyber-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{
                  width: `${(sendProgress / (emailList.length || 25)) * 100}%`,
                }}
              />
            </div>
          </motion.div>
        )}

        {/* RESULTS */}
        {step === "results" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="text-center mb-12">
              <CheckCircle className="w-16 h-16 text-cyber-400 mx-auto mb-4" />
              <h2 className="font-display text-2xl font-bold text-white mb-2">
                Test de phishing lancé
              </h2>
              <p className="text-gray-400">
                Voici une estimation des résultats basée sur les moyennes du
                secteur
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                {
                  label: "Emails envoyés",
                  value: demoResults.totalSent,
                  color: "text-white",
                },
                {
                  label: "Ouvertures",
                  value: `${Math.round((demoResults.opened / demoResults.totalSent) * 100)}%`,
                  color: "text-yellow-400",
                },
                {
                  label: "Clics",
                  value: `${Math.round((demoResults.clicked / demoResults.totalSent) * 100)}%`,
                  color: "text-orange-400",
                },
                {
                  label: "Soumissions",
                  value: `${Math.round((demoResults.submitted / demoResults.totalSent) * 100)}%`,
                  color: "text-red-400",
                },
              ].map((stat) => (
                <div key={stat.label} className="glass-card p-5 text-center">
                  <div className={`font-display text-3xl font-bold ${stat.color} mb-1`}>
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Risk Score */}
            <div className="glass-card p-6 mb-8 text-center">
              <h3 className="text-white font-medium mb-2">Score de risque</h3>
              <div className={`font-display text-6xl font-bold ${getRiskColor(demoResults.riskLevel)} mb-2`}>
                {demoResults.riskScore}/100
              </div>
              <p className={`text-sm font-medium ${getRiskColor(demoResults.riskLevel)}`}>
                Niveau : {demoResults.riskLevel}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Les résultats réels seront disponibles dans 24-48h par email
              </p>
            </div>

            {/* CTA */}
            <div className="glass-card p-8 text-center glow">
              <Building2 className="w-10 h-10 text-cyber-400 mx-auto mb-4" />
              <h3 className="font-display text-xl font-bold text-white mb-2">
                Réduisez votre taux de clic à moins de 5%
              </h3>
              <p className="text-gray-400 mb-6 max-w-lg mx-auto">
                Avec CyberSensei, formez vos employés au quotidien avec des
                exercices interactifs et des simulations régulières.
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
