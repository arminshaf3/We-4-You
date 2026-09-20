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
      {reg.statusReason && (
        <div className="p-4 bg-amber-50 rounded-brand border border-amber-200 text-xs text-amber-900 mb-6 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Status Note:</span>
            <span>{reg.statusReason}</span>
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
                <span>Wearer &amp; Band Details</span>
              </div>
              <span className="text-xs text-content-muted">Sample Record</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-content-muted block mb-0.5">Wearer's Name</span>
                <span className="text-base font-bold text-navy">{reg.child.name}</span>
                <span className="text-content-muted block mt-0.5">Category / Age Group: {reg.child.ageRange || 'Not provided'}</span>
              </div>

              <div>
                <span className="text-content-muted block mb-0.5">Printed Band Reference</span>
                <span className="text-base font-mono font-bold text-navy bg-mint-pale px-2.5 py-1 rounded border border-emerald-300 inline-block">
                  {reg.bandCode}
                </span>
              </div>
            </div>

            {reg.child.photoUrl && (
              <div className="pt-2">
                <span className="text-xs text-content-muted block mb-1.5">Submitted Photo (Demo Preview)</span>
                <img src={reg.child.photoUrl} alt="Submitted wearer preview" className="w-24 h-24 rounded-brand object-cover border" />
              </div>
            )}
          </div>

          {/* Contact Person Card */}
          <div className="bg-white p-6 rounded-brand border border-border-subtle shadow-subtle space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-border-subtle text-navy font-heading font-bold text-base">
              <ShieldCheck className="w-5 h-5 text-navy" />
              <span>Registered Contact Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-content-muted block mb-0.5">Primary Contact</span>
                <span className="text-sm font-semibold text-navy block">
                  {reg.guardian.fullName} ({reg.guardian.relationship})
                </span>
                <span className="font-mono text-navy font-medium block mt-1">
                  {reg.guardian.mobile}
                </span>
                {reg.guardian.email && (
                  <span className="text-content-muted block">{reg.guardian.email}</span>
                )}
                <span className="text-content-muted block mt-1">
                  Language: {reg.guardian.preferredLanguage}
                </span>
              </div>

              <div>
                <span className="text-content-muted block mb-0.5">Secondary Emergency Contact</span>
                {reg.guardian.emergencyContact ? (
                  <div>
                    <span className="text-sm font-semibold text-navy block">
                      {reg.guardian.emergencyContact.fullName} ({reg.guardian.emergencyContact.relationship})
                    </span>
                    <span className="font-mono text-navy font-medium block mt-1">
                      {reg.guardian.emergencyContact.telephone}
                    </span>
                  </div>
                ) : (
                  <span className="text-content-muted italic">No secondary contact provided</span>
                )}
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
