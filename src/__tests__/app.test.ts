import { buildApp } from '@/app';
import type { FastifyInstance } from 'fastify';
import { ipLookupService } from '@/services/shared';
import { IpLookupError } from '@/services/ip-lookup/ip-lookup.interface';
import logger from '@/utils/logger';

jest.mock('@/services/shared');

describe('app.ts', () => {
  let app: FastifyInstance;

  describe('buildApp', () => {
    describe('when ipLookupService.initialise succeeds', () => {
      beforeEach(async () => {
        const mockInitialise = jest.fn().mockResolvedValue(undefined);
        jest
          .mocked(ipLookupService.initialise)
          .mockImplementation(mockInitialise);
        app = await buildApp();
      });
      it('calls ipLookupService.initialise', () => {
        expect(ipLookupService.initialise).toHaveBeenCalled();
      });

      it('returns a Fastify instance', () => {
        expect(app.listen).toBeDefined();
        expect(typeof app.listen).toBe('function');
      });

      describe('fastify.genReqId', () => {
        let reqId: string;
        beforeEach(async () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          reqId = (app as any).genReqId();
        });

        it('returns a string', () => {
          expect(reqId).not.toBe('');
        });
      });

      describe('app.addHook - onRequest/onSend/onResponse', () => {
        let response: Awaited<ReturnType<typeof app.inject>>;

        describe('when x-request-id is provided', () => {
          beforeEach(async () => {
            await app.ready();
            const request = {
              method: 'GET' as const,
              url: '/',
              headers: {
                'x-request-id': 'test-request-id',
              },
            };
            response = await app.inject(request);
          });

          it('adds a requestId to the request', () => {
            expect(response.headers['x-request-id']).toBe('test-request-id');
          });

          it('returns x-request-start-time', () => {
            expect(response.headers['x-request-start-time']).toBeDefined();
          });

          it('returns x-response-time', () => {
            expect(response.headers['x-response-time']).toBeDefined();
          });
        });

        describe('when x-request-id is not provided', () => {
          beforeEach(async () => {
            await app.ready();
            const request = {
              method: 'GET' as const,
              url: '/',
            };
            response = await app.inject(request);
          });

          it('returns a requestId', () => {
            // It should be uuid format
            expect(response.headers['x-request-id']).toMatch(
              /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
            );
          });
        });
      });

      describe('app.setErrorHandler', () => {
        let response: Awaited<ReturnType<typeof app.inject>>;

        describe('when error is IpLookupError', () => {
          beforeEach(async () => {
            // Register a test route that throws an IpLookupError
            app.get('/test-error', async () => {
              throw new IpLookupError(
                'Simulated IP lookup error',
                'provider name',
                '123.123.123.123',
              );
            });

            response = await app.inject({
              method: 'GET',
              url: '/test-error',
            });
          });

          it('returns a 400 status code', () => {
            expect(response.statusCode).toBe(400);
          });

          it('returns expected headers', () => {
            expect(response.headers).toMatchObject({
              'x-request-id': expect.any(String),
              'x-request-start-time': expect.any(String),
              'x-response-time': expect.any(String),
            });
          });

          it('returns expected response', () => {
            expect(response.json()).toEqual({
              error: true,
              message: 'Simulated IP lookup error',
              requestId: response.headers['x-request-id'],
              stack: expect.any(String),
            });
          });
        });

        describe('when error is not IpLookupError', () => {
          beforeEach(async () => {
            // Register a test route that throws an IpLookupError
            app.get('/test-error', async () => {
              throw new Error('Simulated error');
            });
            response = await app.inject({
              method: 'GET',
              url: '/test-error',
            });
          });

          it('returns a 500 status code', () => {
            expect(response.statusCode).toBe(500);
          });
        });
      });

      describe('app.addHook - onClose', () => {
        beforeEach(async () => {
          await app.close();
        });

        it('calls ipLookupService.close', () => {
          expect(logger.info).toHaveBeenCalledWith('Shutting down application');
        });
      });
    });

    describe('when ipLookupService.initialise fails', () => {
      describe('when error is Error instance', () => {
        let error: Error;
        beforeEach(async () => {
          error = new Error('Simulated error');
          const mockInitialise = jest.fn().mockRejectedValue(error);
          jest
            .mocked(ipLookupService.initialise)
            .mockImplementation(mockInitialise);
          try {
            app = await buildApp();
          } catch (e) {
            error = e as Error;
          }
        });

        it('throws an error', () => {
          expect(error).toBeDefined();
          expect(error.message).toBe('Simulated error');
        });
      });

      describe('when error is not Error instance', () => {
        let error: unknown;
        beforeEach(async () => {
          const mockInitialise = jest.fn().mockRejectedValue('Simulated error');
          jest
            .mocked(ipLookupService.initialise)
            .mockImplementation(mockInitialise);
          try {
            app = await buildApp();
          } catch (e) {
            error = e;
          }
        });

        it('throws an error', () => {
          expect(error).toBe('Simulated error');
        });
      });
    });
  });
});
