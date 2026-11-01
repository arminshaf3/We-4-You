import React from 'react';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { PolicyContactBlock } from '../../components/public/PolicyContactBlock';
import {
  ShieldCheck,
  Lock,
  Heart,
  Eye,
  FileCheck,
  Server,
  UserCheck,
  Calendar,
  AlertCircle,
  CreditCard,
  Cookie,
} from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="py-10 sm:py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'Privacy Policy' }]} className="mb-8" />

        {/* Page Header */}
        <div className="mb-10 sm:mb-12">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-mint-darker bg-mint-pale px-3 py-1 rounded-full mb-3 border border-emerald-300/40">
            <ShieldCheck className="w-3.5 h-3.5 text-[#088F5B]" />
            Privacy &amp; Data Protection
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-navy leading-tight tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-xs sm:text-sm text-content-muted mt-3 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Last updated: November 2, 2026</span>
          </p>
          <p className="text-base sm:text-lg text-content-body mt-4 leading-relaxed font-body">
            <strong>WE 4 U (PVT) LTD</strong> ("We 4 You", "we", "our", or "us", Company Registration No. PV 00379002) is committed to protecting the privacy and personal data of children, parents, and guardians. This Privacy Policy explains our data collection, security, and disclosure practices in plain, transparent language.
          </p>
        </div>

        {/* Statutory Compliance Callout: Sri Lanka PDPA */}
        <div className="p-5 bg-emerald-50/80 rounded-brand border border-emerald-200 mb-12 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-100 text-[#088F5B] flex items-center justify-center flex-shrink-0 mt-0.5">
            <FileCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-heading font-bold text-emerald-950">
              Personal Data Protection Act, No. 9 of 2022 (Sri Lanka) Compliance
            </h3>
            <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
              This policy is prepared and maintained in strict compliance with the provisions of the <strong>Personal Data Protection Act, No. 9 of 2022 of Sri Lanka (PDPA)</strong>. We process all personal information lawfully, fairly, and transparently, adhering strictly to the statutory principles of purpose limitation, data minimisation, and data confidentiality.
            </p>
          </div>
        </div>

        {/* Structured Sections */}
        <div className="space-y-10 text-content-body text-sm sm:text-base leading-relaxed">
          {/* Section 1: What Data We Collect */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-navy">
              <span className="w-7 h-7 rounded-full bg-navy/5 text-navy font-bold text-xs flex items-center justify-center font-heading">
                1
              </span>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy">
                What Personal Data We Collect
              </h2>
            </div>
            <p>
              We collect only the minimum personal data strictly necessary to fulfill wristband orders and provide our emergency guardian contact service:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-brand border border-border-subtle bg-slate-50 space-y-2">
                <h4 className="font-heading font-bold text-navy text-sm flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-navy" />
                  Parent &amp; Guardian Information
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-slate-700">
                  <li>Full legal name of parent or primary guardian.</li>
                  <li>Primary and secondary mobile telephone numbers.</li>
                  <li>Email address for service confirmations and notices.</li>
                  <li>Delivery and postal address in Sri Lanka.</li>
                  <li>Relationship to the child or wearer.</li>
                </ul>
              </div>

              <div className="p-4 rounded-brand border border-border-subtle bg-slate-50 space-y-2">
                <h4 className="font-heading font-bold text-navy text-sm flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-600" />
                  Child &amp; Order Information
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-slate-700">
                  <li>Child's first name or preferred nickname.</li>
                  <li>Child's age or age group (e.g. 0–12 years).</li>
                  <li>Voluntary medical notes (e.g. allergies, diabetic alert).</li>
                  <li>Band reference code (e.g. W4Y-XXXX-XX).</li>
                  <li>Order details, subscription tier, and transaction ID.</li>
                </ul>
              </div>
            </div>
            <p className="text-xs text-content-muted">
              <em>Note:</em> We do <strong>not</strong> collect biometric data, national identity numbers of minors, or continuous GPS/electronic location tracking data.
            </p>
          </section>

          {/* Section 2: Why We Collect It */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-navy">
              <span className="w-7 h-7 rounded-full bg-navy/5 text-navy font-bold text-xs flex items-center justify-center font-heading">
                2
              </span>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy">
                Why We Collect Your Data (Purposes)
              </h2>
            </div>
            <p>
              Your personal information is collected and processed exclusively for the following defined purposes:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-sm sm:text-base">
              <li><strong>Order Fulfillment &amp; Delivery:</strong> To package and dispatch your wristbands via postal and courier services to your address across Sri Lanka.</li>
              <li><strong>Central Guardian Reconnection:</strong> To maintain an active emergency registry so our 24/7 central office can reach you immediately if your child is lost or needs assistance.</li>
              <li><strong>Payment Processing:</strong> To verify subscription status, process online transactions, and handle renewal notices.</li>
              <li><strong>Customer Support:</strong> To answer your inquiries, replace damaged bands, or assist with registry updates.</li>
            </ul>
          </section>

          {/* Section 3: Special Protection for Children's Data */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-navy">
              <span className="w-7 h-7 rounded-full bg-navy/5 text-navy font-bold text-xs flex items-center justify-center font-heading">
                3
              </span>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy">
                Special Care &amp; Safeguards for Children's Data
              </h2>
            </div>
            <div className="p-5 rounded-brand bg-slate-50 border border-slate-200/90 space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-navy flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Strict Non-Commercial Use:</strong> Children’s personal information is used <strong>solely to reunite a lost child with their registered guardian</strong>.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#088F5B] flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Never Sold or Exploited:</strong> We <strong>never</strong> sell, rent, lease, monetise, or share children’s data with third-party advertisers, data brokers, or marketing networks.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>No Public Display:</strong> A child's full name, photograph, address, and home details are <strong>never printed on the exterior of the wristband</strong> and are never exposed publicly on the web.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Who Sees Your Information */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-navy">
              <span className="w-7 h-7 rounded-full bg-navy/5 text-navy font-bold text-xs flex items-center justify-center font-heading">
                4
              </span>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy">
                Who Sees the Data (Controlled Office Intermediary)
              </h2>
            </div>
            <p>
              We operate an <strong>intermediary office shield model</strong> to protect family privacy:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-sm sm:text-base">
              <li>
                When a good samaritan, police officer, or school administrator finds a child wearing our band, they see only the unique printed band code and our central office telephone number.
              </li>
              <li>
                The finder contacts our central office. Our trained staff verifies the band reference in our secure system and initiates contact with the registered parent or guardian directly.
              </li>
              <li>
                Guardian contact details are shared <strong>only with the specific person who finds the child</strong>, through our office staff, strictly to the extent necessary to safely coordinate the child's reunion.
              </li>
              <li>
                We do not disclose your personal information to external commercial parties.
              </li>
            </ul>
          </section>

          {/* Section 5: Payment Gateway & Financial Security */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-navy">
              <span className="w-7 h-7 rounded-full bg-navy/5 text-navy font-bold text-xs flex items-center justify-center font-heading">
                5
              </span>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy">
                Payment Security &amp; Card Data
              </h2>
            </div>
            <p>
              All online payments on We 4 You are processed through certified, PCI-DSS compliant third-party payment gateways:
            </p>
            <div className="p-4 rounded-brand bg-slate-50 border border-slate-200 text-sm space-y-2">
              <div className="flex items-center gap-2 text-navy font-semibold">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <span>Zero Card Storage Guarantee</span>
              </div>
              <p className="text-slate-600">
                <strong>WE 4 U (PVT) LTD does not store, capture, or have access to your full credit card numbers, debit card numbers, CVV codes, or card PINs on our servers.</strong> All card authentication occurs directly within the payment gateway’s encrypted, tokenized environment.
              </p>
            </div>
          </section>

          {/* Section 6: Data Retention & Security Measures */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-navy">
              <span className="w-7 h-7 rounded-full bg-navy/5 text-navy font-bold text-xs flex items-center justify-center font-heading">
                6
              </span>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy">
                Data Retention &amp; Technical Security
              </h2>
            </div>
            <p>
              We implement comprehensive technical and organizational measures to safeguard your family's records:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-sm sm:text-base">
              <li><strong>Encryption:</strong> Data in transit is protected using TLS 1.3 encryption, and database tables are encrypted at rest.</li>
              <li><strong>Access Control:</strong> Staff access to guardian registry records requires multi-factor authentication, role-based security permissions, and immutable audit logs.</li>
              <li><strong>Retention:</strong> Personal data is retained for the active period of your registered subscription. If a subscription is ended or cancelled, records are securely archived or purged in accordance with our data retention schedule.</li>
            </ul>
          </section>

          {/* Section 7: Your Rights Under Sri Lanka PDPA */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-navy">
              <span className="w-7 h-7 rounded-full bg-navy/5 text-navy font-bold text-xs flex items-center justify-center font-heading">
                7
              </span>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy">
                Your Rights Under the Personal Data Protection Act
              </h2>
            </div>
            <p>
              In accordance with Part II of the Personal Data Protection Act, No. 9 of 2022, you have the following rights as a data subject:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 bg-neutral-soft rounded-brand border border-border-subtle">
                <span className="font-semibold text-navy text-xs uppercase tracking-wider block mb-1">Right to Access</span>
                <p className="text-xs text-slate-600">Request a copy of the personal information stored in your registry profile.</p>
              </div>
              <div className="p-3.5 bg-neutral-soft rounded-brand border border-border-subtle">
                <span className="font-semibold text-navy text-xs uppercase tracking-wider block mb-1">Right to Rectify</span>
                <p className="text-xs text-slate-600">Update emergency telephone numbers or incorrect guardian information at any time.</p>
              </div>
              <div className="p-3.5 bg-neutral-soft rounded-brand border border-border-subtle">
                <span className="font-semibold text-navy text-xs uppercase tracking-wider block mb-1">Right to Erasure</span>
                <p className="text-xs text-slate-600">Request permanent deletion of your child's and guardian records upon service closure.</p>
              </div>
            </div>
            <p className="text-xs text-content-muted pt-1">
              To exercise any of these rights, contact our Data Protection Officer at <a href="mailto:support@we4you-contact.org" className="text-navy font-semibold underline">support@we4you-contact.org</a>. For safety, identity verification will be conducted prior to fulfilling requests.
            </p>
          </section>

          {/* Section 8: Cookies & Web Analytics */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-navy">
              <span className="w-7 h-7 rounded-full bg-navy/5 text-navy font-bold text-xs flex items-center justify-center font-heading">
                8
              </span>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy">
                Cookies &amp; Analytics
              </h2>
            </div>
            <p>
              Our website uses strictly necessary session cookies and minimal anonymous operational metrics to keep you logged in and ensure secure checkout. We do <strong>not</strong> use invasive third-party cross-site advertising trackers or tracking pixels. You may adjust cookie preferences within your browser settings at any time.
            </p>
          </section>
        </div>

        {/* Official Contact Block */}
        <PolicyContactBlock />
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
