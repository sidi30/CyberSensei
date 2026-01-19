"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Check, Sparkles, Building2, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    description: "Pour les petites équipes qui démarrent",
    price: "À partir de 99€",
    period: "/mois",
    icon: Rocket,
    features: [
      "Jusqu'à 25 utilisateurs",
      "Exercices quotidiens",
      "1 campagne phishing/mois",
      "Dashboard basique",
      "Support email",
    ],
    cta: "Essayer gratuitement",
    highlight: false,
  },
  {
    name: "Business",
    description: "Pour les PME en croissance",
    price: "À partir de 249€",
    period: "/mois",
    icon: Building2,
    features: [
      "Jusqu'à 100 utilisateurs",
      "Exercices adaptatifs",
      "Campagnes phishing illimitées",
      "Dashboard manager complet",
      "Rapports personnalisés",
      "Support prioritaire",
      "Intégration SSO",
    ],
    cta: "Demander une démo",
    highlight: true,
  },
  {
    name: "Enterprise",
    description: "Pour les grandes organisations",
    price: "Sur devis",
    period: "",
    icon: Sparkles,
    features: [
      "Utilisateurs illimités",
      "Déploiement on-premise",
      "Personnalisation complète",
      "SLA garanti",
      "Account manager dédié",
      "Formation équipe IT",
      "API & intégrations",
    ],
    cta: "Nous contacter",
    highlight: false,
  },
];

export function Pricing() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="tarifs"
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
            <span>Tarification transparente</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6"
          >
            Une offre adaptée
            <br />
            <span className="text-gradient">à votre taille</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-gray-400"
          >
            Commencez petit, évoluez selon vos besoins. Pas d&apos;engagement
            long terme.
          </motion.p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              className={`relative ${plan.highlight ? "md:-mt-4 md:mb-4" : ""}`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-cyber-500 to-cyber-600 rounded-full text-xs font-semibold text-navy-950">
                  Le plus populaire
                </div>
              )}

              <div
                className={`glass-card p-8 h-full flex flex-col ${
                  plan.highlight
                    ? "border-cyber-500/50 glow"
                    : "border-white/10"
                }`}
              >
                <div className="mb-6">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                      plan.highlight ? "bg-cyber-500/20" : "bg-white/5"
                    }`}
                  >
                    <plan.icon
                      className={`w-6 h-6 ${
                        plan.highlight ? "text-cyber-400" : "text-gray-400"
                      }`}
                    />
                  </div>
                  <h3 className="font-display text-xl font-bold text-white mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-gray-400">{plan.description}</p>
                </div>

                <div className="mb-6">
                  <span className="text-3xl font-display font-bold text-white">
                    {plan.price}
                  </span>
                  <span className="text-gray-400">{plan.period}</span>
                </div>

                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-cyber-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="#contact" className="w-full">
                  <Button
                    variant={plan.highlight ? "default" : "outline"}
                    className="w-full"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Note */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center text-sm text-gray-500 mt-12"
        >
          Tous les prix sont HT. Remises volume disponibles. Pilote gratuit de
          30 jours sur demande.
        </motion.p>
      </div>
    </section>
  );
}

