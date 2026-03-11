import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AiConfig } from '../../entities/ai-config.entity';
import { Tenant } from '../../entities/tenant.entity';
import { Exercise } from '../../entities/exercise.entity';
import { ExerciseModule } from '../exercise/exercise.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { AiExerciseController } from './ai-exercise.controller';
import { AiExerciseService } from './ai-exercise.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AiConfig, Tenant, Exercise]),
    ConfigModule,
    ExerciseModule,
    SubscriptionModule,
  ],
  controllers: [AiExerciseController],
  providers: [AiExerciseService],
  exports: [AiExerciseService],
})
export class AiExerciseModule {}
