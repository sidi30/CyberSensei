import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { ExerciseService, ExerciseExportPayload } from './exercise.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { Exercise, ExerciseDifficulty } from '../../entities/exercise.entity';
import { JwtAuthGuard } from '../admin-auth/strategies/jwt.strategy';

@Controller('admin/exercises')
@UseGuards(JwtAuthGuard)
export class ExerciseController {
  private readonly logger = new Logger(ExerciseController.name);

  constructor(private readonly exerciseService: ExerciseService) {}

  @Post()
  async create(@Body() createExerciseDto: CreateExerciseDto): Promise<Exercise> {
    this.logger.log(`Creating exercise: ${createExerciseDto.topic}`);
    return await this.exerciseService.create(createExerciseDto);
  }

  @Post('bulk')
  async bulkCreate(@Body() exercises: CreateExerciseDto[]): Promise<Exercise[]> {
    this.logger.log(`Bulk creating ${exercises.length} exercises`);
    return await this.exerciseService.bulkCreate(exercises);
  }

  @Get()
  async findAll(
    @Query('active') active?: string,
    @Query('topic') topic?: string,
    @Query('difficulty') difficulty?: string,
  ): Promise<Exercise[]> {
    if (topic) {
      return await this.exerciseService.findByTopic(topic);
    }
    if (difficulty) {
      return await this.exerciseService.findByDifficulty(
        difficulty as ExerciseDifficulty,
      );
    }
    if (active === 'true') {
      return await this.exerciseService.findActive();
    }
    return await this.exerciseService.findAll();
  }

  @Get('stats')
  async getStats() {
    return await this.exerciseService.getStats();
  }

  @Get('export')
  async exportForSync(
    @Query('includeInactive') includeInactive?: string,
  ): Promise<ExerciseExportPayload> {
    this.logger.log('Exporting exercises for sync');
    return await this.exerciseService.exportForSync(includeInactive === 'true');
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Exercise> {
    return await this.exerciseService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateExerciseDto: UpdateExerciseDto,
  ): Promise<Exercise> {
    this.logger.log(`Updating exercise: ${id}`);
    return await this.exerciseService.update(id, updateExerciseDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    this.logger.log(`Deleting exercise: ${id}`);
    await this.exerciseService.remove(id);
    return { message: `Exercise ${id} deleted successfully` };
  }

  @Put(':id/deactivate')
  async deactivate(@Param('id') id: string): Promise<Exercise> {
    this.logger.log(`Deactivating exercise: ${id}`);
    return await this.exerciseService.softDelete(id);
  }
}
