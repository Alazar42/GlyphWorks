import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthState } from '@/src/types/auth';
import { authService } from './authService';

interface AuthContextType extends AuthState {
  signInWithEmail: (email: string, pass: string) => Promise<User>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<User>;
  signInWithGoogle: () => Promise<User>;
  signOut: () => void;
  requestPasswordReset: (email: string) => Promise<string>;
  resetPassword: (email: string, newPass: string) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const activeUser = authService.getCurrentSession();
      setUser(activeUser);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signInWithEmail = async (email: string, pass: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const authenticatedUser = await authService.signInWithEmail(email, pass);
      setUser(authenticatedUser);
      return authenticatedUser;
    } catch (err: any) {
      setError(err?.message || 'Failed to sign in');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    setError(null);
    setIsLoading(true);
    try {
      const newUser = await authService.signUpWithEmail(email, pass, name);
      setUser(newUser);
      return newUser;
    } catch (err: any) {
      setError(err?.message || 'Failed to sign up');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const googleUser = await authService.signInWithGoogle();
      setUser(googleUser);
      return googleUser;
    } catch (err: any) {
      setError(err?.message || 'Failed to sign in with Google');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    authService.signOut();
    setUser(null);
  };

  const requestPasswordReset = async (email: string) => {
    setError(null);
    return await authService.requestPasswordReset(email);
  };

  const resetPassword = async (email: string, newPass: string) => {
    setError(null);
    return await authService.resetPassword(email, newPass);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
        requestPasswordReset,
        resetPassword,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
