import logger from '@/utils/logger';
import { CacheStats } from '../cache.interface';

let mockNodeCacheOn: jest.Mock;
let mockNodeCacheSet: jest.Mock;
let mockNodeCacheGet: jest.Mock;
let mockNodeCacheDel: jest.Mock;
let mockNodeCacheFlushAll: jest.Mock;
let mockNodeCacheKeys: jest.Mock;
let mockNodeCacheClose: jest.Mock;
const setupMocks = (): void => {
  jest.mock('node-cache', () => {
    return jest.fn().mockImplementation(() => ({
      on: mockNodeCacheOn || jest.fn(),
      set: mockNodeCacheSet || jest.fn(),
      get: mockNodeCacheGet || jest.fn(),
      del: mockNodeCacheDel || jest.fn(),
      flushAll: mockNodeCacheFlushAll || jest.fn(),
      keys: mockNodeCacheKeys || jest.fn().mockReturnValue([]),
      close: mockNodeCacheClose || jest.fn(),
    }));
  });
};

describe('NodeMemoryCache', () => {
  let cache: import('../cache.node-memory').NodeMemoryCache;

  beforeEach(() => {
    jest.resetModules();
    mockNodeCacheOn = jest.fn();
    mockNodeCacheSet = jest.fn();
    mockNodeCacheGet = jest.fn();
    mockNodeCacheDel = jest.fn();
    mockNodeCacheFlushAll = jest.fn();
    mockNodeCacheClose = jest.fn();
    mockNodeCacheKeys = jest.fn();
  });

  describe('constructor', () => {
    describe('when config is not provided', () => {
      beforeEach(() => {
        process.env.CACHE_TTL = '60';
        process.env.CACHE_CHECK_PERIOD = '30';
        setupMocks();
        const { NodeMemoryCache } = require('../cache.node-memory');
        cache = new NodeMemoryCache({});
      });

      it('should create a new cache instance', () => {
        expect(cache).toBeDefined();
      });
    });

    describe('when config is not provided without process.env', () => {
      beforeEach(() => {
        delete process.env.CACHE_TTL;
        delete process.env.CACHE_CHECK_PERIOD;
        setupMocks();
        const { NodeMemoryCache } = require('../cache.node-memory');
        cache = new NodeMemoryCache();
      });

      it('should create a new cache instance', () => {
        expect(cache).toBeDefined();
      });
    });

    describe('when process.env is not set', () => {
      beforeEach(() => {
        // Loop process.env and delete each key
        Object.keys(process.env).forEach((key) => {
          delete process.env[key];
        });
        setupMocks();
        const { NodeMemoryCache } = require('../cache.node-memory');
        cache = new NodeMemoryCache({});
      });

      it('should create a new cache instance', () => {
        expect(cache).toBeDefined();
      });
    });

    describe('validateConfig', () => {
      let error: Error;
      describe('when stdTTL is not a number', () => {
        beforeEach(() => {
          process.env.CACHE_TTL = 'not-a-number';
          setupMocks();
          const { NodeMemoryCache } = require('../cache.node-memory');
          try {
            cache = new NodeMemoryCache({});
          } catch (err) {
            error = err as Error;
          }
        });

        it('should throw an error', () => {
          expect(error.message).toBe('Cache TTL must be a positive integer');
        });
      });

      describe('when checkperiod is not a number', () => {
        beforeEach(() => {
          process.env.CACHE_TTL = '60';
          process.env.CACHE_CHECK_PERIOD = 'not-a-number';
          setupMocks();
          const { NodeMemoryCache } = require('../cache.node-memory');
          try {
            cache = new NodeMemoryCache({});
          } catch (err) {
            error = err as Error;
          }
        });

        it('should throw an error', () => {
          expect(error.message).toBe(
            'Cache check period must be a positive integer',
          );
        });
      });

      describe('when maxKeys is not a number', () => {
        beforeEach(() => {
          process.env.CACHE_TTL = '60';
          process.env.CACHE_CHECK_PERIOD = '30';
          process.env.CACHE_MAX_KEYS = 'not-a-number';
          setupMocks();
          const { NodeMemoryCache } = require('../cache.node-memory');
          try {
            cache = new NodeMemoryCache({});
          } catch (err) {
            error = err as Error;
          }
        });

        it('should throw an error', () => {
          expect(error.message).toBe(
            'Cache max keys must be a positive integer',
          );
        });
      });
    });

    describe('this.cache.on', () => {
      let metrics: CacheStats;

      let expiredHandler: (key: string, value?: unknown) => void;
      let errorHandler: (err: Error) => void;
      let flushHandler: () => void;
      let delHandler: (key: string) => void;
      let setHandler: () => void;

      beforeEach(() => {
        process.env.CACHE_TTL = '60';
        process.env.CACHE_CHECK_PERIOD = '30';
        process.env.CACHE_MAX_KEYS = '1000';
        mockNodeCacheOn.mockImplementation(
          (event: string, handler: unknown) => {
            switch (event) {
              case 'expired':
                expiredHandler = handler as (
                  key: string,
                  value?: unknown,
                ) => void;
                break;
              case 'error':
                errorHandler = handler as (err: Error) => void;
                break;
              case 'flush':
                flushHandler = handler as () => void;
                break;
              case 'del':
                delHandler = handler as (key: string) => void;
                break;
              case 'set':
                setHandler = handler as () => void;
                break;
            }
          },
        );
        mockNodeCacheKeys = jest.fn().mockReturnValue(['test-key']);
        setupMocks();
        const { NodeMemoryCache } = require('../cache.node-memory');
        cache = new NodeMemoryCache({});
      });

      describe('expired event', () => {
        beforeEach(() => {
          expiredHandler('test-key', 'test-value');
        });

        it('should trigger logger.debug', () => {
          expect(logger.debug).toHaveBeenCalledWith('Cache entry expired', {
            key: 'test-key',
            value: 'test-value',
          });
        });
      });

      describe('error event', () => {
        const testError = new Error('test error');

        beforeEach(async () => {
          errorHandler(testError);
          metrics = await cache.getMetrics();
        });

        it('should set lastError', () => {
          expect(metrics.lastError).toEqual({
            timestamp: expect.any(String),
            message: 'test error',
          });
        });
      });

      describe('flush event', () => {
        beforeEach(async () => {
          flushHandler();
          metrics = await cache.getMetrics();
        });

        it('should set keys to 0', () => {
          expect(metrics.keys).toBe(0);
        });
      });

      describe('del event', () => {
        beforeEach(async () => {
          delHandler('test-key');
          metrics = await cache.getMetrics();
        });

        it('should trigger logger.debug', () => {
          expect(logger.debug).toHaveBeenCalledWith('Cache entry deleted', {
            key: 'test-key',
          });
        });

        it('should set keys to 1', () => {
          expect(metrics.keys).toBe(1);
        });
      });

      describe('set event', () => {
        beforeEach(async () => {
          setHandler();
          metrics = await cache.getMetrics();
        });

        it('should set keys to 1', () => {
          expect(metrics.keys).toBe(1);
        });
      });
    });
  });

  describe('get', () => {
    let result: string | undefined;

    beforeEach(() => {
      process.env.CACHE_TTL = '60';
      process.env.CACHE_CHECK_PERIOD = '30';
      process.env.CACHE_MAX_KEYS = '1000';
    });

    describe('when key is found', () => {
      beforeEach(async () => {
        mockNodeCacheGet.mockReturnValue('value');

        setupMocks();
        const { NodeMemoryCache } = require('../cache.node-memory');
        cache = new NodeMemoryCache({});

        result = await cache.get<string>('key');
      });

      it('should return the value', () => {
        expect(result).toBe('value');
      });
    });

    describe('when key is not found', () => {
      beforeEach(async () => {
        mockNodeCacheGet.mockReturnValue(undefined);

        setupMocks();
        const { NodeMemoryCache } = require('../cache.node-memory');
        cache = new NodeMemoryCache({});

        result = await cache.get<string>('key');
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('set', () => {
    let result: boolean;

    describe('when successfully set', () => {
      beforeEach(() => {
        mockNodeCacheSet.mockReturnValue(true);

        setupMocks();
        const { NodeMemoryCache } = require('../cache.node-memory');
        cache = new NodeMemoryCache({});
      });

      describe('when ttl is not provided', () => {
        beforeEach(async () => {
          result = await cache.set('key', 'value');
        });

        it('should trigger this.cache.set', () => {
          expect(mockNodeCacheSet).toHaveBeenCalledWith('key', 'value', 0);
        });

        it('should return true', () => {
          expect(result).toBe(true);
        });
      });

      describe('when ttl is provided', () => {
        beforeEach(async () => {
          result = await cache.set('key', 'value', 10);
        });

        it('should trigger this.cache.set', () => {
          expect(mockNodeCacheSet).toHaveBeenCalledWith('key', 'value', 10);
        });

        it('should return true', () => {
          expect(result).toBe(true);
        });
      });
    });

    describe('when failed to set', () => {
      beforeEach(async () => {
        mockNodeCacheSet.mockReturnValue(false);

        setupMocks();
        const { NodeMemoryCache } = require('../cache.node-memory');
        cache = new NodeMemoryCache({});

        result = await cache.set('key', 'value');
      });

      it('should return false', () => {
        expect(result).toBe(false);
      });
    });

    describe('when throw an error', () => {
      describe('when error is Error', () => {
        beforeEach(async () => {
          mockNodeCacheSet.mockImplementation(() => {
            throw new Error('test');
          });

          setupMocks();
          const { NodeMemoryCache } = require('../cache.node-memory');
          cache = new NodeMemoryCache({});

          result = await cache.set('key', 'value');
        });

        it('should return false', () => {
          expect(result).toBe(false);
        });
      });

      describe('when error is not Error', () => {
        beforeEach(async () => {
          mockNodeCacheSet.mockImplementation(() => {
            throw 'test';
          });

          setupMocks();
          const { NodeMemoryCache } = require('../cache.node-memory');
          cache = new NodeMemoryCache({});

          result = await cache.set('key', 'value');
        });

        it('should return false', () => {
          expect(result).toBe(false);
        });
      });
    });
  });

  describe('del', () => {
    let result: number;

    describe('when successfully deleted', () => {
      beforeEach(async () => {
        mockNodeCacheDel.mockReturnValue(1);

        setupMocks();
        const { NodeMemoryCache } = require('../cache.node-memory');
        cache = new NodeMemoryCache({});

        result = await cache.del('key');
      });

      it('should trigger this.cache.del', () => {
        expect(mockNodeCacheDel).toHaveBeenCalledWith('key');
      });

      it('should return 1', () => {
        expect(result).toBe(1);
      });
    });
  });

  describe('flush', () => {
    beforeEach(async () => {
      mockNodeCacheFlushAll.mockReturnValue(true);

      setupMocks();
      const { NodeMemoryCache } = require('../cache.node-memory');
      cache = new NodeMemoryCache({});

      await cache.flush();
    });

    it('should trigger this.cache.flushAll', () => {
      expect(mockNodeCacheFlushAll).toHaveBeenCalled();
    });
  });

  describe('getMetrics', () => {
    let metrics: CacheStats;
    beforeEach(async () => {
      setupMocks();
      const { NodeMemoryCache } = require('../cache.node-memory');
      cache = new NodeMemoryCache({});

      metrics = await cache.getMetrics();
    });

    it('should return metrics', () => {
      expect(metrics).toEqual({
        hits: 0,
        misses: 0,
        keys: 0,
      });
    });
  });

  describe('close', () => {
    beforeEach(async () => {
      mockNodeCacheClose.mockReturnValue(true);

      setupMocks();
      const { NodeMemoryCache } = require('../cache.node-memory');
      cache = new NodeMemoryCache({});

      await cache.close();
    });

    it('should trigger this.cache.close', () => {
      expect(mockNodeCacheClose).toHaveBeenCalled();
    });
  });
});
