import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  CircularProgress,
  Chip,
  Tooltip,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface RelevantDoc {
  content: string;
  metadata: {
    source: string;
    category: string;
  };
  score: number;
}

const Chat: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [relevantDocs, setRelevantDocs] = useState<RelevantDoc[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('/api/chat', {
        messages: [...messages, userMessage],
      });

      setMessages(prev => [...prev, response.data.message]);
      setRelevantDocs(response.data.relevantDocs || []);
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessage = (message: Message, index: number) => {
    const isUser = message.role === 'user';
    return (
      <Box
        key={index}
        sx={{
          display: 'flex',
          justifyContent: isUser ? 'flex-end' : 'flex-start',
          mb: 2,
        }}
      >
        <Paper
          sx={{
            p: 2,
            maxWidth: '70%',
            backgroundColor: isUser ? 'primary.main' : 'grey.100',
            color: isUser ? 'white' : 'text.primary',
            borderRadius: 2,
          }}
        >
          <Typography variant="body1">{message.content}</Typography>
        </Paper>
      </Box>
    );
  };

  const renderRelevantDocs = () => {
    if (!relevantDocs.length) return null;

    return (
      <Box sx={{ mt: 2, mb: 1 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Relevant Sources:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {relevantDocs.map((doc, index) => (
            <Tooltip
              key={index}
              title={`${doc.content.substring(0, 200)}...
Source: ${doc.metadata.source}
Category: ${doc.metadata.category}`}
            >
              <Chip
                label={`Source ${index + 1}`}
                size="small"
                variant="outlined"
                sx={{ cursor: 'pointer' }}
              />
            </Tooltip>
          ))}
        </Box>
      </Box>
    );
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', py: 3 }}>
        <Paper
          elevation={3}
          sx={{
            flex: 1,
            mb: 2,
            p: 2,
            overflow: 'auto',
            backgroundColor: 'grey.50',
          }}
        >
          {messages.map(renderMessage)}
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Paper>

        {renderRelevantDocs()}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            multiline
            maxRows={4}
            sx={{ backgroundColor: 'white' }}
          />
          <IconButton
            type="submit"
            color="primary"
            disabled={isLoading || !input.trim()}
            sx={{ alignSelf: 'flex-end' }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Container>
  );
};

export default Chat; 