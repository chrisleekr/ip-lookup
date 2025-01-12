import { Cache } from '@/utils/cache/cache.interface';
import {
  IpLookupError,
  IpLookupProvider,
  IpLookupResult,
  ProviderStatus,
} from '../ip-lookup.interface';
import { Metrics } from '@/routes/schemas/metrics';

let mockIpLookupProviderInitialise: jest.Mock = jest.fn();
let mockIpLookupProviderLookup: jest.Mock = jest.fn();
let mockIpLookupProviderIsAvailable: jest.Mock = jest.fn();

let mockIpLookupProvider1: jest.Mocked<IpLookupProvider>;
let mockIpLookupProvider2: jest.Mocked<IpLookupProvider>;

let mockCacheGet: jest.Mock = jest.fn();
let mockCacheSet: jest.Mock = jest.fn();
let mockCacheDel: jest.Mock = jest.fn();
let mockCacheFlush: jest.Mock = jest.fn();
let mockCacheGetMetrics: jest.Mock = jest.fn();
let mockCacheClose: jest.Mock = jest.fn();

let mockCache: jest.Mocked<Cache>;

const setupMocks = (): void => {
  mockIpLookupProvider1 = {
    name: 'mockProvider',
    initialise: mockIpLookupProviderInitialise,
    lookup: mockIpLookupProviderLookup,
    isAvailable: mockIpLookupProviderIsAvailable,
  };

  mockIpLookupProvider2 = {
    name: 'mockProvider2',
    initialise: mockIpLookupProviderInitialise,
    lookup: mockIpLookupProviderLookup,
    isAvailable: mockIpLookupProviderIsAvailable,
  };

  mockCache = {
    get: mockCacheGet,
    set: mockCacheSet,
    del: mockCacheDel,
    flush: mockCacheFlush,
    getMetrics: mockCacheGetMetrics,
    close: mockCacheClose,
  };
};

describe('services/ip-lookup/ip-lookup.service', () => {
  let error: Error;

  describe('initialise', () => {
    describe('when all providers initialise successfully', () => {
      beforeEach(async () => {
        mockIpLookupProviderInitialise = jest.fn().mockResolvedValue(true);
        setupMocks();

        const { IpLookupService } = require('../ip-lookup.service');
        const ipLookupService = new IpLookupService(
          [mockIpLookupProvider1, mockIpLookupProvider2],
          mockCache,
        );

        await ipLookupService.initialise();
      });

      it('should execute the initialisation of all providers', () => {
        expect(mockIpLookupProviderInitialise).toHaveBeenCalledTimes(2);
      });
    });

    describe('when provider is failed to initialise', () => {
      describe('when error is thrown', () => {
        beforeEach(async () => {
          mockIpLookupProviderInitialise = jest
            .fn()
            .mockRejectedValue(new Error('Failed to initialise'));

          setupMocks();
          const { IpLookupService } = require('../ip-lookup.service');
          const ipLookupService = new IpLookupService(
            [mockIpLookupProvider1, mockIpLookupProvider2],
            mockCache,
          );

          try {
            await ipLookupService.initialise();
          } catch (e) {
            error = e as Error;
          }
        });

        it('should throw an error', () => {
          expect(error.message).toBe('Failed to initialise all providers');
        });
      });

      describe('when error is non-Error', () => {
        beforeEach(async () => {
          mockIpLookupProviderInitialise = jest
            .fn()
            .mockRejectedValue('Something happened');

          setupMocks();
          const { IpLookupService } = require('../ip-lookup.service');
          const ipLookupService = new IpLookupService(
            [mockIpLookupProvider1, mockIpLookupProvider2],
            mockCache,
          );

          try {
            await ipLookupService.initialise();
          } catch (e) {
            error = e as Error;
          }
        });

        it('should throw an error', () => {
          expect(error.message).toBe('Failed to initialise all providers');
        });
      });
    });
  });

  describe('lookup', () => {
    let result: IpLookupResult;
    describe('when IP is valid and cache is not available', () => {
      beforeEach(async () => {
        mockCacheGet = jest.fn().mockResolvedValue(false);
        mockCacheSet = jest.fn();

        mockIpLookupProviderIsAvailable = jest.fn().mockResolvedValue(true);
        mockIpLookupProviderLookup = jest.fn().mockResolvedValue({
          ip: '8.8.8.8',
          data: {
            ip: '8.8.8.8',
            city: 'London',
            country: 'UK',
          },
          lastUpdated: '2024-01-01',
        });

        setupMocks();

        const { IpLookupService } = require('../ip-lookup.service');
        const ipLookupService = new IpLookupService(
          [mockIpLookupProvider1, mockIpLookupProvider2],
          mockCache,
        );

        result = await ipLookupService.lookup('8.8.8.8');
      });

      it('should return expected result', () => {
        expect(result).toEqual({
          ip: '8.8.8.8',
          providers: {
            mockprovider: { ip: '8.8.8.8', city: 'London', country: 'UK' },
            mockprovider2: { ip: '8.8.8.8', city: 'London', country: 'UK' },
          },
          lastUpdated: expect.any(String),
        });
      });
    });

    describe('when there are multiple providers, one succeeds and one fails', () => {
      beforeEach(async () => {
        mockCacheGet = jest.fn().mockResolvedValue(false);
        mockCacheSet = jest.fn();

        mockIpLookupProviderIsAvailable = jest.fn().mockResolvedValue(true);
        mockIpLookupProviderLookup = jest
          .fn()
          .mockResolvedValueOnce({
            ip: '8.8.8.8',
            data: {
              ip: '8.8.8.8',
              city: 'London',
              country: 'UK',
            },
          })
          .mockRejectedValueOnce(new Error('Failed to lookup IP'));

        setupMocks();

        const { IpLookupService } = require('../ip-lookup.service');
        const ipLookupService = new IpLookupService(
          [mockIpLookupProvider1, mockIpLookupProvider2],
          mockCache,
        );

        result = await ipLookupService.lookup('8.8.8.8');
      });

      it('should return expected result', () => {
        expect(result).toEqual({
          ip: '8.8.8.8',
          providers: {
            mockprovider: { ip: '8.8.8.8', city: 'London', country: 'UK' },
          },
          lastUpdated: expect.any(String),
          error: 'Provider mockProvider2 lookup failed',
        });
      });
    });

    describe('when IP is valid and cache is available', () => {
      beforeEach(async () => {
        mockCacheGet = jest.fn().mockResolvedValue({
          ip: '8.8.8.8',
          data: {
            ip: '8.8.8.8',
            city: 'London',
            country: 'UK',
          },
        });

        setupMocks();

        const { IpLookupService } = require('../ip-lookup.service');
        const ipLookupService = new IpLookupService(
          [mockIpLookupProvider1],
          mockCache,
        );

        result = await ipLookupService.lookup('8.8.8.8');
      });

      it('should return expected result', () => {
        expect(result).toEqual({
          ip: '8.8.8.8',
          providers: {
            mockprovider: { ip: '8.8.8.8', city: 'London', country: 'UK' },
          },
          lastUpdated: expect.any(String),
        });
      });
    });

    describe('when IP is not valid', () => {
      beforeEach(async () => {
        mockIpLookupProviderIsAvailable = jest.fn().mockResolvedValue(true);
        mockIpLookupProviderInitialise = jest.fn().mockResolvedValue(true);

        setupMocks();

        const { IpLookupService } = require('../ip-lookup.service');
        const ipLookupService = new IpLookupService(
          [mockIpLookupProvider1],
          mockCache,
        );

        try {
          result = await ipLookupService.lookup('');
        } catch (e) {
          error = e as Error;
        }
      });

      it('should throw an error', () => {
        expect(error.message).toBe('IP address is required');
      });
    });

    describe('when provider returns null', () => {
      beforeEach(async () => {
        mockCacheGet = jest.fn().mockResolvedValue(false);
        mockCacheSet = jest.fn();

        mockIpLookupProviderIsAvailable = jest.fn().mockResolvedValue(true);
        mockIpLookupProviderLookup = jest.fn().mockResolvedValue(null);

        setupMocks();

        const { IpLookupService } = require('../ip-lookup.service');
        const ipLookupService = new IpLookupService(
          [mockIpLookupProvider1],
          mockCache,
        );

        try {
          result = await ipLookupService.lookup('8.8.8.8');
        } catch (e) {
          error = e as Error;
        }
      });

      it('should throw an error', () => {
        expect(error.message).toBe('All providers failed to lookup IP');
      });
    });

    describe('when provider returns an error', () => {
      describe('when error is an instance of IpLookupError', () => {
        beforeEach(async () => {
          mockCacheGet = jest.fn().mockResolvedValue(false);
          mockCacheSet = jest.fn();

          mockIpLookupProviderIsAvailable = jest.fn().mockResolvedValue(true);
          mockIpLookupProviderLookup = jest
            .fn()
            .mockRejectedValue(
              new IpLookupError(
                'Failed to lookup IP',
                'mockProvider',
                '8.8.8.8',
              ),
            );

          setupMocks();

          const { IpLookupService } = require('../ip-lookup.service');
          const ipLookupService = new IpLookupService(
            [mockIpLookupProvider1],
            mockCache,
          );

          try {
            result = await ipLookupService.lookup('8.8.8.8');
          } catch (e) {
            error = e as Error;
          }
        });

        it('should throw an error', () => {
          expect(error.message).toBe('All providers failed to lookup IP');
        });
      });

      describe('when error is an instance of Error', () => {
        beforeEach(async () => {
          mockCacheGet = jest.fn().mockResolvedValue(false);
          mockCacheSet = jest.fn();

          mockIpLookupProviderIsAvailable = jest.fn().mockResolvedValue(true);
          mockIpLookupProviderLookup = jest
            .fn()
            .mockRejectedValue(new Error('Something happened'));

          setupMocks();

          const { IpLookupService } = require('../ip-lookup.service');
          const ipLookupService = new IpLookupService(
            [mockIpLookupProvider1],
            mockCache,
          );

          try {
            result = await ipLookupService.lookup('8.8.8.8');
          } catch (e) {
            error = e as Error;
          }
        });

        it('should throw an error', () => {
          expect(error.message).toBe('All providers failed to lookup IP');
        });
      });

      describe('when error is not an instance of IpLookupError', () => {
        beforeEach(async () => {
          mockCacheGet = jest.fn().mockResolvedValue(false);
          mockCacheSet = jest.fn();

          mockIpLookupProviderIsAvailable = jest.fn().mockResolvedValue(true);
          mockIpLookupProviderLookup = jest
            .fn()
            .mockRejectedValue('Something happened');

          setupMocks();

          const { IpLookupService } = require('../ip-lookup.service');
          const ipLookupService = new IpLookupService(
            [mockIpLookupProvider1],
            mockCache,
          );

          try {
            result = await ipLookupService.lookup('8.8.8.8');
          } catch (e) {
            error = e as Error;
          }
        });

        it('should throw an error', () => {
          expect(error.message).toBe('All providers failed to lookup IP');
        });
      });
    });
  });

  describe('getMetrics', () => {
    let result: Metrics;
    beforeEach(async () => {
      mockCacheGetMetrics = jest.fn().mockResolvedValue({
        hits: 1,
        misses: 1,
        keys: 2,
      });

      setupMocks();

      const { IpLookupService } = require('../ip-lookup.service');
      const ipLookupService = new IpLookupService(
        [mockIpLookupProvider1],
        mockCache,
      );

      result = await ipLookupService.getMetrics();
    });

    it('should return expected result', () => {
      expect(result).toEqual({
        totalRequests: 0,
        errors: 0,
        cache: { hits: 1, misses: 1, keys: 2 },
      });
    });
  });

  describe('getProviderStatus', () => {
    let result: ProviderStatus[];
    beforeEach(async () => {
      mockIpLookupProviderIsAvailable = jest.fn().mockResolvedValue(true);

      setupMocks();

      const { IpLookupService } = require('../ip-lookup.service');
      const ipLookupService = new IpLookupService(
        [mockIpLookupProvider1, mockIpLookupProvider2],
        mockCache,
      );

      result = await ipLookupService.getProviderStatus();
    });

    it('should return expected result', () => {
      expect(result).toEqual([
        { name: 'mockProvider', available: true },
        { name: 'mockProvider2', available: true },
      ]);
    });
  });

  describe('close', () => {
    beforeEach(async () => {
      mockCacheClose = jest.fn();

      setupMocks();

      const { IpLookupService } = require('../ip-lookup.service');
      const ipLookupService = new IpLookupService(
        [mockIpLookupProvider1],
        mockCache,
      );

      await ipLookupService.close();
    });

    it('should close the cache', () => {
      expect(mockCacheClose).toHaveBeenCalled();
    });
  });
});
