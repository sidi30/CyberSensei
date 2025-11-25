import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { License, LicenseStatus } from '../../entities/license.entity';
import { Tenant } from '../../entities/tenant.entity';
import { CreateLicenseDto } from './dto/create-license.dto';

@Injectable()
export class LicenseService {
  constructor(
    @InjectRepository(License)
    private licenseRepository: Repository<License>,
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
  ) {}

  private generateLicenseKey(): string {
    const segments = [];
    for (let i = 0; i < 4; i++) {
      segments.push(
        uuidv4()
          .replace(/-/g, '')
          .substring(0, 8)
          .toUpperCase(),
      );
    }
    return segments.join('-');
  }

  async create(createLicenseDto: CreateLicenseDto) {
    const tenant = await this.tenantRepository.findOne({
      where: { id: createLicenseDto.tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant non trouvé');
    }

    const key = this.generateLicenseKey();

    const license = this.licenseRepository.create({
      ...createLicenseDto,
      key,
      expiresAt: createLicenseDto.expiresAt
        ? new Date(createLicenseDto.expiresAt)
        : null,
    });

    return await this.licenseRepository.save(license);
  }

  async findAll() {
    return await this.licenseRepository.find({
      relations: ['tenant'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByTenant(tenantId: string) {
    return await this.licenseRepository.find({
      where: { tenantId },
      order: { createdAt: 'DESC' },
    });
  }

  async validate(key: string) {
    const license = await this.licenseRepository.findOne({
      where: { key },
      relations: ['tenant'],
    });

    if (!license) {
      throw new NotFoundException('Clé de licence invalide');
    }

    // Check if license is active
    if (license.status !== LicenseStatus.ACTIVE) {
      throw new BadRequestException(
        `Licence ${license.status === LicenseStatus.EXPIRED ? 'expirée' : 'révoquée'}`,
      );
    }

    // Check if tenant is active
    if (!license.tenant.active) {
      throw new BadRequestException('Tenant inactif');
    }

    // Check expiration
    if (license.expiresAt && new Date() > new Date(license.expiresAt)) {
      license.status = LicenseStatus.EXPIRED;
      await this.licenseRepository.save(license);
      throw new BadRequestException('Licence expirée');
    }

    // Check usage limit
    if (
      license.maxUsageCount &&
      license.usageCount >= license.maxUsageCount
    ) {
      throw new BadRequestException('Limite d\'utilisation atteinte');
    }

    // Increment usage counter
    license.usageCount++;
    await this.licenseRepository.save(license);

    return {
      valid: true,
      tenantId: license.tenantId,
      tenantName: license.tenant.name,
      expiresAt: license.expiresAt,
      usageCount: license.usageCount,
      maxUsageCount: license.maxUsageCount,
    };
  }

  async revoke(id: string) {
    const license = await this.licenseRepository.findOne({
      where: { id },
    });

    if (!license) {
      throw new NotFoundException('Licence non trouvée');
    }

    license.status = LicenseStatus.REVOKED;
    await this.licenseRepository.save(license);

    return { message: 'Licence révoquée avec succès' };
  }

  async renew(id: string, expiresAt: string) {
    const license = await this.licenseRepository.findOne({
      where: { id },
    });

    if (!license) {
      throw new NotFoundException('Licence non trouvée');
    }

    license.expiresAt = new Date(expiresAt);
    license.status = LicenseStatus.ACTIVE;
    await this.licenseRepository.save(license);

    return license;
  }
}

