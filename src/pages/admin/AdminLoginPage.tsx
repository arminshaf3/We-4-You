import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Logo } from '../../components/common/Logo';
import { Button } from '../../components/common/Button';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../hooks/useAuth';
import { ShieldCheck, Info, ArrowRight, Lock, Mail, AlertCircle, Sparkles } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { loginAdmin } = useApp();
  const { signIn, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState<'auth' | 'demo'>('auth');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [staffRole, setStaffRole] = useState('Staff Coordinator (Morgan)');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/admin';

  // Redirect if already authenticated as admin/support
  React.useEffect(() => {
    if (isAuthenticated && (role === 'admin' || role === 'support')) {
      navigate('/admin', { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please enter your staff email and password.');
      return;
    }

    setIsSubmitting(true);
    const result = await signIn({ email, password });
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Authentication failed.');
      return;
    }

    if (result.role !== 'admin' && result.role !== 'support') {
      setErrorMessage('Your account does not have Admin or Support privileges.');
      return;
    }

    // Also update legacy state for demonstration persistence
    loginAdmin(email);
    navigate(from, { replace: true });
  };

  const handleEnterDemo = (e: React.FormEvent) => {
    e.preventDefault();
    loginAdmin(staffRole);
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
          Admin & Staff Portal
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-300">
          Internal management console for wearers, bands, and incident response.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-brand-lg shadow-floating border border-border-subtle space-y-6">
          
          {/* Mode Selector Tabs */}
          <div className="flex rounded-brand bg-slate-100 p-1 border border-border-subtle">
            <button
              type="button"
              onClick={() => setMode('auth')}
              className={`flex-1 py-2 text-xs font-bold rounded-brand transition-all ${
                mode === 'auth'
                  ? 'bg-white text-navy shadow-sm'
                  : 'text-content-muted hover:text-navy'
              }`}
            >
              🔒 Secure Supabase Login
            </button>
            <button
              type="button"
              onClick={() => setMode('demo')}
              className={`flex-1 py-2 text-xs font-bold rounded-brand transition-all ${
                mode === 'demo'
                  ? 'bg-white text-navy shadow-sm'
                  : 'text-content-muted hover:text-navy'
              }`}
            >
              ⚡ Quick Demo Mode
            </button>
          </div>

          {errorMessage && (
            <div className="p-4 bg-red-50 rounded-brand border border-red-200 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-red-800 leading-relaxed font-medium">
                {errorMessage}
              </div>
            </div>
          )}

          {mode === 'auth' ? (
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
                    placeholder="admin@we4u.com"
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
          ) : (
            <form onSubmit={handleEnterDemo} className="space-y-4">
              <div className="p-3.5 bg-amber-50 rounded-brand border border-amber-200 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 leading-relaxed">
                  <span className="font-bold">Demonstration Flow:</span> Instant access for testing console screens without entering database credentials.
                </div>
              </div>

              <div>
                <label htmlFor="staff-role" className="block text-sm font-semibold text-navy mb-1.5">
                  Select Staff Persona
                </label>
                <select
                  id="staff-role"
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value)}
                  className="w-full h-12 px-4 text-base rounded-brand border border-border-subtle bg-white text-navy font-medium focus:outline-none focus:ring-2 focus:ring-navy"
                >
                  <option value="Demo Coordinator (Morgan)">Staff Coordinator (Morgan)</option>
                  <option value="Verification Officer (Taylor)">Verification Officer (Taylor)</option>
                  <option value="Lead Administrator (Alex)">Lead Administrator (Alex)</option>
                </select>
              </div>

              <Button
                type="submit"
                variant="mint"
                size="lg"
                className="w-full shadow-md"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Enter Admin Demo Dashboard
              </Button>
            </form>
          )}

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
