import React, { useState } from 'react';
import { PageHeader } from '../../components/admin/PageHeader';
import { Button } from '../../components/common/Button';
import { FormField, Input, Textarea } from '../../components/common/FormField';
import { useApp } from '../../context/AppContext';
import { Settings, Save, CheckCircle2, RotateCcw, ShieldCheck } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetDemoData } = useApp();

  const [officePhone, setOfficePhone] = useState(settings.officePhone);
  const [officeEmail, setOfficeEmail] = useState(settings.officeEmail);
  const [officeAddress, setOfficeAddress] = useState(settings.officeAddress);
  const [officeHours, setOfficeHours] = useState(settings.officeHours);
  const [directPurchaseEnabled, setDirectPurchaseEnabled] = useState(settings.directPurchaseEnabled);
  const [allowPhotoUpload, setAllowPhotoUpload] = useState(settings.allowPhotoUpload);
  const [defaultCommPct, setDefaultCommPct] = useState(settings.defaultCommissionPercentage);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      officePhone: officePhone.trim(),
      officeEmail: officeEmail.trim(),
      officeAddress: officeAddress.trim(),
      officeHours: officeHours.trim(),
      directPurchaseEnabled,
      allowPhotoUpload,
      defaultCommissionPercentage: Number(defaultCommPct),
    });
  };

  return (
    <div>
      <PageHeader
        title="Office &amp; Brand Settings"
        description="Centralized configuration source for office telephone, hours, direct sales, and operational policies."
      />

      <form onSubmit={handleSave} className="space-y-8 max-w-3xl">
        
        {/* Office Contact Info */}
        <div className="bg-white p-6 rounded-brand border border-border-subtle shadow-subtle space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border-subtle text-navy font-heading font-bold text-base">
            <Settings className="w-5 h-5 text-navy" />
            <span>Public Office Contact Details</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Office Phone Number" required hint="Displayed on public header and bands">
              <Input
                value={officePhone}
                onChange={(e) => setOfficePhone(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Office Support Email" required>
              <Input
                type="email"
                value={officeEmail}
                onChange={(e) => setOfficeEmail(e.target.value)}
                required
              />
            </FormField>
          </div>

          <FormField label="Office Center Address">
            <Input
              value={officeAddress}
              onChange={(e) => setOfficeAddress(e.target.value)}
            />
          </FormField>

          <FormField label="Operating Hours &amp; Schedule">
            <Input
              value={officeHours}
              onChange={(e) => setOfficeHours(e.target.value)}
            />
          </FormField>
        </div>

        {/* Operational Business Rules */}
        <div className="bg-white p-6 rounded-brand border border-border-subtle shadow-subtle space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-border-subtle text-navy font-heading font-bold text-base">
            <ShieldCheck className="w-5 h-5 text-navy" />
            <span>Operational &amp; Registration Switches</span>
          </div>

          <div className="space-y-4 text-xs">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={directPurchaseEnabled}
                onChange={(e) => setDirectPurchaseEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-navy mt-0.5"
              />
              <div>
                <span className="font-bold text-navy text-sm block">Allow Direct Office Band Purchases</span>
                <span className="text-content-muted">
                  Enables a "Purchased directly from We 4 You Office" option in the public registration dropdown alongside partner shops.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allowPhotoUpload}
                onChange={(e) => setAllowPhotoUpload(e.target.checked)}
                className="w-4 h-4 rounded text-navy mt-0.5"
              />
              <div>
                <span className="font-bold text-navy text-sm block">Enable Wearer Photo Preview in Registration</span>
                <span className="text-content-muted">
                  Enables demonstration in-memory photo previewing without persistent cloud storage.
                </span>
              </div>
            </label>
          </div>

          <div className="pt-2 border-t border-border-subtle max-w-xs">
            <FormField label="Default Vendor Commission Rate (%)" hint="Default suggested rate for newly created shops">
              <Input
                type="number"
                min="0"
                max="100"
                value={defaultCommPct}
                onChange={(e) => setDefaultCommPct(Number(e.target.value))}
              />
            </FormField>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            onClick={resetDemoData}
            variant="outline"
            size="md"
            leftIcon={<RotateCcw className="w-4 h-4 text-rose-600" />}
          >
            Reset All Demo Data
          </Button>

          <Button type="submit" variant="primary" size="lg" leftIcon={<Save className="w-4 h-4" />}>
            Save Configuration Changes
          </Button>
        </div>

      </form>
    </div>
  );
};
