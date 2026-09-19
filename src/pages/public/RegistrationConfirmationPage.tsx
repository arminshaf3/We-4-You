import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { useApp } from '../../context/AppContext';
import { Clock, ShieldCheck, Home, PhoneCall, ArrowRight, HelpCircle } from 'lucide-react';

export const RegistrationConfirmationPage: React.FC = () => {
  const location = useLocation();
  const { settings } = useApp();

  // Retrieve state passed safely from the registration submission
  const state = location.state as {
    referenceNumber?: string;
    childName?: string;
    bandCode?: string;
  } | null;

  if (!state || !state.referenceNumber) {
    return (
      <div className="py-16 sm:py-24 bg-neutral-soft min-h-[70vh] flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center bg-white p-8 rounded-brand-lg border border-border-subtle shadow-card space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-content-muted">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-navy">
            No Active Registration Found
          </h2>
          <p className="text-sm text-content-body leading-relaxed">
            It looks like this confirmation was opened without a completed registration submission.
          </p>
          <div className="pt-2">
            <Button to="/register" variant="primary" size="md">
              Start Registration
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 sm:py-20 bg-neutral-soft min-h-[80vh]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Breadcrumbs items={[{ label: 'Register', to: '/register' }, { label: 'Confirmation' }]} className="mb-6" />

        <div className="bg-white rounded-brand-lg border border-border-subtle shadow-card p-8 sm:p-12 text-center space-y-6">
          
          {/* Status Icon */}
          <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
            <Clock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="inline-block text-xs font-semibold uppercase tracking-wider bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
              Status: Pending Verification
            </span>
            <h1 className="text-3xl sm:text-4xl font-heading font-bold text-navy">
              Your registration is ready for review.
            </h1>
          </div>

          {/* Reference Card */}
          <div className="bg-neutral-soft p-5 rounded-brand border border-border-subtle max-w-md mx-auto space-y-1 text-left">
            <span className="text-xs text-content-muted block">Demonstration Reference Number</span>
            <span className="text-xl font-mono font-bold text-navy tracking-wider block">
              {state.referenceNumber}
            </span>
            <div className="pt-2 text-xs text-content-muted flex items-center justify-between border-t border-border-subtle mt-2">
              <span>Band Reference:</span>
              <span className="font-mono font-semibold text-navy">{state.bandCode}</span>
            </div>
          </div>

          {/* Short Explanation of Next Steps */}
          <div className="text-sm text-content-body max-w-lg mx-auto leading-relaxed space-y-3 text-left bg-mint-pale/40 p-5 rounded-brand border border-emerald-300/40">
            <h4 className="font-heading font-bold text-navy flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#088F5B]" />
              <span>What happens next?</span>
            </h4>
            <ol className="list-decimal pl-4 space-y-1.5 text-xs text-slate-700">
              <li>Our office staff reviews the guardian information and vendor attribution details.</li>
              <li>Your subscription payment receipt is matched and verified manually.</li>
              <li>Once verified, your band status transitions to <strong>Active</strong> in our registry.</li>
            </ol>
            <p className="text-[11px] text-content-muted italic">
              Please quote your reference number <strong>{state.referenceNumber}</strong> if you need to contact our office regarding this submission.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button to="/" variant="outline" size="md" leftIcon={<Home className="w-4 h-4" />}>
              Return Home
            </Button>
            <Button to="/contact" variant="primary" size="md" leftIcon={<PhoneCall className="w-4 h-4" />}>
              Contact Our Office
            </Button>
          </div>

          <div className="pt-4 text-xs text-content-muted">
            For demonstration evaluators: This submission is now queued in the{' '}
            <Link to="/admin/registrations" className="text-navy font-semibold underline">
              Admin Review Queue
            </Link>
            .
          </div>

        </div>

      </div>
    </div>
  );
};
