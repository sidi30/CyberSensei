"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Shield,
  MessageSquare,
  Lock,
  Zap,
  ArrowRight,
  Play,
} from "lucide-react";
import Link from "next/link";

const trustBadges = [
  { icon: Lock, label: "Données maîtrisées" },
  { icon: Shield, label: "IA locale" },
  { icon: MessageSquare, label: "Multi-plateformes" },
  { icon: Zap, label: "5 min/jour" },
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-hero" />
      <div className="absolute inset-0 bg-grid opacity-50" />

      {/* Gradient Orbs - Animated */}
      <motion.div 
        className="absolute top-1/4 -left-1/4 w-96 h-96 bg-cyber-500/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div 
        className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-cyber-600/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyber-500/5 rounded-full blur-3xl"
        animate={{
          rotate: [0, 360],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyber-500/10 border border-cyber-500/20 text-cyber-400 text-sm mb-8"
          >
            <Zap className="w-4 h-4" />
            <span>Nouveau : Simulations de phishing avancées</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-4xl md:text-5xl lg:text-7xl font-bold leading-tight mb-6"
          >
            <span className="text-white">Votre coach</span>
            <br />
            <span className="text-gradient">cybersécurité IA</span>
            <br />
            <span className="text-white">dans Teams</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10"
          >
            Formez vos équipes à reconnaître les menaces cyber avec un coach IA
            bienveillant. 5 minutes par jour, sur Teams, Slack, ou votre plateforme.
            Solution souveraine.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link href="#contact">
              <Button size="lg" className="group">
                Demander une démo
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#fonctionnement">
              <Button variant="outline" size="lg">
                <Play className="mr-2 w-4 h-4" />
                Voir comment ça marche
              </Button>
            </Link>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-6 md:gap-8"
          >
            {trustBadges.map((badge, index) => (
              <motion.div
                key={badge.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                className="flex items-center gap-2 text-gray-400"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  <badge.icon className="w-4 h-4 text-cyber-400" />
                </div>
                <span className="text-sm">{badge.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Hero Visual - Chat Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6 }}
          className="mt-16 lg:mt-24 max-w-4xl mx-auto"
        >
          <div className="glass-card p-4 md:p-6 glow">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyber-400 to-cyber-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-navy-950" />
              </div>
              <div>
                <div className="font-semibold text-white">CyberSensei</div>
                <div className="text-xs text-gray-500">
                  Coach IA • Actif maintenant
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Bot Message */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-cyber-500/20 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-cyber-400" />
                </div>
                <div className="bg-white/5 rounded-2xl rounded-tl-sm p-4 max-w-md">
                  <p className="text-gray-300 text-sm">
                    Bonjour ! 👋 C&apos;est l&apos;heure de votre exercice du
                    jour. Aujourd&apos;hui, on parle de{" "}
                    <span className="text-cyber-400 font-medium">
                      phishing par email
                    </span>
                    .
                  </p>
                </div>
              </div>

              {/* Question */}
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-cyber-500/20 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-cyber-400" />
                </div>
                <div className="bg-white/5 rounded-2xl rounded-tl-sm p-4 max-w-lg">
                  <p className="text-gray-300 text-sm mb-3">
                    Vous recevez cet email de votre &quot;banque&quot; vous
                    demandant de confirmer vos identifiants. Que faites-vous ?
                  </p>
                  <div className="space-y-2">
                    <button className="w-full text-left px-4 py-2 rounded-lg bg-white/5 hover:bg-cyber-500/20 border border-white/10 hover:border-cyber-500/50 text-sm text-gray-300 transition-all">
                      A. Je clique sur le lien et je me connecte
                    </button>
                    <button className="w-full text-left px-4 py-2 rounded-lg bg-cyber-500/20 border border-cyber-500/50 text-sm text-cyber-400 transition-all">
                      B. Je vérifie l&apos;adresse de l&apos;expéditeur ✓
                    </button>
                    <button className="w-full text-left px-4 py-2 rounded-lg bg-white/5 hover:bg-cyber-500/20 border border-white/10 hover:border-cyber-500/50 text-sm text-gray-300 transition-all">
                      C. Je transfère l&apos;email à mes collègues
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

