import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { BandLookupModal } from './BandLookupModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import {
  Menu,
  Search,
  RotateCcw,
  LogOut,
  User,
  ShieldCheck,
  Sparkles,
  Command,
} from 'lucide-react';

interface AdminTopbarProps {
  onToggleSidebar: () => void;
}

export const AdminTopbar: React.FC<AdminTopbarProps> = ({ onToggleSidebar }) => {
  const { adminUser, logoutAdmin, resetDemoData } = useApp();
  const navigate = useNavigate();

  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleLogout = () => {
    logoutAdmin();
    navigate('/admin/login');
  };

  const handleResetConfirm = () => {
    resetDemoData();
    setIsResetConfirmOpen(false);
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-border-subtle sticky top-0 z-20 w-full shadow-xs">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          
          {/* Left: Mobile Toggle & Sleek Search Action */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 text-navy hover:bg-neutral-soft rounded-brand border border-border-subtle focus:outline-none focus:ring-2 focus:ring-navy"
              aria-label="Toggle navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Premium Search Band Reference Action */}
            <button
              onClick={() => setIsLookupOpen(true)}
              className="group flex items-center gap-2.5 px-3.5 py-2 rounded-brand bg-slate-50 hover:bg-slate-100 border border-slate-200/80 hover:border-slate-300 text-xs sm:text-sm text-slate-600 transition-all focus:outline-none focus:ring-2 focus:ring-navy"
              title="Search private records by band code"
            >
              <Search className="w-4 h-4 text-slate-400 group-hover:text-navy transition-colors" />
              <span className="hidden sm:inline font-medium text-slate-600 group-hover:text-navy">
                Search Band Reference...
              </span>
              <span className="sm:hidden font-medium text-slate-600">Lookup</span>
              <span className="hidden md:flex items-center gap-1 text-[10px] font-mono font-medium bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-400 shadow-2xs">
                <span>Exact Match</span>
              </span>
            </button>
          </div>

          {/* Right: Demo Notice, Reset Action & User Menu */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            
            {/* Demonstration Environment Tag */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50/80 border border-amber-200/70 text-[11px] font-medium text-amber-900">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span>Interactive Demo</span>
            </div>

            {/* Reset Demo Data Button */}
            <button
              onClick={() => setIsResetConfirmOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-brand text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200/80 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-400"
              title="Reset all demonstration records to initial fixtures"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reset Demo</span>
            </button>

            {/* Logged-In User Profile */}
            <div className="flex items-center gap-2.5 pl-2.5 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-navy text-mint flex items-center justify-center font-bold text-xs shadow-xs">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden sm:block text-left">
                <span className="block text-xs font-heading font-semibold text-navy leading-tight truncate max-w-[130px]">
                  {adminUser}
                </span>
                <span className="text-[10px] text-slate-500 font-medium leading-none block mt-0.5">
                  Office Coordinator
                </span>
              </div>

              {/* Logout Action */}
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-navy rounded-brand hover:bg-slate-100 transition-colors ml-0.5 focus:outline-none focus:ring-2 focus:ring-navy"
                title="Sign out of demo"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Band Lookup Modal */}
      <BandLookupModal isOpen={isLookupOpen} onClose={() => setIsLookupOpen(false)} />

      {/* Reset Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleResetConfirm}
        title="Reset Demonstration Data?"
        message="This action will restore all vendors, child registrations, bands, subscription plans, payments, and incidents to their initial demonstration state. Any newly created entries will be reset."
        confirmLabel="Reset All Demo Data"
        variant="danger"
      />
    </>
  );
};
