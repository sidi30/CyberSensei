import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { LicenseService } from './license.service';
import { License, LicenseStatus } from '../../entities/license.entity';
import { Tenant } from '../../entities/tenant.entity';

describe('LicenseService', () => {
  let service: LicenseService;
  let licenseRepository: jest.Mocked<Partial<Repository<License>>>;
  let tenantRepository: jest.Mocked<Partial<Repository<Tenant>>>;

  const mockTenant: Partial<Tenant> = {
    id: 'tenant-uuid',
    name: 'Test Tenant',
    contactEmail: 'tenant@test.com',
    active: true,
  };

  const mockLicense: Partial<License> = {
    id: 'license-uuid',
    key: 'ABCD1234-EFGH5678-IJKL9012-MNOP3456',
    tenantId: 'tenant-uuid',
    status: LicenseStatus.ACTIVE,
    usageCount: 0,
    maxUsageCount: 100,
    expiresAt: new Date('2027-12-31'),
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
    tenant: mockTenant as Tenant,
  };

  beforeEach(async () => {
    licenseRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    tenantRepository = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LicenseService,
        {
          provide: getRepositoryToken(License),
          useValue: licenseRepository,
        },
        {
          provide: getRepositoryToken(Tenant),
          useValue: tenantRepository,
        },
      ],
    }).compile();

    service = module.get<LicenseService>(LicenseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createLicenseDto = {
      tenantId: 'tenant-uuid',
      maxUsageCount: 100,
      expiresAt: '2027-12-31',
    };

    it('should create a license with generated key', async () => {
      tenantRepository.findOne.mockResolvedValue(mockTenant as Tenant);
      licenseRepository.create.mockReturnValue(mockLicense as License);
      licenseRepository.save.mockResolvedValue(mockLicense as License);

      const result = await service.create(createLicenseDto);

      expect(result).toEqual(mockLicense);
      expect(tenantRepository.findOne).toHaveBeenCalledWith({
        where: { id: createLicenseDto.tenantId },
      });
      expect(licenseRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          key: expect.any(String),
          tenantId: createLicenseDto.tenantId,
        }),
      );
      expect(licenseRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if tenant does not exist', async () => {
      tenantRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createLicenseDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create(createLicenseDto)).rejects.toThrow(
        'Tenant non trouvé',
      );
    });
  });

  describe('validate', () => {
    it('should validate an active license and increment usage count', async () => {
      const license = {
        ...mockLicense,
        usageCount: 5,
      } as License;
      licenseRepository.findOne.mockResolvedValue(license);
      licenseRepository.save.mockResolvedValue({ ...license, usageCount: 6 } as License);

      const result = await service.validate(mockLicense.key);

      expect(result).toEqual({
        valid: true,
        tenantId: mockLicense.tenantId,
        tenantName: mockTenant.name,
        expiresAt: mockLicense.expiresAt,
        usageCount: 6,
        maxUsageCount: mockLicense.maxUsageCount,
      });
      expect(licenseRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException for invalid key', async () => {
      licenseRepository.findOne.mockResolvedValue(null);

      await expect(service.validate('INVALID-KEY')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.validate('INVALID-KEY')).rejects.toThrow(
        'Clé de licence invalide',
      );
    });

    it('should throw BadRequestException for expired license status', async () => {
      const expiredLicense = {
        ...mockLicense,
        status: LicenseStatus.EXPIRED,
      } as License;
      licenseRepository.findOne.mockResolvedValue(expiredLicense);

      await expect(service.validate(expiredLicense.key)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.validate(expiredLicense.key)).rejects.toThrow(
        'expirée',
      );
    });

    it('should throw BadRequestException for revoked license', async () => {
      const revokedLicense = {
        ...mockLicense,
        status: LicenseStatus.REVOKED,
      } as License;
      licenseRepository.findOne.mockResolvedValue(revokedLicense);

      await expect(service.validate(revokedLicense.key)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.validate(revokedLicense.key)).rejects.toThrow(
        'révoquée',
      );
    });

    it('should throw BadRequestException for inactive tenant', async () => {
      const licenseWithInactiveTenant = {
        ...mockLicense,
        tenant: { ...mockTenant, active: false },
      } as License;
      licenseRepository.findOne.mockResolvedValue(licenseWithInactiveTenant);

      await expect(
        service.validate(licenseWithInactiveTenant.key),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.validate(licenseWithInactiveTenant.key),
      ).rejects.toThrow('Tenant inactif');
    });

    it('should throw BadRequestException and set status EXPIRED when expiresAt is in the past', async () => {
      const expiredDateLicense = {
        ...mockLicense,
        expiresAt: new Date('2020-01-01'),
      } as License;
      licenseRepository.findOne.mockResolvedValue(expiredDateLicense);
      licenseRepository.save.mockResolvedValue(expiredDateLicense);

      await expect(
        service.validate(expiredDateLicense.key),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.validate(expiredDateLicense.key),
      ).rejects.toThrow('Licence expirée');

      // Verify the status was updated to EXPIRED
      expect(licenseRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: LicenseStatus.EXPIRED,
        }),
      );
    });

    it('should throw BadRequestException when usage limit is reached', async () => {
      const maxedLicense = {
        ...mockLicense,
        usageCount: 100,
        maxUsageCount: 100,
      } as License;
      licenseRepository.findOne.mockResolvedValue(maxedLicense);

      await expect(service.validate(maxedLicense.key)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.validate(maxedLicense.key)).rejects.toThrow(
        "Limite d'utilisation atteinte",
      );
    });
  });

  describe('revoke', () => {
    it('should revoke a license', async () => {
      const license = { ...mockLicense } as License;
      licenseRepository.findOne.mockResolvedValue(license);
      licenseRepository.save.mockResolvedValue({
        ...license,
        status: LicenseStatus.REVOKED,
      } as License);

      const result = await service.revoke(mockLicense.id);

      expect(result).toEqual({ message: 'Licence révoquée avec succès' });
      expect(licenseRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: LicenseStatus.REVOKED,
        }),
      );
    });

    it('should throw NotFoundException if license does not exist', async () => {
      licenseRepository.findOne.mockResolvedValue(null);

      await expect(service.revoke('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.revoke('nonexistent')).rejects.toThrow(
        'Licence non trouvée',
      );
    });
  });

  describe('renew', () => {
    it('should renew a license with new expiration date', async () => {
      const license = { ...mockLicense } as License;
      licenseRepository.findOne.mockResolvedValue(license);
      const renewedLicense = {
        ...license,
        expiresAt: new Date('2028-12-31'),
        status: LicenseStatus.ACTIVE,
      } as License;
      licenseRepository.save.mockResolvedValue(renewedLicense);

      const result = await service.renew(mockLicense.id, '2028-12-31');

      expect(licenseRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          expiresAt: expect.any(Date),
          status: LicenseStatus.ACTIVE,
        }),
      );
      expect(result).toEqual(renewedLicense);
    });

    it('should throw NotFoundException if license does not exist', async () => {
      licenseRepository.findOne.mockResolvedValue(null);

      await expect(service.renew('nonexistent', '2028-12-31')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all licenses with tenant relations', async () => {
      licenseRepository.find.mockResolvedValue([mockLicense as License]);

      const result = await service.findAll();

      expect(result).toEqual([mockLicense]);
      expect(licenseRepository.find).toHaveBeenCalledWith({
        relations: ['tenant'],
        order: { createdAt: 'DESC' },
      });
    });
  });
});
