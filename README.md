# IP Lookup Service

A TypeScript-based service that provides comprehensive IP address information using Fastify, MaxMind GeoLite2 databases, and IPInfo API, with a focus on identifying privacy networks.

## Features

- Health check endpoint
- Get detailed IP address information from multiple providers:
  - MaxMind GeoLite2:
    - Autonomous System Number (ASN) and Organization
    - City-level geo location data
    - Country information
  - IPInfo:
    - Detailed geo location (city, region, country)
    - ASN and company information
    - Privacy detection (VPN, proxy, Tor, relay)
    - Abuse contact information
    - Domain information
- Periodic automatic updates of MaxMind databases:
  - GeoLite2-ASN
  - GeoLite2-City
  - GeoLite2-Country
- JSON formatted logging optimized for Docker environments
- Swagger documentation

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- ipinfo.io API key (free tier available)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up environment variables:

   ```bash
   cp .env.example .env
   ```

3. Edit `.env`.
4. Download the initial GeoLite2-ASN database:

   ```bash
   npm run update-db
   ```

## Development

Start the development server with hot reload:

```bash
npm run dev
```

## Testing

Run tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## Building

Build the project:

```bash
npm run build
```

## Running in Production

```bash
npm run build
npm start
```

## API Documentation

Once the server is running, visit:

- Swagger UI: <http://localhost:3000/documentation>
- IP Lookup: <http://localhost:3000/api/v1/ip-lookup?ip=192.168.1.1>
  - Returns comprehensive IP information including ASN, city, country, and privacy network detection
- Health check: <http://localhost:3000/api/v1/health>
- Update databases:

  ```bash
  npm run update-db
  ```

### Example Response

```bash
curl "http://localhost:3000/api/v1/ip-lookup?ip=104.28.125.3"
```

```json
{
  "results": [
    {
      "ip": "104.28.125.3",
      "providers": {
        "maxmind": {
          "asn": {
            "autonomousSystemNumber": 13335,
            "autonomousSystemOrganization": "CLOUDFLARENET",
            "ipAddress": "104.28.125.3",
            "network": "104.24.0.0/13"
          },
          "city": {
            "continent": {
              "code": "NA",
              "geonameId": 6255149,
              "names": {
                "de": "Nordamerika",
                "en": "North America",
                "es": "Norteamérica",
                "fr": "Amérique du Nord",
                "ja": "北アメリカ",
                "pt-BR": "América do Norte",
                "ru": "Северная Америка",
                "zh-CN": "北美洲"
              }
            },
            "country": {
              "geonameId": 6252001,
              "isoCode": "US",
              "names": {
                "de": "USA",
                "en": "United States",
                "es": "Estados Unidos",
                "fr": "États Unis",
                "ja": "アメリカ",
                "pt-BR": "EUA",
                "ru": "США",
                "zh-CN": "美国"
              }
            },
            "location": {
              "accuracyRadius": 1000,
              "latitude": 37.751,
              "longitude": -97.822,
              "timeZone": "America/Chicago"
            },
            "registeredCountry": {
              "geonameId": 6252001,
              "isInEuropeanUnion": false,
              "isoCode": "US",
              "names": {
                "de": "USA",
                "en": "United States",
                "es": "Estados Unidos",
                "fr": "États Unis",
                "ja": "アメリカ",
                "pt-BR": "EUA",
                "ru": "США",
                "zh-CN": "美国"
              }
            },
            "traits": {
              "ipAddress": "104.28.125.3",
              "isAnonymous": false,
              "isAnonymousProxy": false,
              "isAnonymousVpn": false,
              "isAnycast": false,
              "isHostingProvider": false,
              "isLegitimateProxy": false,
              "isPublicProxy": false,
              "isResidentialProxy": false,
              "isSatelliteProvider": false,
              "isTorExitNode": false,
              "network": "104.28.125.2/31"
            }
          },
          "country": {
            "continent": {
              "code": "NA",
              "geonameId": 6255149,
              "names": {
                "de": "Nordamerika",
                "en": "North America",
                "es": "Norteamérica",
                "fr": "Amérique du Nord",
                "ja": "北アメリカ",
                "pt-BR": "América do Norte",
                "ru": "Северная Америка",
                "zh-CN": "北美洲"
              }
            },
            "country": {
              "geonameId": 6252001,
              "isoCode": "US",
              "names": {
                "de": "USA",
                "en": "United States",
                "es": "Estados Unidos",
                "fr": "États Unis",
                "ja": "アメリカ",
                "pt-BR": "EUA",
                "ru": "США",
                "zh-CN": "美国"
              }
            },
            "registeredCountry": {
              "geonameId": 6252001,
              "isInEuropeanUnion": false,
              "isoCode": "US",
              "names": {
                "de": "USA",
                "en": "United States",
                "es": "Estados Unidos",
                "fr": "États Unis",
                "ja": "アメリカ",
                "pt-BR": "EUA",
                "ru": "США",
                "zh-CN": "美国"
              }
            },
            "traits": {
              "ipAddress": "104.28.125.3",
              "isAnonymous": false,
              "isAnonymousProxy": false,
              "isAnonymousVpn": false,
              "isAnycast": false,
              "isHostingProvider": false,
              "isLegitimateProxy": false,
              "isPublicProxy": false,
              "isResidentialProxy": false,
              "isSatelliteProvider": false,
              "isTorExitNode": false,
              "network": "104.28.125.2/31"
            }
          }
        },
        "ipinfo": {
          "ip": "104.28.125.3",
          "city": "Sydney",
          "region": "New South Wales",
          "country": "AU",
          "loc": "-33.8678,151.2073",
          "postal": "1001",
          "timezone": "Australia/Sydney",
          "asn": {
            "asn": "AS13335",
            "name": "Cloudflare, Inc.",
            "domain": "cloudflare.com",
            "route": "104.28.125.0/24",
            "type": "hosting"
          },
          "company": {
            "name": "Cloudflare, Inc.",
            "domain": "cloudflare.com",
            "type": "hosting"
          },
          "privacy": {
            "vpn": false,
            "proxy": false,
            "tor": false,
            "relay": true,
            "hosting": true,
            "service": "Apple Private Relay"
          },
          "abuse": {
            "address": "US, CA, San Francisco, 101 Townsend Street, 94107",
            "country": "US",
            "email": "abuse@cloudflare.com",
            "name": "Abuse",
            "network": "104.16.0.0/12",
            "phone": "+1-650-319-8930"
          },
          "domains": {
            "page": 0,
            "total": 0,
            "domains": []
          }
        }
      },
      "lastUpdated": "2025-01-03T11:21:39.551Z"
    }
  ]
}
```

## CI/CD Configuration

### Gitlab

1. Create a Project Access Token:
   - Go to Settings > Access Tokens
   - Create a new token with:
     - Name: release-bot
     - Role: Developer
     - Scopes: api and write_repository
     - Save the token
2. Add the token as a CI/CD variable:
   - Go to Settings > CI/CD > Variables
   - Add new variable:
     - Key: PROJECT_ACCESS_TOKEN
     - Value: (the token you just created)
     - Type: Variable
     - Protect: No
     - Mask: Yes

### Github Actions

1. Create a Github Actions secret:
   - Go to Settings > Secrets and variables > Actions
   - Add new secret:
      - Name: DOCKERHUB_TOKEN
        Value: (the token you just created)
      - Name: DOCKERHUB_USERNAME
        Value: (your Docker Hub username)
      - Name: CODECOV_TOKEN
        Value: (your Codecov token)
