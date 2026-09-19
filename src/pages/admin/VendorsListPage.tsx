import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/admin/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { FormField, Input, Select } from '../../components/common/FormField';
import { useApp } from '../../context/AppContext';
import { Vendor } from '../../types';
import { Store, Plus, Edit2, Eye, EyeOff, ShieldAlert, CheckCircle } from 'lucide-react';

export const VendorsListPage: React.FC = () => {
  const { vendors, addVendor, toggleVendorActive, childrenRecords, registrations } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [shopName, setShopName] = useState('');
  const [branch, setBranch] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [telephone, setTelephone] = useState('');
  const [address, setAddress] = useState('');
  const [commissionType, setCommissionType] = useState<'percentage' | 'fixed'>('percentage');
  const [commissionRate, setCommissionRate] = useState<number>(15);
  const [isActive, setIsActive] = useState(true);

  // Dynamic preview of the public dropdown label
  const publicDropdownPreview = shopName.trim()
    ? `${shopName.trim()} — ${branch.trim() || 'Main Branch'}`
    : 'Shop Name — Branch / Town';

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim() || !branch.trim() || !telephone.trim()) return;

    addVendor({
      shopName: shopName.trim(),
      branch: branch.trim(),
      contactPerson: contactPerson.trim() || 'Store Manager',
      telephone: telephone.trim(),
      address: address.trim() || 'Retail location',
      isActive,
      commissionType,
      commissionRate: Number(commissionRate),
    });

    setIsAddModalOpen(false);
    // Reset form
    setShopName('');
    setBranch('');
    setContactPerson('');
    setTelephone('');
    setAddress('');
  };

  const columns: Column<Vendor>[] = [
    {
      key: 'shopName',
      header: 'Vendor Shop & Branch',
      render: (vendor) => (
        <div>
          <Link to={`/admin/vendors/${vendor.id}`} className="font-heading font-bold text-navy text-sm hover:underline block">
            {vendor.shopName}
          </Link>
          <span className="text-xs text-content-muted">{vendor.branch}</span>
        </div>
      ),
    },
    {
      key: 'dropdownPreview',
      header: 'Public Dropdown Preview',
      render: (vendor) => (
        <span className="text-xs font-medium text-navy bg-neutral-soft px-2.5 py-1 rounded border border-border-subtle block max-w-xs truncate">
          {vendor.shopName} — {vendor.branch}
        </span>
      ),
    },
    {
      key: 'contact',
      header: 'Private Contact',
      render: (vendor) => (
        <div className="text-xs">
          <span className="text-content-body block">{vendor.contactPerson}</span>
          <span className="font-mono text-content-muted">{vendor.telephone}</span>
        </div>
      ),
    },
    {
      key: 'commission',
      header: 'Commission Rule',
      render: (vendor) => (
        <span className="text-xs font-semibold text-navy">
          {vendor.commissionType === 'percentage'
            ? `${vendor.commissionRate}% of sale`
            : `$${vendor.commissionRate}.00 fixed`}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Registration Visibility',
      render: (vendor) => (
        <div className="flex items-center gap-2">
          <StatusBadge status={vendor.isActive ? 'active' : 'inactive'} size="sm" />
          <span className="text-[11px] text-content-muted">
            {vendor.isActive ? 'Visible in dropdown' : 'Hidden from new dropdown'}
          </span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (vendor) => {
        return (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => toggleVendorActive(vendor.id)}
              className={`p-1.5 rounded text-xs font-medium transition-colors ${
                vendor.isActive
                  ? 'text-amber-800 bg-amber-50 hover:bg-amber-100'
                  : 'text-emerald-800 bg-mint-pale hover:bg-mint/40'
              }`}
              title={vendor.isActive ? 'Deactivate vendor (hide from dropdown)' : 'Activate vendor (show in dropdown)'}
            >
              {vendor.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
            <Link
              to={`/admin/vendors/${vendor.id}`}
              className="px-2.5 py-1 text-xs font-semibold text-navy bg-neutral-soft hover:bg-slate-200 rounded border border-border-subtle"
            >
              Profile
            </Link>
          </div>
        );
      },
    },
  ];

  const activeVendorsCount = vendors.filter((v) => v.isActive).length;
  const totalAttributedRegs = registrations.filter((r) => r.vendorId && r.vendorId !== 'DIRECT').length;
  const totalAttributedChildren = childrenRecords.filter((c) => c.vendorId && c.vendorId !== 'DIRECT').length;

  return (
    <div>
      <PageHeader
        title="Vendor Partner Shops"
        description="Create authorized retail partners. Only active vendors appear in the public registration dropdown."
        actions={
          <Button
            onClick={() => setIsAddModalOpen(true)}
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Vendor Shop
          </Button>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-brand bg-white border border-border-subtle shadow-subtle">
          <span className="text-xs font-semibold uppercase tracking-wider text-content-muted block">
            Partner Shops
          </span>
          <span className="text-2xl font-heading font-bold text-navy block mt-1">
            {vendors.length}
          </span>
          <span className="text-[11px] text-content-muted mt-0.5 block">
            Authorized retail network
          </span>
        </div>

        <div className="p-4 rounded-brand bg-white border border-border-subtle shadow-subtle">
          <span className="text-xs font-semibold uppercase tracking-wider text-content-muted block">
            Active on Public Dropdown
          </span>
          <span className="text-2xl font-heading font-bold text-[#088F5B] block mt-1">
            {activeVendorsCount}
          </span>
          <span className="text-[11px] text-content-muted mt-0.5 block">
            Available to customers
          </span>
        </div>

        <div className="p-4 rounded-brand bg-white border border-border-subtle shadow-subtle">
          <span className="text-xs font-semibold uppercase tracking-wider text-content-muted block">
            Attributed Sales
          </span>
          <span className="text-2xl font-heading font-bold text-navy block mt-1">
            {totalAttributedRegs}
          </span>
          <span className="text-[11px] text-content-muted mt-0.5 block">
            Registrations credited
          </span>
        </div>

        <div className="p-4 rounded-brand bg-white border border-border-subtle shadow-subtle">
          <span className="text-xs font-semibold uppercase tracking-wider text-content-muted block">
            Protected Children
          </span>
          <span className="text-2xl font-heading font-bold text-[#088F5B] block mt-1">
            {totalAttributedChildren}
          </span>
          <span className="text-[11px] text-content-muted mt-0.5 block">
            Active in community
          </span>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="p-4 bg-mint-pale/50 rounded-brand border border-emerald-300/40 text-xs text-content-body mb-6 flex items-start gap-2.5">
        <Store className="w-4 h-4 text-navy flex-shrink-0 mt-0.5" />
        <div>
          <strong>Connected Demonstration Notice:</strong> Vendors created or toggled here immediately reflect in the public registration dropdown at <Link to="/register" className="font-semibold text-navy underline">/register</Link>. Inactive vendors disappear from new selections while remaining preserved on historical sales.
        </div>
      </div>

      <DataTable
        columns={columns}
        data={vendors}
        keyExtractor={(item) => item.id}
        emptyTitle="No Vendors Configured"
        emptyDescription="Create your first vendor shop above."
      />

      {/* Modal: Create Vendor Shop */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Create Authorized Vendor Shop"
        description="Configure shop details, public dropdown label, and commission rules."
        maxWidth="lg"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Shop Name" required hint="Retail business name">
              <Input
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="e.g. Sunny Smiles Kids Store"
                required
              />
            </FormField>

            <FormField label="Branch / Town" required hint="Used to distinguish duplicate names">
              <Input
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="e.g. Westgate Mall, Level 1"
                required
              />
            </FormField>
          </div>

          {/* Dynamic Public Label Preview Box */}
          <div className="p-3 bg-neutral-soft rounded-brand border border-border-subtle space-y-1">
            <span className="text-xs font-semibold text-content-muted block">
              Public Dropdown Label Preview:
            </span>
            <span className="text-sm font-semibold text-navy block font-heading">
              {publicDropdownPreview}
            </span>
            <span className="text-[11px] text-content-muted block">
              This exact string will appear in the customer registration dropdown when active.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Contact Person" hint="Store manager or billing liaison">
              <Input
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g. Andrea Mitchell"
              />
            </FormField>

            <FormField label="Private Telephone" required hint="Office-only telephone">
              <Input
                type="tel"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder="e.g. +1 (555) 789-2345"
                required
              />
            </FormField>
          </div>

          <FormField label="Physical Store Address">
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 500 Westgate Parkway"
            />
          </FormField>

          {/* Commission Structure */}
          <div className="p-4 bg-white rounded-brand border border-border-subtle space-y-3">
            <span className="text-xs font-heading font-bold text-navy block">
              Demonstration Commission Arrangement
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Commission Type">
                <Select
                  value={commissionType}
                  onChange={(e) => setCommissionType(e.target.value as any)}
                >
                  <option value="percentage">Percentage (%) of Subscription</option>
                  <option value="fixed">Fixed Dollar ($) per Sale</option>
                </Select>
              </FormField>

              <FormField label={commissionType === 'percentage' ? 'Rate (%)' : 'Amount ($)'}>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(Number(e.target.value))}
                  required
                />
              </FormField>
            </div>
          </div>

          {/* Active Status Toggle */}
          <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-navy select-none">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded text-navy"
            />
            <span>Set Active immediately (appears in public registration)</span>
          </label>

          <div className="flex justify-end gap-2 pt-3">
            <Button onClick={() => setIsAddModalOpen(false)} variant="outline" size="md">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md">
              Create Vendor
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
