// Test setup file for Jest
// This file runs before each test file

// Mock console methods to avoid noise in test output
global.console = {
  ...console,
  // Uncomment the lines below if you want to suppress console output during tests
  // log: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Set test environment variables
process.env.NODE_ENV = 'test';

// Global test timeout
jest.setTimeout(10000);

