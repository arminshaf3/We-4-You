import React from 'react';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const TermsPage: React.FC = () => {
  const { settings } = useApp();

  return (
    <div className="py-10 sm:py-16 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Breadcrumbs items={[{ label: 'Terms of Service Draft' }]} className="mb-8" />

        {/* Draft Notice */}
        <div className="p-4 sm:p-5 bg-amber-50 rounded-brand border border-amber-200 mb-10 flex items-start gap-3.5">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
            <span className="font-bold">Draft Terms Notice: </span>
            This document is a functional draft outlining the service terms and operational scope of We 4 You. It requires final review and confirmation by the business before commercial publication.
          </div>
        </div>

        {/* Title */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-navy leading-tight tracking-tight">
            Service Terms (Draft)
          </h1>
          <p className="text-sm text-content-muted mt-2">
            Last updated: September 2026 &bull; Draft for Business Review
          </p>
        </div>

        {/* Structured Sections */}
        <div className="prose prose-slate max-w-none text-content-body space-y-8 text-sm sm:text-base leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-heading font-bold text-navy">
              1. Service Description &amp; Scope
            </h2>
            <p>
              We 4 You provides a physical child identification wristband and an office intermediary contact service. The product functions by providing a visible reference number and office contact phone number on the band so that caring individuals or officials who find a lost child may contact our office.
            </p>
            <p>
              <strong>Important Scope Definition:</strong> The We 4 You identification band does <em>not</em> contain GPS hardware, cellular transmitters, bluetooth tracking beacons, or electronic battery devices. The service does not promise automated location broadcasts or continuous supervision.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-heading font-bold text-navy">
              2. Band Purchase &amp; Service Subscription
            </h2>
            <p>
              The physical band purchase and ongoing office support subscriptions are distinct items:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>The band is purchased from authorized local vendor retail shops or directly where enabled.</li>
              <li>Active registry monitoring and emergency telephone response requires an active, verified subscription.</li>
              <li>Online registration submission enters a pending manual verification queue; service activation is confirmed following document and receipt verification.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-heading font-bold text-navy">
              3. Guardian Responsibilities
            </h2>
            <p>
              Registered guardians are responsible for:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Ensuring telephone numbers and emergency contacts provided are current and operational.</li>
              <li>Ensuring the child comfortably wears the band during outings.</li>
              <li>Promptly reporting lost or broken bands to our office for replacement.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-heading font-bold text-navy">
              4. Vendor Attribution &amp; Commissions
            </h2>
            <p>
              Selecting the retail shop where the band was acquired attributes the sale to an authorized partner. Attribution is subject to office validation and does not represent an independent commercial agreement between the guardian and the retailer.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-heading font-bold text-navy">
              5. Office Operating Scope &amp; Limitation of Liability
            </h2>
            <p>
              We 4 You acts as a caring communication intermediary. The service cannot replace attentive parental supervision, and the business does not guarantee child recovery or prevent separation. Office operating hours and contact response availability are subject to configured staffing schedules.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-heading font-bold text-navy">
              6. Contacting the Business
            </h2>
            <p>
              For legal and service inquiries, contact our office center:
            </p>
            <div className="p-4 bg-neutral-soft rounded-brand border border-border-subtle text-xs space-y-1">
              <p><strong>Office Support:</strong> {settings.officeEmail}</p>
              <p><strong>Telephone:</strong> {settings.officePhone}</p>
              <p><strong>Office Hours:</strong> {settings.officeHours}</p>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
};
