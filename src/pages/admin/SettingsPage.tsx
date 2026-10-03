import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/admin/PageHeader';
import { Button } from '../../components/common/Button';
import { FormField, Input, Textarea } from '../../components/common/FormField';
import { Modal } from '../../components/common/Modal';
import { useApp } from '../../context/AppContext';
import { SubscriptionPlan } from '../../types';
import { cleanAndResolveImageUrl, extractImageFromClipboard } from '../../utils/imageUtils';
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
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  CreditCard,
  Edit2,
  ExternalLink,
  Trash2,
  Sparkle,
  Copy,
  LayoutTemplate,
} from 'lucide-react';

const HERO_PRESETS = [
  {
    name: 'Default Family Protection',
    url: '/hero-full.jpg',
    description: 'Original mother and child with identification wristband on sofa',
  },
  {
    name: 'Elderly & Senior Care',
    url: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=1600&q=80',
    description: 'Caring elderly couple walking outdoors with peace of mind',
  },
  {
    name: 'Youth & Child Safety',
    url: 'https://images.unsplash.com/photo-1485546246426-74dc88dec4d9?auto=format&fit=crop&w=1600&q=80',
    description: 'Happy child playing safely outdoors in public park',
  },
  {
    name: 'Active Sports & Athletes',
    url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=1600&q=80',
    description: 'Runner with safety wristband on active morning trail',
  },
];

const ABOUT_PRESETS = [
  {
    name: 'Natural Daylight Walking',
    url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=900&q=80',
    description: 'Mother and young child walking together warmly outdoors',
  },
  {
    name: 'Community & Trust',
    url: 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=900&q=80',
    description: 'Supportive team and family connection',
  },
  {
    name: 'Intergenerational Caring',
    url: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&w=900&q=80',
    description: 'Grandparent and child holding hands safely',
  },
  {
    name: 'Outdoor Adventure',
    url: 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?auto=format&fit=crop&w=900&q=80',
    description: 'Children exploring nature safely with identification',
  },
];

const SHOWCASE_PRESETS = [
  {
    name: 'Full Color Palette Lineup',
    url: '/wristbands-colors-showcase.jpg',
    description: 'Mint Green, Coral Red, Sunset Orange, Royal Purple, Crisp White, Classic Navy',
  },
  {
    name: 'Modern Silicone Wristbands',
    url: 'https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&w=1600&q=80',
    description: 'Minimalist durable silicone bands in various vibrant colors',
  },
  {
    name: 'Sports & Adventure Bands',
    url: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1600&q=80',
    description: 'Ergonomic fitness and outdoor activity wristwear',
  },
  {
    name: 'Child Safety Wearables',
    url: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=1600&q=80',
    description: 'Comfortable lightweight identification bands for young children',
  },
];

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetDemoData, plans, updatePlan } = useApp();

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

  // Landing Page Image Tabs
  const [activeMediaTab, setActiveMediaTab] = useState<'hero' | 'about' | 'showcase'>('hero');

  // 1. Hero Image & Text
  const [heroImageUrl, setHeroImageUrl] = useState(settings.heroImageUrl || '/hero-full.jpg');
  const [heroHeadline, setHeroHeadline] = useState(settings.heroHeadline || 'A little band.');
  const [heroHighlight, setHeroHighlight] = useState(settings.heroHighlight || 'Protection for everyone.');
  const [heroSubheadline, setHeroSubheadline] = useState(
    settings.heroSubheadline ||
      'Instant emergency reconnection & peace of mind for children, seniors, athletes, travelers, and loved ones through our central office.'
  );

  // 2. About Us / Purpose Image & Text
  const [aboutImageUrl, setAboutImageUrl] = useState(
    settings.aboutImageUrl || 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=900&q=80'
  );
  const [aboutHeadline, setAboutHeadline] = useState(settings.aboutHeadline || 'Care starts with connection.');
  const [aboutText, setAboutText] = useState(
    settings.aboutText ||
      'We 4 You brings families and caring people closer through simple identification bands and an office contact service.'
  );

  // 3. Wristband Showcase Image & Text
  const [showcaseImageUrl, setShowcaseImageUrl] = useState(settings.showcaseImageUrl || '/wristbands-colors-showcase.jpg');
  const [showcaseHeadline, setShowcaseHeadline] = useState(settings.showcaseHeadline || 'Designed for everyone.');
  const [showcaseSubheadline, setShowcaseSubheadline] = useState(
    settings.showcaseSubheadline ||
      'Crafted from ultra-soft, hypoallergenic silicone with curved stainless steel ID plates. Waterproof, lightweight, and engineered for children, seniors, runners, and everyday wearers.'
  );

  const [isSavedRecently, setIsSavedRecently] = useState(false);
  const heroFileInputRef = useRef<HTMLInputElement>(null);
  const aboutFileInputRef = useRef<HTMLInputElement>(null);
  const showcaseFileInputRef = useRef<HTMLInputElement>(null);

  // Quick Plan Edit Modal inside Settings
  const [selectedPlanToEdit, setSelectedPlanToEdit] = useState<SubscriptionPlan | null>(null);
  const [quickPlanPrice, setQuickPlanPrice] = useState<number>(29);
  const [quickPlanFormatted, setQuickPlanFormatted] = useState<string>('$29.00 / year');

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

    setHeroImageUrl(settings.heroImageUrl || '/hero-full.jpg');
    setHeroHeadline(settings.heroHeadline || 'A little band.');
    setHeroHighlight(settings.heroHighlight || 'Protection for everyone.');
    setHeroSubheadline(
      settings.heroSubheadline ||
        'Instant emergency reconnection & peace of mind for children, seniors, athletes, travelers, and loved ones through our central office.'
    );

    setAboutImageUrl(
      settings.aboutImageUrl ||
        'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=900&q=80'
    );
    setAboutHeadline(settings.aboutHeadline || 'Care starts with connection.');
    setAboutText(
      settings.aboutText ||
        'We 4 You brings families and caring people closer through simple identification bands and an office contact service.'
    );

    setShowcaseImageUrl(settings.showcaseImageUrl || '/wristbands-colors-showcase.jpg');
    setShowcaseHeadline(settings.showcaseHeadline || 'Designed for everyone.');
    setShowcaseSubheadline(
      settings.showcaseSubheadline ||
        'Crafted from ultra-soft, hypoallergenic silicone with curved stainless steel ID plates. Waterproof, lightweight, and engineered for children, seniors, runners, and everyday wearers.'
    );
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
    simulationNote !== (settings.simulationNote || '') ||
    heroImageUrl !== (settings.heroImageUrl || '/hero-full.jpg') ||
    heroHeadline !== (settings.heroHeadline || 'A little band.') ||
    heroHighlight !== (settings.heroHighlight || 'Protection for everyone.') ||
    heroSubheadline !== (settings.heroSubheadline || '') ||
    aboutImageUrl !== (settings.aboutImageUrl || 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=900&q=80') ||
    aboutHeadline !== (settings.aboutHeadline || 'Care starts with connection.') ||
    aboutText !== (settings.aboutText || '') ||
    showcaseImageUrl !== (settings.showcaseImageUrl || '/wristbands-colors-showcase.jpg') ||
    showcaseHeadline !== (settings.showcaseHeadline || 'Designed for everyone.') ||
    showcaseSubheadline !== (settings.showcaseSubheadline || '');

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WebP, etc.).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      const dataUrl = loadEvt.target?.result as string;
      if (dataUrl) {
        setter(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleOpenQuickPlanEdit = (plan: SubscriptionPlan) => {
    setSelectedPlanToEdit(plan);
    setQuickPlanPrice(plan.priceAmount);
    setQuickPlanFormatted(plan.priceFormatted);
  };

  const handleSaveQuickPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanToEdit) return;

    updatePlan(selectedPlanToEdit.id, {
      priceAmount: Number(quickPlanPrice),
      priceFormatted: quickPlanFormatted.trim(),
    });

    setSelectedPlanToEdit(null);
  };

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
      heroImageUrl: cleanAndResolveImageUrl(heroImageUrl),
      heroHeadline: heroHeadline.trim(),
      heroHighlight: heroHighlight.trim(),
      heroSubheadline: heroSubheadline.trim(),
      aboutImageUrl: cleanAndResolveImageUrl(aboutImageUrl),
      aboutHeadline: aboutHeadline.trim(),
      aboutText: aboutText.trim(),
      showcaseImageUrl: cleanAndResolveImageUrl(showcaseImageUrl),
      showcaseHeadline: showcaseHeadline.trim(),
      showcaseSubheadline: showcaseSubheadline.trim(),
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
          description="Centralized configuration management for landing page visuals, subscription plan prices, office contact, and registration policies."
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

          {/* Section 1: Complete Landing Page Visuals & Imagery Customizer */}
          <div className="bg-white rounded-brand border border-border-subtle shadow-subtle p-6 sm:p-7 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-navy/5 border border-navy/10 flex items-center justify-center text-navy font-bold shadow-xs">
                  <ImageIcon className="w-5 h-5 text-navy" />
                </div>
                <div>
                  <h2 className="text-base font-heading font-bold text-navy">Landing Page Imagery &amp; Visuals</h2>
                  <p className="text-xs text-content-muted">
                    Customize any image or banner across the public landing page (Upload file, paste image from Google / clipboard, or enter URL).
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-2xs font-semibold uppercase tracking-wider text-navy bg-navy/5 border border-navy/10 px-2.5 py-1 rounded-md">
                Public Visuals
              </span>
            </div>

            {/* Media Section Navigation Tabs */}
            <div className="flex flex-wrap gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveMediaTab('hero')}
                className={`flex-1 min-w-[130px] py-2 px-3 text-xs font-heading font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeMediaTab === 'hero'
                    ? 'bg-navy text-white shadow-xs'
                    : 'text-slate-600 hover:text-navy hover:bg-slate-200/60'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>1. Hero Banner</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMediaTab('about')}
                className={`flex-1 min-w-[130px] py-2 px-3 text-xs font-heading font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeMediaTab === 'about'
                    ? 'bg-navy text-white shadow-xs'
                    : 'text-slate-600 hover:text-navy hover:bg-slate-200/60'
                }`}
              >
                <LayoutTemplate className="w-3.5 h-3.5" />
                <span>2. Our Purpose / About</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMediaTab('showcase')}
                className={`flex-1 min-w-[130px] py-2 px-3 text-xs font-heading font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  activeMediaTab === 'showcase'
                    ? 'bg-navy text-white shadow-xs'
                    : 'text-slate-600 hover:text-navy hover:bg-slate-200/60'
                }`}
              >
                <Sparkle className="w-3.5 h-3.5" />
                <span>3. Product Showcase</span>
              </button>
            </div>

            {/* TAB 1: HERO BANNER */}
            {activeMediaTab === 'hero' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Live Hero Banner Preview Box */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-navy">
                    <span>Hero Banner Live Display</span>
                    <span className="text-2xs text-content-muted">Changes preview in real-time</span>
                  </div>
                  <div
                    onPaste={(e) => extractImageFromClipboard(e, (url) => setHeroImageUrl(url))}
                    tabIndex={0}
                    className="relative rounded-xl overflow-hidden bg-[#05294B] min-h-[190px] sm:min-h-[220px] flex items-center p-6 border border-navy/20 shadow-inner group focus:ring-2 focus:ring-navy focus:outline-none"
                    title="You can press Ctrl+V here to paste any copied image from Google"
                  >
                    <img
                      src={heroImageUrl || '/hero-full.jpg'}
                      alt="Landing Hero Banner"
                      className="absolute inset-0 w-full h-full object-cover object-right pointer-events-none transition-all duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/hero-full.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#05294B] via-[#05294B]/80 to-transparent pointer-events-none" />
                    <div className="relative z-10 max-w-md text-white space-y-2">
                      <div className="inline-block px-2.5 py-0.5 rounded-full bg-mint/20 text-mint text-3xs font-bold border border-mint/30 uppercase tracking-wider">
                        Hero Banner Active
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold leading-tight font-heading">
                        {heroHeadline} <span className="text-mint">{heroHighlight}</span>
                      </h3>
                      <p className="text-xs text-slate-200 line-clamp-2">
                        {heroSubheadline}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Hero Upload & Paste URL Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 hover:bg-slate-50 flex flex-col items-center justify-center text-center space-y-2">
                    <input
                      type="file"
                      ref={heroFileInputRef}
                      onChange={(e) => handleFileSelect(e, setHeroImageUrl)}
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="w-10 h-10 rounded-full bg-navy/5 text-navy flex items-center justify-center">
                      <Upload className="w-5 h-5 text-navy" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-navy block">Upload Hero Photo</span>
                      <span className="text-3xs text-content-muted block">PNG, JPG, WebP, or paste (Ctrl+V)</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => heroFileInputRef.current?.click()}
                      leftIcon={<Upload className="w-3.5 h-3.5" />}
                    >
                      Choose from Device
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <FormField label="Paste Google / Web Image URL" hint="Supports direct image URLs and Google search links">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <LinkIcon className="w-4 h-4 text-slate-400" />
                        </div>
                        <input
                          type="text"
                          value={heroImageUrl}
                          onChange={(e) => setHeroImageUrl(cleanAndResolveImageUrl(e.target.value))}
                          onPaste={(e) => extractImageFromClipboard(e, (url) => setHeroImageUrl(url))}
                          placeholder="Paste image URL or Google link (Ctrl+V)..."
                          className="w-full h-10 pl-9 pr-4 text-xs font-mono rounded-brand border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-navy transition-all focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
                        />
                      </div>
                    </FormField>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => setHeroImageUrl('/hero-full.jpg')}
                        className="text-2xs font-semibold text-slate-500 hover:text-navy flex items-center gap-1 underline"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Reset to Default Family Hero
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Presets */}
                <div>
                  <label className="text-xs font-semibold text-navy block mb-2">
                    Quick Hero Presets:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {HERO_PRESETS.map((preset) => {
                      const isSelected = heroImageUrl === preset.url;
                      return (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => setHeroImageUrl(preset.url)}
                          className={`p-2 rounded-lg border text-left transition-all flex flex-col gap-1.5 ${
                            isSelected
                              ? 'border-navy bg-navy/5 ring-1 ring-navy'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="h-14 w-full rounded overflow-hidden relative bg-slate-100">
                            <img
                              src={preset.url}
                              alt={preset.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/hero-full.jpg';
                              }}
                            />
                            {isSelected && (
                              <div className="absolute top-1 right-1 bg-navy text-white rounded-full p-0.5">
                                <Check className="w-3 h-3 text-mint" />
                              </div>
                            )}
                          </div>
                          <span className="text-2xs font-bold text-navy line-clamp-1">{preset.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Headline & Subtitle Text Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border-subtle">
                  <FormField label="Hero Headline Text">
                    <input
                      type="text"
                      value={heroHeadline}
                      onChange={(e) => setHeroHeadline(e.target.value)}
                      placeholder="A little band."
                      className="w-full h-10 px-3 text-xs sm:text-sm font-medium rounded-brand border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-navy focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
                    />
                  </FormField>

                  <FormField label="Highlighted Phrase (Mint Color)">
                    <input
                      type="text"
                      value={heroHighlight}
                      onChange={(e) => setHeroHighlight(e.target.value)}
                      placeholder="Protection for everyone."
                      className="w-full h-10 px-3 text-xs sm:text-sm font-medium rounded-brand border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-navy focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
                    />
                  </FormField>
                </div>

                <FormField label="Hero Subheading Description">
                  <input
                    type="text"
                    value={heroSubheadline}
                    onChange={(e) => setHeroSubheadline(e.target.value)}
                    placeholder="Instant emergency reconnection & peace of mind for children, seniors, athletes..."
                    className="w-full h-10 px-3 text-xs sm:text-sm font-medium rounded-brand border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-navy focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
                  />
                </FormField>
              </div>
            )}

            {/* TAB 2: ABOUT US / OUR PURPOSE */}
            {activeMediaTab === 'about' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Live Preview Box */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-navy">
                    <span>Our Purpose Section Preview</span>
                    <span className="text-2xs text-content-muted">Appears in Section 4 on Landing Page</span>
                  </div>
                  <div
                    onPaste={(e) => extractImageFromClipboard(e, (url) => setAboutImageUrl(url))}
                    tabIndex={0}
                    className="relative rounded-xl overflow-hidden bg-mint-pale/40 p-6 border border-border-subtle flex flex-col sm:flex-row items-center gap-6 group focus:ring-2 focus:ring-navy focus:outline-none"
                    title="You can press Ctrl+V here to paste any copied image from Google"
                  >
                    <div className="w-full sm:w-48 h-36 rounded-lg overflow-hidden border border-slate-200 bg-white flex-shrink-0 shadow-sm">
                      <img
                        src={aboutImageUrl || 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=900&q=80'}
                        alt="Our Purpose Visual"
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=900&q=80';
                        }}
                      />
                    </div>
                    <div className="space-y-2 flex-1">
                      <span className="text-3xs font-bold uppercase tracking-wider text-mint-darker bg-white px-2.5 py-0.5 rounded-full border border-emerald-300 inline-block">
                        Our Purpose
                      </span>
                      <h4 className="text-base sm:text-lg font-bold font-heading text-navy">
                        {aboutHeadline}
                      </h4>
                      <p className="text-xs text-content-body line-clamp-2">
                        {aboutText}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Upload & Paste Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 hover:bg-slate-50 flex flex-col items-center justify-center text-center space-y-2">
                    <input
                      type="file"
                      ref={aboutFileInputRef}
                      onChange={(e) => handleFileSelect(e, setAboutImageUrl)}
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="w-10 h-10 rounded-full bg-navy/5 text-navy flex items-center justify-center">
                      <Upload className="w-5 h-5 text-navy" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-navy block">Upload Section Photo</span>
                      <span className="text-3xs text-content-muted block">PNG, JPG, WebP, or paste (Ctrl+V)</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => aboutFileInputRef.current?.click()}
                      leftIcon={<Upload className="w-3.5 h-3.5" />}
                    >
                      Choose from Device
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <FormField label="Paste Google / Web Image URL" hint="Supports direct image URLs and Google search links">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <LinkIcon className="w-4 h-4 text-slate-400" />
                        </div>
                        <input
                          type="text"
                          value={aboutImageUrl}
                          onChange={(e) => setAboutImageUrl(cleanAndResolveImageUrl(e.target.value))}
                          onPaste={(e) => extractImageFromClipboard(e, (url) => setAboutImageUrl(url))}
                          placeholder="Paste image URL or Google link (Ctrl+V)..."
                          className="w-full h-10 pl-9 pr-4 text-xs font-mono rounded-brand border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-navy transition-all focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
                        />
                      </div>
                    </FormField>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          setAboutImageUrl(
                            'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=900&q=80'
                          )
                        }
                        className="text-2xs font-semibold text-slate-500 hover:text-navy flex items-center gap-1 underline"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Reset to Default About Photo
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Presets */}
                <div>
                  <label className="text-xs font-semibold text-navy block mb-2">
                    Quick Purpose Image Presets:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {ABOUT_PRESETS.map((preset) => {
                      const isSelected = aboutImageUrl === preset.url;
                      return (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => setAboutImageUrl(preset.url)}
                          className={`p-2 rounded-lg border text-left transition-all flex flex-col gap-1.5 ${
                            isSelected
                              ? 'border-navy bg-navy/5 ring-1 ring-navy'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="h-14 w-full rounded overflow-hidden relative bg-slate-100">
                            <img
                              src={preset.url}
                              alt={preset.name}
                              className="w-full h-full object-cover"
                            />
                            {isSelected && (
                              <div className="absolute top-1 right-1 bg-navy text-white rounded-full p-0.5">
                                <Check className="w-3 h-3 text-mint" />
                              </div>
                            )}
                          </div>
                          <span className="text-2xs font-bold text-navy line-clamp-1">{preset.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Text Customization */}
                <div className="space-y-4 pt-2 border-t border-border-subtle">
                  <FormField label="About Section Headline">
                    <input
                      type="text"
                      value={aboutHeadline}
                      onChange={(e) => setAboutHeadline(e.target.value)}
                      placeholder="Care starts with connection."
                      className="w-full h-10 px-3 text-xs sm:text-sm font-medium rounded-brand border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-navy focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
                    />
                  </FormField>

                  <FormField label="About Section Paragraph Text">
                    <Textarea
                      rows={2}
                      value={aboutText}
                      onChange={(e) => setAboutText(e.target.value)}
                      placeholder="We 4 You brings families and caring people closer through simple identification bands..."
                    />
                  </FormField>
                </div>
              </div>
            )}

            {/* TAB 3: WRISTBAND SHOWCASE */}
            {activeMediaTab === 'showcase' && (
              <div className="space-y-6 animate-fadeIn">
                {/* Live Preview Box */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-navy">
                    <span>Hardware &amp; Color Lineup Showcase Preview</span>
                    <span className="text-2xs text-content-muted">Appears in Section 8 above the footer</span>
                  </div>
                  <div
                    onPaste={(e) => extractImageFromClipboard(e, (url) => setShowcaseImageUrl(url))}
                    tabIndex={0}
                    className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-300 shadow-md group focus:ring-2 focus:ring-navy focus:outline-none"
                    title="You can press Ctrl+V here to paste any copied image from Google"
                  >
                    <img
                      src={showcaseImageUrl || '/wristbands-colors-showcase.jpg'}
                      alt="Product Lineup Showcase"
                      className="w-full h-44 sm:h-52 object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/wristbands-colors-showcase.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
                      <span className="text-3xs font-bold uppercase tracking-wider text-mint">
                        {showcaseHeadline}
                      </span>
                      <p className="text-xs text-slate-200 line-clamp-1">
                        {showcaseSubheadline}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Upload & Paste Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 hover:bg-slate-50 flex flex-col items-center justify-center text-center space-y-2">
                    <input
                      type="file"
                      ref={showcaseFileInputRef}
                      onChange={(e) => handleFileSelect(e, setShowcaseImageUrl)}
                      accept="image/*"
                      className="hidden"
                    />
                    <div className="w-10 h-10 rounded-full bg-navy/5 text-navy flex items-center justify-center">
                      <Upload className="w-5 h-5 text-navy" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-navy block">Upload Product Banner</span>
                      <span className="text-3xs text-content-muted block">PNG, JPG, WebP, or paste (Ctrl+V)</span>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => showcaseFileInputRef.current?.click()}
                      leftIcon={<Upload className="w-3.5 h-3.5" />}
                    >
                      Choose from Device
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <FormField label="Paste Google / Web Image URL" hint="Supports direct image URLs and Google search links">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <LinkIcon className="w-4 h-4 text-slate-400" />
                        </div>
                        <input
                          type="text"
                          value={showcaseImageUrl}
                          onChange={(e) => setShowcaseImageUrl(cleanAndResolveImageUrl(e.target.value))}
                          onPaste={(e) => extractImageFromClipboard(e, (url) => setShowcaseImageUrl(url))}
                          placeholder="Paste image URL or Google link (Ctrl+V)..."
                          className="w-full h-10 pl-9 pr-4 text-xs font-mono rounded-brand border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-navy transition-all focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
                        />
                      </div>
                    </FormField>

                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => setShowcaseImageUrl('/wristbands-colors-showcase.jpg')}
                        className="text-2xs font-semibold text-slate-500 hover:text-navy flex items-center gap-1 underline"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Reset to Default Product Banner
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Presets */}
                <div>
                  <label className="text-xs font-semibold text-navy block mb-2">
                    Quick Product Banner Presets:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {SHOWCASE_PRESETS.map((preset) => {
                      const isSelected = showcaseImageUrl === preset.url;
                      return (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => setShowcaseImageUrl(preset.url)}
                          className={`p-2 rounded-lg border text-left transition-all flex flex-col gap-1.5 ${
                            isSelected
                              ? 'border-navy bg-navy/5 ring-1 ring-navy'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="h-14 w-full rounded overflow-hidden relative bg-slate-100">
                            <img
                              src={preset.url}
                              alt={preset.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/wristbands-colors-showcase.jpg';
                              }}
                            />
                            {isSelected && (
                              <div className="absolute top-1 right-1 bg-navy text-white rounded-full p-0.5">
                                <Check className="w-3 h-3 text-mint" />
                              </div>
                            )}
                          </div>
                          <span className="text-2xs font-bold text-navy line-clamp-1">{preset.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Text Customization */}
                <div className="space-y-4 pt-2 border-t border-border-subtle">
                  <FormField label="Showcase Section Headline">
                    <input
                      type="text"
                      value={showcaseHeadline}
                      onChange={(e) => setShowcaseHeadline(e.target.value)}
                      placeholder="Designed for everyone."
                      className="w-full h-10 px-3 text-xs sm:text-sm font-medium rounded-brand border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-navy focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
                    />
                  </FormField>

                  <FormField label="Showcase Description Paragraph">
                    <Textarea
                      rows={2}
                      value={showcaseSubheadline}
                      onChange={(e) => setShowcaseSubheadline(e.target.value)}
                      placeholder="Crafted from ultra-soft, hypoallergenic silicone with curved stainless steel ID plates..."
                    />
                  </FormField>
                </div>
              </div>
            )}

            {/* Quick Save Visuals Banner */}
            <div className="pt-4 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-4 rounded-xl">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Changes will update the public website immediately upon saving.</span>
              </div>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => handleSave()}
                leftIcon={isSavedRecently ? <CheckCircle2 className="w-4 h-4 text-brand-mint" /> : <Save className="w-4 h-4" />}
                className="w-full sm:w-auto font-heading font-bold"
              >
                {isSavedRecently ? 'Visuals Saved!' : 'Save Visuals Live'}
              </Button>
            </div>
          </div>

          {/* Section 2: Subscription Plans & Pricing Rates */}
          <div className="bg-white rounded-brand border border-border-subtle shadow-subtle p-6 sm:p-7 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-navy/5 border border-navy/10 flex items-center justify-center text-navy font-bold shadow-xs">
                  <CreditCard className="w-5 h-5 text-navy" />
                </div>
                <div>
                  <h2 className="text-base font-heading font-bold text-navy">Subscription Plans &amp; Pricing Rates</h2>
                  <p className="text-xs text-content-muted">
                    Configure service subscription costs, renewal fees, and public pricing tiers.
                  </p>
                </div>
              </div>
              <Link
                to="/admin/plans"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-navy hover:text-navy-dark bg-navy/5 hover:bg-navy/10 border border-navy/10 px-3 py-1.5 rounded-lg transition-colors"
              >
                <span>Full Plans Editor</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Plans List Cards */}
            <div className="space-y-3">
              {plans.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-sm text-navy">{p.name}</span>
                      <span className={`text-3xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                        p.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {p.isActive ? 'Active' : 'Hidden'}
                      </span>
                      {p.isProvisional && (
                        <span className="text-3xs font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md uppercase">
                          Provisional
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-content-muted line-clamp-1">
                      {p.durationMonths} Months Coverage • {p.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <div className="text-right">
                      <span className="font-bold text-navy text-sm block font-mono">{p.priceFormatted}</span>
                      <span className="text-3xs text-content-muted block">${p.priceAmount.toFixed(2)} USD</span>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenQuickPlanEdit(p)}
                      leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                    >
                      Edit Price
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-navy/[0.03] border border-navy/10 rounded-lg flex items-center justify-between text-xs text-navy">
              <span>
                Want to add new durations, features, or provisional rates?
              </span>
              <Link to="/admin/plans" className="font-bold underline text-navy hover:text-navy-dark">
                Open Service Plans Management →
              </Link>
            </div>
          </div>

          {/* Section 3: Public Office & Contact Information */}
          <div className="bg-white rounded-brand border border-border-subtle shadow-subtle p-6 sm:p-7 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-navy/5 border border-navy/10 flex items-center justify-center text-navy font-bold shadow-xs">
                  <Building2 className="w-5 h-5 text-navy" />
                </div>
                <div>
                  <h2 className="text-base font-heading font-bold text-navy">Public Office &amp; Contact Details</h2>
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

      {/* Quick Edit Plan Price Modal */}
      <Modal
        isOpen={Boolean(selectedPlanToEdit)}
        onClose={() => setSelectedPlanToEdit(null)}
        title={`Edit Price: ${selectedPlanToEdit?.name}`}
        description={`Update the billing amount and display price for this ${selectedPlanToEdit?.durationMonths}-month plan.`}
      >
        {selectedPlanToEdit && (
          <form onSubmit={handleSaveQuickPlan} className="space-y-4">
            <div className="p-3 bg-neutral-soft rounded-brand border border-border-subtle text-xs text-content-body space-y-1">
              <div><strong>Plan:</strong> {selectedPlanToEdit.name}</div>
              <div><strong>Coverage Duration:</strong> {selectedPlanToEdit.durationMonths} Months</div>
            </div>

            <FormField label="Price Amount ($ USD)" required hint="Numeric value used in checkout and payment calculations">
              <Input
                type="number"
                step="0.01"
                min="0"
                required
                value={quickPlanPrice}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setQuickPlanPrice(val);
                  setQuickPlanFormatted(`$${val.toFixed(2)} / ${selectedPlanToEdit.durationMonths === 12 ? 'year' : `${selectedPlanToEdit.durationMonths / 12} years`}`);
                }}
              />
            </FormField>

            <FormField label="Display Price Formatted" required hint="Display string shown on public website and selection dropdowns">
              <Input
                type="text"
                required
                value={quickPlanFormatted}
                onChange={(e) => setQuickPlanFormatted(e.target.value)}
                placeholder="e.g. $29.00 / year"
              />
            </FormField>

            <div className="pt-4 border-t border-border-subtle flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedPlanToEdit(null)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Price
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
