"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import {
  ShieldAlert,
  Brain,
  Layers,
  Globe,
  AlertTriangle,
  Check,
  ArrowDown,
} from "lucide-react";

export function DLPProtection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="dlp"
      ref={ref}
      className="py-24 lg:py-32 relative overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-navy-900/50 to-navy-950" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm mb-6"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Nouveau : Protection DLP pour outils IA</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6"
          >
            Vos données ne fuient plus
            <br />
            <span className="text-gradient">vers les IA</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-gray-400 max-w-2xl mx-auto"
          >
            Vos collaborateurs utilisent ChatGPT, Copilot ou Gemini au quotidien.
            CyberSensei intercepte les données sensibles avant qu&apos;elles ne
            quittent votre organisation.
          </motion.p>
        </div>

        {/* DLP Flow Diagram */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-4xl mx-auto mb-16"
        >
          <div className="glass-card p-8 glow">
            {/* Step 1 - Extension */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-cyber-500/20 flex items-center justify-center flex-shrink-0">
                <Globe className="w-6 h-6 text-cyber-400" />
              </div>
              <div className="flex-grow">
                <div className="text-white font-semibold">Extension navigateur</div>
                <div className="text-sm text-gray-400">
                  Intercepte chaque prompt sur ChatGPT, Copilot, Gemini, Claude, Mistral
                </div>
              </div>
              <div className="px-3 py-1 rounded-full text-xs bg-green-500/10 text-green-400 border border-green-500/20">
                Chrome
              </div>
            </div>

            <div className="flex justify-center mb-6">
              <ArrowDown className="w-5 h-5 text-cyber-500/50" />
            </div>

            {/* Step 2 - Layer 1 */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <Layers className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-grow">
                <div className="text-white font-semibold">Couche 1 : Analyse rapide</div>
                <div className="text-sm text-gray-400">
                  Presidio NER + LLM Guard + Reconnaisseurs FR (NIR, IBAN, SIREN...)
                </div>
              </div>
              <div className="px-3 py-1 rounded-full text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20">
                ~5-20ms
              </div>
            </div>

            <div className="flex justify-center mb-6">
              <ArrowDown className="w-5 h-5 text-cyber-500/50" />
            </div>

            {/* Step 3 - Layer 2 */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <Brain className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex-grow">
                <div className="text-white font-semibold">Couche 2 : Analyse semantique</div>
                <div className="text-sm text-gray-400">
                  Mistral 7B local + Detection RGPD Article 9 (sante, opinions, biometrique...)
                </div>
              </div>
              <div className="px-3 py-1 rounded-full text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20">
                ~500ms
              </div>
            </div>

            <div className="flex justify-center mb-6">
              <ArrowDown className="w-5 h-5 text-cyber-500/50" />
            </div>

            {/* Step 4 - Result */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="flex-grow">
                <div className="text-white font-semibold">Score de risque & action</div>
                <div className="text-sm text-gray-400">
                  Score 0-100 avec alerte visuelle, blocage configurable et journalisation d&apos;audit
                </div>
              </div>
              <div className="flex gap-2">
                <div className="px-2 py-1 rounded text-xs bg-green-500/10 text-green-400">OK</div>
                <div className="px-2 py-1 rounded text-xs bg-yellow-500/10 text-yellow-400">Alerte</div>
                <div className="px-2 py-1 rounded text-xs bg-red-500/10 text-red-400">Bloque</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Detection Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Donnees personnelles",
              items: ["Noms, emails, telephones", "Adresses, dates de naissance", "Numeros de securite sociale (NIR)"],
              color: "cyber",
            },
            {
              title: "Donnees financieres",
              items: ["IBAN, cartes bancaires", "SIREN, SIRET, numeros fiscaux", "Informations salariales"],
              color: "blue",
            },
            {
              title: "Secrets techniques",
              items: ["Cles API, tokens", "Mots de passe, credentials", "Code source sensible"],
              color: "purple",
            },
            {
              title: "RGPD Article 9",
              items: ["Donnees de sante", "Opinions politiques, syndicales", "Orientation, biometrie"],
              color: "yellow",
            },
          ].map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
              className="glass-card p-6 hover-lift"
            >
              <h3 className="font-semibold text-white mb-4">{category.title}</h3>
              <ul className="space-y-2">
                {category.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-cyber-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-400">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
