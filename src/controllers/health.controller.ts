import { HealthResponse } from '@/routes/schemas/health/response.schema';
import { ipLookupService } from '@/services/shared';

export class HealthController {
  static async getHealth(): Promise<HealthResponse> {
    const [providers, metrics] = await Promise.all([
      ipLookupService.getProviderStatus(),
      ipLookupService.getMetrics(),
    ]);

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      providers,
      metrics,
    };
  }
}
