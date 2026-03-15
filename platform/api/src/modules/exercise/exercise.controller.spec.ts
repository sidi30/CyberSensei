import { Test, TestingModule } from '@nestjs/testing';
import { ExerciseController } from './exercise.controller';
import { ExerciseService } from './exercise.service';
import { Exercise, ExerciseDifficulty, ExerciseType } from '../../entities/exercise.entity';

describe('ExerciseController', () => {
  let controller: ExerciseController;
  let service: jest.Mocked<Partial<ExerciseService>>;

  const mockExercise: Exercise = {
    id: 'exercise-uuid-1',
    topic: 'Phishing',
    type: ExerciseType.QUIZ,
    difficulty: ExerciseDifficulty.INTERMEDIATE,
    payloadJSON: { courseIntro: 'Test', questions: [] },
    version: '1.0.0',
    active: true,
    description: 'Test exercise',
    tags: 'phishing,test',
    generatedByAi: false,
    tenantId: null,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findActive: jest.fn(),
      findByTopic: jest.fn(),
      findByDifficulty: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      softDelete: jest.fn(),
      bulkCreate: jest.fn(),
      getStats: jest.fn(),
      exportForSync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExerciseController],
      providers: [
        {
          provide: ExerciseService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<ExerciseController>(ExerciseController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST / - create', () => {
    it('should create an exercise', async () => {
      const dto = {
        topic: 'Phishing',
        type: ExerciseType.QUIZ,
        difficulty: ExerciseDifficulty.INTERMEDIATE,
        payloadJSON: { courseIntro: 'Test', questions: [] },
      };

      service.create.mockResolvedValue(mockExercise);

      const result = await controller.create(dto);

      expect(result).toEqual(mockExercise);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('POST /bulk - bulkCreate', () => {
    it('should bulk create exercises', async () => {
      const dtos = [
        {
          topic: 'Phishing',
          type: ExerciseType.QUIZ,
          difficulty: ExerciseDifficulty.BEGINNER,
          payloadJSON: {},
        },
      ];

      service.bulkCreate.mockResolvedValue([mockExercise]);

      const result = await controller.bulkCreate(dtos);

      expect(result).toHaveLength(1);
      expect(service.bulkCreate).toHaveBeenCalledWith(dtos);
    });
  });

  describe('GET / - findAll', () => {
    it('should return all exercises when no filters', async () => {
      service.findAll.mockResolvedValue([mockExercise]);

      const result = await controller.findAll();

      expect(result).toEqual([mockExercise]);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should filter by topic', async () => {
      service.findByTopic.mockResolvedValue([mockExercise]);

      const result = await controller.findAll(undefined, 'Phishing');

      expect(result).toEqual([mockExercise]);
      expect(service.findByTopic).toHaveBeenCalledWith('Phishing');
    });

    it('should filter by difficulty', async () => {
      service.findByDifficulty.mockResolvedValue([mockExercise]);

      const result = await controller.findAll(undefined, undefined, 'INTERMEDIATE');

      expect(result).toEqual([mockExercise]);
      expect(service.findByDifficulty).toHaveBeenCalledWith('INTERMEDIATE');
    });

    it('should filter by active=true', async () => {
      service.findActive.mockResolvedValue([mockExercise]);

      const result = await controller.findAll('true');

      expect(result).toEqual([mockExercise]);
      expect(service.findActive).toHaveBeenCalled();
    });
  });

  describe('GET /stats - getStats', () => {
    it('should return exercise statistics', async () => {
      const stats = {
        total: 10,
        active: 8,
        byTopic: { Phishing: 5 },
        byDifficulty: { INTERMEDIATE: 3 },
        byType: { QUIZ: 7 },
      };
      service.getStats.mockResolvedValue(stats);

      const result = await controller.getStats();

      expect(result).toEqual(stats);
      expect(service.getStats).toHaveBeenCalled();
    });
  });

  describe('GET /export - exportForSync', () => {
    it('should export exercises for sync', async () => {
      const exportPayload = {
        version: '20250101.001',
        timestamp: '2025-01-01T00:00:00.000Z',
        exercises: [],
        deletions: [],
      };
      service.exportForSync.mockResolvedValue(exportPayload);

      const result = await controller.exportForSync();

      expect(result).toEqual(exportPayload);
      expect(service.exportForSync).toHaveBeenCalledWith(false);
    });

    it('should export with inactive exercises', async () => {
      const exportPayload = {
        version: '20250101.001',
        timestamp: '2025-01-01T00:00:00.000Z',
        exercises: [],
        deletions: [],
      };
      service.exportForSync.mockResolvedValue(exportPayload);

      const result = await controller.exportForSync('true');

      expect(result).toEqual(exportPayload);
      expect(service.exportForSync).toHaveBeenCalledWith(true);
    });
  });

  describe('GET /:id - findOne', () => {
    it('should return an exercise by id', async () => {
      service.findOne.mockResolvedValue(mockExercise);

      const result = await controller.findOne('exercise-uuid-1');

      expect(result).toEqual(mockExercise);
      expect(service.findOne).toHaveBeenCalledWith('exercise-uuid-1');
    });
  });

  describe('PUT /:id - update', () => {
    it('should update an exercise', async () => {
      const updated = { ...mockExercise, topic: 'Ransomware' };
      service.update.mockResolvedValue(updated);

      const result = await controller.update('exercise-uuid-1', { topic: 'Ransomware' });

      expect(result).toEqual(updated);
      expect(service.update).toHaveBeenCalledWith('exercise-uuid-1', { topic: 'Ransomware' });
    });
  });

  describe('DELETE /:id - remove', () => {
    it('should delete an exercise', async () => {
      service.remove.mockResolvedValue(undefined);

      const result = await controller.remove('exercise-uuid-1');

      expect(result).toEqual({ message: 'Exercise exercise-uuid-1 deleted successfully' });
      expect(service.remove).toHaveBeenCalledWith('exercise-uuid-1');
    });
  });

  describe('PUT /:id/deactivate - deactivate', () => {
    it('should deactivate an exercise', async () => {
      const deactivated = { ...mockExercise, active: false };
      service.softDelete.mockResolvedValue(deactivated);

      const result = await controller.deactivate('exercise-uuid-1');

      expect(result).toEqual(deactivated);
      expect(service.softDelete).toHaveBeenCalledWith('exercise-uuid-1');
    });
  });
});
