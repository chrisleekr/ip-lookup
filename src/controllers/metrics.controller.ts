import { Metrics } from '@/routes/schemas/metrics';
import { ipLookupService } from '@/services/shared';

export class MetricsController {
  static async getMetrics(): Promise<Metrics> {
    return ipLookupService.getMetrics();
  }
}
