import {
  MaxMindASNResponse,
  MaxMindCityResponse,
  MaxMindCountryResponse,
} from '@/services/providers/maxmind/maxmind.interface';
import { IPInfoResponse } from '@/services/providers/ipinfo/ipinfo.interface';

export interface ProviderResponse {
  ip: string;
  data: unknown;
  lastUpdated: string;
}

export interface IpLookupResult {
  ip: string;
  providers: {
    maxmind?: {
      asn: MaxMindASNResponse | null;
      city: MaxMindCityResponse | null;
      country: MaxMindCountryResponse | null;
    };
    ipinfo?: IPInfoResponse;
  };
  lastUpdated: string;
  error?: string;
}

export interface IpLookupMetrics {
  totalRequests: number;
  errors: number;
  lastError?: {
    timestamp: string;
    message: string;
  };
}

export interface ProviderStatus {
  name: string;
  available: boolean;
}

export interface IpLookupProvider {
  name: string;
  lookup(ip: string): Promise<ProviderResponse>;
  initialise(): Promise<void>;
  isAvailable(): Promise<boolean>;
}

export class IpLookupError extends Error {
  constructor(
    message: string,
    public readonly provider: string,
    public readonly ip: string,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = 'IpLookupError';
  }
}
