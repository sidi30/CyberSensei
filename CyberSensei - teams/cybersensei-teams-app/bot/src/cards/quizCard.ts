/**
 * Générateur de carte adaptive pour les quiz
 */

import { Quiz } from '../services/backendService';

export function createQuizCard(quiz: Quiz): any {
  return {
    type: 'AdaptiveCard',
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.5',
    body: [
      // Header
      {
        type: 'Container',
        style: 'emphasis',
        items: [
          {
            type: 'ColumnSet',
            columns: [
              {
                type: 'Column',
                width: 'auto',
                items: [
                  {
                    type: 'Image',
                    url: 'https://raw.githubusercontent.com/microsoft/botframework-sdk/master/icon.png',
                    size: 'Small',
                    style: 'Person',
                  },
                ],
              },
              {
                type: 'Column',
                width: 'stretch',
                items: [
                  {
                    type: 'TextBlock',
                    text: '📝 Quiz CyberSensei',
                    weight: 'Bolder',
                    size: 'Medium',
                    color: 'Accent',
                  },
                  {
                    type: 'TextBlock',
                    text: quiz.title,
                    size: 'Large',
                    weight: 'Bolder',
                    wrap: true,
                  },
                ],
              },
            ],
          },
        ],
      },
      // Description
      {
        type: 'TextBlock',
        text: quiz.description,
        wrap: true,
        spacing: 'Medium',
        separator: true,
      },
      // Metadata
      {
        type: 'FactSet',
        facts: [
          {
            title: '📚 Sujet:',
            value: quiz.topic,
          },
          {
            title: '⚡ Difficulté:',
            value: quiz.difficulty,
          },
          {
            title: '❓ Questions:',
            value: quiz.questions.length.toString(),
          },
        ],
        spacing: 'Medium',
      },
      // Separator
      {
        type: 'TextBlock',
        text: '---',
        spacing: 'Medium',
      },
      // Questions
      ...quiz.questions.flatMap((question, qIndex) => [
        {
          type: 'TextBlock',
          text: `**Question ${qIndex + 1}:** ${question.text}`,
          wrap: true,
          weight: 'Bolder',
          spacing: qIndex === 0 ? 'Medium' : 'Large',
        },
        {
          type: 'Input.ChoiceSet',
          id: `question_${question.id}`,
          style: 'expanded',
          isRequired: true,
          errorMessage: 'Veuillez sélectionner une réponse',
          choices: question.options.map((option, oIndex) => ({
            title: option,
            value: oIndex.toString(),
          })),
        },
      ]),
    ],
    actions: [
      {
        type: 'Action.Submit',
        title: '✅ Soumettre mes réponses',
        data: {
          action: 'submitQuiz',
          quizId: quiz.id,
        },
        style: 'positive',
      },
      {
        type: 'Action.ShowCard',
        title: '❌ Annuler',
        card: {
          type: 'AdaptiveCard',
          body: [
            {
              type: 'TextBlock',
              text: 'Quiz annulé. Tapez "quiz" pour recommencer.',
              wrap: true,
            },
          ],
        },
      },
    ],
  };
}

