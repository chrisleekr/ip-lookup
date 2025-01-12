import { parseNumericEnv } from '../number';

describe('number', () => {
  describe('parseNumericEnv', () => {
    let result: number;

    let error: Error;

    describe('when the value is a valid number', () => {
      beforeEach(() => {
        result = parseNumericEnv('123', 100, 0, 1000, 'test');
      });

      it('should return the parsed number', () => {
        expect(result).toEqual(123);
      });
    });

    describe('when value is undefined', () => {
      beforeEach(() => {
        try {
          result = parseNumericEnv(undefined, 100, 0, 1000, 'test');
        } catch (e) {
          error = e as Error;
        }
      });

      it('should return the default value', () => {
        expect(result).toEqual(100);
      });
    });

    describe('when value is not a valid number', () => {
      beforeEach(() => {
        try {
          result = parseNumericEnv('not a number', 100, 0, 1000, 'test');
        } catch (e) {
          error = e as Error;
        }
      });

      it('should throw an error', () => {
        expect(error.message).toEqual(
          'test must be a number between 0 and 1000. Got: not a number',
        );
      });
    });
  });
});
