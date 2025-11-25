import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Res,
  StreamableFile,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { UpdateService } from './update.service';
import { UploadUpdateDto } from './dto/upload-update.dto';
import { CheckUpdateDto } from './dto/check-update.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminRole } from '../../entities/admin-user.entity';

@ApiTags('Update Management')
@Controller()
export class UpdateController {
  constructor(private readonly updateService: UpdateService) {}

  // ============================================
  // ADMIN ENDPOINTS (Protected)
  // ============================================

  @Post('admin/update/upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Uploader un package de mise à jour (SUPERADMIN only)',
    description: `
      Upload un fichier ZIP contenant une mise à jour.
      
      **Le ZIP doit contenir un fichier \`version.json\` à la racine avec la structure suivante:**
      \`\`\`json
      {
        "version": "1.2.0",
        "changelog": "- Correctifs de sécurité\\n- Nouvelles fonctionnalités",
        "requiredNodeVersion": "1.0.0",
        "platform": "linux",
        "architecture": "x64",
        "breaking": false,
        "securityUpdate": true
      }
      \`\`\`
      
      **Champs requis:**
      - \`version\`: Version semver (ex: 1.2.0)
      - \`changelog\`: Notes de version
      - \`requiredNodeVersion\`: Version minimale du node requise
      
      **Champs optionnels:**
      - \`platform\`: Plateforme cible (linux, windows, darwin)
      - \`architecture\`: Architecture (x64, arm64)
      - \`breaking\`: Indique si la mise à jour contient des breaking changes
      - \`securityUpdate\`: Indique si c'est une mise à jour de sécurité
    `
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Fichier ZIP de mise à jour',
    type: UploadUpdateDto,
  })
  @UseInterceptors(FileInterceptor('file'))
  @ApiResponse({ 
    status: 201, 
    description: 'Mise à jour uploadée avec succès',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        version: '1.2.0',
        changelog: '- Correctifs de sécurité\n- Nouvelles fonctionnalités',
        filename: 'cybersensei-1.2.0.zip',
        fileSize: 52428800,
        checksum: 'sha256:a1b2c3d4...',
        requiredNodeVersion: '1.0.0',
        createdAt: '2025-11-24T10:30:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Fichier invalide ou version.json manquant/invalide' })
  @ApiResponse({ status: 409, description: 'Une mise à jour avec cette version existe déjà' })
  async upload(
    @Body() uploadDto: UploadUpdateDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    return this.updateService.upload(file, uploadDto.checksum);
  }

  @Get('admin/updates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPERADMIN, AdminRole.SUPPORT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Liste de toutes les mises à jour' })
  @ApiResponse({ 
    status: 200, 
    description: 'Liste récupérée',
    schema: {
      example: [{
        id: '550e8400-e29b-41d4-a716-446655440000',
        version: '1.2.0',
        changelog: 'Correctifs et améliorations',
        filename: 'cybersensei-1.2.0.zip',
        fileSize: 52428800,
        active: true,
        createdAt: '2025-11-24T10:30:00.000Z'
      }]
    }
  })
  async getAllUpdates() {
    return this.updateService.getAllUpdates();
  }

  @Get('admin/update/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPERADMIN, AdminRole.SUPPORT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Détails d\'une mise à jour' })
  @ApiParam({ name: 'id', description: 'ID de la mise à jour (UUID)' })
  @ApiResponse({ status: 200, description: 'Mise à jour trouvée' })
  @ApiResponse({ status: 404, description: 'Mise à jour non trouvée' })
  async getUpdateById(@Param('id') id: string) {
    return this.updateService.getUpdateById(id);
  }

  @Delete('admin/update/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Supprimer une mise à jour (SUPERADMIN only)',
    description: 'Supprime le fichier ZIP de GridFS et les métadonnées de PostgreSQL'
  })
  @ApiParam({ name: 'id', description: 'ID de la mise à jour (UUID)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Mise à jour supprimée',
    schema: {
      example: {
        message: 'Mise à jour supprimée avec succès',
        version: '1.2.0'
      }
    }
  })
  async delete(@Param('id') id: string) {
    return this.updateService.delete(id);
  }

  @Get('admin/update/:id/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPERADMIN, AdminRole.SUPPORT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Statistiques de téléchargement d\'une mise à jour' })
  @ApiParam({ name: 'id', description: 'ID de la mise à jour (UUID)' })
  @ApiResponse({ status: 200, description: 'Statistiques récupérées' })
  async getDownloadStats(@Param('id') id: string) {
    return this.updateService.getDownloadStats(id);
  }

  // ============================================
  // PUBLIC ENDPOINTS (For Nodes)
  // ============================================

  @Get('update/check')
  @ApiOperation({ 
    summary: 'Vérifier les mises à jour disponibles (utilisé par les nodes)',
    description: `
      Vérifie si une mise à jour est disponible pour un node client.
      
      **Validations effectuées:**
      1. Le tenant existe et est actif
      2. Le tenant possède une licence active et valide
      3. La version du node est compatible avec la mise à jour
      
      **Réponses possibles:**
      - \`available: true\` - Une mise à jour est disponible et compatible
      - \`available: false\` - Pas de mise à jour ou node à jour
      - \`available: false + requiredNodeVersion\` - Mise à jour dispo mais node trop ancien
    `
  })
  @ApiQuery({ 
    name: 'tenantId', 
    description: 'ID du tenant (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiQuery({ 
    name: 'version', 
    description: 'Version actuelle du node (semver)',
    example: '1.0.0'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Résultat de la vérification',
    schema: {
      oneOf: [
        {
          example: {
            available: true,
            updateId: '550e8400-e29b-41d4-a716-446655440000',
            currentVersion: '1.0.0',
            latestVersion: '1.2.0',
            changelog: '- Correctifs de sécurité\n- Nouvelles fonctionnalités',
            fileSize: 52428800,
            checksum: 'sha256:a1b2c3d4...',
            requiredNodeVersion: '1.0.0',
            breaking: false,
            securityUpdate: true,
            createdAt: '2025-11-24T10:30:00.000Z'
          }
        },
        {
          example: {
            available: false,
            message: 'Le node est à jour',
            currentVersion: '1.2.0',
            latestVersion: '1.2.0'
          }
        }
      ]
    }
  })
  @ApiResponse({ status: 400, description: 'Tenant inactif ou licence invalide' })
  @ApiResponse({ status: 404, description: 'Tenant non trouvé' })
  async checkForUpdates(
    @Query('tenantId') tenantId: string,
    @Query('version') version: string,
  ) {
    // Validation manuelle des query params
    if (!tenantId || !version) {
      throw new BadRequestException('tenantId et version sont requis');
    }

    return this.updateService.checkForUpdates(tenantId, version);
  }

  @Get('update/download/:updateId')
  @ApiOperation({ 
    summary: 'Télécharger un package de mise à jour (utilisé par les nodes)',
    description: `
      Télécharge le fichier ZIP de mise à jour depuis MongoDB GridFS.
      
      **Note:** L'updateId est obtenu via l'endpoint \`/update/check\`.
      
      **Réponse:** Stream binaire du fichier ZIP avec headers appropriés.
    `
  })
  @ApiParam({ 
    name: 'updateId', 
    description: 'ID de la mise à jour (UUID) obtenu via /update/check',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Téléchargement du fichier ZIP',
    headers: {
      'Content-Type': { description: 'application/zip' },
      'Content-Disposition': { description: 'attachment; filename="..."' },
      'Content-Length': { description: 'Taille du fichier en octets' },
      'X-Update-Version': { description: 'Version de la mise à jour' },
      'X-Checksum': { description: 'Checksum SHA-256 du fichier' },
    }
  })
  @ApiResponse({ status: 404, description: 'Mise à jour non trouvée' })
  @ApiResponse({ status: 400, description: 'Mise à jour désactivée' })
  async download(
    @Param('updateId') updateId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { stream, filename, contentType, size, version, checksum } =
      await this.updateService.download(updateId);

    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': size,
      'X-Update-Version': version,
      'X-Checksum': checksum,
    });

    return new StreamableFile(stream);
  }
}
