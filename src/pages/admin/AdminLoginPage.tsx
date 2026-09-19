import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Logo } from '../../components/common/Logo';
import { Button } from '../../components/common/Button';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Info, ArrowRight, Lock, KeyRound } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { loginAdmin } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [staffRole, setStaffRole] = useState('Staff Coordinator (Morgan)');
  const from = (location.state as any)?.from?.pathname || '/admin';

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
          Administrator Demonstration
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-300">
          Internal office portal for registrations, vendors, and assistance operations.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-brand-lg shadow-floating border border-border-subtle space-y-6">
          
          {/* Plain Demo Notice */}
          <div className="p-4 bg-amber-50 rounded-brand border border-amber-200 flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <span className="font-bold">Frontend Demonstration Access:</span>
              <br />
              No real password or account credentials are required. Client-side route gating is provided for demonstration flow only and does not constitute production security.
            </div>
          </div>

          <form onSubmit={handleEnterDemo} className="space-y-4">
            <div>
              <label htmlFor="staff-role" className="block text-sm font-semibold text-navy mb-1.5">
                Select Demonstration Staff Persona
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
              <p className="text-[11px] text-content-muted mt-1">
                This identity will be recorded on actions (e.g. registration approvals, payouts).
              </p>
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

          <div className="pt-4 border-t border-border-subtle flex items-center justify-between text-xs text-content-muted">
            <Link to="/" className="text-navy font-semibold hover:underline flex items-center gap-1">
              ← Return to Public Website
            </Link>
            <span className="font-mono text-[11px] text-slate-400">v1.0 Demo Mode</span>
          </div>

        </div>
      </div>
    </div>
  );
};
