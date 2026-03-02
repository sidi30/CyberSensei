import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { M365Connection } from '../../entities/m365-connection.entity';

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

@Injectable()
export class M365TokenService {
  private readonly logger = new Logger(M365TokenService.name);
  private readonly algorithm = 'aes-256-gcm';

  constructor(
    private configService: ConfigService,
    @InjectRepository(M365Connection)
    private connectionRepo: Repository<M365Connection>,
  ) {}

  private getEncryptionKey(): Buffer {
    const keyHex = this.configService.get<string>('M365_TOKEN_ENCRYPTION_KEY');
    if (!keyHex || keyHex.length !== 64) {
      throw new Error('M365_TOKEN_ENCRYPTION_KEY must be 32 bytes (64 hex chars)');
    }
    return Buffer.from(keyHex, 'hex');
  }

  encrypt(plaintext: string): { encrypted: string; iv: string; authTag: string } {
    const key = this.getEncryptionKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag,
    };
  }

  decrypt(encrypted: string, ivHex: string, authTagHex: string): string {
    const key = this.getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  async getValidAccessToken(tenantId: string): Promise<string> {
    const connection = await this.connectionRepo.findOne({
      where: { tenantId, isActive: true },
    });

    if (!connection) {
      throw new Error(`No active M365 connection for tenant ${tenantId}`);
    }

    // Check if token is still valid (with 5 min buffer)
    const bufferMs = 5 * 60 * 1000;
    if (connection.tokenExpiresAt && connection.tokenExpiresAt.getTime() > Date.now() + bufferMs) {
      return this.decrypt(
        connection.accessTokenEncrypted,
        connection.tokenIv,
        connection.tokenAuthTag,
      );
    }

    // Token expired — request a new one using client_credentials
    this.logger.log(`Token expired for tenant ${tenantId}, requesting new one`);
    return this.requestNewToken(connection);
  }

  async requestNewToken(connection: M365Connection): Promise<string> {
    const clientId = this.configService.get<string>('M365_CLIENT_ID');
    const clientSecret = this.configService.get<string>('M365_CLIENT_SECRET');

    const tokenUrl = `https://login.microsoftonline.com/${connection.microsoftTenantId}/oauth2/v2.0/token`;

    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'https://graph.microsoft.com/.default',
      grant_type: 'client_credentials',
    });

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(`Token request failed: ${errorText}`);
      throw new Error(`Failed to get access token: ${response.status}`);
    }

    const data: TokenResponse = await response.json();
    const { encrypted, iv, authTag } = this.encrypt(data.access_token);

    await this.connectionRepo.update(connection.id, {
      accessTokenEncrypted: encrypted,
      tokenIv: iv,
      tokenAuthTag: authTag,
      tokenExpiresAt: new Date(Date.now() + data.expires_in * 1000),
      lastTokenRefreshAt: new Date(),
    });

    this.logger.log(`Token refreshed for tenant ${connection.tenantId}`);
    return data.access_token;
  }
}
