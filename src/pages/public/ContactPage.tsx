import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { FormField, Input, Select, Textarea } from '../../components/common/FormField';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { useApp } from '../../context/AppContext';
import { Phone, Mail, MapPin, Clock, PhoneCall, Send, CheckCircle2, ShieldAlert } from 'lucide-react';
import { EnquiryTopic } from '../../types';

export const ContactPage: React.FC = () => {
  const { settings, submitPublicEnquiry, addToast } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState<EnquiryTopic>('general_enquiry');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please complete all required fields.');
      return;
    }
    setError('');
    submitPublicEnquiry(name.trim(), email.trim(), topic, message.trim());
    setIsSubmitted(true);
    addToast('success', 'Message Recorded', 'Your message has been sent to our demonstration inbox.');
  };

  return (
    <div className="py-10 sm:py-16 bg-white">
      <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
        
        <Breadcrumbs items={[{ label: 'Contact Us' }]} className="mb-8" />

        {/* Page Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-mint-darker bg-mint-pale px-3 py-1 rounded-full mb-3 border border-emerald-300/40">
            Support &amp; Inquiries
          </span>
          <h1 className="text-4xl sm:text-5xl font-heading font-bold text-navy leading-tight tracking-tight">
            We're here to help.
          </h1>
          <p className="text-xl text-content-body mt-4 leading-relaxed">
            Have a question about your band, registration, or subscription? Our team can guide you through the next step.
          </p>
        </div>

        {/* Priority Assistance Callout */}
        <div className="p-6 bg-navy text-white rounded-brand-lg mb-12 border border-navy-light flex flex-col md:flex-row items-center justify-between gap-6 shadow-card">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-mint/20 border border-mint/40 flex items-center justify-center flex-shrink-0 text-mint mt-0.5">
              <PhoneCall className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-heading font-bold text-white">
                Time-Sensitive Band Assistance
              </h3>
              <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
                If you have found a person wearing our band or need immediate emergency contact coordination, please do not use the contact form. Use our dedicated assistance guidance or phone our office directly.
              </p>
            </div>
          </div>
          <div className="flex-shrink-0">
            <Button to="/found-band" variant="mint" size="md">
              Found Band Guidance
            </Button>
          </div>
        </div>

        {/* Two-Column: Office Details vs Contact Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left: Office Information (From Configuration) */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="text-2xl font-heading font-bold text-navy">
              Office Details
            </h3>

            <div className="space-y-4 text-sm text-content-body">
              <div className="flex items-start gap-3.5 p-4 rounded-brand bg-neutral-soft border border-border-subtle">
                <Phone className="w-5 h-5 text-navy flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-content-muted block">Office Telephone</span>
                  <span className="text-base font-bold text-navy">{settings.officePhone}</span>
                  <span className="text-xs text-content-muted block mt-0.5">Assistance &amp; general enquiries</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-brand bg-neutral-soft border border-border-subtle">
                <Mail className="w-5 h-5 text-navy flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-content-muted block">Email Address</span>
                  <span className="text-base font-bold text-navy">{settings.officeEmail}</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-brand bg-neutral-soft border border-border-subtle">
                <MapPin className="w-5 h-5 text-navy flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-content-muted block">Postal Address</span>
                  <span className="text-sm text-navy">{settings.officeAddress}</span>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-4 rounded-brand bg-neutral-soft border border-border-subtle">
                <Clock className="w-5 h-5 text-navy flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-content-muted block">Office Operating Hours</span>
                  <span className="text-sm text-navy">{settings.officeHours}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-brand border border-slate-200 text-xs text-content-muted">
              <strong>Demonstration Notice:</strong> Submissions on this page create demo enquiries in the administrator demonstration dashboard.
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-brand-lg border border-border-subtle shadow-card p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-heading font-bold text-navy mb-2">
                Send an Enquiry
              </h3>
              <p className="text-sm text-content-muted mb-6">
                Our support staff will review your query and get back to you promptly.
              </p>

              {isSubmitted ? (
                <div className="p-8 bg-mint-pale border border-emerald-300 rounded-brand text-center space-y-4 animate-in fade-in">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-[#088F5B]">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-xl font-heading font-bold text-navy">
                    Enquiry Logged (Demonstration)
                  </h4>
                  <p className="text-sm text-content-body max-w-md mx-auto leading-relaxed">
                    Thank you, {name}! Your message regarding{' '}
                    <strong>{topic.replace('_', ' ')}</strong> has been received and added to the admin enquiries list.
                  </p>
                  <Button
                    onClick={() => {
                      setIsSubmitted(false);
                      setName('');
                      setEmail('');
                      setMessage('');
                    }}
                    variant="outline"
                    size="md"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-50 text-red-700 text-xs rounded-brand border border-red-200">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Full Name" id="c-name" required>
                      <Input
                        id="c-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Clara Oswald"
                        required
                      />
                    </FormField>

                    <FormField label="Email Address" id="c-email" required>
                      <Input
                        id="c-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="clara.o@example.com"
                        required
                      />
                    </FormField>
                  </div>

                  <FormField label="Topic" id="c-topic" required>
                    <Select
                      id="c-topic"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value as EnquiryTopic)}
                    >
                      <option value="registration">Registration Assistance</option>
                      <option value="subscription">Subscription &amp; Renewal</option>
                      <option value="band_replacement">Band Replacement</option>
                      <option value="vendor_enquiry">Vendor / Retailer Partnership</option>
                      <option value="general_enquiry">General Enquiry</option>
                    </Select>
                  </FormField>

                  <FormField label="Message" id="c-message" required>
                    <Textarea
                      id="c-message"
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please describe your question or request in detail..."
                      required
                    />
                  </FormField>

                  <div className="pt-2 flex justify-end">
                    <Button type="submit" variant="primary" size="lg" leftIcon={<Send className="w-4 h-4" />}>
                      Submit Enquiry
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
