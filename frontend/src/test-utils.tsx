import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './setupTests';

function render(ui: React.ReactElement, { route = '/' } = {}) {
  window.history.pushState({}, 'Test page', route);

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ChakraProvider>
          <BrowserRouter>{children}</BrowserRouter>
        </ChakraProvider>
      </QueryClientProvider>
    );
  }

  return {
    ...rtlRender(ui, { wrapper: Wrapper }),
  };
}

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { render };
