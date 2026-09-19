import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PageHeader } from '../../components/admin/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { FormField, Input, Select, Textarea } from '../../components/common/FormField';
import { useApp } from '../../context/AppContext';
import { Incident, IncidentReportType } from '../../types';
import { AlertTriangle, Plus, PhoneCall, Radio, User, MapPin, Search } from 'lucide-react';

export const IncidentsListPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { incidents, logIncident, bands, childrenRecords } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [bandRef, setBandRef] = useState('');
  const [reportType, setReportType] = useState<IncidentReportType>('child_found');
  const [callerName, setCallerName] = useState('');
  const [callerContact, setCallerContact] = useState('');
  const [locationStr, setLocationStr] = useState('');
  const [incidentNotes, setIncidentNotes] = useState('');

  const openCount = incidents.filter(i => i.status === 'open' || i.status === 'contacting_guardian').length;
  const resolvedCount = incidents.filter(i => i.status === 'resolved').length;
  const totalAttempts = incidents.reduce((sum, i) => sum + i.attempts.length, 0);

  const filteredIncidents = incidents.filter((inc) => {
    const matchesSearch =
      !searchTerm.trim() ||
      inc.incidentRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.bandReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inc.callerName && inc.callerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (inc.voluntaryLocation && inc.voluntaryLocation.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' ||
      inc.status === statusFilter ||
      (statusFilter === 'ACTIVE' && (inc.status === 'open' || inc.status === 'contacting_guardian'));

    return matchesSearch && matchesStatus;
  });

  // Handle URL query parameters (e.g. ?new=true&band=W4Y-1082-M4 from Band Lookup)
  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setIsNewModalOpen(true);
      const prefillBand = searchParams.get('band');
      if (prefillBand) setBandRef(prefillBand);
    }
  }, [searchParams]);

  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bandRef.trim() || !incidentNotes.trim()) return;

    logIncident({
      bandReference: bandRef.toUpperCase().trim(),
      reportType,
      callerName: callerName.trim() || undefined,
      callerContact: callerContact.trim() || undefined,
      voluntaryLocation: locationStr.trim() || undefined,
      notes: incidentNotes.trim(),
      assignedStaff: 'Staff Coordinator (Morgan)',
    });

    setIsNewModalOpen(false);
    setBandRef('');
    setCallerName('');
    setCallerContact('');
    setLocationStr('');
    setIncidentNotes('');
  };

  const columns: Column<Incident>[] = [
    {
      key: 'incidentRef',
      header: 'Incident ID',
      render: (inc) => (
        <Link to={`/admin/incidents/${inc.id}`} className="font-mono font-bold text-navy hover:underline text-xs sm:text-sm">
          {inc.incidentRef}
        </Link>
      ),
    },
    {
      key: 'bandReference',
      header: 'Band Reference',
      render: (inc) => (
        <span className="font-mono font-bold text-xs bg-mint-pale text-navy px-2 py-0.5 rounded border border-emerald-300">
          {inc.bandReference}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Report Type',
      render: (inc) => (
        <span className="text-xs font-semibold text-slate-700">
          {inc.reportType === 'child_found' ? 'Child with Finder' : 'Band Found Alone'}
        </span>
      ),
    },
    {
      key: 'caller',
      header: 'Caller / Location',
      render: (inc) => (
        <div className="text-xs">
          <span className="font-medium text-navy block">{inc.callerName || 'Anonymous caller'}</span>
          <span className="text-content-muted block truncate max-w-xs">{inc.voluntaryLocation || 'Location not reported'}</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (inc) => <StatusBadge status={inc.status} />,
    },
    {
      key: 'attempts',
      header: 'Contact Attempts',
      render: (inc) => (
        <span className="text-xs text-content-body">
          {inc.attempts.length} attempt(s)
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      className: 'text-right',
      render: (inc) => (
        <Link
          to={`/admin/incidents/${inc.id}`}
          className="px-3 py-1 text-xs font-semibold text-white bg-navy hover:bg-navy-light rounded-brand transition-colors"
        >
          Manage
        </Link>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Office Assistance Incidents"
        description="Active office telephone reports, finder intake, and guardian reconnection coordination."
        actions={
          <Button
            onClick={() => setIsNewModalOpen(true)}
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Log Office Report
          </Button>
        }
      />

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-brand bg-white border border-border-subtle shadow-subtle">
          <span className="text-xs font-semibold uppercase tracking-wider text-content-muted block">
            Active Reconnections
          </span>
          <span className="text-2xl font-heading font-bold text-rose-600 block mt-1">
            {openCount}
          </span>
          <span className="text-[11px] text-content-muted mt-0.5 block">
            Requiring urgent office coordination
          </span>
        </div>

        <div className="p-4 rounded-brand bg-white border border-border-subtle shadow-subtle">
          <span className="text-xs font-semibold uppercase tracking-wider text-content-muted block">
            Confirmed Reunited
          </span>
          <span className="text-2xl font-heading font-bold text-[#088F5B] block mt-1">
            {resolvedCount}
          </span>
          <span className="text-[11px] text-content-muted mt-0.5 block">
            Child safely back with guardians
          </span>
        </div>

        <div className="p-4 rounded-brand bg-white border border-border-subtle shadow-subtle">
          <span className="text-xs font-semibold uppercase tracking-wider text-content-muted block">
            Contact Attempts Logged
          </span>
          <span className="text-2xl font-heading font-bold text-navy block mt-1">
            {totalAttempts}
          </span>
          <span className="text-[11px] text-content-muted mt-0.5 block">
            Verified staff calls &amp; relays
          </span>
        </div>

        <div className="p-4 rounded-brand bg-white border border-border-subtle shadow-subtle">
          <span className="text-xs font-semibold uppercase tracking-wider text-content-muted block">
            Total Incident History
          </span>
          <span className="text-2xl font-heading font-bold text-slate-700 block mt-1">
            {incidents.length}
          </span>
          <span className="text-[11px] text-content-muted mt-0.5 block">
            All logged telephone intakes
          </span>
        </div>
      </div>

      {/* Queue Stat Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-3 mb-4">
        <button
          onClick={() => setStatusFilter('ALL')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            statusFilter === 'ALL'
              ? 'bg-navy text-white shadow-sm'
              : 'bg-white text-content-body hover:bg-slate-100 border border-border-subtle'
          }`}
        >
          <span>All Incidents</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === 'ALL' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
            {incidents.length}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('ACTIVE')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            statusFilter === 'ACTIVE'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-white text-rose-800 hover:bg-rose-50 border border-rose-200'
          }`}
        >
          <span>Active Reconnections</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === 'ACTIVE' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-900 font-bold'}`}>
            {openCount}
          </span>
        </button>

        <button
          onClick={() => setStatusFilter('resolved')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            statusFilter === 'resolved'
              ? 'bg-[#088F5B] text-white shadow-sm'
              : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200'
          }`}
        >
          <span>Resolved</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${statusFilter === 'resolved' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-900'}`}>
            {resolvedCount}
          </span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-brand border border-border-subtle shadow-subtle mb-6 max-w-md relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by incident ID, band code, caller, or location..."
          className="w-full h-10 pl-9 pr-4 text-xs sm:text-sm rounded-brand border border-border-subtle focus:outline-none focus:ring-2 focus:ring-navy"
        />
      </div>

      <DataTable
        columns={columns}
        data={filteredIncidents}
        keyExtractor={(item) => item.id}
        emptyTitle="No Incidents Match Filters"
        emptyDescription="Adjust your search keywords or toggle queue tabs."
      />

      {/* Modal: Log New Office Report */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Log Incoming Office Assistance Report"
        description="Record telephone details from a person who found a child or lost band."
      >
        <form onSubmit={handleCreateIncident} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Report Type" required>
              <Select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as IncidentReportType)}
              >
                <option value="child_found">Child Found with Band</option>
                <option value="band_found_alone">Band Found Alone (Lost Property)</option>
              </Select>
            </FormField>

            <FormField label="Quoted Band Reference" required hint="e.g. W4Y-1082-M4">
              <Input
                value={bandRef}
                onChange={(e) => setBandRef(e.target.value.toUpperCase())}
                placeholder="W4Y-XXXX-XX"
                className="font-mono uppercase font-bold"
                required
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Caller / Finder Name">
              <Input
                value={callerName}
                onChange={(e) => setCallerName(e.target.value)}
                placeholder="e.g. Officer J. Ramos / Mall Staff"
              />
            </FormField>

            <FormField label="Caller Telephone">
              <Input
                type="tel"
                value={callerContact}
                onChange={(e) => setCallerContact(e.target.value)}
                placeholder="e.g. +1 (555) 789-0112"
              />
            </FormField>
          </div>

          <FormField label="Voluntarily Reported Location" hint="Safe location where child is currently waiting">
            <Input
              value={locationStr}
              onChange={(e) => setLocationStr(e.target.value)}
              placeholder="e.g. Riverside Community Park south playground info booth"
            />
          </FormField>

          <FormField label="Initial Report Notes" required>
            <Textarea
              rows={3}
              value={incidentNotes}
              onChange={(e) => setIncidentNotes(e.target.value)}
              placeholder="Details about child’s wellbeing, attire, and who is accompanying them..."
              required
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => setIsNewModalOpen(false)} variant="outline" size="md">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md">
              Save and Open Incident
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
