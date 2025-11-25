import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiSecurity,
} from '@nestjs/swagger';
import { LicenseService } from './license.service';
import { CreateLicenseDto } from './dto/create-license.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminRole } from '../../entities/admin-user.entity';

@ApiTags('License Management')
@Controller('api/license')
export class LicenseController {
  constructor(private readonly licenseService: LicenseService) {}

  // Public endpoint for license validation (used by nodes)
  @Get('validate')
  @ApiOperation({ summary: 'Valider une clé de licence (utilisé par les nodes)' })
  @ApiQuery({ name: 'key', description: 'Clé de licence à valider' })
  @ApiResponse({ status: 200, description: 'Licence valide' })
  @ApiResponse({ status: 400, description: 'Licence invalide ou expirée' })
  @ApiResponse({ status: 404, description: 'Clé de licence non trouvée' })
  async validate(@Query('key') key: string) {
    return this.licenseService.validate(key);
  }

  // Admin endpoints
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPERADMIN, AdminRole.SUPPORT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Générer une nouvelle licence' })
  @ApiResponse({ status: 201, description: 'Licence créée' })
  async create(@Body() createLicenseDto: CreateLicenseDto) {
    return this.licenseService.create(createLicenseDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPERADMIN, AdminRole.SUPPORT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Liste de toutes les licences' })
  @ApiResponse({ status: 200, description: 'Liste récupérée' })
  async findAll() {
    return this.licenseService.findAll();
  }

  @Get('tenant/:tenantId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPERADMIN, AdminRole.SUPPORT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Licences d\'un tenant spécifique' })
  @ApiParam({ name: 'tenantId', description: 'ID du tenant' })
  @ApiResponse({ status: 200, description: 'Licences récupérées' })
  async findByTenant(@Param('tenantId') tenantId: string) {
    return this.licenseService.findByTenant(tenantId);
  }

  @Patch(':id/revoke')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPERADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Révoquer une licence' })
  @ApiParam({ name: 'id', description: 'ID de la licence' })
  @ApiResponse({ status: 200, description: 'Licence révoquée' })
  async revoke(@Param('id') id: string) {
    return this.licenseService.revoke(id);
  }

  @Patch(':id/renew')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(AdminRole.SUPERADMIN, AdminRole.SUPPORT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Renouveler une licence' })
  @ApiParam({ name: 'id', description: 'ID de la licence' })
  @ApiQuery({ name: 'expiresAt', description: 'Nouvelle date d\'expiration' })
  @ApiResponse({ status: 200, description: 'Licence renouvelée' })
  async renew(
    @Param('id') id: string,
    @Query('expiresAt') expiresAt: string,
  ) {
    return this.licenseService.renew(id, expiresAt);
  }
}

