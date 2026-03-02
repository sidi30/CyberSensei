import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { M365Connection } from '../../entities/m365-connection.entity';
import { M365TokenService } from './m365-token.service';

interface OAuthState {
  tenantId: string;
  nonce: string;
  adminEmail?: string;
}

@Injectable()
export class M365AuthService {
  private readonly logger = new Logger(M365AuthService.name);
  // In-memory state store (short-lived, for CSRF protection)
  private pendingStates = new Map<string, { state: OAuthState; expiresAt: number }>();

  constructor(
    private configService: ConfigService,
    @InjectRepository(M365Connection)
    private connectionRepo: Repository<M365Connection>,
    private tokenService: M365TokenService,
  ) {}

  private get graphPermissions(): string[] {
    return [
      'https://graph.microsoft.com/User.Read.All',
      'https://graph.microsoft.com/UserAuthenticationMethod.Read.All',
      'https://graph.microsoft.com/Directory.Read.All',
      'https://graph.microsoft.com/RoleManagement.Read.Directory',
      'https://graph.microsoft.com/Mail.Read',
      'https://graph.microsoft.com/MailboxSettings.Read',
      'https://graph.microsoft.com/Sites.Read.All',
      'https://graph.microsoft.com/Application.Read.All',
      'https://graph.microsoft.com/Policy.Read.All',
      'https://graph.microsoft.com/AuditLog.Read.All',
      'https://graph.microsoft.com/SecurityEvents.Read.All',
      'https://graph.microsoft.com/Domain.Read.All',
      'https://graph.microsoft.com/Organization.Read.All',
      'https://graph.microsoft.com/Reports.Read.All',
    ];
  }

  generateAuthUrl(tenantId: string, adminEmail?: string): string {
    const clientId = this.configService.get<string>('M365_CLIENT_ID');
    const redirectUri = this.configService.get<string>('M365_REDIRECT_URI');

    const stateData: OAuthState = {
      tenantId,
      nonce: crypto.randomBytes(16).toString('hex'),
      adminEmail,
    };

    const stateStr = Buffer.from(JSON.stringify(stateData)).toString('base64url');

    // Store state for verification (expires in 10 minutes)
    this.pendingStates.set(stateStr, {
      state: stateData,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    // Clean up expired states
    this.cleanupExpiredStates();

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      state: stateStr,
      scope: this.graphPermissions.join(' '),
    });

    // Admin Consent endpoint — requests application permissions
    return `https://login.microsoftonline.com/common/adminconsent?${params.toString()}`;
  }

  async handleCallback(
    adminConsent: string,
    microsoftTenantId: string,
    stateStr: string,
    error?: string,
    errorDescription?: string,
  ): Promise<M365Connection> {
    if (error) {
      this.logger.error(`OAuth error: ${error} - ${errorDescription}`);
      throw new BadRequestException(`Microsoft OAuth error: ${errorDescription || error}`);
    }

    // Verify state
    const pending = this.pendingStates.get(stateStr);
    if (!pending) {
      throw new BadRequestException('Invalid or expired OAuth state');
    }

    if (pending.expiresAt < Date.now()) {
      this.pendingStates.delete(stateStr);
      throw new BadRequestException('OAuth state expired');
    }

    const { state } = pending;
    this.pendingStates.delete(stateStr);

    if (adminConsent !== 'True') {
      throw new BadRequestException('Admin consent was not granted');
    }

    // Admin consent granted — now get an access token using client_credentials
    const clientId = this.configService.get<string>('M365_CLIENT_ID');
    const clientSecret = this.configService.get<string>('M365_CLIENT_SECRET');

    const tokenUrl = `https://login.microsoftonline.com/${microsoftTenantId}/oauth2/v2.0/token`;
    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'https://graph.microsoft.com/.default',
      grant_type: 'client_credentials',
    });

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      this.logger.error(`Token acquisition failed: ${errText}`);
      throw new BadRequestException('Failed to acquire access token from Microsoft');
    }

    const tokenData = await tokenResponse.json();
    const { encrypted, iv, authTag } = this.tokenService.encrypt(tokenData.access_token);

    // Fetch tenant domain from Graph API
    let tenantDomain: string | null = null;
    try {
      const orgResponse = await fetch('https://graph.microsoft.com/v1.0/organization', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      if (orgResponse.ok) {
        const orgData = await orgResponse.json();
        tenantDomain = orgData.value?.[0]?.verifiedDomains?.find((d: any) => d.isDefault)?.name || null;
      }
    } catch (e) {
      this.logger.warn('Could not fetch tenant domain', e);
    }

    // Upsert connection
    let connection = await this.connectionRepo.findOne({
      where: { tenantId: state.tenantId },
    });

    if (connection) {
      connection.accessTokenEncrypted = encrypted;
      connection.tokenIv = iv;
      connection.tokenAuthTag = authTag;
      connection.tokenExpiresAt = new Date(Date.now() + tokenData.expires_in * 1000);
      connection.microsoftTenantId = microsoftTenantId;
      connection.microsoftTenantDomain = tenantDomain;
      connection.grantedScopes = this.graphPermissions.join(' ');
      connection.connectedByEmail = state.adminEmail;
      connection.isActive = true;
      connection.lastTokenRefreshAt = new Date();
    } else {
      connection = this.connectionRepo.create({
        tenantId: state.tenantId,
        accessTokenEncrypted: encrypted,
        tokenIv: iv,
        tokenAuthTag: authTag,
        tokenExpiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
        microsoftTenantId,
        microsoftTenantDomain: tenantDomain,
        grantedScopes: this.graphPermissions.join(' '),
        connectedByEmail: state.adminEmail,
        isActive: true,
        lastTokenRefreshAt: new Date(),
      });
    }

    const saved = await this.connectionRepo.save(connection);
    this.logger.log(`M365 connection established for tenant ${state.tenantId} (Microsoft tenant: ${microsoftTenantId})`);
    return saved;
  }

  async getConnectionStatus(tenantId: string): Promise<{
    connected: boolean;
    microsoftTenantDomain?: string;
    connectedByEmail?: string;
    lastScanAt?: Date;
    tokenValid?: boolean;
  }> {
    const connection = await this.connectionRepo.findOne({
      where: { tenantId, isActive: true },
    });

    if (!connection) {
      return { connected: false };
    }

    return {
      connected: true,
      microsoftTenantDomain: connection.microsoftTenantDomain,
      connectedByEmail: connection.connectedByEmail,
      lastScanAt: connection.lastScanAt,
      tokenValid: connection.tokenExpiresAt ? connection.tokenExpiresAt.getTime() > Date.now() : false,
    };
  }

  async disconnect(tenantId: string): Promise<void> {
    const connection = await this.connectionRepo.findOne({
      where: { tenantId, isActive: true },
    });

    if (!connection) {
      throw new NotFoundException(`No active M365 connection for tenant ${tenantId}`);
    }

    connection.isActive = false;
    connection.accessTokenEncrypted = '';
    connection.tokenIv = '';
    connection.tokenAuthTag = '';
    connection.tokenExpiresAt = null;
    await this.connectionRepo.save(connection);

    this.logger.log(`M365 disconnected for tenant ${tenantId}`);
  }

  private cleanupExpiredStates(): void {
    const now = Date.now();
    for (const [key, entry] of this.pendingStates) {
      if (entry.expiresAt < now) {
        this.pendingStates.delete(key);
      }
    }
  }
}
