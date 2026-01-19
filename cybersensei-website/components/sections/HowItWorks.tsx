"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  MessageSquare,
  Brain,
  Target,
  BarChart3,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: MessageSquare,
    title: "CyberSensei dans Teams",
    description:
      "Un coach IA accessible directement dans Microsoft Teams. Pas d'application supplémentaire, pas de connexion compliquée. Vos équipes apprennent là où elles travaillent.",
    color: "cyber",
  },
  {
    number: "02",
    icon: Brain,
    title: "5 min de micro-exercices",
    description:
      "Chaque jour, des exercices courts et adaptés au niveau de chacun. QCM, mises en situation, exemples concrets. L'apprentissage se fait naturellement, sans surcharge.",
    color: "cyber",
  },
  {
    number: "03",
    icon: Target,
    title: "Simulations de phishing",
    description:
      "Des campagnes de phishing simulées (emails, liens, pages) pour tester les réflexes de vos équipes. Formation pratique, pas punitive. On apprend de ses erreurs.",
    color: "cyber",
  },
  {
    number: "04",
    icon: BarChart3,
    title: "Suivi manager",
    description:
      "Un tableau de bord pour visualiser la progression, le niveau de risque et les résultats des campagnes. Identifiez les points d'amélioration sans stigmatiser.",
    color: "cyber",
  },
];

export function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="fonctionnement"
      ref={ref}
      className="py-24 lg:py-32 relative overflow-hidden"
    >
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyber-500/10 border border-cyber-500/20 text-cyber-400 text-sm mb-6"
          >
            <Brain className="w-4 h-4" />
            <span>Simple et efficace</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6"
          >
            Comment ça marche ?
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-gray-400"
          >
            Une approche progressive et bienveillante pour transformer vos
            collaborateurs en première ligne de défense.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              className="relative group"
            >
              <div className="glass-card p-8 h-full hover-lift">
                {/* Step Number */}
                <div className="absolute -top-3 -left-3 w-12 h-12 rounded-xl bg-gradient-to-br from-cyber-400 to-cyber-600 flex items-center justify-center font-display font-bold text-navy-950">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-cyber-500/10 flex items-center justify-center mb-6 ml-8 group-hover:bg-cyber-500/20 transition-colors">
                  <step.icon className="w-7 h-7 text-cyber-400" />
                </div>

                {/* Content */}
                <h3 className="font-display text-xl font-bold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {/* Arrow (except last) */}
              {index < steps.length - 1 && index % 2 === 0 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <ArrowRight className="w-8 h-8 text-cyber-500/50" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

