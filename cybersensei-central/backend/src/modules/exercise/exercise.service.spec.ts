import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ExerciseService } from './exercise.service';
import { Exercise, ExerciseDifficulty, ExerciseType } from '../../entities/exercise.entity';

describe('ExerciseService', () => {
  let service: ExerciseService;
  let repository: jest.Mocked<Partial<Repository<Exercise>>>;

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
    repository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExerciseService,
        {
          provide: getRepositoryToken(Exercise),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get<ExerciseService>(ExerciseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      topic: 'Phishing',
      type: ExerciseType.QUIZ,
      difficulty: ExerciseDifficulty.INTERMEDIATE,
      payloadJSON: { courseIntro: 'Test', questions: [] },
    };

    it('should create an exercise with default version and active', async () => {
      repository.create.mockReturnValue(mockExercise);
      repository.save.mockResolvedValue(mockExercise);

      const result = await service.create(createDto);

      expect(result).toEqual(mockExercise);
      expect(repository.create).toHaveBeenCalledWith({
        ...createDto,
        version: '1.0.0',
        active: true,
      });
      expect(repository.save).toHaveBeenCalled();
    });

    it('should use provided version and active flag', async () => {
      const dtoWithVersion = { ...createDto, version: '2.0.0', active: false };
      repository.create.mockReturnValue({ ...mockExercise, version: '2.0.0', active: false });
      repository.save.mockResolvedValue({ ...mockExercise, version: '2.0.0', active: false });

      const result = await service.create(dtoWithVersion);

      expect(result.version).toBe('2.0.0');
      expect(result.active).toBe(false);
      expect(repository.create).toHaveBeenCalledWith({
        ...dtoWithVersion,
        version: '2.0.0',
        active: false,
      });
    });
  });

  describe('findAll', () => {
    it('should return all exercises ordered by createdAt DESC', async () => {
      repository.find.mockResolvedValue([mockExercise]);

      const result = await service.findAll();

      expect(result).toEqual([mockExercise]);
      expect(repository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
    });

    it('should return empty array when no exercises exist', async () => {
      repository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findActive', () => {
    it('should return only active exercises', async () => {
      repository.find.mockResolvedValue([mockExercise]);

      const result = await service.findActive();

      expect(result).toEqual([mockExercise]);
      expect(repository.find).toHaveBeenCalledWith({
        where: { active: true },
        order: { topic: 'ASC', difficulty: 'ASC' },
      });
    });
  });

  describe('findByTopic', () => {
    it('should return exercises for a given topic', async () => {
      repository.find.mockResolvedValue([mockExercise]);

      const result = await service.findByTopic('Phishing');

      expect(result).toEqual([mockExercise]);
      expect(repository.find).toHaveBeenCalledWith({
        where: { topic: 'Phishing', active: true },
        order: { difficulty: 'ASC' },
      });
    });
  });

  describe('findByDifficulty', () => {
    it('should return exercises for a given difficulty', async () => {
      repository.find.mockResolvedValue([mockExercise]);

      const result = await service.findByDifficulty(ExerciseDifficulty.INTERMEDIATE);

      expect(result).toEqual([mockExercise]);
      expect(repository.find).toHaveBeenCalledWith({
        where: { difficulty: ExerciseDifficulty.INTERMEDIATE, active: true },
        order: { topic: 'ASC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return an exercise by id', async () => {
      repository.findOne.mockResolvedValue(mockExercise);

      const result = await service.findOne('exercise-uuid-1');

      expect(result).toEqual(mockExercise);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'exercise-uuid-1' },
      });
    });

    it('should throw NotFoundException when exercise not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update an exercise', async () => {
      const updatedExercise = { ...mockExercise, topic: 'Ransomware' };
      repository.findOne.mockResolvedValue({ ...mockExercise });
      repository.save.mockResolvedValue(updatedExercise);

      const result = await service.update('exercise-uuid-1', { topic: 'Ransomware' });

      expect(result).toEqual(updatedExercise);
      expect(repository.save).toHaveBeenCalled();
    });

    it('should increment version when payloadJSON is updated', async () => {
      const exercise = { ...mockExercise, version: '1.0.0' };
      repository.findOne.mockResolvedValue(exercise);
      repository.save.mockImplementation(async (e) => e as Exercise);

      const newPayload = { courseIntro: 'Updated', questions: [] };
      await service.update('exercise-uuid-1', { payloadJSON: newPayload });

      expect(exercise.version).toBe('1.0.1');
    });

    it('should throw NotFoundException when exercise not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { topic: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove an exercise', async () => {
      repository.findOne.mockResolvedValue(mockExercise);
      repository.remove.mockResolvedValue(mockExercise);

      await service.remove('exercise-uuid-1');

      expect(repository.remove).toHaveBeenCalledWith(mockExercise);
    });

    it('should throw NotFoundException when exercise not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('softDelete', () => {
    it('should deactivate an exercise', async () => {
      const exercise = { ...mockExercise, active: true };
      repository.findOne.mockResolvedValue(exercise);
      repository.save.mockImplementation(async (e) => e as Exercise);

      const result = await service.softDelete('exercise-uuid-1');

      expect(result.active).toBe(false);
    });
  });

  describe('getStats', () => {
    it('should return exercise statistics', async () => {
      const exercises = [
        { ...mockExercise, active: true, topic: 'Phishing', difficulty: ExerciseDifficulty.BEGINNER, type: ExerciseType.QUIZ },
        { ...mockExercise, id: '2', active: true, topic: 'Phishing', difficulty: ExerciseDifficulty.INTERMEDIATE, type: ExerciseType.SIMULATION },
        { ...mockExercise, id: '3', active: false, topic: 'Ransomware', difficulty: ExerciseDifficulty.ADVANCED, type: ExerciseType.QUIZ },
      ];
      repository.find.mockResolvedValue(exercises);

      const result = await service.getStats();

      expect(result.total).toBe(3);
      expect(result.active).toBe(2);
      expect(result.byTopic).toEqual({ Phishing: 2 });
      expect(result.byDifficulty).toEqual({
        [ExerciseDifficulty.BEGINNER]: 1,
        [ExerciseDifficulty.INTERMEDIATE]: 1,
      });
      expect(result.byType).toEqual({
        [ExerciseType.QUIZ]: 1,
        [ExerciseType.SIMULATION]: 1,
      });
    });

    it('should return zeros when no exercises', async () => {
      repository.find.mockResolvedValue([]);

      const result = await service.getStats();

      expect(result.total).toBe(0);
      expect(result.active).toBe(0);
      expect(result.byTopic).toEqual({});
    });
  });

  describe('exportForSync', () => {
    it('should export active exercises by default', async () => {
      repository.find.mockResolvedValue([mockExercise]);

      const result = await service.exportForSync();

      expect(result.exercises).toHaveLength(1);
      expect(result.exercises[0].centralId).toBe(mockExercise.id);
      expect(result.exercises[0].generatedByAi).toBe(false);
      expect(result.version).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it('should include deletions and clear them after export', async () => {
      // First remove an exercise to populate deletions
      repository.findOne.mockResolvedValue(mockExercise);
      repository.remove.mockResolvedValue(mockExercise);
      await service.remove('exercise-uuid-1');

      // Then export
      repository.find.mockResolvedValue([]);
      const result = await service.exportForSync();

      expect(result.deletions).toContain('exercise-uuid-1');

      // Second export should have empty deletions
      const result2 = await service.exportForSync();
      expect(result2.deletions).toEqual([]);
    });
  });

  describe('bulkCreate', () => {
    it('should create multiple exercises', async () => {
      const dtos = [
        {
          topic: 'Phishing',
          type: ExerciseType.QUIZ,
          difficulty: ExerciseDifficulty.BEGINNER,
          payloadJSON: { courseIntro: 'Test', questions: [] },
        },
        {
          topic: 'Ransomware',
          type: ExerciseType.QUIZ,
          difficulty: ExerciseDifficulty.ADVANCED,
          payloadJSON: { courseIntro: 'Test 2', questions: [] },
        },
      ];

      repository.create.mockReturnValue(mockExercise);
      repository.save.mockResolvedValue(mockExercise);

      const result = await service.bulkCreate(dtos);

      expect(result).toHaveLength(2);
      expect(repository.create).toHaveBeenCalledTimes(2);
      expect(repository.save).toHaveBeenCalledTimes(2);
    });
  });
});
