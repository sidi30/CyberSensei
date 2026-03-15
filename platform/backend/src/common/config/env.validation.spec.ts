import { validateEnv } from './env.validation';

describe('validateEnv', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset process.env before each test
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  function setValidEnv() {
    process.env.POSTGRES_HOST = 'localhost';
    process.env.POSTGRES_PASSWORD = 'securepassword123';
    process.env.JWT_SECRET = 'a-very-long-secret-key-that-is-at-least-32-characters-long';
    process.env.CORS_ORIGINS = 'http://localhost:3000';
  }

  describe('in development mode', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('should not throw with all valid env vars', () => {
      setValidEnv();

      expect(() => validateEnv()).not.toThrow();
    });

    it('should not throw with missing required vars (warnings only)', () => {
      // In dev mode, missing vars produce warnings, not errors
      delete process.env.POSTGRES_HOST;
      delete process.env.POSTGRES_PASSWORD;
      delete process.env.JWT_SECRET;
      delete process.env.CORS_ORIGINS;

      expect(() => validateEnv()).not.toThrow();
    });

    it('should not throw when JWT_SECRET is too short (warning only)', () => {
      setValidEnv();
      process.env.JWT_SECRET = 'short';

      expect(() => validateEnv()).not.toThrow();
    });

    it('should not throw when JWT_SECRET contains forbidden pattern (warning only)', () => {
      setValidEnv();
      process.env.JWT_SECRET = 'dev-secret-that-is-long-enough-for-minimum-length';

      expect(() => validateEnv()).not.toThrow();
    });
  });

  describe('in production mode', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    it('should not throw with all valid env vars', () => {
      setValidEnv();

      expect(() => validateEnv()).not.toThrow();
    });

    it('should throw when required POSTGRES_HOST is missing', () => {
      setValidEnv();
      delete process.env.POSTGRES_HOST;

      expect(() => validateEnv()).toThrow(/Configuration invalide/);
    });

    it('should throw when required JWT_SECRET is missing', () => {
      setValidEnv();
      delete process.env.JWT_SECRET;

      expect(() => validateEnv()).toThrow(/Configuration invalide/);
    });

    it('should throw when required CORS_ORIGINS is missing', () => {
      setValidEnv();
      delete process.env.CORS_ORIGINS;

      expect(() => validateEnv()).toThrow(/Configuration invalide/);
    });

    it('should throw when POSTGRES_PASSWORD is too short (minLength: 8)', () => {
      setValidEnv();
      process.env.POSTGRES_PASSWORD = 'short';

      expect(() => validateEnv()).toThrow(/Configuration invalide/);
    });

    it('should throw when JWT_SECRET is shorter than 32 characters', () => {
      setValidEnv();
      process.env.JWT_SECRET = 'too-short-secret';

      expect(() => validateEnv()).toThrow(/Configuration invalide/);
    });

    it('should throw when JWT_SECRET contains forbidden pattern "dev-secret"', () => {
      setValidEnv();
      process.env.JWT_SECRET = 'dev-secret-that-is-definitely-long-enough-for-32-chars';

      expect(() => validateEnv()).toThrow(/Configuration invalide/);
    });

    it('should throw when JWT_SECRET contains forbidden pattern "change-me"', () => {
      setValidEnv();
      process.env.JWT_SECRET = 'change-me-this-is-a-long-enough-secret-for-production';

      expect(() => validateEnv()).toThrow(/Configuration invalide/);
    });

    it('should throw when multiple required vars are missing', () => {
      // All vars missing in production
      delete process.env.POSTGRES_HOST;
      delete process.env.POSTGRES_PASSWORD;
      delete process.env.JWT_SECRET;
      delete process.env.CORS_ORIGINS;

      expect(() => validateEnv()).toThrow(/Configuration invalide/);
    });

    it('should include error count in the error message', () => {
      setValidEnv();
      delete process.env.POSTGRES_HOST;
      delete process.env.JWT_SECRET;

      expect(() => validateEnv()).toThrow(/2 erreur\(s\) détectée\(s\)/);
    });
  });
});
