export const metricsResponseSchema = {
  type: 'object',
  properties: {
    totalRequests: { type: 'number' },
    errors: { type: 'number' },
    cache: {
      type: 'object',
      properties: {
        hits: { type: 'number' },
        misses: { type: 'number' },
        keys: { type: 'number' },
      },
    },
    lastError: {
      type: 'object',
      nullable: true,
      properties: {
        timestamp: { type: 'string' },
        message: { type: 'string' },
      },
    },
  },
} as const;

export interface Metrics {
  totalRequests: number;
  errors: number;
  cache: {
    hits: number;
    misses: number;
    keys: number;
  };
  lastError?: {
    timestamp: string;
    message: string;
  };
}
