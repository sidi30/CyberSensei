import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { UpdateMetadata } from '../../entities/update-metadata.entity';
import { Tenant } from '../../entities/tenant.entity';
import { License } from '../../entities/license.entity';
import { UpdateFile, UpdateFileSchema } from './schemas/update-file.schema';
import { UpdateController } from './update.controller';
import { UpdateService } from './update.service';
import { ExerciseModule } from '../exercise/exercise.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UpdateMetadata, Tenant, License]),
    MongooseModule.forFeature([
      { name: UpdateFile.name, schema: UpdateFileSchema },
    ]),
    forwardRef(() => ExerciseModule),
  ],
  controllers: [UpdateController],
  providers: [UpdateService],
  exports: [UpdateService],
})
export class UpdateModule {}
