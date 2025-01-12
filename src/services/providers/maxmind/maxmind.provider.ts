import { Reader, ReaderModel } from '@maxmind/geoip2-node';
import {
  IpLookupProvider,
  ProviderResponse,
  IpLookupError,
} from '@/services/ip-lookup/ip-lookup.interface';
import {
  MaxMindConfig,
  MaxMindASNResponse,
  MaxMindCityResponse,
  MaxMindCountryResponse,
} from './maxmind.interface';
import logger from '@/utils/logger';
import { IpValidator } from '@/utils/ip-validator';
import path from 'node:path';

export class MaxMindProvider implements IpLookupProvider {
  private asnReader?: ReaderModel;
  private cityReader?: ReaderModel;
  private countryReader?: ReaderModel;
  public readonly name = 'MaxMind';

  constructor(private readonly config: MaxMindConfig = {}) {
    this.config = {
      asnDbPath: path.join(__dirname, '/../../../../data/GeoLite2-ASN.mmdb'),
      cityDbPath: path.join(__dirname, '/../../../../data/GeoLite2-City.mmdb'),
      countryDbPath: path.join(
        __dirname,
        '/../../../../data/GeoLite2-Country.mmdb',
      ),
      ...config,
    };
  }

  async initialise(): Promise<void> {
    try {
      const [asnReader, cityReader, countryReader] = await Promise.all([
        Reader.open(this.config.asnDbPath!),
        Reader.open(this.config.cityDbPath!),
        Reader.open(this.config.countryDbPath!),
      ]);

      this.asnReader = asnReader;
      this.cityReader = cityReader;
      this.countryReader = countryReader;

      logger.info('MaxMind databases initialised successfully', {
        provider: this.name,
        databases: [
          this.config.asnDbPath,
          this.config.cityDbPath,
          this.config.countryDbPath,
        ],
      });
    } catch (error: unknown) {
      const errorMessage = 'Failed to initialise MaxMind databases';
      logger.error(errorMessage, {
        provider: this.name,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        config: this.config,
      });
      throw new Error(errorMessage);
    }
  }

  async isAvailable(): Promise<boolean> {
    const available = !!(
      this.asnReader &&
      this.cityReader &&
      this.countryReader
    );
    if (!available) {
      logger.warn('MaxMind provider is not available', { provider: this.name });
    }
    return available;
  }

  private async lookupDatabase<T>(
    reader: ReaderModel,
    ip: string,
    type: 'asn' | 'city' | 'country',
  ): Promise<T | null> {
    try {
      logger.info(`Looking up IP in MaxMind ${type} database`, {
        provider: this.name,
        ip,
        databaseType: type,
      });
      const result = reader[type](ip) as T;
      logger.info(`Successfully looked up IP in MaxMind ${type} database`, {
        provider: this.name,
        ip,
        databaseType: type,
        hasResult: !!result,
      });
      return result;
    } catch (error) {
      logger.warn(`Failed to lookup ${type} data`, {
        provider: this.name,
        ip,
        databaseType: type,
        error: (error as Error).message,
        stack: (error as Error).stack,
      });
      return null;
    }
  }

  async lookup(ip: string): Promise<ProviderResponse> {
    try {
      logger.info('Starting MaxMind lookup', {
        provider: this.name,
        ip,
      });

      if (!ip) {
        logger.warn('IP address is required for MaxMind lookup', {
          provider: this.name,
        });
        throw new IpLookupError('IP address is required', this.name, ip);
      }

      if (!IpValidator.isValidIp(ip)) {
        const ipVersion = IpValidator.getIpVersion(ip);
        logger.warn('Invalid IP address format for MaxMind lookup', {
          provider: this.name,
          ip,
          ipVersion,
        });
        throw new IpLookupError(
          `Invalid IP address format: ${ip}`,
          this.name,
          ip,
        );
      }

      if (!(await this.isAvailable())) {
        logger.error('MaxMind databases not initialised for lookup', {
          provider: this.name,
          ip,
          asnReaderAvailable: !!this.asnReader,
          cityReaderAvailable: !!this.cityReader,
          countryReaderAvailable: !!this.countryReader,
        });
        throw new IpLookupError(
          'MaxMind databases not initialised',
          this.name,
          ip,
        );
      }

      logger.info('Starting parallel database lookups', {
        provider: this.name,
        ip,
      });

      const [asnData, cityData, countryData] = await Promise.all([
        this.lookupDatabase<MaxMindASNResponse>(this.asnReader!, ip, 'asn'),
        this.lookupDatabase<MaxMindCityResponse>(this.cityReader!, ip, 'city'),
        this.lookupDatabase<MaxMindCountryResponse>(
          this.countryReader!,
          ip,
          'country',
        ),
      ]);

      if (!asnData && !cityData && !countryData) {
        logger.warn('No data found in any MaxMind database', {
          provider: this.name,
          ip,
        });
        throw new IpLookupError(
          `No data found for IP ${ip} in any database`,
          this.name,
          ip,
        );
      }

      const result: ProviderResponse = {
        ip,
        data: {
          asn: asnData,
          city: cityData,
          country: countryData,
        },
        lastUpdated: new Date().toISOString(),
      };

      logger.info('Successfully completed MaxMind lookup', {
        provider: this.name,
        ip,
        hasAsnData: !!asnData,
        hasCityData: !!cityData,
        hasCountryData: !!countryData,
      });

      return result;
    } catch (error) {
      logger.error('MaxMind lookup failed', {
        provider: this.name,
        ip,
        error: (error as Error).message,
        stack: (error as Error).stack,
      });

      throw error;
    }
  }
}
