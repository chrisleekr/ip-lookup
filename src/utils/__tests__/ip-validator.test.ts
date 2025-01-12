import { IpValidator, IpVersion } from '../ip-validator';

describe('ip-validator', () => {
  describe('isValidIp', () => {
    let result: boolean;

    describe('when IP is mapped IPv6 address', () => {
      beforeEach(() => {
        result = IpValidator.isValidIp('::ffff:192.168.1.1');
      });

      it('should return true', () => {
        expect(result).toBe(true);
      });
    });

    describe('when IP is valid IPv4 address', () => {
      beforeEach(() => {
        result = IpValidator.isValidIp('1.1.1.1');
      });

      it('should return true', () => {
        expect(result).toBe(true);
      });
    });

    describe('when IP is valid IPv6 address', () => {
      beforeEach(() => {
        result = IpValidator.isValidIp(
          '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
        );
      });

      it('should return true', () => {
        expect(result).toBe(true);
      });
    });
  });

  describe('isValidIpv4', () => {
    let result: boolean;

    describe('when IP is valid IPv4 address', () => {
      beforeEach(() => {
        result = IpValidator.isValidIpv4('1.1.1.1');
      });

      it('should return true', () => {
        expect(result).toBe(true);
      });
    });

    describe('when IP is not a valid IPv4 address', () => {
      beforeEach(() => {
        result = IpValidator.isValidIpv4('1.1.1.256');
      });

      it('should return false', () => {
        expect(result).toBe(false);
      });
    });

    describe('when IP is not a valid IPv4 address', () => {
      beforeEach(() => {
        result = IpValidator.isValidIpv4('1.1.1.256');
      });

      it('should return false', () => {
        expect(result).toBe(false);
      });
    });
  });

  describe('isValidIpv6', () => {
    let result: boolean;

    describe('when IP is valid IPv6 address', () => {
      beforeEach(() => {
        result = IpValidator.isValidIpv6(
          '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
        );
      });

      it('should return true', () => {
        expect(result).toBe(true);
      });
    });

    describe('when IP is not a valid IPv6 address', () => {
      beforeEach(() => {
        result = IpValidator.isValidIpv6(
          '2001:0db8:85a3:0000:0000:8a2e:0370:7334:7334',
        );
      });

      it('should return false', () => {
        expect(result).toBe(false);
      });
    });

    describe('when IP has valid compression', () => {
      beforeEach(() => {
        result = IpValidator.isValidIpv6('::1');
      });

      it('should return true', () => {
        expect(result).toBe(true);
      });
    });

    describe('when IP has compression count of 0', () => {
      beforeEach(() => {
        result = IpValidator.isValidIpv6('2001:db8:85a3:1:1:8a2e:370:7334::');
      });

      it('should return false', () => {
        expect(result).toBe(false);
      });
    });

    describe('when IP has multiple compressions', () => {
      beforeEach(() => {
        result = IpValidator.isValidIpv6('::1::1::1::1::1::1::1::1');
      });

      it('should return false', () => {
        expect(result).toBe(false);
      });
    });

    describe('when IP has no compression but incorrect number of parts', () => {
      beforeEach(() => {
        result = IpValidator.isValidIpv6('ffff:ffff:ffff:ffff:ffff:ffff:ffff');
      });

      it('should return false', () => {
        expect(result).toBe(false);
      });
    });
  });

  describe('getIpVersion', () => {
    let result: IpVersion | null;

    describe('when IP is valid IPv4 address', () => {
      beforeEach(() => {
        result = IpValidator.getIpVersion('1.1.1.1');
      });

      it('should return v4', () => {
        expect(result).toBe('v4');
      });
    });

    describe('when IP is valid IPv6 address', () => {
      beforeEach(() => {
        result = IpValidator.getIpVersion(
          '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
        );
      });

      it('should return v6', () => {
        expect(result).toBe('v6');
      });
    });

    describe('when IP is not a valid IP address', () => {
      beforeEach(() => {
        result = IpValidator.getIpVersion('1.1.1.256');
      });

      it('should return null', () => {
        expect(result).toBeNull();
      });
    });

    describe('when IP is mapped IPv6 address', () => {
      beforeEach(() => {
        result = IpValidator.getIpVersion('::ffff:192.168.1.1');
      });

      it('should return v4', () => {
        expect(result).toBe('v4');
      });
    });

    describe('when IP is not valid mapped IPv6 address', () => {
      beforeEach(() => {
        result = IpValidator.getIpVersion('::ffff:192.168.1.256');
      });

      it('should return null', () => {
        expect(result).toBeNull();
      });
    });
  });

  describe('isPrivateIp', () => {
    let result: boolean;

    describe('when IP is private IPv4 address', () => {
      beforeEach(() => {
        result = IpValidator.isPrivateIp('192.168.1.1');
      });

      it('should return true', () => {
        expect(result).toBe(true);
      });
    });

    describe('when IP is not a private IPv4 address', () => {
      beforeEach(() => {
        result = IpValidator.isPrivateIp('1.1.1.1');
      });

      it('should return false', () => {
        expect(result).toBe(false);
      });
    });

    describe('when IP is private IPv6 address', () => {
      describe('when IP is valid private IPv6 address', () => {
        beforeEach(() => {
          result = IpValidator.isPrivateIp(
            'fd00:0000:0000:0000:0000:0000:0000:0001',
          );
        });

        it('should return true', () => {
          expect(result).toBe(true);
        });
      });

      describe('when IP is not a valid private IPv6 address, start of range', () => {
        beforeEach(() => {
          result = IpValidator.isPrivateIp(
            'fb00:0000:0000:0000:0000:0000:0000:0000',
          );
        });

        it('should return false', () => {
          expect(result).toBe(false);
        });
      });

      describe('when IP is not a valid private IPv6 address, end byte of range', () => {
        beforeEach(() => {
          result = IpValidator.isPrivateIp(
            'fe00:0000:0000:0000:0000:0000:0000:0000',
          );
        });

        it('should return false', () => {
          expect(result).toBe(false);
        });
      });
    });

    describe('when IP is not a valid IP address', () => {
      beforeEach(() => {
        result = IpValidator.isPrivateIp('1.1.1.256');
      });

      it('should return false', () => {
        expect(result).toBe(false);
      });
    });
  });
});
