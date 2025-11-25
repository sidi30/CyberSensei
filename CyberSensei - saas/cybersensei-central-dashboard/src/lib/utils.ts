import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utilitaire pour fusionner les classes CSS avec Tailwind
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formater un nombre en notation compacte (1K, 1M, etc.)
 */
export function formatCompactNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
}

/**
 * Formater une durée en secondes en format lisible
 */
export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}j ${hours}h`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Formater une date relative (il y a X temps)
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return 'À l\'instant';
  }
  if (diffMin < 60) {
    return `Il y a ${diffMin} min`;
  }
  if (diffHour < 24) {
    return `Il y a ${diffHour}h`;
  }
  if (diffDay < 30) {
    return `Il y a ${diffDay}j`;
  }
  return date.toLocaleDateString('fr-FR');
}

/**
 * Obtenir la couleur du statut de santé
 */
export function getHealthColor(
  status: 'healthy' | 'warning' | 'critical' | 'noData'
): string {
  switch (status) {
    case 'healthy':
      return 'text-success-600 bg-success-50';
    case 'warning':
      return 'text-warning-600 bg-warning-50';
    case 'critical':
      return 'text-danger-600 bg-danger-50';
    case 'noData':
      return 'text-gray-600 bg-gray-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
}

/**
 * Obtenir le label du statut de santé
 */
export function getHealthLabel(
  status: 'healthy' | 'warning' | 'critical' | 'noData'
): string {
  switch (status) {
    case 'healthy':
      return 'Sain';
    case 'warning':
      return 'Attention';
    case 'critical':
      return 'Critique';
    case 'noData':
      return 'Pas de données';
    default:
      return 'Inconnu';
  }
}

/**
 * Déterminer le statut de santé d'un tenant basé sur la dernière métrique
 */
export function getTenantHealth(lastMetricTime: string | null): 'healthy' | 'warning' | 'critical' | 'noData' {
  if (!lastMetricTime) {
    return 'noData';
  }

  const now = new Date();
  const lastMetric = new Date(lastMetricTime);
  const diffMinutes = (now.getTime() - lastMetric.getTime()) / 1000 / 60;

  if (diffMinutes <= 30) {
    return 'healthy';
  }
  if (diffMinutes <= 60) {
    return 'warning';
  }
  return 'critical';
}

/**
 * Obtenir le label du rôle admin
 */
export function getRoleLabel(role: string): string {
  switch (role) {
    case 'SUPERADMIN':
      return 'Super Admin';
    case 'SUPPORT':
      return 'Support';
    default:
      return role;
  }
}

/**
 * Obtenir la couleur du statut de licence
 */
export function getLicenseStatusColor(status: string): string {
  switch (status) {
    case 'ACTIVE':
      return 'badge-success';
    case 'EXPIRED':
      return 'badge-danger';
    case 'SUSPENDED':
      return 'badge-warning';
    default:
      return 'badge-gray';
  }
}

/**
 * Obtenir le label du statut de licence
 */
export function getLicenseStatusLabel(status: string): string {
  switch (status) {
    case 'ACTIVE':
      return 'Active';
    case 'EXPIRED':
      return 'Expirée';
    case 'SUSPENDED':
      return 'Suspendue';
    default:
      return status;
  }
}

