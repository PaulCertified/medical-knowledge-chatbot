import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../theme';
import ChatMessage from '../ChatMessage';

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('ChatMessage', () => {
  const mockTimestamp = new Date('2024-01-01T12:00:00Z');

  it('renders user message correctly', () => {
    renderWithTheme(
      <ChatMessage
        role="user"
        content="Hello, this is a test message"
        timestamp={mockTimestamp}
      />
    );

    expect(screen.getByText('Hello, this is a test message')).toBeInTheDocument();
    expect(screen.getByText(mockTimestamp.toLocaleTimeString())).toBeInTheDocument();
    expect(screen.getByTestId('PersonIcon')).toBeInTheDocument();
  });

  it('renders assistant message correctly', () => {
    renderWithTheme(
      <ChatMessage
        role="assistant"
        content="I am the assistant"
        timestamp={mockTimestamp}
      />
    );

    expect(screen.getByText('I am the assistant')).toBeInTheDocument();
    expect(screen.getByText(mockTimestamp.toLocaleTimeString())).toBeInTheDocument();
    expect(screen.getByTestId('SmartToyIcon')).toBeInTheDocument();
  });

  it('renders markdown content correctly', () => {
    const markdownContent = '**Bold text** and `code`';
    renderWithTheme(
      <ChatMessage
        role="assistant"
        content={markdownContent}
        timestamp={mockTimestamp}
      />
    );

    expect(screen.getByText('Bold text')).toHaveStyle('font-weight: bold');
    expect(screen.getByText('code')).toHaveStyle('font-family: monospace');
  });

  it('renders code blocks with syntax highlighting', () => {
    const codeContent = '```javascript\nconst x = 42;\nconsole.log(x);\n```';
    renderWithTheme(
      <ChatMessage
        role="assistant"
        content={codeContent}
        timestamp={mockTimestamp}
      />
    );

    expect(screen.getByText('const x = 42;')).toBeInTheDocument();
    expect(screen.getByText('console.log(x);')).toBeInTheDocument();
  });

  it('renders without timestamp when not provided', () => {
    renderWithTheme(
      <ChatMessage
        role="user"
        content="Message without timestamp"
      />
    );

    expect(screen.getByText('Message without timestamp')).toBeInTheDocument();
    expect(screen.queryByText(/\d{1,2}:\d{2}:\d{2}/)).not.toBeInTheDocument();
  });
}); 