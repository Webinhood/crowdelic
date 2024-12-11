import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { server } from './mocks/server';

// Extend Jest matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveTextContent(text: string): R;
      toBeVisible(): R;
    }
  }
}

// Configure testing-library
configure({
  testIdAttribute: 'data-testid',
});

// Create a new QueryClient instance for testing
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// Enable API mocking before tests
beforeAll(() => server.listen());

// Reset any runtime request handlers we may add during the tests
afterEach(() => {
  server.resetHandlers();
  queryClient.clear();
});

// Clean up after the tests are finished
afterAll(() => server.close());
