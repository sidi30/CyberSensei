import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/sections/Footer";
import { NIS2ScoreTool } from "@/components/sections/free-tools/NIS2ScoreTool";

export const metadata: Metadata = {
  title: "Score NIS2 Gratuit | CyberSensei",
  description:
    "Évaluez gratuitement votre conformité à la directive NIS2 en 5 minutes. 20 questions, 10 domaines, plan d'action personnalisé. Échéance octobre 2026.",
};

export default function ScoreNIS2() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <NIS2ScoreTool />
      <Footer />
    </main>
  );
}
