/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/src/lib/auth/authContext';
import { ToastProvider } from '@/src/components/ui/Toast';
import { Landing } from '@/src/pages/Landing';
import { SignIn } from '@/src/pages/SignIn';
import { SignUp } from '@/src/pages/SignUp';
import { ForgotPassword } from '@/src/pages/ForgotPassword';
import { Dashboard } from '@/src/pages/Dashboard';
import { EditorPage } from '@/src/pages/EditorPage';
import { SettingsPage } from '@/src/pages/SettingsPage';

function Router() {
  const { user, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  // Sync with browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  // Route matching
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-xs font-mono text-neutral-500">
        Loading GlyphWorks...
      </div>
    );
  }

  // Parse Editor routes: /editor/:id or /fonts/:id
  const editorMatch = currentPath.match(/^\/(?:editor|fonts)\/([^/]+)/);
  if (editorMatch) {
    if (!user) {
      return <SignIn onNavigate={navigate} />;
    }
    const fontId = editorMatch[1];
    return <EditorPage fontId={fontId} onNavigate={navigate} />;
  }

  switch (currentPath) {
    case '/signin':
      if (user) {
        navigate('/dashboard');
        return <Dashboard onNavigate={navigate} onOpenFont={(id) => navigate(`/editor/${id}`)} />;
      }
      return <SignIn onNavigate={navigate} />;

    case '/signup':
      if (user) {
        navigate('/dashboard');
        return <Dashboard onNavigate={navigate} onOpenFont={(id) => navigate(`/editor/${id}`)} />;
      }
      return <SignUp onNavigate={navigate} />;

    case '/forgot-password':
      return <ForgotPassword onNavigate={navigate} />;

    case '/dashboard':
      if (!user) {
        return <SignIn onNavigate={navigate} />;
      }
      return (
        <Dashboard
          onNavigate={navigate}
          onOpenFont={(id) => navigate(`/editor/${id}`)}
        />
      );

    case '/settings':
      if (!user) {
        return <SignIn onNavigate={navigate} />;
      }
      return <SettingsPage onNavigate={navigate} />;

    case '/':
    default:
      return <Landing onNavigate={navigate} />;
  }
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router />
      </ToastProvider>
    </AuthProvider>
  );
}
