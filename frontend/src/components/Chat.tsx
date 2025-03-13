import React, { useEffect, useRef, useState } from 'react';
import { Box, Paper, Typography, useTheme } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  error?: string | null;
}

const Chat: React.FC<ChatProps> = ({
  messages,
  onSendMessage,
  isLoading = false,
  error = null,
}) => {
  const theme = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, autoScroll]);

  const handleScroll = () => {
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setAutoScroll(isNearBottom);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        maxHeight: '100vh',
        bgcolor: theme.palette.background.default,
      }}
    >
      <Paper
        ref={chatContainerRef}
        onScroll={handleScroll}
        elevation={0}
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          bgcolor: 'transparent',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: theme.palette.primary.main,
            borderRadius: '4px',
          },
        }}
      >
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ChatMessage
                role={message.role}
                content={message.content}
                timestamp={message.timestamp}
              />
            </motion.div>
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <ChatMessage
                role="assistant"
                content="Thinking..."
              />
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Typography
                color="error"
                variant="body2"
                sx={{ textAlign: 'center', mt: 2 }}
              >
                {error}
              </Typography>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </Paper>
      <Box sx={{ p: 2 }}>
        <ChatInput
          onSend={onSendMessage}
          disabled={isLoading}
          placeholder="Ask me anything about medical topics..."
        />
      </Box>
    </Box>
  );
};

export default Chat; 