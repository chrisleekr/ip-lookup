import NodeCache from 'node-cache';
import logger from '@/utils/logger';
import { Cache, CacheOptions, CacheStats } from './cache.interface';

export class NodeMemoryCache implements Cache {
  private cache: NodeCache;
  private metrics: CacheStats = {
    hits: 0,
    misses: 0,
    keys: 0,
  };

  constructor(config: CacheOptions = {}) {
    const defaultConfig = {
      stdTTL: parseInt(process.env.CACHE_TTL || '3600', 10),
      checkperiod: parseInt(process.env.CACHE_CHECK_PERIOD || '120', 10),
      useClones: false,
      deleteOnExpire: true,
      maxKeys: parseInt(process.env.CACHE_MAX_KEYS || '5000', 10),
    };

    const finalConfig = { ...defaultConfig, ...config };
    this.validateConfig(finalConfig);
    this.cache = new NodeCache(finalConfig);

    // Setup cache events
    this.cache.on('expired', (key: string, value: unknown) => {
      logger.debug('Cache entry expired', { key, value });
    });

    this.cache.on('error', (err: Error) => {
      logger.error('Cache error occurred', {
        error: err.message,
        stack: err.stack,
      });
      this.metrics.lastError = {
        timestamp: new Date().toISOString(),
        message: err.message,
      };
    });

    this.cache.on('flush', () => {
      logger.info('Cache flushed');
      this.metrics.keys = 0;
    });

    this.cache.on('del', (key: string) => {
      logger.debug('Cache entry deleted', { key });
      this.metrics.keys = this.cache.keys().length;
    });

    this.cache.on('set', () => {
      this.metrics.keys = this.cache.keys().length;
    });
  }

  private validateConfig(config: CacheOptions): void {
    if (
      config.stdTTL !== undefined &&
      (config.stdTTL <= 0 || !Number.isInteger(config.stdTTL))
    ) {
      throw new Error('Cache TTL must be a positive integer');
    }

    if (
      config.checkperiod !== undefined &&
      (config.checkperiod <= 0 || !Number.isInteger(config.checkperiod))
    ) {
      throw new Error('Cache check period must be a positive integer');
    }

    if (
      config.maxKeys !== undefined &&
      (config.maxKeys <= 0 || !Number.isInteger(config.maxKeys))
    ) {
      throw new Error('Cache max keys must be a positive integer');
    }
  }

  get<T>(key: string): Promise<T | undefined> {
    const value = this.cache.get<T>(key);
    if (value !== undefined) {
      this.metrics.hits++;
      logger.debug('Cache hit', { key });
    } else {
      this.metrics.misses++;
      logger.debug('Cache miss', { key });
    }
    return Promise.resolve(value);
  }

  set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    try {
      // Convert undefined ttl to number to match node-cache types
      const ttlValue = ttl === undefined ? 0 : ttl;
      const success = this.cache.set(key, value, ttlValue);
      if (success) {
        logger.debug('Cache set successful', { key });
      } else {
        logger.warn('Cache set failed', { key });
      }
      return Promise.resolve(success);
    } catch (error) {
      logger.error('Cache set error', {
        key,
        error: error instanceof Error ? error.message : String(error),
      });
      return Promise.resolve(false);
    }
  }

  del(key: string): Promise<number> {
    return Promise.resolve(this.cache.del(key));
  }

  flush(): Promise<void> {
    return Promise.resolve(this.cache.flushAll());
  }

  getMetrics(): Promise<CacheStats> {
    return Promise.resolve({ ...this.metrics });
  }

  close(): Promise<void> {
    return Promise.resolve(this.cache.close());
  }
}
