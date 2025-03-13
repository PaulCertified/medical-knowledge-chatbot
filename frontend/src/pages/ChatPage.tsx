import React, { useState, useCallback } from 'react';
import { Container } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import Chat, { Message } from '../components/Chat';
import { useAuth } from '../contexts/AuthContext';

const ChatPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!isAuthenticated) {
      setError('Please sign in to send messages');
      return;
    }

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: content,
          conversationHistory: messages.map(({ role, content }) => ({
            role,
            content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [messages, isAuthenticated]);

  return (
    <Container
      maxWidth="md"
      sx={{
        height: '100vh',
        py: 2,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Chat
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        error={error}
      />
    </Container>
  );
};

export default ChatPage; 