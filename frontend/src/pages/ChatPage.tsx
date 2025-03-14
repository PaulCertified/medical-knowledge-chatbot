import React from 'react';
import { Container } from '@mui/material';
import Chat from '../components/Chat/Chat';

const ChatPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Chat />
    </Container>
  );
};

export default ChatPage; 