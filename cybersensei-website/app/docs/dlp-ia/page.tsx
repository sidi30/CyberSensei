"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Brain,
  ChevronRight,
  ArrowRight,
  AlertTriangle,
  Shield,
  Eye,
  Lock,
  Zap,
  CheckCircle,
  Chrome,
  MessageSquare,
  ScanLine,
  FileWarning,
  TrendingDown,
  BarChart3,
} from "lucide-react";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const steps = [
  {
    num: 1,
    title: "L'employe ecrit un prompt",
    desc: "Un collaborateur utilise ChatGPT, Claude ou Gemini et colle des informations dans le champ de saisie.",
    icon: MessageSquare,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    num: 2,
    title: "CyberSensei analyse en temps reel",
    desc: "L'extension analyse chaque prompt avant envoi avec Presidio NER, LLM Guard et Mistral 7B pour detecter les donnees sensibles.",
    icon: ScanLine,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
  {
    num: 3,
    title: "Alerte et anonymisation",
    desc: "Si des donnees sensibles sont detectees : alerte visuelle, suggestion d'anonymisation et possibilite de bloquer l'envoi.",
    icon: Shield,
    color: "text-cyber-400",
    bg: "bg-cyber-500/10",
    border: "border-cyber-500/20",
  },
];

const platforms = [
  { name: "ChatGPT", color: "text-emerald-400" },
  { name: "Claude", color: "text-amber-400" },
  { name: "Gemini", color: "text-blue-400" },
  { name: "Microsoft Copilot", color: "text-cyan-400" },
  { name: "Mistral", color: "text-purple-400" },
];

const detections = [
  "Numeros de carte bancaire",
  "Numeros de securite sociale",
  "Donnees personnelles (noms, adresses, emails)",
  "Secrets d'entreprise et donnees financieres",
  "Code source et propriete intellectuelle",
  "Donnees medicales et de sante",
];

const stats = [
  {
    value: "78%",
    label: "des employes utilisent l'IA generative au travail",
    source: "McKinsey 2024",
    color: "text-blue-400",
  },
  {
    value: "11%",
    label: "des donnees collees dans ChatGPT sont confidentielles",
    source: "Incident Samsung 2023",
    color: "text-amber-400",
  },
  {
    value: "0",
    label: "fuite de donnees avec CyberSensei DLP active",
    source: "",
    color: "text-cyber-400",
  },
];

export default function DlpIaPage() {
  return (
    <div className="min-h-screen bg-navy-950">
      {/* Hero */}
      <section className="relative px-6 pt-16 pb-12 lg:px-12">
        <div className="absolute inset-0 bg-cyber-grid bg-grid-size opacity-30" />
        <div className="relative max-w-4xl">
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-cyber-400 transition-colors">
              Accueil
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/docs" className="hover:text-cyber-400 transition-colors">
              Documentation
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-300">Protection DLP IA</span>
          </nav>

          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeIn} className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <Brain className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-sm font-semibold text-purple-400 uppercase tracking-wider">
                Protection des donnees
              </span>
            </motion.div>

            <motion.h1
              variants={fadeIn}
              className="font-display text-4xl md:text-5xl font-bold text-white mb-4"
            >
              Protection{" "}
              <span className="text-gradient">DLP</span> pour l&apos;IA generative
            </motion.h1>

            <motion.p variants={fadeIn} className="text-lg text-gray-400 max-w-2xl leading-relaxed">
              Emppechez les fuites de donnees sensibles vers ChatGPT, Claude et
              les autres outils IA. En temps reel, avant chaque envoi.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Le probleme */}
      <section className="px-6 pb-16 lg:px-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="max-w-4xl"
        >
          <motion.div variants={fadeIn} className="glass-card p-8 border-red-500/20">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-white mb-3">
                  Le probleme
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  Chaque jour, vos employes copient des donnees sensibles dans
                  ChatGPT, Claude, Gemini et Copilot.{" "}
                  <strong className="text-white">
                    Contrats clients, donnees financieres, code source, donnees
                    personnelles.
                  </strong>
                </p>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Sans le savoir, ils violent le{" "}
              <strong className="text-red-400">RGPD</strong> et{" "}
              <strong className="text-red-400">NIS2</strong>. Les donnees
              partagees avec les outils IA quittent votre perimetre de
              securite et peuvent etre utilisees pour entrainer des modeles,
              accessibles par des tiers ou stockees sur des serveurs hors UE.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Notre solution */}
      <section className="px-6 pb-16 lg:px-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="max-w-4xl"
        >
          <motion.h2 variants={fadeIn} className="font-display text-2xl font-bold text-white mb-6">
            <span className="text-gradient">Notre solution</span>
          </motion.h2>

          <motion.div variants={fadeIn} className="glass-card p-8 mb-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-xl bg-cyber-500/10 border border-cyber-500/20">
                <Chrome className="w-6 h-6 text-cyber-400" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-white mb-2">
                  Extension Chrome intelligente
                </h3>
                <p className="text-gray-400">
                  Une extension qui analyse chaque prompt{" "}
                  <strong className="text-white">AVANT</strong> son envoi vers
                  l&apos;outil IA. Detection en temps reel des donnees sensibles
                  avec alertes instantanees.
                </p>
              </div>
            </div>

            <p className="text-sm font-semibold text-white mb-3">
              Types de donnees detectees :
            </p>
            <div className="grid gap-2 md:grid-cols-2">
              {detections.map((d) => (
                <div key={d} className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-cyber-400 flex-shrink-0" />
                  {d}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Comment ca marche */}
      <section className="px-6 pb-16 lg:px-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="max-w-4xl"
        >
          <motion.h2 variants={fadeIn} className="font-display text-2xl font-bold text-white mb-8">
            Comment ca marche
          </motion.h2>

          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <motion.div key={step.num} variants={fadeIn} className="glass-card p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-xl ${step.bg} border ${step.border} font-display font-bold text-lg ${step.color}`}
                    >
                      {step.num}
                    </div>
                    <Icon className={`w-5 h-5 ${step.color}`} />
                  </div>
                  <h3 className="font-display text-lg font-bold text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {step.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Plateformes */}
      <section className="px-6 pb-16 lg:px-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="max-w-4xl"
        >
          <motion.h2 variants={fadeIn} className="font-display text-2xl font-bold text-white mb-6">
            Plateformes supportees
          </motion.h2>

          <motion.div variants={fadeIn} className="flex flex-wrap gap-3">
            {platforms.map((p) => (
              <div
                key={p.name}
                className="glass-card px-5 py-3 flex items-center gap-2"
              >
                <CheckCircle className={`w-4 h-4 ${p.color}`} />
                <span className="text-white font-medium">{p.name}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Conformite */}
      <section className="px-6 pb-16 lg:px-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="max-w-4xl"
        >
          <motion.h2 variants={fadeIn} className="font-display text-2xl font-bold text-white mb-6">
            <span className="text-gradient">Conformite reglementaire</span>
          </motion.h2>

          <div className="grid gap-4 md:grid-cols-2">
            <motion.div variants={fadeIn} className="glass-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <Shield className="w-5 h-5 text-blue-400" />
                <h3 className="font-display font-bold text-white">RGPD</h3>
              </div>
              <p className="text-sm text-gray-400">
                <strong className="text-white">Article 32</strong> — Mesures
                techniques et organisationnelles appropriees pour garantir la
                securite des donnees personnelles.
              </p>
            </motion.div>

            <motion.div variants={fadeIn} className="glass-card p-6">
              <div className="flex items-center gap-3 mb-3">
                <Lock className="w-5 h-5 text-purple-400" />
                <h3 className="font-display font-bold text-white">NIS2</h3>
              </div>
              <p className="text-sm text-gray-400">
                <strong className="text-white">Article 21.2.h</strong> —
                Politiques et procedures relatives a l&apos;utilisation de la
                cryptographie et du chiffrement pour la protection des donnees.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Chiffres cles */}
      <section className="px-6 pb-16 lg:px-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="max-w-4xl"
        >
          <motion.h2 variants={fadeIn} className="font-display text-2xl font-bold text-white mb-8">
            Chiffres cles
          </motion.h2>

          <div className="grid gap-6 md:grid-cols-3">
            {stats.map((stat) => (
              <motion.div key={stat.value} variants={fadeIn} className="glass-card p-6 text-center">
                <div className={`text-4xl font-display font-bold ${stat.color} mb-2`}>
                  {stat.value}
                </div>
                <p className="text-sm text-gray-300 mb-2">{stat.label}</p>
                {stat.source && (
                  <p className="text-xs text-gray-500">{stat.source}</p>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-20 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl"
        >
          <div className="glass-card p-8 bg-gradient-to-br from-purple-500/5 to-cyber-500/5">
            <div className="text-center">
              <h3 className="font-display text-2xl font-bold text-white mb-3">
                Protegez vos donnees des maintenant
              </h3>
              <p className="text-gray-400 mb-6 max-w-lg mx-auto">
                Ne laissez plus vos donnees sensibles fuiter vers les outils
                IA. Installez CyberSensei DLP et reprenez le controle.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyber-500 to-cyber-600 text-navy-950 font-bold hover:from-cyber-400 hover:to-cyber-500 transition-all duration-200 text-lg"
              >
                <Brain className="w-5 h-5" />
                Protegez vos donnees des maintenant
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
