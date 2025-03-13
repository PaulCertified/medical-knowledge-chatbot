import React, { useState, useRef, useEffect } from 'react';
import { Box, IconButton, InputBase, Paper, Tooltip } from '@mui/material';
import { Send, Clear } from '@mui/icons-material';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  disabled = false,
  placeholder = 'Type your message...',
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Paper
      component="form"
      onSubmit={handleSubmit}
      elevation={3}
      sx={{
        p: '8px 16px',
        display: 'flex',
        alignItems: 'flex-end',
        gap: 1,
        backgroundColor: (theme) => theme.palette.background.paper,
        borderRadius: 2,
        position: 'relative',
      }}
    >
      <InputBase
        inputRef={textareaRef}
        multiline
        maxRows={4}
        fullWidth
        placeholder={placeholder}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={disabled}
        sx={{
          fontSize: '1rem',
          lineHeight: 1.5,
          '& textarea': {
            maxHeight: '150px',
            overflowY: 'auto',
            resize: 'none',
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: (theme) => theme.palette.primary.main,
              borderRadius: '4px',
            },
          },
        }}
      />
      <Box sx={{ display: 'flex', gap: 1 }}>
        {message && (
          <Tooltip title="Clear message">
            <IconButton
              size="small"
              onClick={() => setMessage('')}
              disabled={disabled}
            >
              <Clear />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="Send message (Enter)">
          <span>
            <IconButton
              type="submit"
              color="primary"
              disabled={!message.trim() || disabled}
              size="small"
            >
              <Send />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Paper>
  );
};

export default ChatInput; 