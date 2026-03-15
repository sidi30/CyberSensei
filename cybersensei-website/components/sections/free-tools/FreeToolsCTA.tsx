"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function FreeToolsCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 lg:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900/50 to-navy-950" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyber-500/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="glass-card p-12 glow">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyber-500/10 border border-cyber-500/20 text-cyber-400 text-sm mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Aller plus loin</span>
            </div>

            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Besoin d&apos;une protection
              <br />
              <span className="text-gradient">complète ?</span>
            </h2>

            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
              Les diagnostics gratuits identifient les problèmes. CyberSensei
              les résout : formation continue, simulations de phishing, DLP
              temps réel et conformité NIS2 — tout en un.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/#contact">
                <Button size="lg" className="group">
                  Demander une démo
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/#tarifs">
                <Button variant="outline" size="lg">
                  <Shield className="mr-2 w-4 h-4" />
                  Voir les offres
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
