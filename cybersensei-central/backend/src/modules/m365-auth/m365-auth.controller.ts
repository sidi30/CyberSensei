import { Controller, Get, Delete, Param, Query, Res, Logger, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { M365AuthService } from './m365-auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('M365 Auth')
@Controller('m365/auth')
export class M365AuthController {
  private readonly logger = new Logger(M365AuthController.name);
  private readonly dashboardUrl: string;

  constructor(
    private readonly authService: M365AuthService,
    private readonly configService: ConfigService,
  ) {
    this.dashboardUrl = this.configService.get<string>(
      'M365_DASHBOARD_URL',
      'http://localhost:5174',
    );
  }

  @Get('connect/:tenantId')
  @Public()
  @ApiOperation({ summary: 'Initiate M365 OAuth connection for a tenant (public - browser redirect)' })
  @ApiResponse({ status: 302, description: 'Redirect to Microsoft login' })
  async connect(
    @Param('tenantId') tenantId: string,
    @Query('adminEmail') adminEmail: string,
    @Res() res: Response,
  ) {
    this.logger.log(`Initiating M365 OAuth for tenant ${tenantId}`);
    const authUrl = await this.authService.generateAuthUrl(tenantId, adminEmail);
    return res.redirect(authUrl);
  }

  @Get('callback')
  @ApiOperation({ summary: 'Handle Microsoft OAuth callback' })
  @ApiResponse({ status: 200, description: 'Connection established' })
  async callback(
    @Query('admin_consent') adminConsent: string,
    @Query('tenant') microsoftTenantId: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Query('error_description') errorDescription: string,
    @Res() res: Response,
  ) {
    try {
      const connection = await this.authService.handleCallback(
        adminConsent,
        microsoftTenantId,
        state,
        error,
        errorDescription,
      );

      const redirectUrl = `${this.dashboardUrl}/settings?connected=true&domain=${encodeURIComponent(connection.microsoftTenantDomain || '')}`;
      return res.redirect(redirectUrl);
    } catch (err) {
      this.logger.error('OAuth callback failed', err);
      const redirectUrl = `${this.dashboardUrl}/settings?error=${encodeURIComponent(err.message)}`;
      return res.redirect(redirectUrl);
    }
  }

  @Get('status/:tenantId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get M365 connection status for a tenant' })
  @ApiResponse({ status: 200, description: 'Connection status' })
  async getStatus(@Param('tenantId') tenantId: string) {
    return this.authService.getConnectionStatus(tenantId);
  }

  @Delete('disconnect/:tenantId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Disconnect M365 for a tenant' })
  @ApiResponse({ status: 200, description: 'Disconnected' })
  async disconnect(@Param('tenantId') tenantId: string) {
    await this.authService.disconnect(tenantId);
    return { message: 'M365 disconnected successfully' };
  }
}
