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
  title: "CyberSensei | Coach Cybersécurité IA pour PME",
  description:
    "Formez vos équipes à la cybersécurité avec CyberSensei. Coach IA intégré à Microsoft Teams, exercices quotidiens, simulations de phishing et pédagogie bienveillante. Solution souveraine.",
  keywords: [
    "cybersécurité",
    "formation",
    "phishing",
    "PME",
    "Teams",
    "IA",
    "sensibilisation",
  ],
  authors: [{ name: "CyberSensei" }],
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "CyberSensei | Coach Cybersécurité IA pour PME",
    description:
      "Formez vos équipes à la cybersécurité avec un coach IA bienveillant intégré à Microsoft Teams.",
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

