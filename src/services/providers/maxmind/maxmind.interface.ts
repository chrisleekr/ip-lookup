export interface MaxMindConfig {
  asnDbPath?: string;
  cityDbPath?: string;
  countryDbPath?: string;
}

export interface MaxMindASNResponse {
  autonomousSystemNumber?: number;
  autonomousSystemOrganization?: string;
  ipAddress?: string;
  network?: string;
}

export interface MaxMindNames {
  de?: string;
  en?: string;
  es?: string;
  fr?: string;
  ja?: string;
  'pt-BR'?: string;
  ru?: string;
  'zh-CN'?: string;
}

export interface MaxMindContinent {
  code: string;
  geonameId: number;
  names: MaxMindNames;
}

export interface MaxMindCountry {
  geonameId: number;
  isoCode: string;
  names: MaxMindNames;
}

export interface MaxMindLocation {
  accuracyRadius?: number;
  latitude?: number;
  longitude?: number;
  timeZone?: string;
}

export interface MaxMindRegisteredCountry {
  geonameId: number;
  isInEuropeanUnion: boolean;
  isoCode: string;
  names: MaxMindNames;
}

export interface MaxMindTraits {
  ipAddress?: string;
  isAnonymous?: boolean;
  isAnonymousProxy?: boolean;
  isAnonymousVpn?: boolean;
  isAnycast?: boolean;
  isHostingProvider?: boolean;
  isLegitimateProxy?: boolean;
  isPublicProxy?: boolean;
  isResidentialProxy?: boolean;
  isSatelliteProvider?: boolean;
  isTorExitNode?: boolean;
  network?: string;
}

export interface MaxMindCity {
  names: MaxMindNames;
}

export interface MaxMindPostal {
  code: string;
}

export interface MaxMindCityResponse {
  continent?: MaxMindContinent;
  country?: MaxMindCountry;
  location?: MaxMindLocation;
  registeredCountry?: MaxMindRegisteredCountry;
  traits?: MaxMindTraits;
  city?: MaxMindCity;
  postal?: MaxMindPostal;
}

export interface MaxMindCountryResponse {
  continent?: MaxMindContinent;
  country?: MaxMindCountry;
  registeredCountry?: MaxMindRegisteredCountry;
  traits?: MaxMindTraits;
}
