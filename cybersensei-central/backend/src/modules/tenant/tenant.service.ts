import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Tenant } from '../../entities/tenant.entity';
import { TenantMetric } from '../../entities/tenant-metric.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(TenantMetric)
    private metricRepository: Repository<TenantMetric>,
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

  async create(createTenantDto: CreateTenantDto) {
    const existing = await this.tenantRepository.findOne({
      where: [
        { name: createTenantDto.name },
        { contactEmail: createTenantDto.contactEmail },
      ],
    });

    if (existing) {
      throw new ConflictException('Un tenant avec ce nom ou email existe déjà');
    }

    const licenseKey = this.generateLicenseKey();

    const tenant = this.tenantRepository.create({
      ...createTenantDto,
      licenseKey,
    });

    return await this.tenantRepository.save(tenant);
  }

  async findAll() {
    return await this.tenantRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string) {
    const tenant = await this.tenantRepository.findOne({
      where: { id },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant non trouvé');
    }

    return tenant;
  }

  async findByLicenseKey(licenseKey: string) {
    const tenant = await this.tenantRepository.findOne({
      where: { licenseKey },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant non trouvé');
    }

    return tenant;
  }

  async update(id: string, updateTenantDto: UpdateTenantDto) {
    const tenant = await this.findOne(id);

    Object.assign(tenant, updateTenantDto);
    return await this.tenantRepository.save(tenant);
  }

  async remove(id: string) {
    const tenant = await this.findOne(id);
    await this.tenantRepository.remove(tenant);
    return { message: 'Tenant supprimé avec succès' };
  }

  async getTenantMetrics(id: string, limit: number = 100) {
    await this.findOne(id); // Check if tenant exists

    return await this.metricRepository.find({
      where: { tenantId: id },
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }

  async getTenantHealth(id: string) {
    const tenant = await this.findOne(id);

    const latestMetric = await this.metricRepository.findOne({
      where: { tenantId: id },
      order: { timestamp: 'DESC' },
    });

    if (!latestMetric) {
      return {
        tenantId: id,
        tenantName: tenant.name,
        status: 'NO_DATA',
        message: 'Aucune métrique reçue',
      };
    }

    const now = new Date();
    const lastUpdate = new Date(latestMetric.timestamp);
    const minutesSinceUpdate =
      (now.getTime() - lastUpdate.getTime()) / 1000 / 60;

    let status = 'HEALTHY';
    let message = 'Le système fonctionne normalement';

    if (minutesSinceUpdate > 60) {
      status = 'CRITICAL';
      message = 'Aucune donnée depuis plus d\'une heure';
    } else if (minutesSinceUpdate > 30) {
      status = 'WARNING';
      message = 'Aucune donnée depuis plus de 30 minutes';
    }

    return {
      tenantId: id,
      tenantName: tenant.name,
      status,
      message,
      lastUpdate: latestMetric.timestamp,
      version: latestMetric.version,
      uptime: latestMetric.uptime,
      activeUsers: latestMetric.activeUsers,
      aiLatency: latestMetric.aiLatency,
    };
  }
}

