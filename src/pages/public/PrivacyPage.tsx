import React from 'react';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { AlertCircle, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const PrivacyPage: React.FC = () => {
  const { settings } = useApp();

  return (
    <div className="py-10 sm:py-16 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Breadcrumbs items={[{ label: 'Privacy Notice Draft' }]} className="mb-8" />

        {/* Draft Notice Banner */}
        <div className="p-4 sm:p-5 bg-amber-50 rounded-brand border border-amber-200 mb-10 flex items-start gap-3.5">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
            <span className="font-bold">Draft Document Notice: </span>
            This document is a functional draft prepared for review by the business and legal counsel. It reflects the operational data practices of the We 4 You frontend and does not constitute finalized legal advice.
          </div>
        </div>

        {/* Title */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-navy leading-tight tracking-tight">
            Privacy Notice (Draft)
          </h1>
          <p className="text-sm text-content-muted mt-2">
            Last updated: September 2026 &bull; Draft for Business Review
          </p>
        </div>

        {/* Structured Sections */}
        <div className="prose prose-slate max-w-none text-content-body space-y-8 text-sm sm:text-base leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-xl font-heading font-bold text-navy">
              1. Collection Purposes &amp; Scope
            </h2>
            <p>
              We 4 You collects information solely to facilitate emergency contact reconnection when an identification band reference is reported to our office. The types of information gathered during registration include:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Primary contact full name, relationship to the wearer, and primary contact phone number.</li>
              <li>Optional secondary authorized adult emergency contact numbers.</li>
              <li>Wearer’s first name and category/age group (e.g. child, senior, adult, or medical alert).</li>
              <li>Unique printed band reference code and authorized vendor purchase attribution.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-heading font-bold text-navy">
              2. Strict Confidentiality &amp; Non-Disclosure
            </h2>
            <p>
              Emergency contact information is kept confidential within our secure intermediary office registry. We <strong>never</strong> display registered wearer names, photographs, phone numbers, or addresses on public web pages or on the physical band itself.
            </p>
            <p>
              When a member of the public reports a person wearing a band, our staff facilitates the phone connection directly rather than disclosing private contact details to the finder.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-heading font-bold text-navy">
              3. Authorized Registration &amp; Consent
            </h2>
            <p>
              Registration requires explicit affirmation that the submitting individual is the wearer or authorized to register on behalf of the wearer. Possession of a printed band reference alone does not confer authorization.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-heading font-bold text-navy">
              4. Updating and Accessing Your Records
            </h2>
            <p>
              Contacts are encouraged to maintain current telephone numbers. Because records relate to personal safety, requests to update phone numbers or authorized emergency contacts undergo office staff identity verification before modification.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-heading font-bold text-navy">
              5. Data Retention &amp; Inactive Records
            </h2>
            <p>
              Records are retained for the active duration of the registered service subscription. When a subscription expires or is terminated, records are retired according to the business’s formal retention policy (subject to office confirmation).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-heading font-bold text-navy">
              6. Contacting Our Office Regarding Privacy
            </h2>
            <p>
              For questions regarding privacy, record verification, or data handling, please contact our office:
            </p>
            <div className="p-4 bg-neutral-soft rounded-brand border border-border-subtle text-xs space-y-1">
              <p><strong>Office Email:</strong> {settings.officeEmail}</p>
              <p><strong>Telephone:</strong> {settings.officePhone}</p>
              <p><strong>Address:</strong> {settings.officeAddress}</p>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
};
