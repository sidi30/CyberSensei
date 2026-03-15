import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from '../../entities/subscription.entity';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Subscription])],
  controllers: [StripeController],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
