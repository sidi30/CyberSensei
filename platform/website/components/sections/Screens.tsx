"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  Shield,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Users,
  AlertTriangle,
  Clock,
  Award,
  ShieldAlert,
  Globe,
} from "lucide-react";

export function Screens() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 lg:py-32 relative overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyber-500/10 border border-cyber-500/20 text-cyber-400 text-sm mb-6"
          >
            <Award className="w-4 h-4" />
            <span>Aperçu produit</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6"
          >
            Une expérience pensée
            <br />
            <span className="text-gradient">pour l&apos;utilisateur</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chat Interface Preview */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="glass-card p-6 h-full">
              <h3 className="font-display text-xl font-bold text-white mb-4">
                Interface collaborateur
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                Un chat naturel dans Teams. Pas de surcharge, juste
                l&apos;essentiel.
              </p>

              {/* Chat Mockup */}
              <div className="bg-navy-950 rounded-xl p-4 space-y-4">
                {/* Bot Message */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-cyber-500/20 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-cyber-400" />
                  </div>
                  <div className="bg-white/5 rounded-2xl rounded-tl-sm p-3 max-w-xs">
                    <p className="text-gray-300 text-sm">
                      Excellent ! 🎉 Bonne réponse. Vérifie toujours
                      l&apos;expéditeur avant de cliquer.
                    </p>
                  </div>
                </div>

                {/* Success Badge */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-cyber-500/20 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-cyber-400" />
                  </div>
                  <div className="bg-cyber-500/10 border border-cyber-500/30 rounded-2xl rounded-tl-sm p-3">
                    <div className="flex items-center gap-2 text-cyber-400 text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>+15 XP • Série de 5 jours 🔥</span>
                    </div>
                  </div>
                </div>

                {/* Next Question */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-cyber-500/20 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-cyber-400" />
                  </div>
                  <div className="bg-white/5 rounded-2xl rounded-tl-sm p-3">
                    <p className="text-gray-300 text-sm mb-2">
                      Question suivante : Un collègue vous demande votre mot de
                      passe par chat...
                    </p>
                    <div className="flex items-center gap-2 text-gray-500 text-xs">
                      <Clock className="w-3 h-3" />
                      <span>~30 secondes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Extension DLP Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            <div className="glass-card p-6 h-full">
              <h3 className="font-display text-xl font-bold text-white mb-4">
                Extension DLP
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                Protection temps reel sur les outils IA.
              </p>

              {/* Extension Mockup */}
              <div className="bg-navy-950 rounded-xl p-4 space-y-4">
                {/* Header */}
                <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                  <ShieldAlert className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm text-white font-medium">CyberSensei DLP</span>
                  <span className="ml-auto px-2 py-0.5 rounded text-xs bg-green-500/10 text-green-400">Actif</span>
                </div>

                {/* Alert */}
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-yellow-400 font-medium">Alerte : donnee sensible</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    IBAN detecte dans votre prompt vers ChatGPT
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 flex-grow bg-navy-800 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400 rounded-full" style={{ width: "65%" }} />
                    </div>
                    <span className="text-xs text-yellow-400">65/100</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-cyber-400">12</div>
                    <div className="text-xs text-gray-500">Alertes/jour</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-green-400">3</div>
                    <div className="text-xs text-gray-500">Bloques</div>
                  </div>
                </div>

                {/* Sites monitored */}
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-400">Sites surveilles</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {["ChatGPT", "Copilot", "Gemini", "Claude"].map((site) => (
                      <span key={site} className="px-2 py-0.5 text-xs rounded bg-white/5 text-gray-400">{site}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Manager Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="glass-card p-6 h-full">
              <h3 className="font-display text-xl font-bold text-white mb-4">
                Dashboard manager
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                Vue d&apos;ensemble sur la maturité cyber de vos équipes.
              </p>

              {/* Dashboard Mockup */}
              <div className="bg-navy-950 rounded-xl p-4 space-y-4">
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-cyber-400">87%</div>
                    <div className="text-xs text-gray-500">Participation</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-400">72%</div>
                    <div className="text-xs text-gray-500">Score moyen</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-yellow-400">3</div>
                    <div className="text-xs text-gray-500">Alertes</div>
                  </div>
                </div>

                {/* Campaign Result */}
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-white font-medium">
                      Dernière campagne phishing
                    </span>
                    <span className="text-xs text-gray-500">Il y a 2 jours</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-gray-300">
                        23 ont détecté le phishing
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-400" />
                      <span className="text-sm text-gray-300">
                        5 ont cliqué (formation en cours)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white">
                      Niveau de risque global
                    </span>
                    <span className="text-sm text-yellow-400">Modéré</span>
                  </div>
                  <div className="h-2 bg-navy-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full"
                      style={{ width: "45%" }}
                    />
                  </div>
                </div>

                {/* Team List */}
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-white font-medium">
                      Équipes à surveiller
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Commercial</span>
                      <div className="flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-yellow-400" />
                        <span className="text-xs text-yellow-400">
                          Score faible
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Support</span>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-green-400" />
                        <span className="text-xs text-green-400">
                          En progression
                        </span>
                      </div>
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

