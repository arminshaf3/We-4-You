import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/admin/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { useApp } from '../../context/AppContext';
import { ChildRecord } from '../../types';
import { Search, User, Phone, Radio, Shield } from 'lucide-react';

export const ChildrenListPage: React.FC = () => {
  const { childrenRecords, vendors, subscriptions } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredChildren = useMemo(() => {
    return childrenRecords.filter((child) => {
      return (
        child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        child.primaryGuardian.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        child.currentBandCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [childrenRecords, searchTerm]);

  const columns: Column<ChildRecord>[] = [
    {
      key: 'name',
      header: 'Child Record',
      render: (child) => (
        <Link to={`/admin/children/${child.id}`} className="font-semibold text-navy hover:underline text-sm block">
          {child.name}
          <span className="text-xs text-content-muted font-normal block">{child.ageRange}</span>
        </Link>
      ),
    },
    {
      key: 'primaryGuardian',
      header: 'Primary Guardian',
      render: (child) => (
        <div className="text-xs">
          <span className="font-semibold text-navy block">
            {child.primaryGuardian.fullName} ({child.primaryGuardian.relationship})
          </span>
          <span className="font-mono text-content-muted flex items-center gap-1 mt-0.5">
            <Phone className="w-3 h-3 text-[#088F5B]" />
            {child.primaryGuardian.mobile}
          </span>
        </div>
      ),
    },
    {
      key: 'secondaryGuardians',
      header: 'Emergency Contacts',
      render: (child) => (
        <span className="text-xs text-content-body">
          {child.secondaryGuardians.length > 0
            ? `${child.secondaryGuardians[0].fullName} (${child.secondaryGuardians[0].relationship})`
            : 'None specified'}
        </span>
      ),
    },
    {
      key: 'currentBandCode',
      header: 'Current Band',
      render: (child) => (
        <span className="font-mono font-bold text-xs bg-mint-pale text-navy px-2 py-0.5 rounded border border-emerald-300">
          {child.currentBandCode}
        </span>
      ),
    },
    {
      key: 'subscription',
      header: 'Subscription',
      render: (child) => {
        const sub = subscriptions.find((s) => s.id === child.subscriptionId);
        return (
          <span className="text-xs text-content-body">
            {sub ? `Active (Exp: ${sub.expiryDate})` : 'Pending Link'}
          </span>
        );
      },
    },
    {
      key: 'incidentsCount',
      header: 'Assistance Reports',
      render: (child) => (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          child.incidentsCount > 0 ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-600'
        }`}>
          {child.incidentsCount} reports
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      className: 'text-right',
      render: (child) => (
        <Link
          to={`/admin/children/${child.id}`}
          className="text-xs font-semibold text-navy hover:underline"
        >
          View Profile →
        </Link>
      ),
    },
  ];

  const activeBandsCount = useMemo(() => childrenRecords.filter(c => c.currentBandCode).length, [childrenRecords]);
  const multipleContactsCount = useMemo(() => childrenRecords.filter(c => c.secondaryGuardians && c.secondaryGuardians.length > 0).length, [childrenRecords]);
  const totalIncidentsCount = useMemo(() => childrenRecords.reduce((sum, c) => sum + (c.incidentsCount || 0), 0), [childrenRecords]);

  return (
    <div>
      <PageHeader
        title="Children &amp; Guardians Registry"
        description="Searchable fictional family profiles, emergency contact priority, and linked band assignments."
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-brand bg-white border border-border-subtle shadow-subtle">
          <span className="text-xs font-semibold uppercase tracking-wider text-content-muted block">
            Registered Children
          </span>
          <span className="text-2xl font-heading font-bold text-navy block mt-1">
            {childrenRecords.length}
          </span>
          <span className="text-[11px] text-content-muted mt-0.5 block">
            Approved guardian files
          </span>
        </div>

        <div className="p-4 rounded-brand bg-white border border-border-subtle shadow-subtle">
          <span className="text-xs font-semibold uppercase tracking-wider text-content-muted block">
            Active Band Links
          </span>
          <span className="text-2xl font-heading font-bold text-[#088F5B] block mt-1">
            {activeBandsCount}
          </span>
          <span className="text-[11px] text-content-muted mt-0.5 block">
            Direct QR/Phone protection
          </span>
        </div>

        <div className="p-4 rounded-brand bg-white border border-border-subtle shadow-subtle">
          <span className="text-xs font-semibold uppercase tracking-wider text-content-muted block">
            Backup Contacts
          </span>
          <span className="text-2xl font-heading font-bold text-navy block mt-1">
            {multipleContactsCount}
          </span>
          <span className="text-[11px] text-content-muted mt-0.5 block">
            Multi-guardian redundancy
          </span>
        </div>

        <div className="p-4 rounded-brand bg-white border border-border-subtle shadow-subtle">
          <span className="text-xs font-semibold uppercase tracking-wider text-content-muted block">
            Office Assistance Logs
          </span>
          <span className="text-2xl font-heading font-bold text-amber-700 block mt-1">
            {totalIncidentsCount}
          </span>
          <span className="text-[11px] text-content-muted mt-0.5 block">
            Reconnection incidents
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-brand border border-border-subtle shadow-subtle mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search child name, guardian, or band..."
            className="w-full h-10 pl-9 pr-4 text-xs sm:text-sm rounded-brand border border-border-subtle focus:outline-none focus:ring-2 focus:ring-navy"
          />
        </div>
        <div className="text-xs text-content-muted self-end sm:self-center">
          Showing <strong>{filteredChildren.length}</strong> of {childrenRecords.length} records
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredChildren}
        keyExtractor={(item) => item.id}
        emptyTitle="No Children Records Found"
        emptyDescription="Registrations approved by staff will automatically appear in this registry."
        mobileCardRender={(child) => (
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <Link to={`/admin/children/${child.id}`} className="font-bold text-navy text-sm">
                {child.name}
              </Link>
              <span className="font-mono font-bold bg-mint-pale text-navy px-2 py-0.5 rounded">
                {child.currentBandCode}
              </span>
            </div>
            <div className="text-content-muted">
              Primary: <strong>{child.primaryGuardian.fullName}</strong> ({child.primaryGuardian.mobile})
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
              <span>{child.incidentsCount} assistance reports</span>
              <Link to={`/admin/children/${child.id}`} className="font-semibold text-navy hover:underline">
                View Profile →
              </Link>
            </div>
          </div>
        )}
      />
    </div>
  );
};
