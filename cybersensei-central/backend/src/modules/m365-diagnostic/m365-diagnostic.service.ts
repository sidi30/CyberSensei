import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import * as crypto from 'crypto';
import {
  M365DiagnosticSession,
  DiagnosticStatus,
} from '../../entities/m365-diagnostic-session.entity';

@Injectable()
export class M365DiagnosticService {
  private readonly logger = new Logger(M365DiagnosticService.name);
  private readonly ipLimits = new Map<string, { count: number; resetAt: number }>();

  constructor(
    private configService: ConfigService,
    @InjectRepository(M365DiagnosticSession)
    private sessionRepo: Repository<M365DiagnosticSession>,
  ) {}

  async startDiagnostic(
    email: string,
    companyName: string,
    ipAddress: string,
  ): Promise<{ sessionToken: string; authUrl: string }> {
    // Rate limit: 3 per IP per day
    this.checkIpRateLimit(ipAddress);

    const sessionToken = crypto.randomBytes(32).toString('hex');
    const shareToken = crypto.randomBytes(16).toString('hex');

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    const session = this.sessionRepo.create({
      sessionToken,
      shareToken,
      email,
      companyName,
      ipAddress,
      status: DiagnosticStatus.PENDING,
      expiresAt,
    });

    await this.sessionRepo.save(session);

    // Generate Microsoft OAuth URL
    const clientId = this.configService.get<string>('M365_CLIENT_ID');
    const redirectUri = this.configService.get<string>(
      'M365_DIAGNOSTIC_REDIRECT_URI',
      this.configService.get<string>('M365_REDIRECT_URI'),
    );

    const state = Buffer.from(
      JSON.stringify({ sessionToken, type: 'diagnostic' }),
    ).toString('base64url');

    const scopes = [
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
      'https://graph.microsoft.com/Domain.Read.All',
      'https://graph.microsoft.com/Organization.Read.All',
    ];

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      state,
      scope: scopes.join(' '),
    });

    const authUrl = `https://login.microsoftonline.com/common/adminconsent?${params.toString()}`;

    this.logger.log(`Diagnostic session started for ${email} (${companyName})`);

    return { sessionToken, authUrl };
  }

  async handleCallback(
    sessionToken: string,
    adminConsent: string,
    tenantId: string,
  ): Promise<void> {
    const session = await this.findByToken(sessionToken);

    if (adminConsent !== 'True') {
      session.status = DiagnosticStatus.FAILED;
      await this.sessionRepo.save(session);
      throw new BadRequestException('Consentement administrateur refusé');
    }

    session.status = DiagnosticStatus.CONNECTING;
    session.tenantDomain = tenantId;
    await this.sessionRepo.save(session);

    // Token exchange and scanning would be triggered here
    // Using existing M365ScanService collectors
    this.logger.log(`Diagnostic callback received for session ${sessionToken}`);
  }

  async getStatus(sessionToken: string): Promise<{
    status: DiagnosticStatus;
    progress?: number;
  }> {
    const session = await this.findByToken(sessionToken);

    let progress: number | undefined;
    switch (session.status) {
      case DiagnosticStatus.PENDING:
        progress = 0;
        break;
      case DiagnosticStatus.CONNECTING:
        progress = 10;
        break;
      case DiagnosticStatus.SCANNING:
        progress = 50;
        break;
      case DiagnosticStatus.COMPLETED:
        progress = 100;
        break;
    }

    return { status: session.status, progress };
  }

  async getResults(sessionToken: string): Promise<{
    globalScore: number;
    grade: string;
    categoryScores: any;
    criticalFindings: any;
    totalFindings: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
  }> {
    const session = await this.findByToken(sessionToken);

    if (session.status !== DiagnosticStatus.COMPLETED) {
      throw new BadRequestException('Le diagnostic n\'est pas encore terminé');
    }

    return {
      globalScore: session.globalScore,
      grade: session.grade,
      categoryScores: session.categoryScores,
      criticalFindings: session.criticalFindings, // Only top 3
      totalFindings: session.totalFindings,
      criticalCount: session.criticalCount,
      highCount: session.highCount,
      mediumCount: session.mediumCount,
    };
  }

  async requestFullReport(
    sessionToken: string,
    email: string,
    companyName: string,
    phone?: string,
  ): Promise<{ message: string }> {
    const session = await this.findByToken(sessionToken);

    session.email = email;
    session.companyName = companyName;
    session.phone = phone || session.phone;
    session.reportRequested = true;
    await this.sessionRepo.save(session);

    this.logger.log(
      `Full report requested by ${email} for session ${sessionToken}`,
    );

    return {
      message:
        'Votre demande de rapport complet a été enregistrée. Vous serez contacté sous 24h.',
    };
  }

  private async findByToken(sessionToken: string): Promise<M365DiagnosticSession> {
    const session = await this.sessionRepo.findOne({ where: { sessionToken } });

    if (!session) {
      throw new NotFoundException('Session de diagnostic introuvable');
    }

    if (new Date() > session.expiresAt) {
      session.status = DiagnosticStatus.EXPIRED;
      await this.sessionRepo.save(session);
      throw new BadRequestException('Cette session de diagnostic a expiré');
    }

    return session;
  }

  private checkIpRateLimit(ipAddress: string): void {
    const now = Date.now();
    const limit = this.ipLimits.get(ipAddress);

    if (limit && now < limit.resetAt) {
      if (limit.count >= 3) {
        throw new BadRequestException(
          'Limite de 3 diagnostics par jour atteinte. Réessayez demain.',
        );
      }
      limit.count++;
    } else {
      this.ipLimits.set(ipAddress, {
        count: 1,
        resetAt: now + 24 * 60 * 60 * 1000,
      });
    }
  }

  // Clean up expired sessions every hour
  @Cron('0 * * * *')
  async cleanupExpiredSessions(): Promise<void> {
    const result = await this.sessionRepo.delete({
      expiresAt: LessThan(new Date()),
    });
    if (result.affected > 0) {
      this.logger.log(`Cleaned up ${result.affected} expired diagnostic sessions`);
    }
  }
}
