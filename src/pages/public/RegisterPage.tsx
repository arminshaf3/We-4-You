import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { FormField, Input, Select } from '../../components/common/FormField';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { CardPaymentForm, CardFormData, validateCardData } from '../../components/common/CardPaymentForm';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  CreditCard,
  Lock,
  ArrowRight,
  ArrowLeft,
  QrCode,
  Sparkles,
  CheckCircle,
  XCircle,
  User,
  Phone,
  Store,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { RelationshipType, PaymentMethod } from '../../types';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { activeVendors, activePlans, settings, bands, registrations, submitPublicRegistration, addToast } = useApp();

  // 2-Step Streamlined Flow: 1 = Profile & Band, 2 = Plan & Instant Activation
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvancedContact, setShowAdvancedContact] = useState(false);

  // Form State - Contact Details
  const [guardianName, setGuardianName] = useState('');
  const [relationship, setRelationship] = useState<RelationshipType>('Self (Wearer)');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [language, setLanguage] = useState(settings.availableLanguages[0] || 'English');
  const [secName, setSecName] = useState('');
  const [secRelationship, setSecRelationship] = useState('Spouse / Partner');
  const [secPhone, setSecPhone] = useState('');

  // Form State - Wearer & Band Details
  const [childName, setChildName] = useState('');
  const [ageRange, setAgeRange] = useState('Child (0 – 12 years)');
  const [bandCode, setBandCode] = useState(() => {
    return searchParams.get('code') || searchParams.get('band') || '';
  });
  const [vendorId, setVendorId] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().substring(0, 10));

  // Form State - Subscription Plan & Payment
  const [selectedPlanId, setSelectedPlanId] = useState<string>(() => {
    const paramPlan = searchParams.get('plan');
    if (paramPlan && activePlans.some((p) => p.id === paramPlan)) {
      return paramPlan;
    }
    return activePlans[0]?.id || '';
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(() => {
    const payParam = searchParams.get('pay');
    return payParam === 'offline' ? 'offline_voucher' : 'card';
  });

  const [cardData, setCardData] = useState<CardFormData>({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: '',
    brand: 'Card',
    last4: '',
  });

  const [authorityConfirmed, setAuthorityConfirmed] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Sync pre-selected plan
  useEffect(() => {
    const paramPlan = searchParams.get('plan');
    if (paramPlan && activePlans.some((p) => p.id === paramPlan)) {
      setSelectedPlanId(paramPlan);
    } else if (!selectedPlanId && activePlans.length > 0) {
      setSelectedPlanId(activePlans[0].id);
    }
  }, [searchParams, activePlans, selectedPlanId]);

  // Set default vendor if available
  useEffect(() => {
    if (!vendorId) {
      if (activeVendors.length > 0) {
        setVendorId(activeVendors[0].id);
      } else {
        setVendorId('DIRECT');
      }
    }
  }, [activeVendors, vendorId]);

  // Normalize Band Reference: format with hyphens uppercase
  const normalizeBandCode = (input: string) => {
    let clean = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (clean.length > 3 && clean.length <= 7) {
      return `${clean.slice(0, 3)}-${clean.slice(3)}`;
    } else if (clean.length > 7) {
      return `${clean.slice(0, 3)}-${clean.slice(3, 7)}-${clean.slice(7, 9)}`;
    }
    return clean;
  };

  const handleBandCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const normalized = normalizeBandCode(e.target.value);
    setBandCode(normalized);
    if (errors.bandCode) {
      setErrors((prev) => ({ ...prev, bandCode: '' }));
    }
  };

  // Real-time Inventory Verification Status Helper
  const bandInventoryStatus = useMemo(() => {
    const raw = bandCode.trim().replace(/[\s-]/g, '').toUpperCase();
    if (!raw || raw.length < 2) return null;

    // 1. Check for duplicate active registrations
    const duplicate = registrations.find(
      (r) =>
        r.bandCode.replace(/[\s-]/g, '').toUpperCase() === raw &&
        (r.status === 'pending_verification' || r.status === 'approved')
    );

    if (duplicate) {
      return {
        isValid: false,
        status: 'already_registered',
        title: 'Band Already Registered',
        message: `Band "${bandCode.toUpperCase()}" is already registered (Registration #${duplicate.referenceNumber}). Duplicate registrations are not permitted.`,
      };
    }

    // 2. Check existence in system bands inventory
    const existingBand = bands.find(
      (b) => b.referenceCode.replace(/[\s-]/g, '').toUpperCase() === raw
    );

    if (!existingBand) {
      return {
        isValid: false,
        status: 'not_in_inventory',
        title: 'Band Not Found in Inventory',
        message: `Band reference "${bandCode.toUpperCase()}" was not found in official inventory. Only pre-issued bands recorded in system inventory can be activated.`,
      };
    }

    // 3. Check if already assigned to a wearer
    if (existingBand.status === 'assigned' || existingBand.childId) {
      return {
        isValid: false,
        status: 'already_assigned',
        title: 'Band Already Assigned',
        message: `Band "${existingBand.referenceCode}" is already registered and assigned to an active wearer.`,
      };
    }

    // 4. Check if retired or lost
    if (existingBand.status === 'retired' || existingBand.status === 'lost' || existingBand.status === 'replaced') {
      return {
        isValid: false,
        status: 'inactive_status',
        title: `Band Marked as ${existingBand.status.toUpperCase()}`,
        message: `Band "${existingBand.referenceCode}" has status "${existingBand.status}" and cannot be registered. Please contact support.`,
      };
    }

    // 5. Check if available
    if (existingBand.status === 'available') {
      return {
        isValid: true,
        status: 'available',
        band: existingBand,
        title: 'Official Band Verified & In Stock',
        message: `Band "${existingBand.referenceCode}" is verified in inventory and ready for activation.`,
      };
    }

    return {
      isValid: false,
      status: 'unknown',
      title: 'Invalid Band Status',
      message: `Band "${existingBand.referenceCode}" is not available for registration.`,
    };
  }, [bandCode, bands, registrations]);

  // Auto-fill vendor if verified inventory band is already associated with a partner shop
  useEffect(() => {
    if (bandInventoryStatus?.isValid && bandInventoryStatus.band?.vendorId) {
      const assignedVendor = activeVendors.find((v) => v.id === bandInventoryStatus.band.vendorId);
      if (assignedVendor && vendorId !== assignedVendor.id) {
        setVendorId(assignedVendor.id);
      }
    }
  }, [bandInventoryStatus, activeVendors, vendorId]);

  // Step 1 Validation
  const validateStep1 = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;

    // Band code validation
    if (!bandCode.trim()) {
      newErrors.bandCode = 'Printed band reference code is required.';
    } else {
      const raw = bandCode.trim().replace(/[\s-]/g, '').toUpperCase();
      const duplicate = registrations.find(
        (r) => r.bandCode.replace(/[\s-]/g, '').toUpperCase() === raw &&
               (r.status === 'pending_verification' || r.status === 'approved')
      );

      if (duplicate) {
        newErrors.bandCode = `Band "${bandCode.toUpperCase()}" already has an active registration (#${duplicate.referenceNumber}).`;
      } else {
        const existingBand = bands.find(
          (b) => b.referenceCode.replace(/[\s-]/g, '').toUpperCase() === raw
        );

        if (!existingBand) {
          newErrors.bandCode = `Band reference "${bandCode.toUpperCase()}" was not found in our inventory.`;
        } else if (existingBand.status === 'assigned' || existingBand.childId) {
          newErrors.bandCode = `Band "${existingBand.referenceCode}" is already assigned to an active wearer.`;
        } else if (existingBand.status !== 'available') {
          newErrors.bandCode = `Band "${existingBand.referenceCode}" is marked as ${existingBand.status} and cannot be registered.`;
        }
      }
    }

    // Wearer name validation
    if (!childName.trim()) {
      newErrors.childName = 'Wearer’s full name is required.';
    }

    // Contact person validation
    if (!guardianName.trim()) {
      newErrors.guardianName = 'Emergency contact full name is required.';
    }

    if (!mobile.trim() || !phoneRegex.test(mobile.trim())) {
      newErrors.mobile = 'A valid mobile telephone number is required (7-20 digits).';
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please provide a valid email format or leave empty.';
    }

    if (showAdvancedContact && secName.trim() && (!secPhone.trim() || !phoneRegex.test(secPhone.trim()))) {
      newErrors.secPhone = 'A valid backup phone number is required when specifying a backup contact.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Step 2 Validation
  const validateStep2 = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!selectedPlanId) {
      newErrors.planId = 'Please select a subscription plan.';
    }

    if (paymentMethod === 'card') {
      const cardErrs = validateCardData(cardData);
      Object.assign(newErrors, cardErrs);
    }

    if (!authorityConfirmed) {
      newErrors.authority = 'Please check the confirmation box to activate registration.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinueToPlan = () => {
    if (validateStep1()) {
      if (!cardData.cardholderName && guardianName.trim()) {
        setCardData((prev) => ({ ...prev, cardholderName: guardianName.trim().toUpperCase() }));
      }
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBackToProfile = () => {
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setIsSubmitting(true);

    const processingDelay = paymentMethod === 'card' ? 700 : 350;

    setTimeout(() => {
      const isCard = paymentMethod === 'card';
      const txnId = isCard ? `TXN-CARD-2026-${Math.floor(100000 + Math.random() * 900000)}` : undefined;

      try {
        const newRegistration = submitPublicRegistration({
          guardian: {
            fullName: guardianName.trim(),
            relationship,
            mobile: mobile.trim(),
            email: email.trim() || undefined,
            preferredLanguage: language,
            emergencyContact: showAdvancedContact && secName.trim()
              ? {
                  fullName: secName.trim(),
                  relationship: secRelationship,
                  telephone: secPhone.trim(),
                }
              : undefined,
          },
          child: {
            name: childName.trim(),
            ageRange,
          },
          bandCode: bandCode.toUpperCase().trim(),
          vendorId: vendorId || 'DIRECT',
          planId: selectedPlanId,
          paymentMethod,
          cardDetails: isCard ? {
            brand: cardData.brand || 'Visa',
            last4: cardData.last4 || '4242',
            cardholderName: cardData.cardholderName.trim() || guardianName.trim(),
            expMonth: cardData.expiryDate.split('/')[0] || '12',
            expYear: cardData.expiryDate.split('/')[1] || '28',
            transactionId: txnId || `TXN-CARD-${Date.now()}`,
          } : undefined,
        });

        setIsSubmitting(false);

        navigate('/registration/confirmation', {
          state: {
            referenceNumber: newRegistration.referenceNumber,
            childName: childName.trim(),
            bandCode: bandCode.toUpperCase().trim(),
            guardianName: guardianName.trim(),
            guardianPhone: mobile.trim(),
            guardianLanguage: language || 'English',
            vendorName: selectedVendor?.shopName || 'Authorized We 4 You Partner Outlet',
            durationMonths: selectedPlan?.durationMonths || 12,
            isCardPaid: isCard,
            paymentMethod,
            transactionId: newRegistration.cardDetails?.transactionId || txnId,
            receiptRef: newRegistration.paymentRef,
            amountFormatted: selectedPlan?.priceFormatted,
            amountPaid: selectedPlan?.priceAmount,
            cardBrand: newRegistration.cardDetails?.brand || cardData.brand,
            cardLast4: newRegistration.cardDetails?.last4 || cardData.last4,
            planName: selectedPlan?.name,
            paymentDate: new Date().toISOString().substring(0, 10),
          },
        });
      } catch (err: any) {
        setIsSubmitting(false);
        setErrors((prev) => ({
          ...prev,
          bandCode: err.message || 'Band validation failed. Please check your band reference code.',
        }));
        setCurrentStep(1);
      }
    }, processingDelay);
  };

  const selectedPlan = activePlans.find((p) => p.id === selectedPlanId) || activePlans[0];
  const selectedVendor = activeVendors.find((v) => v.id === vendorId);

  return (
    <div className="py-8 sm:py-12 bg-neutral-soft min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Breadcrumb Navigation */}
        <div className="mb-4">
          <Breadcrumbs
            items={[
              { label: 'Home', to: '/' },
              { label: 'Band Registration' },
            ]}
          />
        </div>

        {/* Hero Header */}
        <div className="text-center mb-6 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-mint/20 border border-brand-mint/40 text-navy text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-navy" />
            Fast &amp; Secure 2-Step Band Registration
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-navy tracking-tight">
            Connect &amp; Activate Your Band
          </h1>
          <p className="text-sm text-content-muted max-w-lg mx-auto leading-relaxed">
            Link your physical wristband to authorized emergency contacts for 24/7 child safety and recovery.
          </p>
        </div>

        {/* 2-Step Progress Indicator */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
              currentStep === 1
                ? 'bg-white border-navy ring-2 ring-navy/10 shadow-xs'
                : 'bg-white/60 border-border-subtle opacity-80'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
              currentStep === 1 ? 'bg-navy text-white' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {currentStep === 2 ? <CheckCircle2 className="w-4 h-4 text-emerald-700" /> : '1'}
            </div>
            <div className="overflow-hidden">
              <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block">Step 1</span>
              <span className="text-xs font-bold text-navy truncate block">Band &amp; Wearer Profile</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              if (validateStep1()) setCurrentStep(2);
            }}
            className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
              currentStep === 2
                ? 'bg-white border-navy ring-2 ring-navy/10 shadow-xs'
                : 'bg-white/60 border-border-subtle opacity-80'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
              currentStep === 2 ? 'bg-navy text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              2
            </div>
            <div className="overflow-hidden">
              <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block">Step 2</span>
              <span className="text-xs font-bold text-navy truncate block">Plan &amp; Activation</span>
            </div>
          </button>
        </div>

        {/* ================= STEP 1: BAND & WEARER PROFILE ================= */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Card 1: Band Reference Code */}
            <div className="bg-white rounded-brand border border-border-subtle shadow-subtle p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-navy/5 text-navy flex items-center justify-center">
                    <QrCode className="w-4 h-4 text-navy" />
                  </div>
                  <div>
                    <h2 className="text-sm font-heading font-bold text-navy">1. Printed Band Reference Code</h2>
                    <p className="text-2xs text-content-muted">Enter the unique code printed on your band</p>
                  </div>
                </div>
                <span className="text-2xs font-bold text-slate-400 font-mono uppercase bg-slate-100 px-2 py-0.5 rounded">
                  Format: W4Y-XXXX-XX
                </span>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Input
                    id="bandCode"
                    value={bandCode}
                    onChange={handleBandCodeChange}
                    placeholder="W4Y-7821-K9"
                    className="font-mono uppercase font-bold text-navy text-base tracking-wider h-12"
                    error={!!errors.bandCode || (bandInventoryStatus !== null && !bandInventoryStatus.isValid && bandCode.trim().length >= 4)}
                  />
                  {bandInventoryStatus?.isValid && (
                    <div className="absolute right-3.5 top-3.5 flex items-center text-emerald-600">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                  )}
                </div>

                {errors.bandCode && (
                  <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.bandCode}</span>
                  </p>
                )}

                {/* Real-time Inventory Verification Status Box */}
                {bandInventoryStatus && !errors.bandCode && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 transition-all ${
                      bandInventoryStatus.isValid
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : bandCode.trim().length >= 3
                        ? 'bg-rose-50 border-rose-200 text-rose-900'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    {bandInventoryStatus.isValid ? (
                      <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-bold block">
                        {bandInventoryStatus.title}
                      </span>
                      <span className="leading-relaxed block mt-0.5 opacity-90">
                        {bandInventoryStatus.message}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Card 2: Wearer & Emergency Contact Details */}
            <div className="bg-white rounded-brand border border-border-subtle shadow-subtle p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-border-subtle">
                <div className="w-8 h-8 rounded-lg bg-navy/5 text-navy flex items-center justify-center">
                  <User className="w-4 h-4 text-navy" />
                </div>
                <div>
                  <h2 className="text-sm font-heading font-bold text-navy">2. Wearer &amp; Emergency Contact</h2>
                  <p className="text-2xs text-content-muted">Who wears the band and who will be notified in an emergency</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Wearer’s Full Name" required error={errors.childName} hint="Name of the person wearing the band">
                  <Input
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    placeholder="e.g. Lucas Vance"
                    error={!!errors.childName}
                  />
                </FormField>

                <FormField label="Age Group / Category" hint="Helps responders identify wearer">
                  <Select value={ageRange} onChange={(e) => setAgeRange(e.target.value)}>
                    <option value="Child (0 – 12 years)">Child (0 – 12 years)</option>
                    <option value="Teen (13 – 17 years)">Teen (13 – 17 years)</option>
                    <option value="Adult (18 – 64 years)">Adult (18 – 64 years)</option>
                    <option value="Senior (65+ years)">Senior (65+ years)</option>
                    <option value="Medical / Memory Support">Medical / Memory Support</option>
                    <option value="Outdoor / Athlete / Traveler">Outdoor / Athlete / Traveler</option>
                  </Select>
                </FormField>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Primary Contact Full Name" required error={errors.guardianName} hint="Parent, spouse, or guardian">
                    <Input
                      value={guardianName}
                      onChange={(e) => setGuardianName(e.target.value)}
                      placeholder="e.g. Elena Vance"
                      error={!!errors.guardianName}
                    />
                  </FormField>

                  <FormField label="Primary Emergency Phone" required error={errors.mobile} hint="Called immediately upon scan">
                    <Input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="+1 (555) 012-7819"
                      error={!!errors.mobile}
                    />
                  </FormField>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Relationship to Wearer">
                  <Select value={relationship} onChange={(e) => setRelationship(e.target.value as RelationshipType)}>
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Spouse / Partner">Spouse / Partner</option>
                    <option value="Legal Guardian">Legal Guardian</option>
                    <option value="Caregiver / Nurse">Caregiver / Nurse</option>
                    <option value="Self (Wearer)">Self (Wearer)</option>
                    <option value="Other Authorized">Other Authorized Contact</option>
                  </Select>
                </FormField>

                <FormField label="Purchased From (Store / Office)" hint="Retail store or direct purchase">
                  <Select value={vendorId} onChange={(e) => setVendorId(e.target.value)}>
                    {activeVendors.map((vendor) => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.shopName} — {vendor.branch}
                      </option>
                    ))}
                    {settings.directPurchaseEnabled && (
                      <option value="DIRECT">Purchased directly from We 4 You Office</option>
                    )}
                  </Select>
                </FormField>
              </div>

              {/* Optional Advanced Contact Toggle */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdvancedContact(!showAdvancedContact)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy hover:underline focus:outline-none"
                >
                  {showAdvancedContact ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  <span>{showAdvancedContact ? 'Hide additional contact fields' : '+ Add Email & Backup Emergency Contact (Optional)'}</span>
                </button>

                {showAdvancedContact && (
                  <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <FormField label="Email Address" hint="For digital card receipts &amp; reminders" error={errors.email}>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="elena.vance@example.com"
                          error={!!errors.email}
                        />
                      </FormField>

                      <FormField label="Preferred Language">
                        <Select value={language} onChange={(e) => setLanguage(e.target.value)}>
                          {settings.availableLanguages.map((lang) => (
                            <option key={lang} value={lang}>{lang}</option>
                          ))}
                        </Select>
                      </FormField>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200/60">
                      <FormField label="Secondary Contact Name" hint="Backup contact person">
                        <Input
                          value={secName}
                          onChange={(e) => setSecName(e.target.value)}
                          placeholder="e.g. Marcus Vance"
                        />
                      </FormField>

                      <FormField label="Secondary Emergency Phone" error={errors.secPhone} hint="Backup telephone">
                        <Input
                          type="tel"
                          value={secPhone}
                          onChange={(e) => setSecPhone(e.target.value)}
                          placeholder="+1 (555) 012-7820"
                          error={!!errors.secPhone}
                        />
                      </FormField>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Step 1 Action Button */}
            <div className="flex items-center justify-end pt-2">
              <Button
                type="button"
                onClick={handleContinueToPlan}
                variant="primary"
                size="lg"
                className="w-full sm:w-auto shadow-sm"
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Continue to Plan &amp; Activate
              </Button>
            </div>

          </div>
        )}

        {/* ================= STEP 2: PLAN & INSTANT ACTIVATION ================= */}
        {currentStep === 2 && (
          <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in duration-200">
            
            {/* Top Verified Summary Strip */}
            <div className="bg-navy text-white rounded-brand p-4 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-mint/20 text-brand-mint flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5 text-brand-mint" />
                </div>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-brand-mint text-xs sm:text-sm">{bandCode}</span>
                    <span className="text-3xs bg-white/10 px-2 py-0.5 rounded text-slate-200 font-semibold uppercase">Ready</span>
                  </div>
                  <p className="text-xs text-slate-200 truncate mt-0.5">
                    Wearer: <strong className="text-white">{childName}</strong> • Contact: <strong className="text-white">{mobile}</strong> ({guardianName})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleBackToProfile}
                className="text-xs text-brand-mint hover:underline font-semibold flex-shrink-0 self-end sm:self-center"
              >
                Edit Details
              </button>
            </div>

            {/* Choose Subscription Plan */}
            <div className="bg-white rounded-brand border border-border-subtle shadow-subtle p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-navy" />
                  <h2 className="text-sm font-heading font-bold text-navy">Choose Protection Plan</h2>
                </div>
                <span className="text-2xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  Instant Activation
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {activePlans.map((plan) => {
                  const isSelected = selectedPlanId === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-navy bg-navy/[0.02] ring-2 ring-navy/10'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-heading font-bold text-navy text-sm">{plan.name}</span>
                          {plan.durationMonths >= 24 && (
                            <span className="text-3xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                              Best Value
                            </span>
                          )}
                        </div>
                        <div className="text-xl font-heading font-extrabold text-navy">
                          {plan.priceFormatted}
                          <span className="text-xs text-content-muted font-normal ml-1">/ {plan.durationMonths} Months</span>
                        </div>
                        <p className="text-2xs text-content-muted leading-relaxed">
                          Includes 24/7 hotline dispatch, emergency SMS broadcasts, and digital safety certificate.
                        </p>
                      </div>

                      <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-2xs font-semibold text-slate-500">
                          ${(plan.priceAmount / plan.durationMonths).toFixed(2)}/month
                        </span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-navy bg-navy text-white' : 'border-slate-300'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payment & Checkout Card */}
            <div className="bg-white rounded-brand border border-border-subtle shadow-subtle p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-navy" />
                  <h2 className="text-sm font-heading font-bold text-navy">Payment Details</h2>
                </div>
                <div className="flex items-center gap-1.5 text-2xs text-slate-500 font-semibold">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>256-Bit SSL Encrypted</span>
                </div>
              </div>

              {/* Payment Method Switcher */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    paymentMethod === 'card'
                      ? 'border-navy bg-navy/[0.02] ring-1 ring-navy/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CreditCard className={`w-4 h-4 ${paymentMethod === 'card' ? 'text-navy' : 'text-slate-400'}`} />
                    <div>
                      <span className="font-bold text-xs text-navy block">Debit / Credit Card</span>
                      <span className="text-3xs text-emerald-700 font-semibold">Instant Online</span>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('offline_voucher')}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    paymentMethod === 'offline_voucher'
                      ? 'border-navy bg-navy/[0.02] ring-1 ring-navy/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Clock className={`w-4 h-4 ${paymentMethod === 'offline_voucher' ? 'text-navy' : 'text-slate-400'}`} />
                    <div>
                      <span className="font-bold text-xs text-navy block">Store Voucher</span>
                      <span className="text-3xs text-slate-500">Pay in Store</span>
                    </div>
                  </div>
                </button>
              </div>

              {/* Card Form */}
              {paymentMethod === 'card' ? (
                <div className="pt-2">
                  <CardPaymentForm
                    cardData={cardData}
                    onChange={setCardData}
                    errors={errors}
                    planAmountFormatted={selectedPlan?.priceFormatted}
                    planName={selectedPlan?.name}
                    isProcessing={isSubmitting}
                    compact
                  />
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <span className="font-bold text-navy block">Offline Retail Payment</span>
                  <p className="text-content-muted text-2xs leading-relaxed">
                    Your registration will be queued in pending status. Please present your reference number at your retail partner store to complete physical payment verification.
                  </p>
                </div>
              )}

              {/* Confirmation Disclaimer */}
              <div className="pt-3 border-t border-slate-100">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={authorityConfirmed}
                    onChange={(e) => setAuthorityConfirmed(e.target.checked)}
                    className="w-4 h-4 rounded text-navy mt-0.5 focus:ring-navy"
                  />
                  <span className="text-2xs text-content-muted leading-snug">
                    I confirm that I am authorized to register this band for <strong className="text-navy">{childName}</strong> and consent to emergency communications as outlined in the We 4 You Safety Policy.
                  </span>
                </label>
                {errors.authority && (
                  <p className="text-xs text-red-600 font-medium mt-1">{errors.authority}</p>
                )}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                onClick={handleBackToProfile}
                variant="outline"
                size="md"
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                className="shadow-sm font-bold"
                leftIcon={<ShieldCheck className="w-4 h-4 text-brand-mint" />}
              >
                {paymentMethod === 'card'
                  ? `Activate Band & Complete (${selectedPlan?.priceFormatted})`
                  : 'Submit Registration'}
              </Button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
