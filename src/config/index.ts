import { parseNumericEnv } from '@/utils/number';
import * as dotenv from 'dotenv';

dotenv.config();

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';
export type NodeEnv = 'development' | 'production' | 'staging';

export interface Config {
  nodeEnv: string;
  port: number;
  host: string;
  logLevel: string;
  swagger: {
    host: string;
    enabled: boolean;
    scheme: 'http' | 'https';
  };
  cache: {
    ttl: number;
    checkPeriod: number;
    maxKeys: number;
  };
  ipInfo: {
    token: string;
  };
  ipLookup: {
    maxIpsPerRequest: number;
    requestTimeoutMs: number;
    cacheControlMaxAge: number;
    cacheControlStaleIfError: number;
  };
  server: {
    bodyLimit: number;
    requestTimeout: number;
  };
}

export const config: Config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || 'localhost',
  logLevel: process.env.LOG_LEVEL || 'info',
  swagger: {
    host: process.env.SWAGGER_HOST || 'localhost:3000',
    enabled: process.env.NODE_ENV !== 'production',
    scheme: (process.env.SWAGGER_SCHEME || 'http') as 'http' | 'https',
  },
  cache: {
    ttl: parseInt(process.env.CACHE_TTL || '3600', 10),
    checkPeriod: parseInt(process.env.CACHE_CHECK_PERIOD || '600', 10),
    maxKeys: parseInt(process.env.CACHE_MAX_KEYS || '10000', 10),
  },
  ipInfo: {
    token: process.env.IPINFO_API_TOKEN || '',
  },
  ipLookup: {
    maxIpsPerRequest: parseNumericEnv(
      process.env.MAX_IPS_PER_REQUEST,
      100,
      1,
      1000,
      'MAX_IPS_PER_REQUEST',
    ),
    requestTimeoutMs: parseNumericEnv(
      process.env.REQUEST_TIMEOUT_MS,
      30000,
      1,
      60000,
      'REQUEST_TIMEOUT_MS',
    ),
    cacheControlMaxAge: parseNumericEnv(
      process.env.CACHE_CONTROL_MAX_AGE,
      3600,
      0,
      86400,
      'CACHE_CONTROL_MAX_AGE',
    ),
    cacheControlStaleIfError: parseNumericEnv(
      process.env.CACHE_CONTROL_STALE_IF_ERROR,
      600,
      0,
      86400,
      'CACHE_CONTROL_STALE_IF_ERROR',
    ),
  },
  server: {
    bodyLimit: parseInt(process.env.BODY_LIMIT || '1048576', 10), // 1MB
    requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '30000', 10), // 30 seconds
  },
};
