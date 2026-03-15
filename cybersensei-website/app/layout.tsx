import type { Metadata } from "next";
import { Inter, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "CyberSensei | Coach Cybersécurité IA & Protection DLP pour PME",
  description:
    "Formez vos équipes à la cybersécurité avec CyberSensei. Coach IA intégré à Microsoft Teams, simulations de phishing, protection DLP contre les fuites de données vers ChatGPT/Copilot, extension navigateur et conformité RGPD. Solution souveraine.",
  keywords: [
    "cybersécurité",
    "formation",
    "phishing",
    "PME",
    "Teams",
    "IA",
    "sensibilisation",
    "DLP",
    "protection données",
    "RGPD",
    "ChatGPT",
    "extension navigateur",
    "fuite de données",
  ],
  authors: [{ name: "CyberSensei" }],
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "CyberSensei | Coach Cybersécurité IA & Protection DLP pour PME",
    description:
      "Formez vos équipes à la cybersécurité et protégez vos données sensibles contre les fuites vers les outils IA. Coach IA, DLP temps réel, conformité RGPD.",
    type: "website",
    locale: "fr_FR",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 1200,
        alt: "CyberSensei Logo",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      <body
        className={`${inter.variable} ${outfit.variable} ${jetbrains.variable} font-sans`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}

