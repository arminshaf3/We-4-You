import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PageHeader } from '../../components/admin/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { FormField, Input, Textarea } from '../../components/common/FormField';
import { useApp } from '../../context/AppContext';
import {
  User,
  ShieldCheck,
  Phone,
  Store,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle,
  History,
  FileCheck,
  ArrowLeft,
  Calendar,
} from 'lucide-react';

export const RegistrationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { registrations, vendors, plans, updateRegistrationStatus, verifyPayment, payments } = useApp();

  const reg = registrations.find((r) => r.id === id || r.referenceNumber === id);
  const vendor = vendors.find((v) => v.id === reg?.vendorId);
  const plan = plans.find((p) => p.id === reg?.planId);
  const linkedPayment = payments.find((p) => p.registrationId === reg?.referenceNumber || p.registrationId === reg?.id);

  // Modal states for action triggers
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [updateReason, setUpdateReason] = useState('');
  const [rejectReason, setRejectReason] = useState('');

  if (!reg) {
    return (
      <div>
        <PageHeader title="Registration Not Found" />
        <div className="bg-white p-8 rounded-brand border border-border-subtle text-center space-y-4">
          <p className="text-content-muted">The requested registration record does not exist.</p>
          <Button to="/admin/registrations" variant="outline" size="md">
            Back to Registrations
          </Button>
        </div>
      </div>
    );
  }

  const handleApprove = () => {
    updateRegistrationStatus(reg.id, 'approved');
  };

  const handleRequestUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateReason.trim()) return;
    updateRegistrationStatus(reg.id, 'update_requested', updateReason.trim());
    setIsUpdateModalOpen(false);
    setUpdateReason('');
  };

  const handleReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason.trim()) return;
    updateRegistrationStatus(reg.id, 'rejected', rejectReason.trim());
    setIsRejectModalOpen(false);
    setRejectReason('');
  };

  const handleVerifyLinkedPayment = () => {
    if (linkedPayment) {
      verifyPayment(linkedPayment.id);
    }
  };

  return (
    <div>
      <PageHeader
        title={`Registration ${reg.referenceNumber}`}
        breadcrumbs={[
          { label: 'Registrations', to: '/admin/registrations' },
          { label: reg.referenceNumber },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button to="/admin/registrations" variant="outline" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Queue
            </Button>
          </div>
        }
      />

      {/* Main Review Status Strip */}
      <div className="p-4 sm:p-5 rounded-brand bg-white border border-border-subtle shadow-subtle mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-content-muted">Review Status:</span>
            <StatusBadge status={reg.status} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-content-muted">Payment Requirement:</span>
            <StatusBadge status={reg.paymentStatus} />
          </div>
          <span className="text-xs text-content-muted">
            Submitted: {reg.submissionDate}
          </span>
        </div>

        {/* Action Buttons for Review Decision */}
        {reg.status !== 'approved' && reg.status !== 'rejected' && (
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              onClick={() => setIsUpdateModalOpen(true)}
              variant="outline"
              size="sm"
              leftIcon={<AlertCircle className="w-3.5 h-3.5 text-amber-600" />}
            >
              Request Update
            </Button>
            <Button
              onClick={() => setIsRejectModalOpen(true)}
              variant="danger"
              size="sm"
              leftIcon={<XCircle className="w-3.5 h-3.5" />}
            >
              Reject
            </Button>
            <Button
              onClick={handleApprove}
              variant="primary"
              size="sm"
              leftIcon={<CheckCircle className="w-3.5 h-3.5 text-mint" />}
            >
              Approve Registration
            </Button>
          </div>
        )}
      </div>

      {/* Rejection / Update Reason Notice if present */}
      {reg.statusReason && reg.status !== 'approved' && (
        <div className="p-4 bg-amber-50 rounded-brand border border-amber-200 text-xs text-amber-900 mb-6 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Status Note:</span>
            <span>{reg.statusReason}</span>
          </div>
        </div>
      )}

      {/* Approved Banner */}
      {reg.status === 'approved' && (
        <div className="p-4 bg-emerald-50 rounded-brand border border-emerald-200 text-xs text-emerald-900 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <span className="font-bold text-sm text-emerald-950 block">Registration Approved &amp; Wearer Activated</span>
              <span className="text-emerald-800">
                Band <strong>{reg.bandCode}</strong> is now assigned to wearer <strong>{reg.child.name}</strong> with active 24/7 emergency protection.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button to="/admin/registrations" variant="outline" size="sm">
              Back to Queue
            </Button>
            <Button to="/admin/children" variant="primary" size="sm">
              View Wearer Directory
            </Button>
          </div>
        </div>
      )}

      {/* Two Columns: Details vs Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (8 cols): Fictional Data Panels */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Wearer & Band Card */}
          <div className="bg-white p-6 rounded-brand border border-border-subtle shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div className="flex items-center gap-2 text-navy font-heading font-bold text-base">
                <User className="w-5 h-5 text-navy" />
                <span>Wearer Profile &amp; Band Details</span>
              </div>
              <span className="text-xs text-content-muted">Reference: {reg.referenceNumber}</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-5 items-start">
              {/* Photo */}
              {reg.child.photoUrl ? (
                <div className="w-24 h-24 rounded-brand-lg overflow-hidden border-2 border-emerald-500/30 flex-shrink-0 shadow-sm bg-slate-100">
                  <img src={reg.child.photoUrl} alt="Wearer photo" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-brand-lg border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 bg-slate-50 flex-shrink-0">
                  <User className="w-8 h-8 text-slate-300 mb-1" />
                  <span className="text-[10px]">No Photo</span>
                </div>
              )}

              {/* Core Wearer Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs flex-1">
                <div>
                  <span className="text-content-muted block mb-0.5">Wearer's Full Name</span>
                  <span className="text-base font-bold text-navy block">{reg.child.name}</span>
                  <span className="text-content-muted text-[11px] block mt-0.5">
                    Category: <strong className="text-slate-700">{reg.child.ageRange || 'Not specified'}</strong>
                  </span>
                </div>

                <div>
                  <span className="text-content-muted block mb-0.5">Date of Birth &amp; Calculated Age</span>
                  {reg.child.birthDate ? (
                    <div>
                      <span className="text-sm font-semibold text-navy block">{reg.child.birthDate}</span>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-300">
                        {reg.child.calculatedAge || 'Age computed'}
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">Not recorded</span>
                  )}
                </div>

                <div>
                  <span className="text-content-muted block mb-0.5">Printed Band Reference</span>
                  <span className="text-sm font-mono font-bold text-navy bg-mint-pale px-2.5 py-1 rounded border border-emerald-300 inline-block">
                    {reg.bandCode}
                  </span>
                </div>

                {/* Additional Demographics */}
                <div>
                  <span className="text-content-muted block mb-0.5">Blood Group</span>
                  {reg.child.bloodGroup && reg.child.bloodGroup !== 'Unknown' ? (
                    <span className="inline-block px-2.5 py-0.5 rounded bg-rose-50 text-rose-700 font-bold border border-rose-200">
                      {reg.child.bloodGroup}
                    </span>
                  ) : (
                    <span className="text-content-muted">Unknown / Unspecified</span>
                  )}
                </div>

                <div>
                  <span className="text-content-muted block mb-0.5">Gender</span>
                  <span className="font-semibold text-slate-800">{reg.child.gender || 'Not specified'}</span>
                </div>

                <div>
                  <span className="text-content-muted block mb-0.5">Wearer National / Student ID</span>
                  <span className="font-mono text-slate-800">{reg.child.nationalId || 'None provided'}</span>
                </div>
              </div>
            </div>

            {/* Medical / Allergy Notes if present */}
            {reg.child.medicalNotes && (
              <div className="p-3.5 bg-amber-50/80 rounded-brand border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-900 block mb-0.5">Important Medical &amp; Emergency Notes:</span>
                  <p className="text-amber-900 leading-relaxed">{reg.child.medicalNotes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Contact Person Card */}
          <div className="bg-white p-6 rounded-brand border border-border-subtle shadow-subtle space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border-subtle text-navy font-heading font-bold text-base">
              <ShieldCheck className="w-5 h-5 text-navy" />
              <span>Registered Guardian &amp; Emergency Contact</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2">
                <div>
                  <span className="text-content-muted block mb-0.5">Primary Contact / Guardian</span>
                  <span className="text-sm font-semibold text-navy block">
                    {reg.guardian.fullName} ({reg.guardian.relationship})
                  </span>
                </div>

                <div>
                  <span className="text-content-muted block mb-0.5">Primary Mobile Phone</span>
                  <span className="font-mono text-sm font-bold text-[#088F5B] block">
                    {reg.guardian.mobile}
                  </span>
                </div>

                {reg.guardian.secondaryPhone && (
                  <div>
                    <span className="text-content-muted block mb-0.5">Alternative / Daytime Telephone</span>
                    <span className="font-mono font-medium text-slate-700 block">
                      {reg.guardian.secondaryPhone}
                    </span>
                  </div>
                )}

                {reg.guardian.email && (
                  <div>
                    <span className="text-content-muted block mb-0.5">Email Address</span>
                    <span className="text-slate-700 block">{reg.guardian.email}</span>
                  </div>
                )}

                <div>
                  <span className="text-content-muted block mb-0.5">Preferred Language</span>
                  <span className="text-slate-700 font-medium">{reg.guardian.preferredLanguage}</span>
                </div>
              </div>

              <div className="space-y-3">
                {reg.guardian.address && (
                  <div>
                    <span className="text-content-muted block mb-0.5">Residential / Postal Address</span>
                    <span className="text-slate-800 leading-relaxed block bg-neutral-soft p-2.5 rounded border border-border-subtle">
                      {reg.guardian.address}
                    </span>
                  </div>
                )}

                {reg.guardian.nationalId && (
                  <div>
                    <span className="text-content-muted block mb-0.5">Guardian National ID / Passport #</span>
                    <span className="font-mono text-slate-800 block bg-slate-50 px-2 py-1 rounded border inline-block">
                      {reg.guardian.nationalId}
                    </span>
                  </div>
                )}

                <div>
                  <span className="text-content-muted block mb-0.5">Secondary Emergency Backup Contact</span>
                  {reg.guardian.emergencyContact ? (
                    <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                      <span className="text-sm font-semibold text-navy block">
                        {reg.guardian.emergencyContact.fullName} ({reg.guardian.emergencyContact.relationship})
                      </span>
                      <span className="font-mono text-navy font-bold block mt-1">
                        {reg.guardian.emergencyContact.telephone}
                      </span>
                    </div>
                  ) : (
                    <span className="text-content-muted italic">No secondary contact provided</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Retail Attribution & Subscription Plan */}
          <div className="bg-white p-6 rounded-brand border border-border-subtle shadow-subtle space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border-subtle text-navy font-heading font-bold text-base">
              <Store className="w-5 h-5 text-navy" />
              <span>Attribution &amp; Subscription</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-content-muted block mb-0.5">Retail Partner Shop</span>
                <span className="text-sm font-semibold text-navy block">
                  {vendor ? `${vendor.shopName} (${vendor.branch})` : 'Direct We 4 You Purchase'}
                </span>
                {vendor && (
                  <span className="text-content-muted block mt-0.5">
                    Commission arrangement: {vendor.commissionRate}
                    {vendor.commissionType === 'percentage' ? '%' : ' USD (Fixed)'}
                  </span>
                )}
              </div>

              <div>
                <span className="text-content-muted block mb-0.5">Selected Subscription Plan</span>
                <span className="text-sm font-semibold text-navy block">
                  {plan?.name || reg.planId}
                </span>
                <span className="text-content-muted block">
                  Duration: {plan?.durationMonths || 12} months &bull; Price: {plan?.priceFormatted}
                </span>
              </div>
            </div>

            {/* Payment Status Box */}
            <div className="p-4 rounded-brand bg-neutral-soft border border-border-subtle space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5 text-xs">
                  <span className="font-semibold text-navy block">Subscription Payment Verification</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-content-muted">
                      Receipt: <strong className="font-mono">{linkedPayment?.receiptRef || reg.paymentRef || 'Pending receipt entry'}</strong>
                    </span>
                    <span className="text-content-muted">&bull;</span>
                    <StatusBadge status={reg.paymentStatus} size="sm" />
                  </div>
                </div>

                {reg.paymentStatus !== 'verified' && (
                  <Button onClick={handleVerifyLinkedPayment} variant="outline" size="sm">
                    Simulate Payment Verification
                  </Button>
                )}
              </div>

              {/* Card Payment Details Breakdown */}
              {linkedPayment?.method === 'card' || reg.cardDetails ? (
                <div className="pt-2 border-t border-border-subtle/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#088F5B]" />
                    <span className="font-semibold text-emerald-900">
                      Paid with {reg.cardDetails?.brand || linkedPayment?.cardDetails?.brand || 'Card'} ending in {reg.cardDetails?.last4 || linkedPayment?.cardDetails?.last4 || '4242'}
                    </span>
                  </div>
                  {(reg.cardDetails?.transactionId || linkedPayment?.transactionId) && (
                    <span className="font-mono text-[11px] text-content-muted">
                      TXN: {reg.cardDetails?.transactionId || linkedPayment?.transactionId}
                    </span>
                  )}
                </div>
              ) : (
                <div className="pt-1 text-[11px] text-content-muted">
                  Offline payment method: In-store voucher / Bank manual transfer.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column (4 cols): Audit Timeline */}
        <div className="lg:col-span-4 bg-white p-6 rounded-brand border border-border-subtle shadow-subtle space-y-4">
          <div className="flex items-center gap-2 text-navy font-heading font-bold text-base pb-3 border-b border-border-subtle">
            <History className="w-5 h-5 text-navy" />
            <span>Registration Timeline</span>
          </div>

          <div className="space-y-4">
            {reg.timeline.map((entry, idx) => (
              <div key={idx} className="relative pl-5 pb-3 border-l-2 border-slate-200 last:border-0 last:pb-0 text-xs">
                <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-navy" />
                <span className="text-[11px] text-content-muted block">{entry.timestamp}</span>
                <span className="font-semibold text-navy block mt-0.5">{entry.action}</span>
                <span className="text-content-muted block">By: {entry.actor}</span>
                {entry.notes && (
                  <p className="mt-1 text-slate-600 bg-neutral-soft p-2 rounded text-[11px] leading-snug">
                    {entry.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Modal: Request Update */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title="Request Information Update"
        description="Specify what information the primary contact must update or clarify."
      >
        <form onSubmit={handleRequestUpdate} className="space-y-4">
          <FormField label="Update Instructions" required>
            <Textarea
              rows={3}
              value={updateReason}
              onChange={(e) => setUpdateReason(e.target.value)}
              placeholder="e.g. Please clarify daytime phone digits..."
              required
            />
          </FormField>
          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => setIsUpdateModalOpen(false)} variant="outline" size="md">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md">
              Submit Update Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Reject Registration */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Registration"
        description="Record the reason for rejecting this registration submission."
      >
        <form onSubmit={handleReject} className="space-y-4">
          <FormField label="Rejection Reason" required>
            <Textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Incompatible band code or fraudulent attribution..."
              required
            />
          </FormField>
          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => setIsRejectModalOpen(false)} variant="outline" size="md">
              Cancel
            </Button>
            <Button type="submit" variant="danger" size="md">
              Confirm Rejection
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
