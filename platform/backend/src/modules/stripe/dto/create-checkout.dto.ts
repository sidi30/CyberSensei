import { IsString, IsEnum } from 'class-validator';
import { PlanType } from '../../../entities/subscription.entity';

export class CreateCheckoutDto {
  @IsString()
  tenantId: string;

  @IsEnum(PlanType)
  planType: PlanType;
}

export class CreatePortalDto {
  @IsString()
  tenantId: string;
}
