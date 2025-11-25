import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UploadUpdateDto {
  @ApiProperty({ 
    type: 'string', 
    format: 'binary', 
    description: 'Fichier ZIP de mise à jour (doit contenir version.json)' 
  })
  file: any;

  @ApiProperty({ 
    example: 'sha256:a1b2c3d4e5f6...', 
    required: false,
    description: 'Checksum SHA-256 du fichier (optionnel, sera calculé si absent)' 
  })
  @IsString()
  @IsOptional()
  checksum?: string;
}
