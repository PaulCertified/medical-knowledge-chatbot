import React from 'react';
import { render, screen, waitFor } from '../../utils/test-utils';
import userEvent from '@testing-library/user-event';
import ChatInterface from '../ChatInterface';

describe('ChatInterface', () => {
  beforeEach(() => {
    // Mock IntersectionObserver
    const mockIntersectionObserver = jest.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null
    });
    window.IntersectionObserver = mockIntersectionObserver;
  });

  it('renders chat interface with message input', () => {
    render(<ChatInterface />);
    
    expect(screen.getByPlaceholderText(/type your message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('sends message and displays response', async () => {
    const user = userEvent.setup();
    render(<ChatInterface />);
    
    const input = screen.getByPlaceholderText(/type your message/i);
    await user.type(input, 'What are the symptoms of diabetes?');
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    await user.click(sendButton);

    // Check if user message appears
    expect(screen.getByText('What are the symptoms of diabetes?')).toBeInTheDocument();

    // Check if loading indicator appears
    expect(screen.getByRole('progressbar')).toBeInTheDocument();

    // Wait for and check response
    await waitFor(() => {
      expect(screen.getByText(/mock response to:/i)).toBeInTheDocument();
    });

    // Check if loading indicator disappears
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('handles markdown formatting in responses', async () => {
    const user = userEvent.setup();
    render(<ChatInterface />);
    
    const input = screen.getByPlaceholderText(/type your message/i);
    await user.type(input, 'Show markdown example');
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    await user.click(sendButton);

    // Wait for formatted response
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
      expect(screen.getByRole('code')).toBeInTheDocument();
    });
  });

  it('maintains conversation history', async () => {
    const user = userEvent.setup();
    render(<ChatInterface />);
    
    // Send first message
    const input = screen.getByPlaceholderText(/type your message/i);
    await user.type(input, 'First message');
    await user.click(screen.getByRole('button', { name: /send/i }));

    // Wait for first response
    await waitFor(() => {
      expect(screen.getByText(/mock response to: First message/i)).toBeInTheDocument();
    });

    // Send second message
    await user.type(input, 'Second message');
    await user.click(screen.getByRole('button', { name: /send/i }));

    // Verify both messages and responses are present
    await waitFor(() => {
      expect(screen.getByText('First message')).toBeInTheDocument();
      expect(screen.getByText(/mock response to: First message/i)).toBeInTheDocument();
      expect(screen.getByText('Second message')).toBeInTheDocument();
      expect(screen.getByText(/mock response to: Second message/i)).toBeInTheDocument();
    });
  });

  it('shows error message on API failure', async () => {
    // Mock fetch to simulate error
    const originalFetch = window.fetch;
    window.fetch = jest.fn().mockRejectedValueOnce(new Error('API Error'));

    const user = userEvent.setup();
    render(<ChatInterface />);
    
    const input = screen.getByPlaceholderText(/type your message/i);
    await user.type(input, 'Test message');
    await user.click(screen.getByRole('button', { name: /send/i }));

    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/error occurred/i)).toBeInTheDocument();
    });

    // Restore original fetch
    window.fetch = originalFetch;
  });

  it('disables send button when input is empty', async () => {
    const user = userEvent.setup();
    render(<ChatInterface />);
    
    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).toBeDisabled();

    const input = screen.getByPlaceholderText(/type your message/i);
    await user.type(input, 'Test');
    expect(sendButton).toBeEnabled();

    await user.clear(input);
    expect(sendButton).toBeDisabled();
  });

  it('clears input after sending message', async () => {
    const user = userEvent.setup();
    render(<ChatInterface />);
    
    const input = screen.getByPlaceholderText(/type your message/i);
    await user.type(input, 'Test message');
    await user.click(screen.getByRole('button', { name: /send/i }));

    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });
}); 