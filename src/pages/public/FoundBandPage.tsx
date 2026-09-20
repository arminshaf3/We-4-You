import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { FormField, Input } from '../../components/common/FormField';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { useApp } from '../../context/AppContext';
import { PhoneCall, ShieldCheck, Heart, Info, CheckCircle2 } from 'lucide-react';

export const FoundBandPage: React.FC = () => {
  const { publicCode } = useParams<{ publicCode?: string }>();
  const { settings } = useApp();

  const [enteredCode, setEnteredCode] = useState(publicCode || '');
  const [hasSearched, setHasSearched] = useState(!!publicCode);

  useEffect(() => {
    if (publicCode) {
      setEnteredCode(publicCode);
      setHasSearched(true);
    }
  }, [publicCode]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredCode.trim()) {
      setHasSearched(true);
    }
  };

  return (
    <div className="py-10 sm:py-16 bg-white min-h-[80vh]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Breadcrumbs items={[{ label: 'Found a Band' }]} className="mb-8" />

        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="w-16 h-16 rounded-full bg-mint-pale border border-emerald-300 flex items-center justify-center mx-auto mb-4 text-navy">
            <Heart className="w-8 h-8 text-[#088F5B]" />
          </div>
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-mint-darker bg-mint-pale px-3 py-1 rounded-full mb-3 border border-emerald-300/40">
            Assistance Guidance
          </span>
          <h1 className="text-3xl sm:text-5xl font-heading font-bold text-navy leading-tight tracking-tight">
            Help us make a connection.
          </h1>
          <p className="text-lg text-content-body mt-3 leading-relaxed">
            If you have found a person wearing a We 4 You identification wristband (such as a child, senior, or injured individual), or have found a lost band, thank you for stepping in.
          </p>
        </div>

        {/* Primary Contact Guidance Card */}
        <div className="bg-navy text-white rounded-brand-lg p-6 sm:p-10 border border-navy-light shadow-card space-y-6 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/15">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-mint block">
                Direct Office Telephone
              </span>
              <span className="text-2xl sm:text-3xl font-heading font-bold text-white mt-1 block">
                {settings.officePhone}
              </span>
            </div>
            <a
              href={`tel:${settings.officePhone.replace(/[^0-9+]/g, '')}`}
              className="inline-flex items-center justify-center h-12 px-6 rounded-brand bg-mint text-navy font-heading font-bold text-base hover:brightness-105 transition-all gap-2 self-start sm:self-auto"
            >
              <PhoneCall className="w-5 h-5" />
              <span>Call Office Now</span>
            </a>
          </div>

          <div className="space-y-3 text-sm text-slate-200">
            <h4 className="font-heading font-bold text-white text-base">
              Instructions for the finder:
            </h4>
            <ol className="list-decimal pl-5 space-y-2 text-xs sm:text-sm text-slate-300">
              <li>Keep the person safe, calm, and accompanied in a well-lit, public location (such as a customer service desk, park warden station, or medical/security desk).</li>
              <li>Locate the printed band reference code on their wristband (e.g. <span className="font-mono text-mint font-semibold">W4Y-XXXX-XX</span>).</li>
              <li>Call our central office telephone above and quote that printed reference code to our staff.</li>
              <li>Our staff will immediately contact their registered emergency contacts or family members.</li>
            </ol>
          </div>
        </div>

        {/* Reference Lookup / Confirmation Box */}
        <div className="bg-neutral-soft rounded-brand-lg p-6 sm:p-8 border border-border-subtle shadow-subtle mb-10">
          <h3 className="text-lg font-heading font-bold text-navy mb-2">
            Quote or Check Band Reference
          </h3>
          <p className="text-xs sm:text-sm text-content-body mb-4">
            You can verify the format of the printed reference code below:
          </p>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={enteredCode}
                onChange={(e) => setEnteredCode(e.target.value.toUpperCase())}
                placeholder="e.g. W4Y-7821-K9"
                className="w-full h-12 px-4 text-base font-mono uppercase rounded-brand border border-border-subtle bg-white text-navy font-semibold focus:outline-none focus:ring-2 focus:ring-navy"
              />
            </div>
            <Button type="submit" variant="primary" size="md">
              Check Reference
            </Button>
          </form>

          {hasSearched && enteredCode.trim() && (
            <div className="mt-5 p-4 rounded-brand bg-white border border-border-subtle space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#088F5B]" />
                <span className="font-heading font-bold text-sm text-navy">
                  Reference Noted: {enteredCode.toUpperCase().trim()}
                </span>
              </div>
              <p className="text-xs text-content-body leading-relaxed">
                Please call our office at <strong className="text-navy">{settings.officePhone}</strong> and quote code{' '}
                <strong className="font-mono text-navy">{enteredCode.toUpperCase().trim()}</strong>. Our team will look up the private emergency record internally and coordinate the connection.
              </p>
            </div>
          )}
        </div>

        {/* Essential Privacy & Security Guarantee */}
        <div className="p-5 bg-slate-50 rounded-brand border border-slate-200 text-xs text-content-muted space-y-2">
          <div className="flex items-center gap-2 font-semibold text-navy">
            <ShieldCheck className="w-4 h-4 text-navy" />
            <span>Strict Privacy &amp; Personal Safety Policy</span>
          </div>
          <p className="leading-relaxed">
            To protect personal safety and privacy, this public website <strong>never</strong> exposes wearer names, medical details, emergency phone numbers, home addresses, or registration status online. Band codes are private references, not public search queries. All reconnection coordination is handled directly by trained office staff.
          </p>
        </div>

      </div>
    </div>
  );
};
