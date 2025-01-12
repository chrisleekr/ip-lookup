import {
  IpLookupProvider,
  IpLookupResult,
  ProviderResponse,
  IpLookupError,
  IpLookupMetrics,
  ProviderStatus,
} from './ip-lookup.interface';
import logger from '@/utils/logger';
import { Cache } from '@/utils/cache/cache.interface';
import { Metrics } from '@/routes/schemas/metrics/response.schema';

export class IpLookupService {
  private providers: IpLookupProvider[] = [];
  private cache: Cache;
  private metrics: IpLookupMetrics = {
    totalRequests: 0,
    errors: 0,
  };

  constructor(providers: IpLookupProvider[], cache: Cache) {
    this.providers = providers;
    this.cache = cache;
  }

  async initialise(): Promise<void> {
    logger.info('Initializing IP lookup service providers', {
      providerCount: this.providers.length,
      providers: this.providers.map((p) => p.name),
    });

    const results = await Promise.allSettled(
      this.providers.map(async (provider) => {
        try {
          await provider.initialise();
          logger.info(`Provider ${provider.name} initialised successfully`);
          return true;
        } catch (error) {
          logger.error(`Failed to initialise provider ${provider.name}`, {
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          });
          return false;
        }
      }),
    );

    const successfulInits = results.filter(
      (result) => result.status === 'fulfilled' && result.value,
    ).length;

    if (successfulInits === 0) {
      logger.error('Failed to initialise all providers', {
        totalProviders: this.providers.length,
        results: results.map((r, i) => ({
          provider: this.providers[i].name,
          status: r.status,
        })),
      });
      throw new Error('Failed to initialise all providers');
    }

    logger.info(
      `Initialised ${successfulInits}/${this.providers.length} providers`,
    );
  }

  async lookup(ip: string): Promise<IpLookupResult> {
    this.metrics.totalRequests++;
    logger.info('Starting IP lookup', { ip });

    try {
      if (!ip) {
        logger.warn('IP lookup attempted with empty IP address');
        throw new IpLookupError(
          'IP address is required',
          'IpLookupService',
          ip,
        );
      }

      const providerResults: { [key: string]: unknown } = {};
      const errors: Error[] = [];

      for (const provider of this.providers) {
        try {
          const isAvailable = await provider.isAvailable();

          if (isAvailable) {
            // Check cache for this provider's result
            const cacheKey = `${ip}:${provider.name.toLowerCase()}`;
            const cachedProviderResult =
              await this.cache.get<ProviderResponse>(cacheKey);

            if (cachedProviderResult) {
              logger.info('Cache hit for IP lookup', {
                provider: provider.name,
                ip,
                cacheKey,
              });
              providerResults[provider.name.toLowerCase()] =
                cachedProviderResult.data;
              continue;
            }

            logger.info('Cache miss, performing provider lookup', {
              provider: provider.name,
              ip,
              cacheKey,
            });

            const providerResult = await provider.lookup(ip);

            if (!providerResult) {
              const error = new IpLookupError(
                `Provider ${provider.name} returned null result`,
                provider.name,
                ip,
              );
              logger.warn('Provider returned null result', {
                provider: provider.name,
                ip,
              });
              errors.push(error);
              continue;
            }

            // Validate result before including
            this.cache.set(cacheKey, providerResult);
            providerResults[provider.name.toLowerCase()] = providerResult.data;
            logger.info('Successfully cached provider result', {
              provider: provider.name,
              ip,
              cacheKey,
            });
          }
        } catch (error) {
          const lookupError =
            error instanceof IpLookupError
              ? error
              : new IpLookupError(
                  `Provider ${provider.name} lookup failed`,
                  provider.name,
                  ip,
                  error instanceof Error ? error : new Error(String(error)),
                );
          errors.push(lookupError);
          logger.error('Provider lookup failed', {
            provider: provider.name,
            ip,
            error: lookupError.message,
            stack: lookupError.stack,
          });
        }
      }

      // If we have any successful results, return combined data
      if (Object.keys(providerResults).length > 0) {
        const result: IpLookupResult = {
          ip,
          providers: providerResults,
          lastUpdated: new Date().toISOString(),
        };

        // If there were some errors but we still got results, include them in the response
        if (errors.length > 0) {
          result.error = errors.map((e) => e.message).join('; ');
          logger.warn('Some providers failed during IP lookup', {
            ip,
            successfulProviders: Object.keys(providerResults),
            errorCount: errors.length,
            errors: errors.map((e) => e.message),
          });
        } else {
          logger.info('Successfully completed IP lookup with all providers', {
            ip,
            providers: Object.keys(providerResults),
          });
        }

        return result;
      }

      // If all providers failed, throw an error with details
      this.metrics.errors++;
      const combinedError = new IpLookupError(
        'All providers failed to lookup IP',
        'IpLookupService',
        ip,
      );
      this.metrics.lastError = {
        timestamp: new Date().toISOString(),
        message: combinedError.message,
      };

      logger.error('All providers failed during IP lookup', {
        ip,
        errorCount: errors.length,
        errors: errors.map((e) => e.message),
      });

      throw combinedError;
    } catch (error) {
      this.metrics.errors++;

      const serviceError = error as Error;

      this.metrics.lastError = {
        timestamp: new Date().toISOString(),
        message: serviceError.message,
      };

      logger.error('IP lookup service error', {
        ip,
        error: serviceError.message,
        stack: serviceError.stack,
      });

      throw serviceError;
    }
  }

  async getMetrics(): Promise<Metrics> {
    const cacheMetrics = await this.cache.getMetrics();
    return {
      ...this.metrics,
      cache: {
        hits: cacheMetrics.hits,
        misses: cacheMetrics.misses,
        keys: cacheMetrics.keys,
      },
    };
  }

  async getProviderStatus(): Promise<ProviderStatus[]> {
    return Promise.all(
      this.providers.map(async (provider) => ({
        name: provider.name,
        available: await provider.isAvailable(),
      })),
    );
  }

  async close(): Promise<void> {
    this.cache.close();
  }
}
