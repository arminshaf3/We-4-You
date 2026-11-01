import React from 'react';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { PolicyContactBlock } from '../../components/public/PolicyContactBlock';
import {
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  CreditCard,
  Truck,
  ShieldCheck,
  PackageCheck,
  FileText,
} from 'lucide-react';

export const ReturnPolicyPage: React.FC = () => {
  return (
    <div className="py-10 sm:py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'Return Policy' }]} className="mb-8" />

        {/* Page Header */}
        <div className="mb-10 sm:mb-12">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-mint-darker bg-mint-pale px-3 py-1 rounded-full mb-3 border border-emerald-300/40">
            <RotateCcw className="w-3.5 h-3.5 text-[#088F5B]" />
            Customer Protection
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-navy leading-tight tracking-tight">
            Return, Refund &amp; Cancellation Policy
          </h1>
          <p className="text-xs sm:text-sm text-content-muted mt-3 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Last updated: November 2, 2026</span>
          </p>
          <p className="text-base sm:text-lg text-content-body mt-4 leading-relaxed font-body">
            At <strong>WE 4 U (PVT) LTD</strong>, we take great pride in delivering high-quality identification bands and dedicated emergency contact coordination for families. This policy details our clear standards for product returns, refund timelines, order cancellations, and payment dispute resolutions.
          </p>
        </div>

        {/* Key Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <div className="p-4 rounded-brand bg-slate-50 border border-slate-200">
            <div className="w-8 h-8 rounded-brand bg-emerald-100 text-[#088F5B] flex items-center justify-center mb-2.5">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-heading font-bold text-navy">7-Day Return Window</h3>
            <p className="text-xs text-content-muted mt-1 leading-normal">
              Prompt returns for defective, damaged, or incorrect band items.
            </p>
          </div>

          <div className="p-4 rounded-brand bg-slate-50 border border-slate-200">
            <div className="w-8 h-8 rounded-brand bg-sky-100 text-sky-700 flex items-center justify-center mb-2.5">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-heading font-bold text-navy">7–14 Day Refunds</h3>
            <p className="text-xs text-content-muted mt-1 leading-normal">
              Direct reimbursement to your original payment method upon inspection.
            </p>
          </div>

          <div className="p-4 rounded-brand bg-slate-50 border border-slate-200">
            <div className="w-8 h-8 rounded-brand bg-amber-100 text-amber-700 flex items-center justify-center mb-2.5">
              <PackageCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-heading font-bold text-navy">Pre-Dispatch Cancel</h3>
            <p className="text-xs text-content-muted mt-1 leading-normal">
              100% full refund if cancelled prior to postal/courier dispatch.
            </p>
          </div>
        </div>

        {/* Structured Sections */}
        <div className="space-y-10 text-content-body text-sm sm:text-base leading-relaxed">
          {/* Section 1: Return Eligibility */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-navy">
              <span className="w-7 h-7 rounded-full bg-navy/5 text-navy font-bold text-xs flex items-center justify-center font-heading">
                1
              </span>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy">
                Return Eligibility &amp; Conditions
              </h2>
            </div>
            <p>
              We accept return requests within <strong>seven (7) calendar days</strong> from the recorded date of delivery if your wristband:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-sm sm:text-base">
              <li>Arrived with a manufacturing flaw, broken clasp, or defective identification print.</li>
              <li>Sustained physical damage during transit or postal handling.</li>
              <li>Does not match the product style, color, or model ordered.</li>
            </ul>
            <p className="pt-1">
              To qualify for an exchange or refund, returned items must be unused, unwashed, and retained in their original product packaging with all accompanying security cards and informational leaflets intact.
            </p>
          </section>

          {/* Section 2: Non-Returnable Items */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-navy">
              <span className="w-7 h-7 rounded-full bg-navy/5 text-navy font-bold text-xs flex items-center justify-center font-heading">
                2
              </span>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy">
                Non-Returnable &amp; Non-Refundable Items
              </h2>
            </div>
            <p>
              Due to child safety standards, hygienic requirements, and individual data registration, the following items cannot be returned or refunded:
            </p>
            <div className="p-4 rounded-brand bg-amber-50/70 border border-amber-200/90 text-sm text-amber-950 space-y-2">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Personalised &amp; Activated Bands:</strong> Any wristband that has already been registered in the We 4 You active emergency registry with a child's confidential guardian details is <strong>strictly non-returnable</strong>, unless our quality verification team confirms an inherent manufacturing defect.
                </p>
              </div>
              <p className="text-xs text-amber-800 pl-6.5">
                Items showing obvious signs of accidental misuse, outdoor wear-and-tear, intentional alteration, or pet damage are not eligible for return.
              </p>
            </div>
          </section>

          {/* Section 3: How to Request a Return */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-navy">
              <span className="w-7 h-7 rounded-full bg-navy/5 text-navy font-bold text-xs flex items-center justify-center font-heading">
                3
              </span>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy">
                How to Request a Return
              </h2>
            </div>
            <p>
              Initiating a return is simple. Please follow these three steps within seven (7) days of receiving your package:
            </p>
            <div className="bg-slate-50 border border-slate-200 rounded-brand p-5 space-y-3 text-sm">
              <p className="font-semibold text-navy">
                Step 1: Contact Customer Support
              </p>
              <p className="text-slate-600">
                Email our support team at <a href="mailto:support@we4you-contact.org" className="text-navy font-semibold underline">support@we4you-contact.org</a> or telephone our hotline at <a href="tel:+18005559348" className="text-navy font-semibold underline">+1 (800) 555-WE4U</a>.
              </p>
              <p className="font-semibold text-navy pt-1">
                Step 2: Provide Required Information
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>Your Order Number (e.g., W4Y-ORD-XXXX).</li>
                <li>The Band Reference Code (printed on the packaging or band clasp).</li>
                <li>A clear description of the defect or reason for return.</li>
                <li>Photographs or short video clips showing the issue clearly.</li>
              </ul>
              <p className="font-semibold text-navy pt-1">
                Step 3: Return Authorisation &amp; Dispatch
              </p>
              <p className="text-slate-600">
                Our support team will review your submission within 1–2 business days. Once approved, we will provide a Return Authorisation (RMA) reference and instructions on courier handover or registered postal return.
              </p>
            </div>
          </section>

          {/* Section 4: Refund Process & Timelines */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-navy">
              <span className="w-7 h-7 rounded-full bg-navy/5 text-navy font-bold text-xs flex items-center justify-center font-heading">
                4
              </span>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy">
                Refund Processing &amp; Timelines
              </h2>
            </div>
            <p>
              Once your returned wristband is received at our Jaffna fulfillment facility, our team will inspect the item within <strong>two (2) business days</strong>. You will receive an email confirmation once the inspection is complete.
            </p>
            <p>
              If your return is approved:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-sm sm:text-base">
              <li>Refunds are issued directly to the <strong>original payment method</strong> used during checkout (credit/debit card, online payment gateway, or bank account).</li>
              <li>Refund processing typically takes between <strong>7 to 14 working days</strong> to reflect on your statement, depending on your issuing bank or card provider.</li>
              <li>Cash refunds are not issued for online orders paid via card or gateway.</li>
            </ul>
          </section>

          {/* Section 5: Order Cancellation */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-navy">
              <span className="w-7 h-7 rounded-full bg-navy/5 text-navy font-bold text-xs flex items-center justify-center font-heading">
                5
              </span>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy">
                Order Cancellation Policy
              </h2>
            </div>
            <p>
              We understand that plans can change. You may cancel your order at any time <strong>prior to package dispatch</strong> for a 100% full refund with no cancellation penalty.
            </p>
            <p>
              To cancel an order before dispatch, please notify our team immediately via phone or email with your order number. If your order has already been handed over to our courier partner, it cannot be recalled; you must follow the standard 7-day return process upon receipt.
            </p>
          </section>

          {/* Section 6: Shipping Charges & Return Delivery Fees */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-navy">
              <span className="w-7 h-7 rounded-full bg-navy/5 text-navy font-bold text-xs flex items-center justify-center font-heading">
                6
              </span>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy">
                Delivery Fees &amp; Return Shipping Costs
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-brand border border-border-subtle bg-neutral-soft">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#088F5B] block mb-1">
                  Defective, Damaged or Incorrect Items
                </span>
                <p className="text-sm text-slate-700 leading-relaxed">
                  <strong>WE 4 U (PVT) LTD pays 100% of return shipping costs.</strong> We will also refund the original delivery fee paid during checkout, or arrange a complimentary courier replacement.
                </p>
              </div>

              <div className="p-4 rounded-brand border border-border-subtle bg-neutral-soft">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 block mb-1">
                  Customer Change of Mind
                </span>
                <p className="text-sm text-slate-700 leading-relaxed">
                  For non-defective, unactivated bands returned within 7 days, the customer is responsible for return postage fees, and the original outward delivery charge is non-refundable.
                </p>
              </div>
            </div>
          </section>

          {/* Section 7: Failed Payments & Duplicate Charges */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-navy">
              <span className="w-7 h-7 rounded-full bg-navy/5 text-navy font-bold text-xs flex items-center justify-center font-heading">
                7
              </span>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy">
                Failed Payments &amp; Duplicate Charges
              </h2>
            </div>
            <p>
              If your bank account or payment card is charged more than once due to a network timeout or browser refresh during checkout, please rest assured that your funds are safe:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-sm sm:text-base">
              <li>Our automated payment gateway reconciles duplicate transactions daily.</li>
              <li>Any verified duplicate or unfulfilled payment is automatically reversed to your card or account within <strong>7 to 14 working days</strong>.</li>
              <li>You may also submit a transaction screenshot or bank reference to our support desk for accelerated reversal.</li>
            </ul>
          </section>
        </div>

        {/* Official Contact Block */}
        <PolicyContactBlock />
      </div>
    </div>
  );
};

export default ReturnPolicyPage;
