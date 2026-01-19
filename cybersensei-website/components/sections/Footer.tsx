"use client";

import { Shield, Linkedin, Twitter, Mail, Sparkles } from "lucide-react";
import Link from "next/link";

const footerLinks = {
  product: [
    { label: "Fonctionnalités", href: "#fonctionnalites" },
    { label: "Tarifs", href: "#tarifs" },
    { label: "FAQ", href: "#faq" },
    { label: "Démo", href: "#contact" },
  ],
  company: [
    { label: "À propos", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Carrières", href: "#" },
    { label: "Contact", href: "#contact" },
  ],
  legal: [
    { label: "Confidentialité", href: "/privacy" },
    { label: "Sécurité", href: "/security" },
    { label: "CGU", href: "#" },
    { label: "Mentions légales", href: "#" },
  ],
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-white/5">
      {/* Background */}
      <div className="absolute inset-0 bg-navy-950" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
            {/* Brand */}
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center gap-3 mb-4">
                <img 
                  src="/logo.png" 
                  alt="CyberSensei Logo" 
                  className="w-10 h-10 object-contain"
                />
                <span className="font-display font-bold text-xl text-white">
                  Cyber<span className="text-cyber-400">Sensei</span>
                </span>
              </Link>
              <p className="text-gray-400 text-sm mb-6 max-w-sm">
                Le coach cybersécurité IA qui forme vos équipes au quotidien.
                Simple, efficace, souverain.
              </p>
              <div className="flex items-center gap-4">
                <a
                  href="#"
                  className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-cyber-400 hover:bg-cyber-500/10 transition-colors"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-cyber-400 hover:bg-cyber-500/10 transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a
                  href="mailto:contact@cybersensei.fr"
                  className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 hover:text-cyber-400 hover:bg-cyber-500/10 transition-colors"
                  aria-label="Email"
                >
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="font-semibold text-white mb-4">Produit</h4>
              <ul className="space-y-3">
                {footerLinks.product.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-cyber-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="font-semibold text-white mb-4">Entreprise</h4>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-cyber-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="font-semibold text-white mb-4">Légal</h4>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-cyber-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-white/5">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © {currentYear} CyberSensei. Tous droits réservés.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Sparkles className="w-4 h-4 text-cyber-400" />
              <span>Fait avec passion en France 🇫🇷</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

