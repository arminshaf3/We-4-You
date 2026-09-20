import React from 'react';
import { CreditCard, ShieldCheck, Lock, Sparkles, AlertCircle } from 'lucide-react';
import { FormField, Input } from './FormField';

export interface CardFormData {
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  cvv: string;
  brand: string;
  last4: string;
}

export interface CardPaymentFormProps {
  cardData: CardFormData;
  onChange: (updated: CardFormData) => void;
  errors?: { [key: string]: string };
  planAmountFormatted?: string;
  planName?: string;
  isProcessing?: boolean;
  compact?: boolean;
}

// Utility to detect card brand
export const detectCardBrand = (number: string): string => {
  const clean = number.replace(/\s+/g, '');
  if (/^4/.test(clean)) return 'Visa';
  if (/^5[1-5]/.test(clean) || /^2[2-7]/.test(clean)) return 'Mastercard';
  if (/^3[47]/.test(clean)) return 'Amex';
  if (/^6(?:011|5)/.test(clean)) return 'Discover';
  return 'Card';
};

// Format Card Number with automatic spacing
export const formatCardNumber = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  const parts = [];
  for (let i = 0; i < digits.length; i += 4) {
    parts.push(digits.slice(i, i + 4));
  }
  return parts.join(' ');
};

// Format Expiration Date (MM/YY)
export const formatExpiry = (value: string): string => {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return digits;
};

// Validate Card Details
export const validateCardData = (data: CardFormData): { [key: string]: string } => {
  const errs: { [key: string]: string } = {};
  const cleanNum = data.cardNumber.replace(/\s+/g, '');
  
  if (!cleanNum || cleanNum.length < 13 || cleanNum.length > 19) {
    errs.cardNumber = 'Please enter a valid 16-digit card number.';
  }

  if (!data.cardholderName.trim()) {
    errs.cardholderName = 'Cardholder name as printed on card is required.';
  }

  if (!data.expiryDate || !/^\d{2}\/\d{2}$/.test(data.expiryDate)) {
    errs.expiryDate = 'Enter valid MM/YY.';
  } else {
    const [mStr, yStr] = data.expiryDate.split('/');
    const month = parseInt(mStr, 10);
    const year = parseInt('20' + yStr, 10);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;

    if (month < 1 || month > 12) {
      errs.expiryDate = 'Invalid month (01-12).';
    } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
      errs.expiryDate = 'Card has expired.';
    }
  }

  const cleanCvv = data.cvv.replace(/\D/g, '');
  if (!cleanCvv || cleanCvv.length < 3 || cleanCvv.length > 4) {
    errs.cvv = 'Enter 3 or 4 digits.';
  }

  return errs;
};

export const CardPaymentForm: React.FC<CardPaymentFormProps> = ({
  cardData,
  onChange,
  errors = {},
  planAmountFormatted,
  planName,
  isProcessing = false,
  compact = false,
}) => {
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    const brand = detectCardBrand(formatted);
    const clean = formatted.replace(/\s+/g, '');
    const last4 = clean.length >= 4 ? clean.slice(-4) : clean;

    onChange({
      ...cardData,
      cardNumber: formatted,
      brand,
      last4,
    });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...cardData,
      cardholderName: e.target.value.toUpperCase(),
    });
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value);
    onChange({
      ...cardData,
      expiryDate: formatted,
    });
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 4);
    onChange({
      ...cardData,
      cvv: digits,
    });
  };

  // Demo auto-fill helper
  const handleAutoFillDemo = () => {
    onChange({
      cardNumber: '4242 4242 4242 4242',
      cardholderName: 'SARAH WATSON',
      expiryDate: '12/28',
      cvv: '849',
      brand: 'Visa',
      last4: '4242',
    });
  };

  return (
    <div className={`space-y-3.5 bg-white ${compact ? 'p-3.5 sm:p-4' : 'p-4 sm:p-5'} rounded-brand border border-border-subtle shadow-subtle`}>
      
      {/* Header & Brand Badges */}
      <div className="flex flex-row items-center justify-between gap-2 pb-2.5 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-mint-pale flex items-center justify-center text-[#088F5B]">
            <CreditCard className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="font-heading font-bold text-navy text-xs sm:text-sm">
              Credit / Debit Card
            </h4>
            <p className="text-[10px] text-content-muted">
              Instant activation &amp; digital receipt
            </p>
          </div>
        </div>

        {/* Quick Demo Autofill Button */}
        <button
          type="button"
          onClick={handleAutoFillDemo}
          disabled={isProcessing}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded transition-colors shadow-sm"
          title="Fills demo testing card info instantly"
        >
          <Sparkles className="w-3 h-3 text-[#088F5B]" />
          <span>Demo Card (4242)</span>
        </button>
      </div>

      {/* Plan Amount Summary Pill if provided */}
      {planAmountFormatted && (
        <div className="flex items-center justify-between p-2.5 bg-neutral-soft rounded-brand border border-border-subtle text-xs">
          <span className="text-content-body font-medium">
            {planName ? `Plan: ${planName}` : 'Subscription Charge'}
          </span>
          <span className="font-heading font-bold text-navy text-sm">
            {planAmountFormatted}
          </span>
        </div>
      )}

      {/* Sleek Card Preview Display */}
      <div className="p-3 rounded-brand bg-gradient-to-br from-navy via-[#1e293b] to-slate-900 text-white shadow-sm space-y-1.5 relative overflow-hidden">
        <div className="flex items-center justify-between text-[9px] text-mint uppercase tracking-wider font-semibold">
          <span>WE 4 YOU SECURE INTERMEDIARY</span>
          <span className="bg-white/10 px-1.5 py-0.2 rounded border border-white/20 text-white font-bold">
            {cardData.brand || 'CARD'}
          </span>
        </div>

        <div className="font-mono text-sm sm:text-base tracking-widest text-slate-100 py-0.5">
          {cardData.cardNumber || '•••• •••• •••• ••••'}
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-300">
          <div>
            <span className="text-[8px] uppercase text-slate-400 block">CARDHOLDER</span>
            <span className="font-semibold text-slate-100 truncate max-w-[140px] block">
              {cardData.cardholderName || 'NAME ON CARD'}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[8px] uppercase text-slate-400 block">EXPIRES</span>
            <span className="font-mono font-semibold text-slate-100 block">
              {cardData.expiryDate || 'MM/YY'}
            </span>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-3 pt-0.5">
        
        {/* Card Number */}
        <FormField
          label="Card Number"
          id="cardNumber"
          required
          hint="16 digits (Visa, Mastercard, Amex, Discover)"
          error={errors.cardNumber}
        >
          <div className="relative flex items-center">
            <Input
              id="cardNumber"
              value={cardData.cardNumber}
              onChange={handleNumberChange}
              placeholder="4532 •••• •••• 8920"
              className="font-mono text-xs sm:text-sm tracking-wider pr-16"
              error={!!errors.cardNumber}
              disabled={isProcessing}
              maxLength={19}
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-navy border border-slate-200 uppercase pointer-events-none">
              {cardData.brand}
            </div>
          </div>
        </FormField>

        {/* Cardholder Name */}
        <FormField
          label="Cardholder Full Name"
          id="cardholderName"
          required
          hint="Name as printed on front of card"
          error={errors.cardholderName}
        >
          <Input
            id="cardholderName"
            value={cardData.cardholderName}
            onChange={handleNameChange}
            placeholder="SARAH WATSON"
            className="uppercase font-medium text-xs sm:text-sm"
            error={!!errors.cardholderName}
            disabled={isProcessing}
          />
        </FormField>

        {/* Expiry and CVV (Side by Side 2-Column with perfectly matched label and hint heights) */}
        <div className="grid grid-cols-2 gap-3 items-start">
          <FormField
            label="Expiration Date"
            id="expiryDate"
            required
            hint="MM / YY"
            error={errors.expiryDate}
          >
            <Input
              id="expiryDate"
              value={cardData.expiryDate}
              onChange={handleExpiryChange}
              placeholder="MM/YY"
              className="font-mono text-center text-xs sm:text-sm"
              error={!!errors.expiryDate}
              disabled={isProcessing}
              maxLength={5}
            />
          </FormField>

          <FormField
            label="Security (CVV)"
            id="cvv"
            required
            hint="3 or 4 digits"
            error={errors.cvv}
          >
            <div className="relative flex items-center">
              <Input
                id="cvv"
                type="password"
                value={cardData.cvv}
                onChange={handleCvvChange}
                placeholder="•••"
                className="font-mono text-center tracking-widest pr-8 text-xs sm:text-sm"
                error={!!errors.cvv}
                disabled={isProcessing}
                maxLength={4}
              />
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
            </div>
          </FormField>
        </div>

      </div>

      {/* Security Reassurance & Confirmation Badge */}
      <div className="p-3 bg-mint-pale/40 rounded-brand border border-emerald-300/40 text-[11px] text-content-body flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-[#088F5B] flex-shrink-0 mt-0.5" />
        <div className="leading-snug">
          <span className="font-semibold text-navy">Instant Card Payment Acceptance: </span>
          Upon submission, your card payment will be verified immediately and your official subscription payment receipt will be generated and confirmed.
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-content-muted pt-1 border-t border-border-subtle">
        <span className="flex items-center gap-1 text-slate-600">
          <Lock className="w-3 h-3 text-[#088F5B]" /> 256-Bit SSL Encrypted
        </span>
        <span className="text-slate-500">PCI-DSS Compliant Authorization</span>
      </div>

    </div>
  );
};
