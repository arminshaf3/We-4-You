import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/admin/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { FormField, Select } from '../../components/common/FormField';
import { useApp } from '../../context/AppContext';
import { Subscription, SubscriptionStatus } from '../../types';
import { CreditCard, RefreshCw, Calendar, ArrowRight, Search } from 'lucide-react';

export const SubscriptionsListPage: React.FC = () => {
  const { subscriptions, childrenRecords, plans, renewSubscription } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Renewal Modal
  const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [renewalMonths, setRenewalMonths] = useState(12);

  const activeCount = useMemo(() => subscriptions.filter((s) => s.status === 'active').length, [subscriptions]);
  const expiringCount = useMemo(() => subscriptions.filter((s) => s.status === 'expiring_soon').length, [subscriptions]);
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

      const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [subscriptions, childrenRecords, searchTerm, statusFilter]);

  const handleOpenRenew = (sub: Subscription) => {
    setSelectedSub(sub);
    setRenewalMonths(12);
    setIsRenewModalOpen(true);
  };

  const handleConfirmRenew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;
    renewSubscription(selectedSub.id, Number(renewalMonths));
    setIsRenewModalOpen(false);
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
      header: 'Covered Child',
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
          <span className="text-xs text-content-muted">Child {sub.childId}</span>
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
        <Button
          onClick={() => handleOpenRenew(sub)}
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className="w-3.5 h-3.5 text-[#088F5B]" />}
        >
          Simulate Renewal
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Active &amp; Pending Subscriptions"
        description="Monitor covered children, coverage expiration timelines, and simulate renewal extensions."
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
            Expiring Soon
          </span>
          <span className="text-2xl font-heading font-bold text-amber-700 block mt-1">
            {expiringCount}
          </span>
          <span className="text-[11px] text-content-muted mt-0.5 block">
            Eligible for renewal reminder
          </span>
        </div>

        <div className="p-4 rounded-brand bg-white border border-border-subtle shadow-subtle">
          <span className="text-xs font-semibold uppercase tracking-wider text-content-muted block">
            Simulated Renewals
          </span>
          <span className="text-2xl font-heading font-bold text-navy block mt-1">
            {totalRenewals}
          </span>
          <span className="text-[11px] text-content-muted mt-0.5 block">
            Extensions processed
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-brand border border-border-subtle shadow-subtle mb-6 grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search child name, band code, or subscription ID..."
            className="w-full h-10 pl-9 pr-4 text-xs sm:text-sm rounded-brand border border-border-subtle focus:outline-none focus:ring-2 focus:ring-navy"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-10 px-3 text-xs sm:text-sm rounded-brand border border-border-subtle bg-white text-content-body focus:outline-none focus:ring-2 focus:ring-navy"
          >
            <option value="ALL">All Statuses ({subscriptions.length})</option>
            <option value="active">Active Coverage ({activeCount})</option>
            <option value="expiring_soon">Expiring Soon ({expiringCount})</option>
            <option value="pending">Pending Verification ({pendingCount})</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredSubs}
        keyExtractor={(item) => item.id}
        emptyTitle="No Subscriptions Match Criteria"
      />

      {/* Renewal Modal */}
      <Modal
        isOpen={isRenewModalOpen}
        onClose={() => setIsRenewModalOpen(false)}
        title="Simulate Subscription Renewal"
        description="Extend registry coverage for the registered child."
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

          <FormField label="Select Renewal Term" required>
            <Select
              value={renewalMonths}
              onChange={(e) => setRenewalMonths(Number(e.target.value))}
            >
              <option value="12">12 Months (+$29.00 Sample)</option>
              <option value="24">24 Months (+$49.00 Sample)</option>
            </Select>
          </FormField>

          <p className="text-[11px] text-content-muted">
            Note: Early renewal automatically extends from the current expiration date. Renewals do not generate vendor shop commissions unless specifically enabled.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => setIsRenewModalOpen(false)} variant="outline" size="md">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md">
              Confirm Simulated Renewal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
