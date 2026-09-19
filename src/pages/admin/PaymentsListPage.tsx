import React, { useState } from 'react';
import { PageHeader } from '../../components/admin/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { FormField, Input, Textarea } from '../../components/common/FormField';
import { useApp } from '../../context/AppContext';
import { Payment } from '../../types';
import { Receipt, CheckCircle, RotateCcw, AlertCircle, Search } from 'lucide-react';

export const PaymentsListPage: React.FC = () => {
  const { payments, verifyPayment, reversePayment } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [isReverseModalOpen, setIsReverseModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [reverseReason, setReverseReason] = useState('');

  const verifiedPayments = payments.filter((p) => p.status === 'verified');
  const pendingPayments = payments.filter((p) => p.status === 'pending');
  const reversedPayments = payments.filter((p) => p.status === 'reversed');

  const verifiedAmount = verifiedPayments.reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
  const reversedAmount = reversedPayments.reduce((sum, p) => sum + p.amount, 0);

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      !searchTerm.trim() ||
      p.receiptRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.payerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.registrationId && p.registrationId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenReverse = (payment: Payment) => {
    setSelectedPayment(payment);
    setReverseReason('');
    setIsReverseModalOpen(true);
  };

  const handleConfirmReverse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment || !reverseReason.trim()) return;
    reversePayment(selectedPayment.id, reverseReason.trim());
    setIsReverseModalOpen(false);
  };

  const columns: Column<Payment>[] = [
    {
      key: 'receiptRef',
      header: 'Receipt Reference',
      render: (p) => (
        <div>
          <span className="font-mono font-bold text-navy text-sm block">{p.receiptRef}</span>
          <span className="text-[11px] text-content-muted">ID: {p.id}</span>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Payment Type',
      render: (p) => (
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
          {p.type.replace('_', ' ')}
        </span>
      ),
    },
    {
      key: 'payerName',
      header: 'Payer / Guardian',
      render: (p) => (
        <div>
          <span className="font-semibold text-navy text-xs sm:text-sm block">{p.payerName}</span>
          {p.registrationId && (
            <span className="text-xs text-content-muted">Reg: {p.registrationId}</span>
          )}
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount (Demo)',
      render: (p) => (
        <span className="font-mono font-bold text-navy text-sm">
          ${p.amount.toFixed(2)} {p.currency}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Payment Status',
      render: (p) => <StatusBadge status={p.status} />,
    },
    {
      key: 'date',
      header: 'Recorded Date',
      render: (p) => <span className="text-xs text-content-muted">{p.paymentDate}</span>,
    },
    {
      key: 'actions',
      header: 'Simulate Action',
      className: 'text-right',
      render: (p) => {
        if (p.status === 'pending') {
          return (
            <Button
              onClick={() => verifyPayment(p.id)}
              variant="primary"
              size="sm"
              leftIcon={<CheckCircle className="w-3.5 h-3.5 text-mint" />}
            >
              Verify Receipt
            </Button>
          );
        }
        if (p.status === 'verified') {
          return (
            <Button
              onClick={() => handleOpenReverse(p)}
              variant="outline"
              size="sm"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Reverse
            </Button>
          );
        }
        return <span className="text-xs text-content-muted italic">Reversed</span>;
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Payment Verification &amp; Receipts"
        description="Offline manual receipt matching and payment verification for registrations and subscription renewals."
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-brand bg-white border border-border-subtle shadow-subtle">
          <span className="text-xs font-semibold uppercase tracking-wider text-content-muted block">
            Verified Receipts
          </span>
          <span className="text-2xl font-heading font-bold text-[#088F5B] block mt-1">
            ${verifiedAmount.toFixed(2)}
          </span>
          <span className="text-[11px] text-content-muted mt-0.5 block">
            {verifiedPayments.length} confirmed payments
          </span>
        </div>

        <div className="p-4 rounded-brand bg-white border border-border-subtle shadow-subtle">
          <span className="text-xs font-semibold uppercase tracking-wider text-content-muted block">
            Pending Verification
          </span>
          <span className="text-2xl font-heading font-bold text-amber-700 block mt-1">
            ${pendingAmount.toFixed(2)}
          </span>
          <span className="text-[11px] text-content-muted mt-0.5 block">
            {pendingPayments.length} awaiting voucher check
          </span>
        </div>

        <div className="p-4 rounded-brand bg-white border border-border-subtle shadow-subtle">
          <span className="text-xs font-semibold uppercase tracking-wider text-content-muted block">
            Adjusted / Reversed
          </span>
          <span className="text-2xl font-heading font-bold text-slate-500 block mt-1">
            ${reversedAmount.toFixed(2)}
          </span>
          <span className="text-[11px] text-content-muted mt-0.5 block">
            {reversedPayments.length} cancelled transactions
          </span>
        </div>

        <div className="p-4 rounded-brand bg-white border border-border-subtle shadow-subtle">
          <span className="text-xs font-semibold uppercase tracking-wider text-content-muted block">
            Total Transactions
          </span>
          <span className="text-2xl font-heading font-bold text-navy block mt-1">
            {payments.length}
          </span>
          <span className="text-[11px] text-content-muted mt-0.5 block">
            Offline manual ledger
          </span>
        </div>
      </div>

      {/* Demo Notice */}
      <div className="p-4 bg-amber-50 rounded-brand border border-amber-200 text-xs text-amber-900 mb-6 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <strong>Financial Simulation Boundary:</strong> No real payment gateway or credit card processor is connected. These records represent simulated office manual verification of bank transfer vouchers or in-store cash receipts.
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-brand border border-border-subtle shadow-subtle mb-6 grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by receipt ref, payer name, or registration ID..."
            className="w-full h-10 pl-9 pr-4 text-xs sm:text-sm rounded-brand border border-border-subtle focus:outline-none focus:ring-2 focus:ring-navy"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-10 px-3 text-xs sm:text-sm rounded-brand border border-border-subtle bg-white text-content-body focus:outline-none focus:ring-2 focus:ring-navy"
          >
            <option value="ALL">All Payment Statuses ({payments.length})</option>
            <option value="verified">Verified ({verifiedPayments.length})</option>
            <option value="pending">Pending Check ({pendingPayments.length})</option>
            <option value="reversed">Reversed ({reversedPayments.length})</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredPayments}
        keyExtractor={(item) => item.id}
        emptyTitle="No Payments Match Filters"
        emptyDescription="Adjust your search terms or status filter."
      />

      {/* Reverse Modal */}
      <Modal
        isOpen={isReverseModalOpen}
        onClose={() => setIsReverseModalOpen(false)}
        title={`Reverse Payment: ${selectedPayment?.receiptRef}`}
        description="Record an adjustment reason to reverse a verified payment."
      >
        <form onSubmit={handleConfirmReverse} className="space-y-4">
          <FormField label="Reversal Reason" required>
            <Textarea
              rows={3}
              value={reverseReason}
              onChange={(e) => setReverseReason(e.target.value)}
              placeholder="e.g. Bank chargeback, disputed store voucher, or customer cancellation..."
              required
            />
          </FormField>
          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => setIsReverseModalOpen(false)} variant="outline" size="md">
              Cancel
            </Button>
            <Button type="submit" variant="danger" size="md">
              Confirm Reversal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
