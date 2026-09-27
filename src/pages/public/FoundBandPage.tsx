import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { FormField, Input, Textarea } from '../../components/common/FormField';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { useApp } from '../../context/AppContext';
import {
  PhoneCall,
  ShieldCheck,
  Heart,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  User,
  Phone,
  FileText,
  Lock,
  ArrowRight,
} from 'lucide-react';

export const FoundBandPage: React.FC = () => {
  const { publicCode } = useParams<{ publicCode?: string }>();
  const { settings, submitPublicFoundReport } = useApp();

  // Form State
  const [bandCode, setBandCode] = useState(publicCode || '');
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    success: boolean;
    incidentRef: string;
    message: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (publicCode) {
      setBandCode(publicCode.toUpperCase());
    }
  }, [publicCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!bandCode.trim()) {
      setErrorMsg('Please enter the wristband reference code.');
      return;
    }

    if (!reporterPhone.trim()) {
      setErrorMsg('Please enter a telephone number so our support coordinator can contact you.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitPublicFoundReport({
        bandCode: bandCode.toUpperCase().trim(),
        callerName: reporterName.trim() || 'Anonymous Finder',
        callerContact: reporterPhone.trim(),
        voluntaryLocation: location.trim() || 'Location not specified',
        notes: description.trim() || 'Report submitted via public found-child web portal.',
        reportType: 'child_found',
      });

      setSubmissionResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while submitting the report. Please call our office directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmissionResult(null);
    setBandCode('');
    setReporterName('');
    setReporterPhone('');
    setLocation('');
    setDescription('');
    setErrorMsg('');
  };

  return (
    <div className="py-10 sm:py-16 bg-white min-h-[80vh]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'Found a Child or Band' }]} className="mb-8" />

        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="w-16 h-16 rounded-full bg-mint-pale border border-emerald-300 flex items-center justify-center mx-auto mb-4 text-navy shadow-sm">
            <Heart className="w-8 h-8 text-[#088F5B]" />
          </div>
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-mint-darker bg-mint-pale px-3 py-1 rounded-full mb-3 border border-emerald-300/40">
            Emergency Assistance &amp; Reconnection
          </span>
          <h1 className="text-3xl sm:text-5xl font-heading font-bold text-navy leading-tight tracking-tight">
            Have you found a child or lost band?
          </h1>
          <p className="text-base sm:text-lg text-content-body mt-3 leading-relaxed">
            Thank you for stepping in to help. If you have found a person wearing a We 4 You identification wristband, you can report it instantly below or call our 24/7 office helpline.
          </p>
        </div>

        {/* Primary Hotline Banner */}
        <div className="bg-navy text-white rounded-brand-lg p-6 sm:p-8 border border-navy-light shadow-card space-y-6 mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/15">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-mint block">
                Direct Emergency Office Helpline
              </span>
              <span className="text-2xl sm:text-3xl font-heading font-bold text-white mt-1 block">
                {settings.officePhone}
              </span>
            </div>
            <a
              href={`tel:${settings.officePhone.replace(/[^0-9+]/g, '')}`}
              className="inline-flex items-center justify-center h-12 px-6 rounded-brand bg-mint text-navy font-heading font-bold text-base hover:brightness-105 transition-all gap-2 self-start sm:self-auto shadow-md"
            >
              <PhoneCall className="w-5 h-5" />
              <span>Call Helpline Now</span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm text-slate-200">
            <div className="bg-white/10 p-3.5 rounded-brand">
              <strong className="block text-white font-semibold mb-1">1. Keep Safe</strong>
              <span>Stay with the person in a safe, visible public area (e.g., mall security, park office, customer desk).</span>
            </div>
            <div className="bg-white/10 p-3.5 rounded-brand">
              <strong className="block text-white font-semibold mb-1">2. Note Band Code</strong>
              <span>Locate the reference code printed on their wristband (e.g. <span className="font-mono text-mint font-bold">W4Y-1082-M4</span>).</span>
            </div>
            <div className="bg-white/10 p-3.5 rounded-brand">
              <strong className="block text-white font-semibold mb-1">3. Report or Call</strong>
              <span>Submit the form below or call our staff to immediately connect with the registered guardian.</span>
            </div>
          </div>
        </div>

        {/* Main Interaction: Report Form OR Confirmation Card */}
        {submissionResult ? (
          <div className="bg-mint-pale border border-emerald-300 rounded-brand-lg p-6 sm:p-10 shadow-subtle mb-10 text-center space-y-6 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-white border border-emerald-300 flex items-center justify-center mx-auto text-[#088F5B] shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-mono uppercase tracking-wider font-bold text-mint-darker bg-white px-3 py-1 rounded-full border border-emerald-300">
                Incident Reference: {submissionResult.incidentRef}
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-bold text-navy mt-3">
                Report Successfully Received
              </h2>
              <p className="text-sm text-content-body mt-2 max-w-xl mx-auto leading-relaxed">
                {submissionResult.message}
              </p>
            </div>

            <div className="bg-white p-5 rounded-brand border border-emerald-300 max-w-lg mx-auto text-left text-xs sm:text-sm space-y-2 text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-content-muted">Band Reference:</span>
                <span className="font-mono font-bold text-navy">{bandCode.toUpperCase()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-content-muted">Report Status:</span>
                <span className="font-semibold text-amber-700">Dispatched &bull; Contacting Guardian</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-content-muted">Next Step:</span>
                <span className="font-medium text-navy">Our coordinator will call {reporterPhone} shortly.</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href={`tel:${settings.officePhone.replace(/[^0-9+]/g, '')}`}
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-brand bg-navy text-white text-sm font-semibold hover:bg-navy-light transition-all gap-2"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call Dispatch Coordinator ({settings.officePhone})</span>
              </a>
              <Button onClick={handleReset} variant="outline" size="md">
                Submit Another Report
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-neutral-soft rounded-brand-lg p-6 sm:p-10 border border-border-subtle shadow-subtle mb-10">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-subtle">
              <div className="w-10 h-10 rounded-full bg-navy text-mint flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5 text-mint" />
              </div>
              <div>
                <h3 className="text-xl font-heading font-bold text-navy">
                  Public Found-Child Report Form
                </h3>
                <p className="text-xs text-content-body">
                  Submit details immediately so our emergency staff can alert the verified family.
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-6 p-4 rounded-brand bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Band Code */}
                <div>
                  <FormField
                    label="Printed Band Reference Code"
                    required
                    hint="Look on the outer surface of the wristband (e.g. W4Y-1082-M4)"
                  >
                    <div className="relative">
                      <Input
                        type="text"
                        value={bandCode}
                        onChange={(e) => setBandCode(e.target.value.toUpperCase())}
                        placeholder="e.g. W4Y-1082-M4"
                        required
                        className="font-mono uppercase font-bold text-base tracking-wider"
                      />
                    </div>
                  </FormField>
                </div>

                {/* Reporter Phone */}
                <div>
                  <FormField
                    label="Your Contact Telephone"
                    required
                    hint="Required so our coordinator can call you to facilitate the reunion"
                  >
                    <Input
                      type="tel"
                      value={reporterPhone}
                      onChange={(e) => setReporterPhone(e.target.value)}
                      placeholder="e.g. +94 77 123 4567"
                      required
                    />
                  </FormField>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Reporter Name */}
                <div>
                  <FormField
                    label="Your Name (Optional)"
                    hint="e.g. Security Officer John / Park Warden"
                  >
                    <Input
                      type="text"
                      value={reporterName}
                      onChange={(e) => setReporterName(e.target.value)}
                      placeholder="e.g. Samantha Silva"
                    />
                  </FormField>
                </div>

                {/* Current Location */}
                <div>
                  <FormField
                    label="Current Safe Location"
                    hint="Where you and the wearer are located right now"
                  >
                    <Input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Majestic City Mall, Ground Floor Info Desk"
                    />
                  </FormField>
                </div>
              </div>

              {/* Description / Situation */}
              <div>
                <FormField
                  label="Description / Condition Notes"
                  hint="Any helpful details regarding the situation or condition of the wearer"
                >
                  <Textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Child is safe, wearing blue shirt, waiting with mall security staff."
                  />
                </FormField>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-content-muted">
                  <Lock className="w-3.5 h-3.5 text-navy flex-shrink-0" />
                  <span>Secure encrypted submission &bull; Private guardian records remain confidential.</span>
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isSubmitting}
                  leftIcon={<ShieldCheck className="w-5 h-5 text-mint" />}
                >
                  Submit Found Report
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Privacy and Security Guarantee Notice */}
        <div className="p-6 bg-slate-50 rounded-brand-lg border border-slate-200 text-xs text-content-muted space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm text-navy">
            <ShieldCheck className="w-5 h-5 text-navy" />
            <span>Strict Privacy &amp; Family Protection Policy</span>
          </div>
          <p className="leading-relaxed">
            To prevent child exploitation and protect family privacy, this public portal <strong>never</strong> displays wearer addresses, guardian telephone numbers, child health data, or family subscription information online. Band codes act as private identification tokens routed exclusively through trained, vetted We 4 You emergency staff.
          </p>
          <div className="pt-1 flex items-center gap-4 text-xs font-semibold text-navy">
            <Link to="/privacy" className="hover:underline flex items-center gap-1">
              <span>Read Full Privacy Notice</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
            <Link to="/how-it-works" className="hover:underline flex items-center gap-1">
              <span>How We 4 You Works</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
