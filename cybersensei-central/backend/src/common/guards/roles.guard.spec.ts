import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from './roles.guard';
import { AdminRole } from '../../entities/admin-user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  function createMockContext(user?: any): ExecutionContext {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user }),
      }),
    } as unknown as ExecutionContext;
  }

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should allow access when no roles are required (undefined)', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
      const context = createMockContext({ role: AdminRole.SUPPORT });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow access when roles array is empty', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);
      const context = createMockContext({ role: AdminRole.SUPPORT });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow access when user has the required role', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([AdminRole.SUPERADMIN]);
      const context = createMockContext({ role: AdminRole.SUPERADMIN });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow access when user has one of the required roles', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([AdminRole.SUPERADMIN, AdminRole.SUPPORT]);
      const context = createMockContext({ role: AdminRole.SUPPORT });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should throw ForbiddenException when user has wrong role', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([AdminRole.SUPERADMIN]);
      const context = createMockContext({ role: AdminRole.SUPPORT });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        /rôle SUPERADMIN requis/,
      );
    });

    it('should throw ForbiddenException when user is missing', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([AdminRole.SUPERADMIN]);
      const context = createMockContext(undefined);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        /aucun rôle détecté/,
      );
    });

    it('should throw ForbiddenException when user has no role property', () => {
      jest
        .spyOn(reflector, 'getAllAndOverride')
        .mockReturnValue([AdminRole.SUPERADMIN]);
      const context = createMockContext({ email: 'test@test.com' });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        /aucun rôle détecté/,
      );
    });

    it('should call reflector with correct metadata key and targets', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
      const context = createMockContext();

      guard.canActivate(context);

      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    });
  });
});
