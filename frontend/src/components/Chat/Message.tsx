import React from 'react';
import { Paper, Typography, Box, useTheme } from '@mui/material';
import { Message as MessageType } from '../../types/chat';
import { format } from 'date-fns';

interface MessageProps {
  message: MessageType;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const theme = useTheme();
  const isUser = message.role === 'user';

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        mb: 2,
      }}
    >
      <Paper
        sx={{
          maxWidth: '70%',
          p: 2,
          backgroundColor: isUser ? theme.palette.primary.main : theme.palette.grey[100],
          color: isUser ? theme.palette.primary.contrastText : theme.palette.text.primary,
          borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
        }}
      >
        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
          {message.content}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 1,
            color: isUser ? 'rgba(255, 255, 255, 0.7)' : theme.palette.text.secondary,
          }}
        >
          {format(new Date(message.timestamp), 'h:mm a')}
        </Typography>
      </Paper>
    </Box>
  );
};

export default Message; 