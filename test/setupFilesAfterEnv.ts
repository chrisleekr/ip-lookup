const mockLogger = {
  // Print error messages to the console
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  http: jest.fn(),
  debug: jest.fn(),
  child: jest.fn().mockReturnThis(),
};

export const createRequestLogger = jest.fn().mockReturnValue(mockLogger);

// Mock the logger module
jest.mock('@/utils/logger', () => ({
  __esModule: true,
  default: mockLogger,
  createRequestLogger,
  error: mockLogger.error,
  warn: mockLogger.warn,
  info: mockLogger.info,
  http: mockLogger.http,
  debug: mockLogger.debug,
}));

// Clear all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});
