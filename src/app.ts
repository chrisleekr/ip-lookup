import fastify, { FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { ipLookupService } from '@/services/shared';
import logger from '@/utils/logger';
import { randomUUID } from 'crypto';
import { config } from '@/config';
import { IpLookupError } from '@/services/ip-lookup/ip-lookup.interface';

declare module 'fastify' {
  interface FastifyRequest {
    requestStartTime?: number;
    requestId: string;
  }
}

export async function buildApp(): Promise<FastifyInstance> {
  const app = fastify({
    logger: false, // We use our own logger
    requestTimeout: config.server.requestTimeout,
    bodyLimit: config.server.bodyLimit,
    genReqId: (req) =>
      (req?.headers?.['x-request-id'] as string) || randomUUID(),
  });

  // Add global hooks
  app.addHook('onRequest', async (request, reply) => {
    request.requestStartTime = Date.now();
    logger.info(`Incoming ${request.method} request`, {
      method: request.method,
      url: request.url,
      requestId: request.id,
      ip: request.ip,
    });
    reply.header('X-Request-Id', request.id);
    reply.header('X-Request-Start-Time', request.requestStartTime);
  });

  app.addHook('onSend', async (request, reply) => {
    /* istanbul ignore next: cannot test request.requestStartTime undefined. */
    const responseTime = Date.now() - (request.requestStartTime || Date.now());
    reply.header('X-Response-Time', responseTime);
  });

  app.addHook('onResponse', async (request, reply) => {
    logger.info(`Request completed`, {
      method: request.method,
      url: request.url,
      statusCode: reply.statusCode,
      responseTime: reply.getHeader('X-Response-Time'),
      requestId: request.id,
    });
  });

  // Global error handler
  app.setErrorHandler((error, request, reply) => {
    const statusCode = error instanceof IpLookupError ? 400 : 500;

    logger.error('Request error', {
      error: error.message,
      stack: error.stack,
      statusCode,
      requestId: request.id,
      url: request.url,
      method: request.method,
    });

    reply.status(statusCode).send({
      error: true,
      message: error.message,
      requestId: request.id,
      stack: error.stack,
    });
  });

  // Register plugins
  if (config.swagger.enabled) {
    await app.register(swagger, {
      swagger: {
        info: {
          title: 'IP Information API',
          description: 'API for retrieving IP address information',
          version:
            process.env.npm_package_version ||
            /* istanbul ignore next: not gonna waste time to test it. */ '1.0.0',
        },
        host: config.swagger.host,
        schemes: [config.swagger.scheme],
        consumes: ['application/json'],
        produces: ['application/json'],
        tags: [
          { name: 'ip-lookup', description: 'IP lookup endpoints' },
          { name: 'health', description: 'Health check endpoints' },
          { name: 'metrics', description: 'Metrics endpoints' },
        ],
      },
    });

    await app.register(swaggerUi, {
      routePrefix: '/documentation',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: true,
      },
    });
  }

  // Initialise services
  try {
    await ipLookupService.initialise();
  } catch (error) {
    logger.error('Failed to initialise IP lookup service', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }

  // Register routes
  app.register(import('./routes/health'), { prefix: '/' });
  app.register(import('./routes/metrics'), { prefix: '/' });
  app.register(import('./routes/ip-lookup'), { prefix: '/api/v1' });

  app.addHook('onClose', async () => {
    logger.info('Shutting down application');
  });

  return app;
}
