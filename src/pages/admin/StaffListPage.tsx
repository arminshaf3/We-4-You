import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/admin/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { FormField, Input, Select } from '../../components/common/FormField';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../hooks/useAuth';
import { authService, UserProfile, UserRole } from '../../services/authService';
import {
  UserCheck,
  Plus,
  Shield,
  ShieldCheck,
  Headphones,
  Mail,
  Phone,
  Key,
  RefreshCw,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const StaffListPage: React.FC = () => {
  const { addToast } = useApp();
  const { user: currentAuthUser, role: currentAuthRole } = useAuth();

  const [staffList, setStaffList] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'support' | 'admin'>('support');
  const [showPassword, setShowPassword] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<UserProfile | null>(null);

  const fetchStaff = async () => {
    setIsLoading(true);
    const members = await authService.getStaffMembers();
    // If empty (e.g. mock/local environment fallback), provide initial staff members
    if (members.length === 0) {
      setStaffList([
        {
          id: 'staff-admin-01',
          email: 'we4u@gmail.com',
          fullName: 'We 4 You Administrator',
          role: 'admin',
          createdAt: new Date().toISOString().substring(0, 10),
        },
        {
          id: 'staff-coord-01',
          email: 'support@we4u.com',
          fullName: 'Support Incident Coordinator',
          phone: '+1 (800) 555-WE4U',
          role: 'support',
          createdAt: new Date().toISOString().substring(0, 10),
        },
      ]);
    } else {
      setStaffList(members);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let generated = '';
    for (let i = 0; i < 12; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(generated);
    setShowPassword(true);
  };

  const handleAddStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim() || !email.trim() || !password) {
      setFormError('Please complete all required fields.');
      return;
    }

    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    const result = await authService.createStaffMember({
      email: email.trim(),
      password,
      fullName: fullName.trim(),
      phone: phone.trim() || undefined,
      role: selectedRole,
    });
    setIsSubmitting(false);

    if (result.error) {
      setFormError(result.error);
      return;
    }

    addToast(
      'success',
      'Staff Account Created',
      `Added ${fullName.trim()} as ${selectedRole === 'admin' ? 'Administrator' : 'Support Coordinator'}.`
    );

    setIsAddModalOpen(false);
    // Reset form
    setFullName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setSelectedRole('support');
    setFormError(null);

    // Refresh list
    fetchStaff();
  };

  const handleToggleRole = async (member: UserProfile) => {
    const newRole: 'admin' | 'support' = member.role === 'admin' ? 'support' : 'admin';
    const result = await authService.updateStaffRole(member.id, newRole);

    if (result.error) {
      addToast('error', 'Update Failed', result.error);
    } else {
      addToast('success', 'Role Updated', `${member.fullName} role changed to ${newRole}.`);
      setStaffList((prev) =>
        prev.map((item) => (item.id === member.id ? { ...item, role: newRole } : item))
      );
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const result = await authService.deleteStaffMember(deleteTarget.id);

    if (result.error) {
      addToast('error', 'Deletion Failed', result.error);
    } else {
      addToast('info', 'Staff Account Removed', `Removed ${deleteTarget.fullName}.`);
      setStaffList((prev) => prev.filter((item) => item.id !== deleteTarget.id));
    }
    setDeleteTarget(null);
  };

  const totalStaff = staffList.length;
  const adminCount = staffList.filter((s) => s.role === 'admin').length;
  const supportCount = staffList.filter((s) => s.role === 'support').length;

  const columns: Column<UserProfile>[] = [
    {
      key: 'fullName',
      header: 'Staff Member',
      render: (member) => (
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
              member.role === 'admin'
                ? 'bg-navy text-mint border border-mint/30'
                : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
            }`}
          >
            {member.role === 'admin' ? (
              <ShieldCheck className="w-4 h-4" />
            ) : (
              <Headphones className="w-4 h-4" />
            )}
          </div>
          <div>
            <span className="font-heading font-bold text-navy text-sm block">
              {member.fullName}
            </span>
            <span className="text-xs text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3 h-3 text-slate-400" />
              {member.email}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Assigned Role',
      render: (member) => (
        <div>
          {member.role === 'admin' ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-navy text-mint border border-mint/30 shadow-2xs">
              <Shield className="w-3 h-3 text-mint" />
              Administrator
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
              <Headphones className="w-3 h-3 text-[#088F5B]" />
              Support Coordinator
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Contact Details',
      render: (member) => (
        <span className="text-xs text-slate-600 flex items-center gap-1.5">
          {member.phone ? (
            <>
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              {member.phone}
            </>
          ) : (
            <span className="text-slate-400 italic">No phone recorded</span>
          )}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Added Date',
      render: (member) => (
        <span className="text-xs font-mono text-slate-500">
          {member.createdAt || 'Active'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Permissions & Actions',
      render: (member) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleToggleRole(member)}
            className="px-2.5 py-1 text-xs font-medium text-navy hover:bg-slate-100 rounded border border-slate-200 transition-colors"
            title={`Switch to ${member.role === 'admin' ? 'Support' : 'Admin'}`}
          >
            Switch to {member.role === 'admin' ? 'Support' : 'Admin'}
          </button>
          <button
            onClick={() => setDeleteTarget(member)}
            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
            title="Remove account"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff &amp; Support Team"
        description="Create and manage authorized staff members for incident coordination, secure band lookups, and administrative operations."
        actions={
          <div className="flex items-center gap-2">
            <Button
              onClick={fetchStaff}
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
            <Button
              onClick={() => {
                setFormError(null);
                setIsAddModalOpen(true);
              }}
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Staff Member
            </Button>
          </div>
        }
      />

      {/* Role Access Summary Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-brand border border-border-subtle shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Team
            </span>
            <UserCheck className="w-4 h-4 text-navy" />
          </div>
          <span className="text-2xl font-bold font-heading text-navy mt-1 block">
            {totalStaff}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            Internal office accounts
          </span>
        </div>

        <div className="p-4 bg-emerald-50/50 rounded-brand border border-emerald-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              Support Coordinators
            </span>
            <Headphones className="w-4 h-4 text-[#088F5B]" />
          </div>
          <span className="text-2xl font-bold font-heading text-emerald-950 mt-1 block">
            {supportCount}
          </span>
          <span className="text-[11px] text-emerald-700 block mt-0.5">
            Access to Incidents &amp; Band Lookup
          </span>
        </div>

        <div className="p-4 bg-navy text-white rounded-brand border border-navy-light shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-mint uppercase tracking-wider">
              Administrators
            </span>
            <ShieldCheck className="w-4 h-4 text-mint" />
          </div>
          <span className="text-2xl font-bold font-heading text-white mt-1 block">
            {adminCount}
          </span>
          <span className="text-[11px] text-slate-300 block mt-0.5">
            Full management &amp; payout control
          </span>
        </div>
      </div>

      {/* Staff Table */}
      <DataTable
        columns={columns}
        data={staffList}
        keyExtractor={(item) => item.id}
        emptyTitle="No Staff Accounts"
        emptyDescription="Create your first support coordinator or administrator account above."
      />

      {/* Modal: Create Staff Member */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Staff or Support Member"
        description="Create an authorized internal account with instant portal login credentials."
        maxWidth="md"
      >
        <form onSubmit={handleAddStaffSubmit} className="space-y-4">
          {formError && (
            <div className="p-3.5 bg-red-50 rounded-brand border border-red-200 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-red-800 leading-relaxed font-medium">
                {formError}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Full Name" required hint="e.g. Morgan Taylor">
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Staff Member Name"
                required
              />
            </FormField>

            <FormField label="Role / Privileges" required>
              <Select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as any)}
              >
                <option value="support">Support Coordinator</option>
                <option value="admin">Full Administrator</option>
              </Select>
            </FormField>
          </div>

          <FormField label="Staff Email Address" required hint="Used for portal login at /admin/login">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="staff@we4u.com"
              required
            />
          </FormField>

          <FormField label="Contact Telephone" hint="Optional office extension / direct phone">
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 012-3456"
            />
          </FormField>

          <FormField
            label="Initial Password"
            required
            hint="Must be at least 6 characters"
          >
            <div className="relative flex items-center gap-2">
              <div className="relative flex-1">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create secure password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-navy"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="px-3 py-2 text-xs font-semibold text-navy bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-brand whitespace-nowrap transition-colors"
              >
                Generate
              </button>
            </div>
          </FormField>

          {/* Role Access Scope Box */}
          <div className="p-3 bg-slate-50 rounded-brand border border-slate-200 text-xs space-y-1">
            <span className="font-bold text-navy block">
              {selectedRole === 'support'
                ? 'Support Coordinator Permissions:'
                : 'Administrator Permissions:'}
            </span>
            <p className="text-slate-600 leading-relaxed">
              {selectedRole === 'support'
                ? 'Can access Incident Queue, perform Band Reference Lookups, view authorized parent emergency contacts, and record contact attempts.'
                : 'Full access to all system operations, registration approvals, vendor commission payouts, service plans, and staff management.'}
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              variant="outline"
              size="md"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="mint"
              size="md"
              disabled={isSubmitting}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              {isSubmitting ? 'Creating Account...' : 'Create Staff Member'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Remove Staff Account?"
        message={`Are you sure you want to revoke access for ${deleteTarget?.fullName} (${deleteTarget?.email})?`}
        confirmLabel="Revoke Access"
        variant="danger"
      />
    </div>
  );
};

export default StaffListPage;
