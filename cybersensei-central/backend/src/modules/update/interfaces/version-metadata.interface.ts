/**
 * Structure du fichier version.json inclus dans le ZIP de mise à jour
 */
export interface VersionMetadata {
  /**
   * Version de la mise à jour (semver: 1.2.3)
   */
  version: string;

  /**
   * Notes de version détaillées
   */
  changelog: string;

  /**
   * Version minimale du node requise pour cette mise à jour
   */
  requiredNodeVersion: string;

  /**
   * Date de création de la mise à jour
   */
  createdAt?: string;

  /**
   * Métadonnées additionnelles
   */
  platform?: string;
  architecture?: string;
  dependencies?: Record<string, string>;
  breaking?: boolean;
  securityUpdate?: boolean;
  [key: string]: any;
}

