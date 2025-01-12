import logger from '@/utils/logger';

describe('index.ts', () => {
  beforeEach(() => {
    jest.resetModules();

    // Mock process.exit
    jest.spyOn(process, 'exit').mockImplementation(() => {
      return undefined as never;
    });
  });

  describe('when buildApp is successful', () => {
    let mockBuildApp: jest.Mock;

    beforeEach(async () => {
      mockBuildApp = jest.fn().mockResolvedValue({
        listen: jest.fn().mockResolvedValue(undefined),
      });
      jest.mock('@/app', () => ({
        buildApp: mockBuildApp,
      }));

      await import('@/index');
    });

    it('should call buildApp', () => {
      expect(mockBuildApp).toHaveBeenCalled();
    });

    it('should log server start message', () => {
      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Server is running on port'),
      );
    });

    it('should not call process.exit', () => {
      expect(process.exit).not.toHaveBeenCalled();
    });
  });

  describe('when buildApp fails', () => {
    describe('when error is Error', () => {
      beforeEach(async () => {
        // Test to delete process.env.PORT
        delete process.env.PORT;

        const error = new Error('Failed to build app');
        jest.mock('@/app', () => ({
          buildApp: jest.fn().mockRejectedValue(error),
        }));

        await import('@/index');
      });

      it('triggers process.exit with 1', () => {
        expect(process.exit).toHaveBeenCalledWith(1);
      });
    });

    describe('when error is not Error', () => {
      beforeEach(async () => {
        const error = 'Failed to build app';
        jest.mock('@/app', () => ({
          buildApp: jest.fn().mockRejectedValue(error),
        }));

        await import('@/index');
      });

      it('triggers process.exit with 1', () => {
        expect(process.exit).toHaveBeenCalledWith(1);
      });
    });
  });
});
