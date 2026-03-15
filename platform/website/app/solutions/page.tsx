"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Brain, Monitor, Bot, BarChart3, Lock, Eye, Zap, Users,
  FileText, ChevronDown, Sparkles, Building2, Landmark, Heart,
  Factory, GraduationCap, Calculator, Target, MessageSquare,
  ScanLine, ClipboardCheck, Chrome, ArrowRight, CheckCircle,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/sections/Footer";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────────────────

const sectors = [
  {
    id: "sante",
    icon: <Heart className="w-6 h-6" />,
    name: "Sante",
    subtitle: "Hopitaux, cliniques, EHPAD, laboratoires",
    color: "from-red-500/10 to-red-500/5",
    border: "border-red-500/20",
    accent: "text-red-400",
    problem: "Un aide-soignant copie un compte-rendu medical dans ChatGPT pour le reformuler. En 3 secondes, les donnees de sante d'un patient sont sur un serveur americain. Violation RGPD Article 9, amende potentielle : 20 millions d'euros.",
    persona: "Sophie, directrice d'un EHPAD de 80 lits",
    personaQuote: "Mes equipes utilisent ChatGPT pour ecrire des transmissions. Je ne savais meme pas que c'etait un risque. Avec CyberSensei, chaque copier-coller est analyse avant d'etre envoye. L'extension bloque automatiquement si elle detecte un nom de patient ou un numero de Secu.",
    solutions: [
      "L'extension DLP detecte automatiquement les donnees medicales, NIR et noms de patients AVANT qu'ils ne quittent votre reseau",
      "Les exercices quotidiens (5 min dans Teams) forment le personnel aux reflexes : phishing, mots de passe, gestion des dossiers patients",
      "Le rapport NIS2 vous dit exactement ou vous en etes avec la directive europeenne — obligatoire pour les etablissements de sante",
    ],
  },
  {
    id: "industrie",
    icon: <Factory className="w-6 h-6" />,
    name: "Industrie & OIV",
    subtitle: "Sous-traitants, PMI, logistique, energie",
    color: "from-orange-500/10 to-orange-500/5",
    border: "border-orange-500/20",
    accent: "text-orange-400",
    problem: "Un technicien de maintenance recoit un email avec un lien pour 'mettre a jour le firmware'. Il clique. Un ransomware chiffre le systeme de controle de la chaine de production. L'usine est a l'arret pendant 3 jours. Cout : 500 000 euros.",
    persona: "Marc, DSI d'un sous-traitant aeronautique (120 salaries)",
    personaQuote: "Nos clients nous imposent des audits cyber. Avant CyberSensei, on avait zero formation. Maintenant, chaque operateur fait un quiz de 5 minutes par jour dans Teams. Notre score de conformite NIS2 est passe de 28 a 71 en 4 mois.",
    solutions: [
      "Le scanner detecte les ports ouverts et les failles connues sur vos serveurs industriels — comme un controle technique pour votre infrastructure",
      "Les simulations de phishing entrainent vos equipes a reperer les faux emails de fournisseurs ou de maintenance",
      "Le rapport SOC niveau 2 donne a votre DSI les commandes exactes pour corriger chaque faille trouvee",
    ],
  },
  {
    id: "collectivites",
    icon: <Landmark className="w-6 h-6" />,
    name: "Collectivites",
    subtitle: "Mairies, communautes de communes, EPCI",
    color: "from-blue-500/10 to-blue-500/5",
    border: "border-blue-500/20",
    accent: "text-blue-400",
    problem: "Un agent de mairie recoit un email de la 'Prefecture' demandant de verifier un dossier. Le lien mene vers un faux site. Ses identifiants sont voles. L'attaquant accede aux donnees de 15 000 administres : etat civil, revenus, situations familiales.",
    persona: "Thomas, DGS d'une communaute de communes (45 agents)",
    personaQuote: "Nos agents ne sont pas des informaticiens. CyberSensei parle leur langage. Le quiz du jour ressemble a un jeu, pas a une formation obligatoire barbante. Et quand un agent colle des donnees d'administres dans une IA, l'extension le bloque immediatement avec une explication claire.",
    solutions: [
      "Formation accessible dans Teams : quiz adaptes au vocabulaire des agents territoriaux, pas du jargon IT",
      "L'extension DLP protege les donnees des administres (etat civil, revenus, donnees sociales) contre les fuites vers les IA",
      "Le tableau de bord manager permet au DGS de suivre la progression de chaque service sans etre un expert",
    ],
  },
  {
    id: "pme",
    icon: <Building2 className="w-6 h-6" />,
    name: "PME / ETI",
    subtitle: "Commerce B2B, agences, services",
    color: "from-emerald-500/10 to-emerald-500/5",
    border: "border-emerald-500/20",
    accent: "text-emerald-400",
    problem: "Votre comptable recoit un email du 'directeur' demandant un virement urgent de 45 000 euros. L'email est bien imite, le ton est credible. C'est une arnaque au president. 73% des PME touchees par une cyberattaque ne s'en remettent pas financierement.",
    persona: "Julie, dirigeante d'une agence de communication (25 salaries)",
    personaQuote: "Je n'ai pas de DSI, pas de budget securite. CyberSensei coute le prix d'un cafe par employe et par jour. En 3 mois, mes equipes ont appris a reperer les faux emails. Et la semaine derniere, l'extension a bloque un stagiaire qui allait coller un brief client confidentiel dans ChatGPT.",
    solutions: [
      "Installation en 5 minutes, zero maintenance — vous n'avez pas besoin d'un informaticien",
      "Quiz quotidiens de 5 minutes dans Teams : phishing, mots de passe, ingenierie sociale, adaptes au niveau de chacun",
      "Le rapport mensuel traduit la securite en langage business : risques financiers, impact sur le CA, investissements recommandes",
    ],
  },
  {
    id: "cabinets",
    icon: <Calculator className="w-6 h-6" />,
    name: "Cabinets comptables & juridiques",
    subtitle: "Experts-comptables, avocats, notaires",
    color: "from-violet-500/10 to-violet-500/5",
    border: "border-violet-500/20",
    accent: "text-violet-400",
    problem: "Un collaborateur utilise Claude pour rediger un contrat client. Il copie-colle le contrat entier avec les noms, SIREN, montants et clauses confidentielles. Resultat : le contrat de votre client est stocke sur un serveur externe. Violation du secret professionnel et du RGPD.",
    persona: "Antoine, associe d'un cabinet comptable (12 collaborateurs)",
    personaQuote: "Mes collaborateurs adorent utiliser l'IA pour gagner du temps. Mais ils y collaient des bilans, des IBAN, des declarations. L'extension CyberSensei detecte automatiquement les IBAN, SIREN et montants. Elle propose une version anonymisee du texte. Le meilleur des deux mondes.",
    solutions: [
      "L'extension detecte les IBAN, SIREN, SIRET, numeros fiscaux et donnees personnelles AVANT l'envoi vers l'IA",
      "Proposition automatique d'une version anonymisee : votre collaborateur utilise l'IA en toute securite",
      "Conformite NIS2 en un questionnaire : le rapport vous dit exactement quels documents produire (PSSI, PCA, PRA)",
    ],
  },
  {
    id: "education",
    icon: <GraduationCap className="w-6 h-6" />,
    name: "Education & Recherche",
    subtitle: "Ecoles, universites, organismes de formation",
    color: "from-pink-500/10 to-pink-500/5",
    border: "border-pink-500/20",
    accent: "text-pink-400",
    problem: "Un enseignant copie les notes et appreciations de 35 eleves dans ChatGPT pour generer les bulletins. Noms, prenoms, resultats scolaires : tout part sur un serveur externe. Les parents decouvrent que les donnees de leurs enfants sont sur internet.",
    persona: "Claire, directrice d'un lycee professionnel (60 enseignants)",
    personaQuote: "Nos enseignants utilisent l'IA pour creer des cours et corriger des copies. C'est formidable pour la pedagogie. Mais ils y mettaient les noms des eleves. Avec CyberSensei, l'extension detecte les listes de noms et propose de les anonymiser. Plus de risque.",
    solutions: [
      "Protection des donnees eleves : l'extension detecte les listes de noms, notes et appreciations avant qu'elles ne quittent l'etablissement",
      "Formation ludique pour le personnel : quiz dans Teams adaptes au contexte educatif",
      "Deploiement on-premise possible : aucune donnee ne quitte votre infrastructure",
    ],
  },
];

const features = [
  {
    id: "dlp",
    icon: <Chrome className="w-6 h-6" />,
    name: "Extension navigateur DLP",
    tagline: "Le vigile de vos outils IA",
    color: "text-red-400",
    description: "Quand un employe copie-colle du texte dans ChatGPT, Claude, Gemini, Copilot ou Mistral, l'extension analyse le contenu en temps reel. Si elle detecte des donnees sensibles (noms, IBAN, numeros de Secu, donnees medicales...), elle bloque l'envoi et propose une version anonymisee.",
    analogy: "C'est comme un agent de securite a la sortie du bureau qui verifie que personne ne part avec des dossiers confidentiels sous le bras.",
    benefits: ["Analyse en moins de 500 millisecondes", "Fonctionne sur 5 outils IA majeurs", "Propose une version anonymisee automatiquement", "Zero donnee stockee dans le cloud"],
  },
  {
    id: "quiz",
    icon: <MessageSquare className="w-6 h-6" />,
    name: "Formation dans Teams",
    tagline: "Le coach dans votre bureau",
    color: "text-emerald-400",
    description: "Chaque jour, vos employes recoivent un exercice de cybersecurite dans Microsoft Teams. Quiz, mises en situation, simulations de phishing — le tout adapte a leur niveau. C'est ludique, court (5 minutes) et ca change tous les jours.",
    analogy: "C'est comme un exercice d'evacuation incendie, mais pour les menaces numeriques. Et au lieu d'une fois par an, c'est 5 minutes par jour.",
    benefits: ["5 minutes par jour, directement dans Teams", "160+ exercices adaptatifs par niveau", "Gamification : XP, badges, niveaux, series", "Bot IA pour poser des questions a tout moment"],
  },
  {
    id: "extension-quiz",
    icon: <Target className="w-6 h-6" />,
    name: "Extension Formation",
    tagline: "Apprendre depuis le navigateur",
    color: "text-cyan-400",
    description: "En plus de Teams, une extension Chrome permet aux employes de faire leurs exercices directement depuis leur navigateur. Quiz quotidiens, glossaire de cybersecurite, coach IA — tout est accessible en un clic.",
    analogy: "C'est comme avoir un dictionnaire de securite et un coach personnel toujours ouverts a cote de votre travail.",
    benefits: ["Panel lateral dans Chrome — pas de changement d'outil", "Glossaire : 12 termes cles expliques simplement", "Coach IA integre pour poser vos questions", "Progression synchronisee avec Teams"],
  },
  {
    id: "dashboard-manager",
    icon: <BarChart3 className="w-6 h-6" />,
    name: "Dashboard Manager",
    tagline: "Le tableau de bord du dirigeant",
    color: "text-yellow-400",
    description: "Le manager voit en un coup d'oeil le niveau de securite de son equipe : qui a fait ses exercices, qui a clique sur un faux phishing, quel est le score global. Pas besoin d'etre expert — tout est en couleurs et en pourcentages.",
    analogy: "C'est comme le tableau de bord de votre voiture : les voyants verts disent que tout va bien, les rouges disent qu'il faut agir.",
    benefits: ["Score de risque par employe et par equipe", "Taux de reussite aux simulations de phishing", "Alertes DLP et statistiques d'usage des IA", "Rapports exportables en PDF"],
  },
  {
    id: "dashboard-central",
    icon: <Monitor className="w-6 h-6" />,
    name: "Dashboard Central (SaaS)",
    tagline: "Le QG de votre securite",
    color: "text-violet-400",
    description: "Pour les prestataires IT qui gerent plusieurs clients : un seul tableau de bord pour voir l'etat de securite de toutes vos organisations. Gestion des licences, distribution des mises a jour, alertes centralisees.",
    analogy: "C'est comme une salle de controle avec toutes les cameras de tous vos batiments sur un seul ecran.",
    benefits: ["Multi-tenant : un compte pour gerer N clients", "Audit Microsoft 365 avec score de securite A-F", "Gestion des abonnements et licences", "Distribution automatique des mises a jour"],
  },
  {
    id: "scanner",
    icon: <ScanLine className="w-6 h-6" />,
    name: "Scanner de vulnerabilites",
    tagline: "Le detecteur de failles",
    color: "text-blue-400",
    description: "Le scanner analyse automatiquement votre domaine : ports ouverts, failles connues (CVE), qualite du chiffrement, domaines imitateurs, emails dans des fuites, reputation IP. Un score de 0 a 100 resume votre etat de sante.",
    analogy: "C'est comme un serrurier qui teste toutes vos portes et fenetres, verifie vos serrures et vous dit lesquelles un cambrioleur pourrait forcer.",
    benefits: ["6 modules d'analyse en parallele", "Score de securite 0-100 avec detail des penalites", "Scans automatiques quotidiens et hebdomadaires", "Alertes email si votre score baisse"],
  },
  {
    id: "soc",
    icon: <FileText className="w-6 h-6" />,
    name: "Rapports SOC automatises",
    tagline: "Le bilan de sante cyber",
    color: "text-indigo-400",
    description: "A partir des resultats du scanner, l'IA (Claude) genere des rapports professionnels adaptes a votre audience. Du resume executif pour le dirigeant au rapport technique pour l'administrateur systeme, en passant par l'evaluation NIS2 pour le DPO.",
    analogy: "C'est comme votre bilan de sante annuel : le medecin vous donne un resume simple, mais le specialiste a le detail de chaque analyse.",
    benefits: ["5 niveaux de rapport : SOC 1/2/3, NIS2, Mensuel", "PDF professionnel avec logo, score colore, disclaimer", "Adapte a l'audience : dirigeant, technicien, auditeur", "Envoi automatique par email"],
  },
  {
    id: "nis2",
    icon: <ClipboardCheck className="w-6 h-6" />,
    name: "Conformite NIS2",
    tagline: "Votre guide reglementaire",
    color: "text-teal-400",
    description: "La directive NIS2 oblige les entreprises de secteurs critiques a renforcer leur cybersecurite. CyberSensei propose un questionnaire de 25 questions couvrant les 10 domaines de la directive. Vous obtenez un score par domaine et un plan d'action priorise.",
    analogy: "C'est comme un conseiller fiscal pour la cybersecurite : il vous dit exactement ce que la loi exige, ou vous en etes, et ce qu'il faut faire en priorite.",
    benefits: ["25 questions couvrant les 10 domaines NIS2", "Score par domaine : conforme, en cours, non conforme", "Plan d'action P1/P2/P3 avec references legales", "Rapport telechargeab en markdown"],
  },
];

const steps = [
  {
    num: "1",
    title: "On installe",
    time: "5 minutes",
    desc: "Votre service IT lance CyberSensei avec une seule commande Docker. Ou bien vous choisissez la version SaaS — rien a installer.",
  },
  {
    num: "2",
    title: "Vos equipes apprennent",
    time: "5 min/jour",
    desc: "Chaque employe recoit un exercice quotidien dans Teams ou via l'extension Chrome. C'est court, ludique et adapte a son niveau.",
  },
  {
    num: "3",
    title: "Vous etes protege",
    time: "24/7",
    desc: "L'extension DLP bloque les fuites en temps reel. Le scanner detecte les failles. Les rapports vous informent. Tout est automatique.",
  },
];

// ─────────────────────────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────────────────────────

function SectorCard({ sector, index }: { sector: typeof sectors[0]; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      viewport={{ once: true }}
      className={`glass-card overflow-hidden border ${sector.border} bg-gradient-to-br ${sector.color}`}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left p-6 flex items-start gap-4"
      >
        <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center shrink-0 ${sector.accent}`}>
          {sector.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white">{sector.name}</h3>
          <p className="text-sm text-white/40 mt-0.5">{sector.subtitle}</p>
        </div>
        <ChevronDown className={`w-5 h-5 text-white/30 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 space-y-4">
              {/* Le probleme */}
              <div className="rounded-xl bg-red-500/5 border border-red-500/10 p-4">
                <h4 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-2">
                  <Eye className="w-4 h-4" /> Le risque concret
                </h4>
                <p className="text-sm text-white/50 leading-relaxed">{sector.problem}</p>
              </div>

              {/* Persona */}
              <div className="rounded-xl bg-white/[0.03] border border-white/10 p-4">
                <p className="text-sm text-white/60 italic leading-relaxed">
                  &laquo; {sector.personaQuote} &raquo;
                </p>
                <p className="text-xs text-white/30 mt-2">— {sector.persona}</p>
              </div>

              {/* Solutions */}
              <div>
                <h4 className="text-sm font-semibold text-white/70 mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cyber-400" /> Ce que CyberSensei apporte
                </h4>
                <ul className="space-y-2">
                  {sector.solutions.map((sol, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-white/50">
                      <CheckCircle className="w-4 h-4 text-cyber-500/60 shrink-0 mt-0.5" />
                      <span>{sol}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      viewport={{ once: true }}
      className="glass-card p-6 hover-lift"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`${feature.color}`}>{feature.icon}</div>
        <div>
          <h3 className="text-base font-semibold text-white">{feature.name}</h3>
          <p className="text-xs text-white/40">{feature.tagline}</p>
        </div>
      </div>

      <p className="text-sm text-white/50 leading-relaxed mb-3">{feature.description}</p>

      <div className="rounded-lg bg-cyber-500/5 border border-cyber-500/10 p-3 mb-3">
        <p className="text-xs text-white/40 italic leading-relaxed">
          &laquo; {feature.analogy} &raquo;
        </p>
      </div>

      <ul className="space-y-1.5">
        {feature.benefits.map((b, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-white/40">
            <CheckCircle className="w-3 h-3 text-cyber-500/50 shrink-0 mt-0.5" />
            {b}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────

export default function SolutionsPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* ─── HERO ─────────────────────────────────────────────── */}
      <div className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyber-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px]" />

        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyber-500/10 border border-cyber-500/20 mb-8">
              <Sparkles className="w-4 h-4 text-cyber-400" />
              <span className="text-sm text-cyber-400 font-medium">Solutions par secteur</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6">
              <span className="text-white">CyberSensei protege</span>{" "}
              <span className="text-gradient">votre entreprise.</span>{" "}
              <span className="text-white">Simplement.</span>
            </h1>

            <p className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed">
              Les cyberattaques ne visent pas que les grandes entreprises.
              CyberSensei forme vos equipes, protege vos donnees et surveille
              votre infrastructure — sans avoir besoin d&apos;un expert en securite.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mt-10">
              <a href="#secteurs" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyber-500/10 border border-cyber-500/20 text-cyber-400 hover:bg-cyber-500/20 transition-colors">
                <Target className="w-4 h-4" />
                Decouvrir par secteur
              </a>
              <a href="#fonctionnalites-detail" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition-colors">
                Voir les fonctionnalites
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-16 xl:px-32 pb-32 space-y-32">

        {/* ─── COMMENT CA MARCHE ──────────────────────────────── */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-white mb-4">
              Comment ca marche ?
            </h2>
            <p className="text-white/40 max-w-xl mx-auto">
              Trois etapes. Pas de jargon. Pas besoin d&apos;etre informaticien.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className="glass-card p-6 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-cyber-500/10 border border-cyber-500/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl font-bold text-cyber-400">{step.num}</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">{step.title}</h3>
                <p className="text-xs text-cyber-400 mb-3">{step.time}</p>
                <p className="text-sm text-white/40 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─── SECTEURS ───────────────────────────────────────── */}
        <section id="secteurs">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-white mb-4">
              Votre secteur, <span className="text-gradient">vos risques</span>, notre solution
            </h2>
            <p className="text-white/40 max-w-2xl mx-auto">
              Chaque secteur a ses propres menaces. Cliquez sur le votre pour decouvrir
              les risques concrets et comment CyberSensei vous protege.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {sectors.map((sector, i) => (
              <SectorCard key={sector.id} sector={sector} index={i} />
            ))}
          </div>
        </section>

        {/* ─── FONCTIONNALITES ────────────────────────────────── */}
        <section id="fonctionnalites-detail">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold text-white mb-4">
              8 outils qui <span className="text-gradient">travaillent pour vous</span>
            </h2>
            <p className="text-white/40 max-w-2xl mx-auto">
              Chaque outil est explique simplement, avec une analogie du monde reel.
              Vous n&apos;avez pas besoin de comprendre la technique pour comprendre la valeur.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, i) => (
              <FeatureCard key={feature.id} feature={feature} index={i} />
            ))}
          </div>
        </section>

        {/* ─── CTA ────────────────────────────────────────────── */}
        <section className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="glass-card p-12 max-w-2xl mx-auto"
          >
            <div className="w-16 h-16 rounded-2xl bg-cyber-500/10 flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-cyber-400" />
            </div>
            <h2 className="text-2xl font-display font-bold text-white mb-4">
              Pret a proteger votre organisation ?
            </h2>
            <p className="text-white/40 mb-8 max-w-lg mx-auto">
              Demandez une demonstration personnalisee. Nous vous montrons CyberSensei
              applique a votre secteur, avec vos contraintes.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/#contact"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-cyber-500 text-navy-950 font-semibold hover:bg-cyber-400 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Demander une demo
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 transition-colors"
              >
                Documentation technique
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </section>

      </div>

      <Footer />
    </main>
  );
}
