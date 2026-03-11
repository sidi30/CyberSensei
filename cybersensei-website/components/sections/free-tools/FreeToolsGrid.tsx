"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Shield,
  Fish,
  Scale,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const tools = [
  {
    id: "diagnostic-m365",
    icon: Shield,
    title: "Diagnostic Microsoft 365",
    subtitle: "Audit de sécurité automatisé",
    description:
      "Connectez votre tenant M365 et obtenez un score de sécurité instantané. 10 contrôles couvrant MFA, rôles admin, emails, partage, OAuth et plus.",
    features: [
      "Score de sécurité A-F",
      "10 catégories analysées",
      "Top 3 vulnérabilités critiques",
      "Recommandations de remédiation",
    ],
    stats: { label: "contrôles de sécurité", value: "10" },
    duration: "5 min",
    href: "/outils-gratuits/diagnostic-m365",
    highlight: true,
    badge: "Le plus populaire",
  },
  {
    id: "test-phishing",
    icon: Fish,
    title: "Test de Phishing",
    subtitle: "Simulation d'attaque réelle",
    description:
      "Envoyez un email de phishing simulé à votre équipe et mesurez le taux de clic. Découvrez combien de vos employés tomberaient dans le piège.",
    features: [
      "Jusqu'à 25 employés",
      "6 templates réalistes",
      "Taux de clic mesuré",
      "Score de risque par équipe",
    ],
    stats: { label: "employés testés", value: "25" },
    duration: "3 min",
    href: "/outils-gratuits/test-phishing",
    highlight: false,
    badge: null,
  },
  {
    id: "score-nis2",
    icon: Scale,
    title: "Score NIS2",
    subtitle: "Conformité réglementaire",
    description:
      "Évaluez votre niveau de conformité à la directive NIS2 (échéance octobre 2026). 20 questions couvrant les 10 mesures obligatoires de l'Article 21.",
    features: [
      "20 questions ciblées",
      "10 domaines NIS2 couverts",
      "Score de maturité par domaine",
      "Plan d'action prioritaire",
    ],
    stats: { label: "mesures NIS2 évaluées", value: "10" },
    duration: "5 min",
    href: "/outils-gratuits/score-nis2",
    highlight: false,
    badge: "Échéance oct. 2026",
  },
];

export function FreeToolsGrid() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900/30 to-navy-950" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="font-display text-3xl md:text-4xl font-bold text-white mb-4"
          >
            Choisissez votre <span className="text-gradient">diagnostic</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-gray-400"
          >
            Chaque outil est indépendant. Lancez celui qui correspond à votre
            besoin prioritaire.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.15 }}
              className={`relative ${tool.highlight ? "lg:-mt-4 lg:mb-4" : ""}`}
            >
              {tool.badge && (
                <div
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-semibold z-10 ${
                    tool.highlight
                      ? "bg-gradient-to-r from-cyber-500 to-cyber-600 text-navy-950"
                      : "bg-amber-500/20 border border-amber-500/30 text-amber-400"
                  }`}
                >
                  {tool.badge}
                </div>
              )}

              <div
                className={`glass-card p-8 h-full flex flex-col hover-lift ${
                  tool.highlight
                    ? "border-cyber-500/50 glow"
                    : "border-white/10"
                }`}
              >
                {/* Icon & Title */}
                <div className="mb-6">
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
                      tool.highlight ? "bg-cyber-500/20" : "bg-white/5"
                    }`}
                  >
                    <tool.icon
                      className={`w-7 h-7 ${
                        tool.highlight ? "text-cyber-400" : "text-gray-400"
                      }`}
                    />
                  </div>
                  <h3 className="font-display text-xl font-bold text-white mb-1">
                    {tool.title}
                  </h3>
                  <p className="text-sm text-gray-400">{tool.subtitle}</p>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-300 mb-6 leading-relaxed">
                  {tool.description}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5">
                    <AlertTriangle className="w-4 h-4 text-cyber-400" />
                    <span className="text-sm text-gray-300">
                      <span className="font-bold text-white">
                        {tool.stats.value}
                      </span>{" "}
                      {tool.stats.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5">
                    <Clock className="w-4 h-4 text-cyber-400" />
                    <span className="text-sm text-gray-300">
                      {tool.duration}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-2.5 mb-8 flex-grow">
                  {tool.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-cyber-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link href={tool.href} className="w-full">
                  <Button
                    variant={tool.highlight ? "default" : "outline"}
                    size="lg"
                    className="w-full group"
                  >
                    Lancer le diagnostic
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
