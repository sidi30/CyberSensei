import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/sections/Footer";
import { PhishingTestTool } from "@/components/sections/free-tools/PhishingTestTool";

export const metadata: Metadata = {
  title: "Test de Phishing Gratuit | CyberSensei",
  description:
    "Testez la résistance de vos employés au phishing gratuitement. Jusqu'à 25 utilisateurs, résultats détaillés, sans engagement.",
};

export default function TestPhishing() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <PhishingTestTool />
      <Footer />
    </main>
  );
}
