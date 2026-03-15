import { IsEnum, IsOptional, IsNumber, IsDateString } from 'class-validator';
import {
  PlanType,
  SubscriptionStatus,
} from '../../../entities/subscription.entity';

export class UpdateSubscriptionDto {
  @IsEnum(PlanType)
  @IsOptional()
  plan?: PlanType;

  @IsEnum(SubscriptionStatus)
  @IsOptional()
  status?: SubscriptionStatus;

  @IsNumber()
  @IsOptional()
  monthlyPrice?: number;

  @IsDateString()
  @IsOptional()
  currentPeriodEnd?: string;
}
