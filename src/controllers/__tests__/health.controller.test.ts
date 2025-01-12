import { HealthController } from '@/controllers/health.controller';
import { HealthResponse } from '@/routes/schemas/health/response.schema';

describe('controllers/health.controller.ts', () => {
  describe('getHealth', () => {
    let response: HealthResponse;
    beforeEach(async () => {
      response = await HealthController.getHealth();
    });

    it('should return a health response', () => {
      expect(response).toEqual({
        status: 'ok',
        timestamp: expect.any(String),
        providers: [
          {
            name: 'MaxMind',
            available: expect.any(Boolean),
          },
          {
            name: 'IPInfo',
            available: expect.any(Boolean),
          },
        ],
        metrics: {
          totalRequests: 0,
          cache: { hits: 0, misses: 0, keys: 0 },
          errors: 0,
        },
      });
    });
  });
});
