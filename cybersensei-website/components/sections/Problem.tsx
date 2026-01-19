"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { AlertTriangle, TrendingUp, Users, Target } from "lucide-react";

const stats = [
  {
    icon: AlertTriangle,
    value: "91%",
    label: "des cyberattaques",
    description: "commencent par un email de phishing (Verizon DBIR 2023)",
  },
  {
    icon: TrendingUp,
    value: "+38%",
    label: "d'augmentation",
    description: "des cyberattaques en France en 2023 (ANSSI)",
  },
  {
    icon: Users,
    value: "68%",
    label: "des failles",
    description: "sont dues à une erreur humaine (IBM 2023)",
  },
  {
    icon: Target,
    value: "50k€",
    label: "coût moyen",
    description: "d'une cyberattaque pour une PME française",
  },
];

export function Problem() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900/50 to-navy-950" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Le risque est réel</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6"
          >
            Le maillon faible de votre sécurité ?
            <br />
            <span className="text-gradient">Le facteur humain.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-gray-400 max-w-2xl mx-auto"
          >
            Phishing, ingénierie sociale, faux emails du patron... Les
            cyberattaques ciblent d&apos;abord vos collaborateurs. Sans
            formation adaptée, votre entreprise reste vulnérable.
          </motion.p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              className="glass-card p-6 hover-lift group"
            >
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4 group-hover:bg-red-500/20 transition-colors">
                <stat.icon className="w-6 h-6 text-red-400" />
              </div>
              <div className="text-3xl font-display font-bold text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-gray-300 mb-2">
                {stat.label}
              </div>
              <p className="text-sm text-gray-500">{stat.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Bottom Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-16 text-center"
        >
          <p className="text-xl text-gray-300">
            La bonne nouvelle ?{" "}
            <span className="text-cyber-400 font-semibold">
              Une formation adaptée réduit le risque de 70%
            </span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}

