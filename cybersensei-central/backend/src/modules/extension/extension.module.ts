import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Tenant } from '../../entities/tenant.entity';
import { License } from '../../entities/license.entity';
import { Exercise } from '../../entities/exercise.entity';
import { ExtensionController } from './extension.controller';
import { ExtensionService } from './extension.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Tenant, License, Exercise]),
    ConfigModule,
  ],
  controllers: [ExtensionController],
  providers: [ExtensionService],
  exports: [ExtensionService],
})
export class ExtensionModule {}
