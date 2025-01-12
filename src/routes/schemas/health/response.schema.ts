import { Metrics } from '@/routes/schemas/metrics';

export interface ProviderStatus {
  name: string;
  available: boolean;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  providers: ProviderStatus[];
  metrics: Metrics;
}

export const healthResponseSchema = {
  type: 'object',
  properties: {
    status: { type: 'string' },
    timestamp: { type: 'string' },
    providers: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          available: { type: 'boolean' },
        },
      },
    },
    metrics: {
      type: 'object',
      properties: {
        totalRequests: { type: 'number' },
        cacheHits: { type: 'number' },
        cacheMisses: { type: 'number' },
        errors: { type: 'number' },
        lastError: {
          type: 'object',
          nullable: true,
          properties: {
            timestamp: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
  },
} as const;
