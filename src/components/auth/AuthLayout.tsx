import React from 'react';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onNavigateHome: () => void;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  children,
  onNavigateHome,
}) => {
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center items-center px-4 py-12 selection:bg-neutral-800">
      <div className="w-full max-w-sm space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-1">
          <button
            onClick={onNavigateHome}
            className="font-mono text-base font-semibold tracking-wider uppercase text-neutral-100 hover:text-neutral-300 transition-colors cursor-pointer"
          >
            GlyphWorks
          </button>
          {subtitle && (
            <p className="text-xs text-neutral-400 font-normal">
              {subtitle}
            </p>
          )}
        </div>

        {/* Auth Body */}
        <div className="border border-neutral-900 bg-neutral-900/40 p-6 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
};
