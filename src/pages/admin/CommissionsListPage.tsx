import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/admin/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { FormField, Select, Input } from '../../components/common/FormField';
import { useApp } from '../../context/AppContext';
import { Commission } from '../../types';
import { Banknote, CheckCircle2, PiggyBank, Plus, Store } from 'lucide-react';

export const CommissionsListPage: React.FC = () => {
  const { commissions, vendors, approveCommission, createSimulatedPayout } = useApp();

  // Filter states
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [vendorFilter, setVendorFilter] = useState('ALL');

  // Payout Batch Modal State
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [selectedVendorId, setSelectedVendorId] = useState(vendors[0]?.id || '');
  const [payoutNotes, setPayoutNotes] = useState('');
  const [payoutError, setPayoutError] = useState('');

  // KPI calculations
  const pendingComms = commissions.filter(c => c.status === 'pending');
  const approvedComms = commissions.filter(c => c.status === 'approved');
  const paidComms = commissions.filter(c => c.status === 'paid');

  const pendingAmount = pendingComms.reduce((sum, c) => sum + c.commissionAmount, 0);
  const approvedAmount = approvedComms.reduce((sum, c) => sum + c.commissionAmount, 0);
  const paidAmount = paidComms.reduce((sum, c) => sum + c.commissionAmount, 0);
  const totalAmount = commissions.reduce((sum, c) => sum + c.commissionAmount, 0);

  const filteredCommissions = commissions.filter((c) => {
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesVendor = vendorFilter === 'ALL' || c.vendorId === vendorFilter;
    return matchesStatus && matchesVendor;
  });

  // Commissions approved and eligible for payout
  const approvedCommissionsForVendor = commissions.filter(
    (c) => c.vendorId === selectedVendorId && c.status === 'approved'
  );
  const eligibleAmountTotal = approvedCommissionsForVendor.reduce(
    (sum, c) => sum + c.commissionAmount,
    0
  );

  const handleOpenPayoutModal = () => {
    // default to first vendor that has approved commissions if any
    const vendorWithApproved = vendors.find((v) =>
      commissions.some((c) => c.vendorId === v.id && c.status === 'approved')
    );
    if (vendorWithApproved) setSelectedVendorId(vendorWithApproved.id);
    setPayoutNotes('Monthly retail partner commission settlement (Simulated)');
    setPayoutError('');
    setIsPayoutModalOpen(true);
  };

  const handleConfirmPayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (approvedCommissionsForVendor.length === 0) {
      setPayoutError('No approved commissions available for this vendor to batch.');
      return;
    }

    const res = createSimulatedPayout(
      selectedVendorId,
      approvedCommissionsForVendor.map((c) => c.id),
      payoutNotes
    );

    if (res) {
      setIsPayoutModalOpen(false);
    }
  };

  const columns: Column<Commission>[] = [
    {
      key: 'id',
      header: 'Commission ID',
      render: (c) => <span className="font-mono font-bold text-navy text-xs sm:text-sm">{c.id}</span>,
    },
    {
      key: 'vendor',
      header: 'Vendor Shop',
      render: (c) => {
        const vendor = vendors.find((v) => v.id === c.vendorId);
        return (
          <div>
            <Link to={`/admin/vendors/${c.vendorId}`} className="font-semibold text-navy hover:underline text-xs sm:text-sm block">
              {vendor?.shopName || c.vendorId}
            </Link>
            <span className="text-[11px] text-content-muted">{vendor?.branch}</span>
          </div>
        );
      },
    },
    {
      key: 'sale',
      header: 'Eligible Sale',
      render: (c) => (
        <div className="text-xs">
          <span className="font-mono font-medium text-navy block">{c.registrationRef}</span>
          <span className="text-content-muted">Amount: ${c.eligibleAmount.toFixed(2)}</span>
        </div>
      ),
    },
    {
      key: 'rate',
      header: 'Applied Rule',
      render: (c) => (
        <span className="text-xs text-content-body">
          {c.type === 'percentage' ? `${c.rate}% rate` : `$${c.rate}.00 fixed`}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Commission Earned',
      render: (c) => (
        <span className="font-mono font-bold text-sm text-[#088F5B]">
          ${c.commissionAmount.toFixed(2)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Payout Status',
      render: (c) => <StatusBadge status={c.status} size="sm" />,
    },
    {
      key: 'actions',
      header: 'Action',
      className: 'text-right',
      render: (c) => {
        if (c.status === 'pending') {
          return (
            <Button
              onClick={() => approveCommission(c.id)}
              variant="outline"
              size="sm"
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5 text-[#088F5B]" />}
            >
              Approve
            </Button>
          );
        }
        if (c.status === 'approved') {
          return <span className="text-xs font-semibold text-amber-700">Eligible for Payout</span>;
        }
        return <span className="text-xs text-slate-400">Paid in batch</span>;
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Retail Commission Review &amp; Approval"
        description="Review vendor attribution earnings tied to verified registrations and batch approved entries into payouts."
        actions={
          <Button
            onClick={handleOpenPayoutModal}
            variant="primary"
            size="sm"
            leftIcon={<PiggyBank className="w-4 h-4" />}
          >
            Create Simulated Payout
          </Button>
        }
      />

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-brand bg-white border border-border-subtle shadow-subtle">
          <span className="text-xs font-semibold uppercase tracking-wider text-content-muted block">
            Pending Review
          </span>
          <span className="text-2xl font-heading font-bold text-amber-700 block mt-1">
            ${pendingAmount.toFixed(2)}
          </span>
          <span className="text-[11px] text-content-muted mt-0.5 block">
            {pendingComms.length} entries awaiting signoff
          </span>
        </div>

        <div className="p-4 rounded-brand bg-white border border-border-subtle shadow-subtle">
          <span className="text-xs font-semibold uppercase tracking-wider text-content-muted block">
            Approved (Awaiting Payout)
          </span>
          <span className="text-2xl font-heading font-bold text-navy block mt-1">
            ${approvedAmount.toFixed(2)}
          </span>
          <span className="text-[11px] text-content-muted mt-0.5 block">
            {approvedComms.length} ready for payout batch
          </span>
        </div>

        <div className="p-4 rounded-brand bg-white border border-border-subtle shadow-subtle">
          <span className="text-xs font-semibold uppercase tracking-wider text-content-muted block">
            Settled to Vendors
          </span>
          <span className="text-2xl font-heading font-bold text-[#088F5B] block mt-1">
            ${paidAmount.toFixed(2)}
          </span>
          <span className="text-[11px] text-content-muted mt-0.5 block">
            {paidComms.length} processed in batches
          </span>
        </div>

        <div className="p-4 rounded-brand bg-white border border-border-subtle shadow-subtle">
          <span className="text-xs font-semibold uppercase tracking-wider text-content-muted block">
            Lifetime Accrued
          </span>
          <span className="text-2xl font-heading font-bold text-slate-700 block mt-1">
            ${totalAmount.toFixed(2)}
          </span>
          <span className="text-[11px] text-content-muted mt-0.5 block">
            {commissions.length} total sales credited
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-brand border border-border-subtle shadow-subtle mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
        <div>
          <label className="text-[11px] font-semibold text-content-muted uppercase tracking-wider block mb-1">
            Payout Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-10 px-3 text-xs sm:text-sm rounded-brand border border-border-subtle bg-white text-content-body focus:outline-none focus:ring-2 focus:ring-navy"
          >
            <option value="ALL">All Statuses ({commissions.length})</option>
            <option value="pending">Pending Review ({pendingComms.length})</option>
            <option value="approved">Approved / Eligible ({approvedComms.length})</option>
            <option value="paid">Paid Out ({paidComms.length})</option>
          </select>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-content-muted uppercase tracking-wider block mb-1">
            Vendor Shop
          </label>
          <select
            value={vendorFilter}
            onChange={(e) => setVendorFilter(e.target.value)}
            className="w-full h-10 px-3 text-xs sm:text-sm rounded-brand border border-border-subtle bg-white text-content-body focus:outline-none focus:ring-2 focus:ring-navy"
          >
            <option value="ALL">All Vendors</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.shopName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredCommissions}
        keyExtractor={(item) => item.id}
        emptyTitle="No Commissions Match Filters"
        emptyDescription="Adjust your status or vendor filter to view records."
      />

      {/* Modal: Create Simulated Payout */}
      <Modal
        isOpen={isPayoutModalOpen}
        onClose={() => setIsPayoutModalOpen(false)}
        title="Create Simulated Vendor Payout"
        description="Batches all approved commissions for the selected vendor into a single payout record. Prevents double-payment."
      >
        <form onSubmit={handleConfirmPayout} className="space-y-4">
          {payoutError && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-brand border border-red-200">
              {payoutError}
            </div>
          )}

          <FormField label="Select Vendor" required>
            <Select
              value={selectedVendorId}
              onChange={(e) => {
                setSelectedVendorId(e.target.value);
                setPayoutError('');
              }}
            >
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.shopName} — {v.branch}
                </option>
              ))}
            </Select>
          </FormField>

          {/* Batch Summary Preview */}
          <div className="p-4 bg-neutral-soft rounded-brand border border-border-subtle space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-content-muted">Approved Commissions:</span>
              <span className="font-semibold text-navy">
                {approvedCommissionsForVendor.length} entries eligible
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
              <span className="font-bold text-navy text-sm">Total Batch Amount:</span>
              <span className="font-mono font-bold text-lg text-[#088F5B]">
                ${eligibleAmountTotal.toFixed(2)} USD
              </span>
            </div>
          </div>

          <FormField label="Payout Reference Notes">
            <Input
              value={payoutNotes}
              onChange={(e) => setPayoutNotes(e.target.value)}
              placeholder="e.g. Settlement batch release via direct voucher"
            />
          </FormField>

          <p className="text-[11px] text-content-muted">
            Demonstration notice: This action marks all eligible entries as Paid and records an immutable batch reference. No actual banking transaction is executed.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => setIsPayoutModalOpen(false)} variant="outline" size="md">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="mint"
              size="md"
              disabled={approvedCommissionsForVendor.length === 0}
            >
              Process Simulated Payout
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
