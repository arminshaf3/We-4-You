import React, { useState } from 'react';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { Button } from '../../components/common/Button';
import { ChevronDown, HelpCircle, PhoneCall } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

export const FaqPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      category: 'Location & Tracking',
      question: 'Does the band track my child’s live GPS location?',
      answer:
        'This identification band does not provide GPS tracking. It helps our office contact registered guardians using the band reference. The band contains no battery, SIM card, or electronic transmitter, making it waterproof, lightweight, and durable.',
    },
    {
      category: 'Registration',
      question: 'How do I register our identification band?',
      answer:
        'Registration is completed on our website in four simple steps. You will provide your guardian contact details, child’s name, printed band reference, and the shop where the band was purchased.',
    },
    {
      category: 'Band Codes',
      question: 'Where do I find the band reference code?',
      answer:
        'The unique reference code (formatted e.g. W4Y-7821-K9) is permanently laser-engraved on the outer surface of your band alongside our office phone number and website address.',
    },
    {
      category: 'Subscriptions',
      question: 'Why is there an ongoing subscription for the service?',
      answer:
        'The wristband is purchased once from an authorized local shop. The subscription covers the maintenance of your private registry file and staffing of our office contact team so assistance is available whenever needed.',
    },
    {
      category: 'Renewals',
      question: 'How do I renew our subscription when it expires?',
      answer:
        'You can renew your plan through our office. Early renewal automatically extends from your current expiration date without interruption, and you do not need to replace your existing band.',
    },
    {
      category: 'Replacements',
      question: 'What happens if our band is lost or damaged?',
      answer:
        'If your band is lost or damaged, contact our office. We can issue a replacement band and link it directly to your existing child file and subscription, retiring the old band reference from service.',
    },
    {
      category: 'Vendor Shops',
      question: 'Why do I need to select the shop where I bought the band?',
      answer:
        'Selecting your retail shop during registration verifies the authenticity of your band and enables our office to attribute authorized retail partner commissions accurately.',
    },
    {
      category: 'Contact Updates',
      question: 'How do I keep my phone number and emergency contacts up to date?',
      answer:
        'If you change telephone numbers or move, please contact our office. For security and child safety, guardian contact updates require verification by our office staff before being updated.',
    },
    {
      category: 'Privacy',
      question: 'Can strangers see my personal phone number on the band?',
      answer:
        'No. Only our office contact number and the unique band reference code are printed on the band. Your private phone number, child’s name, and home address are never displayed publicly.',
    },
    {
      category: 'Policies',
      question: 'What are the commercial cancellation and refund terms?',
      answer:
        'Commercial and refund policies are currently draft terms subject to official confirmation with our office management. Please contact our office directly for policy clarifications.',
    },
  ];

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="py-10 sm:py-16 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Breadcrumbs items={[{ label: 'Frequently Asked Questions' }]} className="mb-8" />

        {/* Page Header */}
        <div className="mb-10 text-center sm:text-left">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-mint-darker bg-mint-pale px-3 py-1 rounded-full mb-3 border border-emerald-300/40">
            Got Questions?
          </span>
          <h1 className="text-3xl sm:text-4xl font-heading font-bold text-navy leading-tight tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-base sm:text-lg text-content-body mt-2">
            Clear, practical answers about our bands, registration process, privacy, and office contact service.
          </p>
        </div>

        {/* Accessible Accordions */}
        <div className="space-y-3 mb-12">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-brand border border-border-subtle overflow-hidden bg-neutral-soft/50 transition-colors hover:border-slate-300"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  aria-expanded={isOpen}
                  className="w-full py-4 px-5 text-left flex items-center justify-between gap-4 font-heading font-semibold text-navy text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-navy"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-500 transition-transform duration-200 flex-shrink-0 ${
                      isOpen ? 'transform rotate-180 text-navy' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm text-content-body leading-relaxed border-t border-border-subtle/50 bg-white animate-in fade-in duration-150">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still have questions banner */}
        <div className="bg-neutral-soft rounded-brand-lg p-6 sm:p-8 border border-border-subtle text-center space-y-4">
          <HelpCircle className="w-8 h-8 text-navy mx-auto" />
          <h3 className="text-xl font-heading font-bold text-navy">
            Have a question not listed here?
          </h3>
          <p className="text-sm text-content-body max-w-md mx-auto">
            Our office team is ready to guide you with any questions about your band, registration, or plan renewal.
          </p>
          <div className="pt-2">
            <Button to="/contact" variant="primary" size="md" leftIcon={<PhoneCall className="w-4 h-4" />}>
              Contact Our Office
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
};
