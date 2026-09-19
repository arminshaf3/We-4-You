import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { useApp } from '../../context/AppContext';
import { Check, Info, PhoneCall, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';

export const SubscriptionsPage: React.FC = () => {
  const { activePlans, settings } = useApp();
  const navigate = useNavigate();

  const handleSelectPlan = (planId: string) => {
    // Navigate to /register with pre-selected plan
    navigate(`/register?plan=${planId}`);
  };

  return (
    <div className="py-10 sm:py-16 bg-white">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        
        <Breadcrumbs items={[{ label: 'Subscriptions' }]} className="mb-8" />

        {/* Page Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-mint-darker bg-mint-pale px-3 py-1 rounded-full mb-3 border border-emerald-300/40">
            Subscription Plans
          </span>
          <h1 className="text-4xl sm:text-5xl font-heading font-bold text-navy leading-tight tracking-tight">
            One band. Ongoing support.
          </h1>
          <p className="text-xl text-content-body mt-4 leading-relaxed">
            Band purchases and ongoing support subscriptions are separate linked concepts. Your band is bought once at an authorized local shop, while our subscription service covers dedicated office contact support.
          </p>
        </div>

        {/* Notice on Commercial Terms */}
        <div className="p-4 sm:p-5 bg-neutral-soft rounded-brand border border-border-subtle mb-12 flex items-start gap-3.5 max-w-4xl">
          <Info className="w-5 h-5 text-navy flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-content-body leading-relaxed">
            <span className="font-semibold text-navy">Demonstration Commercial Notice: </span>
            Final subscription prices, periods, and payment methods have not been finalized by the business. The figures below are sample values for demonstration purposes. All registrations operate under a manual verification workflow.
          </div>
        </div>

        {/* Configurable Demonstration Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {activePlans.map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-brand-lg border-2 border-border-subtle hover:border-navy/40 transition-all p-7 flex flex-col justify-between shadow-subtle hover:shadow-card relative"
            >
              <div>
                {/* Plan Header */}
                <div className="flex items-start justify-between gap-2 mb-4">
                  <h3 className="text-xl font-heading font-bold text-navy">
                    {plan.name}
                  </h3>
                  {plan.isProvisional && (
                    <span className="text-[10px] font-semibold uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                      Provisional
                    </span>
                  )}
                </div>

                {/* Price Display */}
                <div className="mb-4 pb-4 border-b border-border-subtle">
                  <span className="text-2xl sm:text-3xl font-heading font-bold text-navy block">
                    {plan.priceFormatted}
                  </span>
                  <span className="text-xs text-content-muted mt-1 block">
                    Duration: {plan.durationMonths} months coverage
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-content-body mb-6 leading-relaxed">
                  {plan.description}
                </p>

                {/* Features List */}
                <ul className="space-y-3 mb-8 text-xs sm:text-sm text-content-body">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-[#088F5B] flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-border-subtle">
                <Button
                  onClick={() => handleSelectPlan(plan.id)}
                  variant={plan.isProvisional ? 'outline' : 'primary'}
                  size="md"
                  className="w-full"
                >
                  Choose Plan
                </Button>
                <p className="text-[11px] text-content-muted text-center mt-2">
                  Pre-selects this plan in registration
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Renewal Guidance Section */}
        <div className="bg-neutral-soft rounded-brand-lg p-8 sm:p-10 border border-border-subtle grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16">
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-navy" />
              <h2 className="text-2xl font-heading font-bold text-navy">
                Subscription Renewals
              </h2>
            </div>
            <p className="text-base text-content-body leading-relaxed">
              When your subscription approaches its expiry, you can renew it directly with our office. Early renewal automatically extends from your current expiry date without interruption, so your child remains protected continuously.
            </p>
            <p className="text-xs text-content-muted">
              You do not need to purchase a new band to renew service unless your original band has been damaged or lost.
            </p>
          </div>

          <div className="lg:col-span-4 flex justify-start lg:justify-end">
            <Button to="/contact" variant="outline" size="md" leftIcon={<PhoneCall className="w-4 h-4" />}>
              Contact Our Office
            </Button>
          </div>
        </div>

        {/* Shop Commission Note */}
        <div className="p-6 bg-mint-pale/50 rounded-brand border border-emerald-300/40 text-xs sm:text-sm text-content-body max-w-3xl mx-auto space-y-2">
          <div className="flex items-center gap-2 font-heading font-semibold text-navy">
            <ShieldCheck className="w-4 h-4 text-[#088F5B]" />
            <span>Retail Shop Attribution &amp; Commissions</span>
          </div>
          <p className="leading-relaxed">
            During registration, you will select the vendor shop where you bought your band. This links your registration to that shop so our office can manage commission eligibility accurately.
          </p>
        </div>

      </div>
    </div>
  );
};
