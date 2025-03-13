import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../utils/test-utils';
import userEvent from '@testing-library/user-event';
import LoginPage from '../LoginPage';

describe('LoginPage', () => {
  it('renders login form', () => {
    render(<LoginPage />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    render(<LoginPage />);
    
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    await userEvent.click(signInButton);

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
  });

  it('shows error message for invalid credentials', async () => {
    render(<LoginPage />);
    
    await userEvent.type(screen.getByLabelText(/email/i), 'wrong@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrongpassword');
    
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    await userEvent.click(signInButton);

    expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
  });

  it('successfully logs in with valid credentials', async () => {
    render(<LoginPage />);
    
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    
    const signInButton = screen.getByRole('button', { name: /sign in/i });
    await userEvent.click(signInButton);

    // Should redirect to chat page on success
    await waitFor(() => {
      expect(window.location.pathname).toBe('/chat');
    });
  });

  it('navigates to signup page when clicking signup link', async () => {
    render(<LoginPage />);
    
    const signupLink = screen.getByRole('link', { name: /sign up/i });
    await userEvent.click(signupLink);

    await waitFor(() => {
      expect(window.location.pathname).toBe('/signup');
    });
  });

  it('shows password when toggle visibility is clicked', async () => {
    render(<LoginPage />);
    
    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toHaveAttribute('type', 'password');

    const visibilityToggle = screen.getByRole('button', { name: /toggle password visibility/i });
    await userEvent.click(visibilityToggle);

    expect(passwordInput).toHaveAttribute('type', 'text');
  });
}); 