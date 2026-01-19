import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface Badge {
  badgeId: number;
  name: string;
  displayName: string;
  description: string;
  iconUrl?: string;
  badgeType: string;
  rarity: string;
  points: number;
  earnedAt?: string;
  earned: boolean;
}

interface Props {
  userId: number;
  showOnlyEarned?: boolean;
}

const BADGE_EMOJIS: { [key: string]: string } = {
  'badge-phishing-master': '🎣',
  'badge-link-detective': '🔍',
  'badge-password-guru': '🔐',
  'badge-internal-guardian': '🛡️',
  'badge-security-reflex': '⚡',
  'badge-social-engineer-hunter': '🎭',
  'badge-attachment-defender': '📎',
  'badge-fraud-stopper': '💰',
  'badge-identity-protector': '👤',
  'badge-remote-secure': '🏡',
  'badge-apt-defender': '🎯',
  'badge-ransomware-warrior': '🦠',
  'badge-data-guardian': '🔒',
  'badge-shadow-hunter': '👻',
  'badge-security-champion': '🏆',
  'badge-beginner-complete': '🌟',
  'badge-intermediate-complete': '💎',
  'badge-advanced-complete': '👑',
  'badge-perfect-score': '💯',
  'badge-week-streak': '🔥',
};

export function UserBadges({ userId, showOnlyEarned = false }: Props) {
  const { token } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBadges();
  }, [userId, showOnlyEarned]);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      const endpoint = showOnlyEarned 
        ? `http://localhost:10000/api/badges/user/${userId}`
        : `http://localhost:10000/api/badges/all/${userId}`;
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des badges');
      }

      const data = await response.json();
      setBadges(data);
    } catch (err) {
      console.error('Error loading badges:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'COMMON': return 'from-gray-400 to-gray-600';
      case 'RARE': return 'from-blue-400 to-blue-600';
      case 'EPIC': return 'from-purple-400 to-purple-600';
      case 'LEGENDARY': return 'from-orange-400 to-orange-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getRarityBorderColor = (rarity: string) => {
    switch (rarity) {
      case 'COMMON': return 'border-gray-400';
      case 'RARE': return 'border-blue-400';
      case 'EPIC': return 'border-purple-400';
      case 'LEGENDARY': return 'border-orange-400';
      default: return 'border-gray-400';
    }
  };

  const getBadgeEmoji = (badgeName: string): string => {
    return BADGE_EMOJIS[badgeName] || '🏅';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const earnedBadges = badges.filter(b => b.earned);
  const displayBadges = showOnlyEarned ? earnedBadges : badges;

  if (displayBadges.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-6xl mb-4">🎯</div>
        <p className="text-lg font-semibold">Aucun badge pour le moment</p>
        <p className="text-sm">Complète des modules pour gagner des badges !</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      {!showOnlyEarned && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">{earnedBadges.length} / {badges.length}</h3>
              <p className="opacity-90">Badges obtenus</p>
            </div>
            <div className="text-6xl">🏆</div>
          </div>
          <div className="mt-4 bg-white/20 rounded-full h-3">
            <div 
              className="bg-white rounded-full h-3 transition-all duration-500"
              style={{ width: `${(earnedBadges.length / badges.length) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Grille de badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {displayBadges.map((badge) => (
          <div
            key={badge.badgeId}
            className={`relative group ${
              badge.earned ? 'cursor-pointer' : 'opacity-40 grayscale'
            }`}
          >
            {/* Badge Card */}
            <div className={`
              border-4 ${getRarityBorderColor(badge.rarity)}
              rounded-2xl p-4 text-center
              transition-all duration-300
              ${badge.earned ? 'hover:scale-105 hover:shadow-xl' : ''}
              bg-white
            `}>
              {/* Emoji/Icône */}
              <div className={`
                text-5xl mb-2
                ${badge.earned ? 'animate-bounce-slow' : ''}
              `}>
                {badge.earned ? getBadgeEmoji(badge.name) : '🔒'}
              </div>

              {/* Nom du badge */}
              <h4 className="font-bold text-sm text-gray-800 mb-1 line-clamp-2">
                {badge.displayName}
              </h4>

              {/* Rareté */}
              <div className={`
                inline-block px-2 py-1 rounded-full text-[10px] font-semibold
                bg-gradient-to-r ${getRarityColor(badge.rarity)}
                text-white mb-2
              `}>
                {badge.rarity}
              </div>

              {/* Points */}
              <div className="text-xs text-gray-600">
                +{badge.points} XP
              </div>

              {/* Date d'obtention */}
              {badge.earned && badge.earnedAt && (
                <div className="text-[10px] text-gray-500 mt-2">
                  {new Date(badge.earnedAt).toLocaleDateString('fr-FR')}
                </div>
              )}
            </div>

            {/* Tooltip au survol */}
            {badge.earned && (
              <div className="
                absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
                opacity-0 group-hover:opacity-100
                transition-opacity duration-300
                pointer-events-none z-10
              ">
                <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl max-w-xs">
                  <p className="font-semibold mb-1">{badge.displayName}</p>
                  <p className="text-gray-300">{badge.description}</p>
                  <div className="mt-2 flex items-center justify-between text-[10px]">
                    <span className={`px-2 py-0.5 rounded ${getRarityBorderColor(badge.rarity)} border`}>
                      {badge.rarity}
                    </span>
                    <span>+{badge.points} XP</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Message d'encouragement */}
      {!showOnlyEarned && earnedBadges.length < badges.length && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-blue-800">
            <strong>{badges.length - earnedBadges.length} badges</strong> restants à débloquer ! 🎯
          </p>
          <p className="text-sm text-blue-600 mt-1">
            Complète des modules à 80% pour gagner des badges
          </p>
        </div>
      )}
    </div>
  );
}

export default UserBadges;

