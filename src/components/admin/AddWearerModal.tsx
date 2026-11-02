import React, { useState, useMemo } from 'react';
import { Modal } from '../common/Modal';
import { FormField, Input, Select, Textarea, commitFormattedInput } from '../common/FormField';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';
import { calculateDetailedAge, BLOOD_GROUPS, GENDER_OPTIONS } from '../../utils/ageCalculator';
import { RelationshipType } from '../../types';
import {
  UserPlus,
  User,
  Shield,
  Phone,
  Radio,
  CreditCard,
  AlertCircle,
  Calendar,
  Sparkles,
} from 'lucide-react';

interface AddWearerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialBandCode?: string;
}

const CATEGORY_OPTIONS = [
  'Child (0 – 12 years)',
  'Teen (13 – 17 years)',
  'Adult (18 – 64 years)',
  'Senior (65+ years)',
  'Special Care / Vulnerable Person',
];

const RELATIONSHIP_OPTIONS: RelationshipType[] = [
  'Parent / Guardian',
  'Mother',
  'Father',
  'Spouse / Partner',
  'Son / Daughter',
  'Grandparent',
  'Caregiver / Nurse',
  'Sibling',
  'Legal Guardian',
  'Foster Parent',
  'Emergency Contact',
  'Other Authorized Contact',
];

export const AddWearerModal: React.FC<AddWearerModalProps> = ({
  isOpen,
  onClose,
  initialBandCode = '',
}) => {
  const { bands, plans, vendors, addWearerRecord } = useApp();

  // Wearer details
  const [name, setName] = useState('');
  const [ageRange, setAgeRange] = useState(CATEGORY_OPTIONS[0]);
  const [birthDate, setBirthDate] = useState('');
  const [calculatedAge, setCalculatedAge] = useState('');
  const [gender, setGender] = useState('Not specified');
  const [bloodGroup, setBloodGroup] = useState('Unknown');
  const [nationalId, setNationalId] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');

  // Primary Guardian
  const [guardianName, setGuardianName] = useState('');
  const [relationship, setRelationship] = useState<RelationshipType>('Parent / Guardian');
  const [mobile, setMobile] = useState('');
  const [secondaryPhone, setSecondaryPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  // Secondary Backup Contact
  const [hasSecondaryContact, setHasSecondaryContact] = useState(false);
  const [secName, setSecName] = useState('');
  const [secRel, setSecRel] = useState('Relative');
  const [secPhone, setSecPhone] = useState('');

  // Band Assignment
  const [bandMode, setBandMode] = useState<'inventory' | 'custom' | 'none'>('inventory');
  const [selectedInventoryBand, setSelectedInventoryBand] = useState(initialBandCode);
  const [customBandCode, setCustomBandCode] = useState('');

  // Plan Assignment
  const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?.id || '');

  // UI state
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available in-stock bands
  const availableBands = useMemo(() => {
    return bands.filter(
      (b) => b.status === 'available' || !b.childId || b.referenceCode === initialBandCode
    );
  }, [bands, initialBandCode]);

  const handleBirthDateChange = (val: string) => {
    setBirthDate(val);
    if (val) {
      const detailed = calculateDetailedAge(val);
      setCalculatedAge(detailed.formattedAge);
      if (detailed.suggestedCategory) {
        setAgeRange(detailed.suggestedCategory);
      }
    } else {
      setCalculatedAge('');
    }
  };

  const resetForm = () => {
    setName('');
    setAgeRange(CATEGORY_OPTIONS[0]);
    setBirthDate('');
    setCalculatedAge('');
    setGender('Not specified');
    setBloodGroup('Unknown');
    setNationalId('');
    setMedicalNotes('');
    setGuardianName('');
    setRelationship('Parent / Guardian');
    setMobile('');
    setSecondaryPhone('');
    setEmail('');
    setAddress('');
    setHasSecondaryContact(false);
    setSecName('');
    setSecRel('Relative');
    setSecPhone('');
    setBandMode('inventory');
    setSelectedInventoryBand(availableBands[0]?.referenceCode || '');
    setCustomBandCode('');
    setSelectedPlanId(plans[0]?.id || '');
    setErrorMessage('');
    setIsSubmitting(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Please provide the wearer full name.');
      return;
    }
    if (!guardianName.trim() || !mobile.trim()) {
      setErrorMessage('Please provide primary guardian name and mobile phone number.');
      return;
    }

    // Determine band code to assign
    let finalBandCode = '';
    if (bandMode === 'inventory') {
      finalBandCode = selectedInventoryBand;
    } else if (bandMode === 'custom') {
      if (!customBandCode.trim()) {
        setErrorMessage('Please enter a band reference code or select "Leave unassigned".');
        return;
      }
      finalBandCode = customBandCode.trim().toUpperCase();
    }

    setIsSubmitting(true);
    try {
      addWearerRecord({
        name: name.trim(),
        ageRange,
        birthDate: birthDate || undefined,
        calculatedAge: calculatedAge || undefined,
        gender: gender !== 'Not specified' ? gender : undefined,
        bloodGroup: bloodGroup !== 'Unknown' ? bloodGroup : undefined,
        nationalId: nationalId.trim() || undefined,
        medicalNotes: medicalNotes.trim() || undefined,
        primaryGuardian: {
          fullName: guardianName.trim(),
          relationship,
          mobile: mobile.trim(),
          secondaryPhone: secondaryPhone.trim() || undefined,
          email: email.trim() || undefined,
          address: address.trim() || undefined,
          preferredLanguage: 'English',
        },
        secondaryGuardians:
          hasSecondaryContact && secName.trim() && secPhone.trim()
            ? [
                {
                  fullName: secName.trim(),
                  relationship: secRel.trim(),
                  telephone: secPhone.trim(),
                },
              ]
            : [],
        bandCode: finalBandCode || undefined,
        planId: selectedPlanId || undefined,
        vendorId: 'central',
      });

      resetForm();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to enroll wearer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title="Enroll New Wearer & Assign Band"
      description="Directly register an individual profile, set up emergency contact routing, and connect an identification band."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {errorMessage && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-brand flex items-start gap-2.5 text-xs text-red-800">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Section 1: Wearer Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-border-subtle text-navy font-heading font-bold text-sm">
            <User className="w-4 h-4 text-navy" />
            <span>1. Individual / Wearer Information</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Wearer Full Name" required>
              <Input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Lucas Vance or Sarah Perera"
              />
            </FormField>

            <FormField label="Demographic Category">
              <Select value={ageRange} onChange={(e) => setAgeRange(e.target.value)}>
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Date of Birth (Optional)">
              <Input
                type="date"
                value={birthDate}
                onChange={(e) => handleBirthDateChange(e.target.value)}
              />
            </FormField>

            <FormField label="Calculated Age">
              <Input
                type="text"
                readOnly
                value={calculatedAge || 'Auto-computed from DOB'}
                className="bg-slate-50 text-slate-600 font-medium"
              />
            </FormField>

            <FormField label="Blood Group">
              <Select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Gender">
              <Select value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="Not specified">Not specified</option>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g.value} value={g.label}>
                    {g.label}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="National / Student ID (Optional)">
              <Input
                type="text"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                placeholder="e.g. NIC or Student Registration No."
              />
            </FormField>
          </div>

          <FormField label="Emergency Medical & Special Care Notes (Optional)">
            <Textarea
              rows={2}
              value={medicalNotes}
              onChange={(e) => setMedicalNotes(e.target.value)}
              placeholder="e.g. Peanut allergy, carries inhaler, diabetic alert, or non-verbal note..."
            />
          </FormField>
        </div>

        {/* Section 2: Primary Emergency Contact */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 pb-2 border-b border-border-subtle text-navy font-heading font-bold text-sm">
            <Shield className="w-4 h-4 text-navy" />
            <span>2. Primary Emergency Guardian / Contact</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Guardian Full Name" required>
              <Input
                type="text"
                required
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                placeholder="e.g. Elena Vance"
              />
            </FormField>

            <FormField label="Relationship to Wearer">
              <Select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value as RelationshipType)}
              >
                {RELATIONSHIP_OPTIONS.map((rel) => (
                  <option key={rel} value={rel}>
                    {rel}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Primary Mobile Phone" required>
              <Input
                type="tel"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="e.g. 0771234567 or +94 77 123 4567"
              />
            </FormField>

            <FormField label="Secondary Phone (Optional)">
              <Input
                type="tel"
                value={secondaryPhone}
                onChange={(e) => setSecondaryPhone(e.target.value)}
                placeholder="e.g. Home or office phone"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Email Address (Optional)">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="guardian@example.com"
              />
            </FormField>

            <FormField label="Home Address (Optional)">
              <Input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Colombo, Jaffna, Kandy..."
              />
            </FormField>
          </div>

          {/* Backup Contact Toggle */}
          <div className="pt-1">
            <label className="flex items-center gap-2 text-xs font-semibold text-navy cursor-pointer">
              <input
                type="checkbox"
                checked={hasSecondaryContact}
                onChange={(e) => setHasSecondaryContact(e.target.checked)}
                className="rounded border-border-subtle text-navy focus:ring-navy"
              />
              <span>+ Add a Secondary Emergency Contact (Redundancy)</span>
            </label>

            {hasSecondaryContact && (
              <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-brand grid grid-cols-1 sm:grid-cols-3 gap-3">
                <FormField label="Contact Name">
                  <Input
                    type="text"
                    value={secName}
                    onChange={(e) => setSecName(e.target.value)}
                    placeholder="Full name"
                  />
                </FormField>
                <FormField label="Relationship">
                  <Input
                    type="text"
                    value={secRel}
                    onChange={(e) => setSecRel(e.target.value)}
                    placeholder="e.g. Grandparent"
                  />
                </FormField>
                <FormField label="Telephone">
                  <Input
                    type="tel"
                    value={secPhone}
                    onChange={(e) => setSecPhone(e.target.value)}
                    placeholder="Phone number"
                  />
                </FormField>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Physical Band Assignment & Protection Plan */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 pb-2 border-b border-border-subtle text-navy font-heading font-bold text-sm">
            <Radio className="w-4 h-4 text-[#088F5B]" />
            <span>3. Band Assignment &amp; Service Plan</span>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-semibold text-navy">
              Band Reference Code Selection:
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setBandMode('inventory')}
                className={`p-2.5 rounded-brand border text-center font-medium transition-colors ${
                  bandMode === 'inventory'
                    ? 'border-navy bg-navy text-white'
                    : 'border-border-subtle bg-white text-navy hover:bg-slate-50'
                }`}
              >
                Available In Stock ({availableBands.length})
              </button>
              <button
                type="button"
                onClick={() => setBandMode('custom')}
                className={`p-2.5 rounded-brand border text-center font-medium transition-colors ${
                  bandMode === 'custom'
                    ? 'border-navy bg-navy text-white'
                    : 'border-border-subtle bg-white text-navy hover:bg-slate-50'
                }`}
              >
                Enter New Code
              </button>
              <button
                type="button"
                onClick={() => setBandMode('none')}
                className={`p-2.5 rounded-brand border text-center font-medium transition-colors ${
                  bandMode === 'none'
                    ? 'border-navy bg-navy text-white'
                    : 'border-border-subtle bg-white text-navy hover:bg-slate-50'
                }`}
              >
                Assign Later
              </button>
            </div>

            {bandMode === 'inventory' && (
              <div>
                {availableBands.length > 0 ? (
                  <Select
                    value={selectedInventoryBand}
                    onChange={(e) => setSelectedInventoryBand(e.target.value)}
                    className="font-mono text-sm font-bold text-navy"
                  >
                    {availableBands.map((b) => (
                      <option key={b.id} value={b.referenceCode}>
                        {b.referenceCode} ({b.status.toUpperCase()})
                      </option>
                    ))}
                  </Select>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-brand text-xs text-amber-900">
                    No available bands currently in inventory. Select "Enter New Code" to add a new physical band.
                  </div>
                )}
              </div>
            )}

            {bandMode === 'custom' && (
              <FormField label="Physical Band Reference Code">
                <Input
                  type="text"
                  value={customBandCode}
                  onChange={(e) =>
                    commitFormattedInput(e, (v) => v.toUpperCase(), setCustomBandCode)
                  }
                  placeholder="e.g. W4Y-9921-X4"
                  className="font-mono uppercase font-bold"
                />
              </FormField>
            )}

            {bandMode === 'none' && (
              <p className="text-xs text-content-muted italic">
                The wearer will be saved without an active band. You can link a band code anytime later in Band Inventory.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <FormField label="Select Subscription Protection Plan">
              <Select value={selectedPlanId} onChange={(e) => setSelectedPlanId(e.target.value)}>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.durationMonths} Months)
                  </option>
                ))}
              </Select>
            </FormField>

            <div className="flex items-center gap-2 p-3 bg-mint-pale rounded-brand border border-emerald-300 self-end text-xs text-mint-darker">
              <Sparkles className="w-4 h-4 text-[#088F5B] flex-shrink-0" />
              <span>Includes 24/7 central office emergency contact coordination.</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={() => {
              resetForm();
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Enroll Wearer &amp; Save
          </Button>
        </div>
      </form>
    </Modal>
  );
};
