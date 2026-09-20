import React from 'react';
import {
  ShieldCheck,
  CreditCard,
  CheckCircle2,
  Lock,
  PhoneCall,
  Globe,
  MapPin,
  Check,
  Sparkles,
} from 'lucide-react';

export interface BrandedReceiptA4Props {
  referenceNumber: string;
  bandCode: string;
  childName: string;
  guardianName: string;
  guardianPhone: string;
  guardianLanguage?: string;
  vendorName?: string;
  planName: string;
  durationMonths?: number;
  amountPaid: number;
  amountFormatted?: string;
  transactionId: string;
  receiptRef: string;
  cardBrand: string;
  cardLast4: string;
  paymentDate?: string;
}

export const BrandedReceiptA4: React.FC<BrandedReceiptA4Props> = ({
  referenceNumber,
  bandCode,
  childName,
  guardianName,
  guardianPhone,
  guardianLanguage = 'English',
  vendorName = 'Official We 4 You Partner Outlet',
  planName,
  durationMonths = 12,
  amountPaid = 29,
  amountFormatted,
  transactionId,
  receiptRef,
  cardBrand = 'Visa',
  cardLast4 = '4242',
  paymentDate,
}) => {
  const formattedDate = paymentDate
    ? new Date(paymentDate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });

  const displayAmount = amountFormatted || `$${amountPaid.toFixed(2)}`;
  const subtotal = amountPaid;
  const taxAmount = 0.0;
  const totalAmount = amountPaid;

  return (
    <div
      id="branded-a4-receipt"
      className="bg-white text-slate-800 font-body relative overflow-hidden rounded-brand-lg border border-slate-200 shadow-2xl max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none print:w-full print:rounded-none avoid-break"
      style={{ minHeight: 'auto' }}
    >
      {/* ============================================================ */}
      {/* 1. TOP CURVED ORGANIC WAVES & HEADER SECTION                 */}
      {/* ============================================================ */}
      <div className="relative w-full h-36 sm:h-40 bg-white">
        {/* SVG Top Organic Wave: Navy & Cyan layers */}
        <svg
          viewBox="0 0 800 150"
          className="absolute top-0 left-0 w-full h-full"
          preserveAspectRatio="none"
          fill="none"
        >
          {/* Cyan / Sky Blue accent wave */}
          <path
            d="M0,0 L570,0 C490,20 440,75 350,105 C260,135 160,150 0,150 Z"
            fill="#8ad4fa"
          />
          {/* Deep Navy foreground wave */}
          <path
            d="M0,0 L480,0 C410,18 360,60 280,92 C200,124 110,138 0,138 Z"
            fill="#0f2942"
          />
        </svg>

        {/* Content overlaid on top header */}
        <div className="relative z-10 px-6 sm:px-10 pt-5 sm:pt-6 flex justify-between items-start">
          {/* Top Left: Logo Emblem & Title */}
          <div className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 rounded-full bg-white/10 border border-white/30 flex items-center justify-center text-white">
              <ShieldCheck className="w-6 h-6 text-[#8ad4fa]" />
            </div>
            <div>
              <div className="text-xl sm:text-2xl font-heading font-black tracking-wider uppercase leading-none">
                WE 4 YOU
              </div>
              <div className="text-[10px] uppercase font-semibold tracking-widest text-[#8ad4fa] mt-0.5">
                SAFETY &amp; RECONNECTION
              </div>
            </div>
          </div>

          {/* Top Right: INVOICE title on white canvas */}
          <div className="text-right">
            <h1 className="text-3xl sm:text-4xl font-heading font-black text-[#0f2942] tracking-wider uppercase">
              INVOICE
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3 h-3 text-[#088F5B]" />
              PAID &amp; VERIFIED
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. METADATA RIBBON & DECORATIVE ARROWS                       */}
      {/* ============================================================ */}
      <div className="px-6 sm:px-10 my-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Decorative Triangle Arrow Pattern */}
        <div className="hidden sm:flex items-center gap-2 text-[#8ad4fa] select-none text-xs font-mono">
          <span>&#9655;</span>
          <span>&#9655;</span>
          <span>&#9655;</span>
          <span>&#9655;</span>
          <span>&#9655;</span>
          <span>&#9655;</span>
          <span>&#9655;</span>
          <span>&#9655;</span>
          <span>&#9655;</span>
          <span>&#9655;</span>
          <span>&#9655;</span>
        </div>

        {/* Right: Light Cyan Rounded Metadata Ribbon */}
        <div className="w-full sm:w-auto bg-[#8ad4fa]/80 text-[#0f2942] px-5 py-2 rounded-full flex items-center justify-between sm:justify-end gap-6 text-xs sm:text-sm font-heading font-semibold shadow-xs">
          <div>
            <span className="opacity-75 text-xs mr-1 font-normal">Invoice:</span>
            <span className="font-mono font-bold tracking-tight">{receiptRef}</span>
          </div>
          <div className="border-l border-[#0f2942]/20 pl-4">
            <span className="opacity-75 text-xs mr-1 font-normal">Date:</span>
            <span className="font-bold">{formattedDate}</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. CLIENT / GUARDIAN "INVOICE TO" & SIDE ACCENTS             */}
      {/* ============================================================ */}
      <div className="px-6 sm:px-10 py-5 flex flex-col sm:flex-row justify-between items-start gap-6 relative">
        
        {/* Left Side Graphic Circle Accent */}
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-12 rounded-r-full bg-[#8ad4fa]/70 pointer-events-none hidden sm:block" />

        {/* Left: Invoice to Client Info */}
        <div className="space-y-1 sm:pl-3">
          <p className="text-xs uppercase font-bold tracking-wider text-slate-400">
            Invoice to:
          </p>
          <h3 className="text-lg font-heading font-bold text-[#0f2942] uppercase tracking-tight">
            {guardianName || 'Elena Vance'}
          </h3>
          <div className="text-xs text-slate-600 space-y-0.5 leading-relaxed">
            <p className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Wearer Name:</span>
              <span className="font-semibold text-[#0f2942]">{childName || 'Lucas Vance'}</span>
            </p>
            <p className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Band Reference:</span>
              <span className="font-mono font-bold text-navy bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                {bandCode}
              </span>
            </p>
            <p className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Registered Phone:</span>
              <span>{guardianPhone || '+1 (555) 019-2834'}</span>
            </p>
            <p className="flex items-center gap-1.5">
              <span className="text-slate-400 font-medium">Retail Partner:</span>
              <span>{vendorName}</span>
            </p>
          </div>
        </div>

        {/* Right: Decorative Hatch Texture & Transaction Summary */}
        <div className="text-left sm:text-right space-y-2">
          {/* Decorative Diagonal Hatch Lines */}
          <div className="hidden sm:flex justify-end gap-1.5 opacity-40 select-none pb-1">
            <div className="w-1 h-6 bg-[#8ad4fa] skew-x-[-30deg]" />
            <div className="w-1 h-6 bg-[#8ad4fa] skew-x-[-30deg]" />
            <div className="w-1 h-6 bg-[#8ad4fa] skew-x-[-30deg]" />
            <div className="w-1 h-6 bg-[#8ad4fa] skew-x-[-30deg]" />
            <div className="w-1 h-6 bg-[#8ad4fa] skew-x-[-30deg]" />
            <div className="w-1 h-6 bg-[#8ad4fa] skew-x-[-30deg]" />
            <div className="w-1 h-6 bg-[#8ad4fa] skew-x-[-30deg]" />
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-brand p-3 text-xs text-slate-600 space-y-1">
            <div className="flex sm:justify-end gap-3">
              <span className="text-slate-400">Transaction ID:</span>
              <span className="font-mono font-bold text-[#0f2942]">{transactionId}</span>
            </div>
            <div className="flex sm:justify-end gap-3">
              <span className="text-slate-400">Payment Channel:</span>
              <span className="font-semibold text-slate-700 uppercase">
                {cardBrand} &bull;&bull;&bull;&bull; {cardLast4} (Instant)
              </span>
            </div>
            <div className="flex sm:justify-end gap-3">
              <span className="text-slate-400">Registry Ledger:</span>
              <span className="font-mono font-bold text-[#088F5B]">{referenceNumber}</span>
            </div>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* 4. ITEM DESCRIPTION TABLE WITH NAVY PILL HEADER             */}
      {/* ============================================================ */}
      <div className="px-6 sm:px-10 my-4">
        
        {/* Navy Pill Header Bar */}
        <div className="bg-[#0f2942] text-white rounded-full px-6 py-3 grid grid-cols-12 items-center text-xs font-heading font-bold uppercase tracking-wider shadow-sm">
          <div className="col-span-1 text-center">Qty.</div>
          <div className="col-span-6 pl-2">Item Description</div>
          <div className="col-span-2 text-right">Price</div>
          <div className="col-span-3 text-right">Total</div>
        </div>

        {/* Table Rows with Crisp Horizontal Dividers */}
        <div className="divide-y divide-slate-200 text-xs sm:text-sm text-slate-700">
          
          {/* Row 1: Primary Subscription Plan */}
          <div className="grid grid-cols-12 items-center py-4 px-3 sm:px-6 hover:bg-slate-50/50 transition-colors">
            <div className="col-span-1 text-center font-bold text-slate-400">1</div>
            <div className="col-span-6 pl-2 pr-4">
              <p className="font-bold text-[#0f2942] text-sm">
                {planName || 'Annual Family Support Subscription'}
              </p>
              <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
                {durationMonths} Months Active Coverage &bull; 24/7 Office Intermediary Registry Link &bull; Emergency Dispatch Pairing
              </p>
            </div>
            <div className="col-span-2 text-right font-mono font-medium text-slate-600">
              ${amountPaid.toFixed(2)}
            </div>
            <div className="col-span-3 text-right font-mono font-bold text-[#0f2942]">
              ${amountPaid.toFixed(2)}
            </div>
          </div>

          {/* Row 2: Band Registry & Pairing */}
          <div className="grid grid-cols-12 items-center py-3.5 px-3 sm:px-6 hover:bg-slate-50/50 transition-colors">
            <div className="col-span-1 text-center font-bold text-slate-400">1</div>
            <div className="col-span-6 pl-2 pr-4">
              <p className="font-semibold text-slate-800">
                National Physical Band QR Pairing &amp; Intermediary Setup
              </p>
              <p className="text-[10px] text-slate-500 leading-normal">
                Encrypted database routing &bull; Zero direct contact disclosure
              </p>
            </div>
            <div className="col-span-2 text-right font-mono text-slate-400">$00.00</div>
            <div className="col-span-3 text-right font-mono font-semibold text-[#088F5B]">$00.00</div>
          </div>

          {/* Row 3: Support Hotline */}
          <div className="grid grid-cols-12 items-center py-3.5 px-3 sm:px-6 hover:bg-slate-50/50 transition-colors">
            <div className="col-span-1 text-center font-bold text-slate-400">1</div>
            <div className="col-span-6 pl-2 pr-4">
              <p className="font-semibold text-slate-800">
                24/7 Lost Child Intermediary Helpline Access
              </p>
              <p className="text-[10px] text-slate-500 leading-normal">
                Dedicated desk coordinator for lost band reports
              </p>
            </div>
            <div className="col-span-2 text-right font-mono text-slate-400">$00.00</div>
            <div className="col-span-3 text-right font-mono font-semibold text-[#088F5B]">$00.00</div>
          </div>

        </div>

        {/* Bottom Horizontal Divider after rows */}
        <div className="border-b-2 border-slate-200 mt-1 mb-6" />

      </div>

      {/* ============================================================ */}
      {/* 5. TERMS, SIGNATURE & FINANCIAL TOTALS SECTION               */}
      {/* ============================================================ */}
      <div className="px-6 sm:px-10 pb-8 grid grid-cols-1 sm:grid-cols-12 gap-6 items-start relative">
        
        {/* Right Side Graphic Circle Accent */}
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 rounded-l-full bg-[#8ad4fa]/70 pointer-events-none hidden sm:block" />

        {/* Left (8 Cols): Terms & Conditions + Director Signature */}
        <div className="sm:col-span-7 space-y-6">
          <div className="space-y-1 text-xs">
            <h4 className="font-heading font-bold text-[#0f2942] uppercase tracking-wider">
              Terms &amp; Conditions
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed max-w-md">
              Payment authorized and settled via secure SSL card gateway. Subscription is active immediately upon submission and permanently tied to band reference <strong>{bandCode}</strong>. Quote registration reference <strong>{referenceNumber}</strong> for customer support.
            </p>
          </div>

          {/* Authorized Signature Block */}
          <div className="pt-2 space-y-1">
            <div className="w-48 border-b-2 border-slate-300 pb-1">
              <span className="font-heading font-bold text-[#0f2942] text-sm tracking-wide">
                Zhevanka R.
              </span>
            </div>
            <p className="text-[11px] font-semibold text-slate-500">
              Director of Registry Operations
            </p>
            <p className="text-[9px] text-slate-400 uppercase tracking-wider">
              We 4 You Intermediary Desk
            </p>
          </div>
        </div>

        {/* Right (5 Cols): Calculation Totals */}
        <div className="sm:col-span-5 space-y-2 text-xs sm:text-sm text-slate-700 sm:pl-6">
          <div className="flex justify-between py-1">
            <span className="text-slate-500">Sub Total:</span>
            <span className="font-mono font-medium text-slate-800">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500">Tax 0.0%:</span>
            <span className="font-mono font-medium text-slate-800">$0.00</span>
          </div>
          
          <div className="border-t-2 border-[#0f2942] pt-2 mt-2 flex justify-between items-center text-base sm:text-lg font-heading font-black text-[#0f2942]">
            <span>Total:</span>
            <span className="font-mono text-xl text-[#0f2942]">
              ${totalAmount.toFixed(2)}
            </span>
          </div>

          <div className="text-right pt-1">
            <span className="text-[10px] font-bold text-[#088F5B] uppercase tracking-widest bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded">
              Paid in Full &bull; $0.00 Due
            </span>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* 6. BOTTOM CURVED ORGANIC WAVES & FOOTER CONTACTS             */}
      {/* ============================================================ */}
      <div className="relative w-full h-28 sm:h-32 bg-white">
        {/* SVG Bottom Organic Waves: Cyan & Navy */}
        <svg
          viewBox="0 0 800 120"
          className="absolute bottom-0 left-0 w-full h-full"
          preserveAspectRatio="none"
          fill="none"
        >
          {/* Sky Blue / Cyan Layer */}
          <path
            d="M0,120 L800,120 L800,0 C690,15 620,70 470,85 C350,98 220,110 0,120 Z"
            fill="#8ad4fa"
          />
          {/* Deep Navy Foreground Layer */}
          <path
            d="M0,120 L800,120 L800,20 C710,25 640,75 510,88 C390,98 260,110 0,120 Z"
            fill="#0f2942"
          />
        </svg>

        {/* Content overlaid on navy bottom footer */}
        <div className="relative z-10 h-full flex items-end justify-end px-6 sm:px-10 pb-4 text-white text-[11px] text-right space-y-0.5 font-body leading-snug">
          <div>
            <p className="font-semibold text-slate-200">100 Safety Blvd, Suite 400, City Center</p>
            <p className="text-slate-300">+022 343 555 4545 / +1 (800) 555-WE4U</p>
            <p className="text-[#8ad4fa] font-medium">www.we4you.org &bull; support@we4you.org</p>
          </div>
        </div>
      </div>

    </div>
  );
};
