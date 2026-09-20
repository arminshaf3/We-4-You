import React, { useState, useMemo } from 'react';
import { PageHeader } from '../../components/admin/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { FormField, Input, Textarea } from '../../components/common/FormField';
import { useApp } from '../../context/AppContext';
import { Payment } from '../../types';
import { Receipt, CheckCircle, RotateCcw, AlertCircle, Search, CreditCard, Sparkles, Printer } from 'lucide-react';

export const PaymentsListPage: React.FC = () => {
  const { payments, verifyPayment, reversePayment } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [methodFilter, setMethodFilter] = useState('ALL');

  const [isReverseModalOpen, setIsReverseModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [reverseReason, setReverseReason] = useState('');

  const verifiedPayments = useMemo(() => payments.filter((p) => p.status === 'verified'), [payments]);
  const cardPayments = useMemo(() => payments.filter((p) => p.method === 'card'), [payments]);
  const pendingPayments = useMemo(() => payments.filter((p) => p.status === 'pending'), [payments]);
  const reversedPayments = useMemo(() => payments.filter((p) => p.status === 'reversed'), [payments]);

  const verifiedAmount = useMemo(() => verifiedPayments.reduce((sum, p) => sum + p.amount, 0), [verifiedPayments]);
  const cardAmount = useMemo(() => cardPayments.reduce((sum, p) => sum + p.amount, 0), [cardPayments]);
  const pendingAmount = useMemo(() => pendingPayments.reduce((sum, p) => sum + p.amount, 0), [pendingPayments]);
  const reversedAmount = useMemo(() => reversedPayments.reduce((sum, p) => sum + p.amount, 0), [reversedPayments]);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchesSearch =
        !searchTerm.trim() ||
        p.receiptRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.payerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.registrationId && p.registrationId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.transactionId && p.transactionId.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
      const matchesMethod =
        methodFilter === 'ALL' ||
        (methodFilter === 'card' && p.method === 'card') ||
        (methodFilter === 'offline' && p.method !== 'card');

      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [payments, searchTerm, statusFilter, methodFilter]);

  const handleOpenReverse = (payment: Payment) => {
    setSelectedPayment(payment);
    setReverseReason('');
    setIsReverseModalOpen(true);
  };

  const handleOpenReceipt = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsReceiptModalOpen(true);
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
          <button
            onClick={() => handleOpenReceipt(p)}
            className="font-mono font-bold text-navy text-sm hover:underline text-left block"
          >
            {p.receiptRef}
          </button>
          {p.transactionId ? (
            <span className="font-mono text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 block truncate max-w-[160px] mt-0.5">
              TXN: {p.transactionId}
            </span>
          ) : (
            <span className="text-[11px] text-content-muted">ID: {p.id}</span>
          )}
        </div>
      ),
    },
    {
      key: 'method',
      header: 'Payment Method',
      render: (p) => {
        if (p.method === 'card') {
          return (
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <CreditCard className="w-3.5 h-3.5 text-[#088F5B]" />
                {p.cardDetails?.brand || 'Card'} •••• {p.cardDetails?.last4 || '4242'}
              </span>
            </div>
          );
        }
        return (
          <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
            Store / Offline Voucher
          </span>
        );
      },
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
      header: 'Amount',
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
      header: 'Action',
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
            <div className="flex items-center justify-end gap-1.5">
              <Button
                onClick={() => handleOpenReceipt(p)}
                variant="outline"
                size="sm"
              >
                Receipt
              </Button>
              <Button
                onClick={() => handleOpenReverse(p)}
                variant="ghost"
                size="sm"
                className="text-slate-500 hover:text-red-600"
              >
                Reverse
              </Button>
            </div>
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
        description="Monitor online credit card payments, instant authorizations, and offline manual voucher verifications."
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-brand bg-white border border-border-subtle shadow-subtle">
          <span className="text-xs font-semibold uppercase tracking-wider text-content-muted block">
            Card Payments (Confirmed)
          </span>
          <span className="text-2xl font-heading font-bold text-[#088F5B] block mt-1">
            ${cardAmount.toFixed(2)}
          </span>
          <span className="text-[11px] text-content-muted mt-0.5 block">
            {cardPayments.length} instant card authorizations
          </span>
        </div>

        <div className="p-4 rounded-brand bg-white border border-border-subtle shadow-subtle">
          <span className="text-xs font-semibold uppercase tracking-wider text-content-muted block">
            Total Verified Receipts
          </span>
          <span className="text-2xl font-heading font-bold text-navy block mt-1">
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
      </div>

      {/* Instant Card Guarantee Strip */}
      <div className="p-4 bg-emerald-50/70 rounded-brand border border-emerald-300/60 text-xs text-emerald-950 mb-6 flex items-start gap-2.5 shadow-sm">
        <Sparkles className="w-4 h-4 text-[#088F5B] flex-shrink-0 mt-0.5" />
        <div>
          <strong>Online Card Processing Enabled:</strong> Subscriptions paid with Credit/Debit cards are verified immediately on submission and marked as <em>verified</em> with generated transaction IDs.
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-brand border border-border-subtle shadow-subtle mb-6 grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by receipt ref, transaction ID, payer, or reg ID..."
            className="w-full h-10 pl-9 pr-4 text-xs sm:text-sm rounded-brand border border-border-subtle focus:outline-none focus:ring-2 focus:ring-navy"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="w-full h-10 px-3 text-xs sm:text-sm rounded-brand border border-border-subtle bg-white text-content-body focus:outline-none focus:ring-2 focus:ring-navy"
          >
            <option value="ALL">All Payment Methods</option>
            <option value="card">Credit / Debit Card (Instant)</option>
            <option value="offline">Offline Store Voucher / Transfer</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-10 px-3 text-xs sm:text-sm rounded-brand border border-border-subtle bg-white text-content-body focus:outline-none focus:ring-2 focus:ring-navy"
          >
            <option value="ALL">All Statuses ({payments.length})</option>
            <option value="verified">Verified ({verifiedPayments.length})</option>
            <option value="pending">Pending ({pendingPayments.length})</option>
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

      {/* View Full Receipt Modal */}
      <Modal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        title={`Payment Receipt: ${selectedPayment?.receiptRef}`}
        description="Official payment confirmation record and transaction audit details."
      >
        {selectedPayment && (
          <div className="space-y-4">
            <div className="bg-neutral-soft p-4 rounded-brand border border-border-subtle text-xs space-y-2.5">
              <div className="flex justify-between items-center pb-2 border-b border-border-subtle">
                <span className="font-semibold text-navy">Receipt Reference:</span>
                <span className="font-mono font-bold text-navy text-sm">{selectedPayment.receiptRef}</span>
              </div>
              {selectedPayment.transactionId && (
                <div className="flex justify-between items-center">
                  <span className="text-content-muted">Transaction ID:</span>
                  <span className="font-mono font-semibold text-navy">{selectedPayment.transactionId}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-content-muted">Payment Type:</span>
                <span className="uppercase font-semibold text-slate-700">{selectedPayment.type.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-content-muted">Payment Method:</span>
                <span className="font-semibold text-navy">
                  {selectedPayment.method === 'card'
                    ? `${selectedPayment.cardDetails?.brand || 'Card'} ending ${selectedPayment.cardDetails?.last4 || '4242'}`
                    : 'Offline Store Voucher'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-content-muted">Payer / Guardian:</span>
                <span className="font-semibold text-navy">{selectedPayment.payerName}</span>
              </div>
              {selectedPayment.registrationId && (
                <div className="flex justify-between items-center">
                  <span className="text-content-muted">Registration Link:</span>
                  <span className="font-mono font-semibold text-navy">{selectedPayment.registrationId}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-content-muted">Recorded Date:</span>
                <span>{selectedPayment.paymentDate}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-border-subtle">
                <span className="font-bold text-navy">Total Amount:</span>
                <span className="font-heading font-bold text-[#088F5B] text-base">
                  ${selectedPayment.amount.toFixed(2)} {selectedPayment.currency}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-content-muted">Status:</span>
                <StatusBadge status={selectedPayment.status} size="sm" />
              </div>
              {selectedPayment.notes && (
                <div className="pt-2 text-slate-600 border-t border-border-subtle">
                  <span className="font-semibold block mb-0.5">Notes:</span>
                  <p className="italic bg-white p-2 rounded border border-border-subtle">{selectedPayment.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button onClick={() => window.print()} variant="outline" size="sm" leftIcon={<Printer className="w-3.5 h-3.5" />}>
                Print
              </Button>
              <Button onClick={() => setIsReceiptModalOpen(false)} variant="primary" size="sm">
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

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
              placeholder="e.g. Bank chargeback, customer cancellation, or mistaken entry..."
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
