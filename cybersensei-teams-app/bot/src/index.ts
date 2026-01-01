/**
 * Point d'entrée du bot CyberSensei
 */

import * as restify from 'restify';
import * as path from 'path';
import {
  CloudAdapter,
  ConfigurationBotFrameworkAuthentication,
  ConfigurationBotFrameworkAuthenticationOptions,
} from 'botbuilder';
import { CyberSenseiBot } from './bot';
import { config } from './config';

// Créer le serveur HTTP Restify
const server = restify.createServer();
server.use(restify.plugins.bodyParser());

server.listen(config.port, () => {
  console.log(`\n${server.name} listening on ${server.url}`);
  console.log('\n🤖 CyberSensei Bot is ready!');
  console.log(`\n🔌 Backend URL: ${config.backendBaseUrl}`);
  console.log('📱 Simple et efficace - Exercices quotidiens obligatoires');
});

// Créer l'adaptateur
const botFrameworkAuthentication = new ConfigurationBotFrameworkAuthentication({
  MicrosoftAppId: config.botId || undefined,
  MicrosoftAppPassword: config.botPassword || undefined,
  MicrosoftAppType: 'MultiTenant',
} as ConfigurationBotFrameworkAuthenticationOptions);

const adapter = new CloudAdapter(botFrameworkAuthentication);

// Gestion des erreurs
adapter.onTurnError = async (context, error) => {
  console.error(`\n [onTurnError] unhandled error: ${error}`);
  console.error(error);

  await context.sendActivity('Désolé, une erreur est survenue. Réessayez dans quelques instants.');
};

// Créer l'instance du bot
const bot = new CyberSenseiBot();

// Écouter les requêtes entrantes
server.post('/api/messages', async (req, res) => {
  await adapter.process(req, res, async (context) => {
    await bot.run(context);
  });
});

// Endpoint de santé
server.get('/health', (req, res, next) => {
  res.send(200, { status: 'healthy', timestamp: new Date().toISOString() });
  return next();
});

// Gestion de l'arrêt gracieux
const gracefulShutdown = () => {
  console.log('\nShutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Forcing shutdown');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

