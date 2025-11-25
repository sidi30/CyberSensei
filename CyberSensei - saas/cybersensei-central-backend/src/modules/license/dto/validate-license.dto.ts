import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ValidateLicenseDto {
  @ApiProperty({ example: 'XXXXXXXX-XXXXXXXX-XXXXXXXX-XXXXXXXX' })
  @IsString()
  @IsNotEmpty()
  key: string;
}

