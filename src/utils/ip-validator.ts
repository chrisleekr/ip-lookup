export type IpVersion = 'v4' | 'v6';

export class IpValidator {
  private static readonly IPV4_PATTERN = /^(\d{1,3}\.){3}\d{1,3}$/;
  private static readonly IPV6_PATTERN =
    /^([0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}$|^(([0-9a-fA-F]{1,4}:)*)?::([0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}$/;
  private static readonly IPV4_MAPPED_IPV6_PATTERN =
    /^::ffff:(\d{1,3}\.){3}\d{1,3}$/;

  private static readonly PRIVATE_IPV4_RANGES = [
    { start: '10.0.0.0', end: '10.255.255.255' },
    { start: '172.16.0.0', end: '172.31.255.255' },
    { start: '192.168.0.0', end: '192.168.255.255' },
  ];

  private static readonly PRIVATE_IPV6_RANGES = [
    { start: 'fc00::', end: 'fdff:ffff:ffff:ffff:ffff:ffff:ffff:ffff' },
  ];

  static isValidIp(ip: string): boolean {
    // Check for IPv4-mapped IPv6 addresses
    if (this.IPV4_MAPPED_IPV6_PATTERN.test(ip)) {
      const ipv4Part = ip.split(':').pop() as string;
      return this.isValidIpv4(ipv4Part);
    }

    return this.isValidIpv4(ip) || this.isValidIpv6(ip);
  }

  static isValidIpv4(ip: string): boolean {
    if (!this.IPV4_PATTERN.test(ip)) return false;

    return ip.split('.').every((octet) => {
      const num = parseInt(octet, 10);
      return num >= 0 && num <= 255;
    });
  }

  static isValidIpv6(ip: string): boolean {
    if (!this.IPV6_PATTERN.test(ip)) return false;

    // Additional validation for compressed IPv6
    const parts = ip.split(':');
    const hasCompression = ip.includes('::');

    if (!hasCompression && parts.length !== 8) {
      return false;
    }

    return parts.every((part) => {
      if (part === '') return true; // Empty part in compression
      const num = parseInt(part, 16);
      return !isNaN(num) && num >= 0 && num <= 0xffff;
    });
  }

  static getIpVersion(ip: string): IpVersion | null {
    if (this.IPV4_MAPPED_IPV6_PATTERN.test(ip)) {
      const ipv4Part = ip.split(':').pop() as string;
      return this.isValidIpv4(ipv4Part) ? 'v4' : null;
    }

    if (this.isValidIpv4(ip)) return 'v4';
    if (this.isValidIpv6(ip)) return 'v6';

    return null;
  }

  static isPrivateIp(ip: string): boolean {
    const version = this.getIpVersion(ip);
    if (!version) return false;

    if (version === 'v4') {
      return this.isPrivateIpv4(ip);
    } else {
      return this.isPrivateIpv6(ip);
    }
  }

  private static ipv4ToNumber(ip: string): number {
    return (
      ip
        .split('.')
        .reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0
    );
  }

  private static isPrivateIpv4(ip: string): boolean {
    const ipNum = this.ipv4ToNumber(ip);
    return this.PRIVATE_IPV4_RANGES.some((range) => {
      const startNum = this.ipv4ToNumber(range.start);
      const endNum = this.ipv4ToNumber(range.end);
      return ipNum >= startNum && ipNum <= endNum;
    });
  }

  private static ipv6ToBytes(ip: string): Uint8Array {
    // Expand compressed notation
    const parts = ip.split(':');
    const bytes = new Uint8Array(16);
    let j = 0;

    for (let i = 0; i < parts.length; i++) {
      if (parts[i] === '') {
        const remaining = 8 - (parts.length - 1);
        for (let k = 0; k < remaining; k++) {
          bytes[j++] = 0;
          bytes[j++] = 0;
        }
      } else {
        const num = parseInt(parts[i], 16);
        bytes[j++] = (num >> 8) & 0xff;
        bytes[j++] = num & 0xff;
      }
    }

    return bytes;
  }

  private static isPrivateIpv6(ip: string): boolean {
    const bytes = this.ipv6ToBytes(ip);
    return this.PRIVATE_IPV6_RANGES.some((range) => {
      const startBytes = this.ipv6ToBytes(range.start);
      const endBytes = this.ipv6ToBytes(range.end);

      for (let i = 0; i < 16; i++) {
        if (bytes[i] < startBytes[i]) return false;
        if (bytes[i] > endBytes[i]) return false;
        if (bytes[i] !== startBytes[i]) break;
      }

      return true;
    });
  }
}
