import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { AuthProvider } from '../../contexts/AuthContext';
import theme from '../../theme';
import ChatPage from '../ChatPage';

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      <AuthProvider>
        {component}
      </AuthProvider>
    </ThemeProvider>
  );
};

describe('ChatPage Integration Tests', () => {
  beforeAll(() => {
    // Enable API mocking
    window.matchMedia = window.matchMedia || function() {
      return {
        matches: false,
        addListener: function() {},
        removeListener: function() {}
      };
    };
  });

  it('sends a message and receives a response', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ChatPage />);

    // Find and type in the input
    const input = screen.getByPlaceholderText(/type your message/i);
    await user.type(input, 'What are the symptoms of diabetes?');

    // Submit the message
    const sendButton = screen.getByRole('button', { name: /send/i });
    await user.click(sendButton);

    // Verify user message appears
    expect(screen.getByText('What are the symptoms of diabetes?')).toBeInTheDocument();

    // Wait for and verify assistant response
    await waitFor(() => {
      expect(screen.getByText(/mock response to:/i)).toBeInTheDocument();
    });
  });

  it('displays error message on API failure', async () => {
    // Mock a failed API response
    const originalFetch = window.fetch;
    window.fetch = jest.fn().mockRejectedValueOnce(new Error('API Error'));

    const user = userEvent.setup();
    renderWithProviders(<ChatPage />);

    // Send a message
    const input = screen.getByPlaceholderText(/type your message/i);
    await user.type(input, 'Test message');
    const sendButton = screen.getByRole('button', { name: /send/i });
    await user.click(sendButton);

    // Verify error message appears
    await waitFor(() => {
      expect(screen.getByText(/error occurred/i)).toBeInTheDocument();
    });

    // Restore original fetch
    window.fetch = originalFetch;
  });

  it('shows loading state while waiting for response', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ChatPage />);

    // Send a message
    const input = screen.getByPlaceholderText(/type your message/i);
    await user.type(input, 'Test message');
    const sendButton = screen.getByRole('button', { name: /send/i });
    await user.click(sendButton);

    // Verify loading indicator appears
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // Wait for response to complete
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  it('maintains conversation history', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ChatPage />);

    // Send first message
    const input = screen.getByPlaceholderText(/type your message/i);
    await user.type(input, 'First message');
    let sendButton = screen.getByRole('button', { name: /send/i });
    await user.click(sendButton);

    // Wait for first response
    await waitFor(() => {
      expect(screen.getByText(/mock response to: First message/i)).toBeInTheDocument();
    });

    // Send second message
    await user.type(input, 'Second message');
    sendButton = screen.getByRole('button', { name: /send/i });
    await user.click(sendButton);

    // Verify both messages and responses are present
    await waitFor(() => {
      expect(screen.getByText('First message')).toBeInTheDocument();
      expect(screen.getByText(/mock response to: First message/i)).toBeInTheDocument();
      expect(screen.getByText('Second message')).toBeInTheDocument();
      expect(screen.getByText(/mock response to: Second message/i)).toBeInTheDocument();
    });
  });

  it('handles markdown and code formatting in responses', async () => {
    const user = userEvent.setup();
    renderWithProviders(<ChatPage />);

    // Send a message that will trigger a markdown response
    const input = screen.getByPlaceholderText(/type your message/i);
    await user.type(input, 'Show me some code');
    const sendButton = screen.getByRole('button', { name: /send/i });
    await user.click(sendButton);

    // Wait for and verify formatted response
    await waitFor(() => {
      const codeElements = screen.getAllByRole('code');
      expect(codeElements.length).toBeGreaterThan(0);
    });
  });
}); 