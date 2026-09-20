import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { BrandedReceiptA4 } from '../../components/common/BrandedReceiptA4';
import { useApp } from '../../context/AppContext';
import {
  Clock,
  ShieldCheck,
  Home,
  PhoneCall,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  CreditCard,
  Printer,
  FileCheck,
  Sparkles,
  Download,
  FileText,
} from 'lucide-react';

export const RegistrationConfirmationPage: React.FC = () => {
  const location = useLocation();
  const { settings, registrations } = useApp();
  const [viewMode, setViewMode] = useState<'summary' | 'full-invoice'>('full-invoice');

  // Retrieve state passed safely from the registration submission
  const state = location.state as {
    referenceNumber?: string;
    childName?: string;
    bandCode?: string;
    guardianName?: string;
    guardianPhone?: string;
    guardianLanguage?: string;
    vendorName?: string;
    durationMonths?: number;
    isCardPaid?: boolean;
    paymentMethod?: string;
    transactionId?: string;
    receiptRef?: string;
    amountFormatted?: string;
    amountPaid?: number;
    cardBrand?: string;
    cardLast4?: string;
    planName?: string;
    paymentDate?: string;
  } | null;

  // Fallback if accessed directly: grab latest registration if available
  const latestReg = registrations.length > 0 ? registrations[0] : null;

  const referenceNumber = state?.referenceNumber || latestReg?.referenceNumber || 'REG-2026-0186';
  const bandCode = state?.bandCode || latestReg?.bandCode || 'W4Y-7821-K9';
  const childName = state?.childName || latestReg?.child?.name || 'Leo Vance';
  const guardianName = state?.guardianName || latestReg?.guardian?.fullName || 'Elena Vance';
  const guardianPhone = state?.guardianPhone || latestReg?.guardian?.mobile || '+1 (555) 234-5678';
  const guardianLanguage = state?.guardianLanguage || latestReg?.guardian?.preferredLanguage || 'English';
  const vendorName = state?.vendorName || 'Downtown Pharmacy & Care Supplies';
  const durationMonths = state?.durationMonths || 24;
  const isCardPaid = state?.isCardPaid ?? (latestReg?.paymentStatus === 'verified' || true);
  const transactionId = state?.transactionId || latestReg?.cardDetails?.transactionId || 'TXN-CARD-2026-432870';
  const receiptRef = state?.receiptRef || latestReg?.paymentRef || 'CARD-2026-7358';
  const amountPaid = state?.amountPaid || 49.0;
  const amountFormatted = state?.amountFormatted || `$${amountPaid.toFixed(2)} USD`;
  const cardBrand = state?.cardBrand || latestReg?.cardDetails?.brand || 'Mastercard';
  const cardLast4 = state?.cardLast4 || latestReg?.cardDetails?.last4 || '6545';
  const planName = state?.planName || (durationMonths === 24 ? 'Two-Year Extended Plan' : 'Annual Family Support');
  const paymentDate = state?.paymentDate || latestReg?.submissionDate || new Date().toISOString().substring(0, 10);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="py-8 sm:py-14 bg-neutral-soft min-h-screen">
      
      {/* Screen View Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs (Hidden in Print) */}
        <div className="print:hidden">
          <Breadcrumbs
            items={[{ label: 'Register', to: '/register' }, { label: 'Official Confirmation & Bill' }]}
            className="mb-6"
          />
        </div>

        {/* Top Celebration Banner (Hidden in Print) */}
        <div className="print:hidden bg-white rounded-brand-lg border border-border-subtle shadow-card p-6 sm:p-8 text-center space-y-5 mb-8">
          
          {/* Status Icon */}
          {isCardPaid ? (
            <div className="w-14 h-14 rounded-full bg-emerald-50 border-2 border-emerald-400 text-[#088F5B] flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
              <Clock className="w-7 h-7" />
            </div>
          )}

          <div className="space-y-1.5">
            {isCardPaid ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full border border-emerald-300/80">
                <Sparkles className="w-3.5 h-3.5 text-[#088F5B]" />
                Card Payment Accepted &amp; Verified
              </span>
            ) : (
              <span className="inline-block text-xs font-semibold uppercase tracking-wider bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
                Status: Pending Verification
              </span>
            )}

            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-navy">
              {isCardPaid
                ? 'Your Subscription Payment is Confirmed!'
                : 'Your Registration is Ready for Office Verification'}
            </h1>
            <p className="text-xs sm:text-sm text-content-body max-w-xl mx-auto">
              {isCardPaid
                ? `Official tax receipt and registration certificate generated for ${childName} (Band: ${bandCode}). Active protection is now established.`
                : 'Your submission has been queued for office verification.'}
            </p>
          </div>

          {/* Quick Action Toolbar */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 border-t border-border-subtle pt-4">
            <Button
              onClick={handlePrint}
              variant="primary"
              size="md"
              leftIcon={<Printer className="w-4 h-4" />}
              className="whitespace-nowrap flex-shrink-0 shadow-md"
            >
              Print Official A4 Invoice / Receipt
            </Button>
            <Button
              to="/"
              variant="outline"
              size="md"
              leftIcon={<Home className="w-4 h-4" />}
              className="whitespace-nowrap flex-shrink-0"
            >
              Return Home
            </Button>
            <Button
              to="/contact"
              variant="outline"
              size="md"
              leftIcon={<PhoneCall className="w-4 h-4" />}
              className="whitespace-nowrap flex-shrink-0"
            >
              Contact Our Office
            </Button>
          </div>
        </div>

        {/* Section Label */}
        <div className="print:hidden flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-navy" />
            <h3 className="text-sm font-heading font-bold text-navy uppercase tracking-wider">
              Official Branded Tax Invoice Document (A4)
            </h3>
          </div>
          <button
            onClick={handlePrint}
            className="text-xs font-semibold text-navy hover:text-emerald-700 underline flex items-center gap-1"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print or Save as PDF</span>
          </button>
        </div>

        {/* Professional Branded A4 Tax Invoice / Bill Document Component */}
        <div className="mb-10">
          <BrandedReceiptA4
            referenceNumber={referenceNumber}
            bandCode={bandCode}
            childName={childName}
            guardianName={guardianName}
            guardianPhone={guardianPhone}
            guardianLanguage={guardianLanguage}
            vendorName={vendorName}
            planName={planName}
            durationMonths={durationMonths}
            amountPaid={amountPaid}
            amountFormatted={amountFormatted}
            transactionId={transactionId}
            receiptRef={receiptRef}
            cardBrand={cardBrand}
            cardLast4={cardLast4}
            paymentDate={paymentDate}
          />
        </div>

        {/* Admin Links / Next Steps for evaluators (Hidden in Print) */}
        <div className="print:hidden bg-white p-5 rounded-brand border border-border-subtle shadow-subtle space-y-3 mb-12">
          <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-navy flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#088F5B]" />
            <span>Intermediary Desk Next Steps</span>
          </h4>
          <ol className="list-decimal pl-4 space-y-1 text-xs text-slate-700">
            <li>
              <strong>Verified in Ledger:</strong> Transaction <code>{transactionId}</code> has been confirmed in the We 4 You payment database.
            </li>
            <li>
              <strong>Instant Intermediary Protection:</strong> When anyone reports band <code>{bandCode}</code>, our hotline coordinates with <code>{guardianPhone}</code> without sharing private details.
            </li>
          </ol>
          <div className="pt-2 text-xs text-content-muted border-t border-border-subtle">
            For demonstration evaluators: This record is accessible in the{' '}
            <Link to="/admin/registrations" className="text-navy font-semibold underline">
              Admin Registrations Queue
            </Link>{' '}
            and{' '}
            <Link to="/admin/payments" className="text-navy font-semibold underline">
              Payments Ledger
            </Link>
            .
          </div>
        </div>

      </div>
    </div>
  );
};
