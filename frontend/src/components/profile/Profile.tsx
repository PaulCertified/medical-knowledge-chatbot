import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const userAttributes = user?.getSignInUserSession()?.getIdToken().payload || {};

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
            <strong>Email:</strong> {userAttributes.email}
          </Typography>
          <Typography>
            <strong>First Name:</strong> {userAttributes.given_name}
          </Typography>
          <Typography>
            <strong>Last Name:</strong> {userAttributes.family_name}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default Profile; 