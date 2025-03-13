import { jest } from '@jest/globals';

// Configure Jest to use modern fake timers
jest.useFakeTimers();

// Configure Jest to automatically mock certain modules
jest.mock('@aws-sdk/client-bedrock-runtime');
jest.mock('@opensearch-project/opensearch');
jest.mock('axios');

// Configure Jest to clear all mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

// Configure Jest to restore all mocks after each test
afterEach(() => {
  jest.restoreAllMocks();
});

// Extend Jest matchers
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});

// Clear all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
}); 