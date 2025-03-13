import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  Container,
  CircularProgress
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: input,
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // TODO: Implement actual API call to backend
      const response = await fetch(`${process.env.REACT_APP_API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers here
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      
      const botMessage = {
        id: Date.now() + 1,
        text: data.response,
        sender: 'bot',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      // Handle error appropriately
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Paper 
        elevation={3} 
        sx={{ 
          height: '70vh', 
          display: 'flex', 
          flexDirection: 'column',
          p: 2,
          backgroundColor: '#f5f5f5'
        }}
      >
        <Box 
          sx={{ 
            flexGrow: 1, 
            overflow: 'auto',
            mb: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1
          }}
        >
          {messages.map((message) => (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <Paper
                sx={{
                  p: 2,
                  maxWidth: '70%',
                  backgroundColor: message.sender === 'user' ? '#e3f2fd' : '#ffffff',
                  borderRadius: 2,
                }}
              >
                <Typography variant="body1">{message.text}</Typography>
                <Typography variant="caption" color="textSecondary">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </Typography>
              </Paper>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Box>

        <Box component="form" onSubmit={handleSend} sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            sx={{ backgroundColor: '#ffffff' }}
          />
          <IconButton 
            type="submit" 
            color="primary" 
            disabled={isLoading || !input.trim()}
          >
            {isLoading ? <CircularProgress size={24} /> : <SendIcon />}
          </IconButton>
        </Box>
      </Paper>
    </Container>
  );
};

export default ChatInterface; 