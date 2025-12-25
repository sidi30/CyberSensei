import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AdminRole } from '../../entities/admin-user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // ⚠️ MODE BYPASS - Vérification des rôles désactivée
    console.warn('⚠️ MODE BYPASS ACTIVÉ - RolesGuard désactivé');
    return true; // Toujours autoriser peu importe le rôle
  }
}

