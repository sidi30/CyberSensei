/**
 * Générateur de carte adaptive enrichie pour les résultats
 * Version commerciale avec conseils structurés et encouragements
 */

import { SubmitAnswersResponse } from '../services/backendService';

interface AdviceBlock {
  concept: string;
  example: string;
  advice: string[];
}

interface QuestionDetail {
  questionId: string;
  correct: boolean;
  userAnswer: number;
  correctAnswer: number;
  questionText?: string;
  advice?: AdviceBlock;
  keyTakeaway?: string;
}

export function createResultCard(
  result: SubmitAnswersResponse,
  quizTitle: string,
  additionalData?: { details?: QuestionDetail[]; topic?: string }
): any {
  const percentage = Math.round((result.score / result.maxScore) * 100);
  const isExcellent = percentage >= 90;
  const isGood = percentage >= 70;
  const isPassing = percentage >= 50;

  // Messages d'encouragement selon le score
  const getEncouragementMessage = () => {
    if (isExcellent) return { emoji: '🏆', title: 'Excellent !', subtitle: 'Tu maîtrises ce sujet !' };
    if (isGood) return { emoji: '🎉', title: 'Bravo !', subtitle: 'Tu es sur la bonne voie !' };
    if (isPassing) return { emoji: '💪', title: 'Bien joué !', subtitle: 'Continue tes efforts !' };
    return { emoji: '📚', title: 'Courage !', subtitle: 'On apprend de ses erreurs !' };
  };

  const encouragement = getEncouragementMessage();

  // Couleur selon le score
  const getScoreColor = () => {
    if (isGood) return 'Good';
    if (isPassing) return 'Warning';
    return 'Attention';
  };

  // Style du container selon le score
  const getContainerStyle = () => {
    if (isGood) return 'good';
    if (isPassing) return 'warning';
    return 'attention';
  };

  // Construire les détails des questions incorrectes
  const incorrectDetails = additionalData?.details?.filter(d => !d.correct) || [];

  return {
    type: 'AdaptiveCard',
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.5',
    body: [
      // Header avec résultat
      {
        type: 'Container',
        style: getContainerStyle(),
        bleed: true,
        items: [
          {
            type: 'ColumnSet',
            columns: [
              {
                type: 'Column',
                width: 'auto',
                verticalContentAlignment: 'Center',
                items: [
                  {
                    type: 'TextBlock',
                    text: encouragement.emoji,
                    size: 'ExtraLarge',
                  },
                ],
              },
              {
                type: 'Column',
                width: 'stretch',
                items: [
                  {
                    type: 'TextBlock',
                    text: encouragement.title,
                    weight: 'Bolder',
                    size: 'Large',
                  },
                  {
                    type: 'TextBlock',
                    text: encouragement.subtitle,
                    wrap: true,
                    spacing: 'None',
                  },
                  {
                    type: 'TextBlock',
                    text: quizTitle,
                    wrap: true,
                    isSubtle: true,
                    size: 'Small',
                    spacing: 'Small',
                  },
                ],
              },
            ],
          },
        ],
      },

      // Score visuel
      {
        type: 'Container',
        spacing: 'Medium',
        items: [
          {
            type: 'ColumnSet',
            columns: [
              {
                type: 'Column',
                width: 'stretch',
                items: [
                  {
                    type: 'TextBlock',
                    text: '📊 Ton score',
                    weight: 'Bolder',
                    size: 'Medium',
                  },
                ],
              },
              {
                type: 'Column',
                width: 'auto',
                items: [
                  {
                    type: 'TextBlock',
                    text: `${result.score}/${result.maxScore}`,
                    size: 'ExtraLarge',
                    weight: 'Bolder',
                    color: getScoreColor(),
                  },
                ],
              },
            ],
          },
          // Barre de progression visuelle
          {
            type: 'TextBlock',
            text: `${'🟩'.repeat(Math.round(percentage / 10))}${'⬜'.repeat(10 - Math.round(percentage / 10))} ${percentage}%`,
            spacing: 'Small',
          },
        ],
      },

      // Statistiques
      {
        type: 'ColumnSet',
        spacing: 'Medium',
        separator: true,
        columns: [
          {
            type: 'Column',
            width: 'stretch',
            items: [
              {
                type: 'TextBlock',
                text: '✅ Bonnes réponses',
                size: 'Small',
                isSubtle: true,
              },
              {
                type: 'TextBlock',
                text: result.correct.toString(),
                weight: 'Bolder',
                size: 'Large',
                color: 'Good',
              },
            ],
            horizontalAlignment: 'Center',
          },
          {
            type: 'Column',
            width: 'stretch',
            items: [
              {
                type: 'TextBlock',
                text: '❌ À revoir',
                size: 'Small',
                isSubtle: true,
              },
              {
                type: 'TextBlock',
                text: (result.total - result.correct).toString(),
                weight: 'Bolder',
                size: 'Large',
                color: result.total - result.correct > 0 ? 'Attention' : 'Good',
              },
            ],
            horizontalAlignment: 'Center',
          },
          {
            type: 'Column',
            width: 'stretch',
            items: [
              {
                type: 'TextBlock',
                text: '📝 Total',
                size: 'Small',
                isSubtle: true,
              },
              {
                type: 'TextBlock',
                text: result.total.toString(),
                weight: 'Bolder',
                size: 'Large',
              },
            ],
            horizontalAlignment: 'Center',
          },
        ],
      },

      // Feedback personnalisé
      {
        type: 'Container',
        spacing: 'Medium',
        separator: true,
        style: 'emphasis',
        items: [
          {
            type: 'TextBlock',
            text: '💬 Mon conseil',
            weight: 'Bolder',
            size: 'Medium',
          },
          {
            type: 'TextBlock',
            text: result.feedback || getFallbackFeedback(percentage),
            wrap: true,
            spacing: 'Small',
          },
        ],
      },

      // Points clés à retenir (si erreurs)
      ...(incorrectDetails.length > 0 ? [
        {
          type: 'Container',
          spacing: 'Medium',
          separator: true,
          items: [
            {
              type: 'TextBlock',
              text: '📌 Points à retenir',
              weight: 'Bolder',
              size: 'Medium',
            },
            ...incorrectDetails.slice(0, 3).map((detail) => ({
              type: 'Container',
              style: 'warning',
              spacing: 'Small',
              items: [
                {
                  type: 'TextBlock',
                  text: detail.keyTakeaway || '💡 Relis bien la leçon sur ce point',
                  wrap: true,
                  size: 'Small',
                },
              ],
            })),
          ],
        },
      ] : []),

      // Message de motivation final
      {
        type: 'Container',
        spacing: 'Medium',
        separator: true,
        items: [
          {
            type: 'TextBlock',
            text: getMotivationalMessage(percentage),
            wrap: true,
            horizontalAlignment: 'Center',
            isSubtle: true,
          },
        ],
      },
    ],
    actions: [
      {
        type: 'Action.Submit',
        title: '🔄 Nouveau quiz',
        data: {
          action: 'newQuiz',
        },
        style: 'positive',
      },
      {
        type: 'Action.Submit',
        title: '💡 Explique-moi mes erreurs',
        data: {
          action: 'explain',
          context: `Quiz: ${quizTitle}. Score: ${result.score}/${result.maxScore}. Je veux comprendre mes erreurs.`,
        },
      },
      {
        type: 'Action.Submit',
        title: '📊 Voir ma progression',
        data: {
          action: 'status',
        },
      },
    ],
  };
}

function getFallbackFeedback(percentage: number): string {
  if (percentage >= 90) {
    return 'Impressionnant ! Tu as vraiment compris les concepts. Continue comme ça, tu es un exemple !';
  }
  if (percentage >= 70) {
    return 'Très bien ! Tu as les bases solides. Quelques petits détails à revoir et tu seras au top !';
  }
  if (percentage >= 50) {
    return 'Pas mal ! Tu progresses bien. Revois les points où tu as hésité et tu seras bientôt expert !';
  }
  return 'C\'est un bon début ! La cybersécurité demande de la pratique. Refais le quiz après avoir relu les conseils.';
}

function getMotivationalMessage(percentage: number): string {
  const messages = {
    excellent: [
      '🌟 Tu es une star de la cybersécurité !',
      '🏆 Champion ! Ton entreprise peut être fière de toi !',
      '💎 Niveau expert atteint !',
    ],
    good: [
      '🚀 Tu progresses à vue d\'œil !',
      '💪 Encore un effort et tu seras incollable !',
      '📈 Ta courbe de progression est impressionnante !',
    ],
    passing: [
      '🌱 Chaque erreur est une leçon !',
      '📚 La pratique rend parfait !',
      '🎯 Tu es sur la bonne voie !',
    ],
    needsWork: [
      '💡 Pas de panique, Rome ne s\'est pas faite en un jour !',
      '🧠 Ton cerveau enregistre, même les erreurs !',
      '🔄 Recommence, tu verras la différence !',
    ],
  };

  let category: keyof typeof messages;
  if (percentage >= 90) category = 'excellent';
  else if (percentage >= 70) category = 'good';
  else if (percentage >= 50) category = 'passing';
  else category = 'needsWork';

  const categoryMessages = messages[category];
  return categoryMessages[Math.floor(Math.random() * categoryMessages.length)];
}
