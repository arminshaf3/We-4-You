import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '../../components/admin/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { FormField, Input, Select, Textarea } from '../../components/common/FormField';
import { useApp } from '../../context/AppContext';
import {
  AlertTriangle,
  PhoneCall,
  ShieldCheck,
  User,
  MapPin,
  Clock,
  CheckCircle2,
  ArrowLeft,
  Plus,
  Radio,
} from 'lucide-react';

export const IncidentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { incidents, bands, childrenRecords, addContactAttempt, resolveIncident } = useApp();

  const incident = incidents.find((i) => i.id === id || i.incidentRef === id);

  // Match private internal record strictly inside the admin demo
  const matchedBand = bands.find((b) => b.referenceCode.toUpperCase() === incident?.bandReference.toUpperCase());
  const matchedChild = matchedBand?.childId
    ? childrenRecords.find((c) => c.id === matchedBand.childId)
    : undefined;

  // Modal: Record Contact Attempt
  const [isAttemptModalOpen, setIsAttemptModalOpen] = useState(false);
  const [attemptMethod, setAttemptMethod] = useState<'phone_call' | 'sms' | 'office_followup'>('phone_call');
  const [contactTarget, setContactTarget] = useState('Primary Guardian');
  const [outcome, setOutcome] = useState('Connected and spoken with guardian');
  const [attemptNotes, setAttemptNotes] = useState('');

  // Modal: Resolve Incident
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [outcomeSummary, setOutcomeSummary] = useState('');

  if (!incident) {
    return (
      <div>
        <PageHeader title="Incident Not Found" />
        <p className="text-content-muted">Assistance incident record could not be found.</p>
      </div>
    );
  }

  const handleSaveAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!outcome.trim()) return;

    addContactAttempt(incident.id, {
      method: attemptMethod,
      contactTarget,
      outcome: outcome.trim(),
      notes: attemptNotes.trim(),
    });

    setIsAttemptModalOpen(false);
    setAttemptNotes('');
  };

  const handleConfirmResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!outcomeSummary.trim()) return;

    resolveIncident(incident.id, outcomeSummary.trim());
    setIsResolveModalOpen(false);
  };

  return (
    <div>
      <PageHeader
        title={`Incident ${incident.incidentRef}`}
        breadcrumbs={[
          { label: 'Incidents', to: '/admin/incidents' },
          { label: incident.incidentRef },
        ]}
        actions={
          <div className="flex items-center gap-2">
            {incident.status !== 'resolved' && (
              <>
                <Button
                  onClick={() => {
                    setContactTarget(
                      matchedChild
                        ? `Primary Guardian (${matchedChild.primaryGuardian.fullName})`
                        : 'Registered Guardian'
                    );
                    setIsAttemptModalOpen(true);
                  }}
                  variant="outline"
                  size="sm"
                  leftIcon={<PhoneCall className="w-3.5 h-3.5 text-[#088F5B]" />}
                >
                  Record Contact Attempt
                </Button>
                <Button
                  onClick={() => setIsResolveModalOpen(true)}
                  variant="primary"
                  size="sm"
                  leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-mint" />}
                >
                  Record Confirmed Outcome
                </Button>
              </>
            )}
            <Button to="/admin/incidents" variant="outline" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              List
            </Button>
          </div>
        }
      />

      {/* Incident Status Strip */}
      <div className="p-4 rounded-brand bg-white border border-border-subtle shadow-subtle mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-content-muted">Report Status:</span>
            <StatusBadge status={incident.status} />
          </div>
          <span className="text-xs font-mono font-bold bg-mint-pale text-navy px-2 py-0.5 rounded border border-emerald-300">
            Band: {incident.bandReference}
          </span>
          <span className="text-xs text-content-muted">
            Report Type: {incident.reportType === 'child_found' ? 'Child with Finder' : 'Band Found Alone'}
          </span>
        </div>
        <div className="text-xs text-content-muted">
          Logged: {incident.createdAt} by {incident.assignedStaff}
        </div>
      </div>

      {/* If Resolved, show outcome banner */}
      {incident.status === 'resolved' && (
        <div className="p-5 bg-mint-pale rounded-brand border border-emerald-300 text-xs text-mint-darker mb-6 space-y-1">
          <div className="flex items-center gap-2 font-bold text-sm text-navy">
            <CheckCircle2 className="w-4 h-4 text-[#088F5B]" />
            <span>Confirmed Resolution &bull; Closed at {incident.resolvedAt}</span>
          </div>
          <p className="text-content-body text-xs font-medium">
            {incident.outcomeSummary}
          </p>
        </div>
      )}

      {/* Two Column: Incident Data vs Matched Private Child & Guardian Record */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (7 cols): Caller Info & Contact Attempt Logs */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Caller Details Card */}
          <div className="bg-white p-6 rounded-brand border border-border-subtle shadow-subtle space-y-3 text-xs">
            <h3 className="text-base font-heading font-bold text-navy pb-2 border-b border-border-subtle flex items-center gap-2">
              <MapPin className="w-4 h-4 text-navy" />
              <span>Caller Intake &amp; Voluntary Location</span>
            </h3>
            <p><strong>Caller Name / Title:</strong> {incident.callerName || 'Anonymous'}</p>
            <p><strong>Caller Telephone:</strong> <span className="font-mono">{incident.callerContact || 'Not recorded'}</span></p>
            <p><strong>Location Reported:</strong> {incident.voluntaryLocation || 'Location was not specified'}</p>
            <div className="pt-2 border-t border-border-subtle">
              <span className="text-content-muted block mb-1">Staff Intake Notes:</span>
              <p className="p-3 bg-neutral-soft rounded border text-content-body leading-relaxed">
                {incident.notes}
              </p>
            </div>
          </div>

          {/* Contact Attempts Audit History */}
          <div className="bg-white p-6 rounded-brand border border-border-subtle shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
              <h3 className="text-base font-heading font-bold text-navy flex items-center gap-2">
                <Clock className="w-4 h-4 text-navy" />
                <span>Recorded Contact Attempts ({incident.attempts.length})</span>
              </h3>
              {incident.status !== 'resolved' && (
                <button
                  onClick={() => setIsAttemptModalOpen(true)}
                  className="text-xs font-semibold text-navy hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Attempt</span>
                </button>
              )}
            </div>

            {incident.attempts.length > 0 ? (
              <div className="space-y-3">
                {incident.attempts.map((att) => (
                  <div key={att.id} className="p-4 rounded-brand bg-neutral-soft border border-border-subtle text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-navy">
                        {att.method === 'phone_call' ? 'Telephone Call' : 'SMS / Office Relay'} &rarr; {att.contactTarget}
                      </span>
                      <span className="text-[11px] text-content-muted">{att.timestamp}</span>
                    </div>
                    <p className="text-content-body">
                      <strong>Result:</strong> {att.outcome}
                    </p>
                    {att.notes && (
                      <p className="text-[11px] text-slate-600 bg-white p-2 rounded border">
                        {att.notes}
                      </p>
                    )}
                    <span className="text-[10px] text-content-muted block">Logged by: {att.staffName}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-content-muted italic">No contact attempts recorded yet. Click above to log telephone calls.</p>
            )}
          </div>

        </div>

        {/* Right Column (5 cols): Matched Private Guardian File (Admin only) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white p-6 rounded-brand border border-border-subtle shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
              <h3 className="text-base font-heading font-bold text-navy flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#088F5B]" />
                <span>Matched Private Family Record</span>
              </h3>
              <span className="text-[10px] uppercase font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                Admin Confidential
              </span>
            </div>

            {matchedChild ? (
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-content-muted block">Child Full Name:</span>
                  <span className="text-base font-bold text-navy block">{matchedChild.name}</span>
                  <span className="text-content-muted">Age Range: {matchedChild.ageRange}</span>
                </div>

                {/* Priority 1 Contact Box */}
                <div className="p-3.5 bg-mint-pale/60 rounded-brand border border-emerald-300/60 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-mint-darker block">
                    Priority 1 — Primary Guardian
                  </span>
                  <span className="font-heading font-bold text-navy block text-sm">
                    {matchedChild.primaryGuardian.fullName} ({matchedChild.primaryGuardian.relationship})
                  </span>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-mono font-bold text-navy text-sm">
                      {matchedChild.primaryGuardian.mobile}
                    </span>
                    <a
                      href={`tel:${matchedChild.primaryGuardian.mobile.replace(/[^0-9+]/g, '')}`}
                      className="px-2 py-1 bg-navy text-mint text-xs font-semibold rounded hover:bg-navy-light transition-colors"
                    >
                      Call Phone
                    </a>
                  </div>
                </div>

                {/* Secondary Backup Contacts */}
                {matchedChild.secondaryGuardians.map((sec, idx) => (
                  <div key={idx} className="p-3 bg-neutral-soft rounded-brand border border-border-subtle space-y-1">
                    <span className="text-[10px] font-semibold text-content-muted block">
                      Priority {idx + 2} — Emergency Backup
                    </span>
                    <span className="font-bold text-navy block">{sec.fullName} ({sec.relationship})</span>
                    <div className="flex items-center justify-between pt-0.5">
                      <span className="font-mono text-navy">{sec.telephone}</span>
                      <a
                        href={`tel:${sec.telephone.replace(/[^0-9+]/g, '')}`}
                        className="text-xs font-semibold text-navy underline hover:text-navy-light"
                      >
                        Call
                      </a>
                    </div>
                  </div>
                ))}

                <Link
                  to={`/admin/children/${matchedChild.id}`}
                  className="text-xs font-semibold text-navy hover:underline block pt-2 text-center"
                >
                  View Complete Child Registry File →
                </Link>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 rounded-brand border border-amber-200 text-xs text-amber-900">
                No active registered child matched this band code ({incident.bandReference}). The band may be unregistered or retired.
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-50 rounded-brand border border-slate-200 text-xs text-content-muted leading-relaxed">
            <strong>Staff Protocol:</strong> Telephone attempts do not automatically resolve the report. An incident must remain open until explicit confirmation is obtained that the child is safely reunited.
          </div>

        </div>

      </div>

      {/* Modal: Record Contact Attempt */}
      <Modal
        isOpen={isAttemptModalOpen}
        onClose={() => setIsAttemptModalOpen(false)}
        title="Record Contact Attempt"
        description="Log an official telephone call or relay attempt to the guardian."
      >
        <form onSubmit={handleSaveAttempt} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Contact Method" required>
              <Select
                value={attemptMethod}
                onChange={(e) => setAttemptMethod(e.target.value as any)}
              >
                <option value="phone_call">Telephone Call</option>
                <option value="sms">SMS Notification</option>
                <option value="office_followup">Office Follow-up Call</option>
              </Select>
            </FormField>

            <FormField label="Contact Person / Target" required>
              <Input
                value={contactTarget}
                onChange={(e) => setContactTarget(e.target.value)}
                required
              />
            </FormField>
          </div>

          <FormField label="Call / Message Outcome" required>
            <Select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
            >
              <option value="Connected and spoken with guardian">Connected and spoken with guardian</option>
              <option value="Phone rang, went to voicemail">Phone rang, went to voicemail</option>
              <option value="Line busy or unavailable">Line busy or unavailable</option>
              <option value="SMS relay delivered">SMS relay delivered</option>
            </Select>
          </FormField>

          <FormField label="Detailed Staff Notes">
            <Textarea
              rows={3}
              value={attemptNotes}
              onChange={(e) => setAttemptNotes(e.target.value)}
              placeholder="e.g. Guardian confirmed they are en route to the park info booth..."
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => setIsAttemptModalOpen(false)} variant="outline" size="md">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md">
              Log Attempt
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Record Confirmed Resolution */}
      <Modal
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        title="Record Confirmed Outcome"
        description="Explicitly record confirmed child reconnection to resolve this incident."
      >
        <form onSubmit={handleConfirmResolve} className="space-y-4">
          <FormField label="Resolution Outcome Summary" required>
            <Textarea
              rows={4}
              value={outcomeSummary}
              onChange={(e) => setOutcomeSummary(e.target.value)}
              placeholder="e.g. Confirmed with Officer Ramos and mother Elena Vance: Child safely reunited at park pavilion at 10:45 AM."
              required
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => setIsResolveModalOpen(false)} variant="outline" size="md">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md">
              Confirm Resolution &amp; Close Incident
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
