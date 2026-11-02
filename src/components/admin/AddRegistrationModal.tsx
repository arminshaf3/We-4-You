import React, { useState, useMemo } from 'react';
import { Modal } from '../common/Modal';
import { FormField, Input, Select, Textarea, commitFormattedInput } from '../common/FormField';
import { Button } from '../common/Button';
import { useApp } from '../../context/AppContext';
import { calculateDetailedAge, BLOOD_GROUPS, GENDER_OPTIONS } from '../../utils/ageCalculator';
import { RelationshipType, PaymentMethod } from '../../types';
import {
  ClipboardList,
  User,
  Shield,
  Phone,
  Radio,
  CreditCard,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Store,
} from 'lucide-react';

interface AddRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
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

const LANGUAGE_OPTIONS = ['English', 'Sinhala', 'Tamil'];

export const AddRegistrationModal: React.FC<AddRegistrationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { bands, plans, vendors, submitPublicRegistration, updateRegistrationStatus } = useApp();

  // Wearer Info
  const [wearerName, setWearerName] = useState('');
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
  const [guardianNationalId, setGuardianNationalId] = useState('');
  const [language, setLanguage] = useState(LANGUAGE_OPTIONS[0]);

  // Secondary Backup Contact
  const [hasSecondaryContact, setHasSecondaryContact] = useState(false);
  const [secName, setSecName] = useState('');
  const [secRel, setSecRel] = useState('Relative');
  const [secPhone, setSecPhone] = useState('');

  // Band Reference
  const [bandSelectionMode, setBandSelectionMode] = useState<'inventory' | 'custom'>('inventory');
  const [selectedInventoryBand, setSelectedInventoryBand] = useState('');
  const [customBandCode, setCustomBandCode] = useState('');

  // Plan & Source
  const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?.id || 'PLAN-ANNUAL');
  const [selectedVendorId, setSelectedVendorId] = useState('DIRECT');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');

  // Instant Approval
  const [autoApprove, setAutoApprove] = useState(true);

  // UI state
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available bands
  const availableBands = useMemo(() => {
    return bands.filter((b) => b.status === 'available');
  }, [bands]);

  // Default inventory band when available
  React.useEffect(() => {
    if (availableBands.length > 0 && !selectedInventoryBand) {
      setSelectedInventoryBand(availableBands[0].referenceCode);
    }
  }, [availableBands, selectedInventoryBand]);

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
    setWearerName('');
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
    setGuardianNationalId('');
    setLanguage(LANGUAGE_OPTIONS[0]);

    setHasSecondaryContact(false);
    setSecName('');
    setSecRel('Relative');
    setSecPhone('');

    setBandSelectionMode('inventory');
    setSelectedInventoryBand(availableBands[0]?.referenceCode || '');
    setCustomBandCode('');

    setSelectedPlanId(plans[0]?.id || 'PLAN-ANNUAL');
    setSelectedVendorId('DIRECT');
    setPaymentMethod('card');
    setAutoApprove(true);
    setErrorMessage('');
    setIsSubmitting(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!wearerName.trim()) {
      setErrorMessage('Please enter the wearer full name.');
      return;
    }
    if (!guardianName.trim() || !mobile.trim()) {
      setErrorMessage('Please enter primary guardian name and mobile phone number.');
      return;
    }

    const bandCodeToUse =
      bandSelectionMode === 'inventory'
        ? selectedInventoryBand
        : customBandCode.trim().toUpperCase();

    if (!bandCodeToUse) {
      setErrorMessage('Please select or enter an identification band reference code.');
      return;
    }

    setIsSubmitting(true);
    try {
      const emergencyContactObj =
        hasSecondaryContact && secName.trim() && secPhone.trim()
          ? {
              fullName: secName.trim(),
              relationship: secRel.trim(),
              telephone: secPhone.trim(),
            }
          : undefined;

      // 1. Submit Registration
      const reg = submitPublicRegistration({
        child: {
          name: wearerName.trim(),
          ageRange,
          birthDate: birthDate || undefined,
          calculatedAge: calculatedAge || undefined,
          gender: gender !== 'Not specified' ? gender : undefined,
          bloodGroup: bloodGroup !== 'Unknown' ? bloodGroup : undefined,
          nationalId: nationalId.trim() || undefined,
          medicalNotes: medicalNotes.trim() || undefined,
        },
        guardian: {
          fullName: guardianName.trim(),
          relationship,
          mobile: mobile.trim(),
          secondaryPhone: secondaryPhone.trim() || undefined,
          email: email.trim() || undefined,
          address: address.trim() || undefined,
          nationalId: guardianNationalId.trim() || undefined,
          preferredLanguage: language,
          emergencyContact: emergencyContactObj,
        },
        bandCode: bandCodeToUse,
        planId: selectedPlanId,
        vendorId: selectedVendorId,
        paymentMethod,
      });

      // 2. If staff enabled instant approval, approve immediately
      if (autoApprove && reg && reg.id) {
        updateRegistrationStatus(reg.id, 'approved', 'Direct office enrollment by administrator.');
      }

      resetForm();
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit registration.');
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
      title="Create New Registration"
      description="Record a complete customer registration file with wearer demographics, guardian authority, and band allocation."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {errorMessage && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-brand flex items-start gap-2.5 text-xs text-red-800">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Section 1: Wearer / Child Information */}
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
                value={wearerName}
                onChange={(e) => setWearerName(e.target.value)}
                placeholder="Full name of person wearing band"
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

            <FormField label="Computed Age">
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
              placeholder="e.g. Allergies, asthma inhaler, autism, diabetic notes..."
            />
          </FormField>
        </div>

        {/* Section 2: Primary Guardian Details */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 pb-2 border-b border-border-subtle text-navy font-heading font-bold text-sm">
            <Shield className="w-4 h-4 text-navy" />
            <span>2. Primary Emergency Guardian Details</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Guardian Full Name" required>
              <Input
                type="text"
                required
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                placeholder="Full name of primary parent/guardian"
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

            <FormField label="Secondary Telephone (Optional)">
              <Input
                type="tel"
                value={secondaryPhone}
                onChange={(e) => setSecondaryPhone(e.target.value)}
                placeholder="Alternative contact telephone"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FormField label="Email Address (Optional)">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="guardian@example.com"
              />
            </FormField>

            <FormField label="Guardian NIC / Passport">
              <Input
                type="text"
                value={guardianNationalId}
                onChange={(e) => setGuardianNationalId(e.target.value)}
                placeholder="e.g. 199012345678"
              />
            </FormField>

            <FormField label="Preferred Language">
              <Select value={language} onChange={(e) => setLanguage(e.target.value)}>
                {LANGUAGE_OPTIONS.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <FormField label="Residential Address (Optional)">
            <Input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. No 21, Somasundram Avenue, Chundikuli, Jaffna"
            />
          </FormField>

          {/* Secondary Backup Contact Checkbox */}
          <div className="pt-1">
            <label className="flex items-center gap-2 text-xs font-semibold text-navy cursor-pointer">
              <input
                type="checkbox"
                checked={hasSecondaryContact}
                onChange={(e) => setHasSecondaryContact(e.target.checked)}
                className="rounded border-border-subtle text-navy focus:ring-navy"
              />
              <span>+ Add a Secondary Emergency Contact (Priority 2 Backup)</span>
            </label>

            {hasSecondaryContact && (
              <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200 rounded-brand grid grid-cols-1 sm:grid-cols-3 gap-3">
                <FormField label="Contact Full Name">
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
                <FormField label="Telephone Number">
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

        {/* Section 3: Physical Band & Source */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center gap-2 pb-2 border-b border-border-subtle text-navy font-heading font-bold text-sm">
            <Radio className="w-4 h-4 text-[#088F5B]" />
            <span>3. Physical Band Code &amp; Retail Origin</span>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-semibold text-navy">
              Band Reference Allocation:
            </label>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <button
                type="button"
                onClick={() => setBandSelectionMode('inventory')}
                className={`p-2.5 rounded-brand border text-center font-medium transition-colors ${
                  bandSelectionMode === 'inventory'
                    ? 'border-navy bg-navy text-white'
                    : 'border-border-subtle bg-white text-navy hover:bg-slate-50'
                }`}
              >
                Pick Available In Stock ({availableBands.length})
              </button>
              <button
                type="button"
                onClick={() => setBandSelectionMode('custom')}
                className={`p-2.5 rounded-brand border text-center font-medium transition-colors ${
                  bandSelectionMode === 'custom'
                    ? 'border-navy bg-navy text-white'
                    : 'border-border-subtle bg-white text-navy hover:bg-slate-50'
                }`}
              >
                Type New / Custom Code
              </button>
            </div>

            {bandSelectionMode === 'inventory' && (
              <div>
                {availableBands.length > 0 ? (
                  <Select
                    value={selectedInventoryBand}
                    onChange={(e) => setSelectedInventoryBand(e.target.value)}
                    className="font-mono text-sm font-bold text-navy"
                  >
                    {availableBands.map((b) => (
                      <option key={b.id} value={b.referenceCode}>
                        {b.referenceCode} (In Stock)
                      </option>
                    ))}
                  </Select>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-brand text-xs text-amber-900">
                    No available bands currently in inventory. Switch to "Type New / Custom Code".
                  </div>
                )}
              </div>
            )}

            {bandSelectionMode === 'custom' && (
              <FormField label="Physical Band Code Reference">
                <Input
                  type="text"
                  value={customBandCode}
                  onChange={(e) =>
                    commitFormattedInput(e, (v) => v.toUpperCase(), setCustomBandCode)
                  }
                  placeholder="e.g. W4Y-1082-M4"
                  className="font-mono uppercase font-bold"
                />
              </FormField>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <FormField label="Protection Plan">
              <Select value={selectedPlanId} onChange={(e) => setSelectedPlanId(e.target.value)}>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.durationMonths} Mo)
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Sales / Partner Origin">
              <Select value={selectedVendorId} onChange={(e) => setSelectedVendorId(e.target.value)}>
                <option value="DIRECT">Direct We 4 You Office</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.shopName} ({v.branch})
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Payment Method">
              <Select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              >
                <option value="card">Online / Debit Card</option>
                <option value="bank_transfer">Bank Transfer / Deposit</option>
                <option value="store_cash">In-Store Cash</option>
                <option value="offline_voucher">Complimentary / Voucher</option>
              </Select>
            </FormField>
          </div>
        </div>

        {/* Section 4: Activation Decision */}
        <div className="p-4 bg-emerald-50/70 border border-emerald-200/90 rounded-brand space-y-2 text-xs">
          <label className="flex items-center gap-2.5 font-heading font-bold text-emerald-950 cursor-pointer">
            <input
              type="checkbox"
              checked={autoApprove}
              onChange={(e) => setAutoApprove(e.target.checked)}
              className="rounded border-emerald-300 text-[#088F5B] focus:ring-[#088F5B]"
            />
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#088F5B]" />
              <span>Instant Approve &amp; Activate Wearer Profile Immediately</span>
            </span>
          </label>
          <p className="text-emerald-800 pl-6 leading-relaxed">
            {autoApprove
              ? 'This registration will be approved immediately upon submission. A protected wearer profile will be created, the band will be assigned, and the 12-month subscription will be activated instantly.'
              : 'The registration will be queued with status "Pending Verification" for standard review before activation.'}
          </p>
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
            leftIcon={<ClipboardList className="w-4 h-4" />}
          >
            {autoApprove ? 'Create & Activate Wearer' : 'Submit Registration to Queue'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
