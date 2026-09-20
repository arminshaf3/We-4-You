import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { AssistanceBanner } from '../../components/public/AssistanceBanner';
import { SectionIntro } from '../../components/common/SectionIntro';
import { useApp } from '../../context/AppContext';
import {
  ArrowRight,
  ClipboardCheck,
  HeartHandshake,
  CheckCircle2,
  PhoneCall,
  Send,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { activeVendors, submitPublicEnquiry, addToast } = useApp();

  // Contact section state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactError, setContactError] = useState('');

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) {
      setContactError('Please complete all fields before sending.');
      return;
    }
    setContactError('');
    submitPublicEnquiry(contactName, contactEmail, 'general_enquiry', contactMessage);
    setContactSubmitted(true);
    addToast('success', 'Message Received', 'Thank you! Our office has received your message (Simulated).');
  };

  return (
    <div className="flex flex-col">
      {/* 1. Full-Fit Hero Section */}
      <section className="relative w-full overflow-hidden bg-[#05294B] min-h-[520px] sm:min-h-[580px] lg:min-h-[640px] flex items-center">
        {/* Full-bleed Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hero-full.jpg"
            alt="Mother and son seated comfortably on sofa with child wearing We 4 You identification wristband"
            className="w-full h-full object-cover object-right select-none pointer-events-none"
            loading="eager"
          />
          {/* Subtle gradient vignette to guarantee 100% text readability across all screen widths */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#05294B] via-[#05294B]/85 via-40% to-transparent lg:via-[#05294B]/30 lg:via-45% lg:to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#05294B]/60 via-transparent to-transparent sm:hidden pointer-events-none" />
        </div>

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 w-full">
          <div className="max-w-xl lg:max-w-2xl space-y-6 sm:space-y-7 text-left">

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] xl:text-[62px] font-heading font-bold text-white leading-[1.12] tracking-tight">
              A little band.<br />
              <span className="text-mint">Protection for everyone.</span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg lg:text-xl text-slate-100 max-w-lg leading-relaxed font-body drop-shadow-sm">
              Instant emergency reconnection &amp; peace of mind for children, seniors, athletes, travelers, and loved ones through our central office.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-1">
              <Button
                to="/register"
                variant="white"
                size="lg"
                className="w-full sm:w-auto shadow-xl hover:shadow-2xl font-heading font-bold text-navy hover:scale-[1.02] transition-all"
              >
                Register a Band
              </Button>
              <Button
                to="/how-it-works"
                variant="outline-white"
                size="lg"
                className="w-full sm:w-auto font-heading font-semibold hover:scale-[1.02] transition-all"
              >
                How It Works
              </Button>
            </div>

            {/* Calm Trust Note */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5 sm:gap-4 text-xs text-slate-200">
              <div className="flex items-center gap-1.5 bg-[#05254C]/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-mint flex-shrink-0" />
                <span>No battery or charging needed</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#05254C]/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-mint flex-shrink-0" />
                <span>Private emergency records</span>
              </div>
              <div className="flex items-center gap-1.5 bg-[#05254C]/60 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-mint flex-shrink-0" />
                <span>All ages &amp; medical alerts</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Compact Navy Office Assistance Banner */}
      <AssistanceBanner />

      {/* 3. Three Simple Steps Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionIntro
            badge="Universal Safety"
            heading="Safety and reconnection in three simple steps."
            paragraph="A straightforward way to provide everyday reassurance for anyone you care about — at home, on trips, or outdoors."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
            {/* Step 1 */}
            <div className="bg-neutral-soft rounded-brand-lg p-8 border border-border-subtle relative hover:border-slate-300 transition-all">
              <div className="w-12 h-12 rounded-full bg-navy text-mint font-heading font-bold text-lg flex items-center justify-center mb-6">
                1
              </div>
              <h3 className="text-xl font-heading font-bold text-navy mb-2.5">
                Register
              </h3>
              <p className="text-base text-content-body leading-relaxed">
                Connect the unique band reference code with your private emergency contact numbers in our secure office registry.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-neutral-soft rounded-brand-lg p-8 border border-border-subtle relative hover:border-slate-300 transition-all">
              <div className="w-12 h-12 rounded-full bg-navy text-mint font-heading font-bold text-lg flex items-center justify-center mb-6">
                2
              </div>
              <h3 className="text-xl font-heading font-bold text-navy mb-2.5">
                Wear
              </h3>
              <p className="text-base text-content-body leading-relaxed">
                The individual wears the lightweight, waterproof, hypoallergenic silicone band everywhere — schools, parks, runs, or travel.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-neutral-soft rounded-brand-lg p-8 border border-border-subtle relative hover:border-slate-300 transition-all">
              <div className="w-12 h-12 rounded-full bg-navy text-mint font-heading font-bold text-lg flex items-center justify-center mb-6">
                3
              </div>
              <h3 className="text-xl font-heading font-bold text-navy mb-2.5">
                Reconnect
              </h3>
              <p className="text-base text-content-body leading-relaxed">
                If assistance is needed, anyone quotes the printed reference code to our central office, and we notify the emergency contacts immediately.
              </p>
            </div>
          </div>

          <div className="text-center mt-10">
            <Link
              to="/how-it-works"
              className="inline-flex items-center gap-2 text-navy font-heading font-semibold text-base hover:text-navy-light transition-colors group"
            >
              <span>Learn more about how the office service works</span>
              <ArrowRight className="w-4 h-4 text-[#088F5B] group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. About Us Preview */}
      <section className="py-16 sm:py-20 bg-mint-pale/50 border-y border-border-subtle">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Visual */}
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="relative rounded-brand-lg overflow-hidden border border-border-subtle shadow-card bg-white">
                <img
                  src="https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=900&q=80"
                  alt="Mother walking warmly with her child in natural daylight"
                  className="w-full h-80 sm:h-96 object-cover"
                />
              </div>
            </div>

            {/* Copy */}
            <div className="lg:col-span-7 space-y-5 order-1 lg:order-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-mint-darker bg-white px-3 py-1 rounded-full border border-emerald-300/60 inline-block">
                Our Purpose
              </span>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-navy leading-tight">
                Care starts with connection.
              </h2>
              <p className="text-lg text-content-body leading-relaxed">
                We 4 You brings families and caring people closer through simple identification bands and an office contact service.
              </p>
              <div className="pt-3">
                <Button to="/about" variant="outline" size="md">
                  More About Us
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Subscription Preview */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto bg-neutral-soft rounded-brand-lg p-8 sm:p-12 border border-border-subtle text-center space-y-6">
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-mint-darker bg-mint-pale px-3 py-1 rounded-full border border-emerald-300/40">
              Service Overview
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-navy">
              One band. Ongoing support.
            </h2>
            <p className="text-lg text-content-body max-w-xl mx-auto leading-relaxed">
              Your band is purchased once from an authorized local shop. An affordable ongoing subscription maintains your private office registry so assistance is always available.
            </p>
            <div className="pt-2">
              <Button to="/subscriptions" variant="primary" size="md">
                Explore Plans
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Registration Introduction & Illustrated Preview */}
      <section className="py-16 sm:py-20 bg-neutral-soft border-t border-border-subtle">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Copy & CTA */}
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-mint-darker bg-white px-3 py-1 rounded-full border border-emerald-300/60 inline-block">
                Ready To Start
              </span>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-navy leading-tight">
                A simple start to staying connected.
              </h2>
              <p className="text-lg text-content-body leading-relaxed">
                Have your band ready. Add the wearer's details, primary and emergency contacts, choose your vendor shop, and select a service plan.
              </p>
              <div className="pt-2">
                <Button to="/register" variant="mint" size="lg">
                  Start Registration
                </Button>
              </div>
            </div>

            {/* Right: Semantic Illustrated Preview Card */}
            <div className="lg:col-span-6">
              <div className="bg-white rounded-brand-lg p-6 sm:p-8 border border-border-subtle shadow-card space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                  <div className="flex items-center gap-2">
                    <ClipboardCheck className="w-5 h-5 text-navy" />
                    <span className="text-sm font-heading font-bold text-navy">Registration Preview</span>
                  </div>
                  <span className="text-xs text-content-muted">Takes ~3 minutes</span>
                </div>

                {/* Illustrated semantic preview rows */}
                <div className="space-y-3 pt-1">
                  <div className="p-3 bg-neutral-soft rounded-brand border border-border-subtle flex items-center justify-between">
                    <div>
                      <span className="text-xs text-content-muted block">Step 1</span>
                      <span className="text-sm font-semibold text-navy">Primary &amp; Emergency Contacts</span>
                    </div>
                    <span className="text-xs font-mono font-medium text-slate-500 bg-white px-2 py-1 rounded border">e.g. Elena Vance</span>
                  </div>

                  <div className="p-3 bg-neutral-soft rounded-brand border border-border-subtle flex items-center justify-between">
                    <div>
                      <span className="text-xs text-content-muted block">Step 2</span>
                      <span className="text-sm font-semibold text-navy">Wearer &amp; Band Reference</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-navy bg-mint-pale px-2 py-1 rounded border border-emerald-300/60">
                      W4Y-XXXX-XX
                    </span>
                  </div>

                  <div className="p-3 bg-neutral-soft rounded-brand border border-border-subtle flex items-center justify-between">
                    <div>
                      <span className="text-xs text-content-muted block">Purchased From</span>
                      <span className="text-sm font-semibold text-navy">Authorized Partner Shop</span>
                    </div>
                    <span className="text-xs text-slate-600 bg-white px-2 py-1 rounded border">
                      {activeVendors[0]?.shopName || 'Local Partner Store'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-content-muted italic text-center pt-2">
                  Click below to open the complete 4-step registration wizard.
                </p>

                <Button to="/register" variant="outline" size="md" className="w-full">
                  Open Guided Registration
                </Button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 7. Contact Us Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            
            {/* Left Column: Heading, Paragraph, and Office Assistance Action */}
            <div className="lg:col-span-5 space-y-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-mint-darker bg-mint-pale px-3 py-1 rounded-full border border-emerald-300/40 inline-block">
                Get In Touch
              </span>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-navy leading-tight">
                We're here to help.
              </h2>
              <p className="text-base sm:text-lg text-content-body leading-relaxed">
                Have a question about your band, registration, or subscription? Our team can guide you through the next step.
              </p>

              <div className="p-5 rounded-brand bg-navy text-white space-y-3">
                <div className="flex items-center gap-3">
                  <PhoneCall className="w-5 h-5 text-mint" />
                  <span className="text-sm font-heading font-semibold">Immediate Assistance</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  If you found a person wearing our band or need immediate office assistance, quote the printed reference to our team.
                </p>
                <Link
                  to="/found-band"
                  className="inline-flex items-center gap-1.5 text-xs font-heading font-semibold text-mint hover:underline"
                >
                  <span>Assistance guidance page</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Compact Form */}
            <div className="lg:col-span-7">
              <div className="bg-neutral-soft rounded-brand-lg p-6 sm:p-8 border border-border-subtle">
                {contactSubmitted ? (
                  <div className="p-6 bg-mint-pale border border-emerald-300 rounded-brand text-center space-y-3">
                    <CheckCircle2 className="w-8 h-8 text-[#088F5B] mx-auto" />
                    <h4 className="text-lg font-heading font-bold text-navy">Message Sent (Demonstration)</h4>
                    <p className="text-sm text-content-body">
                      Thank you, {contactName}! Your enquiry has been added to our office demonstration inbox.
                    </p>
                    <button
                      onClick={() => {
                        setContactSubmitted(false);
                        setContactName('');
                        setContactEmail('');
                        setContactMessage('');
                      }}
                      className="text-xs font-semibold text-navy underline hover:text-navy-light"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    {contactError && (
                      <div className="p-3 bg-red-50 text-red-700 text-xs rounded-brand border border-red-200">
                        {contactError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="hp-name" className="text-sm font-semibold text-navy block mb-1.5">
                          Name
                        </label>
                        <input
                          id="hp-name"
                          type="text"
                          required
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="Your full name"
                          className="w-full h-12 px-4 text-base rounded-brand border border-border-subtle bg-white text-content-body focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy"
                        />
                      </div>

                      <div>
                        <label htmlFor="hp-email" className="text-sm font-semibold text-navy block mb-1.5">
                          Email address
                        </label>
                        <input
                          id="hp-email"
                          type="email"
                          required
                          value={contactEmail}
                          onChange={(e) => setContactEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full h-12 px-4 text-base rounded-brand border border-border-subtle bg-white text-content-body focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="hp-msg" className="text-sm font-semibold text-navy block mb-1.5">
                        Message
                      </label>
                      <textarea
                        id="hp-msg"
                        rows={3}
                        required
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        placeholder="How can we assist you?"
                        className="w-full p-4 text-base rounded-brand border border-border-subtle bg-white text-content-body focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy"
                      />
                    </div>

                    <Button type="submit" variant="primary" size="md" leftIcon={<Send className="w-4 h-4" />}>
                      Send Message
                    </Button>

                    <p className="text-[11px] text-content-muted">
                      Demonstration mode: Your message is logged directly into the administrator demonstration inbox.
                    </p>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 8. Full Landscape Wristband Showcase Section (Directly Above Footer) */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-neutral-soft via-white to-neutral-soft border-t border-border-subtle overflow-hidden">
        <div className="max-w-container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 space-y-4">
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-mint-darker bg-mint-pale px-3.5 py-1.5 rounded-full border border-emerald-300/40">
              Comfortable, Universal &amp; Durable Design
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-navy tracking-tight">
              Designed for everyone.
            </h2>
            <p className="text-base sm:text-lg text-content-body leading-relaxed">
              Crafted from ultra-soft, hypoallergenic silicone with curved stainless steel ID plates. Waterproof, lightweight, and engineered for children, seniors, runners, and everyday wearers.
            </p>
          </div>

          {/* Full-width Landscape Product Image Banner */}
          <div className="relative rounded-brand-2xl overflow-hidden shadow-2xl border border-slate-200/80 bg-white group">
            <img
              src="/wristbands-colors-showcase.jpg"
              alt="We 4 You identification wristbands in Mint Green, Coral Red, Vibrant Orange, Royal Purple, Clean White, and Deep Navy"
              className="w-full h-auto object-cover select-none transition-transform duration-700 group-hover:scale-[1.01]"
              loading="lazy"
            />
            {/* Subtle bottom glassmorphic specs bar */}
            <div className="bg-navy/95 backdrop-blur-md px-6 py-4 text-white flex flex-wrap items-center justify-between gap-4 border-t border-white/10">
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-medium text-slate-200">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-mint flex-shrink-0" /> BPA-Free Hypoallergenic Silicone</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-mint flex-shrink-0" /> Laser-Engraved Contact Info</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-mint flex-shrink-0" /> 100% Waterproof &amp; Adventure-Ready</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-mint flex-shrink-0" /> Breathable Adjustable Clasp</span>
              </div>
              <Button to="/register" variant="mint" size="sm" className="font-heading font-semibold">
                Register Your Band
              </Button>
            </div>
          </div>

          {/* Color Palette Indicators */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs text-content-body font-medium">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-[#35F5AD] border border-black/10 shadow-sm" />
              <span>Mint Green</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-[#FF6B6B] border border-black/10 shadow-sm" />
              <span>Coral Red</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-[#FF8C38] border border-black/10 shadow-sm" />
              <span>Sunset Orange</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-[#7C3AED] border border-black/10 shadow-sm" />
              <span>Royal Purple</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-[#FFFFFF] border border-slate-300 shadow-sm" />
              <span>Crisp White</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-[#0D0957] border border-black/10 shadow-sm" />
              <span>Classic Navy</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
