import { DomainScoreDto, ActionPlanItemDto } from './dto/compliance-result.dto';

/**
 * Génère un rapport de conformité NIS2 complet en markdown structuré.
 *
 * Le rapport inclut :
 * - Résumé exécutif avec score global
 * - Tableau détaillé par domaine
 * - Plan d'action priorisé avec références aux articles NIS2
 * - Recommandations et disclaimer légal
 *
 * @param companyName       - nom de l'entreprise
 * @param scoreGlobal       - score global de conformité (0-100)
 * @param niveauGlobal      - niveau de conformité global
 * @param scoresParDomaine  - scores détaillés par domaine
 * @param planAction        - plan d'action priorisé
 * @param sessionId         - identifiant de session
 * @returns rapport en markdown
 */
export function generateComplianceReport(
  companyName: string,
  scoreGlobal: number,
  niveauGlobal: string,
  scoresParDomaine: DomainScoreDto[],
  planAction: ActionPlanItemDto[],
  sessionId: string,
): string {
  const now = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const scoreEmoji = getScoreEmoji(scoreGlobal);
  const p1Count = planAction.filter((a) => a.priorite === 'P1').length;
  const p2Count = planAction.filter((a) => a.priorite === 'P2').length;
  const p3Count = planAction.filter((a) => a.priorite === 'P3').length;
  const conformeDomains = scoresParDomaine.filter(
    (d) => d.niveau === 'Conforme',
  ).length;

  let md = '';

  // --- En-tête ---
  md += `# Rapport de conformité NIS2 — ${companyName}\n\n`;
  md += `**Date** : ${now}  \n`;
  md += `**Référence** : ${sessionId}  \n`;
  md += `**Directive** : Directive (UE) 2022/2555 (NIS2)  \n\n`;

  // --- Résumé exécutif ---
  md += `## Résumé exécutif\n\n`;
  md += `| Indicateur | Valeur |\n`;
  md += `|---|---|\n`;
  md += `| Score global | **${scoreGlobal}/100** ${scoreEmoji} |\n`;
  md += `| Niveau de conformité | **${niveauGlobal}** |\n`;
  md += `| Domaines conformes | ${conformeDomains}/${scoresParDomaine.length} |\n`;
  md += `| Actions prioritaires (P1) | ${p1Count} |\n`;
  md += `| Actions importantes (P2) | ${p2Count} |\n`;
  md += `| Actions recommandées (P3) | ${p3Count} |\n\n`;

  // Interprétation du score
  if (scoreGlobal > 70) {
    md += `Votre organisation présente un **bon niveau de conformité** NIS2. `;
    md += `Des actions d'amélioration continue restent recommandées pour maintenir ce niveau.\n\n`;
  } else if (scoreGlobal >= 40) {
    md += `Votre organisation est **en cours de mise en conformité** NIS2. `;
    md += `Des actions significatives sont nécessaires, en particulier sur les ${p1Count + p2Count} points prioritaires identifiés.\n\n`;
  } else {
    md += `Votre organisation présente un **niveau de conformité insuffisant** au regard de la directive NIS2. `;
    md += `Une mise en conformité urgente est requise, avec ${p1Count} actions critiques à traiter en priorité.\n\n`;
  }

  // --- Scores par domaine ---
  md += `## Évaluation par domaine\n\n`;
  md += `| Domaine | Score | Niveau | Conformes |\n`;
  md += `|---|---|---|---|\n`;
  for (const d of scoresParDomaine) {
    const emoji = getScoreEmoji(d.score);
    md += `| ${d.label} | ${d.score}/100 ${emoji} | ${d.niveau} | ${d.questionsConformes}/${d.questionsTotal} |\n`;
  }
  md += `\n`;

  // Détail par domaine avec commentaire
  for (const d of scoresParDomaine) {
    md += `### ${d.label}\n\n`;
    md += `**Score** : ${d.score}/100 — **${d.niveau}**\n\n`;

    const domainActions = planAction.filter((a) => a.domaine === d.domaine);
    if (domainActions.length === 0) {
      md += `Ce domaine est conforme. Continuez à maintenir vos bonnes pratiques.\n\n`;
    } else {
      md += `${domainActions.length} action(s) de remédiation identifiée(s) :\n\n`;
      for (const a of domainActions) {
        md += `- **[${a.priorite}]** ${a.texteQuestion}\n`;
        md += `  - Réponse : ${a.reponse} | Réf. : ${a.articleNis2}\n`;
        md += `  - *${a.recommandation}*\n\n`;
      }
    }
  }

  // --- Plan d'action priorisé ---
  md += `## Plan d'action priorisé\n\n`;

  if (p1Count > 0) {
    md += `### Priorité 1 — Actions critiques (à traiter sous 30 jours)\n\n`;
    for (const a of planAction.filter((a) => a.priorite === 'P1')) {
      md += `- **${a.questionId}** (${a.articleNis2}) — ${a.texteQuestion}\n`;
      md += `  ${a.recommandation}\n\n`;
    }
  }

  if (p2Count > 0) {
    md += `### Priorité 2 — Actions importantes (à traiter sous 90 jours)\n\n`;
    for (const a of planAction.filter((a) => a.priorite === 'P2')) {
      md += `- **${a.questionId}** (${a.articleNis2}) — ${a.texteQuestion}\n`;
      md += `  ${a.recommandation}\n\n`;
    }
  }

  if (p3Count > 0) {
    md += `### Priorité 3 — Actions recommandées (à traiter sous 6 mois)\n\n`;
    for (const a of planAction.filter((a) => a.priorite === 'P3')) {
      md += `- **${a.questionId}** (${a.articleNis2}) — ${a.texteQuestion}\n`;
      md += `  ${a.recommandation}\n\n`;
    }
  }

  if (planAction.length === 0) {
    md += `Aucune action de remédiation nécessaire. Votre organisation est conforme sur l'ensemble des points évalués.\n\n`;
  }

  // --- Articles NIS2 concernés ---
  md += `## Articles NIS2 concernés\n\n`;
  const articles = [...new Set(planAction.map((a) => a.articleNis2))].sort();
  if (articles.length > 0) {
    for (const art of articles) {
      const related = planAction.filter((a) => a.articleNis2 === art);
      md += `- **${art}** — ${related.length} écart(s) identifié(s)\n`;
    }
  } else {
    md += `Aucun écart identifié par rapport aux articles évalués.\n`;
  }
  md += `\n`;

  // --- Prochaines étapes ---
  md += `## Prochaines étapes recommandées\n\n`;
  md += `1. Traiter les actions P1 dans les 30 jours suivant ce rapport\n`;
  md += `2. Planifier les actions P2 sur un horizon de 90 jours\n`;
  md += `3. Intégrer les actions P3 dans la feuille de route sécurité semestrielle\n`;
  md += `4. Relancer une évaluation dans 3 mois pour mesurer la progression\n`;
  md += `5. Envisager un audit NIS2 formel par un prestataire qualifié (PASSI)\n\n`;

  // --- Disclaimer ---
  md += `---\n\n`;
  md += `*Ce rapport a été généré automatiquement par la plateforme CyberSensei. `;
  md += `Il constitue une évaluation indicative basée sur les réponses déclaratives `;
  md += `fournies et ne remplace pas un audit de conformité NIS2 réalisé par un `;
  md += `organisme accrédité. Les recommandations sont fournies à titre informatif `;
  md += `et doivent être validées par un professionnel qualifié en cybersécurité `;
  md += `et conformité réglementaire. CyberSensei décline toute responsabilité `;
  md += `quant aux décisions prises sur la base de ce rapport.*\n`;

  return md;
}

/** Retourne un indicateur visuel en fonction du score */
function getScoreEmoji(score: number): string {
  if (score > 70) return '🟢';
  if (score >= 40) return '🟠';
  return '🔴';
}
