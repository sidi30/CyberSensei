import { AnswerValue } from './dto/submit-answers.dto';
import { ActionPlanItemDto } from './dto/compliance-result.dto';
import { NIS2Question } from './scoring_engine';

/**
 * Détermine la priorité d'une action de remédiation en fonction
 * du poids de la question et du type de réponse.
 *
 * P1 (Critique) : poids >= 4 et réponse "non"
 * P2 (Important) : poids >= 3 et réponse "non", ou poids >= 4 et réponse "partiel"
 * P3 (Recommandé) : tous les autres cas non conformes
 */
function getPriorite(poids: number, reponse: AnswerValue): string {
  if (reponse === AnswerValue.NON && poids >= 4) return 'P1';
  if (reponse === AnswerValue.NON && poids >= 3) return 'P2';
  if (reponse === AnswerValue.PARTIEL && poids >= 4) return 'P2';
  return 'P3';
}

/** Valeur numérique pour le tri des priorités */
const PRIORITY_ORDER: Record<string, number> = { P1: 1, P2: 2, P3: 3 };

/**
 * Génère un plan d'action priorisé basé sur les réponses "non" et "partiel".
 *
 * Le plan est trié par :
 * 1. Priorité (P1 > P2 > P3)
 * 2. Poids décroissant à priorité égale
 *
 * Les réponses "oui" et "na" sont exclues du plan d'action.
 *
 * @param questions - liste complète des questions NIS2
 * @param answers   - réponses soumises par l'utilisateur
 * @returns liste d'actions priorisées
 */
export function generateActionPlan(
  questions: NIS2Question[],
  answers: Record<string, AnswerValue>,
): ActionPlanItemDto[] {
  const actions: ActionPlanItemDto[] = [];

  for (const q of questions) {
    const reponse = answers[q.id];

    // Ignorer les réponses conformes et non applicables
    if (!reponse || reponse === AnswerValue.OUI || reponse === AnswerValue.NA) {
      continue;
    }

    actions.push({
      priorite: getPriorite(q.poids, reponse),
      questionId: q.id,
      domaine: q.domaine,
      articleNis2: q.article_nis2,
      reponse,
      poids: q.poids,
      texteQuestion: q.texte,
      recommandation: q.recommandation_si_non,
    });
  }

  // Trier par priorité puis par poids décroissant
  actions.sort((a, b) => {
    const prioA = PRIORITY_ORDER[a.priorite] || 99;
    const prioB = PRIORITY_ORDER[b.priorite] || 99;
    if (prioA !== prioB) return prioA - prioB;
    return b.poids - a.poids;
  });

  return actions;
}
