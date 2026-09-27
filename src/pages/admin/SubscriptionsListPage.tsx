import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/admin/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { FormField, Select, Textarea } from '../../components/common/FormField';
import { useApp } from '../../context/AppContext';
import { Subscription, SubscriptionStatus } from '../../types';
import { CreditCard, RefreshCw, Calendar, ArrowRight, Search, Bell, Mail, Phone, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';

export const SubscriptionsListPage: React.FC = () => {
  const { subscriptions, childrenRecords, plans, renewSubscription, sendRenewalReminder } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Renewal Modal
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [renewalMonths, setRenewalMonths] = useState(12);
  const [renewalMethod, setRenewalMethod] = useState<'card' | 'offline_voucher'>('card');

  // Reminder Modal
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [reminderSub, setReminderSub] = useState<Subscription | null>(null);
  const [reminderChannel, setReminderChannel] = useState<'email' | 'sms' | 'phone_call'>('email');
  const [reminderNotes, setReminderNotes] = useState('');
  const [isSendingReminder, setIsSendingReminder] = useState(false);

  const activeCount = useMemo(() => subscriptions.filter((s) => s.status === 'active').length, [subscriptions]);
  const expiringCount = useMemo(() => subscriptions.filter((s) => s.status === 'expiring_soon').length, [subscriptions]);
  const expiredCount = useMemo(() => subscriptions.filter((s) => s.status === 'expired').length, [subscriptions]);
  const pendingCount = useMemo(() => subscriptions.filter((s) => s.status === 'pending').length, [subscriptions]);
  const totalRenewals = useMemo(() => subscriptions.reduce((sum, s) => sum + (s.renewalCount || 0), 0), [subscriptions]);

  const filteredSubs = useMemo(() => {
    return subscriptions.filter((s) => {
      const child = childrenRecords.find((c) => c.id === s.childId);
      const matchesSearch =
        !searchTerm.trim() ||
        (child && child.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (child && child.currentBandCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
        s.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' ||
        s.status === statusFilter ||
        (statusFilter === 'EXPIRING' && (s.status === 'expiring_soon' || s.status === 'expired'));

      return matchesSearch && matchesStatus;
    });
  }, [subscriptions, childrenRecords, searchTerm, statusFilter]);

  const handleOpenRenew = (sub: Subscription) => {
    setSelectedSub(sub);
    setRenewalMonths(12);
    setRenewalMethod('card');
    setIsRenewModalOpen(true);
  };

  const handleOpenReminder = (sub: Subscription) => {
    setReminderSub(sub);
    setReminderChannel('email');
    setReminderNotes('');
    setIsReminderModalOpen(true);
  };

  const handleConfirmRenew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;
    renewSubscription(selectedSub.id, Number(renewalMonths), renewalMethod);
    setIsRenewModalOpen(false);
  };

  const handleConfirmReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderSub) return;
    setIsSendingReminder(true);
    try {
      await sendRenewalReminder(reminderSub.id, reminderChannel, reminderNotes);
      setIsReminderModalOpen(false);
    } finally {
      setIsSendingReminder(false);
    }
  };

  // Preview projected new expiry date
  const projectedExpiry = selectedSub ? (() => {
    const currentExpiry = new Date(selectedSub.expiryDate);
    const now = new Date();
    const base = currentExpiry > now ? new Date(currentExpiry) : new Date();
    base.setMonth(base.getMonth() + Number(renewalMonths));
    return base.toISOString().substring(0, 10);
  })() : '';

  const columns: Column<Subscription>[] = [
    {
      key: 'child',
      header: 'Covered Wearer',
      render: (sub) => {
        const child = childrenRecords.find((c) => c.id === sub.childId);
        return child ? (
          <div>
            <Link to={`/admin/children/${child.id}`} className="font-heading font-bold text-navy hover:underline text-sm block">
              {child.name}
            </Link>
            <span className="font-mono text-xs text-content-muted">Band: {child.currentBandCode}</span>
          </div>
        ) : (
          <span className="text-xs text-content-muted">Wearer {sub.childId}</span>
        );
      },
    },
    {
      key: 'plan',
      header: 'Plan',
      render: (sub) => {
        const plan = plans.find((p) => p.id === sub.planId);
        return (
          <span className="text-xs font-semibold text-navy">
            {plan?.name || sub.planId}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Coverage Status',
      render: (sub) => <StatusBadge status={sub.status} />,
    },
    {
      key: 'period',
      header: 'Active Period',
      render: (sub) => (
        <div className="text-xs text-content-body">
          <span>{sub.startDate} &rarr; <strong>{sub.expiryDate}</strong></span>
          <span className="text-[11px] text-content-muted block">
            {sub.renewalCount > 0 ? `${sub.renewalCount} simulated renewal(s)` : 'Initial period'}
          </span>
        </div>
      ),
    },
    {
      key: 'paymentRef',
      header: 'Payment Receipt',
      render: (sub) => (
        <span className="font-mono text-xs text-slate-600">
          {sub.paymentRef || 'Linked to Reg'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      className: 'text-right',
      render: (sub) => (
        <div className="flex items-center justify-end gap-2">
          {(sub.status === 'expiring_soon' || sub.status === 'expired') && (
            <Button
              onClick={() => handleOpenReminder(sub)}
              variant="outline"
              size="sm"
              leftIcon={<Bell className="w-3.5 h-3.5 text-amber-600" />}
            >
              Send Reminder
            </Button>
          )}
          <Button
            onClick={() => handleOpenRenew(sub)}
            variant="primary"
            size="sm"
            leftIcon={<RefreshCw className="w-3.5 h-3.5 text-mint" />}
          >
            Renew
          </Button>
        </div>
      ),
    },
  ];

  const matchedReminderChild = childrenRecords.find((c) => c.id === reminderSub?.childId);

  return (
    <div>
      <PageHeader
        title="Subscription Coverage &amp; Expirations"
        description="Monitor covered individuals, renewal reminders, expiration timelines, and extension receipts."
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-brand bg-white border border-border-subtle shadow-subtle">
          <span className="text-xs font-semibold uppercase tracking-wider text-content-muted block">
            Total Subscriptions
          </span>
          <span className="text-2xl font-heading font-bold text-navy block mt-1">
            {subscriptions.length}
          </span>
          <span className="text-[11px] text-content-muted mt-0.5 block">
            Annual &amp; multi-year plans
          </span>
        </div>

        <div className="p-4 rounded-brand bg-white border border-border-subtle shadow-subtle">
          <span className="text-xs font-semibold uppercase tracking-wider text-content-muted block">
            Active Coverage
          </span>
          <span className="text-2xl font-heading font-bold text-[#088F5B] block mt-1">
            {activeCount}
          </span>
          <span className="text-[11px] text-content-muted mt-0.5 block">
            Protected &amp; verified
          </span>
        </div>

        <div className="p-4 rounded-brand bg-white border border-border-subtle shadow-subtle">
          <span className="text-xs font-semibold uppercase tracking-wider text-content-muted block">
            Expiring / Expired
          </span>
          <span className="text-2xl font-heading font-bold text-amber-700 block mt-1">
            {expiringCount + expiredCount}
          </span>
          <span className="text-[11px] text-content-muted mt-0.5 block">
            {expiringCount} expiring soon, {expiredCount} expired
          </span>
        </div>

        <div className="p-4 rounded-brand bg-white border border-border-subtle shadow-subtle">
          <span className="text-xs font-semibold uppercase tracking-wider text-content-muted block">
            Renewals Processed
          </span>
          <span className="text-2xl font-heading font-bold text-navy block mt-1">
            {totalRenewals}
          </span>
          <span className="text-[11px] text-content-muted mt-0.5 block">
            Extensions processed
          </span>
        </div>
      </div>

      {/* Queue Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-3 mb-4">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            statusFilter === 'ALL'
              ? 'bg-navy text-white shadow-sm'
              : 'bg-white text-content-body hover:bg-slate-100 border border-border-subtle'
          }`}
        >
          <span>All Subscriptions</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {subscriptions.length}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('active')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            statusFilter === 'active'
              ? 'bg-[#088F5B] text-white shadow-sm'
              : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200'
          }`}
        >
          <span>Active</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === 'active' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-900'}`}>
            {activeCount}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('expiring_soon')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            statusFilter === 'expiring_soon'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white text-amber-800 hover:bg-amber-50 border border-amber-200'
          }`}
        >
          <span>Expiring Soon (&le;30 Days)</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === 'expiring_soon' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900 font-bold'}`}>
            {expiringCount}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('expired')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            statusFilter === 'expired'
              ? 'bg-rose-700 text-white shadow-sm'
              : 'bg-white text-rose-800 hover:bg-rose-50 border border-rose-200'
          }`}
        >
          <span>Expired</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === 'expired' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-900 font-bold'}`}>
            {expiredCount}
          </span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-brand border border-border-subtle shadow-subtle mb-6 max-w-md relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search wearer name, band code, or subscription ID..."
          className="w-full h-10 pl-9 pr-4 text-xs sm:text-sm rounded-brand border border-border-subtle focus:outline-none focus:ring-2 focus:ring-navy"
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredSubs}
        keyExtractor={(item) => item.id}
        emptyTitle="No Subscriptions Match Criteria"
        emptyDescription="Try adjusting your search query or selecting a different status filter tab."
      />

      {/* Renewal Modal */}
      <Modal
        isOpen={isRenewModalOpen}
        onClose={() => setIsRenewModalOpen(false)}
        title="Simulate Subscription Renewal"
        description="Extend registry coverage for the registered wearer."
      >
        <form onSubmit={handleConfirmRenew} className="space-y-4">
          <div className="p-4 bg-neutral-soft rounded-brand border border-border-subtle space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-content-muted">Current Expiration:</span>
              <span className="font-semibold text-navy">{selectedSub?.expiryDate}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
              <span className="text-content-muted font-bold text-navy">Projected New Expiration:</span>
              <span className="font-bold text-[#088F5B] text-sm font-mono">{projectedExpiry}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Extension Duration" required>
              <Select
                value={renewalMonths}
                onChange={(e) => setRenewalMonths(Number(e.target.value))}
              >
                <option value={12}>1 Year Extension ($29.00)</option>
                <option value={24}>2 Year Extension ($49.00)</option>
                <option value={6}>6 Month Extension ($15.00)</option>
              </Select>
            </FormField>

            <FormField label="Simulated Payment Mode" required>
              <Select
                value={renewalMethod}
                onChange={(e) => setRenewalMethod(e.target.value as any)}
              >
                <option value="card">Credit / Debit Card</option>
                <option value="offline_voucher">Cash / Bank Transfer</option>
              </Select>
            </FormField>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => setIsRenewModalOpen(false)} variant="outline" size="md">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md">
              Confirm Renewal Extension
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reminder Modal */}
      <Modal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        title="Send Renewal Reminder"
        description="Dispatch an automated reminder to the family guardian for upcoming or expired subscription coverage."
      >
        <form onSubmit={handleConfirmReminder} className="space-y-4">
          <div className="p-4 bg-amber-50 rounded-brand border border-amber-200 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-amber-900 font-semibold">Wearer:</span>
              <span className="font-bold text-navy">{matchedReminderChild?.name || 'Wearer'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-amber-900 font-semibold">Guardian:</span>
              <span className="font-medium text-navy">{matchedReminderChild?.primaryGuardian.fullName}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-amber-200">
              <span className="text-amber-900 font-semibold">Expiry Date:</span>
              <span className="font-mono font-bold text-rose-700">{reminderSub?.expiryDate}</span>
            </div>
          </div>

          <FormField label="Dispatch Channel" required>
            <Select
              value={reminderChannel}
              onChange={(e) => setReminderChannel(e.target.value as any)}
            >
              <option value="email">Email Notification ({matchedReminderChild?.primaryGuardian.email || 'Registered Email'})</option>
              <option value="sms">SMS Text Message ({matchedReminderChild?.primaryGuardian.mobile || 'Registered Mobile'})</option>
              <option value="phone_call">Phone Call Relay</option>
            </Select>
          </FormField>

          <FormField label="Custom Reminder Note (Optional)">
            <Textarea
              rows={3}
              value={reminderNotes}
              onChange={(e) => setReminderNotes(e.target.value)}
              placeholder="e.g. Please renew by end of the week to ensure uninterrupted 24/7 call routing for wristband..."
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => setIsReminderModalOpen(false)} variant="outline" size="md">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSendingReminder}
              leftIcon={<Bell className="w-4 h-4 text-mint" />}
            >
              Dispatch Reminder
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
