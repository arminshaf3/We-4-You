import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { FormField, Input, Select } from '../../components/common/FormField';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { CardPaymentForm, CardFormData, validateCardData } from '../../components/common/CardPaymentForm';
import { useApp } from '../../context/AppContext';
import {
  UserCheck,
  ShieldAlert,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  PhoneCall,
  UploadCloud,
  FileText,
  CreditCard,
  Lock,
  ShieldCheck,
  Check,
  Sparkles,
  Layers,
} from 'lucide-react';
import { RelationshipType, PaymentMethod } from '../../types';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { activeVendors, activePlans, settings, bands, submitPublicRegistration, addToast } = useApp();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State - Step 1: Primary Contact Details
  const [guardianName, setGuardianName] = useState('');
  const [relationship, setRelationship] = useState<RelationshipType>('Self (Wearer)');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [language, setLanguage] = useState(settings.availableLanguages[0] || 'English');
  const [hasSecondaryContact, setHasSecondaryContact] = useState(false);
  const [secName, setSecName] = useState('');
  const [secRelationship, setSecRelationship] = useState('Spouse / Partner');
  const [secPhone, setSecPhone] = useState('');

  // Form State - Step 2: Wearer & Band Details
  const [childName, setChildName] = useState('');
  const [ageRange, setAgeRange] = useState('Adult (18 – 64 years)');
  const [bandCode, setBandCode] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().substring(0, 10));
  const [receiptRef, setReceiptRef] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Form State - Step 3: Subscription Plan
  const [selectedPlanId, setSelectedPlanId] = useState<string>(() => {
    const paramPlan = searchParams.get('plan');
    if (paramPlan && activePlans.some((p) => p.id === paramPlan)) {
      return paramPlan;
    }
    return activePlans[0]?.id || '';
  });

  // Form State - Step 4: Payment Method & Card Details
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

  // Form State - Step 5: Acknowledgment
  const [authorityConfirmed, setAuthorityConfirmed] = useState(false);

  // Validation Errors
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Sync pre-selected plan if param changes
  useEffect(() => {
    const paramPlan = searchParams.get('plan');
    if (paramPlan && activePlans.some((p) => p.id === paramPlan)) {
      setSelectedPlanId(paramPlan);
    }
  }, [searchParams, activePlans]);

  // Set default vendor if available
  useEffect(() => {
    if (!vendorId && activeVendors.length > 0) {
      setVendorId(activeVendors[0].id);
    }
  }, [activeVendors, vendorId]);

  // Check if selected vendor is still active
  useEffect(() => {
    if (vendorId && vendorId !== 'DIRECT' && !activeVendors.some((v) => v.id === vendorId)) {
      setErrors((prev) => ({
        ...prev,
        vendorId: 'The previously selected shop is no longer active. Please choose an active shop from the list.',
      }));
    }
  }, [activeVendors, vendorId]);

  // Quick Demo Auto-fill Helper for Step 1
  const handleFillDemoGuardian = () => {
    setGuardianName('Elena Vance');
    setRelationship('Parent / Guardian');
    setMobile('+1 (555) 012-7819');
    setEmail('elena.vance@example.com');
    setCardData((prev) => ({ ...prev, cardholderName: 'ELENA VANCE' }));
  };

  // Quick Demo Auto-fill Helper for Step 2
  const handleFillDemoChild = (code = 'W4Y-7821-K9') => {
    setChildName('Lucas Vance');
    setAgeRange('Child (0 – 12 years)');
    setBandCode(code);
    if (activeVendors.length > 0) {
      setVendorId(activeVendors[0].id);
    }
  };

  // Normalize Band Reference: spaces and hyphens, uppercase
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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Step Validation
  const validateStep = (step: number): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (step === 1) {
      if (!guardianName.trim()) newErrors.guardianName = 'Contact full name is required.';
      if (!relationship) newErrors.relationship = 'Please select your relationship to the wearer.';
      if (!mobile.trim() || mobile.trim().length < 7) {
        newErrors.mobile = 'A valid primary mobile telephone number is required.';
      }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = 'Please provide a valid email format or leave empty.';
      }
      if (hasSecondaryContact) {
        if (!secName.trim()) newErrors.secName = 'Secondary contact name is required when enabled.';
        if (!secPhone.trim() || secPhone.trim().length < 7) {
          newErrors.secPhone = 'Secondary contact phone number is required.';
        }
      }
    }

    if (step === 2) {
      if (!childName.trim()) newErrors.childName = 'Wearer’s full name is required.';
      if (!bandCode.trim()) {
        newErrors.bandCode = 'Printed band reference code is required.';
      } else {
        const formattedCode = bandCode.trim().toUpperCase();
        const existingBand = bands.find(
          (b) => b.referenceCode.replace(/[\s-]/g, '').toUpperCase() === formattedCode.replace(/[\s-]/g, '')
        );

        if (existingBand) {
          if (existingBand.status === 'assigned') {
            newErrors.bandCode = 'This band reference is already registered. If you need a replacement or re-assignment, please contact our office.';
          } else if (existingBand.status === 'retired' || existingBand.status === 'lost') {
            newErrors.bandCode = 'This band reference has been retired or reported lost. Please contact our office.';
          }
        }
      }

      if (!vendorId) {
        newErrors.vendorId = 'Please select the vendor shop where you bought this band.';
      } else if (vendorId !== 'DIRECT' && !activeVendors.some((v) => v.id === vendorId)) {
        newErrors.vendorId = 'Selected vendor shop is no longer active. Please choose an active shop.';
      }
    }

    if (step === 3) {
      if (!selectedPlanId) {
        newErrors.planId = 'Please select a subscription plan.';
      }
    }

    if (step === 4) {
      if (paymentMethod === 'card') {
        const cardErrs = validateCardData(cardData);
        Object.assign(newErrors, cardErrs);
      }
    }

    if (step === 5) {
      if (!authorityConfirmed) {
        newErrors.authority = 'You must confirm that you are authorized to register for this individual.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 1 && !cardData.cardholderName && guardianName.trim()) {
        setCardData((prev) => ({ ...prev, cardholderName: guardianName.trim().toUpperCase() }));
      }
      setCurrentStep((prev) => Math.min(prev + 1, 5));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(5)) return;

    setIsSubmitting(true);

    const processingDelay = paymentMethod === 'card' ? 800 : 400;

    setTimeout(() => {
      const isCard = paymentMethod === 'card';
      const txnId = isCard ? `TXN-CARD-2026-${Math.floor(100000 + Math.random() * 900000)}` : undefined;

      const newRegistration = submitPublicRegistration({
        guardian: {
          fullName: guardianName.trim(),
          relationship,
          mobile: mobile.trim(),
          email: email.trim() || undefined,
          preferredLanguage: language,
          emergencyContact: hasSecondaryContact
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
          photoUrl: photoPreview || undefined,
        },
        bandCode: bandCode.toUpperCase().trim(),
        vendorId,
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
    }, processingDelay);
  };

  const selectedPlan = activePlans.find((p) => p.id === selectedPlanId);
  const selectedVendor = activeVendors.find((v) => v.id === vendorId);

  return (
    <div className="py-10 sm:py-16 bg-neutral-soft min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Breadcrumbs items={[{ label: 'Register' }]} className="mb-6" />

        {/* Page Header */}
        <div className="mb-8 text-center sm:text-left">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-mint-darker bg-mint-pale px-3 py-1 rounded-full mb-2.5 border border-emerald-300/40">
            Guided Registration
          </span>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-navy">
            Register a safety identification band.
          </h1>
          <p className="text-base text-content-body mt-2">
            Have your band ready. Add the wearer and emergency contact details, select your subscription plan, and complete card payment.
          </p>
        </div>

        {/* 5-Step Progress Indicator */}
        <div className="bg-white p-4 sm:p-5 rounded-brand border border-border-subtle shadow-subtle mb-8">
          <div className="flex items-center justify-between text-xs font-heading font-semibold">
            {[
              { num: 1, label: 'Contact' },
              { num: 2, label: 'Wearer & Band' },
              { num: 3, label: 'Choose Plan' },
              { num: 4, label: 'Card Payment' },
              { num: 5, label: 'Review & Submit' },
            ].map((step) => {
              const isCompleted = currentStep > step.num;
              const isCurrent = currentStep === step.num;

              return (
                <div key={step.num} className="flex-1 flex flex-col items-center text-center relative">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 transition-colors ${
                      isCompleted
                        ? 'bg-mint-darker text-white'
                        : isCurrent
                        ? 'bg-navy text-mint ring-4 ring-mint/30'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : step.num}
                  </div>
                  <span
                    className={`text-[10px] sm:text-xs truncate max-w-[65px] sm:max-w-none ${
                      isCurrent ? 'text-navy font-bold' : 'text-content-muted font-medium'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-navy h-full transition-all duration-300 rounded-full"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Main Step Form Card */}
        <div className="bg-white rounded-brand-lg border border-border-subtle shadow-card p-6 sm:p-10">
          
          {/* STEP 1: PRIMARY CONTACT DETAILS */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
                <div>
                  <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy">
                    Step 1 — Primary Contact Details
                  </h2>
                  <p className="text-sm text-content-muted mt-1">
                    Emergency contact details used by office staff to contact you immediately if assistance is requested.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleFillDemoGuardian}
                  className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#088F5B]" />
                  <span>Fill Demo Info</span>
                </button>
              </div>

              <div className="space-y-4">
                <FormField
                  label="Contact Full Name"
                  id="guardianName"
                  required
                  error={errors.guardianName}
                >
                  <Input
                    id="guardianName"
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    placeholder="e.g. Elena Vance"
                    error={!!errors.guardianName}
                  />
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    label="Relationship to Wearer"
                    id="relationship"
                    required
                    error={errors.relationship}
                  >
                    <Select
                      id="relationship"
                      value={relationship}
                      onChange={(e) => setRelationship(e.target.value as RelationshipType)}
                    >
                      <option value="Self (Wearer)">Self (Wearer)</option>
                      <option value="Parent / Guardian">Parent / Guardian</option>
                      <option value="Mother">Mother</option>
                      <option value="Father">Father</option>
                      <option value="Spouse / Partner">Spouse / Partner</option>
                      <option value="Son / Daughter">Son / Daughter</option>
                      <option value="Grandparent">Grandparent</option>
                      <option value="Caregiver / Nurse">Caregiver / Nurse</option>
                      <option value="Sibling">Sibling</option>
                      <option value="Legal Guardian">Legal Guardian</option>
                      <option value="Foster Parent">Foster Parent</option>
                      <option value="Emergency Contact">Emergency Contact</option>
                      <option value="Other Authorized Contact">Other Authorized Contact</option>
                    </Select>
                  </FormField>

                  <FormField
                    label="Primary Mobile Telephone"
                    id="mobile"
                    required
                    hint="For urgent voice calls if assistance is needed"
                    error={errors.mobile}
                  >
                    <Input
                      id="mobile"
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="e.g. +1 (555) 012-7819"
                      error={!!errors.mobile}
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    label="Email Address"
                    id="email"
                    hint="Optional for renewal and registration notice"
                    error={errors.email}
                  >
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="elena.vance@example.com"
                      error={!!errors.email}
                    />
                  </FormField>

                  <FormField
                    label="Preferred Contact Language"
                    id="language"
                    hint="Language used by office staff"
                  >
                    <Select
                      id="language"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                    >
                      {settings.availableLanguages.map((lang) => (
                        <option key={lang} value={lang}>
                          {lang}
                        </option>
                      ))}
                    </Select>
                  </FormField>
                </div>

                {/* Optional Secondary Contact Toggle */}
                <div className="pt-4 border-t border-border-subtle">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={hasSecondaryContact}
                      onChange={(e) => setHasSecondaryContact(e.target.checked)}
                      className="w-4 h-4 rounded text-navy focus:ring-navy"
                    />
                    <span className="text-sm font-semibold text-navy">
                      Add an additional authorized emergency contact (Recommended)
                    </span>
                  </label>

                  {hasSecondaryContact && (
                    <div className="mt-4 p-4 rounded-brand bg-neutral-soft border border-border-subtle space-y-3 animate-in fade-in">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField label="Contact Full Name" required error={errors.secName}>
                          <Input
                            value={secName}
                            onChange={(e) => setSecName(e.target.value)}
                            placeholder="e.g. Marcus Vance"
                            error={!!errors.secName}
                          />
                        </FormField>

                        <FormField label="Relationship" required>
                          <Select
                            value={secRelationship}
                            onChange={(e) => setSecRelationship(e.target.value)}
                          >
                            <option value="Spouse / Partner">Spouse / Partner</option>
                            <option value="Father">Father</option>
                            <option value="Mother">Mother</option>
                            <option value="Son / Daughter">Son / Daughter</option>
                            <option value="Grandparent">Grandparent</option>
                            <option value="Caregiver / Nurse">Caregiver / Nurse</option>
                            <option value="Sibling">Sibling</option>
                            <option value="Aunt / Uncle">Aunt / Uncle</option>
                            <option value="Other Authorized">Other Authorized Contact</option>
                          </Select>
                        </FormField>
                      </div>

                      <FormField label="Emergency Telephone" required error={errors.secPhone}>
                        <Input
                          type="tel"
                          value={secPhone}
                          onChange={(e) => setSecPhone(e.target.value)}
                          placeholder="e.g. +1 (555) 012-7820"
                          error={!!errors.secPhone}
                        />
                      </FormField>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 flex justify-end">
                <Button onClick={handleNext} variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Continue to Wearer &amp; Band
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: WEARER AND BAND */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
                <div>
                  <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy">
                    Step 2 — Wearer &amp; Band Information
                  </h2>
                  <p className="text-sm text-content-muted mt-1">
                    Identify who will wear the band and attribute the purchase to your local retailer.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleFillDemoChild('W4Y-7821-K9')}
                  className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#088F5B]" />
                  <span>Fill Demo Wearer</span>
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    label="Wearer’s Full Name"
                    id="childName"
                    required
                    hint="First name or full name of person wearing band"
                    error={errors.childName}
                  >
                    <Input
                      id="childName"
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      placeholder="e.g. Lucas Vance"
                      error={!!errors.childName}
                    />
                  </FormField>

                  <FormField label="Category / Age Group" id="ageRange" hint="Select group / demographic">
                    <Select
                      id="ageRange"
                      value={ageRange}
                      onChange={(e) => setAgeRange(e.target.value)}
                    >
                      <option value="Child (0 – 12 years)">Child (0 – 12 years)</option>
                      <option value="Teen (13 – 17 years)">Teen (13 – 17 years)</option>
                      <option value="Adult (18 – 64 years)">Adult (18 – 64 years)</option>
                      <option value="Senior (65+ years)">Senior (65+ years)</option>
                      <option value="Medical / Memory Support">Medical / Memory Support</option>
                      <option value="Outdoor / Athlete / Traveler">Outdoor / Athlete / Traveler</option>
                      <option value="Special Care / Other">Special Care / Other</option>
                    </Select>
                  </FormField>
                </div>

                {/* Printed Band Reference Code */}
                <FormField
                  label="Existing Printed Band Reference"
                  id="bandCode"
                  required
                  hint="Enter the unique code printed on your band (e.g. W4Y-7821-K9)"
                  error={errors.bandCode}
                >
                  <Input
                    id="bandCode"
                    value={bandCode}
                    onChange={handleBandCodeChange}
                    placeholder="W4Y-XXXX-XX"
                    className="font-mono uppercase font-semibold text-navy tracking-wider"
                    error={!!errors.bandCode}
                  />
                </FormField>

                <div className="flex items-center gap-2 flex-wrap text-[11px] text-content-muted">
                  <span>Demo Available Codes:</span>
                  {['W4Y-7821-K9', 'W4Y-9014-P3', 'W4Y-8833-Z1'].map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setBandCode(code)}
                      className="font-mono bg-slate-100 hover:bg-slate-200 text-navy px-1.5 py-0.5 rounded border border-slate-300"
                    >
                      {code}
                    </button>
                  ))}
                </div>

                {/* Vendor Dropdown */}
                <FormField
                  label="Purchased From (Vendor Shop)"
                  id="vendorId"
                  required
                  hint="Select the authorized retailer where you bought the band"
                  error={errors.vendorId}
                >
                  {activeVendors.length > 0 ? (
                    <Select
                      id="vendorId"
                      value={vendorId}
                      onChange={(e) => setVendorId(e.target.value)}
                      error={!!errors.vendorId}
                    >
                      {activeVendors.map((vendor) => (
                        <option key={vendor.id} value={vendor.id}>
                          {vendor.shopName} — {vendor.branch}
                        </option>
                      ))}
                      {settings.directPurchaseEnabled && (
                        <option value="DIRECT">Purchased directly from We 4 You Office</option>
                      )}
                    </Select>
                  ) : (
                    <div className="p-4 bg-amber-50 rounded-brand border border-amber-200 text-xs text-amber-900">
                      No vendor shops are currently available in the active directory. Please{' '}
                      <Link to="/contact" className="underline font-semibold">
                        contact our office
                      </Link>{' '}
                      to register your band.
                    </div>
                  )}
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Purchase Date" id="purchaseDate" hint="Approximate date of band purchase">
                    <Input
                      id="purchaseDate"
                      type="date"
                      value={purchaseDate}
                      onChange={(e) => setPurchaseDate(e.target.value)}
                    />
                  </FormField>

                  <FormField label="Receipt Reference" id="receiptRef" hint="Optional shop invoice / receipt #">
                    <Input
                      id="receiptRef"
                      value={receiptRef}
                      onChange={(e) => setReceiptRef(e.target.value)}
                      placeholder="e.g. REC-8910"
                    />
                  </FormField>
                </div>
              </div>

              <div className="pt-6 flex items-center justify-between">
                <Button onClick={handleBack} variant="outline" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Back
                </Button>
                <Button onClick={handleNext} variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Continue to Choose Plan
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: CHOOSE PLAN */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="pb-4 border-b border-border-subtle">
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy">
                  Step 3 — Choose Service Subscription
                </h2>
                <p className="text-sm text-content-muted mt-1">
                  Select your desired office intermediary coverage duration.
                </p>
              </div>

              {errors.planId && (
                <div className="p-3 bg-red-50 text-red-700 text-xs rounded-brand border border-red-200">
                  {errors.planId}
                </div>
              )}

              <div className="space-y-4">
                {activePlans.map((plan) => {
                  const isSelected = selectedPlanId === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`p-5 rounded-brand border-2 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isSelected
                          ? 'border-navy bg-mint-pale/30 ring-2 ring-navy/10'
                          : 'border-border-subtle bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-bold text-base text-navy">
                            {plan.name}
                          </span>
                          {plan.isProvisional && (
                            <span className="text-[10px] uppercase font-semibold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                              Provisional
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-content-muted max-w-md">
                          {plan.description}
                        </p>
                        <span className="text-xs font-medium text-navy block pt-1">
                          Duration: {plan.durationMonths} months coverage
                        </span>
                      </div>

                      <div className="text-left sm:text-right flex-shrink-0">
                        <span className="text-lg sm:text-xl font-heading font-bold text-navy block">
                          {plan.priceFormatted}
                        </span>
                        <span
                          className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mt-1.5 ${
                            isSelected
                              ? 'bg-navy text-mint'
                              : 'bg-neutral-soft text-content-muted border'
                          }`}
                        >
                          {isSelected ? 'Selected' : 'Select Plan'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-6 flex items-center justify-between">
                <Button onClick={handleBack} variant="outline" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Back
                </Button>
                <Button onClick={handleNext} variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Continue to Card Payment
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: CARD PAYMENT & CHECKOUT */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="pb-4 border-b border-border-subtle">
                <span className="inline-block text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded mb-1">
                  Instant Authorization
                </span>
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy">
                  Step 4 — Subscription Payment
                </h2>
                <p className="text-sm text-content-muted mt-1">
                  Enter your card details for instant payment confirmation and registry activation.
                </p>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-3">
                <label className="text-xs font-bold uppercase tracking-wider text-content-muted block">
                  Select Payment Method
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: Card Payment */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 rounded-brand border-2 text-left transition-all flex flex-col justify-between ${
                      paymentMethod === 'card'
                        ? 'border-navy bg-mint-pale/30 ring-2 ring-navy/10'
                        : 'border-border-subtle bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className={`w-5 h-5 ${paymentMethod === 'card' ? 'text-navy' : 'text-slate-400'}`} />
                        <span className="font-heading font-bold text-navy text-sm">
                          Credit / Debit Card
                        </span>
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded">
                        Instant
                      </span>
                    </div>
                    <p className="text-[11px] text-content-muted mt-2">
                      Instant acceptance &amp; immediate subscription activation with official digital card receipt.
                    </p>
                  </button>

                  {/* Option 2: Offline Store Voucher */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('offline_voucher')}
                    className={`p-4 rounded-brand border-2 text-left transition-all flex flex-col justify-between ${
                      paymentMethod === 'offline_voucher'
                        ? 'border-navy bg-mint-pale/30 ring-2 ring-navy/10'
                        : 'border-border-subtle bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className={`w-5 h-5 ${paymentMethod === 'offline_voucher' ? 'text-navy' : 'text-slate-400'}`} />
                        <span className="font-heading font-bold text-navy text-sm">
                          Offline Store Voucher
                        </span>
                      </div>
                      <span className="text-[10px] uppercase font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        Manual
                      </span>
                    </div>
                    <p className="text-[11px] text-content-muted mt-2">
                      Pay in-store or bank transfer; requires manual staff receipt matching.
                    </p>
                  </button>
                </div>
              </div>

              {/* Conditional Payment Method Content */}
              {paymentMethod === 'card' ? (
                <CardPaymentForm
                  cardData={cardData}
                  onChange={setCardData}
                  errors={errors}
                  planAmountFormatted={selectedPlan?.priceFormatted}
                  planName={selectedPlan?.name}
                  isProcessing={isSubmitting}
                />
              ) : (
                <div className="p-5 bg-neutral-soft rounded-brand border border-border-subtle space-y-2.5">
                  <div className="flex items-center gap-2 text-navy font-semibold text-sm">
                    <Clock className="w-4 h-4 text-navy" />
                    <span>Manual Store Voucher Verification</span>
                  </div>
                  <p className="text-xs text-content-body leading-relaxed">
                    Submitting with offline payment will queue your registration for manual staff review. Your coverage will activate once our office verifies your vendor purchase receipt or payment voucher.
                  </p>
                </div>
              )}

              <div className="pt-6 flex items-center justify-between">
                <Button onClick={handleBack} variant="outline" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Back
                </Button>
                <Button onClick={handleNext} variant="primary" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Continue to Review &amp; Confirm
                </Button>
              </div>
            </div>
          )}

          {/* STEP 5: REVIEW AND SUBMIT */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="pb-4 border-b border-border-subtle">
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy">
                  Step 5 — Final Review &amp; Confirmation
                </h2>
                <p className="text-sm text-content-muted mt-1">
                  Please review your details and confirm your subscription payment.
                </p>
              </div>

              {/* Review Summary Blocks with Edit buttons */}
              <div className="space-y-4">
                {/* Block 1: Contact Details */}
                <div className="bg-neutral-soft p-4 rounded-brand border border-border-subtle flex items-start justify-between">
                  <div className="space-y-1 text-xs">
                    <span className="font-heading font-bold text-navy text-sm block">
                      Primary Contact Details
                    </span>
                    <p className="text-content-body">
                      <strong>Name:</strong> {guardianName} ({relationship})
                    </p>
                    <p className="text-content-body">
                      <strong>Mobile:</strong> {mobile} | <strong>Language:</strong> {language}
                    </p>
                    {email && (
                      <p className="text-content-body">
                        <strong>Email:</strong> {email}
                      </p>
                    )}
                    {hasSecondaryContact && secName && (
                      <p className="text-content-body pt-1 text-slate-600">
                        <strong>Emergency Backup:</strong> {secName} ({secRelationship}, {secPhone})
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="text-xs font-semibold text-navy hover:underline flex-shrink-0"
                  >
                    Edit
                  </button>
                </div>

                {/* Block 2: Wearer & Band Details */}
                <div className="bg-neutral-soft p-4 rounded-brand border border-border-subtle flex items-start justify-between">
                  <div className="space-y-1 text-xs">
                    <span className="font-heading font-bold text-navy text-sm block">
                      Wearer &amp; Band Details
                    </span>
                    <p className="text-content-body">
                      <strong>Wearer Name:</strong> {childName} ({ageRange})
                    </p>
                    <p className="text-content-body">
                      <strong>Band Reference:</strong>{' '}
                      <span className="font-mono font-bold bg-mint-pale px-1.5 py-0.5 rounded text-navy border border-emerald-300">
                        {bandCode}
                      </span>
                    </p>
                    <p className="text-content-body">
                      <strong>Purchased From:</strong>{' '}
                      {vendorId === 'DIRECT'
                        ? 'Purchased directly from We 4 You'
                        : `${selectedVendor?.shopName || 'Partner Store'} (${selectedVendor?.branch || ''})`}
                    </p>
                  </div>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="text-xs font-semibold text-navy hover:underline flex-shrink-0"
                  >
                    Edit
                  </button>
                </div>

                {/* Block 3: Selected Subscription & Payment */}
                <div className="bg-neutral-soft p-4 rounded-brand border border-border-subtle flex items-start justify-between">
                  <div className="space-y-1 text-xs">
                    <span className="font-heading font-bold text-navy text-sm block">
                      Subscription &amp; Payment
                    </span>
                    <p className="text-content-body">
                      <strong>Plan:</strong> {selectedPlan?.name || 'Selected Plan'} ({selectedPlan?.durationMonths} months coverage)
                    </p>
                    <p className="text-content-body font-semibold text-navy">
                      <strong>Amount Due:</strong> {selectedPlan?.priceFormatted}
                    </p>
                    <div className="pt-1 flex items-center gap-2">
                      <span className="text-content-muted">Payment Method:</span>
                      {paymentMethod === 'card' ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[11px] border border-emerald-200">
                          <CreditCard className="w-3.5 h-3.5 text-[#088F5B]" />
                          {cardData.brand || 'Card'} ending in {cardData.last4 || '4242'} (Instant Confirmation)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[11px] border border-amber-200">
                          <Clock className="w-3.5 h-3.5" />
                          Offline Voucher Check
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentStep(4)}
                    className="text-xs font-semibold text-navy hover:underline flex-shrink-0"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {/* Legal Acknowledgment & Consent */}
              <div className="pt-3 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={authorityConfirmed}
                    onChange={(e) => setAuthorityConfirmed(e.target.checked)}
                    className="w-4 h-4 rounded text-navy focus:ring-navy mt-1"
                  />
                  <span className="text-xs sm:text-sm text-content-body leading-normal">
                    I confirm that I am registering this safety band with full authorization for the individual named above. I acknowledge that registration establishes an emergency contact identification record for central office assistance in accordance with the{' '}
                    <Link to="/privacy" target="_blank" className="text-navy font-semibold underline">
                      Privacy Policy
                    </Link>{' '}
                    and{' '}
                    <Link to="/terms" target="_blank" className="text-navy font-semibold underline">
                      Terms of Service
                    </Link>
                    .
                  </span>
                </label>

                {errors.authority && (
                  <p className="text-xs text-red-600 font-medium">{errors.authority}</p>
                )}
              </div>

              {paymentMethod === 'card' ? (
                <div className="p-4 bg-emerald-50/70 rounded-brand border border-emerald-300/60 text-xs text-emerald-950 flex items-start gap-2.5 shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-[#088F5B] flex-shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <strong>Instant Card Payment Guarantee:</strong> Clicking below will authorize <strong>{selectedPlan?.priceFormatted}</strong> on your {cardData.brand || 'card'} ending in {cardData.last4 || '4242'}. Your payment receipt and registration reference will be generated and confirmed immediately.
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-mint-pale/50 rounded-brand border border-emerald-300/40 text-xs text-content-muted leading-relaxed">
                  <strong>Simulated Submission:</strong> Your registration reference will be generated and routed directly into the administrator demonstration queue with a status of <em>pending verification</em>.
                </div>
              )}

              <div className="pt-6 flex items-center justify-between">
                <Button onClick={handleBack} variant="outline" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  variant="primary"
                  size="lg"
                  isLoading={isSubmitting}
                  leftIcon={paymentMethod === 'card' ? <Lock className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                >
                  {paymentMethod === 'card'
                    ? `Pay ${selectedPlan?.priceFormatted || '$29.00'} & Confirm`
                    : 'Submit Registration'}
                </Button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
