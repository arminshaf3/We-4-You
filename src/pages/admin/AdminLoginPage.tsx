import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Logo } from '../../components/common/Logo';
import { Button } from '../../components/common/Button';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../hooks/useAuth';
import { ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { loginAdmin, isAdminLoggedIn } = useApp();
  const { signIn, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/admin';

  // Only redirect on initial page mount if already authenticated
  React.useEffect(() => {
    if (isAdminLoggedIn || (isAuthenticated && (role === 'admin' || role === 'support'))) {
      navigate('/admin', { replace: true });
    }
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please enter your staff email and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await signIn({ email, password });

    if (!result.success) {
      setIsSubmitting(false);
      setErrorMessage(result.error || 'Authentication failed.');
      return;
    }

    if (result.role !== 'admin' && result.role !== 'support') {
      setIsSubmitting(false);
      setErrorMessage('Your account does not have Admin or Support privileges.');
      return;
    }

    loginAdmin(email);
    setIsSubmitting(false);
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-navy flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-mint/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-mint/5 blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Logo variant="light" size="lg" to="/" />
        <h2 className="mt-6 text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">
          Admin &amp; Staff Portal
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-300">
          Internal management console for wearers, bands, and incident response.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-brand-lg shadow-floating border border-border-subtle space-y-6">

          {errorMessage && (
            <div className="p-4 bg-red-50 rounded-brand border border-red-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-red-800 leading-relaxed font-medium">
                {errorMessage}
              </div>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-navy mb-1.5">
                Staff Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-content-muted absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="we4u@gmail.com"
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
              {isSubmitting ? 'Authenticating...' : 'Sign In as Staff'}
            </Button>
          </form>

          <div className="pt-4 border-t border-border-subtle flex items-center justify-between text-xs text-content-muted">
            <Link to="/" className="text-navy font-semibold hover:underline flex items-center gap-1">
              ← Return to Public Website
            </Link>
            <Link to="/login" className="text-mint font-semibold hover:underline">
              Parent Login →
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
