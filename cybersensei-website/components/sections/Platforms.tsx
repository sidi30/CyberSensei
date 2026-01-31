"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { MessageSquare, Mail, Smartphone, Globe, Check } from "lucide-react";

const platforms = [
  {
    name: "Microsoft Teams",
    icon: MessageSquare,
    description: "Intégration native, notifications intelligentes",
    status: "Disponible",
    color: "cyber",
  },
  {
    name: "Slack",
    icon: MessageSquare,
    description: "Bot conversationnel, commandes slash",
    status: "Disponible",
    color: "cyber",
  },
  {
    name: "Email",
    icon: Mail,
    description: "Exercices quotidiens par email",
    status: "Disponible",
    color: "cyber",
  },
  {
    name: "Application mobile",
    icon: Smartphone,
    description: "iOS & Android, notifications push",
    status: "Bientôt",
    color: "gray",
  },
  {
    name: "Portail web",
    icon: Globe,
    description: "Accès navigateur, responsive",
    status: "Disponible",
    color: "cyber",
  },
];

export function Platforms() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 lg:py-32 relative overflow-hidden">
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
            <MessageSquare className="w-4 h-4" />
            <span>Multi-plateformes</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6"
          >
            Là où vos équipes
            <br />
            <span className="text-gradient">travaillent déjà</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-gray-400"
          >
            CyberSensei s&apos;intègre à vos outils existants. Pas besoin de
            changer vos habitudes.
          </motion.p>
        </div>

        {/* Platforms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {platforms.map((platform, index) => (
            <motion.div
              key={platform.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              className="glass-card p-6 hover-lift group"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl ${
                    platform.color === "cyber"
                      ? "bg-cyber-500/10"
                      : "bg-white/5"
                  } flex items-center justify-center group-hover:bg-cyber-500/20 transition-colors`}
                >
                  <platform.icon
                    className={`w-6 h-6 ${
                      platform.color === "cyber"
                        ? "text-cyber-400"
                        : "text-gray-400"
                    }`}
                  />
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    platform.status === "Disponible"
                      ? "bg-green-500/10 text-green-400 border border-green-500/20"
                      : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                  }`}
                >
                  {platform.status}
                </span>
              </div>
              <h3 className="font-semibold text-white mb-2">
                {platform.name}
              </h3>
              <p className="text-sm text-gray-400">{platform.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Bottom Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 text-gray-400">
            <Check className="w-5 h-5 text-cyber-400" />
            <span>
              Votre plateforme n&apos;est pas listée ? Contactez-nous pour une
              intégration personnalisée.
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}


