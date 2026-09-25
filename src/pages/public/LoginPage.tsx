import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Logo } from '../../components/common/Logo';
import { Button } from '../../components/common/Button';
import { Lock, Mail, AlertCircle, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { signIn, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as any)?.from?.pathname || (role === 'admin' || role === 'support' ? '/admin' : '/');

  // If already authenticated, redirect
  React.useEffect(() => {
    if (isAuthenticated) {
      if (role === 'admin' || role === 'support') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, role, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please enter both your email and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await signIn({ email, password });
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Invalid email or password.');
      return;
    }

    if (result.role === 'admin' || result.role === 'support') {
      navigate('/admin', { replace: true });
    } else {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Logo variant="dark" size="lg" to="/" />
        <h2 className="mt-6 text-2xl sm:text-3xl font-heading font-bold text-navy tracking-tight">
          Sign In to Your Account
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-content-muted">
          Access your protected wearers, active subscriptions, and emergency profiles.
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-navy mb-1.5">
                Email Address
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

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-navy">
                  Password
                </label>
                <Link
                  to="/reset-password"
                  className="text-xs text-mint hover:underline font-semibold"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-5 h-5 text-content-muted absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              {isSubmitting ? 'Verifying...' : 'Sign In'}
            </Button>
          </form>

          <div className="pt-4 border-t border-border-subtle text-center text-xs text-content-muted">
            Don't have an account yet?{' '}
            <Link to="/signup" className="text-navy font-bold hover:underline">
              Create a Parent Account
            </Link>
          </div>

          <div className="pt-2 text-center">
            <Link to="/admin/login" className="text-[11px] text-slate-400 hover:text-navy flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Staff & Administrator Portal Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
