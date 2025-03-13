import React, { useState } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Settings: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Example preferences - these would be stored in a backend
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    chatHistory: true,
    darkMode: false,
  });

  const handlePreferenceChange = (preference: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [preference]: !prev[preference],
    }));
    // Here you would typically save to backend
    setSuccess('Preferences updated successfully');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Failed to sign out');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>
          Settings
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Account Information
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Email: {user?.email}
          </Typography>
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Preferences
          </Typography>
          
          <FormControlLabel
            control={
              <Switch
                checked={preferences.emailNotifications}
                onChange={() => handlePreferenceChange('emailNotifications')}
              />
            }
            label="Email Notifications"
          />
          
          <Divider sx={{ my: 2 }} />
          
          <FormControlLabel
            control={
              <Switch
                checked={preferences.chatHistory}
                onChange={() => handlePreferenceChange('chatHistory')}
              />
            }
            label="Save Chat History"
          />
          
          <Divider sx={{ my: 2 }} />
          
          <FormControlLabel
            control={
              <Switch
                checked={preferences.darkMode}
                onChange={() => handlePreferenceChange('darkMode')}
              />
            }
            label="Dark Mode"
          />
        </Paper>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Account Actions
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="error"
              onClick={handleSignOut}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Sign Out'}
            </Button>
            
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                // Implement account deletion
                alert('Account deletion not implemented');
              }}
            >
              Delete Account
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Settings; 