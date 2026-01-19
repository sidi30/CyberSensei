"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Est-ce une vraie attaque de phishing ?",
    answer:
      "Non, absolument pas. CyberSensei envoie des simulations de phishing à but pédagogique. Aucun risque réel pour votre entreprise. Les collaborateurs qui cliquent sont immédiatement redirigés vers un module de formation adapté, sans sanction.",
  },
  {
    question: "Nos données sortent-elles de l'entreprise ?",
    answer:
      "Non. CyberSensei Node s'installe sur votre infrastructure (Docker). Les données utilisateurs, résultats d'exercices et historiques restent chez vous. Seules des métriques agrégées et anonymes peuvent être partagées, et uniquement si vous l'activez.",
  },
  {
    question: "Faut-il installer quelque chose sur les postes ?",
    answer:
      "Non. CyberSensei fonctionne directement dans Microsoft Teams. Vos collaborateurs n'ont rien à installer. Côté IT, seul le déploiement du conteneur Docker est nécessaire (une fois).",
  },
  {
    question: "Combien de temps ça prend par jour ?",
    answer:
      "5 minutes maximum. CyberSensei est conçu pour s'intégrer dans le quotidien sans surcharger. Un ou deux exercices courts, une notification discrète dans Teams. L'apprentissage se fait progressivement, sans bloquer le travail.",
  },
  {
    question: "Est-ce compatible avec une petite équipe (PME) ?",
    answer:
      "Oui, c'est même notre cœur de cible. CyberSensei a été pensé pour les organisations sans équipe sécurité dédiée. L'installation est simple, l'interface intuitive, et les tarifs adaptés aux budgets PME.",
  },
  {
    question: "Peut-on démarrer par un pilote avant de s'engager ?",
    answer:
      "Absolument. Nous proposons un pilote gratuit de 30 jours avec un groupe test. C'est la meilleure façon de mesurer l'impact avant un déploiement complet.",
  },
  {
    question: "Comment se passe la mise en place ?",
    answer:
      "Très simplement : 1) Déploiement Docker (quelques minutes avec notre script). 2) Configuration de l'app Teams (nous vous accompagnons). 3) Import des utilisateurs. En moins d'une journée, vous êtes opérationnels.",
  },
  {
    question: "Y a-t-il un support en français ?",
    answer:
      "Oui. L'équipe CyberSensei est française. Support, documentation, contenu pédagogique : tout est en français. Nous connaissons les réalités des PME et collectivités françaises.",
  },
];

export function FAQ() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="faq"
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
            <HelpCircle className="w-4 h-4" />
            <span>Questions fréquentes</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6"
          >
            Vous avez des questions ?
          </motion.h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-3xl mx-auto"
        >
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-white hover:text-cyber-400">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-400 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}

