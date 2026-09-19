import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/admin/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { useApp } from '../../context/AppContext';
import { Payout } from '../../types';
import { PiggyBank, ArrowRight, Store } from 'lucide-react';

export const PayoutsListPage: React.FC = () => {
  const { payouts, vendors, commissions } = useApp();

  const columns: Column<Payout>[] = [
    {
      key: 'payoutRef',
      header: 'Payout Reference',
      render: (p) => (
        <span className="font-mono font-bold text-navy text-sm block">
          {p.payoutRef}
        </span>
      ),
    },
    {
      key: 'vendor',
      header: 'Vendor Partner',
      render: (p) => {
        const vendor = vendors.find((v) => v.id === p.vendorId);
        return (
          <div>
            <Link to={`/admin/vendors/${p.vendorId}`} className="font-semibold text-navy hover:underline text-xs sm:text-sm block">
              {vendor?.shopName || p.vendorId}
            </Link>
            <span className="text-xs text-content-muted">{vendor?.branch}</span>
          </div>
        );
      },
    },
    {
      key: 'commissions',
      header: 'Included Commissions',
      render: (p) => (
        <div className="text-xs">
          <span className="font-semibold text-navy">{p.commissionIds.length} entry(s)</span>
          <span className="text-[11px] text-content-muted block truncate max-w-xs">
            {p.commissionIds.join(', ')}
          </span>
        </div>
      ),
    },
    {
      key: 'totalAmount',
      header: 'Batch Total',
      render: (p) => (
        <span className="font-mono font-bold text-sm text-[#088F5B]">
          ${p.totalAmount.toFixed(2)} USD
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Payout Date',
      render: (p) => <span className="text-xs text-content-body">{p.payoutDate}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: () => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-mint-pale text-mint-darker border border-emerald-300">
          Simulated Complete
        </span>
      ),
    },
    {
      key: 'notes',
      header: 'Notes',
      render: (p) => <span className="text-xs text-content-muted">{p.notes || '—'}</span>,
    },
  ];

  const totalDisbursed = payouts.reduce((sum, p) => sum + p.totalAmount, 0);
  const uniqueVendorsPaid = new Set(payouts.map(p => p.vendorId)).size;

  return (
    <div>
      <PageHeader
        title="Vendor Commission Payout Records"
        description="Historical demonstration logs of batched vendor commission settlements."
        actions={
          <Link
            to="/admin/commissions"
            className="px-3.5 py-2 text-xs font-heading font-semibold text-navy bg-mint-pale hover:bg-mint/40 rounded-brand border border-emerald-300/60 transition-colors inline-flex items-center gap-1.5"
          >
            <PiggyBank className="w-4 h-4 text-[#088F5B]" />
            <span>Go to Commissions Queue</span>
          </Link>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-brand bg-white border border-border-subtle shadow-subtle">
          <span className="text-xs font-semibold uppercase tracking-wider text-content-muted block">
            Settlement Batches
          </span>
          <span className="text-2xl font-heading font-bold text-navy block mt-1">
            {payouts.length}
          </span>
          <span className="text-[11px] text-content-muted mt-0.5 block">
            Completed payout runs
          </span>
        </div>

        <div className="p-4 rounded-brand bg-white border border-border-subtle shadow-subtle">
          <span className="text-xs font-semibold uppercase tracking-wider text-content-muted block">
            Total Capital Settled
          </span>
          <span className="text-2xl font-heading font-bold text-[#088F5B] block mt-1">
            ${totalDisbursed.toFixed(2)} USD
          </span>
          <span className="text-[11px] text-content-muted mt-0.5 block">
            Distributed to retail partners
          </span>
        </div>

        <div className="p-4 rounded-brand bg-white border border-border-subtle shadow-subtle">
          <span className="text-xs font-semibold uppercase tracking-wider text-content-muted block">
            Retailers Paid
          </span>
          <span className="text-2xl font-heading font-bold text-navy block mt-1">
            {uniqueVendorsPaid}
          </span>
          <span className="text-[11px] text-content-muted mt-0.5 block">
            Unique vendor partners
          </span>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={payouts}
        keyExtractor={(item) => item.id}
        emptyTitle="No Payouts Processed"
        emptyDescription="Approve eligible vendor commissions and create a simulated payout from the Commissions queue."
      />
    </div>
  );
};
