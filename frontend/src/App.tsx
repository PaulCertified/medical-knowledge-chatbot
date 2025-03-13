import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, useMediaQuery } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import getTheme from './theme';
import env from './config/env';

// Components
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ChatPage from './pages/ChatPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Checking authentication..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState<'light' | 'dark'>(
    env.enableDarkMode && prefersDarkMode ? 'dark' : 'light'
  );

  useEffect(() => {
    if (env.enableDarkMode) {
      setMode(prefersDarkMode ? 'dark' : 'light');
    }
  }, [prefersDarkMode]);

  const theme = React.useMemo(() => getTheme(mode), [mode]);

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route
                path="/chat"
                element={
                  <ProtectedRoute>
                    <ChatPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/" element={<Navigate to="/chat" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App; 