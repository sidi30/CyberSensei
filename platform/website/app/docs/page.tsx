"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Shield,
  Brain,
  GraduationCap,
  Monitor,
  ClipboardCheck,
  Server,
  ArrowRight,
  BookOpen,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const sections = [
  {
    href: "/docs/nis2",
    icon: Shield,
    title: "Comprendre NIS2",
    description:
      "Tout savoir sur la directive europeenne NIS2 : qui est concerne, les 10 mesures obligatoires, les sanctions et comment CyberSensei vous accompagne.",
    color: "from-blue-500/20 to-blue-600/10",
    border: "border-blue-500/20",
    iconColor: "text-blue-400",
    tag: "Reglementation",
  },
  {
    href: "/docs/dlp-ia",
    icon: Brain,
    title: "Protection DLP IA",
    description:
      "Decouvrez comment notre extension Chrome empeche les fuites de donnees sensibles vers ChatGPT, Claude, Gemini et les autres outils IA.",
    color: "from-purple-500/20 to-purple-600/10",
    border: "border-purple-500/20",
    iconColor: "text-purple-400",
    tag: "Produit",
  },
  {
    href: "/docs/formation",
    icon: GraduationCap,
    title: "Formation Cybersecurite",
    description:
      "Micro-learning quotidien gamifie : quiz, XP, badges et classements pour former vos equipes a la cybersecurite sans les ennuyer.",
    color: "from-emerald-500/20 to-emerald-600/10",
    border: "border-emerald-500/20",
    iconColor: "text-emerald-400",
    tag: "Produit",
  },
  {
    href: "/docs/soc-light",
    icon: Monitor,
    title: "SOC Light M365",
    description:
      "Audit automatise de votre Microsoft 365 : MFA, admins, forwarding, OAuth, mots de passe. Score A-F et recommandations actionnables.",
    color: "from-amber-500/20 to-amber-600/10",
    border: "border-amber-500/20",
    iconColor: "text-amber-400",
    tag: "Produit",
  },
  {
    href: "/docs/diagnostic-nis2",
    icon: ClipboardCheck,
    title: "Diagnostic NIS2",
    description:
      "Evaluez votre conformite NIS2 en 15 minutes : 25 questions, scoring par domaine et plan d'action personnalise. Gratuit et sans engagement.",
    color: "from-rose-500/20 to-rose-600/10",
    border: "border-rose-500/20",
    iconColor: "text-rose-400",
    tag: "Outil gratuit",
  },
  {
    href: "/docs/architecture",
    icon: Server,
    title: "Architecture technique",
    description:
      "Documentation technique detaillee : micro-services, APIs, stack technologique, schemas d'architecture et guide de deploiement.",
    color: "from-cyan-500/20 to-cyan-600/10",
    border: "border-cyan-500/20",
    iconColor: "text-cyan-400",
    tag: "Technique",
  },
];

export default function DocsOverviewPage() {
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
            <span className="text-gray-300">Documentation</span>
          </nav>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <motion.div variants={fadeIn} className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-cyber-500/10 border border-cyber-500/20">
                <BookOpen className="w-5 h-5 text-cyber-400" />
              </div>
              <span className="text-sm font-semibold text-cyber-400 uppercase tracking-wider">
                Documentation
              </span>
            </motion.div>

            <motion.h1
              variants={fadeIn}
              className="font-display text-4xl md:text-5xl font-bold text-white mb-4"
            >
              Centre de{" "}
              <span className="text-gradient">documentation</span>
            </motion.h1>

            <motion.p
              variants={fadeIn}
              className="text-lg text-gray-400 max-w-2xl leading-relaxed"
            >
              Explorez nos guides produits, comprenez la reglementation NIS2 et
              decouvrez comment CyberSensei protege votre organisation contre
              les menaces cyber.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Cards grid */}
      <section className="px-6 pb-20 lg:px-12">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="grid gap-6 md:grid-cols-2 max-w-5xl"
        >
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <motion.div key={section.href} variants={fadeIn}>
                <Link
                  href={section.href}
                  className={`
                    group block glass-card p-6 h-full
                    hover:border-cyber-500/30 transition-all duration-300
                    hover:shadow-lg hover:shadow-cyber-500/5
                  `}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-br ${section.color} border ${section.border}`}
                    >
                      <Icon className={`w-6 h-6 ${section.iconColor}`} />
                    </div>
                    <span className="text-xs font-medium text-gray-500 bg-white/5 px-2.5 py-1 rounded-full">
                      {section.tag}
                    </span>
                  </div>

                  <h3 className="font-display text-xl font-bold text-white mb-2 group-hover:text-cyber-400 transition-colors">
                    {section.title}
                  </h3>

                  <p className="text-sm text-gray-400 leading-relaxed mb-4">
                    {section.description}
                  </p>

                  <div className="flex items-center gap-2 text-sm font-medium text-cyber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Lire la documentation</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-20 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-8 max-w-5xl"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-cyber-500/10 border border-cyber-500/20">
                <Sparkles className="w-6 h-6 text-cyber-400" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-white mb-1">
                  Pret a securiser votre organisation ?
                </h3>
                <p className="text-gray-400">
                  Commencez par un diagnostic NIS2 gratuit pour evaluer votre
                  posture de securite.
                </p>
              </div>
            </div>
            <Link
              href="/outils-gratuits/score-nis2"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyber-500 to-cyber-600 text-navy-950 font-semibold hover:from-cyber-400 hover:to-cyber-500 transition-all duration-200 whitespace-nowrap"
            >
              <ClipboardCheck className="w-4 h-4" />
              Diagnostic gratuit
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
