import { Test, TestingModule } from '@nestjs/testing';
import { AiExerciseController } from './ai-exercise.controller';
import { AiExerciseService } from './ai-exercise.service';
import { AiProvider, GenerationFrequency } from '../../entities/ai-config.entity';
import { ExerciseDifficulty, ExerciseType } from '../../entities/exercise.entity';

describe('AiExerciseController', () => {
  let controller: AiExerciseController;
  let service: jest.Mocked<Partial<AiExerciseService>>;

  const mockConfig = {
    id: 'config-uuid-1',
    tenantId: 'tenant-uuid-1',
    provider: AiProvider.OPENAI,
    encryptedApiKey: '****5678',
    enabled: true,
    generationFrequency: GenerationFrequency.ON_DEMAND,
    lastGeneratedAt: null,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    tenant: null,
  };

  const mockExercise = {
    id: 'exercise-uuid-1',
    topic: 'Phishing',
    type: ExerciseType.QUIZ,
    difficulty: ExerciseDifficulty.INTERMEDIATE,
    payloadJSON: { courseIntro: 'Test', questions: [] },
    version: '1.0.0',
    active: true,
    description: 'AI-generated exercise: Phishing',
    tags: 'ai-generated,phishing',
    generatedByAi: true,
    tenantId: 'tenant-uuid-1',
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  beforeEach(async () => {
    service = {
      createConfig: jest.fn(),
      getConfig: jest.fn(),
      updateConfig: jest.fn(),
      deleteConfig: jest.fn(),
      testConfig: jest.fn(),
      generateExercises: jest.fn(),
      findGeneratedExercises: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiExerciseController],
      providers: [
        {
          provide: AiExerciseService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<AiExerciseController>(AiExerciseController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /config - createConfig', () => {
    it('should create an AI config', async () => {
      const dto = {
        tenantId: 'tenant-uuid-1',
        provider: AiProvider.OPENAI,
        apiKey: 'sk-test-key',
        enabled: true,
        generationFrequency: GenerationFrequency.ON_DEMAND,
      };

      service.createConfig.mockResolvedValue(mockConfig as any);

      const result = await controller.createConfig(dto);

      expect(result).toEqual(mockConfig);
      expect(service.createConfig).toHaveBeenCalledWith(dto);
    });
  });

  describe('GET /config/:tenantId - getConfig', () => {
    it('should return the AI config for a tenant', async () => {
      service.getConfig.mockResolvedValue(mockConfig as any);

      const result = await controller.getConfig('tenant-uuid-1');

      expect(result).toEqual(mockConfig);
      expect(service.getConfig).toHaveBeenCalledWith('tenant-uuid-1');
    });
  });

  describe('PATCH /config/:tenantId - updateConfig', () => {
    it('should update the AI config', async () => {
      const dto = { enabled: false };
      const updatedConfig = { ...mockConfig, enabled: false };
      service.updateConfig.mockResolvedValue(updatedConfig as any);

      const result = await controller.updateConfig('tenant-uuid-1', dto);

      expect(result).toEqual(updatedConfig);
      expect(service.updateConfig).toHaveBeenCalledWith('tenant-uuid-1', dto);
    });
  });

  describe('DELETE /config/:tenantId - deleteConfig', () => {
    it('should delete the AI config', async () => {
      service.deleteConfig.mockResolvedValue(undefined);

      await controller.deleteConfig('tenant-uuid-1');

      expect(service.deleteConfig).toHaveBeenCalledWith('tenant-uuid-1');
    });
  });

  describe('POST /config/:tenantId/test - testConfig', () => {
    it('should test the AI config and return success', async () => {
      const testResult = { success: true, message: 'API key is valid and working' };
      service.testConfig.mockResolvedValue(testResult);

      const result = await controller.testConfig('tenant-uuid-1');

      expect(result).toEqual(testResult);
      expect(service.testConfig).toHaveBeenCalledWith('tenant-uuid-1');
    });

    it('should test the AI config and return failure', async () => {
      const testResult = { success: false, message: 'API key test failed: Unauthorized' };
      service.testConfig.mockResolvedValue(testResult);

      const result = await controller.testConfig('tenant-uuid-1');

      expect(result).toEqual(testResult);
    });
  });

  describe('POST /generate - generateExercises', () => {
    it('should generate exercises and return wrapped response', async () => {
      const dto = {
        tenantId: 'tenant-uuid-1',
        topics: ['Phishing'],
        difficulty: ExerciseDifficulty.INTERMEDIATE,
        count: 5,
      };

      service.generateExercises.mockResolvedValue([mockExercise as any]);

      const result = await controller.generateExercises(dto);

      expect(result).toEqual({ generated: 1, exercises: [mockExercise] });
      expect(service.generateExercises).toHaveBeenCalledWith(dto);
    });

    it('should return generated: 0 when no exercises generated', async () => {
      const dto = { tenantId: 'tenant-uuid-1' };

      service.generateExercises.mockResolvedValue([]);

      const result = await controller.generateExercises(dto);

      expect(result).toEqual({ generated: 0, exercises: [] });
      expect(service.generateExercises).toHaveBeenCalledWith(dto);
    });
  });

  describe('GET /generated - getGeneratedExercises', () => {
    it('should return all AI-generated exercises', async () => {
      service.findGeneratedExercises.mockResolvedValue([mockExercise as any]);

      const result = await controller.getGeneratedExercises();

      expect(result).toEqual([mockExercise]);
      expect(service.findGeneratedExercises).toHaveBeenCalled();
    });

    it('should return empty array when no generated exercises exist', async () => {
      service.findGeneratedExercises.mockResolvedValue([]);

      const result = await controller.getGeneratedExercises();

      expect(result).toEqual([]);
    });
  });
});
