import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '../../components/admin/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { FormField, Input, Select } from '../../components/common/FormField';
import { useApp } from '../../context/AppContext';
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
} from 'lucide-react';

export const ChildDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { childrenRecords, subscriptions, vendors, incidents, updateChildRecord } = useApp();

  const child = childrenRecords.find((c) => c.id === id);
  const sub = subscriptions.find((s) => s.id === child?.subscriptionId);
  const vendor = vendors.find((v) => v.id === child?.vendorId);
  const childIncidents = incidents.filter((i) => i.bandReference === child?.currentBandCode);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(child?.name || '');
  const [editAge, setEditAge] = useState(child?.ageRange || '');
  const [editGuardianName, setEditGuardianName] = useState(child?.primaryGuardian.fullName || '');
  const [editMobile, setEditMobile] = useState(child?.primaryGuardian.mobile || '');
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
    setEditAge(child.ageRange);
    setEditGuardianName(child.primaryGuardian.fullName);
    setEditMobile(child.primaryGuardian.mobile);
    setChangeReason('');
    setChangeVerified(false);
    setEditError('');
    setIsEditModalOpen(true);
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
      ageRange: editAge.trim(),
      primaryGuardian: {
        ...child.primaryGuardian,
        fullName: editGuardianName.trim(),
        mobile: editMobile.trim(),
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
                <span>Wearer Profile (Fictional Demo Record)</span>
              </div>
              <span className="text-xs font-mono text-content-muted">ID: {child.id}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-content-muted block mb-0.5">Wearer Full Name</span>
                <span className="text-base font-bold text-navy">{child.name}</span>
              </div>
              <div>
                <span className="text-content-muted block mb-0.5">Category / Age Group</span>
                <span className="text-sm font-semibold text-navy">{child.ageRange}</span>
              </div>
              <div>
                <span className="text-content-muted block mb-0.5">Registration Date</span>
                <span className="text-sm font-semibold text-navy">{child.registeredDate}</span>
              </div>
            </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="text-content-muted block">Mobile Telephone:</span>
                  <span className="font-mono text-sm font-bold text-[#088F5B] flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {child.primaryGuardian.mobile}
                  </span>
                </div>
                <div>
                  <span className="text-content-muted block">Language / Email:</span>
                  <span className="text-content-body">
                    {child.primaryGuardian.preferredLanguage} &bull; {child.primaryGuardian.email || 'No email provided'}
                  </span>
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
              </div>
            ) : (
              <p className="text-xs text-content-muted">No linked active subscription.</p>
            )}
            <Link
              to="/admin/subscriptions"
              className="text-xs text-navy font-semibold hover:underline block text-center pt-2 border-t border-border-subtle"
            >
              Manage Subscription →
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Wearer Full Name" required>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Category / Age Group" required>
              <Input
                value={editAge}
                onChange={(e) => setEditAge(e.target.value)}
                required
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Primary Contact Name" required>
              <Input
                value={editGuardianName}
                onChange={(e) => setEditGuardianName(e.target.value)}
                required
              />
            </FormField>

            <FormField label="Primary Contact Mobile Telephone" required hint="Sensitive contact field">
              <Input
                type="tel"
                value={editMobile}
                onChange={(e) => setEditMobile(e.target.value)}
                required
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
    </div>
  );
};
