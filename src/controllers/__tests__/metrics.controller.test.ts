import { Metrics } from '@/routes/schemas/metrics/response.schema';
import { MetricsController } from '../metrics.controller';

describe('controllers/metrics.controller.ts', () => {
  describe('getMetrics', () => {
    let response: Metrics;
    beforeEach(async () => {
      response = await MetricsController.getMetrics();
    });

    it('should return a metrics response', () => {
      expect(response).toEqual({
        totalRequests: 0,
        errors: 0,
        cache: { hits: 0, misses: 0, keys: 0 },
      });
    });
  });
});
