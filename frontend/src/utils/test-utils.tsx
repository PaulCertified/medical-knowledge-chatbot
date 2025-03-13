import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import theme from '../theme';

function render(
  ui: React.ReactElement,
  {
    route = '/',
    initialEntries = [route],
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    }),
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={theme}>
          <MemoryRouter initialEntries={initialEntries}>
            <AuthProvider>
              {children}
            </AuthProvider>
          </MemoryRouter>
        </ThemeProvider>
      </QueryClientProvider>
    );
  }
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { render }; 