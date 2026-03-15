/**
 * Générateur de carte adaptive enrichie pour les quiz
 * Version commerciale avec support médias et format pédagogique
 */

import { Quiz } from '../services/backendService';

interface QuizMedia {
  type: 'image' | 'gif' | 'video';
  url: string;
  alt: string;
  caption?: string;
}

export function createQuizCard(quiz: Quiz): any {
  const payload = (quiz as any).payloadJSON || {};
  const introMedia = payload.introMedia as QuizMedia | undefined;
  const courseIntro = payload.courseIntro || quiz.description;
  
  // Émojis par thème
  const topicEmojis: Record<string, string> = {
    'phishing': '🎣',
    'phishing emails': '📧',
    'mots de passe': '🔐',
    'ransomware': '💀',
    'ingénierie sociale': '🎭',
    'liens suspects': '⛓️',
  };
  
  const topicEmoji = topicEmojis[quiz.topic?.toLowerCase()] || '🛡️';
  const difficultyColors: Record<string, string> = {
    'BEGINNER': 'Good',
    'INTERMEDIATE': 'Warning', 
    'ADVANCED': 'Attention',
    'EXPERT': 'Accent',
  };

  return {
    type: 'AdaptiveCard',
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.5',
    body: [
      // Header avec thème
      {
        type: 'Container',
        style: 'emphasis',
        bleed: true,
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
                    text: topicEmoji,
                    size: 'ExtraLarge',
                  },
                ],
                verticalContentAlignment: 'Center',
              },
              {
                type: 'Column',
                width: 'stretch',
                items: [
                  {
                    type: 'TextBlock',
                    text: 'CyberSensei',
                    weight: 'Bolder',
                    size: 'Medium',
                    color: 'Accent',
                  },
                  {
                    type: 'TextBlock',
                    text: quiz.title || quiz.topic,
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
      
      // Image d'introduction si présente
      ...(introMedia ? [
        {
          type: 'Image',
          url: introMedia.url,
          altText: introMedia.alt,
          size: 'Stretch',
          spacing: 'Medium',
        },
        ...(introMedia.caption ? [{
          type: 'TextBlock',
          text: `_${introMedia.caption}_`,
          size: 'Small',
          isSubtle: true,
          wrap: true,
          horizontalAlignment: 'Center',
        }] : []),
      ] : []),
      
      // Introduction du cours
      {
        type: 'Container',
        style: 'default',
        spacing: 'Medium',
        items: [
          {
            type: 'TextBlock',
            text: '📖 **Aujourd\'hui on apprend :**',
            weight: 'Bolder',
            size: 'Medium',
          },
          {
            type: 'TextBlock',
            text: courseIntro,
            wrap: true,
            spacing: 'Small',
          },
        ],
      },
      
      // Infos sur l'exercice
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
                text: '📚 Sujet',
                size: 'Small',
                isSubtle: true,
              },
              {
                type: 'TextBlock',
                text: quiz.topic,
                weight: 'Bolder',
              },
            ],
          },
          {
            type: 'Column',
            width: 'stretch',
            items: [
              {
                type: 'TextBlock',
                text: '⚡ Niveau',
                size: 'Small',
                isSubtle: true,
              },
              {
                type: 'TextBlock',
                text: quiz.difficulty,
                weight: 'Bolder',
                color: difficultyColors[quiz.difficulty] || 'Default',
              },
            ],
          },
          {
            type: 'Column',
            width: 'stretch',
            items: [
              {
                type: 'TextBlock',
                text: '❓ Questions',
                size: 'Small',
                isSubtle: true,
              },
              {
                type: 'TextBlock',
                text: quiz.questions.length.toString(),
                weight: 'Bolder',
              },
            ],
          },
        ],
      },
      
      // Séparateur visuel
      {
        type: 'TextBlock',
        text: '───────────────',
        horizontalAlignment: 'Center',
        spacing: 'Medium',
        isSubtle: true,
      },
      
      // Questions
      ...quiz.questions.flatMap((question, qIndex) => {
        const qPayload = (question as any);
        const questionItems: any[] = [];
        
        // Contexte/mise en situation si présent
        if (qPayload.context) {
          questionItems.push({
            type: 'Container',
            style: 'emphasis',
            spacing: qIndex === 0 ? 'Medium' : 'Large',
            items: [
              {
                type: 'TextBlock',
                text: '📋 **Situation :**',
                weight: 'Bolder',
                size: 'Small',
              },
              {
                type: 'TextBlock',
                text: qPayload.context,
                wrap: true,
                spacing: 'Small',
              },
            ],
          });
          
          // Image de contexte si présente
          if (qPayload.contextMedia) {
            questionItems.push({
              type: 'Image',
              url: qPayload.contextMedia.url,
              altText: qPayload.contextMedia.alt,
              size: 'Medium',
              spacing: 'Small',
            });
          }
        }
        
        // La question elle-même
        questionItems.push({
          type: 'TextBlock',
          text: `**Question ${qIndex + 1}:** ${question.text}`,
          wrap: true,
          weight: 'Bolder',
          spacing: qPayload.context ? 'Medium' : (qIndex === 0 ? 'Medium' : 'Large'),
          size: 'Medium',
        });
        
        // Options de réponse
        questionItems.push({
          type: 'Input.ChoiceSet',
          id: `question_${question.id}`,
          style: 'expanded',
          isRequired: true,
          errorMessage: '👆 Choisis une réponse',
          choices: question.options.map((option, oIndex) => ({
            title: option,
            value: oIndex.toString(),
          })),
        });
        
        return questionItems;
      }),
    ],
    actions: [
      {
        type: 'Action.Submit',
        title: '✅ Valider mes réponses',
        data: {
          action: 'submitQuiz',
          quizId: quiz.id,
        },
        style: 'positive',
      },
      {
        type: 'Action.Submit',
        title: '💡 Besoin d\'aide ?',
        data: {
          action: 'explain',
          context: `Quiz en cours: ${quiz.topic}`,
        },
      },
    ],
  };
}
