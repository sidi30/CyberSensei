import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TenantService } from './tenant.service';
import { Tenant } from '../../entities/tenant.entity';
import { TenantMetric } from '../../entities/tenant-metric.entity';

describe('TenantService', () => {
  let service: TenantService;
  let tenantRepository: jest.Mocked<Partial<Repository<Tenant>>>;
  let metricRepository: jest.Mocked<Partial<Repository<TenantMetric>>>;

  const mockTenant: Tenant = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Test Tenant',
    contactEmail: 'tenant@test.com',
    licenseKey: 'ABCD1234-EFGH5678-IJKL9012-MNOP3456',
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

  beforeEach(async () => {
    tenantRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    metricRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantService,
        {
          provide: getRepositoryToken(Tenant),
          useValue: tenantRepository,
        },
        {
          provide: getRepositoryToken(TenantMetric),
          useValue: metricRepository,
        },
      ],
    }).compile();

    service = module.get<TenantService>(TenantService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createTenantDto = {
      name: 'New Tenant',
      contactEmail: 'new@test.com',
      companyName: 'New Corp',
    };

    it('should create a tenant with a generated license key', async () => {
      tenantRepository.findOne.mockResolvedValue(null);
      tenantRepository.create.mockReturnValue(mockTenant);
      tenantRepository.save.mockResolvedValue(mockTenant);

      const result = await service.create(createTenantDto);

      expect(result).toEqual(mockTenant);
      expect(tenantRepository.findOne).toHaveBeenCalledWith({
        where: [
          { name: createTenantDto.name },
          { contactEmail: createTenantDto.contactEmail },
        ],
      });
      expect(tenantRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          ...createTenantDto,
          licenseKey: expect.any(String),
        }),
      );
      expect(tenantRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if tenant with same name or email exists', async () => {
      tenantRepository.findOne.mockResolvedValue(mockTenant);

      await expect(service.create(createTenantDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createTenantDto)).rejects.toThrow(
        'Un tenant avec ce nom ou email existe déjà',
      );
    });
  });

  describe('findAll', () => {
    it('should return all tenants ordered by createdAt DESC', async () => {
      tenantRepository.find.mockResolvedValue([mockTenant]);

      const result = await service.findAll();

      expect(result).toEqual([mockTenant]);
      expect(tenantRepository.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
      });
    });

    it('should return empty array when no tenants exist', async () => {
      tenantRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a tenant when it exists', async () => {
      tenantRepository.findOne.mockResolvedValue(mockTenant);

      const result = await service.findOne(mockTenant.id);

      expect(result).toEqual(mockTenant);
      expect(tenantRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockTenant.id },
      });
    });

    it('should throw NotFoundException when tenant does not exist', async () => {
      tenantRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findOne('nonexistent')).rejects.toThrow(
        'Tenant non trouvé',
      );
    });
  });

  describe('update', () => {
    const updateTenantDto = { name: 'Updated Tenant' };

    it('should update and return the tenant', async () => {
      const updatedTenant = { ...mockTenant, ...updateTenantDto };
      tenantRepository.findOne.mockResolvedValue({ ...mockTenant });
      tenantRepository.save.mockResolvedValue(updatedTenant);

      const result = await service.update(mockTenant.id, updateTenantDto);

      expect(result).toEqual(updatedTenant);
      expect(tenantRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if tenant does not exist', async () => {
      tenantRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', updateTenantDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove the tenant and return success message', async () => {
      tenantRepository.findOne.mockResolvedValue(mockTenant);
      tenantRepository.remove.mockResolvedValue(mockTenant);

      const result = await service.remove(mockTenant.id);

      expect(result).toEqual({ message: 'Tenant supprimé avec succès' });
      expect(tenantRepository.remove).toHaveBeenCalledWith(mockTenant);
    });

    it('should throw NotFoundException if tenant does not exist', async () => {
      tenantRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByLicenseKey', () => {
    it('should return tenant by license key', async () => {
      tenantRepository.findOne.mockResolvedValue(mockTenant);

      const result = await service.findByLicenseKey(mockTenant.licenseKey);

      expect(result).toEqual(mockTenant);
      expect(tenantRepository.findOne).toHaveBeenCalledWith({
        where: { licenseKey: mockTenant.licenseKey },
      });
    });

    it('should throw NotFoundException for invalid license key', async () => {
      tenantRepository.findOne.mockResolvedValue(null);

      await expect(service.findByLicenseKey('INVALID')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
