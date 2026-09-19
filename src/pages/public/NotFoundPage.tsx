import React from 'react';
import { Button } from '../../components/common/Button';
import { Home, PhoneCall, Compass } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="py-20 sm:py-28 bg-neutral-soft min-h-[75vh] flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 text-center space-y-6">
        
        {/* Typographic and Vector Graphic */}
        <div className="w-20 h-20 rounded-full bg-mint-pale border-2 border-emerald-300 flex items-center justify-center mx-auto text-navy shadow-subtle">
          <Compass className="w-10 h-10 text-navy animate-spin-slow" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-mint-darker bg-mint-pale px-3 py-1 rounded-full border border-emerald-300/40">
            404 &bull; Page Not Found
          </span>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-navy">
            Let's get you back on track.
          </h1>
          <p className="text-base text-content-body max-w-sm mx-auto leading-relaxed">
            The page you're looking for might have been moved, renamed, or doesn't exist.
          </p>
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Button to="/" variant="primary" size="md" leftIcon={<Home className="w-4 h-4" />}>
            Return Home
          </Button>
          <Button to="/contact" variant="outline" size="md" leftIcon={<PhoneCall className="w-4 h-4" />}>
            Contact Support
          </Button>
        </div>

      </div>
    </div>
  );
};
