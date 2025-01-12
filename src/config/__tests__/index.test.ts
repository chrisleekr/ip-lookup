import { Config } from '@/config';

describe('config/index.ts', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  describe('when there is no environment variable', () => {
    let config: Config;
    beforeEach(() => {
      // Delete all process.env variables
      Object.keys(process.env).forEach((key) => {
        delete process.env[key];
      });

      // MOck dotenv not to work
      jest.mock('dotenv', () => ({
        config: jest.fn().mockReturnValue(undefined),
      }));

      config = require('@/config').config;
    });

    it('should use default values', () => {
      expect(config).toEqual({
        nodeEnv: 'development',
        port: 3000,
        host: 'localhost',
        logLevel: 'info',
        swagger: { host: 'localhost:3000', enabled: true, scheme: 'http' },
        cache: { ttl: 3600, checkPeriod: 600, maxKeys: 10000 },
        ipInfo: { token: '' },
        ipLookup: {
          maxIpsPerRequest: 100,
          requestTimeoutMs: 30000,
          cacheControlMaxAge: 3600,
          cacheControlStaleIfError: 600,
        },
        server: { bodyLimit: 1048576, requestTimeout: 30000 },
      });
    });
  });
});
