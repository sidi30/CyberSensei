import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AdminAuthService } from './admin-auth.service';
import { AdminUser, AdminRole } from '../../entities/admin-user.entity';

jest.mock('bcrypt');

describe('AdminAuthService', () => {
  let service: AdminAuthService;
  let adminUserRepository: jest.Mocked<Partial<Repository<AdminUser>>>;
  let jwtService: jest.Mocked<Partial<JwtService>>;
  let configService: jest.Mocked<Partial<ConfigService>>;

  const mockUser: AdminUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Admin',
    email: 'admin@test.com',
    passwordHash: '$2b$12$hashedpassword',
    role: AdminRole.SUPERADMIN,
    active: true,
    lastLoginAt: null,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  };

  beforeEach(async () => {
    adminUserRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('signed-jwt-token'),
    };

    configService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminAuthService,
        {
          provide: getRepositoryToken(AdminUser),
          useValue: adminUserRepository,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    service = module.get<AdminAuthService>(AdminAuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    const loginDto = { email: 'admin@test.com', password: 'SecurePassword123!' };

    it('should return access_token and user on valid credentials', async () => {
      adminUserRepository.findOne.mockResolvedValue({ ...mockUser });
      adminUserRepository.save.mockResolvedValue({ ...mockUser });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(loginDto);

      expect(result).toEqual({
        access_token: 'signed-jwt-token',
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
        },
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
      expect(adminUserRepository.save).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      adminUserRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Email ou mot de passe incorrect',
      );
    });

    it('should throw UnauthorizedException when user is inactive', async () => {
      adminUserRepository.findOne.mockResolvedValue({
        ...mockUser,
        active: false,
      });

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      adminUserRepository.findOne.mockResolvedValue({ ...mockUser });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Email ou mot de passe incorrect',
      );
    });

    it('should update lastLoginAt on successful login', async () => {
      const savedUser = { ...mockUser };
      adminUserRepository.findOne.mockResolvedValue(savedUser);
      adminUserRepository.save.mockResolvedValue(savedUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await service.login(loginDto);

      expect(adminUserRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          lastLoginAt: expect.any(Date),
        }),
      );
    });
  });

  describe('createAdmin', () => {
    const createAdminDto = {
      name: 'New Admin',
      email: 'new@test.com',
      password: 'SecurePassword123!',
      role: AdminRole.SUPPORT,
    };

    it('should create a new admin with hashed password', async () => {
      adminUserRepository.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$12$hashed');
      const createdAdmin = {
        ...createAdminDto,
        passwordHash: '$2b$12$hashed',
        id: 'new-uuid',
      };
      adminUserRepository.create.mockReturnValue(createdAdmin as any);
      adminUserRepository.save.mockResolvedValue(createdAdmin as any);

      const result = await service.createAdmin(createAdminDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(createAdminDto.password, 12);
      expect(adminUserRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          passwordHash: '$2b$12$hashed',
        }),
      );
      expect(adminUserRepository.save).toHaveBeenCalled();
      // Result should not contain passwordHash
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should throw ConflictException if email already exists', async () => {
      adminUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(service.createAdmin(createAdminDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.createAdmin(createAdminDto)).rejects.toThrow(
        'Un utilisateur avec cet email existe déjà',
      );
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      adminUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.getProfile(mockUser.id);

      expect(result).toEqual(mockUser);
      expect(adminUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        select: ['id', 'name', 'email', 'role', 'active', 'createdAt', 'lastLoginAt'],
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      adminUserRepository.findOne.mockResolvedValue(null);

      await expect(service.getProfile('nonexistent')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getAllAdmins', () => {
    it('should return all admins', async () => {
      adminUserRepository.find.mockResolvedValue([mockUser]);

      const result = await service.getAllAdmins();

      expect(result).toEqual([mockUser]);
      expect(adminUserRepository.find).toHaveBeenCalledWith({
        select: ['id', 'name', 'email', 'role', 'active', 'createdAt', 'lastLoginAt'],
      });
    });
  });
});
