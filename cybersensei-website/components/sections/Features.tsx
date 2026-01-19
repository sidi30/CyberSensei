"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  GraduationCap,
  Mail,
  Users,
  BarChart3,
  Shield,
  RefreshCw,
  Brain,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: GraduationCap,
    title: "Formation adaptative",
    description:
      "Débutant, intermédiaire, expert : le contenu s'adapte automatiquement au niveau de chaque collaborateur. Progression naturelle garantie.",
  },
  {
    icon: Mail,
    title: "Simulations de phishing",
    description:
      "Emails, liens, pages de connexion factices. Testez les réflexes de vos équipes avec des scénarios réalistes et actualisés.",
  },
  {
    icon: Users,
    title: "Ingénierie sociale",
    description:
      "Sensibilisation aux techniques de manipulation : faux appels, usurpation d'identité, urgence fabriquée. Vos équipes apprennent à les reconnaître.",
  },
  {
    icon: BarChart3,
    title: "Dashboard manager",
    description:
      "Visualisez la progression, le niveau de risque et les résultats des campagnes. Rapports clairs pour piloter votre cybersécurité humaine.",
  },
  {
    icon: Shield,
    title: "Souveraineté & vie privée",
    description:
      "Vos données restent chez vous. Déploiement on-premise avec Docker. Seules les métriques anonymes peuvent être transmises (optionnel).",
  },
  {
    icon: RefreshCw,
    title: "Contenus actualisés",
    description:
      "Nouveaux scénarios, nouvelles menaces. CyberSensei évolue avec le paysage cyber pour garder vos équipes à jour.",
  },
  {
    icon: Brain,
    title: "IA pédagogique",
    description:
      "L'IA adapte le ton, le rythme et la complexité. Pédagogie bienveillante, jamais punitive. On apprend mieux quand on se sent accompagné.",
  },
  {
    icon: Sparkles,
    title: "Gamification légère",
    description:
      "Points, badges, progression. Une touche de jeu pour maintenir l'engagement sans transformer la sécurité en compétition.",
  },
];

export function Features() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="fonctionnalites"
      ref={ref}
      className="py-24 lg:py-32 relative overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900/30 to-navy-950" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyber-500/10 border border-cyber-500/20 text-cyber-400 text-sm mb-6"
          >
            <Sparkles className="w-4 h-4" />
            <span>Fonctionnalités complètes</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6"
          >
            Tout ce qu&apos;il faut pour
            <br />
            <span className="text-gradient">sécuriser le facteur humain</span>
          </motion.h2>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.05 }}
              className="glass-card p-6 hover-lift group"
            >
              <div className="w-12 h-12 rounded-xl bg-cyber-500/10 flex items-center justify-center mb-4 group-hover:bg-cyber-500/20 transition-colors">
                <feature.icon className="w-6 h-6 text-cyber-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

