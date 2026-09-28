import React, { useState } from 'react';
import { AuthLayout } from '@/src/components/auth/AuthLayout';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { useAuth } from '@/src/lib/auth/authContext';
import { useToast } from '@/src/components/ui/Toast';

interface SignUpProps {
  onNavigate: (path: string) => void;
}

export const SignUp: React.FC<SignUpProps> = ({ onNavigate }) => {
  const { signUpWithEmail, signInWithGoogle, isLoading, error, clearError } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();

    if (!email || !password) {
      setLocalError('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    try {
      await signUpWithEmail(email, password, name);
      toast({ type: 'success', title: 'Account created successfully' });
      onNavigate('/dashboard');
    } catch (err: any) {
      setLocalError(err.message || 'Registration failed');
    }
  };

  const handleGoogleSignUp = async () => {
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
      subtitle="Create an account to start designing."
      onNavigateHome={() => onNavigate('/')}
    >
      <div className="space-y-4">
        {/* Google Sign In */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
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

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-neutral-800" />
          <span className="flex-shrink mx-3 text-[10px] text-neutral-500 uppercase tracking-widest font-mono">
            or
          </span>
          <div className="flex-grow border-t border-neutral-800" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            label="Name (optional)"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Type Designer"
          />

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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
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
            Create Account
          </Button>
        </form>

        <div className="pt-2 text-center text-xs text-neutral-500">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('/signin')}
            className="text-neutral-200 hover:underline cursor-pointer"
          >
            Sign in
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};
