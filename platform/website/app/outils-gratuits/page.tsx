import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/sections/Footer";
import { FreeToolsHero } from "@/components/sections/free-tools/FreeToolsHero";
import { FreeToolsGrid } from "@/components/sections/free-tools/FreeToolsGrid";
import { FreeToolsCTA } from "@/components/sections/free-tools/FreeToolsCTA";

export const metadata: Metadata = {
  title: "Outils Gratuits | CyberSensei - Diagnostic Cyber pour votre entreprise",
  description:
    "Testez gratuitement la sécurité de votre entreprise : audit Microsoft 365, test de phishing, score de conformité NIS2. Résultats immédiats, sans engagement.",
  keywords: [
    "audit cybersécurité gratuit",
    "diagnostic M365",
    "test phishing gratuit",
    "conformité NIS2",
    "score sécurité",
    "audit Microsoft 365",
  ],
};

export default function OutilsGratuits() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <FreeToolsHero />
      <FreeToolsGrid />
      <FreeToolsCTA />
      <Footer />
    </main>
  );
}
