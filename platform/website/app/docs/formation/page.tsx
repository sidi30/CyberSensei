"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  GraduationCap,
  ChevronRight,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Users,
  Trophy,
  Target,
  Flame,
  BarChart3,
  Star,
  Sparkles,
  Shield,
  Zap,
  Chrome,
  Clock,
  TrendingUp,
  Eye,
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

const themes = [
  { name: "Phishing", icon: AlertTriangle, color: "text-red-400" },
  { name: "Mots de passe", icon: Shield, color: "text-blue-400" },
  { name: "Ransomware", icon: AlertTriangle, color: "text-amber-400" },
  { name: "Ingenierie sociale", icon: Users, color: "text-purple-400" },
  { name: "VPN & Wi-Fi", icon: Shield, color: "text-cyan-400" },
  { name: "RGPD", icon: Shield, color: "text-emerald-400" },
  { name: "Shadow IT", icon: Eye, color: "text-rose-400" },
];

const gamification = [
  {
    title: "Systeme d'XP et niveaux",
    desc: "Chaque quiz complete rapporte des points d'experience. Les employes montent en niveau au fil du temps.",
    icon: TrendingUp,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  {
    title: "Badges de competence",
    desc: "Des badges deblocables recompensent la maitrise de chaque thematique : phishing, mots de passe, RGPD...",
    icon: Star,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  {
    title: "Streaks quotidiens",
    desc: "Les series de jours consecutifs motivent la regularite. Un streak de 30 jours debloque des badges speciaux.",
    icon: Flame,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
  },
  {
    title: "Classement entre collegues",
    desc: "Un leaderboard par equipe stimule la competition saine et l'entraide entre collaborateurs.",
    icon: Trophy,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
  {
    title: "Recommandations IA",
    desc: "L'IA analyse les points faibles de chaque employe et propose des quiz cibles pour combler les lacunes.",
    icon: Sparkles,
    color: "text-cyber-400",
    bg: "bg-cyber-500/10",
    border: "border-cyber-500/20",
  },
];

const dashboardFeatures = [
  "Vue d'ensemble de l'equipe",
  "Taux de completion par employe",
  "Scores moyens par thematique",
  "Identification des profils a risque",
  "Export de rapports pour les audits",
  "Suivi de progression dans le temps",
];

export default function FormationPage() {
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
            <span className="text-gray-300">Formation Cybersecurite</span>
          </nav>

          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeIn} className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <GraduationCap className="w-5 h-5 text-emerald-400" />
              </div>
              <span className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">
                Formation
              </span>
            </motion.div>

            <motion.h1
              variants={fadeIn}
              className="font-display text-4xl md:text-5xl font-bold text-white mb-4"
            >
              Formation{" "}
              <span className="text-gradient">cybersecurite</span> gamifiee
            </motion.h1>

            <motion.p variants={fadeIn} className="text-lg text-gray-400 max-w-2xl leading-relaxed">
              Micro-learning quotidien de 3 minutes via une extension Chrome.
              Vos equipes apprennent la cybersecurite en jouant, pas en
              souffrant.
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
                  <strong className="text-red-400">95% des cyberattaques</strong>{" "}
                  exploitent l&apos;erreur humaine. Pourtant, les formations
                  annuelles PowerPoint ne fonctionnent pas — les employes{" "}
                  <strong className="text-white">
                    oublient en 2 semaines
                  </strong>
                  .
                </p>
              </div>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Les formations traditionnelles sont ennuyeuses, trop longues et
              trop espacees. Le resultat : des employes qui cliquent toujours
              sur les liens de phishing, qui reutilisent les memes mots de
              passe et qui ignorent les alertes de securite.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Notre approche */}
      <section className="px-6 pb-16 lg:px-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="max-w-4xl"
        >
          <motion.h2 variants={fadeIn} className="font-display text-2xl font-bold text-white mb-6">
            <span className="text-gradient">Notre approche</span>
          </motion.h2>

          <motion.div variants={fadeIn} className="glass-card p-8">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-cyber-500/10 border border-cyber-500/20 mb-4">
                  <Clock className="w-7 h-7 text-cyber-400" />
                </div>
                <h3 className="font-display text-lg font-bold text-white mb-2">
                  3 minutes par jour
                </h3>
                <p className="text-sm text-gray-400">
                  Micro-learning quotidien integre dans la routine de travail.
                  Pas de sessions de 2 heures.
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 mb-4">
                  <Chrome className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="font-display text-lg font-bold text-white mb-2">
                  Extension Chrome
                </h3>
                <p className="text-sm text-gray-400">
                  Apprentissage contextuel pendant que l&apos;employe navigue.
                  Aucun outil supplementaire a installer.
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 mb-4">
                  <Trophy className="w-7 h-7 text-purple-400" />
                </div>
                <h3 className="font-display text-lg font-bold text-white mb-2">
                  Quiz gamifie
                </h3>
                <p className="text-sm text-gray-400">
                  XP, badges, niveaux et streaks. La cybersecurite devient un
                  jeu, pas une corvee.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Themes couverts */}
      <section className="px-6 pb-16 lg:px-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="max-w-4xl"
        >
          <motion.h2 variants={fadeIn} className="font-display text-2xl font-bold text-white mb-6">
            Themes couverts
          </motion.h2>

          <motion.div variants={fadeIn} className="flex flex-wrap gap-3">
            {themes.map((t) => {
              const Icon = t.icon;
              return (
                <div
                  key={t.name}
                  className="glass-card px-5 py-3 flex items-center gap-3"
                >
                  <Icon className={`w-4 h-4 ${t.color}`} />
                  <span className="text-white font-medium">{t.name}</span>
                </div>
              );
            })}
          </motion.div>
        </motion.div>
      </section>

      {/* Gamification */}
      <section className="px-6 pb-16 lg:px-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="max-w-4xl"
        >
          <motion.h2 variants={fadeIn} className="font-display text-2xl font-bold text-white mb-8">
            <span className="text-gradient">Gamification</span>
          </motion.h2>

          <div className="grid gap-4 md:grid-cols-2">
            {gamification.map((g) => {
              const Icon = g.icon;
              return (
                <motion.div
                  key={g.title}
                  variants={fadeIn}
                  className={`glass-card p-6 ${g.border}`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${g.bg} border ${g.border}`}>
                      <Icon className={`w-5 h-5 ${g.color}`} />
                    </div>
                    <h3 className="font-display font-bold text-white">
                      {g.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {g.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Dashboard manager */}
      <section className="px-6 pb-16 lg:px-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="max-w-4xl"
        >
          <motion.h2 variants={fadeIn} className="font-display text-2xl font-bold text-white mb-6">
            Dashboard manager
          </motion.h2>

          <motion.div variants={fadeIn} className="glass-card p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <BarChart3 className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-white mb-2">
                  Pilotez la securite de votre equipe
                </h3>
                <p className="text-gray-400">
                  Un tableau de bord complet pour suivre la progression et
                  identifier les profils a risque.
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {dashboardFeatures.map((f) => (
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
          <motion.div variants={fadeIn} className="glass-card p-8 border-blue-500/20">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-white mb-3">
                  Conformite NIS2
                </h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  L&apos;<strong className="text-white">Article 21.2.g</strong> de la
                  directive NIS2 impose la cyber-hygiene et la formation du
                  personnel. CyberSensei apporte la{" "}
                  <strong className="text-cyber-400">
                    preuve documentee de formation continue
                  </strong>{" "}
                  grace a l&apos;historique des quiz, aux scores par employe et aux
                  rapports exportables.
                </p>
                <div className="flex items-center gap-2 text-sm text-cyber-400">
                  <Zap className="w-4 h-4" />
                  <span className="font-medium">
                    Chaque quiz complete est une preuve de conformite pour vos
                    audits.
                  </span>
                </div>
              </div>
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
          <div className="glass-card p-8 bg-gradient-to-br from-emerald-500/5 to-cyber-500/5">
            <div className="text-center">
              <h3 className="font-display text-2xl font-bold text-white mb-3">
                Formez votre equipe en 5 minutes
              </h3>
              <p className="text-gray-400 mb-6 max-w-lg mx-auto">
                Installez l&apos;extension, invitez vos collaborateurs et
                regardez les scores de securite monter. C&apos;est aussi simple
                que ca.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyber-500 to-cyber-600 text-navy-950 font-bold hover:from-cyber-400 hover:to-cyber-500 transition-all duration-200 text-lg"
              >
                <GraduationCap className="w-5 h-5" />
                Formez votre equipe en 5 minutes
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
