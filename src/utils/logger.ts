/* eslint-disable @typescript-eslint/no-explicit-any */

import { config } from '@/config';
import winston from 'winston';

// Define custom log levels with corresponding priorities
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Extended list of sensitive fields to redact
const sensitiveFields = [
  'token',
  'password',
  'secret',
  'key',
  'auth',
  'bearer',
  'credential',
  'private',
];

// Custom format that redacts sensitive information
const redactFormat = winston.format(
  (info: winston.Logform.TransformableInfo) => {
    const redactValue = (value: any): any => {
      if (Array.isArray(value)) {
        return value.map(redactValue);
      }
      if (value && typeof value === 'object') {
        return redactObject(value);
      }
      return value;
    };

    const redactObject = (obj: Record<string, any>): Record<string, any> => {
      const result: Record<string, any> = {};

      try {
        for (const [key, value] of Object.entries(obj)) {
          // Check if the key contains sensitive information
          if (
            sensitiveFields.some((field) => key.toLowerCase().includes(field))
          ) {
            result[key] = '[REDACTED]';
          } else {
            result[key] = redactValue(value);
          }
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (error) {
        return { ...obj, redactionError: true };
      }

      return result;
    };

    // Create a new object with redacted values while preserving the original structure
    const redactedInfo = { ...info, ...redactObject(info) };

    // Preserve Winston's special symbols
    const levelSymbol = Object.getOwnPropertySymbols(info).find(
      (symbol) => symbol.toString() === 'Symbol(level)',
    );
    if (levelSymbol) {
      redactedInfo[levelSymbol as any] = info[levelSymbol as any];
    }

    return redactedInfo;
  },
)();

// Error serializer to handle Error objects properly
const errorSerializer = winston.format((info) => {
  if (info.error instanceof Error) {
    info.error = {
      message: info.error.message,
      stack: info.error.stack,
      name: info.error.name,
      ...(info.error as any), // Include any custom properties
    };
  }
  return info;
})();

// Create the logger instance
const logger = winston.createLogger({
  levels: logLevels,
  level: config.logLevel || 'info',
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    errorSerializer,
    redactFormat,
    winston.format.timestamp(),
    winston.format.json(),
  ),
  defaultMeta: {
    service: 'ip-lookup',
    version: process.env.npm_package_version || '0.0.0',
    node_env: config.nodeEnv,
    node_version: process.version,
  },
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
      handleRejections: true,
    }),
  ],
  exitOnError: false,
});

// Create a child logger with request tracking
export const createRequestLogger = (requestId: string): winston.Logger => {
  return logger.child({ requestId });
};

export { logger as default };
export const { error, warn, info, http, debug } = logger;
