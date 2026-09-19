import React, { useState, useMemo } from 'react';
import { PageHeader } from '../../components/admin/PageHeader';
import { Button } from '../../components/common/Button';
import { useApp } from '../../context/AppContext';
import {
  Download,
  BarChart3,
  Filter,
  DollarSign,
  Receipt,
  Store,
  PiggyBank,
  CheckCircle,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { payments, commissions, payouts, vendors, childrenRecords } = useApp();

  const [vendorFilter, setVendorFilter] = useState('ALL');

  // Filtered calculations
  const filteredCommissions = useMemo(() => {
    if (vendorFilter === 'ALL') return commissions;
    return commissions.filter((c) => c.vendorId === vendorFilter);
  }, [commissions, vendorFilter]);

  const filteredPayouts = useMemo(() => {
    if (vendorFilter === 'ALL') return payouts;
    return payouts.filter((p) => p.vendorId === vendorFilter);
  }, [payouts, vendorFilter]);

  // Aggregate Figures
  const verifiedPaymentsTotal = payments
    .filter((p) => p.status === 'verified')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingPaymentsTotal = payments
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalCommissionsEarned = filteredCommissions.reduce(
    (sum, c) => sum + c.commissionAmount,
    0
  );

  const totalPayoutsSettled = filteredPayouts.reduce(
    (sum, p) => sum + p.totalAmount,
    0
  );

  // Demo CSV Export
  const handleExportCSV = () => {
    const headers = ['Type', 'Identifier', 'Date', 'Vendor_Attribution', 'Amount_USD', 'Status'];
    const rows: string[][] = [];

    // Add Payments
    payments.forEach((p) => {
      rows.push(['Payment', p.receiptRef, p.paymentDate, p.payerName, p.amount.toFixed(2), p.status]);
    });

    // Add Commissions
    commissions.forEach((c) => {
      const v = vendors.find((vend) => vend.id === c.vendorId);
      rows.push(['Commission', c.id, c.createdAt, v?.shopName || c.vendorId, c.commissionAmount.toFixed(2), c.status]);
    });

    // Add Payouts
    payouts.forEach((po) => {
      const v = vendors.find((vend) => vend.id === po.vendorId);
      rows.push(['Payout_Batch', po.payoutRef, po.payoutDate, v?.shopName || po.vendorId, po.totalAmount.toFixed(2), 'simulated_completed']);
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `we4you_demonstration_report_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <PageHeader
        title="Operational &amp; Financial Summaries"
        description="Distinguish subscription receipts, vendor commission accruals, and processed payouts with transparency."
        actions={
          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export Demonstration CSV
          </Button>
        }
      />

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-brand border border-border-subtle shadow-subtle mb-8 max-w-sm">
        <label className="text-xs font-semibold text-content-muted block mb-1.5">
          Filter by Retail Vendor Shop:
        </label>
        <select
          value={vendorFilter}
          onChange={(e) => setVendorFilter(e.target.value)}
          className="w-full h-10 px-3 text-xs sm:text-sm rounded-brand border border-border-subtle bg-white text-navy font-medium focus:outline-none focus:ring-2 focus:ring-navy"
        >
          <option value="ALL">All Vendor Shops &amp; Central Sales</option>
          {vendors.map((v) => (
            <option key={v.id} value={v.id}>
              {v.shopName} ({v.branch})
            </option>
          ))}
        </select>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        {/* Verified Receipts */}
        <div className="p-5 rounded-brand bg-white border border-border-subtle shadow-subtle">
          <span className="text-xs font-semibold uppercase tracking-wider text-content-muted block">
            Verified Customer Receipts
          </span>
          <span className="text-2xl font-heading font-bold text-navy block mt-2">
            ${verifiedPaymentsTotal.toFixed(2)} USD
          </span>
          <span className="text-[11px] text-content-muted mt-1 block">
            From verified subscription registrations
          </span>
        </div>

        {/* Pending Receipts */}
        <div className="p-5 rounded-brand bg-white border border-border-subtle shadow-subtle">
          <span className="text-xs font-semibold uppercase tracking-wider text-content-muted block">
            Pending Payment Receipts
          </span>
          <span className="text-2xl font-heading font-bold text-amber-700 block mt-2">
            ${pendingPaymentsTotal.toFixed(2)} USD
          </span>
          <span className="text-[11px] text-content-muted mt-1 block">
            Awaiting manual store/bank receipt check
          </span>
        </div>

        {/* Commissions Earned */}
        <div className="p-5 rounded-brand bg-white border border-border-subtle shadow-subtle">
          <span className="text-xs font-semibold uppercase tracking-wider text-content-muted block">
            Commissions Earned
          </span>
          <span className="text-2xl font-heading font-bold text-slate-800 block mt-2">
            ${totalCommissionsEarned.toFixed(2)} USD
          </span>
          <span className="text-[11px] text-content-muted mt-1 block">
            Accrued across {filteredCommissions.length} sale attributions
          </span>
        </div>

        {/* Payouts Settled */}
        <div className="p-5 rounded-brand bg-white border border-border-subtle shadow-subtle">
          <span className="text-xs font-semibold uppercase tracking-wider text-content-muted block">
            Settled Payouts
          </span>
          <span className="text-2xl font-heading font-bold text-[#088F5B] block mt-2">
            ${totalPayoutsSettled.toFixed(2)} USD
          </span>
          <span className="text-[11px] text-content-muted mt-1 block">
            Simulated batches released to vendors
          </span>
        </div>

      </div>

      {/* Detailed Operations Tables */}
      <div className="space-y-8">
        
        {/* Vendor Commission Breakdown Table */}
        <div className="bg-white rounded-brand border border-border-subtle shadow-subtle overflow-hidden">
          <div className="p-4 border-b border-border-subtle">
            <h3 className="text-base font-heading font-bold text-navy">
              Vendor Attribution &amp; Settlement Breakdown
            </h3>
          </div>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-soft border-b border-border-subtle font-semibold text-navy">
                <tr>
                  <th className="p-3">Vendor Shop</th>
                  <th className="p-3">Branch</th>
                  <th className="p-3">Commission Rule</th>
                  <th className="p-3">Total Earned</th>
                  <th className="p-3">Total Paid</th>
                  <th className="p-3">Pending Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {vendors.map((v) => {
                  const vComms = commissions.filter((c) => c.vendorId === v.id);
                  const earned = vComms.reduce((s, c) => s + c.commissionAmount, 0);
                  const paid = vComms
                    .filter((c) => c.status === 'paid')
                    .reduce((s, c) => s + c.commissionAmount, 0);
                  const balance = earned - paid;

                  return (
                    <tr key={v.id} className="hover:bg-neutral-soft/50">
                      <td className="p-3 font-semibold text-navy">{v.shopName}</td>
                      <td className="p-3 text-content-muted">{v.branch}</td>
                      <td className="p-3">
                        {v.commissionType === 'percentage' ? `${v.commissionRate}%` : `$${v.commissionRate}.00 fixed`}
                      </td>
                      <td className="p-3 font-mono font-semibold">${earned.toFixed(2)}</td>
                      <td className="p-3 font-mono text-[#088F5B]">${paid.toFixed(2)}</td>
                      <td className="p-3 font-mono font-bold text-amber-700">
                        ${balance.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Operating Disclaimer */}
        <div className="p-4 bg-slate-50 rounded-brand border border-slate-200 text-xs text-content-muted leading-relaxed">
          <strong>Accounting Notice:</strong> This summary derives numbers from simulated front-end records. Net profitability is not asserted from receipts alone, as operational overhead and staff costs are not calculated in this demonstration scope.
        </div>

      </div>
    </div>
  );
};
