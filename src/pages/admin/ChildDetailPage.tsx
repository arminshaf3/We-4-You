import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '../../components/admin/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { FormField, Input, Select, Textarea } from '../../components/common/FormField';
import { useApp } from '../../context/AppContext';
import { supabaseService } from '../../services/supabaseService';
import { calculateDetailedAge, BLOOD_GROUPS, GENDER_OPTIONS } from '../../utils/ageCalculator';
import {
  User,
  Shield,
  Phone,
  Radio,
  CreditCard,
  AlertTriangle,
  Clock,
  Store,
  Edit2,
  Lock,
  ArrowLeft,
  CheckCircle2,
  Camera,
  Upload,
  HeartPulse,
  MapPin,
  Calendar,
  AlertCircle,
} from 'lucide-react';

export const ChildDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { childrenRecords, subscriptions, vendors, incidents, updateChildRecord, updateCustomerSubscriptionPrice } = useApp();

  const child = childrenRecords.find((c) => c.id === id);
  const sub = subscriptions.find((s) => s.id === child?.subscriptionId);
  const vendor = vendors.find((v) => v.id === child?.vendorId);
  const childIncidents = incidents.filter((i) => i.bandReference === child?.currentBandCode);

  // Signed URL for private photo
  const [signedPhotoUrl, setSignedPhotoUrl] = useState<string | null>(child?.photoUrl || null);

  // Custom Price Modal State
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [customPriceVal, setCustomPriceVal] = useState<number>(sub?.customPriceAmount !== undefined ? sub.customPriceAmount : 29);
  const [customPriceNote, setCustomPriceNote] = useState<string>(sub?.customPriceNote || '');

  useEffect(() => {
    if (child?.photoUrl) {
      supabaseService.getSignedPhotoUrl(child.photoUrl).then((url) => {
        if (url) setSignedPhotoUrl(url);
      });
    }
  }, [child?.photoUrl]);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(child?.name || '');
  const [editBirthDate, setEditBirthDate] = useState(child?.birthDate || '');
  const [editCalculatedAge, setEditCalculatedAge] = useState(child?.calculatedAge || '');
  const [editAgeRange, setEditAgeRange] = useState(child?.ageRange || '');
  const [editGender, setEditGender] = useState(child?.gender || '');
  const [editBloodGroup, setEditBloodGroup] = useState(child?.bloodGroup || '');
  const [editNationalId, setEditNationalId] = useState(child?.nationalId || '');
  const [editMedicalNotes, setEditMedicalNotes] = useState(child?.medicalNotes || '');
  
  const [editGuardianName, setEditGuardianName] = useState(child?.primaryGuardian.fullName || '');
  const [editMobile, setEditMobile] = useState(child?.primaryGuardian.mobile || '');
  const [editSecondaryPhone, setEditSecondaryPhone] = useState(child?.primaryGuardian.secondaryPhone || '');
  const [editAddress, setEditAddress] = useState(child?.primaryGuardian.address || '');
  const [editGuardianNationalId, setEditGuardianNationalId] = useState(child?.primaryGuardian.nationalId || '');

  const [changeReason, setChangeReason] = useState('');
  const [changeVerified, setChangeVerified] = useState(false);
  const [editError, setEditError] = useState('');

  if (!child) {
    return (
      <div>
        <PageHeader title="Record Not Found" />
        <p className="text-content-muted">Child record not found in registry.</p>
      </div>
    );
  }

  const handleOpenEdit = () => {
    setEditName(child.name);
    setEditBirthDate(child.birthDate || '');
    setEditCalculatedAge(child.calculatedAge || '');
    setEditAgeRange(child.ageRange);
    setEditGender(child.gender || '');
    setEditBloodGroup(child.bloodGroup || '');
    setEditNationalId(child.nationalId || '');
    setEditMedicalNotes(child.medicalNotes || '');

    setEditGuardianName(child.primaryGuardian.fullName);
    setEditMobile(child.primaryGuardian.mobile);
    setEditSecondaryPhone(child.primaryGuardian.secondaryPhone || '');
    setEditAddress(child.primaryGuardian.address || '');
    setEditGuardianNationalId(child.primaryGuardian.nationalId || '');

    setChangeReason('');
    setChangeVerified(false);
    setEditError('');
    setIsEditModalOpen(true);
  };

  const handleBirthDateChange = (val: string) => {
    setEditBirthDate(val);
    if (val) {
      const detailed = calculateDetailedAge(val);
      setEditCalculatedAge(detailed.formattedAge);
      if (detailed.suggestedCategory) {
        setEditAgeRange(detailed.suggestedCategory);
      }
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editGuardianName.trim() || !editMobile.trim()) {
      setEditError('Please provide all required fields.');
      return;
    }
    // Sensitive verification check: contact telephone change requires verified box
    if (editMobile !== child.primaryGuardian.mobile && (!changeVerified || !changeReason.trim())) {
      setEditError('Sensitive Update Notice: Changing guardian phone numbers requires a documented verification reason and staff identity check confirmation.');
      return;
    }

    updateChildRecord(child.id, {
      name: editName.trim(),
      birthDate: editBirthDate || undefined,
      calculatedAge: editCalculatedAge || undefined,
      ageRange: editAgeRange.trim(),
      gender: editGender || undefined,
      bloodGroup: editBloodGroup || undefined,
      nationalId: editNationalId.trim() || undefined,
      medicalNotes: editMedicalNotes.trim() || undefined,
      primaryGuardian: {
        ...child.primaryGuardian,
        fullName: editGuardianName.trim(),
        mobile: editMobile.trim(),
        secondaryPhone: editSecondaryPhone.trim() || undefined,
        address: editAddress.trim() || undefined,
        nationalId: editGuardianNationalId.trim() || undefined,
      },
    });

    setIsEditModalOpen(false);
  };

  return (
    <div>
      <PageHeader
        title={child.name}
        breadcrumbs={[
          { label: 'Wearers & Contacts Registry', to: '/admin/children' },
          { label: child.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button onClick={handleOpenEdit} variant="outline" size="sm" leftIcon={<Edit2 className="w-3.5 h-3.5" />}>
              Edit Record
            </Button>
            <Button to="/admin/children" variant="outline" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Registry
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (8 cols): Wearer & Contact Profiles */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Info Card */}
          <div className="bg-white p-6 rounded-brand border border-border-subtle shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div className="flex items-center gap-2 text-navy font-heading font-bold text-base">
                <User className="w-5 h-5 text-navy" />
                <span>Wearer Profile Record</span>
              </div>
              <span className="text-xs font-mono text-content-muted">ID: {child.id}</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-5 items-start">
              {signedPhotoUrl ? (
                <div className="relative w-24 h-24 rounded-brand-lg overflow-hidden border border-border-subtle flex-shrink-0 bg-slate-100 shadow-sm">
                  <img src={signedPhotoUrl} alt={child.name} className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-navy/80 text-[9px] text-center text-white py-0.5 font-medium">
                    Private
                  </span>
                </div>
              ) : (
                <div className="w-24 h-24 rounded-brand-lg border border-border-subtle bg-slate-50 flex flex-col items-center justify-center text-slate-400 flex-shrink-0">
                  <Camera className="w-8 h-8 mb-1" />
                  <span className="text-[10px]">No Photo</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs flex-1">
                <div>
                  <span className="text-content-muted block mb-0.5">Wearer Full Name</span>
                  <span className="text-base font-bold text-navy block">{child.name}</span>
                  <span className="text-content-muted text-[11px] block mt-0.5">
                    Category: <strong className="text-slate-700">{child.ageRange}</strong>
                  </span>
                </div>

                <div>
                  <span className="text-content-muted block mb-0.5">Date of Birth &amp; Computed Age</span>
                  {child.birthDate ? (
                    <div>
                      <span className="text-sm font-semibold text-navy block">{child.birthDate}</span>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-300">
                        {child.calculatedAge || 'Age computed'}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm font-semibold text-navy">{child.ageRange}</span>
                  )}
                </div>

                <div>
                  <span className="text-content-muted block mb-0.5">Blood Group</span>
                  {child.bloodGroup && child.bloodGroup !== 'Unknown' ? (
                    <span className="inline-block px-2.5 py-0.5 rounded bg-rose-50 text-rose-700 font-bold border border-rose-200">
                      {child.bloodGroup}
                    </span>
                  ) : (
                    <span className="text-content-muted">Unknown / Unrecorded</span>
                  )}
                </div>

                <div>
                  <span className="text-content-muted block mb-0.5">Gender</span>
                  <span className="font-semibold text-slate-800">{child.gender || 'Not specified'}</span>
                </div>

                <div>
                  <span className="text-content-muted block mb-0.5">National / Student ID</span>
                  <span className="font-mono text-slate-800">{child.nationalId || 'None recorded'}</span>
                </div>

                <div>
                  <span className="text-content-muted block mb-0.5">Registration Date</span>
                  <span className="text-sm font-semibold text-navy">{child.registeredDate}</span>
                </div>
              </div>
            </div>

            {/* Medical / Allergy Banner if present */}
            {child.medicalNotes && (
              <div className="p-3.5 bg-amber-50/80 rounded-brand border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-900 block mb-0.5">Emergency Medical &amp; Special Care Notes:</span>
                  <p className="text-amber-900 leading-relaxed">{child.medicalNotes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Linked Emergency Contacts & Contact Priority */}
          <div className="bg-white p-6 rounded-brand border border-border-subtle shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div className="flex items-center gap-2 text-navy font-heading font-bold text-base">
                <Shield className="w-5 h-5 text-navy" />
                <span>Authorized Emergency Contacts (Priority Order)</span>
              </div>
              <span className="text-xs text-mint-darker bg-mint-pale px-2 py-0.5 rounded font-semibold border border-emerald-300">
                Staff Intermediary Call Order
              </span>
            </div>

            {/* Priority 1: Primary Guardian */}
            <div className="p-4 rounded-brand bg-neutral-soft border border-border-subtle space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-navy text-white text-[11px] font-bold flex items-center justify-center">
                    1
                  </span>
                  <span className="font-heading font-bold text-sm text-navy">
                    Priority 1 — {child.primaryGuardian.fullName}
                  </span>
                  <span className="text-xs text-content-muted font-medium">
                    ({child.primaryGuardian.relationship})
                  </span>
                </div>
                <span className="text-xs font-bold text-navy bg-white px-2 py-0.5 rounded border">Primary</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div className="space-y-1">
                  <div>
                    <span className="text-content-muted block">Primary Mobile Phone:</span>
                    <span className="font-mono text-sm font-bold text-[#088F5B] flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      {child.primaryGuardian.mobile}
                    </span>
                  </div>
                  {child.primaryGuardian.secondaryPhone && (
                    <div>
                      <span className="text-content-muted block">Secondary Telephone:</span>
                      <span className="font-mono text-slate-700 font-medium">{child.primaryGuardian.secondaryPhone}</span>
                    </div>
                  )}
                  {child.primaryGuardian.nationalId && (
                    <div>
                      <span className="text-content-muted block">Guardian ID / Passport:</span>
                      <span className="font-mono text-slate-700">{child.primaryGuardian.nationalId}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <div>
                    <span className="text-content-muted block">Language / Email:</span>
                    <span className="text-content-body">
                      {child.primaryGuardian.preferredLanguage} &bull; {child.primaryGuardian.email || 'No email provided'}
                    </span>
                  </div>
                  {child.primaryGuardian.address && (
                    <div className="pt-1">
                      <span className="text-content-muted block">Residential Address:</span>
                      <span className="text-slate-800 leading-tight block bg-white p-2 rounded border border-border-subtle">
                        {child.primaryGuardian.address}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Priority 2+: Secondary Contacts */}
            {child.secondaryGuardians.map((sec, idx) => (
              <div key={idx} className="p-4 rounded-brand bg-white border border-border-subtle space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center justify-center">
                      {idx + 2}
                    </span>
                    <span className="font-heading font-semibold text-sm text-navy">
                      Priority {idx + 2} — {sec.fullName}
                    </span>
                    <span className="text-xs text-content-muted">({sec.relationship})</span>
                  </div>
                  <span className="text-xs text-content-muted bg-slate-100 px-2 py-0.5 rounded">Secondary Backup</span>
                </div>
                <div className="text-xs pt-1">
                  <span className="text-content-muted block">Emergency Telephone:</span>
                  <span className="font-mono text-sm font-semibold text-navy flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {sec.telephone}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Linked Incident History for this Child */}
          <div className="bg-white p-6 rounded-brand border border-border-subtle shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div className="flex items-center gap-2 text-navy font-heading font-bold text-base">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>Office Assistance Incident History</span>
              </div>
              <span className="text-xs font-semibold text-navy">
                {childIncidents.length} linked report(s)
              </span>
            </div>

            {childIncidents.length > 0 ? (
              <div className="space-y-3">
                {childIncidents.map((inc) => (
                  <div key={inc.id} className="p-4 rounded-brand bg-neutral-soft border border-border-subtle text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <Link to={`/admin/incidents/${inc.id}`} className="font-mono font-bold text-navy text-sm hover:underline">
                        {inc.incidentRef}
                      </Link>
                      <StatusBadge status={inc.status} size="sm" />
                    </div>
                    <p className="text-content-body">
                      Location reported: <strong>{inc.voluntaryLocation || 'Not provided'}</strong>
                    </p>
                    <div className="text-content-muted flex items-center justify-between pt-1 border-t border-border-subtle">
                      <span>Logged: {inc.createdAt}</span>
                      <span>Attempts: {inc.attempts.length}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-content-muted italic">No assistance incidents recorded for this wearer.</p>
            )}
          </div>

        </div>

        {/* Right Column (4 cols): Active Band, Subscription, Retailer Source */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Active Band Card */}
          <div className="bg-white p-5 rounded-brand border border-border-subtle shadow-subtle space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-heading font-bold uppercase tracking-wider text-navy">
                Assigned Band Reference
              </span>
              <Radio className="w-4 h-4 text-[#088F5B]" />
            </div>
            <div className="p-3 bg-mint-pale rounded-brand border border-emerald-300 text-center">
              <span className="font-mono text-xl font-bold text-navy tracking-wider block">
                {child.currentBandCode}
              </span>
              <span className="text-[11px] text-mint-darker font-medium mt-0.5 block">
                Active Physical Identification Band
              </span>
            </div>
            <Link
              to="/admin/bands"
              className="text-xs text-navy font-semibold hover:underline block text-center pt-1"
            >
              Replace or Manage Band →
            </Link>
          </div>

          {/* Active Subscription Details */}
          {/* Subscription Details */}
          <div className="bg-white p-5 rounded-brand border border-border-subtle shadow-subtle space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-heading font-bold uppercase tracking-wider text-navy">
                Service Subscription
              </span>
              <CreditCard className="w-4 h-4 text-navy" />
            </div>
            {sub ? (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-content-muted">Status:</span>
                  <StatusBadge status={sub.status} size="sm" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-content-muted">Rate / Price:</span>
                  <div className="text-right">
                    <span className="font-bold text-navy">
                      ${(sub.customPriceAmount !== undefined ? sub.customPriceAmount : 29).toFixed(2)}
                    </span>
                    {sub.customPriceAmount !== undefined && (
                      <span className="block text-3xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 mt-0.5">
                        Custom Price Override
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-content-muted">Start Date:</span>
                  <span className="font-semibold text-navy">{sub.startDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-content-muted">Expiry Date:</span>
                  <span className="font-semibold text-navy">{sub.expiryDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-content-muted">Renewals:</span>
                  <span className="text-navy">{sub.renewalCount} extension(s)</span>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <Button
                    onClick={() => {
                      setCustomPriceVal(sub.customPriceAmount !== undefined ? sub.customPriceAmount : 29);
                      setCustomPriceNote(sub.customPriceNote || '');
                      setIsPriceModalOpen(true);
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                  >
                    Edit Customer Price
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-content-muted">No linked active subscription.</p>
            )}
            <Link
              to="/admin/subscriptions"
              className="text-xs text-navy font-semibold hover:underline block text-center pt-2 border-t border-border-subtle"
            >
              Manage In Subscriptions Portal →
            </Link>
          </div>

          {/* Retail Purchase Source */}
          <div className="bg-white p-5 rounded-brand border border-border-subtle shadow-subtle space-y-2 text-xs">
            <div className="flex items-center gap-2 text-navy font-bold">
              <Store className="w-4 h-4 text-navy" />
              <span>Purchase Source</span>
            </div>
            <p className="text-content-body">
              <strong>Shop:</strong> {vendor ? `${vendor.shopName} (${vendor.branch})` : 'We 4 You Office'}
            </p>
            <p className="text-content-muted">
              Purchase Date: {child.purchaseDate} &bull; Receipt: {child.receiptRef}
            </p>
          </div>

        </div>

      </div>

      {/* Edit Wearer Profile Modal with Sensitive Verification Step */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Wearer & Contact Record"
        description="Update profile details with simulated identity audit verification."
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          {editError && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-brand border border-red-200">
              {editError}
            </div>
          )}

          {/* Wearer Details Section */}
          <div className="space-y-3 pb-3 border-b border-border-subtle">
            <h4 className="font-heading font-bold text-xs text-navy uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-navy" />
              <span>Wearer Identification &amp; Demographics</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Wearer Full Name" required>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </FormField>

              <FormField
                label="Date of Birth (Birthdate)"
                hint={
                  editCalculatedAge ? (
                    <span className="font-semibold text-emerald-700">Calculated: {editCalculatedAge}</span>
                  ) : undefined
                }
              >
                <Input
                  type="date"
                  value={editBirthDate}
                  onChange={(e) => handleBirthDateChange(e.target.value)}
                  max={new Date().toISOString().substring(0, 10)}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <FormField label="Blood Group">
                <Select
                  value={editBloodGroup}
                  onChange={(e) => setEditBloodGroup(e.target.value)}
                >
                  <option value="">Select blood group...</option>
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Gender">
                <Select
                  value={editGender}
                  onChange={(e) => setEditGender(e.target.value)}
                >
                  <option value="">Select gender...</option>
                  {GENDER_OPTIONS.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Category / Age Group" required>
                <Input
                  value={editAgeRange}
                  onChange={(e) => setEditAgeRange(e.target.value)}
                  required
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Wearer National / Student ID (Optional)">
                <Input
                  value={editNationalId}
                  onChange={(e) => setEditNationalId(e.target.value)}
                  placeholder="e.g. STU-10293 or Passport #"
                />
              </FormField>

              <FormField label="Emergency Medical Notes / Allergies (Optional)">
                <Input
                  value={editMedicalNotes}
                  onChange={(e) => setEditMedicalNotes(e.target.value)}
                  placeholder="e.g. Asthmatic, Penicillin allergy, Diabetic"
                />
              </FormField>
            </div>
          </div>

          {/* Guardian Details Section */}
          <div className="space-y-3 pt-1">
            <h4 className="font-heading font-bold text-xs text-navy uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-navy" />
              <span>Primary Guardian &amp; Address</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Primary Contact Name" required>
                <Input
                  value={editGuardianName}
                  onChange={(e) => setEditGuardianName(e.target.value)}
                  required
                />
              </FormField>

              <FormField label="Primary Contact Mobile Phone" required hint="Sensitive contact field">
                <Input
                  type="tel"
                  value={editMobile}
                  onChange={(e) => setEditMobile(e.target.value)}
                  required
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Alternative / Secondary Phone (Optional)">
                <Input
                  type="tel"
                  value={editSecondaryPhone}
                  onChange={(e) => setEditSecondaryPhone(e.target.value)}
                  placeholder="e.g. +1 (555) 987-6543"
                />
              </FormField>

              <FormField label="Guardian National ID / Passport # (Optional)">
                <Input
                  value={editGuardianNationalId}
                  onChange={(e) => setEditGuardianNationalId(e.target.value)}
                  placeholder="e.g. ID-8849201"
                />
              </FormField>
            </div>

            <FormField label="Residential / Postal Address (Optional)">
              <Input
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                placeholder="e.g. 123 Maple Street, City, State, ZIP"
              />
            </FormField>
          </div>

          {/* Sensitive change verification required if phone changed */}
          {editMobile !== child.primaryGuardian.mobile && (
            <div className="p-4 bg-amber-50 rounded-brand border border-amber-200 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <Lock className="w-4 h-4 text-amber-700" />
                <span>Sensitive Contact Modification Protocol</span>
              </div>
              <p className="text-[11px] text-amber-900 leading-normal">
                Modifying the emergency telephone contact directly impacts individual safety. Please record the verification rationale.
              </p>
              <FormField label="Verification Note / Reason" required>
                <Input
                  value={changeReason}
                  onChange={(e) => setChangeReason(e.target.value)}
                  placeholder="e.g. Primary contact phoned from previous registered number to confirm new digits"
                  required
                />
              </FormField>
              <label className="flex items-center gap-2 text-xs font-semibold text-amber-900 cursor-pointer">
                <input
                  type="checkbox"
                  checked={changeVerified}
                  onChange={(e) => setChangeVerified(e.target.checked)}
                  className="w-4 h-4 rounded text-navy"
                />
                <span>I confirm staff has verified contact identity prior to this change.</span>
              </label>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3">
            <Button onClick={() => setIsEditModalOpen(false)} variant="outline" size="md">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md">
              Save Record Updates
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Customer Subscription Price Modal */}
      <Modal
        isOpen={isPriceModalOpen}
        onClose={() => setIsPriceModalOpen(false)}
        title={`Custom Subscription Price: ${child.name}`}
        description="Set a customized subscription rate or special negotiated pricing for this specific customer."
      >
        {sub && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateCustomerSubscriptionPrice(sub.id, customPriceVal, customPriceNote);
              setIsPriceModalOpen(false);
            }}
            className="space-y-4"
          >
            <div className="p-3 bg-neutral-soft rounded-brand border border-border-subtle text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-content-muted">Wearer / Customer:</span>
                <span className="font-bold text-navy">{child.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-content-muted">Band Reference:</span>
                <span className="font-mono text-navy font-bold">{child.currentBandCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-content-muted">Current Expiration:</span>
                <span className="text-navy">{sub.expiryDate}</span>
              </div>
            </div>

            <FormField
              label="Custom Subscription Price ($ USD)"
              required
              hint="Overrides standard plan pricing for all future renewals and receipts for this customer"
            >
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold">
                  $
                </div>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={customPriceVal}
                  onChange={(e) => setCustomPriceVal(Number(e.target.value))}
                  className="pl-8"
                  placeholder="29.00"
                />
              </div>
            </FormField>

            {/* Quick Discount / Override Presets */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-navy">Quick Rate Presets:</label>
              <div className="flex flex-wrap gap-2">
                {[0, 15, 20, 25, 29, 39, 49].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setCustomPriceVal(amt)}
                    className={`px-2.5 py-1 text-xs rounded-brand border transition-all ${
                      customPriceVal === amt
                        ? 'bg-navy text-white font-bold border-navy shadow-xs'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    {amt === 0 ? 'Free / Waived ($0)' : `$${amt}.00`}
                  </button>
                ))}
              </div>
            </div>

            <FormField label="Price Override Reason / Staff Note">
              <Textarea
                value={customPriceNote}
                onChange={(e) => setCustomPriceNote(e.target.value)}
                placeholder="e.g. Special family hardship rate, multi-child discount, or promotional agreement"
                rows={2}
              />
            </FormField>

            <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle">
              <Button onClick={() => setIsPriceModalOpen(false)} variant="outline" size="md">
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md">
                Apply Customer Price
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
