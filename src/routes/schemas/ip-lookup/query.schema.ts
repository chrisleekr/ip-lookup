export interface IpQuerystring {
  ip: string | string[];
}

export const ipLookupQuerySchema = {
  type: 'object',
  properties: {
    ip: {
      anyOf: [
        { type: 'string' },
        {
          type: 'array',
          items: { type: 'string' },
          minItems: 1,
          maxItems: 100, // Limiting to 100 IPs per request
        },
      ],
    },
  },
  required: ['ip'],
} as const;
