import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AdminUser } from '../../entities/admin-user.entity';
import { LoginDto } from './dto/login.dto';
import { CreateAdminDto } from './dto/create-admin.dto';

@Injectable()
export class AdminAuthService {
  constructor(
    @InjectRepository(AdminUser)
    private adminUserRepository: Repository<AdminUser>,
    private jwtService: JwtService,
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

    const passwordHash = await bcrypt.hash(createAdminDto.password, 10);

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
      const defaultAdmin = {
        name: 'Super Admin',
        email: process.env.ADMIN_EMAIL || 'admin@cybersensei.com',
        password: process.env.ADMIN_PASSWORD || 'Admin@123456',
        role: 'SUPERADMIN' as any,
      };
      await this.createAdmin(defaultAdmin);
      console.log('✅ Admin par défaut créé:', defaultAdmin.email);
    }
  }
}

