import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // ⚠️ MODE BYPASS - Authentification désactivée
    console.warn('⚠️ MODE BYPASS ACTIVÉ - JwtAuthGuard désactivé');
    // Injecter un utilisateur par défaut dans la requête
    const request = context.switchToHttp().getRequest();
    request.user = {
      id: '1',
      email: 'admin@cybersensei.io',
      role: 'SUPERADMIN',
      name: 'Admin'
    };
    return true; // Toujours autoriser
  }
}

