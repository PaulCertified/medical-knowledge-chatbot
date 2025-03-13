const env = {
  // API Configuration
  apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  wsUrl: process.env.REACT_APP_WS_URL || 'ws://localhost:3001',

  // Authentication
  authCookieName: process.env.REACT_APP_AUTH_COOKIE_NAME || 'auth_token',
  authCookieDomain: process.env.REACT_APP_AUTH_COOKIE_DOMAIN || 'localhost',
  authCookieSecure: process.env.REACT_APP_AUTH_COOKIE_SECURE === 'true',

  // Feature Flags
  enableDarkMode: process.env.REACT_APP_ENABLE_DARK_MODE !== 'false',
  enableNotifications: process.env.REACT_APP_ENABLE_NOTIFICATIONS !== 'false',

  // Rate Limiting
  rateLimitRequests: Number(process.env.REACT_APP_RATE_LIMIT_REQUESTS) || 100,
  rateLimitWindowMs: Number(process.env.REACT_APP_RATE_LIMIT_WINDOW_MS) || 60000,

  // Analytics and Monitoring
  enableAnalytics: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
  sentryDsn: process.env.REACT_APP_SENTRY_DSN,

  // Chat Configuration
  maxMessageLength: Number(process.env.REACT_APP_MAX_MESSAGE_LENGTH) || 2000,
  messageTimeoutMs: Number(process.env.REACT_APP_MESSAGE_TIMEOUT_MS) || 30000,
  typingIndicatorDelayMs: Number(process.env.REACT_APP_TYPING_INDICATOR_DELAY_MS) || 1000,

  // Development
  debugMode: process.env.REACT_APP_DEBUG_MODE === 'true',
  apiMock: process.env.REACT_APP_API_MOCK === 'true',

  // Helper function to validate required environment variables
  validate() {
    const required = [
      'REACT_APP_API_URL',
    ];

    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  },
} as const;

export default env; 