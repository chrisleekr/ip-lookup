import { FastifyPluginAsync } from 'fastify';
import { IpLookupController } from '@/controllers/ip-lookup.controller';
import { ipLookupQuerySchema } from '@/routes/schemas/ip-lookup/query.schema';
import { ipLookupResponseSchema } from '@/routes/schemas/ip-lookup/response.schema';

const ipLookup: FastifyPluginAsync = async (fastify) => {
  fastify.route({
    method: 'GET',
    url: '/ip-lookup',
    schema: {
      tags: ['ip-lookup'],
      description: 'Get IP information by looking up various providers',
      querystring: ipLookupQuerySchema,
      response: {
        200: ipLookupResponseSchema,
      },
    },
    handler: IpLookupController.getIPInfo,
  });
};

export default ipLookup;
