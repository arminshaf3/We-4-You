import React, { useState, useMemo } from 'react';
import { PageHeader } from '../../components/admin/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { FormField, Input, Select } from '../../components/common/FormField';
import { useApp } from '../../context/AppContext';
import { Band, BandStatus } from '../../types';
import { Radio, Plus, RefreshCw, Search, ShieldCheck } from 'lucide-react';

export const BandsListPage: React.FC = () => {
  const { bands, childrenRecords, vendors, addBandToInventory, replaceBand, addToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [newBandCode, setNewBandCode] = useState('');
  const [selectedChildForReplace, setSelectedChildForReplace] = useState('');
  const [replacementOldBand, setReplacementOldBand] = useState('');
  const [replacementNewBand, setReplacementNewBand] = useState('');
  const [replacementReason, setReplacementReason] = useState('');
  const [replaceError, setReplaceError] = useState('');

  const filteredBands = useMemo(() => {
    return bands.filter((b) => {
      const matchesSearch = b.referenceCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bands, searchTerm, statusFilter]);

  const availableBands = bands.filter((b) => b.status === 'available');

  const handleAddBand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBandCode.trim()) return;
    addBandToInventory(newBandCode.trim());
    setIsAddModalOpen(false);
    setNewBandCode('');
  };

  const handleOpenReplace = (band: Band) => {
    if (!band.childId) return;
    setSelectedChildForReplace(band.childId);
    setReplacementOldBand(band.referenceCode);
    setReplacementNewBand(availableBands[0]?.referenceCode || '');
    setReplacementReason('Band clip worn during sports activities');
    setReplaceError('');
    setIsReplaceModalOpen(true);
  };

  const handleConfirmReplace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replacementNewBand) {
      setReplaceError('No available band selected for replacement. Add inventory first.');
      return;
    }
    const success = replaceBand(
      selectedChildForReplace,
      replacementOldBand,
      replacementNewBand,
      replacementReason
    );
    if (success) {
      setIsReplaceModalOpen(false);
    } else {
      setReplaceError('Could not perform band replacement.');
    }
  };

  const columns: Column<Band>[] = [
    {
      key: 'referenceCode',
      header: 'Reference Code',
      render: (band) => (
        <span className="font-mono font-bold text-sm text-navy bg-mint-pale px-2.5 py-1 rounded border border-emerald-300 inline-block">
          {band.referenceCode}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Inventory Status',
      render: (band) => <StatusBadge status={band.status} />,
    },
    {
      key: 'child',
      header: 'Assigned Child',
      render: (band) => {
        const child = childrenRecords.find((c) => c.id === band.childId);
        return child ? (
          <span className="font-semibold text-navy text-xs sm:text-sm block">
            {child.name}
          </span>
        ) : (
          <span className="text-xs text-content-muted italic">Unassigned</span>
        );
      },
    },
    {
      key: 'vendor',
      header: 'Allocated Retailer',
      render: (band) => {
        const vendor = vendors.find((v) => v.id === band.vendorId);
        return (
          <span className="text-xs text-content-body">
            {vendor ? `${vendor.shopName} (${vendor.branch})` : 'Central Office Stock'}
          </span>
        );
      },
    },
    {
      key: 'notes',
      header: 'History / Notes',
      render: (band) => (
        <div className="text-xs text-content-muted max-w-xs truncate">
          {band.replacementNotes || (band.assignedDate ? `Assigned: ${band.assignedDate}` : 'In stock')}
          {band.replacedByCode && (
            <span className="block text-[11px] text-navy font-mono">
              Replaced by {band.replacedByCode}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      className: 'text-right',
      render: (band) => {
        if (band.status === 'assigned') {
          return (
            <button
              onClick={() => handleOpenReplace(band)}
              className="px-3 py-1 text-xs font-semibold text-navy bg-neutral-soft hover:bg-slate-200 rounded-brand border border-border-subtle transition-colors"
            >
              Replace Band
            </button>
          );
        }
        return <span className="text-xs text-slate-400">—</span>;
      },
    },
  ];

  const availableCount = useMemo(() => bands.filter(b => b.status === 'available').length, [bands]);
  const assignedCount = useMemo(() => bands.filter(b => b.status === 'assigned').length, [bands]);
  const lostCount = useMemo(() => bands.filter(b => b.status === 'lost').length, [bands]);
  const retiredCount = useMemo(() => bands.filter(b => b.status === 'retired').length, [bands]);

  return (
    <div>
      <PageHeader
        title="Band Inventory &amp; Assignments"
        description="Monitor serialized physical band stock, child assignments, and replacements."
        actions={
          <Button
            onClick={() => setIsAddModalOpen(true)}
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Band to Stock
          </Button>
        }
      />

      {/* Inventory KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-brand bg-white border border-border-subtle shadow-subtle">
          <span className="text-xs font-semibold uppercase tracking-wider text-content-muted block">
            Total Inventory
          </span>
          <span className="text-2xl font-heading font-bold text-navy block mt-1">
            {bands.length}
          </span>
          <span className="text-[11px] text-content-muted mt-0.5 block">
            Serialized physical stock
          </span>
        </div>

        <div className="p-4 rounded-brand bg-white border border-border-subtle shadow-subtle">
          <span className="text-xs font-semibold uppercase tracking-wider text-content-muted block">
            Available in Stock
          </span>
          <span className="text-2xl font-heading font-bold text-[#088F5B] block mt-1">
            {availableCount}
          </span>
          <span className="text-[11px] text-content-muted mt-0.5 block">
            Ready for activation
          </span>
        </div>

        <div className="p-4 rounded-brand bg-white border border-border-subtle shadow-subtle">
          <span className="text-xs font-semibold uppercase tracking-wider text-content-muted block">
            Assigned to Children
          </span>
          <span className="text-2xl font-heading font-bold text-navy block mt-1">
            {assignedCount}
          </span>
          <span className="text-[11px] text-content-muted mt-0.5 block">
            Active child protection
          </span>
        </div>

        <div className="p-4 rounded-brand bg-white border border-border-subtle shadow-subtle">
          <span className="text-xs font-semibold uppercase tracking-wider text-content-muted block">
            Retired / Replaced
          </span>
          <span className="text-2xl font-heading font-bold text-slate-500 block mt-1">
            {retiredCount + lostCount}
          </span>
          <span className="text-[11px] text-content-muted mt-0.5 block">
            {lostCount} lost, {retiredCount} retired
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
            placeholder="Search band reference (e.g. W4Y-7821-K9)..."
            className="w-full h-10 pl-9 pr-4 text-xs sm:text-sm font-mono uppercase rounded-brand border border-border-subtle focus:outline-none focus:ring-2 focus:ring-navy"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-10 px-3 text-xs sm:text-sm rounded-brand border border-border-subtle bg-white text-content-body focus:outline-none focus:ring-2 focus:ring-navy"
          >
            <option value="ALL">All Inventory Statuses ({bands.length})</option>
            <option value="available">Available in Stock ({availableCount})</option>
            <option value="assigned">Assigned to Child ({assignedCount})</option>
            <option value="lost">Reported Lost ({lostCount})</option>
            <option value="retired">Retired / Replaced ({retiredCount})</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredBands}
        keyExtractor={(item) => item.id}
        emptyTitle="No Bands Match Criteria"
        emptyDescription="Add new bands to stock or clear filters."
      />

      {/* Modal: Add Band to Inventory */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Serialized Band to Stock"
        description="Add a new physical band code to available stock."
      >
        <form onSubmit={handleAddBand} className="space-y-4">
          <FormField label="Band Reference Code" required hint="Format: W4Y-XXXX-XX">
            <Input
              value={newBandCode}
              onChange={(e) => setNewBandCode(e.target.value.toUpperCase())}
              placeholder="e.g. W4Y-9941-T8"
              className="font-mono uppercase font-semibold"
              required
            />
          </FormField>
          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => setIsAddModalOpen(false)} variant="outline" size="md">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md">
              Add Band to Inventory
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Replace Assigned Band */}
      <Modal
        isOpen={isReplaceModalOpen}
        onClose={() => setIsReplaceModalOpen(false)}
        title="Replace Assigned Band"
        description="Retire the existing band and assign a new available reference while preserving the child's subscription and history."
      >
        <form onSubmit={handleConfirmReplace} className="space-y-4">
          {replaceError && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-brand border border-red-200">
              {replaceError}
            </div>
          )}

          <div className="p-3 bg-neutral-soft rounded-brand border border-border-subtle text-xs space-y-1">
            <span className="text-content-muted block">Current Band to Retire:</span>
            <span className="font-mono text-base font-bold text-rose-700 block">
              {replacementOldBand}
            </span>
            <span className="text-[11px] text-content-muted">
              This code will transition to <strong>Retired</strong> and cannot be reassigned to another child.
            </span>
          </div>

          <FormField label="Select New Available Band" required>
            {availableBands.length > 0 ? (
              <Select
                value={replacementNewBand}
                onChange={(e) => setReplacementNewBand(e.target.value)}
                required
              >
                {availableBands.map((b) => (
                  <option key={b.id} value={b.referenceCode}>
                    {b.referenceCode} (Available in Stock)
                  </option>
                ))}
              </Select>
            ) : (
              <p className="text-xs text-rose-600 font-medium">
                No available bands in inventory! Add a band to stock first.
              </p>
            )}
          </FormField>

          <FormField label="Reason for Replacement" required>
            <Input
              value={replacementReason}
              onChange={(e) => setReplacementReason(e.target.value)}
              placeholder="e.g. Lost clasp during sports, normal wear..."
              required
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-3">
            <Button onClick={() => setIsReplaceModalOpen(false)} variant="outline" size="md">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md">
              Confirm Replacement
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
