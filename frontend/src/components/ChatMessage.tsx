import React from 'react';
import { motion } from 'framer-motion';
import { Avatar, Box, Paper, Typography, useTheme } from '@mui/material';
import { Person, SmartToy } from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ role, content, timestamp }) => {
  const theme = useTheme();
  const isUser = role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          mb: 2,
          flexDirection: isUser ? 'row-reverse' : 'row',
        }}
      >
        <Avatar
          sx={{
            bgcolor: isUser ? theme.palette.primary.main : theme.palette.secondary.main,
          }}
        >
          {isUser ? <Person /> : <SmartToy />}
        </Avatar>
        <Box sx={{ maxWidth: '70%' }}>
          <Paper
            elevation={1}
            sx={{
              p: 2,
              bgcolor: isUser ? theme.palette.primary.light : theme.palette.background.paper,
              borderRadius: 2,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 20,
                [isUser ? 'right' : 'left']: -10,
                borderStyle: 'solid',
                borderWidth: '10px 10px 10px 0',
                borderColor: `transparent ${isUser ? theme.palette.primary.light : theme.palette.background.paper} transparent transparent`,
                transform: isUser ? 'rotate(180deg)' : 'none',
              },
            }}
          >
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={atomDark}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {content}
            </ReactMarkdown>
          </Paper>
          {timestamp && (
            <Typography
              variant="caption"
              sx={{
                mt: 0.5,
                display: 'block',
                textAlign: isUser ? 'right' : 'left',
                color: theme.palette.text.secondary,
              }}
            >
              {new Date(timestamp).toLocaleTimeString()}
            </Typography>
          )}
        </Box>
      </Box>
    </motion.div>
  );
};

export default ChatMessage; 