import { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/sections/Footer";
import { M365DiagnosticTool } from "@/components/sections/free-tools/M365DiagnosticTool";

export const metadata: Metadata = {
  title: "Diagnostic Microsoft 365 Gratuit | CyberSensei",
  description:
    "Auditez gratuitement la sécurité de votre Microsoft 365 en 5 minutes. Score de sécurité, vulnérabilités détectées, recommandations. Sans engagement.",
};

export default function DiagnosticM365() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <M365DiagnosticTool />
      <Footer />
    </main>
  );
}
