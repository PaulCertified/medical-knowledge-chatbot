import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  isAuthenticated: boolean;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Simulate API call
      const user = { email };
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
    } catch (error) {
      throw new Error('Login failed');
    }
  };

  const signIn = login; // Alias for login

  const signUp = async (email: string, password: string) => {
    try {
      // Simulate API call
      const user = { email };
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
    } catch (error) {
      throw new Error('Sign up failed');
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      throw new Error('Logout failed');
    }
  };

  const signOut = logout;

  const forgotPassword = async (email: string) => {
    try {
      // Simulate API call for password reset
      console.log(`Password reset email sent to ${email}`);
    } catch (error) {
      throw new Error('Password reset request failed');
    }
  };

  const resetPassword = async (email: string, code: string, newPassword: string) => {
    try {
      // Simulate API call for password reset confirmation
      console.log(`Password reset confirmed for ${email}`);
    } catch (error) {
      throw new Error('Password reset confirmation failed');
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    try {
      // Simulate API call for registration
      const user = { email };
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
    } catch (error) {
      throw new Error('Registration failed');
    }
  };

  const value = {
    user,
    login,
    logout,
    signUp,
    signIn,
    isAuthenticated: !!user,
    forgotPassword,
    resetPassword,
    register,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 