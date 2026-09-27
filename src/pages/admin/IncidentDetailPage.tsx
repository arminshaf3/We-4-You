import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '../../components/admin/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { FormField, Input, Select, Textarea } from '../../components/common/FormField';
import { useApp } from '../../context/AppContext';
import { IncidentStatus } from '../../types';
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
  FileText,
  Phone,
  MessageSquare,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const IncidentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { incidents, bands, childrenRecords, addContactAttempt, updateIncidentStatus } = useApp();

  const incident = incidents.find((i) => i.id === id || i.incidentRef === id);

  // Match private internal record strictly inside the admin demo
  const matchedBand = bands.find((b) => b.referenceCode.toUpperCase() === incident?.bandReference.toUpperCase());
  const matchedChild = matchedBand?.childId
    ? childrenRecords.find((c) => c.id === matchedBand.childId)
    : undefined;

  // Modal: Record Contact Attempt
  const [isAttemptModalOpen, setIsAttemptModalOpen] = useState(false);
  const [attemptMethod, setAttemptMethod] = useState<'phone_call' | 'sms' | 'office_followup'>('phone_call');
  const [contactTarget, setContactTarget] = useState('Primary Contact');
  const [outcome, setOutcome] = useState('Connected and spoken with contact');
  const [attemptNotes, setAttemptNotes] = useState('');

  // Modal: Resolve / Update Status
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolutionStatus, setResolutionStatus] = useState<IncidentStatus>('reunited');
  const [outcomeSummary, setOutcomeSummary] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  if (!incident) {
    return (
      <div>
        <PageHeader title="Incident Not Found" />
        <div className="bg-white p-8 rounded-brand border border-border-subtle text-center space-y-4">
          <p className="text-content-muted">The requested safety assistance record does not exist.</p>
          <Button to="/admin/incidents" variant="outline" size="md">
            Back to Incident Queue
          </Button>
        </div>
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

    updateIncidentStatus(incident.id, resolutionStatus, outcomeSummary.trim(), additionalNotes.trim());
    setIsResolveModalOpen(false);
  };

  const handleQuickStatusChange = (newStatus: IncidentStatus) => {
    updateIncidentStatus(incident.id, newStatus);
  };

  const isClosed = incident.status === 'resolved' || incident.status === 'reunited' || incident.status === 'false_alarm';

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
            {!isClosed && (
              <>
                <Button
                  onClick={() => {
                    setContactTarget(
                      matchedChild
                        ? `Primary Contact (${matchedChild.primaryGuardian.fullName})`
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
                  onClick={() => {
                    setResolutionStatus('reunited');
                    setIsResolveModalOpen(true);
                  }}
                  variant="primary"
                  size="sm"
                  leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-mint" />}
                >
                  Record Resolution
                </Button>
              </>
            )}
            <Button to="/admin/incidents" variant="outline" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Queue
            </Button>
          </div>
        }
      />

      {/* Incident Status Strip */}
      <div className="p-4 sm:p-5 rounded-brand bg-white border border-border-subtle shadow-subtle mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs text-content-muted">Current Status:</span>
            <StatusBadge status={incident.status} />
          </div>
          <span className="text-xs font-mono font-bold bg-mint-pale text-navy px-2.5 py-1 rounded border border-emerald-300">
            Band: {incident.bandReference}
          </span>
          <span className="text-xs text-content-muted">
            Type: {incident.reportType === 'band_found_alone' ? 'Band Found Alone' : 'Wearer with Finder'}
          </span>
          <span className="text-xs text-content-muted">
            Logged: {incident.createdAt}
          </span>
        </div>

        {/* Quick Lifecycle Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {incident.status === 'open' && (
            <button
              onClick={() => handleQuickStatusChange('contacting_guardian')}
              className="text-xs px-2.5 py-1 rounded bg-orange-50 text-orange-900 border border-orange-200 font-semibold hover:bg-orange-100 transition-all"
            >
              Mark Contacting Guardian
            </button>
          )}
          {incident.status === 'contacting_guardian' && (
            <button
              onClick={() => handleQuickStatusChange('awaiting_confirmation')}
              className="text-xs px-2.5 py-1 rounded bg-amber-50 text-amber-900 border border-amber-200 font-semibold hover:bg-amber-100 transition-all"
            >
              Mark Awaiting Pickup Confirmation
            </button>
          )}
        </div>
      </div>

      {/* If Closed/Resolved, show outcome banner */}
      {isClosed && (
        <div className="p-5 bg-mint-pale rounded-brand border border-emerald-300 text-xs text-mint-darker mb-6 space-y-1.5 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm text-navy">
              <CheckCircle2 className="w-5 h-5 text-[#088F5B]" />
              <span>Confirmed Resolution &bull; Status: {incident.status.replace('_', ' ').toUpperCase()}</span>
            </div>
            {incident.resolvedAt && (
              <span className="text-xs text-content-muted">Resolved at: {incident.resolvedAt}</span>
            )}
          </div>
          <p className="text-content-body text-xs font-medium leading-relaxed">
            {incident.outcomeSummary || 'The incident was concluded successfully and the individual is safe.'}
          </p>
        </div>
      )}

      {/* Two Column: Incident Data vs Matched Private Wearer & Contact Record */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (7 cols): Caller Info & Contact Attempt Logs */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Caller Details Card */}
          <div className="bg-white p-6 rounded-brand border border-border-subtle shadow-subtle space-y-4 text-xs">
            <h3 className="text-base font-heading font-bold text-navy pb-3 border-b border-border-subtle flex items-center gap-2">
              <MapPin className="w-4 h-4 text-navy" />
              <span>Finder Intake &amp; Voluntary Location</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-content-muted block mb-0.5">Finder / Reporter Name:</span>
                <span className="font-semibold text-navy text-sm">{incident.callerName || 'Anonymous Caller'}</span>
              </div>
              <div>
                <span className="text-content-muted block mb-0.5">Finder Telephone Contact:</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-navy text-sm">{incident.callerContact || 'Not recorded'}</span>
                  {incident.callerContact && (
                    <a
                      href={`tel:${incident.callerContact.replace(/[^0-9+]/g, '')}`}
                      className="px-2 py-0.5 bg-navy text-white text-[11px] font-semibold rounded hover:bg-navy-light"
                    >
                      Call
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div>
              <span className="text-content-muted block mb-0.5">Location Reported by Finder:</span>
              <span className="font-medium text-navy block p-2 bg-neutral-soft rounded border">
                {incident.voluntaryLocation || 'Location was not specified'}
              </span>
            </div>

            <div className="pt-2 border-t border-border-subtle">
              <span className="text-content-muted block mb-1">Coordinator Intake Notes:</span>
              <p className="p-3 bg-neutral-soft rounded border text-content-body leading-relaxed whitespace-pre-line">
                {incident.notes}
              </p>
            </div>
          </div>

          {/* Contact Attempts Audit History */}
          <div className="bg-white p-6 rounded-brand border border-border-subtle shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h3 className="text-base font-heading font-bold text-navy flex items-center gap-2">
                <Clock className="w-4 h-4 text-navy" />
                <span>Guardian Contact Attempt History ({incident.attempts.length})</span>
              </h3>
              {!isClosed && (
                <button
                  onClick={() => setIsAttemptModalOpen(true)}
                  className="text-xs font-semibold text-navy hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log New Attempt</span>
                </button>
              )}
            </div>

            {incident.attempts.length > 0 ? (
              <div className="space-y-3">
                {incident.attempts.map((att) => (
                  <div key={att.id} className="p-4 rounded-brand bg-neutral-soft border border-border-subtle text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-navy flex items-center gap-1.5">
                        {att.method === 'phone_call' ? (
                          <Phone className="w-3.5 h-3.5 text-[#088F5B]" />
                        ) : (
                          <MessageSquare className="w-3.5 h-3.5 text-navy" />
                        )}
                        <span>{att.method === 'phone_call' ? 'Telephone Call' : 'SMS Notification'} &rarr; {att.contactTarget}</span>
                      </span>
                      <span className="text-[11px] text-content-muted font-mono">{att.timestamp}</span>
                    </div>
                    <p className="text-content-body">
                      <strong>Result:</strong> <span className="text-navy font-medium">{att.outcome}</span>
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
              <p className="text-xs text-content-muted italic py-2">
                No contact attempts logged yet. Click "Record Contact Attempt" to log telephone calls or messages.
              </p>
            )}
          </div>

        </div>

        {/* Right Column (5 cols): Matched Private Wearer & Contact Record */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white p-6 rounded-brand border border-border-subtle shadow-subtle space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h3 className="text-base font-heading font-bold text-navy flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#088F5B]" />
                <span>Authorized Guardian Contacts</span>
              </h3>
              <span className="text-[10px] uppercase font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                Confidential
              </span>
            </div>

            {matchedChild ? (
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-content-muted block mb-0.5">Wearer Full Name:</span>
                  <span className="text-base font-bold text-navy block">{matchedChild.name}</span>
                  <span className="text-content-muted">Category / Age Group: {matchedChild.ageRange}</span>
                </div>

                {/* Priority 1 Contact Box */}
                <div className="p-4 bg-mint-pale/60 rounded-brand border border-emerald-300/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-mint-darker">
                      Priority 1 &bull; Primary Guardian
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
                      Verified
                    </span>
                  </div>
                  <span className="font-heading font-bold text-navy block text-sm">
                    {matchedChild.primaryGuardian.fullName} ({matchedChild.primaryGuardian.relationship})
                  </span>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-mono font-bold text-navy text-sm">
                      {matchedChild.primaryGuardian.mobile}
                    </span>
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${matchedChild.primaryGuardian.mobile.replace(/[^0-9+]/g, '')}`}
                        className="px-2.5 py-1 bg-navy text-white text-xs font-semibold rounded hover:bg-navy-light transition-colors inline-flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3 text-mint" />
                        <span>Call</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Secondary Backup Contacts */}
                {matchedChild.secondaryGuardians.length > 0 ? (
                  matchedChild.secondaryGuardians.map((sec, idx) => (
                    <div key={idx} className="p-3.5 bg-neutral-soft rounded-brand border border-border-subtle space-y-1.5">
                      <span className="text-[10px] font-semibold text-content-muted block">
                        Priority {idx + 2} &bull; Emergency Backup Contact
                      </span>
                      <span className="font-bold text-navy block">{sec.fullName} ({sec.relationship})</span>
                      <div className="flex items-center justify-between pt-0.5">
                        <span className="font-mono text-navy font-semibold">{sec.telephone}</span>
                        <a
                          href={`tel:${sec.telephone.replace(/[^0-9+]/g, '')}`}
                          className="px-2 py-0.5 bg-white border border-border-subtle text-navy text-xs font-semibold rounded hover:bg-slate-50 transition-colors"
                        >
                          Call
                        </a>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-content-muted italic">No secondary contact recorded in registry.</p>
                )}

                <Link
                  to={`/admin/children/${matchedChild.id}`}
                  className="text-xs font-semibold text-navy hover:underline block pt-2 text-center"
                >
                  View Complete Wearer Registry File →
                </Link>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 rounded-brand border border-amber-200 text-xs text-amber-900 space-y-2">
                <p>No active registered wearer matched this band code (<strong>{incident.bandReference}</strong>).</p>
                <p className="text-[11px] text-amber-800">The band may belong to an unassigned inventory batch or a retired profile.</p>
              </div>
            )}
          </div>

          <div className="p-4 bg-slate-50 rounded-brand border border-slate-200 text-xs text-content-muted leading-relaxed space-y-2">
            <strong className="text-navy block">Strict Support Coordinator Protocol:</strong>
            <p>
              Telephone contact attempts do not automatically resolve the emergency. An incident must remain open until explicit confirmation is obtained that the individual is safely in the care of authorized guardians or emergency personnel.
            </p>
          </div>

        </div>

      </div>

      {/* Modal: Record Contact Attempt */}
      <Modal
        isOpen={isAttemptModalOpen}
        onClose={() => setIsAttemptModalOpen(false)}
        title="Record Guardian Contact Attempt"
        description="Log an official telephone call or notification attempt to the registered emergency contact."
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
              <option value="Connected and spoken with guardian - En route to location">Connected and spoken with guardian - En route to location</option>
              <option value="Connected and spoken with guardian - Acknowledged">Connected and spoken with guardian - Acknowledged</option>
              <option value="Phone rang, went to voicemail - Left urgent message">Phone rang, went to voicemail - Left urgent message</option>
              <option value="Line busy or temporarily unavailable - Retrying shortly">Line busy or temporarily unavailable - Retrying shortly</option>
              <option value="SMS relay notification delivered">SMS relay notification delivered</option>
              <option value="Called secondary emergency contact">Called secondary emergency contact</option>
            </Select>
          </FormField>

          <FormField label="Detailed Coordinator Notes">
            <Textarea
              rows={3}
              value={attemptNotes}
              onChange={(e) => setAttemptNotes(e.target.value)}
              placeholder="e.g. Guardian confirmed they are 10 minutes away from the Information Desk..."
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
        title="Record Confirmed Outcome & Close Incident"
        description="Explicitly record confirmed individual reconnection and final resolution notes."
      >
        <form onSubmit={handleConfirmResolve} className="space-y-4">
          <FormField label="Resolution Status" required>
            <Select
              value={resolutionStatus}
              onChange={(e) => setResolutionStatus(e.target.value as IncidentStatus)}
            >
              <option value="reunited">Reunited Safely with Guardian (Confirmed)</option>
              <option value="resolved">Resolved (General Resolution)</option>
              <option value="false_alarm">False Alarm / Band Found Alone &amp; Secured</option>
            </Select>
          </FormField>

          <FormField label="Outcome Summary" required>
            <Textarea
              rows={3}
              value={outcomeSummary}
              onChange={(e) => setOutcomeSummary(e.target.value)}
              placeholder="e.g. Confirmed with finder and primary guardian (Elena Vance): Child safely reconnected at central mall entrance at 11:30 AM."
              required
            />
          </FormField>

          <FormField label="Additional Case Notes (Optional)">
            <Textarea
              rows={2}
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Any relevant follow-up or debrief notes..."
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
