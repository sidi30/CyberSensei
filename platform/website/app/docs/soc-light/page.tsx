"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Monitor,
  ChevronRight,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Shield,
  Lock,
  Users,
  Mail,
  Settings,
  Key,
  Eye,
  FileText,
  BarChart3,
  Zap,
  Activity,
  Globe,
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

const categories = [
  { num: 1, name: "MFA (Multi-Factor Authentication)", icon: Lock, color: "text-blue-400" },
  { num: 2, name: "Roles administrateurs", icon: Users, color: "text-purple-400" },
  { num: 3, name: "Regles de forwarding email", icon: Mail, color: "text-red-400" },
  { num: 4, name: "Partages de fichiers", icon: FileText, color: "text-amber-400" },
  { num: 5, name: "Securite email (SPF/DKIM/DMARC)", icon: Shield, color: "text-emerald-400" },
  { num: 6, name: "Applications OAuth tierces", icon: Globe, color: "text-cyan-400" },
  { num: 7, name: "Politique de mots de passe", icon: Key, color: "text-orange-400" },
  { num: 8, name: "Conditional Access", icon: Settings, color: "text-rose-400" },
  { num: 9, name: "Configuration des boites mail", icon: Mail, color: "text-indigo-400" },
  { num: 10, name: "Activite de connexion", icon: Activity, color: "text-teal-400" },
];

const scores = [
  { grade: "A", label: "Excellent", color: "text-emerald-400", bg: "bg-emerald-500/10" },
  { grade: "B", label: "Bon", color: "text-blue-400", bg: "bg-blue-500/10" },
  { grade: "C", label: "Moyen", color: "text-amber-400", bg: "bg-amber-500/10" },
  { grade: "D", label: "Faible", color: "text-orange-400", bg: "bg-orange-500/10" },
  { grade: "F", label: "Critique", color: "text-red-400", bg: "bg-red-500/10" },
];

const nis2Articles = [
  { article: "Art. 21.2.a", label: "Analyse de risques", icon: BarChart3 },
  { article: "Art. 21.2.b", label: "Gestion des incidents", icon: AlertTriangle },
  { article: "Art. 21.2.d", label: "Supply chain (OAuth apps)", icon: Globe },
  { article: "Art. 21.2.f", label: "Gestion des vulnerabilites", icon: Eye },
  { article: "Art. 21.2.i", label: "Controle d'acces", icon: Lock },
  { article: "Art. 21.2.j", label: "Authentification securisee", icon: Key },
];

const reportFeatures = [
  "Score global A-F",
  "Scores detailles par categorie",
  "Rapport PDF professionnel",
  "Historique d'evolution",
  "Alertes automatiques (nouveau admin, MFA desactive...)",
  "Recommandations actionnables en francais",
];

export default function SocLightPage() {
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
            <span className="text-gray-300">SOC Light M365</span>
          </nav>

          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeIn} className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <Monitor className="w-5 h-5 text-amber-400" />
              </div>
              <span className="text-sm font-semibold text-amber-400 uppercase tracking-wider">
                Audit M365
              </span>
            </motion.div>

            <motion.h1
              variants={fadeIn}
              className="font-display text-4xl md:text-5xl font-bold text-white mb-4"
            >
              <span className="text-gradient">SOC Light</span> pour Microsoft 365
            </motion.h1>

            <motion.p variants={fadeIn} className="text-lg text-gray-400 max-w-2xl leading-relaxed">
              Audit automatise de votre environnement M365 en 10 categories,
              avec un score simple (A a F) et des recommandations actionnables
              en francais.
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
                  Votre tenant Microsoft 365 est une{" "}
                  <strong className="text-white">mine d&apos;or pour les attaquants</strong>.
                  MFA desactive, admins sans protection, regles de forwarding
                  email cachees, apps OAuth douteuses.
                </p>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Vous ne le savez pas parce que{" "}
              <strong className="text-white">
                Microsoft Secure Score est incomprehensible
              </strong>
              . Des dizaines de metriques techniques, en anglais, sans
              priorisation claire. Resultat : les failles restent ouvertes
              pendant des mois.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* 10 categories */}
      <section className="px-6 pb-16 lg:px-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="max-w-4xl"
        >
          <motion.h2 variants={fadeIn} className="font-display text-2xl font-bold text-white mb-2">
            <span className="text-gradient">10 categories auditees</span>
          </motion.h2>
          <motion.p variants={fadeIn} className="text-gray-400 mb-8">
            Un audit complet de votre environnement Microsoft 365.
          </motion.p>

          <div className="grid gap-3 md:grid-cols-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <motion.div
                  key={cat.num}
                  variants={fadeIn}
                  className="glass-card p-4 flex items-center gap-4 group hover:border-cyber-500/30 transition-all"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-gray-400 font-display font-bold text-sm flex-shrink-0">
                    {cat.num}
                  </div>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Icon className={`w-4 h-4 ${cat.color} flex-shrink-0`} />
                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                      {cat.name}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Scores */}
      <section className="px-6 pb-16 lg:px-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="max-w-4xl"
        >
          <motion.h2 variants={fadeIn} className="font-display text-2xl font-bold text-white mb-6">
            Scores et rapports
          </motion.h2>

          <motion.div variants={fadeIn} className="glass-card p-8 mb-6">
            <div className="flex flex-wrap gap-4 mb-8 justify-center">
              {scores.map((s) => (
                <div key={s.grade} className={`flex items-center gap-3 px-5 py-3 rounded-xl ${s.bg} border border-white/10`}>
                  <span className={`text-2xl font-display font-bold ${s.color}`}>
                    {s.grade}
                  </span>
                  <span className="text-sm text-gray-300">{s.label}</span>
                </div>
              ))}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {reportFeatures.map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-cyber-400 flex-shrink-0" />
                  {f}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Conformite NIS2 */}
      <section className="px-6 pb-16 lg:px-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="max-w-4xl"
        >
          <motion.h2 variants={fadeIn} className="font-display text-2xl font-bold text-white mb-6">
            <span className="text-gradient">Conformite NIS2</span>
          </motion.h2>

          <div className="grid gap-3 md:grid-cols-2">
            {nis2Articles.map((a) => {
              const Icon = a.icon;
              return (
                <motion.div
                  key={a.article}
                  variants={fadeIn}
                  className="glass-card p-4 flex items-center gap-4"
                >
                  <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <Icon className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <span className="text-xs font-mono text-cyber-400 block">
                      {a.article}
                    </span>
                    <span className="text-sm text-gray-300">{a.label}</span>
                  </div>
                </motion.div>
              );
            })}
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
          <div className="glass-card p-8 bg-gradient-to-br from-amber-500/5 to-cyber-500/5">
            <div className="text-center">
              <h3 className="font-display text-2xl font-bold text-white mb-3">
                Auditez votre M365 gratuitement
              </h3>
              <p className="text-gray-400 mb-6 max-w-lg mx-auto">
                Connectez votre tenant en lecture seule et recevez votre score
                de securite en quelques minutes. Aucune modification
                apportee a votre environnement.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyber-500 to-cyber-600 text-navy-950 font-bold hover:from-cyber-400 hover:to-cyber-500 transition-all duration-200 text-lg"
              >
                <Monitor className="w-5 h-5" />
                Auditez votre M365 gratuitement
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
