"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  Building,
  Landmark,
  Heart,
  Factory,
  Laptop,
  Users,
} from "lucide-react";

const useCases = [
  {
    icon: Building,
    title: "PME / ETI",
    description:
      "Budget limité, équipes non techniques. CyberSensei offre une formation efficace sans mobiliser de ressources IT.",
    examples: ["Cabinets comptables", "Agences", "Commerce B2B"],
  },
  {
    icon: Landmark,
    title: "Collectivités",
    description:
      "Mairies, communautés de communes. Des agents formés aux risques cyber pour protéger les données des citoyens.",
    examples: ["Mairies", "EPCI", "Syndicats mixtes"],
  },
  {
    icon: Heart,
    title: "Santé",
    description:
      "Hôpitaux, cliniques, EHPAD. Données sensibles et obligations réglementaires : la formation est indispensable.",
    examples: ["Hôpitaux", "Cliniques", "Laboratoires"],
  },
  {
    icon: Factory,
    title: "Industrie",
    description:
      "OIV, sous-traitants. La cybersécurité industrielle passe aussi par la sensibilisation des équipes.",
    examples: ["Sous-traitants", "PMI", "Logistique"],
  },
  {
    icon: Laptop,
    title: "Télétravail",
    description:
      "Équipes distribuées, accès distants. Former aux risques spécifiques du travail à domicile.",
    examples: ["Équipes hybrides", "Freelances", "Multi-sites"],
  },
  {
    icon: Users,
    title: "Associations",
    description:
      "Données membres, bénévoles non formés. Une solution accessible pour protéger la structure.",
    examples: ["Fédérations", "ONG", "Fondations"],
  },
];

export function UseCases() {
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
            <Users className="w-4 h-4" />
            <span>Cas d&apos;usage</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6"
          >
            Conçu pour
            <br />
            <span className="text-gradient">toutes les organisations</span>
          </motion.h2>
        </div>

        {/* Use Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((useCase, index) => (
            <motion.div
              key={useCase.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.05 }}
              className="glass-card p-6 hover-lift group"
            >
              <div className="w-12 h-12 rounded-xl bg-cyber-500/10 flex items-center justify-center mb-4 group-hover:bg-cyber-500/20 transition-colors">
                <useCase.icon className="w-6 h-6 text-cyber-400" />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-2">
                {useCase.title}
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                {useCase.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {useCase.examples.map((example) => (
                  <span
                    key={example}
                    className="px-2 py-1 text-xs rounded-md bg-white/5 text-gray-400"
                  >
                    {example}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

