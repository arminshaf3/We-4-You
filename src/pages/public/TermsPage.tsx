import React from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { PolicyContactBlock } from '../../components/public/PolicyContactBlock';
import {
  FileText,
  Building2,
  Scale,
  Truck,
  CreditCard,
  ShieldAlert,
  ShieldCheck,
  Calendar,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="py-10 sm:py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'Terms & Conditions' }]} className="mb-8" />

        {/* Page Header */}
        <div className="mb-10 sm:mb-12">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-mint-darker bg-mint-pale px-3 py-1 rounded-full mb-3 border border-emerald-300/40">
            <Scale className="w-3.5 h-3.5 text-[#088F5B]" />
            Commercial Agreement
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-navy leading-tight tracking-tight">
            Business Terms &amp; Conditions
          </h1>
          <p className="text-xs sm:text-sm text-content-muted mt-3 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Last updated: November 2, 2026</span>
          </p>
          <p className="text-base sm:text-lg text-content-body mt-4 leading-relaxed font-body">
            Welcome to <strong>We 4 You</strong>. These Business Terms &amp; Conditions govern the purchase of our child identification wristbands, subscription to our central guardian contact service, and use of our website (<a href="https://we-4-you.vercel.app" className="text-navy font-semibold underline">we-4-you.vercel.app</a>).
          </p>
        </div>

        {/* Corporate Entity Notice */}
        <div className="p-5 bg-slate-50 rounded-brand border border-slate-200 mb-12 flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-navy text-white flex items-center justify-center flex-shrink-0 mt-0.5">
            <Building2 className="w-5 h-5 text-mint" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-heading font-bold text-navy">
              Corporate Entity &amp; Legal Capacity
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              This service is owned and operated by <strong>WE 4 U (PVT) LTD</strong>, a private limited liability company duly incorporated under the Companies Act No. 7 of 2007 of Sri Lanka (Company Registration No. <strong>PV 00379002</strong>), with registered office situated at <strong>No 21, Somasundram Avenue, Chundikuli, Jaffna, Sri Lanka</strong>.
            </p>
          </div>
        </div>

        {/* Structured Sections */}
        <div className="space-y-10 text-content-body text-sm sm:text-base leading-relaxed">
          {/* Section 1: Service Description */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-navy">
              <span className="w-7 h-7 rounded-full bg-navy/5 text-navy font-bold text-xs flex items-center justify-center font-heading">
                1
              </span>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy">
                About the Business &amp; Service Description
              </h2>
            </div>
            <p>
              WE 4 U (PVT) LTD manufactures and distributes durable, physical identification wristbands paired with a secure, confidential central office emergency contact service for children, vulnerable individuals, and families.
            </p>
            <p>
              Each wristband is stamped with a unique alphanumeric reference code and our central office telephone hotline. When a child wearing the band is lost, disoriented, or in need of assistance, anyone finding the child can contact our central office hotline. Our staff verifies the identification reference in our private registry and immediately coordinates contact with the registered parent or guardian.
            </p>
            <div className="p-4 rounded-brand bg-amber-50/80 border border-amber-200/90 text-sm text-amber-950 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p>
                <strong>Important Hardware Scope:</strong> The We 4 You wristband is a <em>physical identification and communication intermediary device</em>. It contains <strong>no GPS hardware, no cellular radio transmitters, and no battery-powered tracking components</strong>. The service operates via human telephone coordination through our central office.
              </p>
            </div>
          </section>

          {/* Section 2: Ordering, Pricing in LKR & Payment */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-navy">
              <span className="w-7 h-7 rounded-full bg-navy/5 text-navy font-bold text-xs flex items-center justify-center font-heading">
                2
              </span>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy">
                Ordering, Pricing in LKR &amp; Payment Methods
              </h2>
            </div>
            <p>
              Orders may be placed through our official online portal or acquired via authorized retail partner outlets across Sri Lanka:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-sm sm:text-base">
              <li><strong>Currency &amp; Pricing:</strong> All prices displayed on our website for domestic customers in Sri Lanka are quoted and billed in <strong>Sri Lankan Rupees (LKR)</strong> (or designated USD conversions for international orders where specified), inclusive of applicable domestic taxes unless stated otherwise.</li>
              <li><strong>Payment Methods:</strong> We accept payment via major credit and debit cards (Visa, MasterCard), licensed online payment gateways, and direct domestic bank transfers with verified deposit slips.</li>
              <li><strong>Order Confirmation:</strong> An order is deemed accepted once our system issues a valid electronic receipt and order confirmation. We reserve the right to decline or cancel orders in cases of stock unavailability or suspected fraudulent transactions.</li>
            </ul>
          </section>

          {/* Section 3: Delivery Across Sri Lanka */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-navy">
              <span className="w-7 h-7 rounded-full bg-navy/5 text-navy font-bold text-xs flex items-center justify-center font-heading">
                3
              </span>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy">
                Delivery Policy &amp; Timelines (Sri Lanka)
              </h2>
            </div>
            <p>
              We provide delivery coverage across all districts and provinces of Sri Lanka through registered courier and postal logistics partners:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div className="p-4 rounded-brand border border-border-subtle bg-slate-50">
                <span className="text-xs font-semibold uppercase tracking-wider text-navy block mb-1">
                  Delivery Timeframe
                </span>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Orders are typically processed and delivered within <strong>3 to 7 working days</strong> following payment confirmation, depending on delivery location and courier scheduling.
                </p>
              </div>

              <div className="p-4 rounded-brand border border-border-subtle bg-slate-50">
                <span className="text-xs font-semibold uppercase tracking-wider text-navy block mb-1">
                  Shipping Charges
                </span>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Applicable courier shipping fees are clearly calculated and presented at checkout prior to final payment authorization.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Guardian Contact Service & Safety Disclaimer */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-navy">
              <span className="w-7 h-7 rounded-full bg-navy/5 text-navy font-bold text-xs flex items-center justify-center font-heading">
                4
              </span>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy">
                Guardian Service &amp; Safety Disclaimer
              </h2>
            </div>
            <p>
              Customers subscribing to the We 4 You guardian contact service acknowledge and agree to the following operational parameters:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-sm sm:text-base">
              <li><strong>Customer Responsibility:</strong> You are responsible for ensuring all guardian telephone numbers, email addresses, and emergency contacts registered in your profile remain accurate, active, and capable of receiving calls.</li>
              <li><strong>Proper Wear:</strong> Parents and guardians are responsible for ensuring the wristband is comfortably fitted and worn by the child during outings, school trips, and public gatherings.</li>
            </ul>
            <div className="p-5 rounded-brand bg-amber-50/70 border border-amber-200/90 text-sm text-amber-950 space-y-2">
              <div className="flex items-start gap-2.5">
                <ShieldAlert className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                <p className="font-semibold text-amber-900">
                  Critical Safety Disclaimer — Not a Substitute for Adult Supervision:
                </p>
              </div>
              <p className="text-xs sm:text-sm text-amber-800 leading-relaxed pl-7.5">
                The We 4 You identification band and contact service are designed strictly as an <strong>emergency communication aid</strong> to assist in reuniting children with their families. <strong>The band and service DO NOT prevent wandering, abduction, harm, or separation, and DO NOT guarantee a child's safety or physical location.</strong> This service is not a replacement for active parental oversight, attentive guardian supervision, or emergency civil services.
              </p>
            </div>
          </section>

          {/* Section 5: Limitation of Liability */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-navy">
              <span className="w-7 h-7 rounded-full bg-navy/5 text-navy font-bold text-xs flex items-center justify-center font-heading">
                5
              </span>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy">
                Limitation of Liability
              </h2>
            </div>
            <p>
              To the maximum extent permitted by applicable Sri Lankan law:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-sm sm:text-base">
              <li>WE 4 U (PVT) LTD, its directors, officers, employees, and retail partners shall not be held liable for any indirect, incidental, consequential, special, or punitive damages arising from the use of, or inability to use, the identification band or emergency contact service.</li>
              <li>We are not liable for communication delays, telecommunication network failures, unanswered telephone calls, or the independent actions of third-party finders or couriers.</li>
              <li>Our aggregate financial liability for any direct claim arising in connection with any product or service shall strictly not exceed the total fee paid by the customer for that product or service.</li>
            </ul>
          </section>

          {/* Section 6: Intellectual Property & Acceptable Use */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-navy">
              <span className="w-7 h-7 rounded-full bg-navy/5 text-navy font-bold text-xs flex items-center justify-center font-heading">
                6
              </span>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy">
                Intellectual Property &amp; Acceptable Use
              </h2>
            </div>
            <p>
              All trademarks, product names, logos, text, imagery, graphics, software, and band designs associated with <strong>We 4 You</strong> are the exclusive intellectual property of WE 4 U (PVT) LTD and protected under the Intellectual Property Act, No. 36 of 2003 of Sri Lanka.
            </p>
            <p>
              Customers agree not to replicate, counterfeit, reverse-engineer, or misuse our wristbands, brand codes, or registry interfaces. You must not submit fraudulent child registrations or abuse our emergency telephone hotlines with false alarms.
            </p>
          </section>

          {/* Section 7: Associated Policies */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-navy">
              <span className="w-7 h-7 rounded-full bg-navy/5 text-navy font-bold text-xs flex items-center justify-center font-heading">
                7
              </span>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy">
                Associated Policies (Incorporation by Reference)
              </h2>
            </div>
            <p>
              These Terms &amp; Conditions operate alongside our dedicated commercial policies, which are incorporated herein by reference:
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Link
                to="/return-policy"
                className="p-4 rounded-brand border border-border-subtle bg-neutral-soft hover:bg-slate-100 transition-colors flex-1 flex items-center justify-between group"
              >
                <div>
                  <span className="font-semibold text-navy text-sm block group-hover:text-[#088F5B]">
                    Return, Refund &amp; Cancellation Policy
                  </span>
                  <span className="text-xs text-content-muted">7-day returns, inspection, and refund terms</span>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-navy" />
              </Link>

              <Link
                to="/privacy-policy"
                className="p-4 rounded-brand border border-border-subtle bg-neutral-soft hover:bg-slate-100 transition-colors flex-1 flex items-center justify-between group"
              >
                <div>
                  <span className="font-semibold text-navy text-sm block group-hover:text-[#088F5B]">
                    Privacy Policy
                  </span>
                  <span className="text-xs text-content-muted">Sri Lanka PDPA No. 9 of 2022 compliance</span>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-navy" />
              </Link>
            </div>
          </section>

          {/* Section 8: Governing Law & Jurisdiction */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-navy">
              <span className="w-7 h-7 rounded-full bg-navy/5 text-navy font-bold text-xs flex items-center justify-center font-heading">
                8
              </span>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy">
                Governing Law &amp; Jurisdiction
              </h2>
            </div>
            <p>
              These Terms &amp; Conditions and any commercial contracts entered into with WE 4 U (PVT) LTD shall be governed by, construed, and enforced in accordance with the <strong>laws of the Democratic Socialist Republic of Sri Lanka</strong>.
            </p>
            <p>
              Any legal proceeding, dispute, or claim arising out of or related to these Terms or our services shall be subject to the exclusive jurisdiction of the competent courts of Sri Lanka.
            </p>
          </section>

          {/* Section 9: Right to Update Terms */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-navy">
              <span className="w-7 h-7 rounded-full bg-navy/5 text-navy font-bold text-xs flex items-center justify-center font-heading">
                9
              </span>
              <h2 className="text-xl sm:text-2xl font-heading font-bold text-navy">
                Right to Amend Terms
              </h2>
            </div>
            <p>
              WE 4 U (PVT) LTD reserves the right to revise or amend these Terms &amp; Conditions at any time to reflect operational, commercial, or regulatory changes. Updated terms will take effect immediately upon publication on this website, with the date of the revision explicitly noted at the top. Continued use of our wristbands or services following any update indicates acceptance of the amended Terms.
            </p>
          </section>
        </div>

        {/* Official Contact Block */}
        <PolicyContactBlock />
      </div>
    </div>
  );
};

export default TermsPage;
