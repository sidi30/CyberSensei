/**
 * Configuration centrale pour l'application CyberSensei Teams
 */

export interface AppConfig {
  backendBaseUrl: string;
  environment: 'development' | 'production';
  botId?: string;
  microsoftAppId?: string;
}

/**
 * Charge la configuration depuis les variables d'environnement
 */
export function loadConfig(): AppConfig {
  const backendBaseUrl = process.env.BACKEND_BASE_URL || 'http://localhost:8080';
  const environment = (process.env.NODE_ENV as 'development' | 'production') || 'development';
  
  return {
    backendBaseUrl,
    environment,
    botId: process.env.BOT_ID,
    microsoftAppId: process.env.MICROSOFT_APP_ID,
  };
}

export const config = loadConfig();

