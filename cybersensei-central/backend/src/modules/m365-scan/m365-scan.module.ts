import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { M365Scan } from '../../entities/m365-scan.entity';
import { M365Finding } from '../../entities/m365-finding.entity';
import { M365Connection } from '../../entities/m365-connection.entity';
import { M365AuthModule } from '../m365-auth/m365-auth.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { M365ScanController } from './m365-scan.controller';
import { M365ScanService } from './m365-scan.service';
import { MfaCollector } from './collectors/mfa-collector';
import { AdminRolesCollector } from './collectors/admin-roles-collector';
import { EmailForwardingCollector } from './collectors/email-forwarding-collector';
import { SharingCollector } from './collectors/sharing-collector';
import { EmailSecurityCollector } from './collectors/email-security-collector';
import { OAuthAppsCollector } from './collectors/oauth-apps-collector';
import { PasswordPolicyCollector } from './collectors/password-policy-collector';
import { ConditionalAccessCollector } from './collectors/conditional-access-collector';
import { MailboxCollector } from './collectors/mailbox-collector';
import { SignInCollector } from './collectors/sign-in-collector';

@Module({
  imports: [
    TypeOrmModule.forFeature([M365Scan, M365Finding, M365Connection]),
    M365AuthModule,
    SubscriptionModule,
  ],
  controllers: [M365ScanController],
  providers: [
    M365ScanService,
    MfaCollector,
    AdminRolesCollector,
    EmailForwardingCollector,
    SharingCollector,
    EmailSecurityCollector,
    OAuthAppsCollector,
    PasswordPolicyCollector,
    ConditionalAccessCollector,
    MailboxCollector,
    SignInCollector,
  ],
  exports: [M365ScanService],
})
export class M365ScanModule {}
