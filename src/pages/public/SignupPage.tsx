import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Logo } from '../../components/common/Logo';
import { Button } from '../../components/common/Button';
import { Lock, Mail, User, Phone, AlertCircle, ArrowRight, CheckCircle2, Shield } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const { signUpParent, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('English');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!fullName || !email || !phone || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    const result = await signUpParent({
      fullName,
      email,
      phone,
      password,
      preferredLanguage,
    });
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Failed to create account. Please try again.');
      return;
    }

    setIsSuccess(true);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-surface flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-white p-8 sm:p-10 rounded-brand-lg shadow-card border border-border-subtle max-w-md w-full mx-auto space-y-6">
          <div className="w-16 h-16 rounded-full bg-mint/20 text-mint flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-navy">Account Created!</h2>
          <p className="text-sm text-content-muted leading-relaxed">
            Welcome to We 4 You! A confirmation link has been sent to <span className="font-semibold text-navy">{email}</span>. Please verify your email to access all guardian features.
          </p>
          <div className="pt-4 flex flex-col gap-3">
            <Button
              variant="mint"
              size="lg"
              className="w-full"
              onClick={() => navigate('/login')}
            >
              Go to Sign In
            </Button>
            <Link to="/" className="text-xs text-content-muted hover:text-navy">
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Logo variant="dark" size="lg" to="/" />
        <h2 className="mt-6 text-2xl sm:text-3xl font-heading font-bold text-navy tracking-tight">
          Create Parent / Guardian Account
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-content-muted">
          Manage your protected loved ones, view band status, and receive instant alerts.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-brand-lg shadow-card border border-border-subtle space-y-6">
          
          <div className="p-3 bg-slate-50 rounded-brand border border-border-subtle flex items-center gap-2.5 text-xs text-navy font-medium">
            <Shield className="w-4 h-4 text-mint flex-shrink-0" />
            <span>Encrypted & Protected Guardian Profile</span>
          </div>

          {errorMessage && (
            <div className="p-4 bg-red-50 rounded-brand border border-red-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-red-800 leading-relaxed font-medium">
                {errorMessage}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-navy mb-1.5">
                Full Legal Name *
              </label>
              <div className="relative">
                <User className="w-5 h-5 text-content-muted absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Elena Vance"
                  className="w-full h-12 pl-11 pr-4 text-sm rounded-brand border border-border-subtle bg-white text-navy focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy mb-1.5">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-content-muted absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="elena@example.com"
                  className="w-full h-12 pl-11 pr-4 text-sm rounded-brand border border-border-subtle bg-white text-navy focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy mb-1.5">
                Mobile Phone Number *
              </label>
              <div className="relative">
                <Phone className="w-5 h-5 text-content-muted absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 019-2834"
                  className="w-full h-12 pl-11 pr-4 text-sm rounded-brand border border-border-subtle bg-white text-navy focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy mb-1.5">
                Password (min 6 chars) *
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-content-muted absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 pl-11 pr-4 text-sm rounded-brand border border-border-subtle bg-white text-navy focus:outline-none focus:ring-2 focus:ring-navy"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-navy mb-1.5">
                Confirm Password *
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
              className="w-full shadow-md font-semibold mt-2"
              disabled={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              {isSubmitting ? 'Creating Profile...' : 'Complete Sign Up'}
            </Button>
          </form>

          <div className="pt-4 border-t border-border-subtle text-center text-xs text-content-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-navy font-bold hover:underline">
              Sign In here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
