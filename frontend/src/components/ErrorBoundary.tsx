import React, { Component, ErrorInfo } from 'react';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  useTheme,
} from '@mui/material';
import { Error as ErrorIcon, Refresh as RefreshIcon } from '@mui/icons-material';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by error boundary:', error, errorInfo);
    // Here you could send the error to your error reporting service
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onReset }) => {
  const theme = useTheme();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 3,
          }}
        >
          <ErrorIcon
            color="error"
            sx={{ fontSize: 64 }}
          />
          <Typography variant="h5" component="h1" align="center" gutterBottom>
            Oops! Something went wrong
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            align="center"
            sx={{ maxWidth: 400 }}
          >
            {error?.message || 'An unexpected error occurred. Please try again.'}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={onReset}
          >
            Try Again
          </Button>
          {process.env.NODE_ENV === 'development' && error && (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mt: 2,
                width: '100%',
                bgcolor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#f5f5f5',
                overflow: 'auto',
              }}
            >
              <Typography
                variant="caption"
                component="pre"
                sx={{
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {error.stack}
              </Typography>
            </Paper>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ErrorBoundary; 