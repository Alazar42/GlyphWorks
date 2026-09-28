import React, { useState } from 'react';
import { AuthLayout } from '@/src/components/auth/AuthLayout';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { useAuth } from '@/src/lib/auth/authContext';
import { useToast } from '@/src/components/ui/Toast';

interface SignInProps {
  onNavigate: (path: string) => void;
}

export const SignIn: React.FC<SignInProps> = ({ onNavigate }) => {
  const { signInWithEmail, signInWithGoogle, isLoading, error, clearError } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!email || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }

    try {
      await signInWithEmail(email, password);
      toast({ type: 'success', title: 'Signed in successfully' });
      onNavigate('/dashboard');
    } catch (err: any) {
      setLocalError(err.message || 'Sign in failed');
    }
  };

  const handleGoogleSignIn = async () => {
    setLocalError(null);
    try {
      await signInWithGoogle();
      toast({ type: 'success', title: 'Signed in with Google' });
      onNavigate('/dashboard');
    } catch (err: any) {
      setLocalError(err.message || 'Google sign in unavailable');
    }
  };

  return (
    <AuthLayout
      title="GlyphWorks"
      subtitle="Sign in to continue."
      onNavigateHome={() => onNavigate('/')}
    >
      <div className="space-y-4">
        {/* Google Sign In */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2.5 h-8 bg-neutral-900 hover:bg-neutral-850 active:bg-neutral-800 border border-neutral-800 text-xs font-medium text-neutral-200 transition-colors cursor-pointer disabled:opacity-50"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 12s.7 2.3 1.9 4.7l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
            />
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-neutral-800" />
          <span className="flex-shrink mx-3 text-[10px] text-neutral-500 uppercase tracking-widest font-mono">
            or
          </span>
          <div className="flex-grow border-t border-neutral-800" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            label="Email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="designer@typefoundry.com"
          />

          <Input
            label="Password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          {(localError || error) && (
            <p className="text-[11px] text-rose-400 bg-rose-950/20 border border-rose-900/40 p-2 leading-tight">
              {localError || error}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-1"
            isLoading={isLoading}
          >
            Sign In
          </Button>
        </form>

        {/* Links */}
        <div className="pt-2 text-center space-y-2 text-xs text-neutral-400">
          <div>
            <button
              onClick={() => onNavigate('/forgot-password')}
              className="text-neutral-400 hover:text-neutral-200 transition-colors text-[11px] cursor-pointer"
            >
              Forgot password?
            </button>
          </div>
          <div className="text-[11px] text-neutral-500">
            Don't have an account?{' '}
            <button
              onClick={() => onNavigate('/signup')}
              className="text-neutral-200 hover:underline cursor-pointer"
            >
              Sign up
            </button>
          </div>
          <div className="pt-2 border-t border-neutral-850">
            <button
              type="button"
              onClick={() => {
                setEmail('designer@glyphworks.io');
                setPassword('password123');
              }}
              className="text-[10px] font-mono text-neutral-500 hover:text-neutral-300 underline cursor-pointer"
            >
              Fill Demo Credentials (designer@glyphworks.io)
            </button>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};
