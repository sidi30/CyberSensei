import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should return status ok with timestamp and uptime', () => {
      const result = controller.check();

      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
      expect(typeof result.timestamp).toBe('string');
      expect(typeof result.uptime).toBe('number');
    });

    it('should return a valid ISO timestamp', () => {
      const result = controller.check();
      const parsedDate = new Date(result.timestamp);

      expect(parsedDate.toISOString()).toBe(result.timestamp);
    });

    it('should return a positive uptime value', () => {
      const result = controller.check();

      expect(result.uptime).toBeGreaterThanOrEqual(0);
    });
  });
});
