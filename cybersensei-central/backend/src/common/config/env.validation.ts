import { Logger } from '@nestjs/common';

const logger = new Logger('EnvValidation');

interface EnvRule {
  key: string;
  required: boolean;
  minLength?: number;
  forbiddenPatterns?: RegExp[];
  warnOnly?: boolean;
}

const ENV_RULES: EnvRule[] = [
  { key: 'POSTGRES_HOST', required: true },
  { key: 'POSTGRES_PASSWORD', required: true, minLength: 8 },
  { key: 'JWT_SECRET', required: true, minLength: 32, forbiddenPatterns: [/dev-secret/i, /change-me/i] },
  { key: 'CORS_ORIGINS', required: true },
];

export function validateEnv(): void {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';

  const errors: string[] = [];
  const warnings: string[] = [];

  for (const rule of ENV_RULES) {
    const value = process.env[rule.key];

    if (rule.required && !value) {
      const msg = `Variable d'environnement manquante: ${rule.key}`;
      if (isProduction) {
        errors.push(msg);
      } else {
        warnings.push(msg);
      }
      continue;
    }

    if (value && rule.minLength && value.length < rule.minLength) {
      const msg = `${rule.key} doit contenir au minimum ${rule.minLength} caractères`;
      if (isProduction) {
        errors.push(msg);
      } else {
        warnings.push(msg);
      }
    }

    if (value && rule.forbiddenPatterns) {
      for (const pattern of rule.forbiddenPatterns) {
        if (pattern.test(value)) {
          const msg = `${rule.key} contient un pattern interdit (${pattern.source}) - utilisez une valeur sécurisée`;
          if (isProduction) {
            errors.push(msg);
          } else {
            warnings.push(msg);
          }
        }
      }
    }
  }

  for (const w of warnings) {
    logger.warn(w);
  }

  if (errors.length > 0) {
    for (const e of errors) {
      logger.error(e);
    }
    throw new Error(
      `Configuration invalide pour la production. ${errors.length} erreur(s) détectée(s). Corrigez les variables d'environnement.`,
    );
  }
}
