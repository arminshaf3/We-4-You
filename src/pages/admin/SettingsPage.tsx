import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/admin/PageHeader';
import { Button } from '../../components/common/Button';
import { FormField, Input } from '../../components/common/FormField';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Save,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  MapPin,
  Clock,
  Globe2,
  Percent,
  Sliders,
  Eye,
  Server,
  Database,
  Lock,
  Sparkles,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  Check,
  Layers,
  FileText,
  BadgePercent,
  Store,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetDemoData } = useApp();

  const [officePhone, setOfficePhone] = useState(settings.officePhone);
  const [officeEmail, setOfficeEmail] = useState(settings.officeEmail);
  const [officeAddress, setOfficeAddress] = useState(settings.officeAddress);
  const [officeHours, setOfficeHours] = useState(settings.officeHours);
  const [availableLanguages, setAvailableLanguages] = useState<string[]>(
    settings.availableLanguages || ['English', 'Spanish', 'French', 'Arabic']
  );
  const [directPurchaseEnabled, setDirectPurchaseEnabled] = useState(settings.directPurchaseEnabled);
  const [allowPhotoUpload, setAllowPhotoUpload] = useState(settings.allowPhotoUpload);
  const [defaultCommPct, setDefaultCommPct] = useState(settings.defaultCommissionPercentage);
  const [defaultCommFixed, setDefaultCommFixed] = useState(settings.defaultCommissionFixed || 10);
  const [simulationNote, setSimulationNote] = useState(settings.simulationNote || '');
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  // Sync state if context changes externally
  useEffect(() => {
    setOfficePhone(settings.officePhone);
    setOfficeEmail(settings.officeEmail);
    setOfficeAddress(settings.officeAddress);
    setOfficeHours(settings.officeHours);
    setAvailableLanguages(settings.availableLanguages || ['English', 'Spanish', 'French', 'Arabic']);
    setDirectPurchaseEnabled(settings.directPurchaseEnabled);
    setAllowPhotoUpload(settings.allowPhotoUpload);
    setDefaultCommPct(settings.defaultCommissionPercentage);
    setDefaultCommFixed(settings.defaultCommissionFixed || 10);
    setSimulationNote(settings.simulationNote || '');
  }, [settings]);

  const hasUnsavedChanges =
    officePhone !== settings.officePhone ||
    officeEmail !== settings.officeEmail ||
    officeAddress !== settings.officeAddress ||
    officeHours !== settings.officeHours ||
    directPurchaseEnabled !== settings.directPurchaseEnabled ||
    allowPhotoUpload !== settings.allowPhotoUpload ||
    Number(defaultCommPct) !== settings.defaultCommissionPercentage ||
    Number(defaultCommFixed) !== (settings.defaultCommissionFixed || 10) ||
    simulationNote !== (settings.simulationNote || '');

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateSettings({
      officePhone: officePhone.trim(),
      officeEmail: officeEmail.trim(),
      officeAddress: officeAddress.trim(),
      officeHours: officeHours.trim(),
      availableLanguages,
      directPurchaseEnabled,
      allowPhotoUpload,
      defaultCommissionPercentage: Number(defaultCommPct),
      defaultCommissionFixed: Number(defaultCommFixed),
      simulationNote: simulationNote.trim(),
    });
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 3000);
  };

  const toggleLanguage = (lang: string) => {
    if (availableLanguages.includes(lang)) {
      if (availableLanguages.length > 1) {
        setAvailableLanguages(availableLanguages.filter((l) => l !== lang));
      }
    } else {
      setAvailableLanguages([...availableLanguages, lang]);
    }
  };

  const allSupportedLanguages = ['English', 'Spanish', 'French', 'Arabic', 'German', 'Italian', 'Portuguese'];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title="System & Brand Configuration"
          description="Centralized configuration management for public office contact, parent registration policies, and partner commission defaults."
        />

        {/* Global Environment Status Badges */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Cloud DB Connected
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            TLS 1.3 Encrypted
          </div>
        </div>
      </div>

      {/* Main Grid: 8 Cols Form / 4 Cols Live Preview & System Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (8 cols): Form Sections */}
        <form onSubmit={handleSave} className="lg:col-span-8 space-y-8">
          
          {/* Section 1: Public Office & Contact Information */}
          <div className="bg-white rounded-brand border border-border-subtle shadow-subtle p-6 sm:p-7 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-navy/5 border border-navy/10 flex items-center justify-center text-navy font-bold shadow-xs">
                  <Building2 className="w-5 h-5 text-navy" />
                </div>
                <div>
                  <h2 className="text-base font-heading font-bold text-navy">Public Office & Contact Details</h2>
                  <p className="text-xs text-content-muted">Information published on citizen portals, band packaging, and parent communications.</p>
                </div>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1 text-2xs font-semibold uppercase tracking-wider text-navy bg-navy/5 border border-navy/10 px-2.5 py-1 rounded-md">
                Public Facing
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField label="Official Helpline Number" required hint="Appears on band QR cards and emergency contact screens">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={officePhone}
                    onChange={(e) => setOfficePhone(e.target.value)}
                    required
                    placeholder="+1 (800) 555-WE4U"
                    className="w-full h-11 pl-10 pr-4 text-sm font-medium rounded-brand border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-navy transition-all focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
                  />
                </div>
              </FormField>

              <FormField label="Support & Dispatch Email" required hint="Receives inbound inquiries and incident report copies">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    value={officeEmail}
                    onChange={(e) => setOfficeEmail(e.target.value)}
                    required
                    placeholder="support@we4you-contact.org"
                    className="w-full h-11 pl-10 pr-4 text-sm font-medium rounded-brand border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-navy transition-all focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
                  />
                </div>
              </FormField>
            </div>

            <FormField label="Central Headquarters Address" hint="Physical headquarters address listed for correspondence and returns">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <MapPin className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={officeAddress}
                  onChange={(e) => setOfficeAddress(e.target.value)}
                  placeholder="We 4 You Central Office, 400 Harmony Way, Suite 210"
                  className="w-full h-11 pl-10 pr-4 text-sm font-medium rounded-brand border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-navy transition-all focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
                />
              </div>
            </FormField>

            <FormField label="Operating Hours & Support Schedule" hint="Office availability hours communicated to parents and vendors">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Clock className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={officeHours}
                  onChange={(e) => setOfficeHours(e.target.value)}
                  placeholder="Monday – Friday, 8:00 AM – 6:00 PM EST"
                  className="w-full h-11 pl-10 pr-4 text-sm font-medium rounded-brand border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-navy transition-all focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
                />
              </div>
            </FormField>

            {/* Supported Languages */}
            <div className="pt-2">
              <label className="text-xs font-semibold text-navy flex items-center gap-1.5 mb-2">
                <Globe2 className="w-3.5 h-3.5 text-navy" />
                <span>Supported Portal Languages</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {allSupportedLanguages.map((lang) => {
                  const active = availableLanguages.includes(lang);
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleLanguage(lang)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        active
                          ? 'bg-navy text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {active && <Check className="w-3 h-3 text-brand-mint" />}
                      {lang}
                    </button>
                  );
                })}
              </div>
              <p className="text-2xs text-content-muted mt-2">
                Selected languages will be made available in the citizen registration header dropdown.
              </p>
            </div>
          </div>

          {/* Section 2: Operational & Registration Safety Switches */}
          <div className="bg-white rounded-brand border border-border-subtle shadow-subtle p-6 sm:p-7 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-navy/5 border border-navy/10 flex items-center justify-center text-navy font-bold shadow-xs">
                  <ShieldCheck className="w-5 h-5 text-navy" />
                </div>
                <div>
                  <h2 className="text-base font-heading font-bold text-navy">Operational & Safety Policies</h2>
                  <p className="text-xs text-content-muted">Feature flags and policy toggles governing public registration behavior.</p>
                </div>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1 text-2xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                Policy Active
              </span>
            </div>

            <div className="space-y-4">
              
              {/* Switch 1: Direct Office Band Purchases */}
              <div
                onClick={() => setDirectPurchaseEnabled(!directPurchaseEnabled)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-4 select-none ${
                  directPurchaseEnabled
                    ? 'bg-navy/[0.02] border-navy/30 ring-1 ring-navy/10'
                    : 'bg-slate-50/70 border-slate-200 opacity-80'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`mt-0.5 p-2 rounded-lg ${directPurchaseEnabled ? 'bg-navy text-white' : 'bg-slate-200 text-slate-500'}`}>
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-sm text-navy">Allow Direct Office Band Purchases</span>
                      <span className={`text-2xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        directPurchaseEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {directPurchaseEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-xs text-content-muted mt-1 leading-relaxed">
                      Enables a "Purchased directly from We 4 You Office" option in the registration dropdown alongside authorized partner stores.
                    </p>
                  </div>
                </div>

                {/* Custom Toggle Switch */}
                <div className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  directPurchaseEnabled ? 'bg-navy' : 'bg-slate-300'
                }`}>
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    directPurchaseEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </div>
              </div>

              {/* Switch 2: Wearer Photo Capture */}
              <div
                onClick={() => setAllowPhotoUpload(!allowPhotoUpload)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-4 select-none ${
                  allowPhotoUpload
                    ? 'bg-navy/[0.02] border-navy/30 ring-1 ring-navy/10'
                    : 'bg-slate-50/70 border-slate-200 opacity-80'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`mt-0.5 p-2 rounded-lg ${allowPhotoUpload ? 'bg-navy text-white' : 'bg-slate-200 text-slate-500'}`}>
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-sm text-navy">Enable Wearer Photo Upload in Registration</span>
                      <span className={`text-2xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        allowPhotoUpload ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {allowPhotoUpload ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-xs text-content-muted mt-1 leading-relaxed">
                      Allows parents to attach an encrypted, secure photo for instant visual identity confirmation in lost-child recovery situations.
                    </p>
                  </div>
                </div>

                {/* Custom Toggle Switch */}
                <div className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  allowPhotoUpload ? 'bg-navy' : 'bg-slate-300'
                }`}>
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    allowPhotoUpload ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </div>
              </div>

            </div>
          </div>

          {/* Section 3: Commercial & Retail Financial Defaults */}
          <div className="bg-white rounded-brand border border-border-subtle shadow-subtle p-6 sm:p-7 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-navy/5 border border-navy/10 flex items-center justify-center text-navy font-bold shadow-xs">
                  <BadgePercent className="w-5 h-5 text-navy" />
                </div>
                <div>
                  <h2 className="text-base font-heading font-bold text-navy">Partner Store & Financial Defaults</h2>
                  <p className="text-xs text-content-muted">Base commission percentages and automated fee structures applied to new partner stores.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Default Commission Percentage */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-navy flex items-center justify-between">
                  <span>Default Retail Commission Rate (%)</span>
                  <span className="font-mono font-bold text-navy bg-navy/5 px-2 py-0.5 rounded border border-navy/10">
                    {defaultCommPct}%
                  </span>
                </label>
                
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="1"
                    value={defaultCommPct}
                    onChange={(e) => setDefaultCommPct(Number(e.target.value))}
                    className="w-full accent-navy cursor-pointer h-2 bg-slate-200 rounded-lg"
                  />
                  <div className="relative w-24 flex-shrink-0">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={defaultCommPct}
                      onChange={(e) => setDefaultCommPct(Number(e.target.value))}
                      className="w-full h-10 px-3 text-sm font-semibold rounded-brand border border-slate-200 text-navy text-center focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
                    />
                    <span className="absolute right-2.5 top-2.5 text-xs text-slate-400 font-bold">%</span>
                  </div>
                </div>

                {/* Preset Chips */}
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-2xs text-slate-400 font-medium mr-1">Presets:</span>
                  {[5, 10, 15, 20, 25].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setDefaultCommPct(pct)}
                      className={`text-2xs font-semibold px-2 py-0.5 rounded transition-all ${
                        defaultCommPct === pct
                          ? 'bg-navy text-white font-bold'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
                <p className="text-2xs text-content-muted">Pre-filled rate when onboarding new physical retail partners.</p>
              </div>

              {/* Default Fixed Commission */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-navy flex items-center justify-between">
                  <span>Default Fixed Commission Bonus ($/£)</span>
                  <span className="font-mono font-bold text-navy bg-navy/5 px-2 py-0.5 rounded border border-navy/10">
                    ${defaultCommFixed}.00
                  </span>
                </label>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold">
                    $
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.50"
                    value={defaultCommFixed}
                    onChange={(e) => setDefaultCommFixed(Number(e.target.value))}
                    className="w-full h-10 pl-8 pr-4 text-sm font-semibold rounded-brand border border-slate-200 bg-white text-navy focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
                  />
                </div>
                <p className="text-2xs text-content-muted">Optional fixed per-unit bounty added to standard percentage payouts.</p>
              </div>

            </div>
          </div>

          {/* Section 4: Operational System Note */}
          <div className="bg-white rounded-brand border border-border-subtle shadow-subtle p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border-subtle text-navy font-heading font-bold text-sm">
              <FileText className="w-4 h-4 text-navy" />
              <span>Operational System Memo</span>
            </div>
            <FormField label="Internal System Status Notice" hint="Internal operational header broadcast to all authenticated staff members">
              <input
                type="text"
                value={simulationNote}
                onChange={(e) => setSimulationNote(e.target.value)}
                placeholder="Active System Mode — Connected to We 4 You secure network."
                className="w-full h-11 px-4 text-sm font-medium rounded-brand border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-navy transition-all focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
              />
            </FormField>
          </div>

          {/* Mobile Save Action */}
          <div className="lg:hidden flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={resetDemoData}
              leftIcon={<RefreshCw className="w-4 h-4 text-slate-500" />}
            >
              Restore Defaults
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Configuration
            </Button>
          </div>

        </form>

        {/* Right Column (4 cols): Live Preview & Infrastructure Hub */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Action Card (Sticky) */}
          <div className="bg-white rounded-brand border border-border-subtle shadow-subtle p-5 space-y-4 sticky top-6 z-10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Configuration Actions</span>
              {hasUnsavedChanges && (
                <span className="inline-flex items-center gap-1 text-2xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  <AlertCircle className="w-3 h-3 text-amber-600" />
                  Unsaved Changes
                </span>
              )}
            </div>

            <div className="space-y-2.5">
              <Button
                type="button"
                variant="primary"
                size="lg"
                className="w-full justify-center shadow-sm"
                onClick={() => handleSave()}
                leftIcon={isSavedRecently ? <CheckCircle2 className="w-4 h-4 text-brand-mint" /> : <Save className="w-4 h-4" />}
              >
                {isSavedRecently ? 'Changes Saved Successfully!' : 'Save Configuration Changes'}
              </Button>

              <Button
                type="button"
                variant="outline"
                size="md"
                className="w-full justify-center text-xs"
                onClick={resetDemoData}
                leftIcon={<RefreshCw className="w-3.5 h-3.5 text-slate-400" />}
              >
                Reset to System Defaults
              </Button>
            </div>

            <p className="text-2xs text-content-muted text-center">
              Changes take effect immediately across all client sessions and public portals.
            </p>
          </div>

          {/* Live Preview Card */}
          <div className="bg-gradient-to-b from-navy to-navy-dark text-white rounded-brand border border-navy/30 shadow-subtle p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-brand-mint" />
                <span className="font-heading font-bold text-xs uppercase tracking-wider text-white">Live Public Preview</span>
              </div>
              <span className="text-3xs font-semibold px-2 py-0.5 rounded bg-brand-mint/20 text-brand-mint border border-brand-mint/30">
                Real-Time
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <div className="text-2xs font-semibold uppercase tracking-wider text-slate-400">Emergency &amp; Support Card</div>
                
                <div className="flex items-center gap-2.5 text-white">
                  <div className="w-7 h-7 rounded-lg bg-brand-mint/15 text-brand-mint flex items-center justify-center flex-shrink-0">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-3xs text-slate-400 block font-medium">Helpline</span>
                    <span className="font-bold text-xs truncate block">{officePhone || '+1 (800) 555-WE4U'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-white">
                  <div className="w-7 h-7 rounded-lg bg-sky-400/15 text-sky-400 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-3.5 h-3.5" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-3xs text-slate-400 block font-medium">Email</span>
                    <span className="font-bold text-xs truncate block">{officeEmail || 'support@we4you-contact.org'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-white pt-1">
                  <div className="w-7 h-7 rounded-lg bg-amber-400/15 text-amber-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-3xs text-slate-400 block font-medium">Office Center</span>
                    <span className="text-2xs text-slate-200 leading-snug line-clamp-2">{officeAddress || 'Central Office'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-white pt-1">
                  <div className="w-7 h-7 rounded-lg bg-purple-400/15 text-purple-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-3xs text-slate-400 block font-medium">Schedule</span>
                    <span className="text-2xs text-slate-200 leading-snug line-clamp-2">{officeHours || 'Mon-Fri'}</span>
                  </div>
                </div>
              </div>

              {/* Commission Calculator Widget */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-2xs font-semibold text-slate-400 uppercase tracking-wider">
                  <span>Vendor Payout Sample</span>
                  <span className="text-brand-mint font-mono">${(50 * (defaultCommPct / 100) + defaultCommFixed).toFixed(2)}</span>
                </div>
                <div className="text-2xs text-slate-300">
                  On a standard $50.00 registration, partner stores receive <span className="text-white font-bold">{defaultCommPct}%</span> (${(50 * (defaultCommPct / 100)).toFixed(2)}) + <span className="text-white font-bold">${defaultCommFixed}</span> bounty.
                </div>
              </div>
            </div>
          </div>

          {/* Cloud Infrastructure Card */}
          <div className="bg-white rounded-brand border border-border-subtle shadow-subtle p-5 space-y-4">
            <div className="flex items-center gap-2 text-navy font-heading font-bold text-xs uppercase tracking-wider pb-2 border-b border-border-subtle">
              <Server className="w-4 h-4 text-navy" />
              <span>Cloud Infrastructure</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-slate-400" />
                  PostgreSQL DB
                </span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-2xs border border-emerald-200">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  Storage Encryption
                </span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-2xs border border-emerald-200">
                  AES-256
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  RBAC Multi-Tenant
                </span>
                <span className="font-semibold text-navy bg-navy/5 px-2 py-0.5 rounded text-2xs border border-navy/10">
                  Admin &amp; Staff
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                  Edge Functions
                </span>
                <span className="font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded text-2xs border border-sky-200">
                  Deployed
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
