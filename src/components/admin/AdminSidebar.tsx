import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Logo } from '../common/Logo';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Radio,
  Store,
  CreditCard,
  Layers,
  Banknote,
  Receipt,
  PiggyBank,
  AlertTriangle,
  Mail,
  BarChart3,
  Settings,
  History,
  ExternalLink,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const { registrations, incidents, enquiries, commissions } = useApp();

  const pendingRegs = registrations.filter((r) => r.status === 'pending_verification').length;
  const openIncidents = incidents.filter((i) => i.status === 'open' || i.status === 'contacting_guardian').length;
  const newEnquiries = enquiries.filter((e) => e.status === 'new').length;
  const pendingComms = commissions.filter((c) => c.status === 'pending').length;

  const navGroups = [
    {
      title: 'Operations',
      items: [
        { to: '/admin', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" />, end: true },
        {
          to: '/admin/registrations',
          label: 'Registrations',
          icon: <ClipboardList className="w-4 h-4" />,
          badge: pendingRegs > 0 ? pendingRegs : undefined,
          badgeColor: 'bg-amber-400 text-navy font-bold',
        },
        {
          to: '/admin/incidents',
          label: 'Office Incidents',
          icon: <AlertTriangle className="w-4 h-4" />,
          badge: openIncidents > 0 ? openIncidents : undefined,
          badgeColor: 'bg-rose-500 text-white font-bold',
        },
        { to: '/admin/children', label: 'Wearers & Contacts', icon: <Users className="w-4 h-4" /> },
        { to: '/admin/bands', label: 'Band Inventory', icon: <Radio className="w-4 h-4" /> },
      ],
    },
    {
      title: 'Retail & Commercial',
      items: [
        { to: '/admin/vendors', label: 'Vendor Shops', icon: <Store className="w-4 h-4" /> },
        { to: '/admin/plans', label: 'Service Plans', icon: <Layers className="w-4 h-4" /> },
        { to: '/admin/subscriptions', label: 'Subscriptions', icon: <CreditCard className="w-4 h-4" /> },
        { to: '/admin/payments', label: 'Payments', icon: <Receipt className="w-4 h-4" /> },
        {
          to: '/admin/commissions',
          label: 'Commissions',
          icon: <Banknote className="w-4 h-4" />,
          badge: pendingComms > 0 ? pendingComms : undefined,
          badgeColor: 'bg-mint text-navy font-bold',
        },
        { to: '/admin/payouts', label: 'Vendor Payouts', icon: <PiggyBank className="w-4 h-4" /> },
      ],
    },
    {
      title: 'System & Reports',
      items: [
        {
          to: '/admin/enquiries',
          label: 'Website Enquiries',
          icon: <Mail className="w-4 h-4" />,
          badge: newEnquiries > 0 ? newEnquiries : undefined,
          badgeColor: 'bg-sky-400 text-navy font-bold',
        },
        { to: '/admin/reports', label: 'Reports & Summaries', icon: <BarChart3 className="w-4 h-4" /> },
        { to: '/admin/activity', label: 'Activity Log', icon: <History className="w-4 h-4" /> },
        { to: '/admin/settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-navy text-white selection:bg-mint selection:text-navy">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-white/10 flex-shrink-0">
        <Logo variant="light" size="sm" to="/admin" />
        <span className="text-[10px] font-mono uppercase tracking-wider bg-mint-pale/10 text-mint px-2 py-0.5 rounded border border-mint/20">
          Demo Admin
        </span>
        {/* Mobile close */}
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links Scrollable Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-4 space-y-6">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <span className="px-3 text-[11px] font-heading font-semibold uppercase tracking-wider text-slate-400 block mb-2">
              {group.title}
            </span>
            {group.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-brand text-xs sm:text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-white/15 text-white font-semibold shadow-sm border-l-4 border-mint pl-2'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-mint opacity-85">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${item.badgeColor || 'bg-mint text-navy'}`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      {/* Bottom Quick Link back to Public Website */}
      <div className="p-3 border-t border-white/10 flex-shrink-0">
        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2 rounded-brand bg-white/5 hover:bg-white/10 text-xs text-slate-300 hover:text-white transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-mint" />
            <span>Open Public Website</span>
          </span>
          <span className="text-[10px] text-slate-400">New Tab ↗</span>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 border-r border-border-subtle shadow-card flex-shrink-0 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm" onClick={onClose} />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
