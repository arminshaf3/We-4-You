import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Modal } from '../../components/common/Modal';
import { FormField, Input, Select } from '../../components/common/FormField';
import { CardPaymentForm, CardFormData, validateCardData } from '../../components/common/CardPaymentForm';
import { useApp } from '../../context/AppContext';
import {
  Check,
  Info,
  PhoneCall,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  CreditCard,
  Lock,
  Sparkles,
  CheckCircle2,
  Receipt,
  Printer,
} from 'lucide-react';
import { SubscriptionPlan, Payment } from '../../types';

export const SubscriptionsPage: React.FC = () => {
  const { activePlans, settings, bands, childrenRecords, subscriptions, directSubscribeWithCard } = useApp();
  const navigate = useNavigate();

  // Direct Card Checkout / Renewal Modal State
  const [isDirectModalOpen, setIsDirectModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [directBandCode, setDirectBandCode] = useState('');
  const [directGuardianName, setDirectGuardianName] = useState('');
  const [directPhone, setDirectPhone] = useState('');
  const [cardData, setCardData] = useState<CardFormData>({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: '',
    brand: 'Card',
    last4: '',
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedPayment, setCompletedPayment] = useState<Payment | null>(null);

  const handleSelectPlan = (planId: string) => {
    // Navigate to /register with pre-selected plan & card payment
    navigate(`/register?plan=${planId}&pay=card`);
  };

  const handleOpenDirectCheckout = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setFormErrors({});
    setCompletedPayment(null);
    setIsDirectModalOpen(true);
  };

  const handleConfirmDirectPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    const errs: { [key: string]: string } = {};
    if (!directBandCode.trim()) errs.bandCode = 'Printed band code is required.';
    if (!directGuardianName.trim()) errs.guardianName = 'Guardian name is required.';
    if (!directPhone.trim()) errs.phone = 'Mobile phone number is required.';

    const cardErrs = validateCardData(cardData);
    Object.assign(errs, cardErrs);

    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const result = directSubscribeWithCard({
        bandCode: directBandCode.trim(),
        planId: selectedPlan.id,
        guardianName: directGuardianName.trim(),
        guardianPhone: directPhone.trim(),
        cardDetails: {
          brand: cardData.brand,
          last4: cardData.last4,
          cardholderName: cardData.cardholderName.trim() || directGuardianName.trim(),
          transactionId: `TXN-CARD-2026-${Math.floor(100000 + Math.random() * 900000)}`,
        },
      });

      setIsSubmitting(false);
      if (result.receipt) {
        setCompletedPayment(result.receipt);
      }
    }, 700);
  };

  return (
    <div className="py-10 sm:py-16 bg-white">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        
        <Breadcrumbs items={[{ label: 'Subscriptions' }]} className="mb-8" />

        {/* Page Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-mint-darker bg-mint-pale px-3 py-1 rounded-full mb-3 border border-emerald-300/40">
            Subscription Plans &amp; Card Payments
          </span>
          <h1 className="text-4xl sm:text-5xl font-heading font-bold text-navy leading-tight tracking-tight">
            One band. Instant ongoing support.
          </h1>
          <p className="text-xl text-content-body mt-4 leading-relaxed">
            Band purchases and ongoing support subscriptions are separate linked concepts. You can subscribe or renew anytime online using major credit/debit cards with instant confirmation.
          </p>
        </div>

        {/* Notice on Card Payment & Terms */}
        <div className="p-4 sm:p-5 bg-emerald-50/60 rounded-brand border border-emerald-300/60 mb-12 flex items-start gap-3.5 max-w-4xl shadow-sm">
          <ShieldCheck className="w-5 h-5 text-[#088F5B] flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-content-body leading-relaxed">
            <span className="font-semibold text-navy">Instant Card Payment Acceptance: </span>
            Subscriptions paid online via Credit or Debit Card are authorized and confirmed immediately. Official digital receipts and transaction reference IDs are generated and verified on the spot.
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
                  {plan.isProvisional ? (
                    <span className="text-[10px] font-semibold uppercase tracking-wider bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                      Provisional
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded">
                      Instant Card Pay
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

              {/* Action Buttons */}
              <div className="pt-4 border-t border-border-subtle space-y-2">
                <Button
                  onClick={() => handleSelectPlan(plan.id)}
                  variant={plan.isProvisional ? 'outline' : 'primary'}
                  size="md"
                  className="w-full"
                  leftIcon={<CreditCard className="w-4 h-4" />}
                >
                  Pay with Card &amp; Register
                </Button>

                <button
                  type="button"
                  onClick={() => handleOpenDirectCheckout(plan)}
                  className="w-full text-xs font-semibold text-navy hover:text-navy-light py-1.5 rounded text-center block transition-colors hover:underline"
                >
                  Already have a band? Renew with Card &rarr;
                </button>
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
                Subscription Renewals &amp; Card Payments
              </h2>
            </div>
            <p className="text-base text-content-body leading-relaxed">
              When your subscription approaches its expiry, you can renew it directly with our office or online with credit card. Early renewal automatically extends from your current expiry date without interruption, ensuring continuous active protection.
            </p>
            <p className="text-xs text-content-muted">
              You do not need to purchase a new band to renew service unless your original band has been damaged or lost.
            </p>
          </div>

          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col justify-start lg:justify-end gap-3">
            <Button
              onClick={() => handleOpenDirectCheckout(activePlans[0] || { id: 'PLAN-ANNUAL', name: 'Annual Support', durationMonths: 12, priceFormatted: '$29.00 / yr', priceAmount: 29, currency: 'USD', description: '', isActive: true, isProvisional: false, features: [] })}
              variant="primary"
              size="md"
              leftIcon={<CreditCard className="w-4 h-4" />}
            >
              Renew Online with Card
            </Button>
            <Button to="/contact" variant="outline" size="md" leftIcon={<PhoneCall className="w-4 h-4" />}>
              Contact Our Office
            </Button>
          </div>
        </div>

        {/* Shop Commission Note */}
        <div className="p-6 bg-mint-pale/50 rounded-brand border border-emerald-300/40 text-xs sm:text-sm text-content-body max-w-3xl mx-auto space-y-2">
          <div className="flex items-center gap-2 font-heading font-semibold text-navy">
            <ShieldCheck className="w-4 h-4 text-[#088F5B]" />
            <span>Retail Partner Attribution &amp; Commissions</span>
          </div>
          <p className="leading-relaxed">
            During registration, you will select the vendor shop where you acquired your band. This links your registration to that partner so our office can manage service and commission eligibility accurately.
          </p>
        </div>

      </div>

      {/* Direct Card Subscription / Renewal Modal */}
      <Modal
        isOpen={isDirectModalOpen}
        onClose={() => setIsDirectModalOpen(false)}
        maxWidth="2xl"
        title={completedPayment ? 'Card Payment Confirmed' : `Subscribe Online: ${selectedPlan?.name}`}
        description={
          completedPayment
            ? 'Your card payment has been accepted and verified.'
            : 'Enter your band reference and card details for instant subscription coverage.'
        }
      >
        {completedPayment ? (
          <div className="space-y-5 py-3 max-w-lg mx-auto text-center animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-300 text-[#088F5B] flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-1.5">
              <span className="inline-block text-xs uppercase font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
                Payment Verified &amp; Confirmed
              </span>
              <h3 className="text-2xl font-heading font-bold text-navy">
                Subscription Confirmed!
              </h3>
              <p className="text-xs sm:text-sm text-content-muted">
                Your card payment has been successfully authorized and your subscription is active.
              </p>
            </div>

            <div className="bg-neutral-soft p-5 rounded-brand border border-border-subtle text-left text-xs sm:text-sm space-y-2.5 shadow-subtle">
              <div className="flex justify-between items-center pb-2 border-b border-border-subtle">
                <span className="text-content-muted">Receipt Number:</span>
                <span className="font-mono font-bold text-navy">{completedPayment.receiptRef}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border-subtle">
                <span className="text-content-muted">Transaction ID:</span>
                <span className="font-mono font-bold text-navy">{completedPayment.transactionId || 'TXN-CARD-CONFIRMED'}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border-subtle">
                <span className="text-content-muted">Amount Paid:</span>
                <span className="font-bold text-[#088F5B] text-base">${completedPayment.amount.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border-subtle">
                <span className="text-content-muted">Payment Method:</span>
                <span className="font-semibold text-navy flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[#088F5B]" />
                  {completedPayment.cardDetails?.brand || 'Card'} •••• {completedPayment.cardDetails?.last4 || '4242'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-content-muted">Band Reference:</span>
                <span className="font-mono font-bold text-navy uppercase">{directBandCode || 'W4Y-BAND'}</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <Button onClick={() => window.print()} variant="outline" size="md" leftIcon={<Printer className="w-4 h-4" />}>
                Print Receipt
              </Button>
              <Button onClick={() => setIsDirectModalOpen(false)} variant="primary" size="md">
                Done &amp; Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleConfirmDirectPayment} className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
              
              {/* Left Column: Plan Info & Band/Contact Details */}
              <div className="space-y-4">
                {/* Plan Overview Card */}
                {selectedPlan && (
                  <div className="bg-neutral-soft p-4 rounded-brand border border-border-subtle space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-navy bg-white px-2 py-0.5 rounded border border-border-subtle">
                        {selectedPlan.name}
                      </span>
                      <span className="font-heading font-bold text-navy text-lg">
                        {selectedPlan.priceFormatted}
                      </span>
                    </div>
                    <div className="text-xs text-content-body flex items-center justify-between">
                      <span>Coverage Duration:</span>
                      <span className="font-medium text-navy">{selectedPlan.durationMonths} Months Active Support</span>
                    </div>
                    {selectedPlan.features && selectedPlan.features.length > 0 && (
                      <div className="pt-2 border-t border-border-subtle/80 space-y-1">
                        {selectedPlan.features.slice(0, 2).map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[11px] text-content-body">
                            <Check className="w-3.5 h-3.5 text-[#088F5B] flex-shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Band & Contact Details */}
                <div className="space-y-3 bg-white p-4 rounded-brand border border-border-subtle">
                  <h4 className="text-xs font-heading font-bold uppercase tracking-wider text-navy pb-1 border-b border-border-subtle">
                    1. Band &amp; Contact Details
                  </h4>

                  <FormField
                    label="Band Reference Code"
                    id="directBandCode"
                    required
                    hint="Printed code on the physical band (e.g. W4Y-1082-M4)"
                    error={formErrors.bandCode}
                  >
                    <Input
                      id="directBandCode"
                      value={directBandCode}
                      onChange={(e) => setDirectBandCode(e.target.value.toUpperCase())}
                      placeholder="W4Y-1082-M4"
                      className="font-mono uppercase font-semibold text-sm"
                      required
                    />
                  </FormField>

                  <FormField
                    label="Primary Contact Full Name"
                    id="directGuardianName"
                    required
                    hint="Full name of primary contact person"
                    error={formErrors.guardianName}
                  >
                    <Input
                      id="directGuardianName"
                      value={directGuardianName}
                      onChange={(e) => setDirectGuardianName(e.target.value)}
                      placeholder="e.g. Elena Vance"
                      required
                    />
                  </FormField>

                  <FormField
                    label="Emergency Mobile Phone"
                    id="directPhone"
                    required
                    hint="For emergency voice calls &amp; notifications"
                    error={formErrors.phone}
                  >
                    <Input
                      id="directPhone"
                      type="tel"
                      value={directPhone}
                      onChange={(e) => setDirectPhone(e.target.value)}
                      placeholder="+1 (555) 019-2834"
                      required
                    />
                  </FormField>
                </div>
              </div>

              {/* Right Column: Card Payment Form */}
              <div className="space-y-4">
                <CardPaymentForm
                  cardData={cardData}
                  onChange={setCardData}
                  errors={formErrors}
                  planAmountFormatted={selectedPlan?.priceFormatted}
                  planName={selectedPlan?.name}
                  isProcessing={isSubmitting}
                  compact={true}
                />
              </div>

            </div>

            {/* Bottom Actions Bar */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-3 border-t border-border-subtle">
              <Button
                type="button"
                onClick={() => setIsDirectModalOpen(false)}
                variant="outline"
                size="md"
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                leftIcon={<Lock className="w-4 h-4" />}
                className="w-full sm:w-auto shadow-md"
              >
                Pay {selectedPlan?.priceFormatted || '$29.00'} &amp; Confirm
              </Button>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
};
