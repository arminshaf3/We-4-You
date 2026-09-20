import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/admin/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useApp } from '../../context/AppContext';
import { Registration, RegistrationStatus } from '../../types';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

export const RegistrationsListPage: React.FC = () => {
  const { registrations, vendors } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [vendorFilter, setVendorFilter] = useState<string>('ALL');

  const pendingCount = useMemo(() => registrations.filter(r => r.status === 'pending_verification').length, [registrations]);
  const updateReqCount = useMemo(() => registrations.filter(r => r.status === 'update_requested').length, [registrations]);
  const approvedCount = useMemo(() => registrations.filter(r => r.status === 'approved').length, [registrations]);
  const rejectedCount = useMemo(() => registrations.filter(r => r.status === 'rejected').length, [registrations]);

  const filteredRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
      const matchesSearch =
        reg.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.guardian.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reg.bandCode.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || reg.status === statusFilter;
      const matchesVendor = vendorFilter === 'ALL' || reg.vendorId === vendorFilter;

      return matchesSearch && matchesStatus && matchesVendor;
    });
  }, [registrations, searchTerm, statusFilter, vendorFilter]);

  const columns: Column<Registration>[] = [
    {
      key: 'referenceNumber',
      header: 'Reference',
      render: (reg) => (
        <Link
          to={`/admin/registrations/${reg.id}`}
          className="font-mono font-bold text-navy hover:underline text-xs sm:text-sm"
        >
          {reg.referenceNumber}
        </Link>
      ),
    },
    {
      key: 'child',
      header: 'Wearer / Member',
      render: (reg) => (
        <div>
          <span className="font-semibold text-navy block">{reg.child.name}</span>
          <span className="text-xs text-content-muted">{reg.child.ageRange || 'Category not given'}</span>
        </div>
      ),
    },
    {
      key: 'guardian',
      header: 'Primary Contact',
      render: (reg) => (
        <div>
          <span className="font-medium text-navy block">{reg.guardian.fullName}</span>
          <span className="text-xs text-content-muted">
            {reg.guardian.relationship} &bull; {reg.guardian.mobile}
          </span>
        </div>
      ),
    },
    {
      key: 'bandCode',
      header: 'Band Code',
      render: (reg) => (
        <span className="font-mono font-bold text-xs bg-mint-pale text-navy px-2 py-0.5 rounded border border-emerald-300 inline-block">
          {reg.bandCode}
        </span>
      ),
    },
    {
      key: 'vendor',
      header: 'Vendor Shop',
      render: (reg) => {
        const vendor = vendors.find((v) => v.id === reg.vendorId);
        return (
          <span className="text-xs text-content-body truncate max-w-[150px] block">
            {vendor ? `${vendor.shopName} (${vendor.branch})` : 'Direct We 4 You'}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Review Status',
      render: (reg) => <StatusBadge status={reg.status} size="sm" />,
    },
    {
      key: 'paymentStatus',
      header: 'Payment',
      render: (reg) => <StatusBadge status={reg.paymentStatus} size="sm" />,
    },
    {
      key: 'actions',
      header: 'Action',
      className: 'text-right',
      render: (reg) => (
        <Link
          to={`/admin/registrations/${reg.id}`}
          className="px-3 py-1.5 text-xs font-heading font-semibold text-navy bg-mint-pale hover:bg-mint/40 rounded-brand border border-emerald-300/60 transition-colors inline-block"
        >
          Review
        </Link>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Registration Review Queue"
        description="Verify emergency contact authority, check band references, and manage activation eligibility."
      />

      {/* Queue Stat Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-3 mb-4">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            statusFilter === 'ALL'
              ? 'bg-navy text-white shadow-sm'
              : 'bg-white text-content-body hover:bg-slate-100 border border-border-subtle'
          }`}
        >
          <span>All Registrations</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {registrations.length}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('pending_verification')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            statusFilter === 'pending_verification'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'bg-white text-amber-800 hover:bg-amber-50 border border-amber-200'
          }`}
        >
          <span>Pending Review</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === 'pending_verification' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900 font-bold'}`}>
            {pendingCount}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('update_requested')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            statusFilter === 'update_requested'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-blue-800 hover:bg-blue-50 border border-blue-200'
          }`}
        >
          <span>Update Requested</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === 'update_requested' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-900'}`}>
            {updateReqCount}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('approved')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            statusFilter === 'approved'
              ? 'bg-[#088F5B] text-white shadow-sm'
              : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200'
          }`}
        >
          <span>Approved</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === 'approved' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-900'}`}>
            {approvedCount}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('rejected')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            statusFilter === 'rejected'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-white text-rose-800 hover:bg-rose-50 border border-rose-200'
          }`}
        >
          <span>Rejected</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === 'rejected' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-900'}`}>
            {rejectedCount}
          </span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-brand border border-border-subtle shadow-subtle mb-6 grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Search */}
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by wearer, contact, band, or reference..."
            className="w-full h-10 pl-9 pr-4 text-xs sm:text-sm rounded-brand border border-border-subtle focus:outline-none focus:ring-2 focus:ring-navy"
          />
        </div>

        {/* Status Filter */}
        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-10 px-3 text-xs sm:text-sm rounded-brand border border-border-subtle bg-white text-content-body focus:outline-none focus:ring-2 focus:ring-navy"
          >
            <option value="ALL">All Review Statuses</option>
            <option value="pending_verification">Pending Verification</option>
            <option value="update_requested">Update Requested</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Vendor Filter */}
        <div className="sm:col-span-3">
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
            <option value="DIRECT">Direct Office</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredRegistrations}
        keyExtractor={(item) => item.id}
        emptyTitle="No Registrations Match Filters"
        emptyDescription="Try adjusting your search keywords or status filter options."
        mobileCardRender={(reg) => (
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <Link to={`/admin/registrations/${reg.id}`} className="font-mono font-bold text-navy text-sm">
                {reg.referenceNumber}
              </Link>
              <StatusBadge status={reg.status} size="sm" />
            </div>
            <div>
              <span className="font-semibold text-navy block text-sm">{reg.child.name}</span>
              <span className="text-content-muted">
                Contact: {reg.guardian.fullName} ({reg.guardian.mobile})
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
              <span className="font-mono font-bold bg-mint-pale px-2 py-0.5 rounded text-navy">
                {reg.bandCode}
              </span>
              <Link
                to={`/admin/registrations/${reg.id}`}
                className="font-semibold text-navy hover:underline"
              >
                Review Registration →
              </Link>
            </div>
          </div>
        )}
      />
    </div>
  );
};
