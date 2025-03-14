import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';
import theme from './theme';

// Initialize MSW for development mode
async function prepareApp() {
  if (process.env.NODE_ENV === 'development') {
    try {
      const { worker } = await import('./mocks/browser');
      await worker.start({
        onUnhandledRequest: 'bypass', // Don't warn on unhandled requests
        serviceWorker: {
          url: '/mockServiceWorker.js', // Explicitly set the service worker URL
        }
      });
      console.log('MSW initialized for development');
    } catch (error) {
      console.error('MSW initialization failed:', error);
    }
  }
}

prepareApp().then(() => {
  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
  );

  root.render(
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </React.StrictMode>
  );
}); 