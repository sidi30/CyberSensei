/**
 * Carte de statut utilisateur
 */

import { User, ManagerMetrics } from '../services/backendService';

export function createStatusCard(user: User, metrics?: ManagerMetrics): any {
  const isManager = user.role === 'MANAGER' || user.role === 'ADMIN';

  const card: any = {
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
                    type: 'TextBlock',
                    text: '👤',
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
                    text: `Bonjour ${user.displayName} !`,
                    weight: 'Bolder',
                    size: 'Large',
                  },
                  {
                    type: 'TextBlock',
                    text: user.email,
                    isSubtle: true,
                  },
                ],
              },
            ],
          },
        ],
      },
      // User Info
      {
        type: 'FactSet',
        facts: [
          ...(user.jobTitle ? [{ title: '💼 Poste:', value: user.jobTitle }] : []),
          ...(user.department ? [{ title: '🏢 Département:', value: user.department }] : []),
          {
            title: '🎭 Rôle:',
            value: user.role === 'ADMIN' ? 'Administrateur' : user.role === 'MANAGER' ? 'Manager' : 'Utilisateur',
          },
        ],
        spacing: 'Medium',
        separator: true,
      },
    ],
    actions: [
      {
        type: 'Action.Submit',
        title: '🎯 Commencer un quiz',
        data: { action: 'startQuiz' },
      },
    ],
  };

  // Ajouter les métriques si manager
  if (isManager && metrics) {
    card.body.push(
      {
        type: 'TextBlock',
        text: '📊 **Métriques Entreprise**',
        weight: 'Bolder',
        size: 'Medium',
        spacing: 'Large',
        separator: true,
      },
      {
        type: 'ColumnSet',
        columns: [
          {
            type: 'Column',
            width: 'stretch',
            items: [
              {
                type: 'TextBlock',
                text: 'Score Entreprise',
                weight: 'Bolder',
              },
              {
                type: 'TextBlock',
                text: metrics.companyScore.toString(),
                size: 'ExtraLarge',
                weight: 'Bolder',
                color: metrics.companyScore >= 80 ? 'Good' : metrics.companyScore >= 60 ? 'Warning' : 'Attention',
              },
            ],
          },
          {
            type: 'Column',
            width: 'stretch',
            items: [
              {
                type: 'TextBlock',
                text: 'Utilisateurs Actifs',
                weight: 'Bolder',
              },
              {
                type: 'TextBlock',
                text: `${metrics.activeUsers} / ${metrics.totalUsers}`,
                size: 'Large',
                weight: 'Bolder',
              },
            ],
          },
        ],
        spacing: 'Medium',
      },
      {
        type: 'FactSet',
        facts: [
          {
            title: '📈 Score Moyen:',
            value: `${metrics.averageScore.toFixed(1)}%`,
          },
          {
            title: '✅ Exercices Complétés:',
            value: metrics.completedExercises.toString(),
          },
        ],
        spacing: 'Medium',
      }
    );

    // Ajouter action pour dashboard manager
    card.actions.push({
      type: 'Action.OpenUrl',
      title: '📊 Ouvrir le Dashboard Manager',
      url: 'https://teams.microsoft.com/l/entity/YOUR_APP_ID/manager',
    });
  }

  return card;
}

