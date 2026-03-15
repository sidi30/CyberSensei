import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { validateEnv } from './common/config/env.validation';

async function bootstrap() {
  // Validate environment variables before starting
  validateEnv();

  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Security headers — hardened
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameAncestors: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
      hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      frameguard: { action: 'deny' },
      noSniff: true,
      xssFilter: false, // Deprecated header — modern browsers don't need it
      hidePoweredBy: true,
    }),
  );

  // CORS configuration
  const corsOrigins = configService.get<string>('CORS_ORIGINS', '');
  const allowedOrigins = corsOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (server-to-server, curl, etc.)
      if (!origin) return callback(null, true);
      // Allow Chrome/Edge extensions
      if (origin.startsWith('chrome-extension://') || origin.startsWith('moz-extension://')) {
        return callback(null, true);
      }
      // Allow configured origins
      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-License-Key', 'X-Activation-Code', 'X-Tenant-Id'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger — disabled in production for security
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');
  if (nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('CyberSensei Central Backend')
      .setDescription('Multi-tenant SaaS platform for CyberSensei node management')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addApiKey(
        {
          type: 'apiKey',
          name: 'X-License-Key',
          in: 'header',
          description: 'License key for tenant authentication',
        },
        'license-key',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
    logger.log('Swagger documentation available at /docs');
  } else {
    logger.log('Swagger disabled in production');
  }

  const port = configService.get<number>('PORT', 3000);
  await app.listen(port);
  logger.log(`CyberSensei Central Backend running on port ${port} [${nodeEnv}]`);
}

bootstrap();
