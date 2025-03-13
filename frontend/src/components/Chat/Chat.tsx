import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Alert, Paper, CircularProgress } from '@mui/material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { v4 as uuidv4 } from 'uuid';
import Message from './Message';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import chatService from '../../services/chatService';
import { Message as MessageType } from '../../types/chat';

const Chat: React.FC = () => {
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const {
    data: chatHistory,
    isLoading: isLoadingHistory,
    error: historyError,
  } = useQuery(['chatHistory', conversationId], () =>
    chatService.getConversationHistory(conversationId)
  );

  const sendMessageMutation = useMutation(
    (message: string) =>
      chatService.sendMessage({
        message,
        conversationId,
      }),
    {
      onMutate: () => {
        setIsTyping(true);
      },
      onSuccess: (response) => {
        setConversationId(response.conversationId);
        queryClient.invalidateQueries(['chatHistory', conversationId]);
      },
      onSettled: () => {
        // Add a small delay before removing the typing indicator to make it feel more natural
        setTimeout(() => {
          setIsTyping(false);
        }, 500);
      },
    }
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isTyping]);

  const handleSendMessage = (message: string) => {
    sendMessageMutation.mutate(message);
  };

  if (isLoadingHistory) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 'calc(100vh - 200px)',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const error = historyError || sendMessageMutation.error;

  return (
    <Box sx={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" gutterBottom>
        Medical Assistant Chat
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error instanceof Error ? error.message : 'An error occurred'}
        </Alert>
      )}

      <Paper
        elevation={3}
        sx={{
          flex: 1,
          mb: 2,
          p: 2,
          overflowY: 'auto',
          backgroundColor: (theme) => theme.palette.grey[50],
        }}
      >
        {!chatHistory?.messages?.length ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              color: 'text.secondary',
            }}
          >
            <Typography variant="body1">
              Start a conversation with the Medical Assistant
            </Typography>
          </Box>
        ) : (
          <>
            {chatHistory.messages.map((message: MessageType) => (
              <Message key={message.id} message={message} />
            ))}
            {isTyping && <TypingIndicator />}
          </>
        )}
        <div ref={messagesEndRef} />
      </Paper>

      <MessageInput
        onSendMessage={handleSendMessage}
        isLoading={sendMessageMutation.isLoading}
      />
    </Box>
  );
};

export default Chat; 