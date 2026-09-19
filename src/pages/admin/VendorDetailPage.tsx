import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '../../components/admin/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { FormField, Input } from '../../components/common/FormField';
import { useApp } from '../../context/AppContext';
import { Store, Phone, MapPin, User, Banknote, PiggyBank, ArrowLeft, Edit2 } from 'lucide-react';

export const VendorDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { vendors, commissions, payouts, childrenRecords, registrations, updateVendor } = useApp();

  const vendor = vendors.find((v) => v.id === id);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [shopName, setShopName] = useState(vendor?.shopName || '');
  const [branch, setBranch] = useState(vendor?.branch || '');
  const [contactPerson, setContactPerson] = useState(vendor?.contactPerson || '');
  const [telephone, setTelephone] = useState(vendor?.telephone || '');
  const [address, setAddress] = useState(vendor?.address || '');

  if (!vendor) {
    return (
      <div>
        <PageHeader title="Vendor Not Found" />
        <p className="text-content-muted">Vendor shop record not found.</p>
      </div>
    );
  }

  // Linked vendor data
  const vendorCommissions = commissions.filter((c) => c.vendorId === vendor.id);
  const vendorPayouts = payouts.filter((p) => p.vendorId === vendor.id);
  const attributedChildren = childrenRecords.filter((c) => c.vendorId === vendor.id);
  const attributedRegistrations = registrations.filter((r) => r.vendorId === vendor.id);

  const pendingCommissionsTotal = vendorCommissions
    .filter((c) => c.status === 'pending' || c.status === 'approved')
    .reduce((sum, c) => sum + c.commissionAmount, 0);

  const paidCommissionsTotal = vendorCommissions
    .filter((c) => c.status === 'paid')
    .reduce((sum, c) => sum + c.commissionAmount, 0);

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    updateVendor(vendor.id, {
      shopName: shopName.trim(),
      branch: branch.trim(),
      contactPerson: contactPerson.trim(),
      telephone: telephone.trim(),
      address: address.trim(),
    });
    setIsEditModalOpen(false);
  };

  return (
    <div>
      <PageHeader
        title={`${vendor.shopName} — ${vendor.branch}`}
        breadcrumbs={[
          { label: 'Vendor Shops', to: '/admin/vendors' },
          { label: vendor.shopName },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setShopName(vendor.shopName);
                setBranch(vendor.branch);
                setContactPerson(vendor.contactPerson);
                setTelephone(vendor.telephone);
                setAddress(vendor.address);
                setIsEditModalOpen(true);
              }}
              variant="outline"
              size="sm"
              leftIcon={<Edit2 className="w-3.5 h-3.5" />}
            >
              Edit Shop
            </Button>
            <Button to="/admin/vendors" variant="outline" size="sm" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Vendors
            </Button>
          </div>
        }
      />

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-brand bg-white border border-border-subtle shadow-subtle">
          <span className="text-xs text-content-muted block">Status &amp; Visibility</span>
          <div className="mt-2 flex items-center gap-2">
            <StatusBadge status={vendor.isActive ? 'active' : 'inactive'} />
          </div>
          <span className="text-[11px] text-content-muted mt-2 block">
            {vendor.isActive ? 'Available in public registration' : 'Hidden from public registration'}
          </span>
        </div>

        <div className="p-5 rounded-brand bg-white border border-border-subtle shadow-subtle">
          <span className="text-xs text-content-muted block">Attributed Registrations</span>
          <span className="text-2xl font-heading font-bold text-navy block mt-1">
            {attributedRegistrations.length}
          </span>
          <span className="text-[11px] text-content-muted mt-1 block">
            {attributedChildren.length} active registered children
          </span>
        </div>

        <div className="p-5 rounded-brand bg-white border border-border-subtle shadow-subtle">
          <span className="text-xs text-content-muted block">Pending Commissions</span>
          <span className="text-2xl font-heading font-bold text-amber-700 block mt-1">
            ${pendingCommissionsTotal.toFixed(2)}
          </span>
          <span className="text-[11px] text-content-muted mt-1 block">
            Awaiting approval or payout
          </span>
        </div>

        <div className="p-5 rounded-brand bg-white border border-border-subtle shadow-subtle">
          <span className="text-xs text-content-muted block">Paid Commissions</span>
          <span className="text-2xl font-heading font-bold text-[#088F5B] block mt-1">
            ${paidCommissionsTotal.toFixed(2)}
          </span>
          <span className="text-[11px] text-content-muted mt-1 block">
            Processed via simulated payouts
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Private Profile & Attributed Sales */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Contact Details */}
          <div className="bg-white p-6 rounded-brand border border-border-subtle shadow-subtle space-y-3 text-xs">
            <h3 className="text-base font-heading font-bold text-navy pb-2 border-b border-border-subtle flex items-center gap-2">
              <Store className="w-4 h-4 text-navy" />
              <span>Private Vendor Shop Record</span>
            </h3>
            <p><strong>Shop ID:</strong> <span className="font-mono">{vendor.id}</span></p>
            <p><strong>Contact Liaison:</strong> {vendor.contactPerson}</p>
            <p><strong>Private Telephone:</strong> <span className="font-mono">{vendor.telephone}</span></p>
            <p><strong>Store Address:</strong> {vendor.address}</p>
            <p>
              <strong>Commission Rule:</strong>{' '}
              {vendor.commissionType === 'percentage' ? `${vendor.commissionRate}% of sale` : `$${vendor.commissionRate}.00 fixed`}
            </p>
          </div>

          {/* Attributed Purchases List */}
          <div className="bg-white p-6 rounded-brand border border-border-subtle shadow-subtle space-y-4">
            <h3 className="text-base font-heading font-bold text-navy pb-2 border-b border-border-subtle flex items-center justify-between">
              <span>Attributed Purchases ({attributedRegistrations.length})</span>
            </h3>

            {attributedRegistrations.length > 0 ? (
              <div className="divide-y divide-border-subtle text-xs">
                {attributedRegistrations.map((reg) => (
                  <div key={reg.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <Link to={`/admin/registrations/${reg.id}`} className="font-mono font-bold text-navy hover:underline">
                        {reg.referenceNumber}
                      </Link>
                      <span className="text-content-muted block">
                        Child: {reg.child.name} &bull; Band: <span className="font-mono">{reg.bandCode}</span>
                      </span>
                    </div>
                    <StatusBadge status={reg.status} size="sm" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-content-muted italic">No purchases currently attributed to this vendor.</p>
            )}
          </div>

        </div>

        {/* Right: Commissions & Payout History */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Commissions */}
          <div className="bg-white p-6 rounded-brand border border-border-subtle shadow-subtle space-y-3">
            <h3 className="text-base font-heading font-bold text-navy pb-2 border-b border-border-subtle flex items-center justify-between">
              <span>Commission Entries</span>
              <Banknote className="w-4 h-4 text-mint-darker" />
            </h3>

            {vendorCommissions.length > 0 ? (
              <div className="space-y-2 text-xs">
                {vendorCommissions.map((comm) => (
                  <div key={comm.id} className="p-3 bg-neutral-soft rounded-brand border border-border-subtle flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-navy block">{comm.id}</span>
                      <span className="text-[11px] text-content-muted">
                        Ref: {comm.registrationRef} &bull; {comm.createdAt}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-navy block">
                        ${comm.commissionAmount.toFixed(2)}
                      </span>
                      <StatusBadge status={comm.status} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-content-muted italic">No commissions logged for this vendor.</p>
            )}
          </div>

          {/* Payout History */}
          <div className="bg-white p-6 rounded-brand border border-border-subtle shadow-subtle space-y-3">
            <h3 className="text-base font-heading font-bold text-navy pb-2 border-b border-border-subtle flex items-center justify-between">
              <span>Simulated Payout History</span>
              <PiggyBank className="w-4 h-4 text-navy" />
            </h3>

            {vendorPayouts.length > 0 ? (
              <div className="space-y-2 text-xs">
                {vendorPayouts.map((po) => (
                  <div key={po.id} className="p-3 bg-neutral-soft rounded-brand border border-border-subtle space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-navy">{po.payoutRef}</span>
                      <span className="font-mono font-bold text-[#088F5B]">${po.totalAmount.toFixed(2)}</span>
                    </div>
                    <span className="text-[11px] text-content-muted block">
                      Paid: {po.payoutDate} &bull; {po.commissionIds.length} commission(s)
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-content-muted italic">No payouts processed for this vendor.</p>
            )}
          </div>

        </div>

      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Vendor Shop"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <FormField label="Shop Name" required>
            <Input value={shopName} onChange={(e) => setShopName(e.target.value)} required />
          </FormField>
          <FormField label="Branch / Town" required>
            <Input value={branch} onChange={(e) => setBranch(e.target.value)} required />
          </FormField>
          <FormField label="Contact Person">
            <Input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} />
          </FormField>
          <FormField label="Private Telephone" required>
            <Input value={telephone} onChange={(e) => setTelephone(e.target.value)} required />
          </FormField>
          <FormField label="Store Address">
            <Input value={address} onChange={(e) => setAddress(e.target.value)} />
          </FormField>
          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={() => setIsEditModalOpen(false)} variant="outline" size="md">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
