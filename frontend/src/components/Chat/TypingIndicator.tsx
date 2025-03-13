import React from 'react';
import { Box, Paper, keyframes, useTheme } from '@mui/material';

const bounce = keyframes`
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-5px); }
`;

const TypingIndicator: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-start',
        mb: 2,
      }}
    >
      <Paper
        sx={{
          maxWidth: '70%',
          p: 2,
          backgroundColor: theme.palette.grey[100],
          borderRadius: '20px 20px 20px 4px',
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
        }}
      >
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              width: 8,
              height: 8,
              backgroundColor: theme.palette.grey[400],
              borderRadius: '50%',
              animation: `${bounce} 1s infinite`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </Paper>
    </Box>
  );
};

export default TypingIndicator; 