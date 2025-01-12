import { FastifyPluginAsync } from 'fastify';
import { HealthController } from '@/controllers/health.controller';
import { healthResponseSchema } from '@/routes/schemas/health/response.schema';

const health: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    '/health',
    {
      schema: {
        tags: ['health'],
        response: {
          200: healthResponseSchema,
        },
      },
    },
    HealthController.getHealth,
  );
};

export default health;
