import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/admin/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { FormField, Input, Textarea } from '../../components/common/FormField';
import { useApp } from '../../context/AppContext';
import { SubscriptionPlan } from '../../types';
import { Layers, Edit2, Plus, Eye, EyeOff, CheckCircle2 } from 'lucide-react';

export const PlansConfigPage: React.FC = () => {
  const { plans, addPlan, updatePlan, togglePlanActive } = useApp();

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [editName, setEditName] = useState('');
  const [editMonths, setEditMonths] = useState(12);
  const [editPriceStr, setEditPriceStr] = useState('');
  const [editAmount, setEditAmount] = useState(29);
  const [editDesc, setEditDesc] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editIsProvisional, setEditIsProvisional] = useState(false);

  // Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newMonths, setNewMonths] = useState(12);
  const [newPriceStr, setNewPriceStr] = useState('$29.00 / yr');
  const [newAmount, setNewAmount] = useState(29);
  const [newDesc, setNewDesc] = useState('');
  const [newIsActive, setNewIsActive] = useState(true);
  const [newIsProvisional, setNewIsProvisional] = useState(false);

  const handleOpenEdit = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setEditName(plan.name);
    setEditMonths(plan.durationMonths);
    setEditPriceStr(plan.priceFormatted);
    setEditAmount(plan.priceAmount);
    setEditDesc(plan.description);
    setEditIsActive(plan.isActive);
    setEditIsProvisional(plan.isProvisional);
    setIsEditModalOpen(true);
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;

    updatePlan(selectedPlan.id, {
      name: editName.trim(),
      durationMonths: Number(editMonths),
      priceFormatted: editPriceStr.trim(),
      priceAmount: Number(editAmount),
      description: editDesc.trim(),
      isActive: editIsActive,
      isProvisional: editIsProvisional,
    });

    setIsEditModalOpen(false);
  };

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    addPlan({
      name: newName.trim(),
      durationMonths: Number(newMonths),
      priceFormatted: newPriceStr.trim() || `$${newAmount}.00 / yr`,
      priceAmount: Number(newAmount),
      currency: 'USD',
      description: newDesc.trim() || 'Comprehensive identification protection coverage.',
      isActive: newIsActive,
      isProvisional: newIsProvisional,
      features: [
        '24/7 Emergency Assistance Center access',
        'Confidential multi-guardian contact routing',
        'Serialized identification band protection',
      ],
    });

    setIsAddModalOpen(false);
    setNewName('');
    setNewMonths(12);
    setNewAmount(29);
    setNewPriceStr('$29.00 / yr');
    setNewDesc('');
  };

  const columns: Column<SubscriptionPlan>[] = [
    {
      key: 'name',
      header: 'Plan Name',
      render: (p) => (
        <div>
          <span className="font-heading font-bold text-navy text-sm block">{p.name}</span>
          <span className="text-xs text-content-muted">{p.durationMonths} months coverage</span>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Price / Rate',
      render: (p) => (
        <div>
          <span className="font-semibold text-navy text-xs sm:text-sm block">{p.priceFormatted}</span>
          <span className="text-[11px] text-content-muted">Amount: ${p.priceAmount.toFixed(2)}</span>
          {p.isProvisional && (
            <span className="text-[10px] uppercase font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded ml-1.5 inline-block">
              Provisional
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (p) => (
        <span className="text-xs text-content-body max-w-sm block truncate">
          {p.description}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Public Visibility',
      render: (p) => (
        <div className="flex items-center gap-2">
          <StatusBadge status={p.isActive ? 'active' : 'inactive'} size="sm" />
          <span className="text-xs text-content-muted">
            {p.isActive ? 'Active on Public Site' : 'Hidden'}
          </span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (p) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => togglePlanActive(p.id)}
            className={`p-1.5 rounded text-xs font-semibold border transition-colors flex items-center gap-1 ${
              p.isActive
                ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            }`}
            title={p.isActive ? 'Deactivate from public registration' : 'Activate for public registration'}
          >
            {p.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{p.isActive ? 'Deactivate' : 'Activate'}</span>
          </button>
          <Button
            onClick={() => handleOpenEdit(p)}
            variant="outline"
            size="sm"
            leftIcon={<Edit2 className="w-3.5 h-3.5" />}
          >
            Edit
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Subscription Plans Configuration"
        description="Configure duration, demonstration rates, and public visibility for customer registration."
        actions={
          <Button
            onClick={() => setIsAddModalOpen(true)}
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create New Plan
          </Button>
        }
      />

      {/* Notice Banner */}
      <div className="p-4 bg-neutral-soft rounded-brand border border-border-subtle text-xs text-content-body mb-6 flex items-start gap-2.5">
        <Layers className="w-4 h-4 text-navy flex-shrink-0 mt-0.5" />
        <div>
          <strong>Live Database Connection:</strong> Changes made here immediately update in Supabase and sync with the public <Link to="/subscriptions" className="text-navy font-semibold underline">/subscriptions</Link> and <Link to="/register" className="text-navy font-semibold underline">/register</Link> pages.
        </div>
      </div>

      <DataTable
        columns={columns}
        data={plans}
        keyExtractor={(item) => item.id}
      />

      {/* Create New Plan Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create New Subscription Plan"
      >
        <form onSubmit={handleCreatePlan} className="space-y-4">
          <FormField label="Plan Name" required>
            <Input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. 2-Year Extended Protection"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Duration (Months)" required>
              <Input
                type="number"
                required
                min={1}
                max={120}
                value={newMonths}
                onChange={(e) => setNewMonths(Number(e.target.value))}
              />
            </FormField>

            <FormField label="Price Amount ($ USD)" required>
              <Input
                type="number"
                step="0.01"
                required
                value={newAmount}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setNewAmount(val);
                  setNewPriceStr(`$${val.toFixed(2)} / yr`);
                }}
              />
            </FormField>
          </div>

          <FormField label="Display Price Formatted (for UI)" required>
            <Input
              type="text"
              required
              value={newPriceStr}
              onChange={(e) => setNewPriceStr(e.target.value)}
              placeholder="e.g. $49.00 / 2 yrs"
            />
          </FormField>

          <FormField label="Description">
            <Textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Describe protection benefits and features..."
              rows={3}
            />
          </FormField>

          <div className="flex items-center gap-3 pt-2">
            <label className="flex items-center gap-2 text-sm text-navy cursor-pointer">
              <input
                type="checkbox"
                checked={newIsActive}
                onChange={(e) => setNewIsActive(e.target.checked)}
                className="rounded text-mint focus:ring-mint"
              />
              Active on Public Registration
            </label>
          </div>

          <div className="pt-4 border-t border-border-subtle flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Plan
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Plan Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Plan: ${selectedPlan?.name}`}
      >
        <form onSubmit={handleSavePlan} className="space-y-4">
          <FormField label="Plan Name" required>
            <Input
              type="text"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Duration (Months)" required>
              <Input
                type="number"
                required
                min={1}
                max={120}
                value={editMonths}
                onChange={(e) => setEditMonths(Number(e.target.value))}
              />
            </FormField>

            <FormField label="Price Amount ($ USD)" required>
              <Input
                type="number"
                step="0.01"
                required
                value={editAmount}
                onChange={(e) => setEditAmount(Number(e.target.value))}
              />
            </FormField>
          </div>

          <FormField label="Display Price Formatted" required>
            <Input
              type="text"
              required
              value={editPriceStr}
              onChange={(e) => setEditPriceStr(e.target.value)}
            />
          </FormField>

          <FormField label="Description">
            <Textarea
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              rows={3}
            />
          </FormField>

          <div className="flex flex-col gap-2 pt-2">
            <label className="flex items-center gap-2 text-sm text-navy cursor-pointer">
              <input
                type="checkbox"
                checked={editIsActive}
                onChange={(e) => setEditIsActive(e.target.checked)}
                className="rounded text-mint focus:ring-mint"
              />
              Active on Public Registration
            </label>
            <label className="flex items-center gap-2 text-sm text-navy cursor-pointer">
              <input
                type="checkbox"
                checked={editIsProvisional}
                onChange={(e) => setEditIsProvisional(e.target.checked)}
                className="rounded text-mint focus:ring-mint"
              />
              Mark as Provisional (Pending Office Confirmation)
            </label>
          </div>

          <div className="pt-4 border-t border-border-subtle flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PlansConfigPage;
