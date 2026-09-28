import React, { useState } from 'react';
import { AuthLayout } from '@/src/components/auth/AuthLayout';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { useAuth } from '@/src/lib/auth/authContext';
import { useToast } from '@/src/components/ui/Toast';

interface ForgotPasswordProps {
  onNavigate: (path: string) => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onNavigate }) => {
  const { requestPasswordReset, resetPassword, isLoading } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!email) {
      setLocalError('Please enter your email.');
      return;
    }
    try {
      const token = await requestPasswordReset(email);
      setResetToken(token);
      toast({
        type: 'info',
        title: 'Reset code generated',
        description: `Verification code: ${token}`,
      });
    } catch (err: any) {
      setLocalError(err.message || 'Failed to request password reset.');
    }
  };

  const handleCompleteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!newPassword || newPassword.length < 6) {
      setLocalError('New password must be at least 6 characters.');
      return;
    }
    try {
      await resetPassword(email, newPassword);
      setIsSuccess(true);
      toast({ type: 'success', title: 'Password updated successfully' });
    } catch (err: any) {
      setLocalError(err.message || 'Failed to reset password.');
    }
  };

  return (
    <AuthLayout
      title="GlyphWorks"
      subtitle="Reset your password."
      onNavigateHome={() => onNavigate('/')}
    >
      <div className="space-y-4">
        {isSuccess ? (
          <div className="space-y-4 text-center">
            <p className="text-xs text-neutral-300">
              Your password has been reset. You can now sign in with your new password.
            </p>
            <Button
              variant="primary"
              className="w-full"
              onClick={() => onNavigate('/signin')}
            >
              Sign In
            </Button>
          </div>
        ) : !resetToken ? (
          <form onSubmit={handleRequestToken} className="space-y-3">
            <Input
              label="Account Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="designer@typefoundry.com"
            />

            {localError && (
              <p className="text-[11px] text-rose-400 bg-rose-950/20 border border-rose-900/40 p-2 leading-tight">
                {localError}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
            >
              Send Reset Code
            </Button>
          </form>
        ) : (
          <form onSubmit={handleCompleteReset} className="space-y-3">
            <div className="p-2.5 bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-400 font-mono">
              Reset Token: <span className="text-neutral-100 font-semibold">{resetToken}</span>
            </div>

            <Input
              label="New Password"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 6 characters"
            />

            {localError && (
              <p className="text-[11px] text-rose-400 bg-rose-950/20 border border-rose-900/40 p-2 leading-tight">
                {localError}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
            >
              Update Password
            </Button>
          </form>
        )}

        <div className="pt-2 text-center text-xs text-neutral-500">
          <button
            onClick={() => onNavigate('/signin')}
            className="text-neutral-400 hover:text-neutral-200 transition-colors text-[11px] cursor-pointer"
          >
            ← Back to Sign In
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};
