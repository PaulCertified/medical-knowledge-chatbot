import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Alert, Paper, CircularProgress } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import ChatMessage from '../ChatMessage';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import { useAuth } from '../../contexts/AuthContext';
import chatService from '../../services/chatService';
import { SendMessageRequest } from '../../types/chat';

interface ChatMessageType {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
}

interface ChatResponse {
  conversationId: string;
  message: ChatMessageType;
}

const Chat: React.FC = () => {
  const { user } = useAuth();
  const [conversationId, setConversationId] = useState<string>(uuidv4());
  const [isTyping, setIsTyping] = useState(false);
  const [localMessages, setLocalMessages] = useState<ChatMessageType[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Load initial messages
  const { data: initialMessages, isLoading, error } = useQuery<ChatMessageType[]>({
    queryKey: ['chatHistory', conversationId],
    queryFn: () => chatService.getConversationHistory(conversationId),
  });

  // Set local messages from initial data when available
  useEffect(() => {
    if (initialMessages && initialMessages.length > 0 && localMessages.length === 0) {
      setLocalMessages(initialMessages);
    }
  }, [initialMessages, localMessages.length]);

  const sendMessageMutation = useMutation({
    mutationFn: chatService.sendMessage,
    onMutate: (request) => {
      setIsTyping(true);
      
      // Optimistically add user message to UI
      const userMessage: ChatMessageType = {
        id: uuidv4(),
        content: request.content,
        role: 'user',
        timestamp: request.timestamp,
      };
      
      setLocalMessages(prev => [...prev, userMessage]);
    },
    onSuccess: (response: ChatResponse) => {
      // Update conversation ID if needed
      setConversationId(response.conversationId);
      
      // Add bot response to local messages
      setLocalMessages(prev => [...prev, response.message]);
      
      // Invalidate query to refresh history next time
      queryClient.invalidateQueries({ queryKey: ['chatHistory', conversationId] });
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage: ChatMessageType = {
        id: uuidv4(),
        content: 'Sorry, an error occurred. Please try again.',
        role: 'assistant',
        timestamp: new Date().toISOString(),
      };
      
      setLocalMessages(prev => [...prev, errorMessage]);
    },
    onSettled: () => {
      setIsTyping(false);
    },
  });

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [localMessages, isTyping]);

  const handleSendMessage = (content: string) => {
    if (!content.trim()) return;
    
    const timestamp = new Date().toISOString();
    const request: SendMessageRequest = {
      content,
      conversationId,
      userId: user?.email || '',
      timestamp,
    };
    sendMessageMutation.mutate(request);
  };

  if (error) {
    return (
      <Alert severity="error">
        An error occurred while loading messages. Please try again later.
      </Alert>
    );
  }

  // Determine which messages to display - use local messages if available, otherwise fall back to initialMessages
  const displayMessages: ChatMessageType[] = localMessages.length > 0 ? localMessages : (initialMessages || []);

  return (
    <Box sx={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Medical Assistant Chat
        </Typography>
        <Paper elevation={3} sx={{ p: 2, flexGrow: 1, overflow: 'auto', mb: 2, maxHeight: 'calc(100vh - 280px)' }}>
          {isLoading && displayMessages.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {displayMessages.map((message: ChatMessageType) => (
                <ChatMessage
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  timestamp={message.timestamp}
                />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </>
          )}
        </Paper>
        <MessageInput onSendMessage={handleSendMessage} disabled={isTyping} />
      </Box>
    </Box>
  );
};

export default Chat; 