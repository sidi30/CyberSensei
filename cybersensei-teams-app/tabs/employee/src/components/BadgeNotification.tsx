import { useEffect, useState } from 'react';

interface Badge {
  badgeId: number;
  name: string;
  displayName: string;
  description: string;
  rarity: string;
  points: number;
}

interface Props {
  badge: Badge;
  onClose: () => void;
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

export function BadgeNotification({ badge, onClose }: Props) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animation d'entrée
    setTimeout(() => setIsVisible(true), 100);

    // Fermeture automatique après 5 secondes
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
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

  const getBadgeEmoji = (badgeName: string): string => {
    return BADGE_EMOJIS[badgeName] || '🏅';
  };

  return (
    <div className={`
      fixed top-20 right-4 z-50
      transform transition-all duration-300
      ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
    `}>
      <div className={`
        bg-gradient-to-br ${getRarityColor(badge.rarity)}
        text-white rounded-2xl shadow-2xl p-6 max-w-sm
        border-4 border-white
        animate-bounce-in
      `}>
        {/* Bouton fermer */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-white/80 hover:text-white transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Titre */}
        <div className="text-center mb-4">
          <h3 className="text-2xl font-bold mb-1">🎉 Nouveau Badge !</h3>
          <p className="text-sm opacity-90">Félicitations !</p>
        </div>

        {/* Badge */}
        <div className="bg-white rounded-xl p-6 text-center mb-4">
          {/* Emoji animé */}
          <div className="text-7xl mb-3 animate-bounce-slow">
            {getBadgeEmoji(badge.name)}
          </div>

          {/* Nom */}
          <h4 className="text-xl font-bold text-gray-800 mb-2">
            {badge.displayName}
          </h4>

          {/* Description */}
          <p className="text-sm text-gray-600 mb-3">
            {badge.description}
          </p>

          {/* Rareté et Points */}
          <div className="flex items-center justify-center gap-3">
            <span className={`
              px-3 py-1 rounded-full text-xs font-semibold
              bg-gradient-to-r ${getRarityColor(badge.rarity)}
              text-white
            `}>
              {badge.rarity}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
              +{badge.points} XP
            </span>
          </div>
        </div>

        {/* Message encouragement */}
        <p className="text-center text-sm opacity-90">
          Continue comme ça ! 💪
        </p>
      </div>
    </div>
  );
}

export default BadgeNotification;

