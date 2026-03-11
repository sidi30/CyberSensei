import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { AdminUser } from '../../entities/admin-user.entity';
import { LoginDto } from './dto/login.dto';
import { CreateAdminDto } from './dto/create-admin.dto';

@Injectable()
export class AdminAuthService {
  private readonly logger = new Logger(AdminAuthService.name);

  constructor(
    @InjectRepository(AdminUser)
    private adminUserRepository: Repository<AdminUser>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.adminUserRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!user || !user.active) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Update last login
    user.lastLoginAt = new Date();
    await this.adminUserRepository.save(user);

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  async createAdmin(createAdminDto: CreateAdminDto) {
    const existing = await this.adminUserRepository.findOne({
      where: { email: createAdminDto.email },
    });

    if (existing) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà');
    }

    const passwordHash = await bcrypt.hash(createAdminDto.password, 12);

    const admin = this.adminUserRepository.create({
      ...createAdminDto,
      passwordHash,
    });

    await this.adminUserRepository.save(admin);

    const { passwordHash: _, ...result } = admin;
    return result;
  }

  async getProfile(userId: string) {
    const user = await this.adminUserRepository.findOne({
      where: { id: userId },
      select: ['id', 'name', 'email', 'role', 'active', 'createdAt', 'lastLoginAt'],
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    return user;
  }

  async getAllAdmins() {
    const admins = await this.adminUserRepository.find({
      select: ['id', 'name', 'email', 'role', 'active', 'createdAt', 'lastLoginAt'],
    });
    return admins;
  }

  async initializeDefaultAdmin() {
    const count = await this.adminUserRepository.count();
    if (count === 0) {
      const adminEmail = this.configService.get<string>('ADMIN_EMAIL');
      const adminPassword = this.configService.get<string>('ADMIN_PASSWORD');

      if (!adminEmail || !adminPassword) {
        this.logger.warn(
          'ADMIN_EMAIL et ADMIN_PASSWORD doivent être définis dans les variables d\'environnement pour créer l\'admin par défaut',
        );
        return;
      }

      if (adminPassword.length < 12) {
        this.logger.warn(
          'ADMIN_PASSWORD doit contenir au minimum 12 caractères pour la production',
        );
      }

      const defaultAdmin = {
        name: 'Super Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'SUPERADMIN' as any,
      };
      await this.createAdmin(defaultAdmin);
      this.logger.log(`Admin par défaut créé: ${defaultAdmin.email}`);
    }
  }
}
