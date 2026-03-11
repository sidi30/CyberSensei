import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { M365Connection } from '../../entities/m365-connection.entity';
import { Tenant } from '../../entities/tenant.entity';
import { M365AuthController } from './m365-auth.controller';
import { M365AuthService } from './m365-auth.service';
import { M365TokenService } from './m365-token.service';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([M365Connection, Tenant])],
  controllers: [M365AuthController],
  providers: [M365AuthService, M365TokenService],
  exports: [M365AuthService, M365TokenService],
})
export class M365AuthModule {}
