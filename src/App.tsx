/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ToastProvider } from '@/src/components/ui/Toast';
import { ThemeProvider } from '@/src/lib/theme/ThemeContext';
import { Landing } from '@/src/pages/Landing';
import { Dashboard } from '@/src/pages/Dashboard';
import { EditorPage } from '@/src/pages/EditorPage';
import { SettingsPage } from '@/src/pages/SettingsPage';

function Router() {
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

  // Parse Editor routes: /editor/:id or /fonts/:id
  const editorMatch = currentPath.match(/^\/(?:editor|fonts)\/([^/]+)/);
  if (editorMatch) {
    const fontId = editorMatch[1];
    return <EditorPage fontId={fontId} onNavigate={navigate} />;
  }

  switch (currentPath) {
    case '/dashboard':
    case '/projects':
      return (
        <Dashboard
          onNavigate={navigate}
          onOpenFont={(id) => navigate(`/editor/${id}`)}
        />
      );

    case '/settings':
      return <SettingsPage onNavigate={navigate} />;

    case '/':
    default:
      return <Landing onNavigate={navigate} />;
  }
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Router />
      </ToastProvider>
    </ThemeProvider>
  );
}
