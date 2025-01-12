# IP Lookup Service

A TypeScript-based service that provides comprehensive IP address information using Fastify, MaxMind GeoLite2 databases, and IPInfo API, with a focus on identifying privacy networks.

[![CI](https://github.com/chrisleekr/ip-lookup/actions/workflows/ci.yml/badge.svg)](https://github.com/chrisleekr/ip-lookup/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/chrisleekr/ip-lookup/branch/main/graph/badge.svg)](https://codecov.io/gh/chrisleekr/ip-lookup)
[![Docker Image Version (latest semver)](https://img.shields.io/docker/v/chrisleekr/ip-lookup?sort=semver)](https://hub.docker.com/r/chrisleekr/ip-lookup)
[![Docker Pulls](https://img.shields.io/docker/pulls/chrisleekr/ip-lookup)](https://hub.docker.com/r/chrisleekr/ip-lookup)
[![MIT License](https://img.shields.io/github/license/chrisleekr/ip-lookup)](https://github.com/chrisleekr/ip-lookup/blob/main/LICENSE)

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
2. Create a Personal Access Token for Release Please:
   - Go to Settings > Developer settings > Personal access tokens
   - Create a new Fine-grained token with:
     - Name: Release Please Token
     - Expiration: 1 year
     - Repository access: Only selected repositories
     - Repository: (your repository)
     - Permissions:
       - Contents: Read and write
       - Pull requests: Read and write
       - Workflows: Read and write
     - Generate the token
3. Add the token as a Github Actions secret:
   - Go to Settings > Secrets and variables > Actions
   - Add new secret:
     - Name: RELEASE_PLEASE_TOKEN
     - Value: (the token you just created)

### ArgoCD

The application can be deployed using ArgoCD. The configuration files are located in the `argocd` directory:

- `argocd-app.yaml`: ArgoCD Application manifest with Helm values
- `argocd-secret.yaml`: Secrets configuration

1. Add the Helm repository to ArgoCD:

   ```bash
   argocd repo add https://chrisleekr.github.io/helm-charts --type helm --name chrisleekr
   ```

2. Create the namespace:

   ```bash
   kubectl create namespace ip-lookup
   ```

3. Create the secret with your IPInfo token:

   ```bash
   # Option 1: Using kubectl create secret
   kubectl create secret generic ip-lookup-secret -n ip-lookup \
     --from-literal=ipinfo-token=your-actual-token-here

   # Option 2: Using the secret manifest
   export IPINFO_TOKEN=your-actual-token-here
   cat argocd/argocd-secret.yaml | sed "s/ipinfo-token:.*/ipinfo-token: $IPINFO_TOKEN/" | kubectl apply -f -
   ```

4. Deploy the application with your domain:

   ```bash
   # Set your domain
   export INGRESS_HOST=ip-lookup.your-domain.com

   # Apply the ArgoCD application with the domain substituted
   cat argocd/argocd-app.yaml | \
     sed "s/INGRESS_HOST_PLACEHOLDER/$INGRESS_HOST/g" | \
     kubectl apply -f -
   ```

5. Check the deployment status:

   ```bash
   argocd app get ip-lookup
   ```

6. Sync the application if needed:

   ```bash
   argocd app sync ip-lookup
   ```

The application will be deployed to the `ip-lookup` namespace with:

- Ingress configured with HTTPS using Let's Encrypt
- Automatic syncing enabled
- Resource limits and health checks configured
- Security headers and SSL redirect enabled
