import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { AdminAuthService } from './admin-auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AdminRole } from '../../entities/admin-user.entity';

@ApiTags('Authentication')
@Controller('auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  // ============================================
  // PUBLIC ROUTES
  // ============================================

  @Post('login')
  @ApiOperation({
    summary: 'Connexion administrateur',
    description: `
      Authentifie un administrateur et retourne un JWT token.
      
      **Credentials par défaut:**
      - Email: admin@cybersensei.com
      - Password: Admin@123456
      
      **Token expiration:** 24h (configurable via JWT_EXPIRES_IN)
    `,
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Connexion réussie',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Super Admin',
          email: 'admin@cybersensei.com',
          role: 'SUPERADMIN',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Email ou mot de passe incorrect',
  })
  async login(@Body() loginDto: LoginDto) {
    return this.adminAuthService.login(loginDto);
  }

  // ============================================
  // PROTECTED ROUTES
  // ============================================

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Récupérer le profil de l\'utilisateur connecté',
    description: 'Retourne les informations de l\'utilisateur authentifié basé sur le JWT token.',
  })
  @ApiResponse({
    status: 200,
    description: 'Profil récupéré',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Super Admin',
        email: 'admin@cybersensei.com',
        role: 'SUPERADMIN',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Non authentifié',
  })
  async getProfile(@CurrentUser() user: any) {
    return this.adminAuthService.getProfile(user.id);
  }

  @Post('register')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Créer un nouvel administrateur (SUPERADMIN uniquement)',
    description: `
      Permet à un SUPERADMIN de créer de nouveaux comptes administrateur.
      
      **Rôles disponibles:**
      - \`SUPERADMIN\`: Accès complet (création admins, modification configuration)
      - \`SUPPORT\`: Accès lecture seule (consultation métriques uniquement)
      
      **Contraintes:**
      - Email unique
      - Mot de passe minimum 8 caractères
    `,
  })
  @ApiBody({ type: CreateAdminDto })
  @ApiResponse({
    status: 201,
    description: 'Administrateur créé',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Support Agent',
        email: 'support@cybersensei.com',
        role: 'SUPPORT',
        active: true,
        createdAt: '2025-11-24T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Accès interdit - SUPERADMIN requis',
  })
  @ApiResponse({
    status: 409,
    description: 'Un utilisateur avec cet email existe déjà',
  })
  async createAdmin(@Body() createAdminDto: CreateAdminDto) {
    return this.adminAuthService.createAdmin(createAdminDto);
  }

  @Get('admins')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Liste de tous les administrateurs (SUPERADMIN uniquement)',
    description: 'Retourne la liste complète des comptes administrateur avec leurs informations (sauf mot de passe).',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste récupérée',
    schema: {
      example: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Super Admin',
          email: 'admin@cybersensei.com',
          role: 'SUPERADMIN',
          active: true,
          createdAt: '2025-11-24T10:30:00.000Z',
          lastLoginAt: '2025-11-24T12:45:00.000Z',
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          name: 'Support Agent',
          email: 'support@cybersensei.com',
          role: 'SUPPORT',
          active: true,
          createdAt: '2025-11-24T11:00:00.000Z',
          lastLoginAt: null,
        },
      ],
    },
  })
  async getAllAdmins() {
    return this.adminAuthService.getAllAdmins();
  }
}

