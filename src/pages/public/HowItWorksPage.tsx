import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { AssistanceBanner } from '../../components/public/AssistanceBanner';
import {
  ClipboardCheck,
  Shield,
  PhoneCall,
  Info,
  Globe,
  Hash,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  return (
    <div className="py-10 sm:py-16 bg-white">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        
        <Breadcrumbs items={[{ label: 'How It Works' }]} className="mb-8" />

        {/* Page Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-mint-darker bg-mint-pale px-3 py-1 rounded-full mb-3 border border-emerald-300/40">
            Clear &amp; Practical
          </span>
          <h1 className="text-4xl sm:text-5xl font-heading font-bold text-navy leading-tight tracking-tight">
            How It Works
          </h1>
          <p className="text-xl text-content-body mt-4 leading-relaxed">
            Our service combines a durable physical identification wristband with an attentive office team to reconnect families quickly.
          </p>
        </div>

        {/* The 3 Steps with Larger Visual Blocks */}
        <div className="space-y-12 mb-16">
          {/* Step 1: Register */}
          <div className="bg-neutral-soft rounded-brand-lg border border-border-subtle p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy text-white text-xs font-bold font-heading">
                <span>STEP 01</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-navy">
                Register your band and family contacts
              </h2>
              <p className="text-base sm:text-lg text-content-body leading-relaxed">
                When you buy an identification band from an authorized shop, visit our website to register it. You provide your child’s name, primary and emergency guardian numbers, preferred language, and the shop where the band was purchased.
              </p>
              <div className="pt-2">
                <Button to="/register" variant="primary" size="md">
                  Register Your Band
                </Button>
              </div>
            </div>
            <div className="lg:col-span-5 bg-white p-6 rounded-brand border border-border-subtle shadow-subtle flex flex-col gap-3">
              <div className="flex items-center gap-3 text-navy font-semibold text-sm">
                <ClipboardCheck className="w-5 h-5 text-[#088F5B]" />
                <span>What is recorded privately:</span>
              </div>
              <ul className="text-xs text-content-muted space-y-2 pl-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#088F5B]" />
                  <span>Guardian full name &amp; relationship</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#088F5B]" />
                  <span>Primary &amp; secondary emergency mobile numbers</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#088F5B]" />
                  <span>Child’s first name and optional age</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#088F5B]" />
                  <span>Vendor shop attribution for service validity</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Step 2: Wear */}
          <div className="bg-neutral-soft rounded-brand-lg border border-border-subtle p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy text-white text-xs font-bold font-heading">
                <span>STEP 02</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-navy">
                Your child wears the band every day
              </h2>
              <p className="text-base sm:text-lg text-content-body leading-relaxed">
                Put the band on your child whenever you visit parks, markets, beaches, shopping centres, or travel. The soft, hypoallergenic band is waterproof and resilient against dirt, sweat, and active play.
              </p>
              <div className="p-4 bg-white rounded-brand border border-border-subtle text-xs text-content-body flex items-start gap-2.5">
                <Info className="w-4 h-4 text-navy flex-shrink-0 mt-0.5" />
                <span>
                  <strong>No electronics or batteries:</strong> Because the band has no electronics, it cannot run out of power, lose satellite lock, or break down when wet.
                </span>
              </div>
            </div>
            <div className="lg:col-span-5 flex justify-center">
              <div className="rounded-brand-lg overflow-hidden border border-border-subtle shadow-card max-h-72 w-full">
                <img
                  src="https://images.unsplash.com/photo-1505377059067-e285a7bac49b?auto=format&fit=crop&w=700&q=80"
                  alt="Young child playing safely outdoors wearing an identification wristband"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Reconnect */}
          <div className="bg-neutral-soft rounded-brand-lg border border-border-subtle p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy text-white text-xs font-bold font-heading">
                <span>STEP 03</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-navy">
                Our office connects caring people with you
              </h2>
              <p className="text-base sm:text-lg text-content-body leading-relaxed">
                If a child is lost or separated, any person or official who finds them sees the clear instructions on the band: they call our office or visit our site and quote the reference. Our staff immediately phones the registered guardians.
              </p>
              <div className="pt-2">
                <Button to="/found-band" variant="mint" size="md">
                  View Found-Band Assistance Guidance
                </Button>
              </div>
            </div>
            <div className="lg:col-span-5 bg-navy text-white p-6 rounded-brand border border-navy-light shadow-subtle space-y-3">
              <div className="flex items-center gap-3">
                <PhoneCall className="w-5 h-5 text-mint" />
                <span className="font-heading font-bold text-sm text-mint">How Office Staff Responds</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                1. Staff answers the caller and notes their telephone &amp; current safe location.<br />
                2. Staff matches the band reference to the private guardian file.<br />
                3. Staff phones the primary guardian; if unreachable, secondary contacts are called immediately.<br />
                4. Safe reconnection is monitored until confirmed.
              </p>
            </div>
          </div>
        </div>

        {/* Anatomical Illustration of the Band */}
        <div className="bg-mint-pale/60 rounded-brand-lg p-8 sm:p-12 border border-emerald-300/60 mb-16">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-heading font-bold text-navy">
              What is printed on every band?
            </h2>
            <p className="text-base text-content-body mt-2">
              Three critical pieces of practical information are permanently printed on the band surface:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-brand border border-border-subtle shadow-subtle text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-navy text-mint flex items-center justify-center mx-auto mb-3">
                <Globe className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-content-muted block">1. Website</span>
              <span className="text-base font-mono font-bold text-navy block">we4you.org</span>
              <p className="text-xs text-content-muted">
                Directs any smartphone user to our official assistance portal.
              </p>
            </div>

            <div className="bg-white p-6 rounded-brand border border-border-subtle shadow-subtle text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-navy text-mint flex items-center justify-center mx-auto mb-3">
                <PhoneCall className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-content-muted block">2. Office Contact</span>
              <span className="text-base font-mono font-bold text-navy block">+1 (800) 555-WE4U</span>
              <p className="text-xs text-content-muted">
                Staffed telephone contact for direct voice communication.
              </p>
            </div>

            <div className="bg-white p-6 rounded-brand border border-border-subtle shadow-subtle text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-navy text-mint flex items-center justify-center mx-auto mb-3">
                <Hash className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-content-muted block">3. Unique Reference</span>
              <span className="text-base font-mono font-bold text-mint-darker bg-mint-pale px-2 py-0.5 rounded border border-emerald-300 inline-block">
                e.g. W4Y-7821-K9
              </span>
              <p className="text-xs text-content-muted">
                Confidential code linking strictly to our private database.
              </p>
            </div>
          </div>
        </div>

        {/* Clear Distinction Note */}
        <div className="p-6 bg-slate-50 rounded-brand border border-slate-200 text-xs sm:text-sm text-content-body max-w-3xl mx-auto space-y-2">
          <div className="flex items-center gap-2 font-heading font-semibold text-navy">
            <HelpCircle className="w-4 h-4 text-navy" />
            <span>Important Product Distinction</span>
          </div>
          <p className="leading-relaxed">
            We 4 You is an identification band and intermediary contact service. It is not an electronic GPS tracker, smartwatch, or sensor device. It does not broadcast a live location signal, and it requires no internet connection to function.
          </p>
        </div>

      </div>
    </div>
  );
};
