import { FastifyReply, FastifyRequest } from 'fastify';
import { IpLookupResult } from '@/services/ip-lookup/ip-lookup.interface';
import { IpQuerystring } from '@/routes/schemas/ip-lookup/query.schema';

let mockIpLookupServiceLookup: jest.Mock;

const setupMocks = (): void => {
  jest.mock('@/services/shared', () => ({
    ipLookupService: {
      lookup: mockIpLookupServiceLookup,
    },
  }));
};

describe('controllers/ip-lookup.controller.ts', () => {
  let error: Error;

  const exampleIpLookupResult1: IpLookupResult = {
    ip: '1.1.1.1',
    providers: {
      maxmind: {
        asn: {
          autonomousSystemNumber: 13335,
          autonomousSystemOrganization: 'Cloudflare, Inc.',
        },
        city: {
          country: {
            isoCode: 'US',
            geonameId: 6252001,
            names: {
              en: 'United States',
            },
          },
          location: {
            latitude: 34.0522,
            longitude: -118.2437,
          },
        },
        country: {
          country: {
            isoCode: 'US',
            geonameId: 6252001,
            names: {
              en: 'United States',
            },
          },
        },
      },
      ipinfo: {
        ip: '1.1.1.1',
        city: 'Los Angeles',
        country: 'United States',
        loc: '34.0522,-118.2437',
        postal: '90001',
        timezone: 'America/Los_Angeles',
        asn: {
          asn: 'AS13335',
          name: 'Cloudflare, Inc.',
          domain: 'cloudflare.com',
          route: '1.1.1.1/32',
          type: 'isp',
        },
      },
    },
    lastUpdated: new Date().toISOString(),
  };

  const exampleIpLookupResult2: IpLookupResult = {
    ip: '2.2.2.2',
    providers: {
      maxmind: {
        asn: null,
        city: null,
        country: null,
      },
      ipinfo: {
        ip: '2.2.2.2',
      },
    },
    lastUpdated: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.resetModules();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getIPInfo', () => {
    let response: { results: IpLookupResult[] };
    let mockRequest: FastifyRequest<{ Querystring: IpQuerystring }>;
    let mockReply: FastifyReply;

    describe('when the IP is valid', () => {
      describe('when the single IP is provided', () => {
        beforeEach(async () => {
          mockIpLookupServiceLookup = jest
            .fn()
            .mockResolvedValue(exampleIpLookupResult1);
          setupMocks();
          const { IpLookupController } = require('../ip-lookup.controller');

          mockRequest = {
            query: { ip: '1.1.1.1' },
            id: 'test-request-id',
            headers: { 'user-agent': 'test-agent' },
          } as unknown as FastifyRequest<{ Querystring: IpQuerystring }>;

          mockReply = {
            status: jest.fn().mockReturnThis(),
            header: jest.fn().mockReturnThis(),
          } as unknown as FastifyReply;

          response = await IpLookupController.getIPInfo(mockRequest, mockReply);
        });

        it('should call ipLookupService.lookup with correct IP', () => {
          expect(mockIpLookupServiceLookup).toHaveBeenCalledWith('1.1.1.1');
        });

        it('should set cache control headers', () => {
          expect(mockReply.header).toHaveBeenCalledWith(
            'Cache-Control',
            'public, max-age=3600, stale-if-error=600',
          );
        });

        it('should return expected response', () => {
          expect(response).toEqual({
            results: [exampleIpLookupResult1],
          });
        });
      });

      describe('when the multiple IPs are provided', () => {
        beforeEach(async () => {
          mockIpLookupServiceLookup = jest
            .fn()
            .mockResolvedValueOnce(exampleIpLookupResult1)
            .mockResolvedValueOnce(exampleIpLookupResult2);

          setupMocks();
          const { IpLookupController } = require('../ip-lookup.controller');

          mockRequest = {
            query: { ip: ['1.1.1.1', '2.2.2.2'] },
            id: 'test-request-id',
            headers: { 'user-agent': 'test-agent' },
          } as unknown as FastifyRequest<{ Querystring: IpQuerystring }>;

          mockReply = {
            status: jest.fn().mockReturnThis(),
            header: jest.fn().mockReturnThis(),
          } as unknown as FastifyReply;

          response = await IpLookupController.getIPInfo(mockRequest, mockReply);
        });

        it('should call ipLookupService.lookup twice', () => {
          expect(mockIpLookupServiceLookup).toHaveBeenCalledTimes(2);
        });

        it('should call ipLookupService.lookup with correct IPs', () => {
          expect(mockIpLookupServiceLookup).toHaveBeenCalledWith('1.1.1.1');
          expect(mockIpLookupServiceLookup).toHaveBeenCalledWith('2.2.2.2');
        });

        it('should return expected response', () => {
          expect(response).toEqual({
            results: [exampleIpLookupResult1, exampleIpLookupResult2],
          });
        });
      });
    });

    describe('when ipLookupService.lookup throws an error', () => {
      describe('when Error is thrown', () => {
        beforeEach(async () => {
          mockIpLookupServiceLookup = jest
            .fn()
            .mockRejectedValue(new Error('Test error'));

          setupMocks();
          const { IpLookupController } = require('../ip-lookup.controller');

          mockRequest = {
            query: { ip: '1.1.1.1' },
            id: 'test-request-id',
            headers: { 'user-agent': 'test-agent' },
          } as unknown as FastifyRequest<{ Querystring: IpQuerystring }>;

          mockReply = {
            status: jest.fn().mockReturnThis(),
            header: jest.fn().mockReturnThis(),
          } as unknown as FastifyReply;

          response = await IpLookupController.getIPInfo(mockRequest, mockReply);
        });

        it('returns expected response', () => {
          expect(response).toEqual({
            results: [
              {
                ip: '1.1.1.1',
                providers: {},
                lastUpdated: expect.any(String),
                error: 'Test error',
              },
            ],
          });
        });
      });

      describe('when a non-Error is thrown', () => {
        beforeEach(async () => {
          mockIpLookupServiceLookup = jest.fn().mockRejectedValue('Test error');

          setupMocks();
          const { IpLookupController } = require('../ip-lookup.controller');

          mockRequest = {
            query: { ip: '1.1.1.1' },
            id: 'test-request-id',
            headers: { 'user-agent': 'test-agent' },
          } as unknown as FastifyRequest<{ Querystring: IpQuerystring }>;

          mockReply = {
            status: jest.fn().mockReturnThis(),
            header: jest.fn().mockReturnThis(),
          } as unknown as FastifyReply;

          response = await IpLookupController.getIPInfo(mockRequest, mockReply);
        });

        it('returns expected response', () => {
          expect(response).toEqual({
            results: [
              {
                ip: '1.1.1.1',
                providers: {},
                lastUpdated: expect.any(String),
                error: 'Test error',
              },
            ],
          });
        });
      });
    });

    describe('when the IP is missing', () => {
      beforeEach(async () => {
        setupMocks();
        const { IpLookupController } = require('../ip-lookup.controller');
        mockRequest = {
          query: { ip: '' },
          id: 'test-request-id',
          headers: { 'user-agent': 'test-agent' },
        } as unknown as FastifyRequest<{ Querystring: IpQuerystring }>;
        mockReply = {
          status: jest.fn().mockReturnThis(),
          header: jest.fn().mockReturnThis(),
        } as unknown as FastifyReply;
        try {
          await IpLookupController.getIPInfo(mockRequest, mockReply);
        } catch (e) {
          error = e as Error;
        }
      });

      it('should set status 400', () => {
        expect(mockReply.status).toHaveBeenCalledWith(400);
      });

      it('should set error message', () => {
        expect(error.message).toEqual('IP address is required');
      });
    });

    describe('when the IP is invalid', () => {
      beforeEach(async () => {
        setupMocks();
        const { IpLookupController } = require('../ip-lookup.controller');
        mockRequest = {
          query: { ip: 'invalid-ip' },
          id: 'test-request-id',
          headers: { 'user-agent': 'test-agent' },
        } as unknown as FastifyRequest<{ Querystring: IpQuerystring }>;
        mockReply = {
          status: jest.fn().mockReturnThis(),
          header: jest.fn().mockReturnThis(),
        } as unknown as FastifyReply;
        try {
          await IpLookupController.getIPInfo(mockRequest, mockReply);
        } catch (e) {
          error = e as Error;
        }
      });

      it('should set status 400', () => {
        expect(mockReply.status).toHaveBeenCalledWith(400);
      });

      it('should set error message', () => {
        expect(error.message).toEqual('Invalid IP addresses found: invalid-ip');
      });
    });
    describe('when more than the maximum number of IPs are provided', () => {
      beforeEach(async () => {
        jest.mock('@/config', () => ({
          config: {
            ipLookup: {
              maxIpsPerRequest: 3,
            },
          },
        }));

        setupMocks();
        const { IpLookupController } = require('../ip-lookup.controller');

        mockRequest = {
          query: { ip: ['1.1.1.1', '2.2.2.2', '3.3.3.3', '4.4.4.4'] },
          id: 'test-request-id',
          headers: { 'user-agent': 'test-agent' },
        } as unknown as FastifyRequest<{ Querystring: IpQuerystring }>;

        mockReply = {
          status: jest.fn().mockReturnThis(),
          header: jest.fn().mockReturnThis(),
        } as unknown as FastifyReply;

        try {
          await IpLookupController.getIPInfo(mockRequest, mockReply);
        } catch (e) {
          error = e as Error;
        }
      });

      it('should set status 400', () => {
        expect(mockReply.status).toHaveBeenCalledWith(400);
      });

      it('should set error message', () => {
        expect(error.message).toEqual('Maximum of 3 IPs allowed per request');
      });
    });

    describe('when the request times out', () => {
      beforeEach(async () => {
        // Mock config to set a short timeout
        jest.mock('@/config', () => ({
          config: {
            ipLookup: {
              requestTimeoutMs: 100,
              maxIpsPerRequest: 3,
            },
          },
        }));

        // Mock mockIpLookupServiceLookup to return after timeout period
        mockIpLookupServiceLookup = jest
          .fn()
          .mockImplementation(
            () => new Promise((resolve) => setTimeout(resolve, 200)),
          );

        setupMocks();
        const { IpLookupController } = require('../ip-lookup.controller');

        mockRequest = {
          query: { ip: '1.1.1.1' },
          id: 'test-request-id',
          headers: { 'user-agent': 'test-agent' },
        } as unknown as FastifyRequest<{ Querystring: IpQuerystring }>;

        mockReply = {
          status: jest.fn().mockReturnThis(),
          header: jest.fn().mockReturnThis(),
        } as unknown as FastifyReply;

        try {
          const promise = IpLookupController.getIPInfo(mockRequest, mockReply);
          jest.advanceTimersByTime(150);
          await promise;
        } catch (e) {
          error = e as Error;
        }
      });

      it('should set status 500', () => {
        expect(mockReply.status).toHaveBeenCalledWith(500);
      });

      it('should throw timeout error with correct message', () => {
        expect(error.message).toEqual('Request timeout after 100ms');
      });

      it('should attempt to call the lookup service', () => {
        expect(mockIpLookupServiceLookup).toHaveBeenCalledWith('1.1.1.1');
      });
    });
  });
});
