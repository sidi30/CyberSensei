"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  Shield,
  Server,
  Lock,
  Eye,
  Check,
  FileCheck,
  Building2,
} from "lucide-react";

const securityPoints = [
  {
    icon: Server,
    title: "Déploiement on-premise",
    description:
      "CyberSensei s'installe sur votre infrastructure. Un simple conteneur Docker, pas de cloud externe obligatoire.",
  },
  {
    icon: Lock,
    title: "Données qui restent chez vous",
    description:
      "Les données d'apprentissage, les résultats, les profils utilisateurs : tout reste dans votre environnement.",
  },
  {
    icon: Eye,
    title: "Télémétrie optionnelle",
    description:
      "Seules les métriques agrégées et anonymes peuvent être partagées, si vous le souhaitez, pour améliorer le produit.",
  },
  {
    icon: FileCheck,
    title: "RGPD-friendly",
    description:
      "Conçu avec la protection des données en tête. Pas de transfert hors UE, pas de traitement non consenti.",
  },
];

export function Security() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900/50 to-navy-950" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyber-500/10 border border-cyber-500/20 text-cyber-400 text-sm mb-6">
              <Shield className="w-4 h-4" />
              <span>Souveraineté & Confidentialité</span>
            </div>

            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
              Vos données restent
              <br />
              <span className="text-gradient">vos données</span>
            </h2>

            <p className="text-lg text-gray-400 mb-8">
              CyberSensei a été conçu dès le départ pour respecter la
              souveraineté de vos données. Pas de dépendance à un cloud
              américain, pas de partage non consenti.
            </p>

            <div className="space-y-4">
              {securityPoints.map((point, index) => (
                <motion.div
                  key={point.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  className="flex gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-cyber-500/10 flex items-center justify-center flex-shrink-0">
                    <point.icon className="w-5 h-5 text-cyber-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">
                      {point.title}
                    </h3>
                    <p className="text-sm text-gray-400">{point.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Visual */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="glass-card p-8 glow">
              {/* Architecture Diagram */}
              <div className="space-y-6">
                {/* Customer Environment */}
                <div className="border-2 border-dashed border-cyber-500/30 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Building2 className="w-5 h-5 text-cyber-400" />
                    <span className="font-semibold text-white">
                      Votre environnement
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-navy-900 rounded-lg p-4 text-center">
                      <Server className="w-8 h-8 text-cyber-400 mx-auto mb-2" />
                      <div className="text-sm text-white">CyberSensei Node</div>
                      <div className="text-xs text-gray-500">Docker</div>
                    </div>
                    <div className="bg-navy-900 rounded-lg p-4 text-center">
                      <Lock className="w-8 h-8 text-cyber-400 mx-auto mb-2" />
                      <div className="text-sm text-white">Base de données</div>
                      <div className="text-xs text-gray-500">PostgreSQL</div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-400">
                    <Check className="w-4 h-4 text-green-400" />
                    <span>Données chiffrées au repos</span>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <div className="w-px h-8 bg-gradient-to-b from-cyber-500/50 to-transparent relative">
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-xs text-gray-500">
                      Métriques anonymes (optionnel)
                    </div>
                  </div>
                </div>

                {/* Central */}
                <div className="border border-white/10 rounded-xl p-4 bg-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-300">
                        CyberSensei Central
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Mises à jour uniquement
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

