import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';

const Profile: React.FC = () => {
  const { user } = useAuth();
  // Access user properties directly
  const userEmail = user?.email || '';

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Profile
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          User Information
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography>
            <strong>Email:</strong> {userEmail}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Profile; 