import { Controller, Get, Delete, Param, Query, Res, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { M365AuthService } from './m365-auth.service';

@ApiTags('M365 Auth')
@Controller('m365/auth')
export class M365AuthController {
  private readonly logger = new Logger(M365AuthController.name);

  constructor(private readonly authService: M365AuthService) {}

  @Get('connect/:tenantId')
  @ApiOperation({ summary: 'Initiate M365 OAuth connection for a tenant' })
  @ApiResponse({ status: 302, description: 'Redirect to Microsoft login' })
  connect(
    @Param('tenantId') tenantId: string,
    @Query('adminEmail') adminEmail: string,
    @Res() res: Response,
  ) {
    this.logger.log(`Initiating M365 OAuth for tenant ${tenantId}`);
    const authUrl = this.authService.generateAuthUrl(tenantId, adminEmail);
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

      // Redirect to dashboard with success
      const dashboardUrl = `http://localhost:5174/settings?connected=true&domain=${connection.microsoftTenantDomain || ''}`;
      return res.redirect(dashboardUrl);
    } catch (err) {
      this.logger.error('OAuth callback failed', err);
      const dashboardUrl = `http://localhost:5174/settings?error=${encodeURIComponent(err.message)}`;
      return res.redirect(dashboardUrl);
    }
  }

  @Get('status/:tenantId')
  @ApiOperation({ summary: 'Get M365 connection status for a tenant' })
  @ApiResponse({ status: 200, description: 'Connection status' })
  async getStatus(@Param('tenantId') tenantId: string) {
    return this.authService.getConnectionStatus(tenantId);
  }

  @Delete('disconnect/:tenantId')
  @ApiOperation({ summary: 'Disconnect M365 for a tenant' })
  @ApiResponse({ status: 200, description: 'Disconnected' })
  async disconnect(@Param('tenantId') tenantId: string) {
    await this.authService.disconnect(tenantId);
    return { message: 'M365 disconnected successfully' };
  }
}
