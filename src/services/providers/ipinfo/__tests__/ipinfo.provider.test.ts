import axios from 'axios';
import { IPInfoProvider } from '../ipinfo.provider';
import logger from '@/utils/logger';
import { IPInfoResponse } from '../ipinfo.interface';

describe('ipinfo.provider.ts', () => {
  let provider: IPInfoProvider;
  let error: Error;
  describe('constructor', () => {
    describe('when config is provided', () => {
      beforeEach(() => {
        const config = { baseUrl: 'https://ipinfo.io' };
        provider = new IPInfoProvider(config);
      });

      it('initialise the provider', () => {
        expect(provider).toBeInstanceOf(IPInfoProvider);
      });
    });

    describe('when config is not provided', () => {
      beforeEach(() => {
        provider = new IPInfoProvider({});
      });

      it('initialise the provider', () => {
        expect(provider).toBeInstanceOf(IPInfoProvider);
      });
    });
  });

  describe('initialise', () => {
    describe('when provider is available, when token is provided', () => {
      describe('when the request is successful', () => {
        beforeEach(async () => {
          jest.spyOn(axios, 'get').mockResolvedValue({
            data: { ip: '8.8.8.8' },
            status: 200,
            statusText: 'OK',
            headers: {},
            config: { url: 'https://ipinfo.io' },
          });

          provider = new IPInfoProvider({ token: 'test' });

          await provider.initialise();
        });

        it('triggers the axios.get', () => {
          expect(axios.get).toHaveBeenCalledWith('https://ipinfo.io/8.8.8.8', {
            params: { token: 'test' },
            timeout: 5000,
          });
        });
      });

      describe('when the request is unsuccessful', () => {
        beforeEach(async () => {
          jest
            .spyOn(axios, 'get')
            .mockRejectedValue(new Error('something happened'));

          provider = new IPInfoProvider({ token: 'test' });

          try {
            await provider.initialise();
          } catch (e) {
            error = e as Error;
          }
        });

        it('throws an error', () => {
          expect(error.message).toStrictEqual(
            'Failed to initialise IPInfo provider',
          );
        });
      });
    });

    describe('when provider is not available', () => {
      beforeEach(async () => {
        jest.spyOn(axios, 'get');
        provider = new IPInfoProvider({});

        await provider.initialise();
      });

      it('does not trigger the axios.get', () => {
        expect(axios.get).not.toHaveBeenCalled();
      });

      it('logs the error', () => {
        expect(logger.info).toHaveBeenCalledWith(
          'IPInfo provider initialization skipped - no token available',
          {
            provider: 'IPInfo',
          },
        );
      });
    });
  });

  describe('isAvailable', () => {
    let result: boolean;
    describe('when token is provided', () => {
      beforeEach(async () => {
        provider = new IPInfoProvider({ token: 'test' });
        result = await provider.isAvailable();
      });

      it('returns true', () => {
        expect(result).toBe(true);
      });
    });

    describe('when token is not provided', () => {
      beforeEach(async () => {
        provider = new IPInfoProvider({});
        result = await provider.isAvailable();
      });

      it('returns false', () => {
        expect(result).toBe(false);
      });
    });
  });

  describe('lookup', () => {
    let result: IPInfoResponse;
    describe('when the request is successful', () => {
      beforeEach(async () => {
        jest.spyOn(axios, 'get').mockResolvedValue({
          data: { ip: '8.8.8.8' },
          status: 200,
          statusText: 'OK',
          headers: {},
          config: { url: 'https://ipinfo.io' },
        });

        provider = new IPInfoProvider({ token: 'test' });
        result = await provider.lookup('8.8.8.8');
      });

      it('triggers axios.get', () => {
        expect(axios.get).toHaveBeenCalledWith('https://ipinfo.io/8.8.8.8', {
          params: { token: 'test' },
          timeout: 5000,
        });
      });

      it('returns the IPInfoResponse', () => {
        expect(result).toStrictEqual({
          ip: '8.8.8.8',
          data: { ip: '8.8.8.8' },
          lastUpdated: expect.any(String),
        });
      });
    });

    describe('when ip is empty string', () => {
      beforeEach(async () => {
        provider = new IPInfoProvider({ token: 'test' });
        try {
          result = await provider.lookup('');
        } catch (e) {
          error = e as Error;
        }
      });

      it('throws an error', () => {
        expect(error.message).toStrictEqual('IP address is required');
      });
    });

    describe('when ip is not a valid ip address', () => {
      beforeEach(async () => {
        provider = new IPInfoProvider({ token: 'test' });
        try {
          result = await provider.lookup('8.8.8.8.8');
        } catch (e) {
          error = e as Error;
        }
      });

      it('throws an error', () => {
        expect(error.message).toStrictEqual(
          'Invalid IP address format: 8.8.8.8.8',
        );
      });
    });

    describe('when the provider is not available', () => {
      beforeEach(async () => {
        provider = new IPInfoProvider({ token: '' });

        try {
          result = await provider.lookup('8.8.8.8');
        } catch (e) {
          error = e as Error;
        }
      });

      it('throws an error', () => {
        expect(error.message).toStrictEqual(
          'IPInfo provider not available - no token configured',
        );
      });
    });

    describe('when the request returns invalid data', () => {
      beforeEach(async () => {
        jest.spyOn(axios, 'get').mockResolvedValue({
          data: {},
          status: 200,
          statusText: 'OK',
          headers: {},
          config: { url: 'https://ipinfo.io' },
        });

        provider = new IPInfoProvider({ token: 'test' });

        try {
          result = await provider.lookup('8.8.8.8');
        } catch (e) {
          error = e as Error;
        }
      });

      it('throws an error', () => {
        expect(error.message).toStrictEqual('Failed to lookup IP with IPinfo');
      });
    });

    describe('when the request throws an error', () => {
      describe('when the error is an instance of Error', () => {
        beforeEach(async () => {
          jest
            .spyOn(axios, 'get')
            .mockRejectedValue(new Error('something happened'));

          provider = new IPInfoProvider({ token: 'test' });

          try {
            result = await provider.lookup('8.8.8.8');
          } catch (e) {
            error = e as Error;
          }
        });

        it('throws an error', () => {
          expect(error.message).toStrictEqual(
            'Failed to lookup IP with IPinfo',
          );
        });

        describe('when the error has response', () => {
          beforeEach(async () => {
            jest
              .spyOn(axios, 'get')
              .mockRejectedValue({ response: { status: 403 } });

            provider = new IPInfoProvider({ token: 'test' });

            try {
              result = await provider.lookup('8.8.8.8');
            } catch (e) {
              error = e as Error;
            }
          });

          it('throws an error', () => {
            expect(error.message).toStrictEqual(
              'Failed to lookup IP with IPinfo',
            );
          });
        });

        describe('when the error is not an instance of Error', () => {
          beforeEach(async () => {
            jest.spyOn(axios, 'get').mockRejectedValue('something happened');

            provider = new IPInfoProvider({ token: 'test' });

            try {
              result = await provider.lookup('8.8.8.8');
            } catch (e) {
              error = e as Error;
            }
          });

          it('throws an error', () => {
            expect(error.message).toStrictEqual(
              'Failed to lookup IP with IPinfo',
            );
          });
        });
      });
    });
  });
});
