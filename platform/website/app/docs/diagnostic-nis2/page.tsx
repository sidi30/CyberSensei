"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  ClipboardCheck,
  ChevronRight,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Shield,
  Target,
  FileText,
  BarChart3,
  Clock,
  Zap,
  Users,
  Lock,
  Settings,
  Eye,
  Server,
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
    title: "Repondez a 25 questions",
    desc: "Un questionnaire structure couvrant les 10 domaines NIS2. Chaque question est claire et contextualisee. Duree : environ 15 minutes.",
    icon: ClipboardCheck,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    num: 2,
    title: "Recevez votre score par domaine",
    desc: "Un scoring detaille pour chaque domaine : gouvernance, gestion des risques, continuite, supply chain, incidents, cryptographie, RH, controle d'acces, securite physique, audit.",
    icon: BarChart3,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
  {
    num: 3,
    title: "Obtenez un plan d'action priorise",
    desc: "Des recommandations article par article, priorisees par impact et facilite de mise en oeuvre. Un plan d'action concret pour avancer vers la conformite.",
    icon: Target,
    color: "text-cyber-400",
    bg: "bg-cyber-500/10",
    border: "border-cyber-500/20",
  },
];

const domaines = [
  { name: "Gouvernance", icon: Shield, color: "text-blue-400" },
  { name: "Gestion des risques", icon: Target, color: "text-purple-400" },
  { name: "Continuite d'activite", icon: Settings, color: "text-emerald-400" },
  { name: "Supply chain", icon: Server, color: "text-cyan-400" },
  { name: "Gestion des incidents", icon: AlertTriangle, color: "text-red-400" },
  { name: "Cryptographie", icon: Lock, color: "text-amber-400" },
  { name: "Ressources humaines", icon: Users, color: "text-rose-400" },
  { name: "Controle d'acces", icon: Lock, color: "text-indigo-400" },
  { name: "Securite physique", icon: Shield, color: "text-orange-400" },
  { name: "Audit et amelioration", icon: Eye, color: "text-teal-400" },
];

const articles = [
  "Art. 20 — Gouvernance de la cybersecurite",
  "Art. 21.2.a — Analyse de risques et PSSI",
  "Art. 21.2.b — Gestion des incidents",
  "Art. 21.2.c — Continuite d'activite (PCA/PRA)",
  "Art. 21.2.d — Securite de la supply chain",
  "Art. 21.2.e — Securite reseau et SI",
  "Art. 21.2.f — Gestion des vulnerabilites",
  "Art. 21.2.g — Cyber-hygiene et formation",
  "Art. 21.2.h — Cryptographie et chiffrement",
  "Art. 21.2.i — Controle d'acces et MFA",
  "Art. 21.2.j — Authentification securisee",
];

export default function DiagnosticNis2Page() {
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
            <span className="text-gray-300">Diagnostic NIS2</span>
          </nav>

          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeIn} className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
                <ClipboardCheck className="w-5 h-5 text-rose-400" />
              </div>
              <span className="text-sm font-semibold text-rose-400 uppercase tracking-wider">
                Outil gratuit
              </span>
            </motion.div>

            <motion.h1
              variants={fadeIn}
              className="font-display text-4xl md:text-5xl font-bold text-white mb-4"
            >
              Diagnostic{" "}
              <span className="text-gradient">NIS2</span>
            </motion.h1>

            <motion.p variants={fadeIn} className="text-lg text-gray-400 max-w-2xl leading-relaxed">
              Evaluez votre conformite NIS2 en 15 minutes. 25 questions, un
              scoring par domaine et un plan d&apos;action personnalise. Gratuit
              et sans engagement.
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
                  NIS2 est obligatoire mais complexe.{" "}
                  <strong className="text-white">
                    10 domaines, 25+ exigences
                  </strong>
                  . La plupart des PME ne savent meme pas si elles sont
                  concernees, et encore moins par ou commencer.
                </p>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Les cabinets de conseil facturent des milliers d&apos;euros pour un
              audit initial. Pourtant, la premiere etape devrait etre simple :
              comprendre ou vous en etes et ce que vous devez faire en
              priorite.
            </p>
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
            <span className="text-gradient">Comment ca marche</span>
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

      {/* Domaines evalues */}
      <section className="px-6 pb-16 lg:px-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="max-w-4xl"
        >
          <motion.h2 variants={fadeIn} className="font-display text-2xl font-bold text-white mb-6">
            10 domaines evalues
          </motion.h2>

          <motion.div variants={fadeIn} className="flex flex-wrap gap-3">
            {domaines.map((d) => {
              const Icon = d.icon;
              return (
                <div
                  key={d.name}
                  className="glass-card px-5 py-3 flex items-center gap-3"
                >
                  <Icon className={`w-4 h-4 ${d.color}`} />
                  <span className="text-white font-medium text-sm">{d.name}</span>
                </div>
              );
            })}
          </motion.div>
        </motion.div>
      </section>

      {/* Gratuit */}
      <section className="px-6 pb-16 lg:px-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="max-w-4xl"
        >
          <motion.div variants={fadeIn} className="glass-card p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-xl bg-cyber-500/10 border border-cyber-500/20">
                <Zap className="w-6 h-6 text-cyber-400" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-white mb-3">
                  Gratuit et sans engagement
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  Le diagnostic de base est{" "}
                  <strong className="text-cyber-400">
                    entierement gratuit
                  </strong>
                  . Aucune carte bancaire requise, aucun engagement. C&apos;est un
                  premier pas concret vers la conformite NIS2.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Clock className="w-4 h-4 text-cyber-400" />
                <span>15 minutes</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <ClipboardCheck className="w-4 h-4 text-cyber-400" />
                <span>25 questions</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Target className="w-4 h-4 text-cyber-400" />
                <span>Plan d&apos;action priorise</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Articles NIS2 mappes */}
      <section className="px-6 pb-16 lg:px-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="max-w-4xl"
        >
          <motion.h2 variants={fadeIn} className="font-display text-2xl font-bold text-white mb-6">
            <span className="text-gradient">Articles NIS2 mappes</span>
          </motion.h2>
          <motion.p variants={fadeIn} className="text-gray-400 mb-6">
            Chaque question du diagnostic reference l&apos;article NIS2 exact
            qu&apos;elle evalue.
          </motion.p>

          <motion.div variants={fadeIn} className="glass-card p-6">
            <div className="grid gap-2 md:grid-cols-2">
              {articles.map((a) => (
                <div key={a} className="flex items-center gap-2 text-sm text-gray-300 py-1">
                  <CheckCircle className="w-4 h-4 text-cyber-400 flex-shrink-0" />
                  <span className="font-mono text-xs text-cyber-400 w-24 flex-shrink-0">
                    {a.split(" — ")[0]}
                  </span>
                  <span>{a.split(" — ")[1]}</span>
                </div>
              ))}
            </div>
          </motion.div>
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
          <div className="glass-card p-8 bg-gradient-to-br from-rose-500/5 to-cyber-500/5">
            <div className="text-center">
              <h3 className="font-display text-2xl font-bold text-white mb-3">
                Commencez votre diagnostic gratuit
              </h3>
              <p className="text-gray-400 mb-6 max-w-lg mx-auto">
                15 minutes pour savoir exactement ou vous en etes avec NIS2.
                Recevez votre score et un plan d&apos;action personnalise.
              </p>
              <Link
                href="/outils-gratuits/score-nis2"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyber-500 to-cyber-600 text-navy-950 font-bold hover:from-cyber-400 hover:to-cyber-500 transition-all duration-200 text-lg"
              >
                <ClipboardCheck className="w-5 h-5" />
                Commencez votre diagnostic gratuit
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
