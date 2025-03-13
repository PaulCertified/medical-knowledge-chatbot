import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  Link,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup, isLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      await signup(email, password, name);
      navigate('/chat');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            maxWidth: 400,
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          <Typography variant="h4" component="h1" align="center" gutterBottom>
            Create Account
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <TextField
              label="Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />

            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
            />

            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              helperText="Password must be at least 8 characters long"
            />

            <TextField
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              fullWidth
              error={password !== confirmPassword && confirmPassword !== ''}
              helperText={
                password !== confirmPassword && confirmPassword !== ''
                  ? 'Passwords do not match'
                  : ''
              }
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={isLoading}
              fullWidth
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </Button>
          </form>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link
                component="button"
                variant="body2"
                onClick={() => navigate('/login')}
              >
                Log in
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default SignupPage;
