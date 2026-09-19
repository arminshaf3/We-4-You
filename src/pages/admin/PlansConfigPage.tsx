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
import { Layers, Edit2, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export const PlansConfigPage: React.FC = () => {
  const { plans, updatePlan } = useApp();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [editName, setEditName] = useState('');
  const [editMonths, setEditMonths] = useState(12);
  const [editPriceStr, setEditPriceStr] = useState('');
  const [editAmount, setEditAmount] = useState(29);
  const [editDesc, setEditDesc] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editIsProvisional, setEditIsProvisional] = useState(false);

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
      header: 'Display Price (Sample)',
      render: (p) => (
        <div>
          <span className="font-semibold text-navy text-xs sm:text-sm block">{p.priceFormatted}</span>
          {p.isProvisional && (
            <span className="text-[10px] uppercase font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">
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
      header: 'Action',
      className: 'text-right',
      render: (p) => (
        <Button
          onClick={() => handleOpenEdit(p)}
          variant="outline"
          size="sm"
          leftIcon={<Edit2 className="w-3.5 h-3.5" />}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Subscription Plans Configuration"
        description="Configure duration, demonstration rates, and public visibility for customer registration."
      />

      {/* Notice Banner */}
      <div className="p-4 bg-neutral-soft rounded-brand border border-border-subtle text-xs text-content-body mb-6 flex items-start gap-2.5">
        <Layers className="w-4 h-4 text-navy flex-shrink-0 mt-0.5" />
        <div>
          <strong>Connected Plan Settings:</strong> Changes made here immediately update the plan options on the public <Link to="/subscriptions" className="text-navy font-semibold underline">/subscriptions</Link> and <Link to="/register" className="text-navy font-semibold underline">/register</Link> pages.
        </div>
      </div>

      <DataTable
        columns={columns}
        data={plans}
        keyExtractor={(item) => item.id}
      />

      {/* Edit Plan Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Configure Plan: ${selectedPlan?.name}`}
        description="Update pricing labels, duration, and public availability."
      >
        <form onSubmit={handleSavePlan} className="space-y-4">
          <FormField label="Plan Name" required>
            <Input value={editName} onChange={(e) => setEditName(e.target.value)} required />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Duration (Months)" required>
              <Input
                type="number"
                min="1"
                value={editMonths}
                onChange={(e) => setEditMonths(Number(e.target.value))}
                required
              />
            </FormField>

            <FormField label="Provisional Price Amount ($ USD)" required hint="Used for commission calculations">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={editAmount}
                onChange={(e) => setEditAmount(Number(e.target.value))}
                required
              />
            </FormField>
          </div>

          <FormField label="Public Price Label" required hint="e.g. '$29.00 / yr (Sample)' or 'Pricing to be confirmed'">
            <Input
              value={editPriceStr}
              onChange={(e) => setEditPriceStr(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Plan Description" required>
            <Textarea
              rows={3}
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              required
            />
          </FormField>

          <div className="flex flex-col gap-2 pt-2 text-xs">
            <label className="flex items-center gap-2 font-semibold text-navy cursor-pointer">
              <input
                type="checkbox"
                checked={editIsProvisional}
                onChange={(e) => setEditIsProvisional(e.target.checked)}
                className="w-4 h-4 rounded text-navy"
              />
              <span>Mark as 'Pricing to be confirmed' provisional plan</span>
            </label>

            <label className="flex items-center gap-2 font-semibold text-navy cursor-pointer">
              <input
                type="checkbox"
                checked={editIsActive}
                onChange={(e) => setEditIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-navy"
              />
              <span>Active on public website (shown in registration dropdown)</span>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3">
            <Button onClick={() => setIsEditModalOpen(false)} variant="outline" size="md">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md">
              Save Plan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
