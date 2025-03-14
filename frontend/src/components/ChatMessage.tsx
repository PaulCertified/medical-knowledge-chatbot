import React from 'react';
import { motion } from 'framer-motion';
import { Avatar, Box, Paper, Typography, useTheme } from '@mui/material';
import { Person, SmartToy } from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighterComponent } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Create a valid React component with double type casting as suggested in the error
const SyntaxHighlighter = (SyntaxHighlighterComponent as unknown) as React.FC<any>;

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ role, content, timestamp }) => {
  const theme = useTheme();

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
          flexDirection: role === 'user' ? 'row-reverse' : 'row',
        }}
      >
        <Avatar
          sx={{
            bgcolor: role === 'user' ? theme.palette.primary.main : theme.palette.secondary.main,
          }}
        >
          {role === 'user' ? <Person /> : <SmartToy />}
        </Avatar>
        <Box sx={{ maxWidth: '70%' }}>
          <Paper
            elevation={1}
            sx={{
              p: 2,
              bgcolor: role === 'user' ? theme.palette.primary.light : theme.palette.background.paper,
              borderRadius: 2,
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 20,
                [role === 'user' ? 'right' : 'left']: -10,
                borderStyle: 'solid',
                borderWidth: '10px 10px 10px 0',
                borderColor: `transparent ${role === 'user' ? theme.palette.primary.light : theme.palette.background.paper} transparent transparent`,
                transform: role === 'user' ? 'rotate(180deg)' : 'none',
              },
            }}
          >
            <Box sx={{ overflow: 'hidden' }}>
              <ReactMarkdown
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        style={atomDark as any}
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
            </Box>
          </Paper>
          <Typography
            variant="caption"
            sx={{
              mt: 0.5,
              display: 'block',
              textAlign: role === 'user' ? 'right' : 'left',
              color: theme.palette.text.secondary,
            }}
          >
            {timestamp}
          </Typography>
        </Box>
      </Box>
    </motion.div>
  );
};

export default ChatMessage; 