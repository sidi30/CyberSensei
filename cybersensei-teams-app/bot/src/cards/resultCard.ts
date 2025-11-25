/**
 * Générateur de carte adaptive pour les résultats
 */

import { SubmitAnswersResponse } from '../services/backendService';

export function createResultCard(
  result: SubmitAnswersResponse,
  quizTitle: string
): any {
  const percentage = Math.round((result.score / result.maxScore) * 100);
  const isSuccess = percentage >= 70;

  return {
    type: 'AdaptiveCard',
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.5',
    body: [
      // Header avec résultat
      {
        type: 'Container',
        style: isSuccess ? 'good' : 'attention',
        items: [
          {
            type: 'ColumnSet',
            columns: [
              {
                type: 'Column',
                width: 'auto',
                items: [
                  {
                    type: 'TextBlock',
                    text: isSuccess ? '🎉' : '💪',
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
                    text: isSuccess ? 'Bravo !' : 'Continuez vos efforts !',
                    weight: 'Bolder',
                    size: 'Large',
                  },
                  {
                    type: 'TextBlock',
                    text: quizTitle,
                    wrap: true,
                    isSubtle: true,
                  },
                ],
              },
            ],
          },
        ],
      },
      // Score
      {
        type: 'Container',
        spacing: 'Medium',
        separator: true,
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
                    text: 'Votre score',
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
                    text: `${result.score} / ${result.maxScore}`,
                    size: 'ExtraLarge',
                    weight: 'Bolder',
                    color: isSuccess ? 'Good' : 'Warning',
                  },
                ],
              },
            ],
          },
          {
            type: 'TextBlock',
            text: `${percentage}%`,
            size: 'Large',
            weight: 'Bolder',
            horizontalAlignment: 'Right',
            color: isSuccess ? 'Good' : 'Warning',
          },
        ],
      },
      // Détails
      {
        type: 'FactSet',
        facts: [
          {
            title: '✅ Bonnes réponses:',
            value: result.correct.toString(),
          },
          {
            title: '❌ Erreurs:',
            value: (result.total - result.correct).toString(),
          },
          {
            title: '📊 Total:',
            value: result.total.toString(),
          },
        ],
        spacing: 'Medium',
        separator: true,
      },
      // Feedback
      {
        type: 'Container',
        spacing: 'Medium',
        separator: true,
        items: [
          {
            type: 'TextBlock',
            text: '💬 Feedback',
            weight: 'Bolder',
            size: 'Medium',
          },
          {
            type: 'TextBlock',
            text: result.feedback,
            wrap: true,
            spacing: 'Small',
          },
        ],
      },
      // Détails des questions (si disponibles)
      ...(result.details
        ? [
            {
              type: 'Container',
              spacing: 'Medium',
              separator: true,
              items: [
                {
                  type: 'TextBlock',
                  text: '📋 Détails par question',
                  weight: 'Bolder',
                  size: 'Medium',
                },
                ...result.details.map((detail, index) => ({
                  type: 'ColumnSet',
                  columns: [
                    {
                      type: 'Column',
                      width: 'auto',
                      items: [
                        {
                          type: 'TextBlock',
                          text: detail.correct ? '✅' : '❌',
                          size: 'Medium',
                        },
                      ],
                    },
                    {
                      type: 'Column',
                      width: 'stretch',
                      items: [
                        {
                          type: 'TextBlock',
                          text: `Question ${index + 1}`,
                          weight: 'Bolder',
                        },
                      ],
                    },
                  ],
                  spacing: 'Small',
                })),
              ],
            },
          ]
        : []),
    ],
    actions: [
      {
        type: 'Action.Submit',
        title: '🤔 Demander une explication',
        data: {
          action: 'explain',
          context: `Quiz: ${quizTitle}. Score: ${result.score}/${result.maxScore}`,
        },
      },
      {
        type: 'Action.Submit',
        title: '🔄 Nouveau quiz',
        data: {
          action: 'newQuiz',
        },
      },
    ],
  };
}

