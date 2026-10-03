import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/admin/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { FormField, Input, Select, Textarea } from '../../components/common/FormField';
import { useApp } from '../../context/AppContext';
import { Subscription, SubscriptionStatus } from '../../types';
import { CreditCard, RefreshCw, Calendar, ArrowRight, Search, Bell, Mail, Phone, MessageSquare, AlertCircle, CheckCircle2, DollarSign, Edit2 } from 'lucide-react';

export const SubscriptionsListPage: React.FC = () => {
  const { subscriptions, childrenRecords, plans, renewSubscription, sendRenewalReminder, updateCustomerSubscriptionPrice } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Renewal Modal
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [renewalMonths, setRenewalMonths] = useState(12);
  const [renewalMethod, setRenewalMethod] = useState<'card' | 'offline_voucher'>('card');
  const [customRenewalPrice, setCustomRenewalPrice] = useState<string>('');

  // Customer Price Edit Modal
  const [isCustPriceModalOpen, setIsCustPriceModalOpen] = useState(false);
  const [custPriceSub, setCustPriceSub] = useState<Subscription | null>(null);
  const [custPriceAmount, setCustPriceAmount] = useState<number>(29);
  const [custPriceNote, setCustPriceNote] = useState<string>('');

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
    setCustomRenewalPrice(sub.customPriceAmount !== undefined ? String(sub.customPriceAmount) : '');
    setIsRenewModalOpen(true);
  };

  const handleOpenCustPriceEdit = (sub: Subscription) => {
    setCustPriceSub(sub);
    const plan = plans.find((p) => p.id === sub.planId);
    setCustPriceAmount(sub.customPriceAmount !== undefined ? sub.customPriceAmount : (plan?.priceAmount || 29));
    setCustPriceNote(sub.customPriceNote || '');
    setIsCustPriceModalOpen(true);
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
    const customPriceNum = customRenewalPrice.trim() !== '' ? Number(customRenewalPrice) : undefined;
    renewSubscription(selectedSub.id, Number(renewalMonths), renewalMethod, undefined, customPriceNum);
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

  const handleSaveCustPrice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custPriceSub) return;
    updateCustomerSubscriptionPrice(custPriceSub.id, custPriceAmount, custPriceNote);
    setIsCustPriceModalOpen(false);
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
      key: 'covered_wearer',
      header: 'Covered Wearer',
      className: 'min-w-[190px]',
      render: (sub) => {
        const child = childrenRecords.find((c) => c.id === sub.childId);
        return child ? (
          <div className="space-y-0.5 whitespace-nowrap">
            <Link to={`/admin/children/${child.id}`} className="font-heading font-bold text-navy hover:underline text-sm block">
              {child.name}
            </Link>
            <span className="font-mono text-2xs text-slate-500">Band: {child.currentBandCode}</span>
          </div>
        ) : (
          <span className="text-xs text-content-muted whitespace-nowrap">Wearer {sub.childId}</span>
        );
      },
    },
    {
      key: 'plan',
      header: 'Plan',
      className: 'min-w-[140px]',
      render: (sub) => {
        const plan = plans.find((p) => p.id === sub.planId);
        return (
          <div className="whitespace-nowrap">
            <span className="inline-block font-heading font-semibold text-xs text-navy bg-slate-100/90 px-2.5 py-1 rounded-md border border-slate-200/80">
              {plan?.name || sub.planId}
            </span>
          </div>
        );
      },
    },
    {
      key: 'price',
      header: 'Rate / Price',
      className: 'min-w-[130px]',
      render: (sub) => {
        const plan = plans.find((p) => p.id === sub.planId);
        const price = sub.customPriceAmount !== undefined ? sub.customPriceAmount : (plan?.priceAmount || 29);
        return (
          <div className="text-xs space-y-0.5 whitespace-nowrap">
            <span className="font-bold text-navy font-mono text-sm">${price.toFixed(2)}</span>
            {sub.customPriceAmount !== undefined ? (
              <span className="inline-flex items-center gap-1 text-3xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Custom Rate
              </span>
            ) : (
              <span className="block text-3xs text-slate-400 font-medium">Standard</span>
            )}
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'Coverage Status',
      className: 'min-w-[140px]',
      render: (sub) => (
        <div className="whitespace-nowrap space-y-1">
          <StatusBadge status={sub.status} />
          {sub.reminderCount && sub.reminderCount > 0 ? (
            <div className="flex items-center gap-1">
              <span className="inline-flex items-center gap-1 text-3xs font-semibold text-emerald-900 bg-emerald-100/90 px-2 py-0.5 rounded-full border border-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                Reminded {sub.reminderCount}x
              </span>
            </div>
          ) : null}
        </div>
      ),
    },
    {
      key: 'period',
      header: 'Active Period',
      className: 'min-w-[190px]',
      render: (sub) => (
        <div className="text-xs space-y-0.5 whitespace-nowrap">
          <span className="text-slate-700 font-medium">
            {sub.startDate} <span className="text-slate-400">&rarr;</span> <strong className="text-navy">{sub.expiryDate}</strong>
          </span>
          <span className="text-2xs text-slate-400 block">
            {sub.renewalCount > 0 ? `${sub.renewalCount} renewal(s) applied` : 'Initial coverage period'}
          </span>
        </div>
      ),
    },
    {
      key: 'paymentRef',
      header: 'Payment Receipt',
      className: 'min-w-[130px]',
      render: (sub) => (
        <span className="font-mono text-2xs text-slate-700 bg-slate-100/90 px-2 py-1 rounded-md border border-slate-200 whitespace-nowrap inline-block font-semibold">
          {sub.paymentRef || 'Linked to Reg'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right min-w-[260px]',
      render: (sub) => (
        <div className="flex items-center justify-end gap-2 flex-nowrap whitespace-nowrap">
          {/* Executive Dollar Sign Price Button */}
          <button
            type="button"
            onClick={() => handleOpenCustPriceEdit(sub)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-emerald-50/70 hover:border-emerald-300 text-slate-700 hover:text-emerald-950 transition-all shadow-2xs group"
            title="Configure customer-specific subscription price"
          >
            <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-3xs font-black font-mono group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              $
            </div>
            <span>Edit Price</span>
          </button>

          {(sub.status === 'expiring_soon' || sub.status === 'expired') && (
            <button
              type="button"
              onClick={() => handleOpenReminder(sub)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all shadow-2xs group ${
                sub.reminderCount && sub.reminderCount > 0
                  ? 'border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-950'
                  : 'border-amber-200 bg-amber-50/80 hover:bg-amber-100 text-amber-900'
              }`}
              title={
                sub.reminderCount && sub.reminderCount > 0
                  ? `Reminder sent ${sub.reminderCount} time(s). Last sent: ${sub.lastReminderSentAt}. Click to dispatch another.`
                  : 'Send renewal reminder notice'
              }
            >
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-3xs transition-colors ${
                  sub.reminderCount && sub.reminderCount > 0
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-100 text-amber-700 group-hover:bg-amber-500 group-hover:text-white'
                }`}
              >
                {sub.reminderCount && sub.reminderCount > 0 ? '✓' : <Bell className="w-2.5 h-2.5" />}
              </div>
              <span>{sub.reminderCount && sub.reminderCount > 0 ? `Reminded (${sub.reminderCount})` : 'Reminder'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleOpenRenew(sub)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border border-navy bg-navy hover:bg-[#062c51] text-white transition-all shadow-2xs hover:shadow-xs group"
            title="Extend subscription coverage"
          >
            <div className="w-4 h-4 rounded-full bg-white/15 text-brand-mint flex items-center justify-center group-hover:bg-brand-mint group-hover:text-navy group-hover:rotate-180 transition-all duration-300">
              <RefreshCw className="w-2.5 h-2.5" />
            </div>
            <span>Renew</span>
          </button>
        </div>
      ),
    },
  ];

  const matchedReminderChild = childrenRecords.find((c) => c.id === reminderSub?.childId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscription Coverage &amp; Expirations"
        description="Monitor covered individuals, renewal reminders, expiration timelines, and extension receipts."
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Unified Filter & Search Toolbar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Bar with Left Icon */}
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search wearer, band code, or receipt ref..."
            className="w-full h-10 pl-10 pr-8 text-xs sm:text-sm rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white text-navy focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-semibold"
            >
              ✕
            </button>
          )}
        </div>

        {/* Queue Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar flex-wrap sm:flex-nowrap">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              statusFilter === 'ALL'
                ? 'bg-navy text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-navy'
            }`}
          >
            <span>All Subscriptions</span>
            <span className={`px-1.5 py-0.2 rounded-full text-2xs ${statusFilter === 'ALL' ? 'bg-white/20 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>
              {subscriptions.length}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              statusFilter === 'active'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/80'
            }`}
          >
            <span>Active</span>
            <span className={`px-1.5 py-0.2 rounded-full text-2xs ${statusFilter === 'active' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-900'}`}>
              {activeCount}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('expiring_soon')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              statusFilter === 'expiring_soon'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/80'
            }`}
          >
            <span>Expiring Soon</span>
            <span className={`px-1.5 py-0.2 rounded-full text-2xs ${statusFilter === 'expiring_soon' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900 font-bold'}`}>
              {expiringCount}
            </span>
          </button>

          <button
            onClick={() => setStatusFilter('expired')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              statusFilter === 'expired'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200/80'
            }`}
          >
            <span>Expired</span>
            <span className={`px-1.5 py-0.2 rounded-full text-2xs ${statusFilter === 'expired' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-900 font-bold'}`}>
              {expiredCount}
            </span>
          </button>
        </div>
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
            <FormField label="Extension Duration" required hint="Configured in Admin Service Plans">
              <Select
                value={renewalMonths}
                onChange={(e) => setRenewalMonths(Number(e.target.value))}
              >
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.durationMonths}>
                    {plan.name} — {plan.durationMonths} Mo ({plan.priceFormatted})
                  </option>
                ))}
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

          <FormField
            label="Custom Renewal Price Override ($ USD)"
            hint="Leave blank to use standard rate, or enter custom discounted / special rate for this customer"
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold">
                $
              </div>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={customRenewalPrice}
                onChange={(e) => setCustomRenewalPrice(e.target.value)}
                placeholder="e.g. 25.00 (Optional Custom Price)"
                className="pl-8"
              />
            </div>
          </FormField>

          <div className="text-2xs text-content-muted flex items-center justify-between pt-1">
            <span>Prices are managed centrally by the Administrator.</span>
            <Link to="/admin/plans" className="text-navy font-semibold underline hover:text-navy-dark">
              Edit Standard Plans →
            </Link>
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

      {/* Customer Specific Price Edit Modal */}
      <Modal
        isOpen={isCustPriceModalOpen}
        onClose={() => setIsCustPriceModalOpen(false)}
        title="Edit Customer Subscription Rate"
        description="Set a custom recurring or renewal price specifically for this customer / wearer."
      >
        {custPriceSub && (
          <form onSubmit={handleSaveCustPrice} className="space-y-4">
            <div className="p-3 bg-neutral-soft rounded-brand border border-border-subtle text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-content-muted">Subscription ID:</span>
                <span className="font-mono font-bold text-navy">{custPriceSub.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-content-muted">Current Expiration:</span>
                <span className="text-navy font-semibold">{custPriceSub.expiryDate}</span>
              </div>
            </div>

            <FormField
              label="Custom Customer Rate ($ USD)"
              required
              hint="Overrides standard plan pricing for all future extensions and receipts for this individual"
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
                  value={custPriceAmount}
                  onChange={(e) => setCustPriceAmount(Number(e.target.value))}
                  className="pl-8"
                  placeholder="29.00"
                />
              </div>
            </FormField>

            {/* Quick Presets */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-navy">Quick Rate Presets:</label>
              <div className="flex flex-wrap gap-2">
                {[0, 15, 20, 25, 29, 39, 49].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setCustPriceAmount(amt)}
                    className={`px-2.5 py-1 text-xs rounded-brand border transition-all ${
                      custPriceAmount === amt
                        ? 'bg-navy text-white font-bold border-navy shadow-xs'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    {amt === 0 ? 'Free / Waived ($0)' : `$${amt}.00`}
                  </button>
                ))}
              </div>
            </div>

            <FormField label="Staff Note / Reason for Rate Change">
              <Textarea
                rows={2}
                value={custPriceNote}
                onChange={(e) => setCustPriceNote(e.target.value)}
                placeholder="e.g. Special agreement, loyalty pricing, or multi-member household discount"
              />
            </FormField>

            <div className="flex justify-end gap-2 pt-3 border-t border-border-subtle">
              <Button onClick={() => setIsCustPriceModalOpen(false)} variant="outline" size="md">
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md">
                Save Customer Rate
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Reminder Modal */}
      <Modal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        title="Send Renewal Reminder"
        description="Dispatch an automated reminder to the family guardian for upcoming or expired subscription coverage."
      >
        <form onSubmit={handleConfirmReminder} className="space-y-4">
          {reminderSub?.reminderCount && reminderSub.reminderCount > 0 ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-950 flex items-start gap-2.5 shadow-2xs">
              <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-2xs flex-shrink-0 mt-0.5 shadow-xs">
                ✓
              </div>
              <div>
                <span className="font-bold block text-emerald-950">
                  Reminder Sent {reminderSub.reminderCount} Time{reminderSub.reminderCount > 1 ? 's' : ''}
                </span>
                <span className="text-2xs text-emerald-800">
                  Last dispatched on <strong>{reminderSub.lastReminderSentAt}</strong> via <strong>{reminderSub.lastReminderChannel || 'email'}</strong>. You can send another reminder below.
                </span>
              </div>
            </div>
          ) : null}

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
