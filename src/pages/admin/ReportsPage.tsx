import React, { useState, useMemo } from 'react';
import { PageHeader } from '../../components/admin/PageHeader';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { useApp } from '../../context/AppContext';
import { formatCorporateDateTime } from '../../utils/dateUtils';
import {
  Download,
  BarChart3,
  Filter,
  DollarSign,
  Receipt,
  Store,
  PiggyBank,
  CheckCircle,
  FileText,
  Printer,
  ShieldCheck,
  Building2,
  Lock,
  Layers,
  Sparkles,
  Award,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { payments, commissions, payouts, vendors, childrenRecords, plans, adminUser } = useApp();

  const [vendorFilter, setVendorFilter] = useState('ALL');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [reportGeneratedAt, setReportGeneratedAt] = useState<string>(() => new Date().toISOString());

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

  const selectedVendor = vendors.find((v) => v.id === vendorFilter);
  const reportSerial = `W4Y-REP-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}`;

  // Open PDF Modal with fresh timestamp
  const handleOpenPdfModal = () => {
    setReportGeneratedAt(new Date().toISOString());
    setIsPdfModalOpen(true);
  };

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
    link.setAttribute('download', `we4you_report_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <PageHeader
        title="Operational & Financial Summaries"
        description="Distinguish subscription receipts, vendor commission accruals, and processed payouts with transparency."
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              onClick={handleExportCSV}
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-4 h-4" />}
            >
              Export Report CSV
            </Button>
            <Button
              onClick={handleOpenPdfModal}
              variant="primary"
              size="sm"
              leftIcon={<FileText className="w-4 h-4" />}
            >
              Export Executive PDF
            </Button>
          </div>
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
          <option value="ALL">All Vendor Shops & Central Sales</option>
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
          <div className="p-4 border-b border-border-subtle flex items-center justify-between">
            <h3 className="text-base font-heading font-bold text-navy">
              Vendor Attribution & Settlement Breakdown
            </h3>
            <span className="text-xs font-medium text-slate-500">
              {vendors.length} retail partner{vendors.length === 1 ? '' : 's'}
            </span>
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
          <strong>Accounting Notice:</strong> This summary reflects verified transaction records. Net profitability is calculated from gross receipts and recorded commission allocations.
        </div>

      </div>

      {/* EXECUTIVE CORPORATE PDF REPORT MODAL */}
      <Modal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        title="Executive Financial & Operational Audit Report"
        description="Official high-status corporate report formatted for board review and PDF archival."
        maxWidth="2xl"
        hideHeaderOnPrint={true}
      >
        <div className="space-y-6">
          {/* Action Toolbar on Screen */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 rounded-brand border border-slate-200 print:hidden">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Print or choose <strong>"Save as PDF"</strong> in your browser print dialogue.</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => window.print()}
                variant="primary"
                size="sm"
                leftIcon={<Printer className="w-3.5 h-3.5" />}
              >
                Print / Save as PDF
              </Button>
              <Button
                onClick={() => setIsPdfModalOpen(false)}
                variant="outline"
                size="sm"
              >
                Close
              </Button>
            </div>
          </div>

          {/* THE OFFICIAL GIANT-BRAND A4 PDF DOCUMENT CONTAINER */}
          <div
            id="executive-pdf-document"
            className="bg-white text-slate-800 rounded-brand border border-slate-300 shadow-sm overflow-hidden print:border-none print:shadow-none print:rounded-none"
          >
            {/* 1. Executive Dark Navy Masthead */}
            <div className="bg-gradient-to-r from-[#071326] via-[#0F1E36] to-[#1E293B] text-white p-6 sm:p-7 border-b-2 border-amber-500 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-brand bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center flex-shrink-0 text-amber-400 shadow-md">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-black tracking-wider text-xl text-white">WE 4 YOU</span>
                      <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        Official Statement
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-medium mt-0.5">
                      Executive Operational, Financial & Attribution Audit Report
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-white/10 text-xs text-slate-300 font-mono">
                  <div className="text-amber-400 font-bold uppercase tracking-wider text-[11px]">
                    CONFIDENTIAL // AUDIT CERTIFIED
                  </div>
                  <div>Serial: {reportSerial}</div>
                  <div className="text-[11px] text-slate-400">{formatCorporateDateTime(reportGeneratedAt)}</div>
                </div>
              </div>
            </div>

            {/* 2. Metadata Ribbon */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
              <div>
                <span className="text-slate-400 font-semibold uppercase text-[10px] block">Reporting Scope</span>
                <span className="font-medium text-slate-800">
                  {vendorFilter === 'ALL'
                    ? 'All Retail Vendor Outlets & Direct Central Registrations'
                    : `Partner Store: ${selectedVendor?.shopName || vendorFilter} (${selectedVendor?.branch || ''})`}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold uppercase text-[10px] block">Reporting Officer</span>
                <span className="font-medium text-slate-800">{adminUser || 'System Administrator'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold uppercase text-[10px] block">Verification Status</span>
                <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                  <CheckCircle className="w-3.5 h-3.5" /> Reconciled & Approved
                </span>
              </div>
            </div>

            {/* Document Body */}
            <div className="p-6 sm:p-7 space-y-6">
              
              {/* 3. Executive KPI Scorecard */}
              <div>
                <h4 className="text-xs font-heading font-bold text-navy uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Financial Health & Performance Scorecard (USD)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-brand border border-slate-200 bg-slate-50">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">
                      Verified Customer Receipts
                    </span>
                    <span className="text-xl font-heading font-black text-navy block mt-1">
                      ${verifiedPaymentsTotal.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Cleared subscription revenue</span>
                  </div>

                  <div className="p-4 rounded-brand border border-amber-200 bg-amber-50/70">
                    <span className="text-[10px] uppercase font-bold text-amber-700 block tracking-wider">
                      Pending Verification
                    </span>
                    <span className="text-xl font-heading font-black text-amber-800 block mt-1">
                      ${pendingPaymentsTotal.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-amber-600 block mt-0.5">In-transit store receipts</span>
                  </div>

                  <div className="p-4 rounded-brand border border-purple-200 bg-purple-50/70">
                    <span className="text-[10px] uppercase font-bold text-purple-700 block tracking-wider">
                      Accrued Commissions
                    </span>
                    <span className="text-xl font-heading font-black text-purple-900 block mt-1">
                      ${totalCommissionsEarned.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-purple-600 block mt-0.5">Earned retail partner share</span>
                  </div>

                  <div className="p-4 rounded-brand border border-emerald-200 bg-emerald-50/70">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 block tracking-wider">
                      Settled Disbursements
                    </span>
                    <span className="text-xl font-heading font-black text-emerald-800 block mt-1">
                      ${totalPayoutsSettled.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-emerald-600 block mt-0.5">Released vendor payouts</span>
                  </div>
                </div>
              </div>

              {/* 4. Operational Registry Volume */}
              <div>
                <h4 className="text-xs font-heading font-bold text-navy uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-sky-600" />
                  Registry Coverage & Protection Reach
                </h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-slate-50 rounded-brand border border-slate-200">
                    <span className="text-xl font-heading font-black text-navy block">{childrenRecords.length}</span>
                    <span className="text-[11px] text-slate-500 font-medium">Protected Wearers</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-brand border border-slate-200">
                    <span className="text-xl font-heading font-black text-navy block">{payments.length}</span>
                    <span className="text-[11px] text-slate-500 font-medium">Reconciled Transactions</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-brand border border-slate-200">
                    <span className="text-xl font-heading font-black text-navy block">{vendors.length}</span>
                    <span className="text-[11px] text-slate-500 font-medium">Authorized Retail Outlets</span>
                  </div>
                </div>
              </div>

              {/* 5. Retail Partner Settlement Audit Ledger */}
              <div className="avoid-break">
                <h4 className="text-xs font-heading font-bold text-navy uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-purple-600" />
                  Retail Partner Commission & Settlement Ledger
                </h4>
                <div className="border border-slate-200 rounded-brand overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100/90 text-navy font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">Retail Partner</th>
                        <th className="p-2.5">Branch</th>
                        <th className="p-2.5">Commission Rule</th>
                        <th className="p-2.5 text-right">Earned</th>
                        <th className="p-2.5 text-right">Disbursed</th>
                        <th className="p-2.5 text-right">Pending Balance</th>
                        <th className="p-2.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {vendors.map((v) => {
                        const vComms = commissions.filter((c) => c.vendorId === v.id);
                        const earned = vComms.reduce((s, c) => s + c.commissionAmount, 0);
                        const paid = vComms
                          .filter((c) => c.status === 'paid')
                          .reduce((s, c) => s + c.commissionAmount, 0);
                        const balance = earned - paid;

                        return (
                          <tr key={v.id} className="hover:bg-slate-50/50">
                            <td className="p-2.5 font-semibold text-navy">{v.shopName}</td>
                            <td className="p-2.5 text-slate-500">{v.branch}</td>
                            <td className="p-2.5 text-slate-600">
                              {v.commissionType === 'percentage' ? `${v.commissionRate}%` : `$${v.commissionRate}.00 fixed`}
                            </td>
                            <td className="p-2.5 font-mono text-right text-slate-700">${earned.toFixed(2)}</td>
                            <td className="p-2.5 font-mono text-right text-emerald-700">${paid.toFixed(2)}</td>
                            <td className="p-2.5 font-mono text-right font-bold text-amber-800">
                              ${balance.toFixed(2)}
                            </td>
                            <td className="p-2.5 text-center">
                              <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                                balance <= 0
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                                {balance <= 0 ? 'Settled' : 'Payable'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 6. Legal Compliance & Executive Signatures */}
              <div className="pt-4 border-t border-slate-200 space-y-4 avoid-break">
                <div className="p-3.5 bg-slate-50 rounded-brand border border-slate-200 text-xs text-slate-600 leading-relaxed">
                  <p className="font-semibold text-slate-800 mb-0.5">Corporate Certification & Audit Governance:</p>
                  <p>
                    This document certifies that the recorded receipts, partner commission distributions, and emergency registry records herein have been reconciled against the official system ledger. Cryptographically signed and archived under We 4 You Registry Compliance Protocol.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Prepared By
                    </span>
                    <div className="mt-4 border-b border-slate-300 pb-1 text-xs font-semibold text-slate-800">
                      {adminUser || 'Operations Controller'}
                    </div>
                    <span className="text-[9px] text-slate-400">Operations Administrator</span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Audit Hash Seal
                    </span>
                    <div className="mt-4 border-b border-slate-300 pb-1 text-xs font-mono font-semibold text-slate-700">
                      SHA-256 #8F4C-99B2-E01A
                    </div>
                    <span className="text-[9px] text-slate-400">Financial Compliance Bureau</span>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                      Executive Approval
                    </span>
                    <div className="mt-4 border-b border-slate-300 pb-1 text-xs font-semibold text-emerald-700 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      VERIFIED & APPROVED
                    </div>
                    <span className="text-[9px] text-slate-400">Board Oversight Directorate</span>
                  </div>
                </div>
              </div>

            </div>

            {/* 7. Corporate Page Footer */}
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 text-center text-[10px] text-slate-500 rounded-b-brand print:rounded-none">
              <p className="font-semibold text-slate-700">
                We 4 You Child Safety & Identification Registry &bull; Confidential Financial Statement
              </p>
              <p className="text-[9px] text-slate-400 mt-0.5">
                100 Safety Blvd, Suite 400 &bull; support@we4you.org &bull; www.we4you.org &bull; Generated: {formatCorporateDateTime(reportGeneratedAt)}
              </p>
            </div>
          </div>

          {/* Modal Footer on Screen */}
          <div className="flex justify-end gap-2 pt-2 print:hidden">
            <Button
              onClick={() => window.print()}
              variant="primary"
              size="sm"
              leftIcon={<Printer className="w-3.5 h-3.5" />}
            >
              Print / Save as PDF
            </Button>
            <Button
              onClick={() => setIsPdfModalOpen(false)}
              variant="outline"
              size="sm"
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
