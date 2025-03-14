import React, { useState, KeyboardEvent } from 'react';
import {
  Paper,
  InputBase,
  IconButton,
  CircularProgress,
  Box,
  useTheme,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage, 
  isLoading = false, 
  disabled = false 
}) => {
  const [message, setMessage] = useState('');
  const theme = useTheme();

  const handleSubmit = () => {
    if (message.trim() && !disabled && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: '8px',
        display: 'flex',
        alignItems: 'center',
        borderRadius: 3,
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <InputBase
        multiline
        maxRows={4}
        sx={{
          ml: 2,
          flex: 1,
          fontSize: '1rem',
        }}
        placeholder="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={disabled}
      />
      <Box sx={{ ml: 1, mr: 1 }}>
        {isLoading ? (
          <CircularProgress size={24} />
        ) : (
          <IconButton
            color="primary"
            onClick={handleSubmit}
            disabled={!message.trim() || disabled}
            sx={{
              backgroundColor: message.trim() ? theme.palette.primary.main : 'transparent',
              color: message.trim() ? theme.palette.primary.contrastText : theme.palette.text.disabled,
              '&:hover': {
                backgroundColor: message.trim() ? theme.palette.primary.dark : 'transparent',
              },
            }}
          >
            <SendIcon />
          </IconButton>
        )}
      </Box>
    </Paper>
  );
};

export default MessageInput; 