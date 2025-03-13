import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
import { server } from './mocks/server';

// Mock TextEncoder/TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() { return null; }
  unobserve() { return null; }
  disconnect() { return null; }
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() { return null; }
  unobserve() { return null; }
  disconnect() { return null; }
} as any;

// Setup MSW
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close()); 