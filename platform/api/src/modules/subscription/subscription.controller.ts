import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminRole } from '../../entities/admin-user.entity';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get()
  @Roles(AdminRole.SUPERADMIN, AdminRole.SUPPORT)
  findAll() {
    return this.subscriptionService.findAll();
  }

  @Get('stats')
  @Roles(AdminRole.SUPERADMIN)
  getStats() {
    return this.subscriptionService.getStats();
  }

  @Get('tenant/:tenantId')
  @Roles(AdminRole.SUPERADMIN, AdminRole.SUPPORT)
  findByTenant(@Param('tenantId', ParseUUIDPipe) tenantId: string) {
    return this.subscriptionService.findByTenantId(tenantId);
  }

  @Get(':id')
  @Roles(AdminRole.SUPERADMIN, AdminRole.SUPPORT)
  findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.subscriptionService.findById(id);
  }

  @Post()
  @Roles(AdminRole.SUPERADMIN)
  create(@Body() dto: CreateSubscriptionDto) {
    return this.subscriptionService.create(dto);
  }

  @Patch('tenant/:tenantId/upgrade')
  @Roles(AdminRole.SUPERADMIN)
  upgrade(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Body() dto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionService.upgrade(tenantId, dto);
  }

  @Get('tenant/:tenantId/usage/:type')
  @Roles(AdminRole.SUPERADMIN, AdminRole.SUPPORT)
  checkUsage(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('type') type: 'exercise' | 'phishing' | 'user',
  ) {
    return this.subscriptionService.checkUsageLimit(tenantId, type);
  }

  @Get('tenant/:tenantId/feature/:feature')
  @Roles(AdminRole.SUPERADMIN, AdminRole.SUPPORT)
  checkFeature(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Param('feature') feature: string,
  ) {
    return this.subscriptionService.checkFeatureAccess(tenantId, feature as any);
  }
}
