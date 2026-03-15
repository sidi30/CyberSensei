import { AnswerValue } from './dto/submit-answers.dto';
import { DomainScoreDto } from './dto/compliance-result.dto';

/** Représentation d'une question NIS2 chargée depuis le JSON */
export interface NIS2Question {
  id: string;
  domaine: string;
  texte: string;
  type: string;
  poids: number;
  article_nis2: string;
  recommandation_si_non: string;
}

/** Valeur numérique associée à chaque type de réponse */
const ANSWER_SCORE: Record<string, number> = {
  [AnswerValue.OUI]: 100,
  [AnswerValue.PARTIEL]: 50,
  [AnswerValue.NON]: 0,
  [AnswerValue.NA]: -1, // Exclu du calcul
};

/**
 * Calcule le score de conformité pour un domaine donné.
 * Le score est une moyenne pondérée des réponses (0-100).
 * Les réponses "na" sont exclues du calcul.
 */
function computeDomainScore(
  domaine: string,
  questions: NIS2Question[],
  answers: Record<string, AnswerValue>,
): DomainScoreDto {
  const domainQuestions = questions.filter((q) => q.domaine === domaine);

  let weightedSum = 0;
  let totalWeight = 0;
  let conformes = 0;

  for (const q of domainQuestions) {
    const answer = answers[q.id];
    if (!answer || answer === AnswerValue.NA) continue;

    const score = ANSWER_SCORE[answer];
    if (score < 0) continue;

    weightedSum += score * q.poids;
    totalWeight += q.poids;

    if (answer === AnswerValue.OUI) conformes++;
  }

  const score = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

  return {
    domaine,
    label: formatDomainLabel(domaine),
    score,
    niveau: getNiveau(score),
    questionsTotal: domainQuestions.length,
    questionsConformes: conformes,
  };
}

/**
 * Détermine le niveau de conformité à partir du score.
 * Non conforme < 40 / En cours 40-70 / Conforme > 70
 */
export function getNiveau(score: number): string {
  if (score > 70) return 'Conforme';
  if (score >= 40) return 'En cours';
  return 'Non conforme';
}

/** Transforme un identifiant de domaine en label lisible */
function formatDomainLabel(domaine: string): string {
  const labels: Record<string, string> = {
    gouvernance: 'Gouvernance',
    gestion_risques: 'Gestion des risques',
    continuite: 'Continuité d\'activité',
    chaine_approvisionnement: 'Chaîne d\'approvisionnement',
    gestion_incidents: 'Gestion des incidents',
    cryptographie: 'Cryptographie',
    securite_rh: 'Sécurité des ressources humaines',
    controle_acces: 'Contrôle d\'accès',
    securite_physique: 'Sécurité physique',
    audit: 'Audit et évaluation',
  };
  return labels[domaine] || domaine;
}

/**
 * Moteur de scoring principal.
 * Calcule les scores par domaine et le score global pondéré.
 *
 * @param questions - liste complète des questions NIS2
 * @param answers   - réponses soumises par l'utilisateur
 * @returns score global (0-100), niveau global et détail par domaine
 */
export function computeScores(
  questions: NIS2Question[],
  answers: Record<string, AnswerValue>,
): {
  scoreGlobal: number;
  niveauGlobal: string;
  scoresParDomaine: DomainScoreDto[];
} {
  // Extraire les domaines uniques
  const domaines = [...new Set(questions.map((q) => q.domaine))];

  // Calculer le score pour chaque domaine
  const scoresParDomaine = domaines.map((d) =>
    computeDomainScore(d, questions, answers),
  );

  // Score global = moyenne pondérée par le nombre de questions évaluées par domaine
  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const ds of scoresParDomaine) {
    const evaluated = ds.questionsTotal;
    if (evaluated === 0) continue;
    totalWeightedScore += ds.score * evaluated;
    totalWeight += evaluated;
  }

  const scoreGlobal =
    totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;

  return {
    scoreGlobal,
    niveauGlobal: getNiveau(scoreGlobal),
    scoresParDomaine,
  };
}
