"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Shield,
  ChevronRight,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Users,
  Building2,
  Scale,
  FileText,
  Calendar,
  Target,
  Lock,
  GraduationCap,
  Monitor,
  ClipboardCheck,
  Brain,
  Zap,
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

const mesures = [
  { num: 1, label: "Analyse de risques et PSSI", icon: Target },
  { num: 2, label: "Gestion des incidents", icon: AlertTriangle },
  { num: 3, label: "Continuite d'activite (PCA/PRA)", icon: Shield },
  { num: 4, label: "Securite de la chaine d'approvisionnement", icon: Building2 },
  { num: 5, label: "Securite reseau et SI", icon: Lock },
  { num: 6, label: "Gestion des vulnerabilites", icon: FileText },
  { num: 7, label: "Cyber-hygiene et formation", icon: GraduationCap },
  { num: 8, label: "Cryptographie et chiffrement", icon: Lock },
  { num: 9, label: "Controle d'acces et MFA", icon: Users },
  { num: 10, label: "Authentification securisee", icon: CheckCircle },
];

const secteurs = [
  "Energie",
  "Transport",
  "Sante",
  "Numerique",
  "Eau",
  "Administration",
  "Espace",
  "Fabrication",
  "Services postaux",
  "Gestion des dechets",
  "Chimie",
  "Alimentation",
  "Recherche",
];

const mapping = [
  {
    solution: "Extension DLP",
    icon: Brain,
    articles: "Art. 21.2.h",
    desc: "Cryptographie et protection des donnees",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
  },
  {
    solution: "Formation",
    icon: GraduationCap,
    articles: "Art. 21.2.g",
    desc: "Cyber-hygiene et formation du personnel",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  {
    solution: "SOC Light M365",
    icon: Monitor,
    articles: "Art. 21.2.a, b, d, f, i, j",
    desc: "Analyse de risques, incidents, supply chain, vulnerabilites, acces, authentification",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  {
    solution: "Diagnostic NIS2",
    icon: ClipboardCheck,
    articles: "Art. 20 & 21",
    desc: "Evaluation initiale et suivi de conformite",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
  },
];

export default function Nis2Page() {
  return (
    <div className="min-h-screen bg-navy-950">
      {/* Hero */}
      <section className="relative px-6 pt-16 pb-12 lg:px-12">
        <div className="absolute inset-0 bg-cyber-grid bg-grid-size opacity-30" />
        <div className="relative max-w-4xl">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-cyber-400 transition-colors">
              Accueil
            </Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/docs" className="hover:text-cyber-400 transition-colors">
              Documentation
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-300">Comprendre NIS2</span>
          </nav>

          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeIn} className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <Shield className="w-5 h-5 text-blue-400" />
              </div>
              <span className="text-sm font-semibold text-blue-400 uppercase tracking-wider">
                Reglementation
              </span>
            </motion.div>

            <motion.h1
              variants={fadeIn}
              className="font-display text-4xl md:text-5xl font-bold text-white mb-4"
            >
              Comprendre la directive{" "}
              <span className="text-gradient">NIS2</span>
            </motion.h1>

            <motion.p variants={fadeIn} className="text-lg text-gray-400 max-w-2xl leading-relaxed">
              La directive europeenne 2022/2555 va transformer la cybersecurite
              des entreprises francaises. Voici tout ce que vous devez savoir
              pour vous preparer.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Qu'est-ce que NIS2 */}
      <section className="px-6 pb-16 lg:px-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="max-w-4xl"
        >
          <motion.div variants={fadeIn} className="glass-card p-8 mb-8">
            <h2 className="font-display text-2xl font-bold text-white mb-4">
              Qu&apos;est-ce que NIS2 ?
            </h2>
            <div className="space-y-4 text-gray-300 leading-relaxed">
              <p>
                La directive <strong className="text-white">NIS2 (Network and Information Security 2)</strong> est
                la directive europeenne 2022/2555, qui remplace NIS1. Elle a ete
                adoptee par le Parlement europeen en novembre 2022 et doit etre
                transposee en droit national par chaque Etat membre.
              </p>
              <p>
                Son objectif : <strong className="text-cyber-400">renforcer la cybersecurite des entites
                essentielles et importantes</strong> dans l&apos;Union europeenne, en
                imposant des obligations claires en matiere de gestion des
                risques, de notification d&apos;incidents et de gouvernance.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Qui est concerne */}
      <section className="px-6 pb-16 lg:px-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="max-w-4xl"
        >
          <motion.h2 variants={fadeIn} className="font-display text-2xl font-bold text-white mb-6">
            <span className="text-gradient">Qui est concerne ?</span>
          </motion.h2>

          <motion.div variants={fadeIn} className="glass-card p-8 mb-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Users className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-white mb-2">
                  ~15 000 entites en France
                </h3>
                <p className="text-gray-400">
                  Contre seulement 500 avec NIS1. Le perimetre est massivement
                  elargi.
                </p>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-6">
              <p className="text-sm font-semibold text-white mb-3">
                Criteres d&apos;eligibilite :
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-cyber-400 flex-shrink-0" />
                  Toute entreprise de <strong className="text-white">plus de 50 salaries</strong>
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-cyber-400 flex-shrink-0" />
                  Ou un <strong className="text-white">chiffre d&apos;affaires superieur a 10M&euro;</strong>
                </li>
                <li className="flex items-center gap-2 text-gray-300">
                  <CheckCircle className="w-4 h-4 text-cyber-400 flex-shrink-0" />
                  Operant dans l&apos;un des <strong className="text-white">secteurs reglementes</strong>
                </li>
              </ul>
            </div>

            <p className="text-sm font-semibold text-white mb-3">
              Secteurs concernes :
            </p>
            <div className="flex flex-wrap gap-2">
              {secteurs.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm text-blue-300"
                >
                  {s}
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* 10 mesures obligatoires */}
      <section className="px-6 pb-16 lg:px-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="max-w-4xl"
        >
          <motion.h2 variants={fadeIn} className="font-display text-2xl font-bold text-white mb-2">
            Les 10 mesures obligatoires
          </motion.h2>
          <motion.p variants={fadeIn} className="text-gray-400 mb-8">
            Article 21.2 de la directive NIS2
          </motion.p>

          <div className="grid gap-3 md:grid-cols-2">
            {mesures.map((m) => {
              const Icon = m.icon;
              return (
                <motion.div
                  key={m.num}
                  variants={fadeIn}
                  className="glass-card p-4 flex items-center gap-4 group hover:border-cyber-500/30 transition-all"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyber-500/10 border border-cyber-500/20 text-cyber-400 font-display font-bold text-sm flex-shrink-0">
                    {m.num}
                  </div>
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Icon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                      {m.label}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Sanctions */}
      <section className="px-6 pb-16 lg:px-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="max-w-4xl"
        >
          <motion.h2 variants={fadeIn} className="font-display text-2xl font-bold text-white mb-6">
            <span className="text-gradient">Les sanctions</span>
          </motion.h2>

          <div className="grid gap-6 md:grid-cols-2">
            <motion.div variants={fadeIn} className="glass-card p-6 border-red-500/20">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-red-400" />
                <h3 className="font-display text-lg font-bold text-white">
                  Entites essentielles
                </h3>
              </div>
              <div className="text-3xl font-display font-bold text-red-400 mb-2">
                10M&euro;
              </div>
              <p className="text-gray-400 text-sm">
                Jusqu&apos;a <strong className="text-white">10 millions d&apos;euros</strong> ou{" "}
                <strong className="text-white">2% du chiffre d&apos;affaires mondial</strong>,
                le montant le plus eleve etant retenu.
              </p>
            </motion.div>

            <motion.div variants={fadeIn} className="glass-card p-6 border-amber-500/20">
              <div className="flex items-center gap-3 mb-4">
                <Scale className="w-6 h-6 text-amber-400" />
                <h3 className="font-display text-lg font-bold text-white">
                  Entites importantes
                </h3>
              </div>
              <div className="text-3xl font-display font-bold text-amber-400 mb-2">
                7M&euro;
              </div>
              <p className="text-gray-400 text-sm">
                Jusqu&apos;a <strong className="text-white">7 millions d&apos;euros</strong> ou{" "}
                <strong className="text-white">1,4% du chiffre d&apos;affaires mondial</strong>,
                le montant le plus eleve etant retenu.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Comment CyberSensei aide */}
      <section className="px-6 pb-16 lg:px-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="max-w-4xl"
        >
          <motion.h2 variants={fadeIn} className="font-display text-2xl font-bold text-white mb-2">
            Comment CyberSensei vous aide
          </motion.h2>
          <motion.p variants={fadeIn} className="text-gray-400 mb-8">
            CyberSensei couvre <strong className="text-cyber-400">8 des 10 mesures</strong> obligatoires de NIS2.
          </motion.p>

          <div className="grid gap-4 md:grid-cols-2">
            {mapping.map((m) => {
              const Icon = m.icon;
              return (
                <motion.div
                  key={m.solution}
                  variants={fadeIn}
                  className={`glass-card p-6 ${m.border}`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${m.bg} border ${m.border}`}>
                      <Icon className={`w-5 h-5 ${m.color}`} />
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-white">
                        {m.solution}
                      </h3>
                      <span className="text-xs font-mono text-cyber-400">
                        {m.articles}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400">{m.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </section>

      {/* Calendrier */}
      <section className="px-6 pb-16 lg:px-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="max-w-4xl"
        >
          <motion.div variants={fadeIn} className="glass-card p-8">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-cyber-500/10 border border-cyber-500/20">
                <Calendar className="w-6 h-6 text-cyber-400" />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold text-white mb-3">
                  Calendrier
                </h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  La transposition de NIS2 en droit francais est prevue pour
                  2025. Les entreprises concernees doivent{" "}
                  <strong className="text-cyber-400">se preparer des maintenant</strong>{" "}
                  pour ne pas etre prises au depourvu lors de l&apos;entree en
                  vigueur.
                </p>
                <div className="flex items-center gap-2 text-sm text-amber-400">
                  <Zap className="w-4 h-4" />
                  <span className="font-medium">
                    Ne pas attendre la date limite — la mise en conformite prend
                    plusieurs mois.
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
          <div className="glass-card p-8 bg-gradient-to-br from-cyber-500/5 to-blue-500/5">
            <div className="text-center">
              <h3 className="font-display text-2xl font-bold text-white mb-3">
                Faites votre diagnostic NIS2 gratuit
              </h3>
              <p className="text-gray-400 mb-6 max-w-lg mx-auto">
                Evaluez votre niveau de conformite en 15 minutes et obtenez un
                plan d&apos;action personnalise pour chaque article de NIS2.
              </p>
              <Link
                href="/outils-gratuits/score-nis2"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyber-500 to-cyber-600 text-navy-950 font-bold hover:from-cyber-400 hover:to-cyber-500 transition-all duration-200 text-lg"
              >
                <ClipboardCheck className="w-5 h-5" />
                Faites votre diagnostic NIS2 gratuit
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
