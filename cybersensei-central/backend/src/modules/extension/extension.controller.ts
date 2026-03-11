import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ExtensionService } from './extension.service';
import { ActivateExtensionDto, SubmitExerciseDto, ChatDto } from './dto/activate-extension.dto';

@ApiTags('Extension Chrome/Edge')
@Controller('api/extension')
export class ExtensionController {
  constructor(private readonly extensionService: ExtensionService) {}

  @Public()
  @Post('activate')
  @ApiOperation({ summary: "Activer l'extension avec un code" })
  async activate(@Body() dto: ActivateExtensionDto) {
    return this.extensionService.activate(dto.activationCode);
  }

  @Public()
  @Get('quiz/today')
  @ApiOperation({ summary: 'Récupérer le quiz du jour' })
  async getTodayQuiz(
    @Query('tenantId') tenantId: string,
    @Query('userId') userId: string,
  ) {
    return this.extensionService.getTodayQuiz(tenantId);
  }

  @Public()
  @Post('exercise/:id/submit')
  @ApiOperation({ summary: 'Soumettre les réponses' })
  async submitExercise(
    @Param('id') exerciseId: string,
    @Body() dto: SubmitExerciseDto,
  ) {
    return this.extensionService.submitExercise(
      exerciseId,
      dto.detailsJSON?.answers || [],
      dto.userId,
    );
  }

  @Public()
  @Get('user/progress')
  @ApiOperation({ summary: "Récupérer la progression de l'utilisateur" })
  async getUserProgress(
    @Query('userId') userId: string,
    @Query('tenantId') tenantId: string,
  ) {
    return this.extensionService.getUserProgress(userId, tenantId);
  }

  @Public()
  @Post('ai/chat')
  @ApiOperation({ summary: 'Chat avec le coach IA' })
  async chat(@Body() dto: ChatDto) {
    return this.extensionService.chat(dto.message, dto.context);
  }

  @Public()
  @Get('glossary/search')
  @ApiOperation({ summary: 'Rechercher dans le glossaire' })
  async searchGlossary(
    @Query('term') term: string,
    @Query('tenantId') tenantId: string,
  ) {
    // Le glossaire est côté extension pour l'instant
    // Cet endpoint permet une future migration côté serveur
    return { term, found: false, message: 'Glossaire géré côté extension' };
  }
}
