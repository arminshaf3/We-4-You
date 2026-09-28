import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/admin/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { FormField, Input, Select, Textarea } from '../../components/common/FormField';
import { useApp } from '../../context/AppContext';
import { Band, BandStatus } from '../../types';
import { Radio, Plus, RefreshCw, Search, ShieldCheck, AlertOctagon, UserPlus, Edit3 } from 'lucide-react';

export const BandsListPage: React.FC = () => {
  const {
    bands,
    childrenRecords,
    vendors,
    addBandToInventory,
    assignBandToChild,
    replaceBand,
    updateBandStatus,
    markBandLost,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isReplaceModalOpen, setIsReplaceModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  // Form states
  const [newBandCode, setNewBandCode] = useState('');
  const [addError, setAddError] = useState('');
  const [selectedChildForReplace, setSelectedChildForReplace] = useState('');
  const [replacementOldBand, setReplacementOldBand] = useState('');
  const [replacementNewBand, setReplacementNewBand] = useState('');
  const [replacementReason, setReplacementReason] = useState('');
  const [replaceError, setReplaceError] = useState('');

  // Status Edit State
  const [selectedBandForStatus, setSelectedBandForStatus] = useState<Band | null>(null);
  const [newStatus, setNewStatus] = useState<BandStatus>('available');
  const [statusNotes, setStatusNotes] = useState('');

  // Quick Assign State
  const [selectedBandForAssign, setSelectedBandForAssign] = useState<Band | null>(null);
  const [selectedWearerId, setSelectedWearerId] = useState('');

  const findAssignedChild = (band: Band) => {
    const norm = band.referenceCode.replace(/[\s-]/g, '').toUpperCase();
    return childrenRecords.find(
      (c) => c.id === band.childId || (c.currentBandCode && c.currentBandCode.replace(/[\s-]/g, '').toUpperCase() === norm)
    );
  };

  const filteredBands = useMemo(() => {
    return bands.filter((b) => {
      const assignedChild = findAssignedChild(b);
      const matchesSearch =
        b.referenceCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (assignedChild && assignedChild.name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const effectiveStatus: BandStatus =
        (b.status === 'assigned' || Boolean(assignedChild)) && b.status !== 'lost' && b.status !== 'retired' && b.status !== 'replaced'
          ? 'assigned'
          : b.status;
      const matchesStatus = statusFilter === 'ALL' || effectiveStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bands, searchTerm, statusFilter, childrenRecords]);

  const availableBands = bands.filter((b) => {
    const hasChild = Boolean(findAssignedChild(b));
    return b.status === 'available' && !hasChild;
  });

  // Only wearers who do NOT have an active connected band yet
  const unassignedWearers = useMemo(() => {
    return childrenRecords.filter((child) => {
      if (!child.currentBandCode || child.currentBandCode.trim() === '' || child.currentBandCode === 'None') {
        return true;
      }
      const currentBand = bands.find(
        (b) => b.referenceCode.replace(/[\s-]/g, '').toUpperCase() === child.currentBandCode.replace(/[\s-]/g, '').toUpperCase()
      );
      return !currentBand || currentBand.status === 'retired' || currentBand.status === 'lost';
    });
  }, [childrenRecords, bands]);

  const normNewBandCode = newBandCode.toUpperCase().replace(/[\s-]/g, '').trim();
  const duplicateExistingBand = useMemo(() => {
    if (!normNewBandCode) return null;
    return bands.find((b) => b.referenceCode.replace(/[\s-]/g, '').toUpperCase() === normNewBandCode) || null;
  }, [bands, normNewBandCode]);

  const handleAddBand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBandCode.trim()) return;
    if (duplicateExistingBand) {
      setAddError(`Band reference code "${newBandCode.trim()}" already exists in inventory (Status: ${duplicateExistingBand.status}). Every band must have a unique reference code.`);
      return;
    }
    const result = addBandToInventory(newBandCode.trim());
    if (result) {
      setIsAddModalOpen(false);
      setNewBandCode('');
      setAddError('');
    }
  };

  const handleOpenReplace = (band: Band) => {
    const child = findAssignedChild(band);
    if (!child && !band.childId) return;
    setSelectedChildForReplace(child?.id || band.childId || '');
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

  const handleOpenAssign = (band: Band) => {
    setSelectedBandForAssign(band);
    setSelectedWearerId(unassignedWearers[0]?.id || '');
    setIsAssignModalOpen(true);
  };

  const handleConfirmAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBandForAssign || !selectedWearerId) return;
    assignBandToChild(selectedBandForAssign.referenceCode, selectedWearerId);
    setIsAssignModalOpen(false);
  };

  const handleOpenStatusModal = (band: Band) => {
    setSelectedBandForStatus(band);
    setNewStatus(band.status);
    setStatusNotes(band.replacementNotes || '');
    setIsStatusModalOpen(true);
  };

  const handleConfirmStatusChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBandForStatus) return;
    updateBandStatus(selectedBandForStatus.referenceCode, newStatus, statusNotes);
    setIsStatusModalOpen(false);
  };

  const columns: Column<Band>[] = [
    {
      key: 'referenceCode',
      header: 'Reference Code',
      render: (band) => (
        <span className="font-mono font-bold text-sm text-navy bg-mint-pale px-2.5 py-1 rounded border border-emerald-300 inline-block shadow-2xs">
          {band.referenceCode}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Inventory Status',
      render: (band) => {
        const child = findAssignedChild(band);
        const effectiveStatus: BandStatus =
          (band.status === 'assigned' || Boolean(child)) && band.status !== 'lost' && band.status !== 'retired' && band.status !== 'replaced'
            ? 'assigned'
            : band.status;
        return <StatusBadge status={effectiveStatus} />;
      },
    },
    {
      key: 'child',
      header: 'Assigned Wearer',
      render: (band) => {
        const child = findAssignedChild(band);
        return child ? (
          <div>
            <Link
              to={`/admin/children/${child.id}`}
              className="font-semibold text-navy hover:text-[#088F5B] hover:underline text-xs sm:text-sm block"
            >
              {child.name}
            </Link>
            <span className="text-[11px] text-content-muted block">
              {child.primaryGuardian?.fullName ? `Guardian: ${child.primaryGuardian.fullName}` : child.ageRange}
            </span>
          </div>
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
      header: 'Actions',
      className: 'text-right',
      render: (band) => {
        const child = findAssignedChild(band);
        const isAssigned = (band.status === 'assigned' || Boolean(child)) && band.status !== 'lost' && band.status !== 'retired' && band.status !== 'replaced';

        return (
          <div className="flex items-center justify-end gap-1.5">
            {!isAssigned && band.status === 'available' && (
              <button
                onClick={() => handleOpenAssign(band)}
                className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors"
                title="Assign to registered wearer"
              >
                Assign
              </button>
            )}

            {isAssigned && (
              <>
                <button
                  onClick={() => handleOpenReplace(band)}
                  className="px-2.5 py-1 text-xs font-semibold text-navy bg-neutral-soft hover:bg-slate-200 rounded border border-border-subtle transition-colors"
                >
                  Replace
                </button>
                <button
                  onClick={() => markBandLost(band.referenceCode)}
                  className="px-2.5 py-1 text-xs font-semibold text-rose-800 bg-rose-50 hover:bg-rose-100 rounded border border-rose-200 transition-colors"
                  title="Mark band as lost"
                >
                  Lost
                </button>
              </>
            )}

            <button
              onClick={() => handleOpenStatusModal(band)}
              className="p-1 text-slate-500 hover:text-navy hover:bg-slate-100 rounded transition-colors"
              title="Edit status and notes"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      },
    },
  ];

  const assignedCount = useMemo(() => {
    return bands.filter((b) => {
      const isAssigned = b.status === 'assigned' || Boolean(findAssignedChild(b));
      return isAssigned && b.status !== 'lost' && b.status !== 'retired';
    }).length;
  }, [bands, childrenRecords]);

  const availableCount = useMemo(() => {
    return bands.filter((b) => {
      const isAssigned = b.status === 'assigned' || Boolean(findAssignedChild(b));
      return b.status === 'available' && !isAssigned;
    }).length;
  }, [bands, childrenRecords]);

  const lostCount = useMemo(() => bands.filter((b) => b.status === 'lost').length, [bands]);
  const retiredCount = useMemo(() => bands.filter((b) => b.status === 'retired').length, [bands]);

  return (
    <div>
      <PageHeader
        title="Band Inventory &amp; Assignments"
        description="Monitor serialized physical band stock, wearer assignments, and replacements."
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
            Assigned to Wearers
          </span>
          <span className="text-2xl font-heading font-bold text-navy block mt-1">
            {assignedCount}
          </span>
          <span className="text-[11px] text-content-muted mt-0.5 block">
            Active individual protection
          </span>
        </div>

        <div className="p-4 rounded-brand bg-white border border-border-subtle shadow-subtle">
          <span className="text-xs font-semibold uppercase tracking-wider text-content-muted block">
            Retired / Lost
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
            placeholder="Search band code or wearer name (e.g. W4Y-7821-K9)..."
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
            <option value="assigned">Assigned to Wearer ({assignedCount})</option>
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
        emptyDescription="Add new bands to stock or clear search filters."
      />

      {/* Modal: Add Band to Inventory */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setAddError('');
        }}
        title="Add Serialized Band to Stock"
        description="Add a new physical band code to available stock."
      >
        <form onSubmit={handleAddBand} className="space-y-4">
          {duplicateExistingBand && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-brand text-xs text-amber-900 flex items-start gap-2">
              <AlertOctagon className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold">Duplicate Reference Code</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Band code <span className="font-mono font-bold">{duplicateExistingBand.referenceCode}</span> is already in the system (Status: <span className="capitalize font-semibold">{duplicateExistingBand.status}</span>). Each band must have a globally unique serial code.
                </p>
              </div>
            </div>
          )}

          {addError && !duplicateExistingBand && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-brand text-xs text-rose-800">
              {addError}
            </div>
          )}

          <FormField label="Band Reference Code" required hint="Format: W4Y-XXXX-XX">
            <Input
              value={newBandCode}
              onChange={(e) => {
                setNewBandCode(e.target.value.toUpperCase());
                if (addError) setAddError('');
              }}
              placeholder="e.g. W4Y-9941-T8"
              className="font-mono uppercase font-semibold"
              required
            />
          </FormField>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              onClick={() => {
                setIsAddModalOpen(false);
                setAddError('');
              }}
              variant="outline"
              size="md"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={Boolean(duplicateExistingBand) || !newBandCode.trim()}
            >
              Add Band to Inventory
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Assign Band to Wearer */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title={`Assign Band ${selectedBandForAssign?.referenceCode}`}
        description="Link this available band directly to a registered wearer."
      >
        <form onSubmit={handleConfirmAssign} className="space-y-4">
          {unassignedWearers.length > 0 ? (
            <>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-brand text-xs text-emerald-900 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-emerald-950">Wearers Awaiting Band Connection</p>
                  <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                    Showing only registered wearers who do not have an active band connected yet.
                  </p>
                </div>
              </div>

              <FormField label="Select Wearer (Unassigned Only)" required>
                <Select
                  value={selectedWearerId}
                  onChange={(e) => setSelectedWearerId(e.target.value)}
                  required
                >
                  {unassignedWearers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.ageRange}) — Guardian: {c.primaryGuardian?.fullName || 'Registered'}
                    </option>
                  ))}
                </Select>
              </FormField>

              <div className="flex justify-end gap-2 pt-2">
                <Button onClick={() => setIsAssignModalOpen(false)} variant="outline" size="md">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="md" disabled={!selectedWearerId}>
                  Confirm Assignment
                </Button>
              </div>
            </>
          ) : (
            <div className="py-3 text-center space-y-3">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-brand text-left space-y-2">
                <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs">
                  <AlertOctagon className="w-4 h-4 text-slate-500" />
                  <span>No Unconnected Wearers Found</span>
                </div>
                <p className="text-xs text-content-muted leading-relaxed">
                  All registered wearers are already connected to active bands.
                </p>
                <p className="text-[11px] text-content-muted border-t border-slate-200 pt-2">
                  To swap or upgrade a band for an existing wearer, click the <strong className="text-navy">"Replace"</strong> button next to their active band in the inventory table.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button onClick={() => setIsAssignModalOpen(false)} variant="primary" size="md">
                  Close
                </Button>
              </div>
            </div>
          )}
        </form>
      </Modal>

      {/* Modal: Edit Band Status */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title={`Update Band: ${selectedBandForStatus?.referenceCode}`}
      >
        <form onSubmit={handleConfirmStatusChange} className="space-y-4">
          <FormField label="Status" required>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as BandStatus)}
              required
            >
              <option value="available">Available (in stock)</option>
              <option value="assigned">Assigned (active protection)</option>
              <option value="lost">Lost (reported missing)</option>
              <option value="retired">Retired (damaged / decommissioned)</option>
              <option value="replaced">Replaced (superseded by new band)</option>
            </Select>
          </FormField>

          <FormField label="Status Notes / Reason">
            <Textarea
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              placeholder="e.g. Broken clip, returned from field..."
              rows={3}
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => setIsStatusModalOpen(false)} variant="outline" size="md">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md">
              Update Band
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Replace Assigned Band */}
      <Modal
        isOpen={isReplaceModalOpen}
        onClose={() => setIsReplaceModalOpen(false)}
        title="Replace Assigned Band"
        description="Retire the existing band and assign a new available reference while preserving the wearer's subscription and history."
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
              This code will transition to <strong>Retired</strong> and cannot be reassigned to another wearer.
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

export default BandsListPage;
