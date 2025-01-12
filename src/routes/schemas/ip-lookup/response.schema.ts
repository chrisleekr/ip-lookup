export const ipLookupResponseSchema = {
  type: 'object',
  properties: {
    results: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          ip: { type: 'string' },
          providers: {
            type: 'object',
            properties: {
              maxmind: {
                type: 'object',
                properties: {
                  asn: {
                    type: ['object', 'null'],
                    properties: {
                      autonomousSystemNumber: { type: 'number' },
                      autonomousSystemOrganization: { type: 'string' },
                      ipAddress: { type: 'string' },
                      network: { type: 'string' },
                    },
                  },
                  city: {
                    type: ['object', 'null'],
                    properties: {
                      continent: {
                        type: 'object',
                        properties: {
                          code: { type: 'string' },
                          geonameId: { type: 'number' },
                          names: {
                            type: 'object',
                            properties: {
                              de: { type: 'string' },
                              en: { type: 'string' },
                              es: { type: 'string' },
                              fr: { type: 'string' },
                              ja: { type: 'string' },
                              'pt-BR': { type: 'string' },
                              ru: { type: 'string' },
                              'zh-CN': { type: 'string' },
                            },
                          },
                        },
                      },
                      country: {
                        type: 'object',
                        properties: {
                          geonameId: { type: 'number' },
                          isoCode: { type: 'string' },
                          names: {
                            type: 'object',
                            properties: {
                              de: { type: 'string' },
                              en: { type: 'string' },
                              es: { type: 'string' },
                              fr: { type: 'string' },
                              ja: { type: 'string' },
                              'pt-BR': { type: 'string' },
                              ru: { type: 'string' },
                              'zh-CN': { type: 'string' },
                            },
                          },
                        },
                      },
                      location: {
                        type: 'object',
                        properties: {
                          accuracyRadius: { type: 'number' },
                          latitude: { type: 'number' },
                          longitude: { type: 'number' },
                          timeZone: { type: 'string' },
                        },
                      },
                      registeredCountry: {
                        type: 'object',
                        properties: {
                          geonameId: { type: 'number' },
                          isInEuropeanUnion: { type: 'boolean' },
                          isoCode: { type: 'string' },
                          names: {
                            type: 'object',
                            properties: {
                              de: { type: 'string' },
                              en: { type: 'string' },
                              es: { type: 'string' },
                              fr: { type: 'string' },
                              ja: { type: 'string' },
                              'pt-BR': { type: 'string' },
                              ru: { type: 'string' },
                              'zh-CN': { type: 'string' },
                            },
                          },
                        },
                      },
                      traits: {
                        type: 'object',
                        properties: {
                          ipAddress: { type: 'string' },
                          isAnonymous: { type: 'boolean' },
                          isAnonymousProxy: { type: 'boolean' },
                          isAnonymousVpn: { type: 'boolean' },
                          isAnycast: { type: 'boolean' },
                          isHostingProvider: { type: 'boolean' },
                          isLegitimateProxy: { type: 'boolean' },
                          isPublicProxy: { type: 'boolean' },
                          isResidentialProxy: { type: 'boolean' },
                          isSatelliteProvider: { type: 'boolean' },
                          isTorExitNode: { type: 'boolean' },
                          network: { type: 'string' },
                        },
                      },
                      city: {
                        type: 'object',
                        properties: {
                          names: {
                            type: 'object',
                            properties: {
                              de: { type: 'string' },
                              en: { type: 'string' },
                              es: { type: 'string' },
                              fr: { type: 'string' },
                              ja: { type: 'string' },
                              'pt-BR': { type: 'string' },
                              ru: { type: 'string' },
                              'zh-CN': { type: 'string' },
                            },
                          },
                        },
                      },
                      postal: {
                        type: 'object',
                        properties: {
                          code: { type: 'string' },
                        },
                      },
                    },
                  },
                  country: {
                    type: ['object', 'null'],
                    properties: {
                      continent: {
                        type: 'object',
                        properties: {
                          code: { type: 'string' },
                          geonameId: { type: 'number' },
                          names: {
                            type: 'object',
                            properties: {
                              de: { type: 'string' },
                              en: { type: 'string' },
                              es: { type: 'string' },
                              fr: { type: 'string' },
                              ja: { type: 'string' },
                              'pt-BR': { type: 'string' },
                              ru: { type: 'string' },
                              'zh-CN': { type: 'string' },
                            },
                          },
                        },
                      },
                      country: {
                        type: 'object',
                        properties: {
                          geonameId: { type: 'number' },
                          isoCode: { type: 'string' },
                          names: {
                            type: 'object',
                            properties: {
                              de: { type: 'string' },
                              en: { type: 'string' },
                              es: { type: 'string' },
                              fr: { type: 'string' },
                              ja: { type: 'string' },
                              'pt-BR': { type: 'string' },
                              ru: { type: 'string' },
                              'zh-CN': { type: 'string' },
                            },
                          },
                        },
                      },
                      registeredCountry: {
                        type: 'object',
                        properties: {
                          geonameId: { type: 'number' },
                          isInEuropeanUnion: { type: 'boolean' },
                          isoCode: { type: 'string' },
                          names: {
                            type: 'object',
                            properties: {
                              de: { type: 'string' },
                              en: { type: 'string' },
                              es: { type: 'string' },
                              fr: { type: 'string' },
                              ja: { type: 'string' },
                              'pt-BR': { type: 'string' },
                              ru: { type: 'string' },
                              'zh-CN': { type: 'string' },
                            },
                          },
                        },
                      },
                      traits: {
                        type: 'object',
                        properties: {
                          ipAddress: { type: 'string' },
                          isAnonymous: { type: 'boolean' },
                          isAnonymousProxy: { type: 'boolean' },
                          isAnonymousVpn: { type: 'boolean' },
                          isAnycast: { type: 'boolean' },
                          isHostingProvider: { type: 'boolean' },
                          isLegitimateProxy: { type: 'boolean' },
                          isPublicProxy: { type: 'boolean' },
                          isResidentialProxy: { type: 'boolean' },
                          isSatelliteProvider: { type: 'boolean' },
                          isTorExitNode: { type: 'boolean' },
                          network: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
              ipinfo: {
                type: 'object',
                properties: {
                  ip: { type: 'string' },
                  hostname: { type: 'string' },
                  city: { type: 'string' },
                  region: { type: 'string' },
                  country: { type: 'string' },
                  loc: { type: 'string' },
                  org: { type: 'string' },
                  postal: { type: 'string' },
                  timezone: { type: 'string' },
                  asn: {
                    type: 'object',
                    properties: {
                      asn: { type: 'string' },
                      name: { type: 'string' },
                      domain: { type: 'string' },
                      route: { type: 'string' },
                      type: { type: 'string' },
                    },
                  },
                  company: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      domain: { type: 'string' },
                      type: { type: 'string' },
                    },
                  },
                  privacy: {
                    type: 'object',
                    properties: {
                      vpn: { type: 'boolean' },
                      proxy: { type: 'boolean' },
                      tor: { type: 'boolean' },
                      relay: { type: 'boolean' },
                      hosting: { type: 'boolean' },
                      service: { type: 'string' },
                    },
                  },
                  abuse: {
                    type: 'object',
                    properties: {
                      address: { type: 'string' },
                      country: { type: 'string' },
                      email: { type: 'string' },
                      name: { type: 'string' },
                      network: { type: 'string' },
                      phone: { type: 'string' },
                    },
                  },
                  domains: {
                    type: 'object',
                    properties: {
                      page: { type: 'number' },
                      total: { type: 'number' },
                      domains: {
                        type: 'array',
                        items: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
          lastUpdated: { type: 'string' },
          error: { type: 'string' },
        },
        required: ['ip', 'providers', 'lastUpdated'],
      },
    },
  },
  required: ['results'],
};
