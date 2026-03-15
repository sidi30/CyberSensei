import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Solutions CyberSensei | Cybersecurite pour PME, Sante, Industrie, Collectivites",
  description:
    "Decouvrez comment CyberSensei protege votre organisation : formation, DLP, scanner, conformite NIS2. Solutions adaptees par secteur.",
};

export default function SolutionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
