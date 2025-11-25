import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminRole } from '../../entities/admin-user.entity';

@ApiTags('Tenant Management')
@Controller('admin/tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  @Roles(AdminRole.SUPERADMIN, AdminRole.SUPPORT)
  @ApiOperation({ summary: 'Créer un nouveau tenant' })
  @ApiResponse({ status: 201, description: 'Tenant créé avec succès' })
  async create(@Body() createTenantDto: CreateTenantDto) {
    return this.tenantService.create(createTenantDto);
  }

  @Get()
  @Roles(AdminRole.SUPERADMIN, AdminRole.SUPPORT)
  @ApiOperation({ summary: 'Liste de tous les tenants' })
  @ApiResponse({ status: 200, description: 'Liste récupérée' })
  async findAll() {
    return this.tenantService.findAll();
  }

  @Get(':id')
  @Roles(AdminRole.SUPERADMIN, AdminRole.SUPPORT)
  @ApiOperation({ summary: 'Détails d\'un tenant' })
  @ApiParam({ name: 'id', description: 'ID du tenant' })
  @ApiResponse({ status: 200, description: 'Tenant trouvé' })
  @ApiResponse({ status: 404, description: 'Tenant non trouvé' })
  async findOne(@Param('id') id: string) {
    return this.tenantService.findOne(id);
  }

  @Patch(':id')
  @Roles(AdminRole.SUPERADMIN, AdminRole.SUPPORT)
  @ApiOperation({ summary: 'Mettre à jour un tenant' })
  @ApiParam({ name: 'id', description: 'ID du tenant' })
  @ApiResponse({ status: 200, description: 'Tenant mis à jour' })
  async update(
    @Param('id') id: string,
    @Body() updateTenantDto: UpdateTenantDto,
  ) {
    return this.tenantService.update(id, updateTenantDto);
  }

  @Delete(':id')
  @Roles(AdminRole.SUPERADMIN)
  @ApiOperation({ summary: 'Supprimer un tenant (SUPERADMIN only)' })
  @ApiParam({ name: 'id', description: 'ID du tenant' })
  @ApiResponse({ status: 200, description: 'Tenant supprimé' })
  async remove(@Param('id') id: string) {
    return this.tenantService.remove(id);
  }

  @Get(':id/metrics')
  @Roles(AdminRole.SUPERADMIN, AdminRole.SUPPORT)
  @ApiOperation({ summary: 'Métriques d\'un tenant' })
  @ApiParam({ name: 'id', description: 'ID du tenant' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Métriques récupérées' })
  async getMetrics(
    @Param('id') id: string,
    @Query('limit') limit?: number,
  ) {
    return this.tenantService.getTenantMetrics(id, limit || 100);
  }

  @Get(':id/health')
  @Roles(AdminRole.SUPERADMIN, AdminRole.SUPPORT)
  @ApiOperation({ summary: 'État de santé d\'un tenant' })
  @ApiParam({ name: 'id', description: 'ID du tenant' })
  @ApiResponse({ status: 200, description: 'État de santé récupéré' })
  async getHealth(@Param('id') id: string) {
    return this.tenantService.getTenantHealth(id);
  }
}

