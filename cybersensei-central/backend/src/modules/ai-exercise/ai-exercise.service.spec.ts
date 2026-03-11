import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import {
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { AiExerciseService } from './ai-exercise.service';
import { AiConfig, AiProvider, GenerationFrequency } from '../../entities/ai-config.entity';
import { Tenant } from '../../entities/tenant.entity';
import { Exercise, ExerciseDifficulty, ExerciseType } from '../../entities/exercise.entity';
import { ExerciseService } from '../exercise/exercise.service';
import { encrypt, decrypt } from './utils/encryption.util';

// Mock the external AI SDKs
jest.mock('openai', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      models: { list: jest.fn().mockResolvedValue({ data: [] }) },
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: JSON.stringify({
                    courseIntro: 'Test intro',
                    questions: [
                      {
                        id: 'q1',
                        context: 'Test context',
                        text: 'Test question?',
                        options: ['A', 'B', 'C', 'D'],
                        correctAnswer: 0,
                        feedbackCorrect: 'Correct!',
                        feedbackIncorrect: 'Wrong!',
                        advice: {
                          concept: 'Test concept',
                          example: 'Test example',
                          advice: ['Advice 1'],
                        },
                        keyTakeaway: 'Key takeaway',
                      },
                    ],
                  }),
                },
              },
            ],
          }),
        },
      },
    })),
  };
});

jest.mock('@anthropic-ai/sdk', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      messages: {
        create: jest.fn().mockResolvedValue({
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                courseIntro: 'Test intro',
                questions: [
                  {
                    id: 'q1',
                    context: 'Test context',
                    text: 'Test question?',
                    options: ['A', 'B', 'C', 'D'],
                    correctAnswer: 0,
                    feedbackCorrect: 'Correct!',
                    feedbackIncorrect: 'Wrong!',
                    advice: {
                      concept: 'Test concept',
                      example: 'Test example',
                      advice: ['Advice 1'],
                    },
                    keyTakeaway: 'Key takeaway',
                  },
                ],
              }),
            },
          ],
        }),
      },
    })),
  };
});

const ENCRYPTION_SECRET = 'test-encryption-secret-for-unit-tests';

describe('AiExerciseService', () => {
  let service: AiExerciseService;
  let aiConfigRepository: jest.Mocked<Partial<Repository<AiConfig>>>;
  let tenantRepository: jest.Mocked<Partial<Repository<Tenant>>>;
  let exerciseRepository: jest.Mocked<Partial<Repository<Exercise>>>;
  let exerciseService: jest.Mocked<Partial<ExerciseService>>;
  let configService: jest.Mocked<Partial<ConfigService>>;

  const mockTenant: Tenant = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Tenant',
    contactEmail: 'tenant@test.com',
    licenseKey: 'ABCD-1234-EFGH-5678',
    activationCode: 'ACT-TEST-1234',
    active: true,
    companyName: 'Test Corp',
    address: '123 Test St',
    phone: '+1234567890',
    sector: null,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    licenses: [],
    metrics: [],
  };

  const encryptedKey = encrypt('sk-test-api-key-12345', ENCRYPTION_SECRET);

  const mockAiConfig: AiConfig = {
    id: 'config-uuid-1',
    tenantId: mockTenant.id,
    provider: AiProvider.OPENAI,
    encryptedApiKey: encryptedKey,
    enabled: true,
    generationFrequency: GenerationFrequency.ON_DEMAND,
    lastGeneratedAt: null,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    tenant: mockTenant,
  };

  const mockExercise: Exercise = {
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
    tenantId: mockTenant.id,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  beforeEach(async () => {
    aiConfigRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    tenantRepository = {
      findOne: jest.fn(),
    };

    exerciseRepository = {
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    exerciseService = {};

    configService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'AI_KEY_ENCRYPTION_SECRET') return ENCRYPTION_SECRET;
        if (key === 'JWT_SECRET') return 'jwt-secret-fallback';
        return undefined;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiExerciseService,
        {
          provide: getRepositoryToken(AiConfig),
          useValue: aiConfigRepository,
        },
        {
          provide: getRepositoryToken(Tenant),
          useValue: tenantRepository,
        },
        {
          provide: getRepositoryToken(Exercise),
          useValue: exerciseRepository,
        },
        {
          provide: ExerciseService,
          useValue: exerciseService,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    service = module.get<AiExerciseService>(AiExerciseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ──── Encryption utility tests ────

  describe('encryption/decryption', () => {
    it('should encrypt and decrypt text correctly', () => {
      const plainText = 'sk-my-secret-api-key';
      const encrypted = encrypt(plainText, ENCRYPTION_SECRET);
      const decrypted = decrypt(encrypted, ENCRYPTION_SECRET);

      expect(decrypted).toBe(plainText);
    });

    it('should produce different ciphertext for each encryption (random IV)', () => {
      const plainText = 'sk-my-secret-api-key';
      const encrypted1 = encrypt(plainText, ENCRYPTION_SECRET);
      const encrypted2 = encrypt(plainText, ENCRYPTION_SECRET);

      expect(encrypted1).not.toBe(encrypted2);

      // But both decrypt to the same value
      expect(decrypt(encrypted1, ENCRYPTION_SECRET)).toBe(plainText);
      expect(decrypt(encrypted2, ENCRYPTION_SECRET)).toBe(plainText);
    });

    it('should throw on invalid encrypted text format', () => {
      expect(() => decrypt('invalid-text', ENCRYPTION_SECRET)).toThrow(
        'Invalid encrypted text format',
      );
    });

    it('should throw on wrong secret', () => {
      const encrypted = encrypt('test', ENCRYPTION_SECRET);
      expect(() => decrypt(encrypted, 'wrong-secret')).toThrow();
    });
  });

  // ──── Config CRUD ────

  describe('createConfig', () => {
    const createDto = {
      tenantId: mockTenant.id,
      provider: AiProvider.OPENAI,
      apiKey: 'sk-test-api-key-12345',
      enabled: true,
      generationFrequency: GenerationFrequency.ON_DEMAND,
    };

    it('should create an AI config for a valid tenant', async () => {
      tenantRepository.findOne.mockResolvedValue(mockTenant);
      aiConfigRepository.findOne.mockResolvedValue(null);
      aiConfigRepository.create.mockReturnValue({ ...mockAiConfig });
      aiConfigRepository.save.mockResolvedValue({ ...mockAiConfig });

      const result = await service.createConfig(createDto);

      expect(result).toBeDefined();
      expect((result as any).maskedApiKey).toMatch(/^\*{4}/); // masked
      expect(result).not.toHaveProperty('encryptedApiKey', expect.stringContaining(':'));
      expect(tenantRepository.findOne).toHaveBeenCalledWith({
        where: { id: createDto.tenantId },
      });
      expect(aiConfigRepository.findOne).toHaveBeenCalledWith({
        where: { tenantId: createDto.tenantId },
      });
      expect(aiConfigRepository.create).toHaveBeenCalled();
      expect(aiConfigRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if tenant does not exist', async () => {
      tenantRepository.findOne.mockResolvedValue(null);

      await expect(service.createConfig(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if config already exists', async () => {
      tenantRepository.findOne.mockResolvedValue(mockTenant);
      aiConfigRepository.findOne.mockResolvedValue(mockAiConfig);

      await expect(service.createConfig(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getConfig', () => {
    it('should return the config with masked API key', async () => {
      aiConfigRepository.findOne.mockResolvedValue({ ...mockAiConfig });

      const result = await service.getConfig(mockTenant.id);

      expect(result).toBeDefined();
      expect((result as any).maskedApiKey).toMatch(/^\*{4}/);
      expect(result).not.toHaveProperty('encryptedApiKey', expect.stringContaining(':'));
    });

    it('should throw NotFoundException if config does not exist', async () => {
      aiConfigRepository.findOne.mockResolvedValue(null);

      await expect(service.getConfig('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateConfig', () => {
    it('should update provider', async () => {
      const configCopy = { ...mockAiConfig };
      aiConfigRepository.findOne.mockResolvedValue(configCopy);
      aiConfigRepository.save.mockResolvedValue({
        ...configCopy,
        provider: AiProvider.ANTHROPIC,
      });

      const result = await service.updateConfig(mockTenant.id, {
        provider: AiProvider.ANTHROPIC,
      });

      expect(result).toBeDefined();
      expect(aiConfigRepository.save).toHaveBeenCalled();
    });

    it('should update API key (re-encrypt)', async () => {
      const configCopy = { ...mockAiConfig };
      aiConfigRepository.findOne.mockResolvedValue(configCopy);
      aiConfigRepository.save.mockImplementation(async (entity) => entity as AiConfig);

      await service.updateConfig(mockTenant.id, {
        apiKey: 'sk-new-key',
      });

      // The config should have a new encrypted key
      expect(configCopy.encryptedApiKey).not.toBe(mockAiConfig.encryptedApiKey);
      expect(aiConfigRepository.save).toHaveBeenCalled();
    });

    it('should update enabled flag', async () => {
      const configCopy = { ...mockAiConfig, enabled: true };
      aiConfigRepository.findOne.mockResolvedValue(configCopy);
      aiConfigRepository.save.mockImplementation(async (entity) => entity as AiConfig);

      await service.updateConfig(mockTenant.id, { enabled: false });

      expect(configCopy.enabled).toBe(false);
    });

    it('should throw NotFoundException if config does not exist', async () => {
      aiConfigRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateConfig('nonexistent', { enabled: true }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteConfig', () => {
    it('should delete the config', async () => {
      aiConfigRepository.findOne.mockResolvedValue(mockAiConfig);
      aiConfigRepository.remove.mockResolvedValue(mockAiConfig);

      await service.deleteConfig(mockTenant.id);

      expect(aiConfigRepository.remove).toHaveBeenCalledWith(mockAiConfig);
    });

    it('should throw NotFoundException if config does not exist', async () => {
      aiConfigRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteConfig('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('testConfig', () => {
    it('should return success for a valid OpenAI config', async () => {
      aiConfigRepository.findOne.mockResolvedValue({ ...mockAiConfig });

      const result = await service.testConfig(mockTenant.id);

      expect(result.success).toBe(true);
      expect(result.message).toContain('valid');
    });

    it('should return success for a valid Anthropic config', async () => {
      aiConfigRepository.findOne.mockResolvedValue({
        ...mockAiConfig,
        provider: AiProvider.ANTHROPIC,
      });

      const result = await service.testConfig(mockTenant.id);

      expect(result.success).toBe(true);
    });

    it('should throw NotFoundException if config does not exist', async () => {
      aiConfigRepository.findOne.mockResolvedValue(null);

      await expect(service.testConfig('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ──── Exercise Generation ────

  describe('generateExercises', () => {
    const generateDto = {
      tenantId: mockTenant.id,
      topics: ['Phishing'],
      difficulty: ExerciseDifficulty.INTERMEDIATE,
      count: 5,
    };

    it('should generate exercises for valid config with OpenAI', async () => {
      aiConfigRepository.findOne.mockResolvedValue({ ...mockAiConfig, enabled: true });
      tenantRepository.findOne.mockResolvedValue(mockTenant);
      exerciseRepository.create.mockReturnValue(mockExercise);
      exerciseRepository.save.mockResolvedValue(mockExercise);
      aiConfigRepository.save.mockResolvedValue(mockAiConfig);

      const result = await service.generateExercises(generateDto);

      expect(result).toHaveLength(1); // one topic
      expect(exerciseRepository.create).toHaveBeenCalled();
      expect(exerciseRepository.save).toHaveBeenCalled();
      // Should update lastGeneratedAt
      expect(aiConfigRepository.save).toHaveBeenCalled();
    });

    it('should generate exercises with Anthropic provider', async () => {
      aiConfigRepository.findOne.mockResolvedValue({
        ...mockAiConfig,
        provider: AiProvider.ANTHROPIC,
        enabled: true,
      });
      tenantRepository.findOne.mockResolvedValue(mockTenant);
      exerciseRepository.create.mockReturnValue(mockExercise);
      exerciseRepository.save.mockResolvedValue(mockExercise);
      aiConfigRepository.save.mockResolvedValue(mockAiConfig);

      const result = await service.generateExercises(generateDto);

      expect(result).toHaveLength(1);
    });

    it('should use default topics when none provided', async () => {
      aiConfigRepository.findOne.mockResolvedValue({ ...mockAiConfig, enabled: true });
      tenantRepository.findOne.mockResolvedValue(mockTenant);
      exerciseRepository.create.mockReturnValue(mockExercise);
      exerciseRepository.save.mockResolvedValue(mockExercise);
      aiConfigRepository.save.mockResolvedValue(mockAiConfig);

      const result = await service.generateExercises({
        tenantId: mockTenant.id,
      });

      // Default topics has 10 items
      expect(result).toHaveLength(10);
    });

    it('should throw NotFoundException if config does not exist', async () => {
      aiConfigRepository.findOne.mockResolvedValue(null);

      await expect(service.generateExercises(generateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if AI is not enabled', async () => {
      aiConfigRepository.findOne.mockResolvedValue({
        ...mockAiConfig,
        enabled: false,
      });

      await expect(service.generateExercises(generateDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if tenant does not exist', async () => {
      aiConfigRepository.findOne.mockResolvedValue({ ...mockAiConfig, enabled: true });
      tenantRepository.findOne.mockResolvedValue(null);

      await expect(service.generateExercises(generateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle AI call errors gracefully and continue with other topics', async () => {
      // Make the first save fail (simulating AI call error at exercise level)
      // but the service catches per-topic errors, so it should still proceed
      aiConfigRepository.findOne.mockResolvedValue({ ...mockAiConfig, enabled: true });
      tenantRepository.findOne.mockResolvedValue(mockTenant);
      exerciseRepository.create.mockReturnValue(mockExercise);
      exerciseRepository.save
        .mockRejectedValueOnce(new Error('DB error'))
        .mockResolvedValue(mockExercise);
      aiConfigRepository.save.mockResolvedValue(mockAiConfig);

      const result = await service.generateExercises({
        tenantId: mockTenant.id,
        topics: ['Topic1', 'Topic2'],
      });

      // First topic fails at save, second succeeds
      expect(result).toHaveLength(1);
    });
  });

  describe('findGeneratedExercises', () => {
    it('should return all AI-generated exercises', async () => {
      exerciseRepository.find.mockResolvedValue([mockExercise]);

      const result = await service.findGeneratedExercises();

      expect(result).toEqual([mockExercise]);
      expect(exerciseRepository.find).toHaveBeenCalledWith({
        where: { generatedByAi: true },
        order: { createdAt: 'DESC' },
      });
    });

    it('should return empty array when none exist', async () => {
      exerciseRepository.find.mockResolvedValue([]);

      const result = await service.findGeneratedExercises();

      expect(result).toEqual([]);
    });
  });

  // ──── Encryption fallback ────

  describe('encryption secret fallback', () => {
    it('should fall back to JWT_SECRET when AI_KEY_ENCRYPTION_SECRET is not set', async () => {
      configService.get.mockImplementation((key: string) => {
        if (key === 'AI_KEY_ENCRYPTION_SECRET') return undefined;
        if (key === 'JWT_SECRET') return 'jwt-fallback-secret';
        return undefined;
      });

      // Encrypt with the fallback secret
      const encrypted = encrypt('sk-test', 'jwt-fallback-secret');
      aiConfigRepository.findOne.mockResolvedValue({
        ...mockAiConfig,
        encryptedApiKey: encrypted,
      });

      const result = await service.getConfig(mockTenant.id);

      // Should not throw - the masking uses decrypt internally
      expect((result as any).maskedApiKey).toMatch(/^\*{4}/);
    });

    it('should fall back to default when both secrets are not set', async () => {
      configService.get.mockReturnValue(undefined);

      const encrypted = encrypt('sk-test', 'default-encryption-secret-change-me');
      aiConfigRepository.findOne.mockResolvedValue({
        ...mockAiConfig,
        encryptedApiKey: encrypted,
      });

      const result = await service.getConfig(mockTenant.id);

      expect((result as any).maskedApiKey).toMatch(/^\*{4}/);
    });
  });
});
