import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/sections/Footer";
import { Shield } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      
      <section className="pt-32 pb-24 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyber-500/10 mb-6">
              <Shield className="w-8 h-8 text-cyber-400" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
              Politique de Confidentialité
            </h1>
            <p className="text-gray-400">
              Dernière mise à jour : Janvier 2026
            </p>
          </div>

          <div className="glass-card p-8 lg:p-12 space-y-8">
            <section>
              <h2 className="font-display text-2xl font-bold text-white mb-4">
                1. Introduction
              </h2>
              <p className="text-gray-400 leading-relaxed">
                CyberSensei s&apos;engage à protéger la vie privée de ses utilisateurs. 
                Cette politique de confidentialité explique comment nous collectons, 
                utilisons et protégeons vos données personnelles.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-white mb-4">
                2. Données Collectées
              </h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                CyberSensei collecte uniquement les données nécessaires au fonctionnement du service :
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-2">
                <li>Informations d&apos;identification (nom, email professionnel)</li>
                <li>Données de progression d&apos;apprentissage</li>
                <li>Résultats des exercices et simulations</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-white mb-4">
                3. Hébergement des Données
              </h2>
              <p className="text-gray-400 leading-relaxed">
                <strong className="text-cyber-400">Principe de souveraineté :</strong> 
                {" "}CyberSensei Node s&apos;installe sur l&apos;infrastructure du client. 
                Les données utilisateurs restent dans l&apos;environnement de l&apos;entreprise. 
                Aucun transfert de données personnelles vers nos serveurs n&apos;est effectué.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-white mb-4">
                4. Télémétrie Optionnelle
              </h2>
              <p className="text-gray-400 leading-relaxed">
                Si activée par l&apos;administrateur, seules des métriques agrégées 
                et anonymisées peuvent être transmises pour améliorer le produit : 
                nombre d&apos;utilisateurs actifs, taux de complétion moyen, etc. 
                Aucune donnée identifiable n&apos;est jamais partagée.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-white mb-4">
                5. Vos Droits
              </h2>
              <p className="text-gray-400 leading-relaxed">
                Conformément au RGPD, vous disposez des droits d&apos;accès, 
                de rectification, d&apos;effacement et de portabilité de vos données. 
                Contactez votre administrateur ou notre support pour exercer ces droits.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-bold text-white mb-4">
                6. Contact
              </h2>
              <p className="text-gray-400 leading-relaxed">
                Pour toute question relative à cette politique : 
                <a href="mailto:privacy@cybersensei.fr" className="text-cyber-400 hover:underline ml-1">
                  privacy@cybersensei.fr
                </a>
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

