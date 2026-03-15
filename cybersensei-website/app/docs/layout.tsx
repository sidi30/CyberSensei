"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Shield,
  Brain,
  GraduationCap,
  Monitor,
  ClipboardCheck,
  Server,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
  {
    href: "/docs",
    label: "Vue d'ensemble",
    icon: BookOpen,
    exact: true,
  },
  {
    href: "/docs/nis2",
    label: "Comprendre NIS2",
    icon: Shield,
  },
  {
    href: "/docs/dlp-ia",
    label: "Protection DLP IA",
    icon: Brain,
  },
  {
    href: "/docs/formation",
    label: "Formation Cyber",
    icon: GraduationCap,
  },
  {
    href: "/docs/soc-light",
    label: "SOC Light M365",
    icon: Monitor,
  },
  {
    href: "/docs/diagnostic-nis2",
    label: "Diagnostic NIS2",
    icon: ClipboardCheck,
  },
  {
    href: "/docs/architecture",
    label: "Architecture technique",
    icon: Server,
  },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-navy-950 flex">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-72
          bg-navy-950/95 backdrop-blur-xl border-r border-white/10
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyber-400 to-cyber-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-navy-950" />
            </div>
            <span className="font-display text-lg font-bold text-white group-hover:text-cyber-400 transition-colors">
              CyberSensei
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 px-3 mb-3">
            Documentation
          </p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200 group
                  ${
                    active
                      ? "bg-cyber-500/10 text-cyber-400 border border-cyber-500/20"
                      : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }
                `}
              >
                <Icon
                  className={`w-4 h-4 flex-shrink-0 ${
                    active ? "text-cyber-400" : "text-gray-500 group-hover:text-gray-300"
                  }`}
                />
                <span className="flex-1">{item.label}</span>
                {active && (
                  <ChevronRight className="w-4 h-4 text-cyber-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <Link
            href="/outils-gratuits/score-nis2"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-cyber-500 to-cyber-600 text-navy-950 font-semibold text-sm hover:from-cyber-400 hover:to-cyber-500 transition-all duration-200"
          >
            <ClipboardCheck className="w-4 h-4" />
            Diagnostic NIS2 gratuit
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Mobile header bar */}
        <div className="sticky top-0 z-30 lg:hidden bg-navy-950/90 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center gap-3 px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-gray-300">
              Documentation
            </span>
          </div>
        </div>

        {/* Page content */}
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}
