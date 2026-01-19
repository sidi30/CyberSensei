import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/sections/Footer";
import { Lock, Server, Shield, Eye, Check, FileCheck } from "lucide-react";
import Link from "next/link";

const securityFeatures = [
  {
    icon: Server,
    title: "Déploiement On-Premise",
    description:
      "CyberSensei s'installe sur votre infrastructure. Conteneur Docker isolé, pas de dépendance cloud externe.",
  },
  {
    icon: Lock,
    title: "Chiffrement",
    description:
      "Données chiffrées au repos (AES-256) et en transit (TLS 1.3). Mots de passe hashés avec bcrypt.",
  },
  {
    icon: Eye,
    title: "Principe du Moindre Privilège",
    description:
      "Chaque composant n'accède qu'aux ressources strictement nécessaires à son fonctionnement.",
  },
  {
    icon: FileCheck,
    title: "Conformité RGPD",
    description:
      "Conçu dès l'origine avec la protection des données en tête. Documentation DPO disponible.",
  },
];

export default function SecurityPage() {
  return (
    <main className="min-h-screen">
      <Navbar />

      <section className="pt-32 pb-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyber-500/10 mb-6">
              <Lock className="w-8 h-8 text-cyber-400" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              Sécurité
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              La sécurité est au cœur de CyberSensei. Découvrez comment nous 
              protégeons vos données et votre infrastructure.
            </p>
          </div>

          {/* Security Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {securityFeatures.map((feature) => (
              <div key={feature.title} className="glass-card p-6">
                <div className="w-12 h-12 rounded-xl bg-cyber-500/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-cyber-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="glass-card p-8 lg:p-12 space-y-8">
            <section>
              <h2 className="font-display text-2xl font-bold text-white mb-4">
                Architecture Sécurisée
              </h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                CyberSensei utilise une architecture distribuée avec séparation claire :
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyber-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-400">
                    <strong className="text-white">Node Client :</strong> 
                    {" "}Déployé dans votre environnement, contient toutes les données utilisateurs.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyber-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-400">
                    <strong className="text-white">Central :</strong> 
                    {" "}Fournit uniquement les mises à jour de contenu et de logiciel.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyber-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-400">
                    <strong className="text-white">Communication :</strong> 
                    {" "}Le Node initie les connexions sortantes, jamais l&apos;inverse.
                  </span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-white mb-4">
                Bonnes Pratiques
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyber-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-400">Revue de code régulière et analyse statique</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyber-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-400">Dépendances mises à jour automatiquement</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyber-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-400">Images Docker scannées avant publication</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-cyber-400 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-400">Journalisation complète des accès</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-white mb-4">
                Signaler une Vulnérabilité
              </h2>
              <p className="text-gray-400 leading-relaxed">
                Si vous découvrez une faille de sécurité, contactez-nous immédiatement :
                <a href="mailto:security@cybersensei.fr" className="text-cyber-400 hover:underline ml-1">
                  security@cybersensei.fr
                </a>
                <br />
                Nous nous engageons à répondre sous 48h.
              </p>
            </section>
          </div>

          <div className="text-center mt-12">
            <Link href="/" className="text-cyber-400 hover:underline">
              ← Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

