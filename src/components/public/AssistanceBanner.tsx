import React from 'react';
import { Link } from 'react-router-dom';
import { PhoneCall, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AssistanceBanner: React.FC = () => {
  const { settings } = useApp();

  return (
    <section className="bg-navy text-white py-4 sm:py-5 border-y border-navy-light/40 relative overflow-hidden" aria-label="Assistance Notice">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left message with phone icon */}
        <div className="flex items-center gap-3.5 text-center md:text-left">
          <div className="w-10 h-10 rounded-full bg-mint/20 border border-mint/40 flex items-center justify-center flex-shrink-0 text-mint">
            <PhoneCall className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="block text-base sm:text-lg font-heading font-semibold text-white">
              Found someone wearing our band?
            </span>
            <span className="text-xs sm:text-sm text-slate-300">
              Contact our central office and quote the band reference. We will reach their registered emergency contacts immediately.
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="hidden xl:block text-right text-xs text-slate-300">
            <span className="text-slate-400 block">Call Office:</span>
            <span className="font-semibold text-white">{settings.officePhone}</span>
          </div>
          <Link
            to="/found-band"
            className="inline-flex items-center justify-center h-11 px-5 rounded-brand bg-mint text-navy font-heading font-semibold text-sm hover:brightness-105 transition-all shadow-sm gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-mint"
          >
            <span>Contact Our Office</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};
