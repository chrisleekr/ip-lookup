import { FastifyPluginAsync } from 'fastify';
import { MetricsController } from '@/controllers/metrics.controller';
import { metricsResponseSchema } from '@/routes/schemas/metrics';

const metrics: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    '/metrics',
    {
      schema: {
        tags: ['metrics'],
        response: {
          200: metricsResponseSchema,
        },
      },
    },
    MetricsController.getMetrics,
  );
};

export default metrics;
