export interface IPInfoASN {
  asn: string;
  name: string;
  domain: string;
  route: string;
  type: string;
}

export interface IPInfoCompany {
  name: string;
  domain: string;
  type: string;
}

export interface IPInfoPrivacy {
  vpn: boolean;
  proxy: boolean;
  tor: boolean;
  relay: boolean;
  hosting: boolean;
  service?: string;
}

export interface IPInfoAbuse {
  address: string;
  country: string;
  email: string;
  name: string;
  network: string;
  phone: string;
}

export interface IPInfoDomains {
  page: number;
  total: number;
  domains: string[];
}

export interface IPInfoResponse {
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  loc?: string;
  postal?: string;
  timezone?: string;
  asn?: IPInfoASN;
  company?: IPInfoCompany;
  privacy?: IPInfoPrivacy;
  abuse?: IPInfoAbuse;
  domains?: IPInfoDomains;
}

export interface IPInfoConfig {
  token?: string;
  baseUrl?: string;
}
