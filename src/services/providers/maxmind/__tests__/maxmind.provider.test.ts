import logger from '@/utils/logger';
import { MaxMindProvider } from '../maxmind.provider';
import { Reader, ReaderModel, Asn, City, Country } from '@maxmind/geoip2-node';
import { ProviderResponse } from '@/services/ip-lookup/ip-lookup.interface';

describe('maxmind.provider.ts', () => {
  let provider: MaxMindProvider;
  let error: Error;
  let mockReader: jest.Mocked<ReaderModel>;

  beforeEach(() => {
    mockReader = {
      asn: jest.fn(),
      city: jest.fn(),
      country: jest.fn(),
    } as unknown as jest.Mocked<ReaderModel>;

    jest.spyOn(Reader, 'open').mockResolvedValue(mockReader);
    jest.spyOn(logger, 'info').mockImplementation();
    jest.spyOn(logger, 'warn').mockImplementation();
    jest.spyOn(logger, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    describe('when config is provided', () => {
      beforeEach(() => {
        provider = new MaxMindProvider({});
      });

      it('initialise the provider', () => {
        expect(provider).toBeInstanceOf(MaxMindProvider);
      });
    });

    describe('when config is not provided', () => {
      beforeEach(() => {
        provider = new MaxMindProvider();
      });

      it('initialise the provider', () => {
        expect(provider).toBeInstanceOf(MaxMindProvider);
      });
    });
  });

  describe('initialise', () => {
    describe('when the databases are available', () => {
      beforeEach(async () => {
        jest.spyOn(Reader, 'open').mockResolvedValue({} as ReaderModel);

        provider = new MaxMindProvider({});
        await provider.initialise();
      });

      it('logs logger.info', () => {
        expect(logger.info).toHaveBeenCalledWith(
          'MaxMind databases initialised successfully',
          expect.any(Object),
        );
      });
    });

    describe('when the databases are not available', () => {
      describe('when error is Error', () => {
        beforeEach(async () => {
          jest
            .spyOn(Reader, 'open')
            .mockRejectedValue(new Error('Database not found'));

          provider = new MaxMindProvider({});
          try {
            await provider.initialise();
          } catch (e) {
            error = e as Error;
          }
        });

        it('throws an error', () => {
          expect(error.message).toEqual(
            'Failed to initialise MaxMind databases',
          );
        });
      });

      describe('when error is not Error', () => {
        beforeEach(async () => {
          jest.spyOn(Reader, 'open').mockRejectedValue('Something went wrong');

          provider = new MaxMindProvider({});
          try {
            await provider.initialise();
          } catch (e) {
            error = e as Error;
          }
        });

        it('throws an error', () => {
          expect(error.message).toEqual(
            'Failed to initialise MaxMind databases',
          );
        });
      });
    });
  });

  describe('isAvailable', () => {
    let result: boolean;
    describe('when the databases are available', () => {
      beforeEach(async () => {
        jest.spyOn(Reader, 'open').mockResolvedValue({} as ReaderModel);
        provider = new MaxMindProvider({});
        await provider.initialise();
        result = await provider.isAvailable();
      });

      it('returns true', () => {
        expect(result).toBe(true);
      });
    });

    describe('when the databases are not available', () => {
      beforeEach(async () => {
        provider = new MaxMindProvider({});
        result = await provider.isAvailable();
      });

      it('returns false', () => {
        expect(result).toBe(false);
      });
    });
  });

  describe('lookup', () => {
    let result: ProviderResponse;

    describe('when the lookup is successful', () => {
      const mockASNResponse: Asn = {
        autonomousSystemNumber: 15169,
        autonomousSystemOrganization: 'Google LLC',
        ipAddress: '8.8.8.8',
        network: '8.8.8.0/24',
      };

      const mockCityResponse = {
        continent: {
          code: 'NA',
          geonameId: 6255149,
          names: {
            en: 'North America',
          },
        },
        country: {
          geonameId: 6252001,
          isoCode: 'US',
          names: {
            en: 'United States',
          },
          isInEuropeanUnion: false,
        },
        location: {
          accuracyRadius: 1000,
          latitude: 37.751,
          longitude: -97.822,
          timeZone: 'America/Chicago',
        },
        traits: {
          ipAddress: '8.8.8.8',
          network: '8.8.8.0/24',
          isAnonymous: false,
          isAnonymousProxy: false,
          isAnonymousVpn: false,
          isAnycast: false,
          isHostingProvider: false,
          isLegitimateProxy: false,
          isPublicProxy: false,
          isResidentialProxy: false,
          isSatelliteProvider: false,
          isTorExitNode: false,
        },
        maxmind: {
          queriesRemaining: 1000,
        },
        registeredCountry: {
          geonameId: 6252001,
          isoCode: 'US',
          names: {
            en: 'United States',
          },
          isInEuropeanUnion: false,
        },
      } as unknown as City;

      const mockCountryResponse = {
        continent: {
          code: 'NA',
          geonameId: 6255149,
          names: {
            en: 'North America',
          },
        },
        country: {
          geonameId: 6252001,
          isoCode: 'US',
          names: {
            en: 'United States',
          },
          isInEuropeanUnion: false,
        },
        traits: {
          ipAddress: '8.8.8.8',
          network: '8.8.8.0/24',
          isAnonymous: false,
          isAnonymousProxy: false,
          isAnonymousVpn: false,
          isAnycast: false,
          isHostingProvider: false,
          isLegitimateProxy: false,
          isPublicProxy: false,
          isResidentialProxy: false,
          isSatelliteProvider: false,
          isTorExitNode: false,
        },
        maxmind: {
          queriesRemaining: 1000,
        },
        registeredCountry: {
          geonameId: 6252001,
          isoCode: 'US',
          names: {
            en: 'United States',
          },
          isInEuropeanUnion: false,
        },
      } as unknown as Country;

      beforeEach(async () => {
        mockReader.asn.mockReturnValue(mockASNResponse);
        mockReader.city.mockReturnValue(mockCityResponse);
        mockReader.country.mockReturnValue(mockCountryResponse);

        provider = new MaxMindProvider({});
        await provider.initialise();
        result = await provider.lookup('8.8.8.8');
      });

      it('returns the result with all database data', () => {
        expect(result).toStrictEqual({
          ip: '8.8.8.8',
          data: {
            asn: mockASNResponse,
            city: mockCityResponse,
            country: mockCountryResponse,
          },
          lastUpdated: expect.any(String),
        });
      });

      it('calls each database lookup once', () => {
        expect(mockReader.asn).toHaveBeenCalledWith('8.8.8.8');
        expect(mockReader.city).toHaveBeenCalledWith('8.8.8.8');
        expect(mockReader.country).toHaveBeenCalledWith('8.8.8.8');
      });
    });

    describe('when some database lookups fail', () => {
      beforeEach(async () => {
        mockReader.asn.mockImplementation(() => {
          throw new Error('ASN lookup failed');
        });
        mockReader.city.mockImplementation(() => {
          throw new Error('City lookup failed');
        });
        mockReader.country.mockImplementation(() => {
          throw new Error('Country lookup failed');
        });

        provider = new MaxMindProvider({});
        await provider.initialise();
        try {
          result = await provider.lookup('8.8.8.8');
        } catch (e) {
          error = e as Error;
        }
      });

      it('throws an error', () => {
        expect(error.message).toEqual(
          'No data found for IP 8.8.8.8 in any database',
        );
      });
    });

    describe('when IP is not provided', () => {
      beforeEach(async () => {
        provider = new MaxMindProvider({});
        await provider.initialise();
        try {
          result = await provider.lookup('');
        } catch (e) {
          error = e as Error;
        }
      });

      it('throws an error', () => {
        expect(error.message).toEqual('IP address is required');
      });
    });

    describe('when IP is not valid', () => {
      beforeEach(async () => {
        provider = new MaxMindProvider({});
        await provider.initialise();
        try {
          result = await provider.lookup('invalid');
        } catch (e) {
          error = e as Error;
        }
      });

      it('throws an error', () => {
        expect(error.message).toEqual('Invalid IP address format: invalid');
      });
    });

    describe('when the database reader is not available', () => {
      beforeEach(async () => {
        jest
          .spyOn(Reader, 'open')
          .mockRejectedValue(new Error('Database not found'));
        provider = new MaxMindProvider({});
        // await provider.initialise();

        try {
          result = await provider.lookup('8.8.8.8');
        } catch (e) {
          error = e as Error;
        }
      });

      it('throws an error', () => {
        expect(error.message).toEqual('MaxMind databases not initialised');
      });
    });

    describe('when lookupDatabase does not return specific result', () => {
      beforeEach(async () => {
        jest.spyOn(Reader, 'open').mockResolvedValue({} as ReaderModel);

        provider = new MaxMindProvider({});
        await provider.initialise();

        try {
          result = await provider.lookup('8.8.8.8');
        } catch (e) {
          error = e as Error;
        }
      });

      it('throws an error', () => {
        expect(error.message).toEqual(
          'No data found for IP 8.8.8.8 in any database',
        );
      });
    });
  });
});
