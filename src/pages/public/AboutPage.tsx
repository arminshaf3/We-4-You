import React from 'react';
import { Button } from '../../components/common/Button';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { ShieldCheck, PhoneCall, Lock, Heart, CheckCircle2 } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="py-10 sm:py-16 bg-white">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        
        <Breadcrumbs items={[{ label: 'About Us' }]} className="mb-8" />

        {/* Page Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-mint-darker bg-mint-pale px-3 py-1 rounded-full mb-3 border border-emerald-300/40">
            About We 4 You
          </span>
          <h1 className="text-4xl sm:text-5xl font-heading font-bold text-navy leading-tight tracking-tight">
            Care starts with connection.
          </h1>
          <p className="text-xl text-content-body mt-4 leading-relaxed font-body">
            We 4 You brings families and caring people closer through simple identification bands and an office contact service.
          </p>
        </div>

        {/* Warm Image Banner */}
        <div className="rounded-brand-lg overflow-hidden border border-border-subtle shadow-card mb-16 max-h-[440px]">
          <img
            src="https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=1200&q=80"
            alt="Warm family moment outdoors in sunlight"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Key Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-16">
          {/* Pillar 1: The Purpose of the Band */}
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-brand bg-mint-pale flex items-center justify-center text-navy">
              <Heart className="w-6 h-6 text-[#088F5B]" />
            </div>
            <h3 className="text-2xl font-heading font-bold text-navy">
              The Purpose of the Band
            </h3>
            <p className="text-base text-content-body leading-relaxed">
              Our bands are designed for simplicity and comfort. They require no charging, no cellular plans, and no screen interaction. Each band displays our website, telephone number, and an individual reference code.
            </p>
          </div>

          {/* Pillar 2: The Office's Role */}
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-brand bg-mint-pale flex items-center justify-center text-navy">
              <PhoneCall className="w-6 h-6 text-[#088F5B]" />
            </div>
            <h3 className="text-2xl font-heading font-bold text-navy">
              The Office's Intermediary Role
            </h3>
            <p className="text-base text-content-body leading-relaxed">
              When a person finds a child wearing our band, they reach out to our dedicated office team. We quote the printed reference to locate the private registration and reach the registered guardian directly.
            </p>
          </div>

          {/* Pillar 3: Respect for Family Information */}
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-brand bg-mint-pale flex items-center justify-center text-navy">
              <Lock className="w-6 h-6 text-[#088F5B]" />
            </div>
            <h3 className="text-2xl font-heading font-bold text-navy">
              Respect for Family Information
            </h3>
            <p className="text-base text-content-body leading-relaxed">
              No personal telephone numbers, home addresses, or child names are printed on the physical band. Your family’s details remain strictly confidential within our protected registry.
            </p>
          </div>
        </div>

        {/* Brand Mission Banner: Connect • Verify • Empower */}
        <div className="bg-navy rounded-brand-lg p-8 sm:p-10 mb-16 text-white border border-white/10 shadow-card flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left max-w-xl">
            <span className="text-xs font-semibold uppercase tracking-wider text-mint">
              Our Core Promise
            </span>
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-white">
              Connect &bull; Verify &bull; Empower
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              We connect caring community members with our dedicated office, verify registered guardian identities with strict privacy standards, and empower parents with dependable peace of mind.
            </p>
          </div>
          <div className="flex-shrink-0 p-4 bg-white/5 rounded-brand border border-white/10">
            <img
              src="/logo-we4u-dark-transparent.png"
              alt="WE4U - Connect Verify Empower"
              className="h-16 sm:h-20 w-auto object-contain"
            />
          </div>
        </div>

        {/* Call to Action Box */}
        <div className="bg-neutral-soft rounded-brand-lg p-8 sm:p-12 border border-border-subtle text-center space-y-5 max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-navy">
            Ready to protect your child with We 4 You?
          </h2>
          <p className="text-base sm:text-lg text-content-body max-w-xl mx-auto">
            Have your band ready and complete your registration in just a few minutes.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button to="/register" variant="primary" size="lg">
              Register Your Child
            </Button>
            <Button to="/how-it-works" variant="outline" size="lg">
              How It Works
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};
