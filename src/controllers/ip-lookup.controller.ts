import { FastifyReply, FastifyRequest } from 'fastify';
import { IpValidator } from '@/utils/ip-validator';
import logger from '@/utils/logger';
import { ipLookupService } from '@/services/shared';
import { IpLookupResult } from '@/services/ip-lookup/ip-lookup.interface';
import { IpQuerystring } from '@/routes/schemas/ip-lookup/query.schema';
import { config } from '@/config';

/**
 * Controller for IP lookup operations.
 * Handles requests to lookup information about IP addresses using multiple providers.
 * Supports both single IP and batch IP lookups with rate limiting and timeout protection.
 */
export class IpLookupController {
  // Constants for request constraints from config
  private static readonly MAX_IPS_PER_REQUEST =
    config.ipLookup.maxIpsPerRequest;
  private static readonly REQUEST_TIMEOUT_MS = config.ipLookup.requestTimeoutMs;
  private static readonly CACHE_CONTROL_MAX_AGE =
    config.ipLookup.cacheControlMaxAge;
  private static readonly CACHE_CONTROL_STALE_IF_ERROR =
    config.ipLookup.cacheControlStaleIfError;

  // Log the configuration on startup
  static {
    logger.info('IP Lookup Controller initialised with configuration', {
      maxIpsPerRequest: IpLookupController.MAX_IPS_PER_REQUEST,
      requestTimeoutMs: IpLookupController.REQUEST_TIMEOUT_MS,
      cacheControlMaxAge: IpLookupController.CACHE_CONTROL_MAX_AGE,
      cacheControlStaleIfError: IpLookupController.CACHE_CONTROL_STALE_IF_ERROR,
    });
  }

  /**
   * Get information about one or more IP addresses.
   * @param request FastifyRequest with IP addresses in query
   * @param reply FastifyReply for sending response
   * @returns Promise<{results: IpLookupResult[]}>
   * @throws Error if request is invalid or lookup fails
   */
  static async getIPInfo(
    request: FastifyRequest<{ Querystring: IpQuerystring }>,
    reply: FastifyReply,
  ): Promise<{ results: IpLookupResult[] }> {
    const { ip } = request.query;

    logger.info('Processing IP lookup request', {
      requestId: request.id,
      ip,
      userAgent: request.headers['user-agent'],
    });

    try {
      if (!ip) {
        logger.warn('IP address missing in request', { requestId: request.id });
        reply.status(400);
        throw new Error('IP address is required');
      }

      // Convert single IP to array for consistent handling
      const ipAddresses = Array.isArray(ip) ? ip : [ip];

      // Rate limiting check
      if (ipAddresses.length > IpLookupController.MAX_IPS_PER_REQUEST) {
        logger.warn('Too many IPs in request', {
          requestId: request.id,
          count: ipAddresses.length,
          limit: IpLookupController.MAX_IPS_PER_REQUEST,
        });
        reply.status(400);
        throw new Error(
          `Maximum of ${IpLookupController.MAX_IPS_PER_REQUEST} IPs allowed per request`,
        );
      }

      logger.info('Processing IP addresses', {
        requestId: request.id,
        count: ipAddresses.length,
        addresses: ipAddresses,
      });

      // Validate all IPs first
      const invalidIps = ipAddresses.filter(
        (addr) => !IpValidator.isValidIp(addr),
      );
      if (invalidIps.length > 0) {
        logger.warn('Invalid IP addresses detected', {
          requestId: request.id,
          invalidIps,
        });
        reply.status(400);
        throw new Error(`Invalid IP addresses found: ${invalidIps.join(', ')}`);
      }

      // Lookup all IPs in parallel with timeout protection
      logger.info('Starting parallel IP lookups', {
        requestId: request.id,
        count: ipAddresses.length,
      });

      const timeoutMs = IpLookupController.REQUEST_TIMEOUT_MS;
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error(`Request timeout after ${timeoutMs}ms`)),
          timeoutMs,
        ),
      );

      const lookupPromise = Promise.all(
        ipAddresses.map(async (addr) => {
          try {
            logger.info('Looking up individual IP', {
              requestId: request.id,
              ip: addr,
            });
            const result = await ipLookupService.lookup(addr);
            logger.info('Successfully looked up IP', {
              requestId: request.id,
              ip: addr,
            });
            return result;
          } catch (error) {
            logger.error('Error looking up IP', {
              requestId: request.id,
              ip: addr,
              error: error instanceof Error ? error.message : String(error),
              stack: error instanceof Error ? error.stack : undefined,
            });
            // Return partial result with error information
            return {
              ip: addr,
              providers: {},
              lastUpdated: new Date().toISOString(),
              error: error instanceof Error ? error.message : String(error),
            } as IpLookupResult;
          }
        }),
      );

      // Race between timeout and lookup
      const results = await Promise.race([lookupPromise, timeoutPromise]);

      logger.info('Completed all IP lookups', {
        requestId: request.id,
        successCount: results.filter((r) => !r.error).length,
        errorCount: results.filter((r) => r.error).length,
      });

      // Set cache control headers
      reply.header(
        'Cache-Control',
        `public, max-age=${IpLookupController.CACHE_CONTROL_MAX_AGE}, stale-if-error=${IpLookupController.CACHE_CONTROL_STALE_IF_ERROR}`,
      );

      return { results };
    } catch (error) {
      logger.error('Error processing IP info request', {
        requestId: request.id,
        ip,
        error:
          error instanceof Error
            ? error.message
            : /* istanbul ignore next: not gonna waste time to test this */ String(
                error,
              ),

        stack:
          error instanceof Error
            ? error.stack
            : /* istanbul ignore next: not gonna waste time to test this */ undefined,
      });

      reply.status(500);

      throw error;
    }
  }
}
