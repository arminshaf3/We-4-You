import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Logo } from '../../components/common/Logo';
import { Button } from '../../components/common/Button';
import { Lock, Mail, AlertCircle, ArrowRight, CheckCircle2, KeyRound } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const { resetPassword, updatePassword, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isEmailSent, setIsEmailSent] = useState(false);
  const [isPasswordUpdated, setIsPasswordUpdated] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user is authenticated (e.g. from reset password link)
  const isUpdatingPassword = isAuthenticated;

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);
    const result = await resetPassword(email);
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Failed to send password reset email.');
      return;
    }

    setIsEmailSent(true);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    const result = await updatePassword(newPassword);
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Failed to update password.');
      return;
    }

    setIsPasswordUpdated(true);
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Logo variant="dark" size="lg" to="/" />
        <h2 className="mt-6 text-2xl sm:text-3xl font-heading font-bold text-navy tracking-tight">
          {isUpdatingPassword ? 'Set New Password' : 'Reset Your Password'}
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-content-muted">
          {isUpdatingPassword
            ? 'Enter your new secure password below.'
            : 'Enter your registered email address to receive password reset instructions.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-brand-lg shadow-card border border-border-subtle space-y-6">
          {errorMessage && (
            <div className="p-4 bg-red-50 rounded-brand border border-red-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-red-800 leading-relaxed font-medium">
                {errorMessage}
              </div>
            </div>
          )}

          {isEmailSent ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-mint/20 text-mint flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-navy">Check Your Inbox</h3>
              <p className="text-xs text-content-muted leading-relaxed">
                We've sent a password reset link to <span className="font-semibold text-navy">{email}</span>. Click the link in the email to set a new password.
              </p>
              <div className="pt-2">
                <Link to="/login" className="text-sm font-semibold text-mint hover:underline">
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : isPasswordUpdated ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-mint/20 text-mint flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-navy">Password Updated!</h3>
              <p className="text-xs text-content-muted leading-relaxed">
                Your password has been changed successfully.
              </p>
              <Button
                variant="mint"
                size="lg"
                className="w-full"
                onClick={() => navigate('/login')}
              >
                Sign In With New Password
              </Button>
            </div>
          ) : isUpdatingPassword ? (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-navy mb-1.5">
                  New Password (min 6 chars)
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-content-muted absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-12 pl-11 pr-4 text-sm rounded-brand border border-border-subtle bg-white text-navy focus:outline-none focus:ring-2 focus:ring-navy"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-5 h-5 text-content-muted absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-12 pl-11 pr-4 text-sm rounded-brand border border-border-subtle bg-white text-navy focus:outline-none focus:ring-2 focus:ring-navy"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="mint"
                size="lg"
                className="w-full shadow-md font-semibold"
                disabled={isSubmitting}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {isSubmitting ? 'Updating...' : 'Save New Password'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-navy mb-1.5">
                  Your Account Email Address
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-content-muted absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full h-12 pl-11 pr-4 text-sm rounded-brand border border-border-subtle bg-white text-navy focus:outline-none focus:ring-2 focus:ring-navy"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="mint"
                size="lg"
                className="w-full shadow-md font-semibold"
                disabled={isSubmitting}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                {isSubmitting ? 'Sending Link...' : 'Send Password Reset Link'}
              </Button>
            </form>
          )}

          <div className="pt-4 border-t border-border-subtle text-center text-xs text-content-muted">
            Remember your password?{' '}
            <Link to="/login" className="text-navy font-bold hover:underline">
              Return to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
