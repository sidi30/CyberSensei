/**
 * Carte d'aide avec les commandes disponibles
 */

export function createHelpCard(): any {
  return {
    type: 'AdaptiveCard',
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.5',
    body: [
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
                    type: 'TextBlock',
                    text: '❓',
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
                    text: 'Aide CyberSensei',
                    weight: 'Bolder',
                    size: 'Large',
                  },
                  {
                    type: 'TextBlock',
                    text: 'Voici ce que je peux faire pour vous',
                    wrap: true,
                    isSubtle: true,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        type: 'TextBlock',
        text: '📝 **Commandes disponibles**',
        weight: 'Bolder',
        size: 'Medium',
        spacing: 'Large',
        separator: true,
      },
      {
        type: 'FactSet',
        facts: [
          {
            title: '🎯 quiz, start, training',
            value: 'Commencer le quiz du jour',
          },
          {
            title: '🤔 explain, pourquoi',
            value: 'Obtenir une explication',
          },
          {
            title: '📊 status, score',
            value: 'Voir votre progression',
          },
          {
            title: '❓ help, aide',
            value: 'Afficher cette aide',
          },
        ],
        spacing: 'Medium',
      },
      {
        type: 'TextBlock',
        text: '💬 **Discussion libre**',
        weight: 'Bolder',
        size: 'Medium',
        spacing: 'Large',
        separator: true,
      },
      {
        type: 'TextBlock',
        text: 'Vous pouvez aussi me poser directement vos questions sur la cybersécurité en langage naturel !',
        wrap: true,
        spacing: 'Small',
      },
      {
        type: 'TextBlock',
        text: '**Exemples:**\n- "C\'est quoi le phishing ?"\n- "Comment créer un bon mot de passe ?"\n- "Qu\'est-ce que le ransomware ?"',
        wrap: true,
        spacing: 'Medium',
      },
    ],
    actions: [
      {
        type: 'Action.Submit',
        title: '🎯 Commencer un quiz',
        data: {
          action: 'startQuiz',
        },
      },
    ],
  };
}

