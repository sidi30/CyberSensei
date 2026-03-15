import { IsEnum, IsOptional, IsUUID, IsNumber } from 'class-validator';
import { PlanType } from '../../../entities/subscription.entity';

export class CreateSubscriptionDto {
  @IsUUID()
  tenantId: string;

  @IsEnum(PlanType)
  @IsOptional()
  plan?: PlanType = PlanType.FREE;

  @IsNumber()
  @IsOptional()
  monthlyPrice?: number;
}
