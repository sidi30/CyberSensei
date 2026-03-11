import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PlanGuard } from '../../common/guards/plan.guard';
import { PlanRequired } from '../../common/decorators/plan-required.decorator';
import { PlanType } from '../../entities/subscription.entity';
import { AiExerciseService } from './ai-exercise.service';
import {
  CreateAiConfigDto,
  UpdateAiConfigDto,
  GenerateExercisesDto,
} from './dto/ai-config.dto';

@ApiTags('AI Exercises')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('admin/ai-exercises')
export class AiExerciseController {
  constructor(private readonly aiExerciseService: AiExerciseService) {}

  @Post('config')
  createConfig(@Body() dto: CreateAiConfigDto) {
    return this.aiExerciseService.createConfig(dto);
  }

  @Get('config/:tenantId')
  getConfig(@Param('tenantId', ParseUUIDPipe) tenantId: string) {
    return this.aiExerciseService.getConfig(tenantId);
  }

  @Patch('config/:tenantId')
  updateConfig(
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Body() dto: UpdateAiConfigDto,
  ) {
    return this.aiExerciseService.updateConfig(tenantId, dto);
  }

  @Delete('config/:tenantId')
  deleteConfig(@Param('tenantId', ParseUUIDPipe) tenantId: string) {
    return this.aiExerciseService.deleteConfig(tenantId);
  }

  @Post('config/:tenantId/test')
  testConfig(@Param('tenantId', ParseUUIDPipe) tenantId: string) {
    return this.aiExerciseService.testConfig(tenantId);
  }

  @Post('generate')
  @UseGuards(PlanGuard)
  @PlanRequired(PlanType.BUSINESS)
  async generateExercises(@Body() dto: GenerateExercisesDto) {
    const exercises = await this.aiExerciseService.generateExercises(dto);
    return { generated: exercises.length, exercises };
  }

  @Get('generated')
  getGeneratedExercises() {
    return this.aiExerciseService.findGeneratedExercises();
  }
}
