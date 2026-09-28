import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { FormField, Input, Select, Textarea } from '../../components/common/FormField';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { CardPaymentForm, CardFormData, validateCardData } from '../../components/common/CardPaymentForm';
import { useApp } from '../../context/AppContext';
import { supabaseService } from '../../services/supabaseService';
import { calculateDetailedAge, BLOOD_GROUPS, GENDER_OPTIONS } from '../../utils/ageCalculator';
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
  Calendar,
  Heart,
  Camera,
  Upload,
  Trash2,
  MapPin,
  FileText,
  Activity,
  AlertTriangle,
  Info,
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
  const [showMedicalSection, setShowMedicalSection] = useState(false);

  // Form State - Primary Contact & Guardian Details
  const [guardianName, setGuardianName] = useState('');
  const [relationship, setRelationship] = useState<RelationshipType>('Parent / Guardian');
  const [mobile, setMobile] = useState('');
  const [secondaryPhone, setSecondaryPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [guardianNationalId, setGuardianNationalId] = useState('');
  const [language, setLanguage] = useState(settings.availableLanguages[0] || 'English');

  // Backup Emergency Contact (Secondary)
  const [secName, setSecName] = useState('');
  const [secRelationship, setSecRelationship] = useState('Spouse / Partner');
  const [secPhone, setSecPhone] = useState('');

  // Form State - Wearer Details
  const [childName, setChildName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [calculatedAge, setCalculatedAge] = useState('');
  const [ageRange, setAgeRange] = useState('Child (0 – 12 years)');
  const [bloodGroup, setBloodGroup] = useState<string>('Unknown / Not Tested');
  const [gender, setGender] = useState<string>('prefer_not_to_say');
  const [wearerNationalId, setWearerNationalId] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [specialNeeds, setSpecialNeeds] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Band & Retail Attribution
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

  // Live Auto-Calculate Age whenever birthdate changes
  const handleBirthDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setBirthDate(val);
    if (!val) {
      setCalculatedAge('');
      return;
    }
    const result = calculateDetailedAge(val);
    if (result.isValid) {
      setCalculatedAge(result.formattedAge);
      setAgeRange(result.suggestedCategory);
      if (errors.birthDate) {
        setErrors((prev) => ({ ...prev, birthDate: '' }));
      }
    } else {
      setCalculatedAge(result.formattedAge || 'Invalid date');
    }
  };

  // Photo Upload Handler with live local preview & Supabase upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsUploadingPhoto(true);
    try {
      const uploadedUrl = await supabaseService.uploadWearerPhoto(file);
      if (uploadedUrl) {
        setPhotoUrl(uploadedUrl);
        addToast('success', 'Photo Attached', 'Wearer photo saved for recovery identification.');
      } else {
        setPhotoUrl(URL.createObjectURL(file));
      }
    } catch {
      setPhotoUrl(URL.createObjectURL(file));
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoUrl('');
    setPhotoPreview(null);
  };

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

    // Birth date validation (Required to compute age)
    if (!birthDate.trim()) {
      newErrors.birthDate = 'Date of birth is required.';
    } else {
      const dateCheck = calculateDetailedAge(birthDate);
      if (!dateCheck.isValid) {
        newErrors.birthDate = 'Please select a valid past date of birth.';
      }
    }

    // Contact person validation
    if (!guardianName.trim()) {
      newErrors.guardianName = 'Primary contact full name is required.';
    }

    if (!mobile.trim() || !phoneRegex.test(mobile.trim())) {
      newErrors.mobile = 'A valid primary mobile phone number is required (7-20 digits).';
    }

    if (secondaryPhone.trim() && !phoneRegex.test(secondaryPhone.trim())) {
      newErrors.secondaryPhone = 'Please provide a valid secondary telephone number or leave empty.';
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
            secondaryPhone: secondaryPhone.trim() || undefined,
            email: email.trim() || undefined,
            address: address.trim() || undefined,
            nationalId: guardianNationalId.trim() || undefined,
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
            birthDate: birthDate.trim() || undefined,
            calculatedAge: calculatedAge.trim() || undefined,
            ageRange,
            gender: gender || 'prefer_not_to_say',
            bloodGroup: bloodGroup || 'Unknown / Not Tested',
            nationalId: wearerNationalId.trim() || undefined,
            medicalNotes: medicalNotes.trim() || undefined,
            specialNeeds: specialNeeds.trim() || undefined,
            photoUrl: photoUrl || photoPreview || undefined,
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
            childBirthDate: birthDate.trim(),
            childAge: calculatedAge.trim(),
            childBloodGroup: bloodGroup,
            birthDate: birthDate.trim(),
            calculatedAge: calculatedAge.trim(),
            bloodGroup,
            bandCode: bandCode.toUpperCase().trim(),
            guardianName: guardianName.trim(),
            guardianPhone: mobile.trim(),
            guardianAddress: address.trim(),
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

            {/* Card 2: Wearer Profile & Vital Safety Details */}
            <div className="bg-white rounded-brand border border-border-subtle shadow-subtle p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-navy/5 text-navy flex items-center justify-center">
                    <User className="w-4 h-4 text-navy" />
                  </div>
                  <div>
                    <h2 className="text-sm font-heading font-bold text-navy">2. Wearer Identification &amp; Demographics</h2>
                    <p className="text-2xs text-content-muted">Details for the individual who will wear the band</p>
                  </div>
                </div>
                <span className="text-2xs font-semibold text-brand-navy bg-slate-100 px-2.5 py-0.5 rounded-full">
                  Emergency Recovery Profile
                </span>
              </div>

              {/* Photo Upload Section */}
              <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-dashed border-slate-300 bg-white flex items-center justify-center flex-shrink-0 shadow-2xs">
                  {photoPreview ? (
                    <img src={photoPreview} alt="Wearer preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center p-2 text-slate-400">
                      <Camera className="w-6 h-6 mx-auto mb-0.5 text-slate-400" />
                      <span className="text-[10px] font-medium block">Add Photo</span>
                    </div>
                  )}
                  {isUploadingPhoto && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-[10px] font-medium">
                      Uploading...
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center sm:text-left space-y-1.5">
                  <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-border-subtle text-navy text-xs font-semibold hover:bg-slate-50 shadow-2xs transition-colors">
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                      <span>{photoPreview ? 'Change Photo' : 'Upload Wearer Photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                    {photoPreview && (
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-700 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-content-muted leading-relaxed">
                    Optional portrait photo helps emergency responders quickly identify and reassure the wearer when found.
                  </p>
                </div>
              </div>

              {/* Name and Date of Birth */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Wearer’s Full Name" required error={errors.childName} hint="First and last name of the wearer">
                  <Input
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    placeholder="e.g. Lucas Vance"
                    error={!!errors.childName}
                  />
                </FormField>

                <div>
                  <FormField label="Date of Birth" required error={errors.birthDate} hint="Calculates age automatically">
                    <div className="relative">
                      <Input
                        type="date"
                        max={new Date().toISOString().substring(0, 10)}
                        value={birthDate}
                        onChange={handleBirthDateChange}
                        error={!!errors.birthDate}
                        className="w-full"
                      />
                    </div>
                  </FormField>
                  
                  {/* Live Age Badge */}
                  {calculatedAge && (
                    <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold shadow-2xs animate-in fade-in">
                      <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Live Age: <strong>{calculatedAge}</strong> • {ageRange}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Demographics: Blood Group, Gender, Age Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <FormField label="Blood Group (Optional)" hint="Emergency medical reference">
                  <Select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </Select>
                </FormField>

                <FormField label="Gender / Identity (Optional)">
                  <Select value={gender} onChange={(e) => setGender(e.target.value)}>
                    {GENDER_OPTIONS.map((g) => (
                      <option key={g.value} value={g.value}>{g.label}</option>
                    ))}
                  </Select>
                </FormField>

                <FormField label="Age Category" hint="Target safety group">
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

              {/* National ID / Student ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Wearer ID / Student / Passport No. (Optional)" hint="Official identifier if available">
                  <Input
                    value={wearerNationalId}
                    onChange={(e) => setWearerNationalId(e.target.value)}
                    placeholder="e.g. STU-89210 or ID-49201"
                  />
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

              {/* Expandable Emergency Medical Notes */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowMedicalSection(!showMedicalSection)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy hover:underline focus:outline-none"
                >
                  {showMedicalSection ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  <span>{showMedicalSection ? 'Hide medical & care instructions' : '+ Add Emergency Medical Notes & Care Instructions (Optional)'}</span>
                </button>

                {showMedicalSection && (
                  <div className="mt-3 p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-3 animate-in fade-in">
                    <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Confidential Emergency Medical Notes</span>
                    </div>

                    <FormField label="Allergies, Medications or Conditions" hint="e.g. Severe peanut allergy, Asthma inhaler in bag, Diabetic, Autism spectrum">
                      <Input
                        value={medicalNotes}
                        onChange={(e) => setMedicalNotes(e.target.value)}
                        placeholder="e.g. Asthma, carry inhaler; allergic to penicillin"
                      />
                    </FormField>

                    <FormField label="Special Behavioral or Communication Notes" hint="e.g. Non-verbal, sensitive to loud sounds, wears glasses">
                      <Input
                        value={specialNeeds}
                        onChange={(e) => setSpecialNeeds(e.target.value)}
                        placeholder="e.g. Non-verbal, responds well to written notes"
                      />
                    </FormField>
                  </div>
                )}
              </div>
            </div>

            {/* Card 3: Full Primary Guardian & Emergency Contacts */}
            <div className="bg-white rounded-brand border border-border-subtle shadow-subtle p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-navy/5 text-navy flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-navy" />
                  </div>
                  <div>
                    <h2 className="text-sm font-heading font-bold text-navy">3. Full Guardian &amp; Emergency Contact Details</h2>
                    <p className="text-2xs text-content-muted">Primary guardians called immediately during an emergency incident</p>
                  </div>
                </div>
                <span className="text-2xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  Primary Responder
                </span>
              </div>

              {/* Primary Contact Name & Relationship */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Primary Guardian Full Name" required error={errors.guardianName} hint="Parent, spouse, or authorized guardian">
                  <Input
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    placeholder="e.g. Elena Vance"
                    error={!!errors.guardianName}
                  />
                </FormField>

                <FormField label="Relationship to Wearer" required>
                  <Select value={relationship} onChange={(e) => setRelationship(e.target.value as RelationshipType)}>
                    <option value="Parent / Guardian">Parent / Guardian</option>
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Spouse / Partner">Spouse / Partner</option>
                    <option value="Legal Guardian">Legal Guardian</option>
                    <option value="Caregiver / Nurse">Caregiver / Nurse</option>
                    <option value="Grandparent">Grandparent</option>
                    <option value="Son / Daughter">Son / Daughter</option>
                    <option value="Self (Wearer)">Self (Wearer)</option>
                    <option value="Other Authorized Contact">Other Authorized Contact</option>
                  </Select>
                </FormField>
              </div>

              {/* Phone Numbers: Primary & Secondary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Primary Emergency Mobile" required error={errors.mobile} hint="Called immediately upon band scan">
                  <Input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    placeholder="+1 (555) 012-7819"
                    error={!!errors.mobile}
                  />
                </FormField>

                <FormField label="Secondary / Alternative Phone (Optional)" error={errors.secondaryPhone} hint="Work or alternate mobile">
                  <Input
                    type="tel"
                    value={secondaryPhone}
                    onChange={(e) => setSecondaryPhone(e.target.value)}
                    placeholder="+1 (555) 012-7820"
                    error={!!errors.secondaryPhone}
                  />
                </FormField>
              </div>

              {/* Address and Guardian National ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Full Residential Address (Optional)" hint="Street, City, State, Postal Code">
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 742 Evergreen Terrace, Springfield, OR"
                  />
                </FormField>

                <FormField label="Guardian National ID / Passport No. (Optional)" hint="For identity verification">
                  <Input
                    value={guardianNationalId}
                    onChange={(e) => setGuardianNationalId(e.target.value)}
                    placeholder="e.g. ID-892182"
                  />
                </FormField>
              </div>

              {/* Optional Email & Backup Contact Toggle */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAdvancedContact(!showAdvancedContact)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-navy hover:underline focus:outline-none"
                >
                  {showAdvancedContact ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  <span>{showAdvancedContact ? 'Hide backup contact fields' : '+ Add Email & Secondary Backup Emergency Contact'}</span>
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
                      <FormField label="Secondary Backup Contact Name" hint="Grandparent, relative, neighbor">
                        <Input
                          value={secName}
                          onChange={(e) => setSecName(e.target.value)}
                          placeholder="e.g. Marcus Vance"
                        />
                      </FormField>

                      <FormField label="Secondary Contact Phone" error={errors.secPhone} hint="Backup telephone">
                        <Input
                          type="tel"
                          value={secPhone}
                          onChange={(e) => setSecPhone(e.target.value)}
                          placeholder="+1 (555) 012-7825"
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
