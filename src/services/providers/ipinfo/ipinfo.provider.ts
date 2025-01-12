import axios from 'axios';
import {
  IpLookupProvider,
  ProviderResponse,
  IpLookupError,
} from '@/services/ip-lookup/ip-lookup.interface';
import { IPInfoConfig, IPInfoResponse } from './ipinfo.interface';
import logger from '@/utils/logger';
import { IpValidator } from '@/utils/ip-validator';

export class IPInfoProvider implements IpLookupProvider {
  private readonly baseUrl: string;
  public readonly name = 'IPInfo';

  constructor(private readonly config: IPInfoConfig) {
    this.baseUrl = config.baseUrl || 'https://ipinfo.io';
  }

  async initialise(): Promise<void> {
    try {
      if (!(await this.isAvailable())) {
        logger.info(
          'IPInfo provider initialization skipped - no token available',
          {
            provider: this.name,
          },
        );
        return;
      }

      logger.info('Starting IPInfo provider initialization', {
        provider: this.name,
      });

      // Test the API token with a simple request
      await this.makeRequest('8.8.8.8');
      logger.info('IPInfo provider initialised successfully', {
        provider: this.name,
      });
    } catch (error) {
      const initError = new IpLookupError(
        'Failed to initialise IPInfo provider',
        this.name,
        '8.8.8.8',
        error as Error,
      );
      logger.error(initError.message, {
        provider: this.name,
        error: initError.message,
        stack: initError.stack,
      });
      throw initError;
    }
  }

  async isAvailable(): Promise<boolean> {
    return Boolean(this.config.token);
  }

  private async makeRequest(ip: string): Promise<IPInfoResponse> {
    try {
      logger.info('Making IPInfo API request', {
        provider: this.name,
        ip,
        baseUrl: this.baseUrl,
      });

      const response = await axios.get<IPInfoResponse>(
        `${this.baseUrl}/${ip}`,
        {
          params: {
            token: this.config.token,
          },
          timeout: 5000,
        },
      );

      if (!response.data || !response.data.ip) {
        logger.warn('Invalid response from IPInfo API', {
          provider: this.name,
          ip,
          hasData: !!response.data,
          hasIp: response.data?.ip,
        });
        throw new Error('Invalid response from IPInfo API');
      }

      logger.info('Successfully received IPInfo API response', {
        provider: this.name,
        ip,
        responseIp: response.data.ip,
        hasLocation: !!response.data.loc,
        hasAsn: !!response.data.asn,
        hasCompany: !!response.data.company,
        hasPrivacy: !!response.data.privacy,
        hasAbuse: !!response.data.abuse,
        hasDomains: !!response.data.domains,
      });

      return response.data;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const statusCode =
        error && typeof error === 'object' && 'response' in error
          ? (error.response as { status?: number })?.status
          : 'unknown';

      logger.error('IPInfo API request failed', {
        provider: this.name,
        ip,
        statusCode,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });

      throw new Error(
        `IPInfo API request failed (${statusCode}): ${errorMessage}`,
      );
    }
  }

  async lookup(ip: string): Promise<ProviderResponse> {
    try {
      logger.info('Starting IPInfo lookup', {
        provider: this.name,
        ip,
      });

      if (!ip) {
        logger.warn('IP address is required for IPInfo lookup', {
          provider: this.name,
        });
        throw new IpLookupError('IP address is required', this.name, ip);
      }

      if (!IpValidator.isValidIp(ip)) {
        const ipVersion = IpValidator.getIpVersion(ip);
        logger.warn('Invalid IP address format for IPInfo lookup', {
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
        logger.error('IPInfo provider not available for lookup', {
          provider: this.name,
          ip,
          hasToken: !!this.config.token,
        });
        throw new IpLookupError(
          'IPInfo provider not available - no token configured',
          this.name,
          ip,
        );
      }

      const ipInfoData = await this.makeRequest(ip);

      const result: ProviderResponse = {
        ip: ipInfoData.ip,
        data: ipInfoData,
        lastUpdated: new Date().toISOString(),
      };

      logger.info('Successfully completed IPInfo lookup', {
        provider: this.name,
        ip,
        hasLocation: !!ipInfoData.loc,
        hasAsn: !!ipInfoData.asn,
        hasCompany: !!ipInfoData.company,
        hasPrivacy: !!ipInfoData.privacy,
        hasAbuse: !!ipInfoData.abuse,
        hasDomains: !!ipInfoData.domains,
      });

      return result;
    } catch (error) {
      const lookupError =
        error instanceof IpLookupError
          ? error
          : new IpLookupError(
              'Failed to lookup IP with IPinfo',
              this.name,
              ip,
              error as Error,
            );

      logger.error('IPInfo lookup failed', {
        provider: this.name,
        ip,
        error: lookupError.message,
        stack: lookupError.stack,
      });

      throw lookupError;
    }
  }
}
