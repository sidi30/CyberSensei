/**
 * Configuration du bot
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Charger les variables d'environnement
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export interface BotConfig {
  botId: string;
  botPassword: string;
  backendBaseUrl: string;
  port: number;
  environment: 'development' | 'production';
}

export const config: BotConfig = {
  botId: process.env.BOT_ID || '',
  botPassword: process.env.BOT_PASSWORD || '',
  backendBaseUrl: process.env.BACKEND_BASE_URL || 'https://localhost:8080',
  port: parseInt(process.env.PORT || '3978', 10),
  environment: (process.env.NODE_ENV as 'development' | 'production') || 'development',
};

// Validation de la configuration
if (!config.botId && config.environment === 'production') {
  console.warn('WARNING: BOT_ID is not set');
}

if (!config.botPassword && config.environment === 'production') {
  console.warn('WARNING: BOT_PASSWORD is not set');
}

