import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/admin/PageHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { BandLookupModal } from '../../components/admin/BandLookupModal';
import { Button } from '../../components/common/Button';
import { useApp } from '../../context/AppContext';
import {
  ClipboardList,
  AlertTriangle,
  CreditCard,
  Banknote,
  Search,
  ArrowRight,
  ShieldCheck,
  User,
  Radio,
  Clock,
  Store,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export const OverviewDashboard: React.FC = () => {
  const { registrations, incidents, subscriptions, commissions, activity, bands, childrenRecords } = useApp();
  const [isLookupOpen, setIsLookupOpen] = useState(false);

  // Derived Metrics
  const pendingRegistrations = registrations.filter((r) => r.status === 'pending_verification');
  const openIncidents = incidents.filter((i) => i.status === 'open' || i.status === 'contacting_guardian');
  const expiringSubscriptions = subscriptions.filter((s) => s.status === 'expiring_soon');
  const pendingCommissions = commissions.filter((c) => c.status === 'pending');
  const availableBands = bands.filter((b) => b.status === 'available');

  return (
    <div className="space-y-8">
      <PageHeader
        title="Operations Overview"
        description="Monitor priority review queues, incoming assistance incidents, and operational metrics."
        actions={
          <Button
            onClick={() => setIsLookupOpen(true)}
            variant="primary"
            size="md"
            leftIcon={<Search className="w-4 h-4" />}
          >
            Exact Band Lookup
          </Button>
        }
      />

      {/* 4 Key Priority Summary Cards - Enterprise Aligned Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Pending Registrations */}
        <Link
          to="/admin/registrations"
          className="p-5 rounded-brand bg-white border border-slate-200/90 shadow-xs hover:shadow-subtle hover:border-slate-300 transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-heading font-semibold uppercase tracking-wider text-slate-500">
                Pending Registrations
              </span>
              <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ClipboardList className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-heading font-bold text-navy">
                {pendingRegistrations.length}
              </span>
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                Needs Review
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Guardian &amp; band checks</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-navy group-hover:translate-x-0.5 transition-all" />
          </div>
        </Link>

        {/* Active Assistance Incidents */}
        <Link
          to="/admin/incidents"
          className="p-5 rounded-brand bg-white border border-slate-200/90 shadow-xs hover:shadow-subtle hover:border-slate-300 transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-heading font-semibold uppercase tracking-wider text-slate-500">
                Active Incidents
              </span>
              <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-heading font-bold text-navy">
                {openIncidents.length}
              </span>
              <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200/60">
                Requires Follow-up
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Child / band reports</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-navy group-hover:translate-x-0.5 transition-all" />
          </div>
        </Link>

        {/* Expiring Subscriptions */}
        <Link
          to="/admin/subscriptions"
          className="p-5 rounded-brand bg-white border border-slate-200/90 shadow-xs hover:shadow-subtle hover:border-slate-300 transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-heading font-semibold uppercase tracking-wider text-slate-500">
                Expiring Soon
              </span>
              <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-heading font-bold text-navy">
                {expiringSubscriptions.length}
              </span>
              <span className="text-xs font-semibold text-orange-800 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200/60">
                Within 30 Days
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Renewals &amp; extensions</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-navy group-hover:translate-x-0.5 transition-all" />
          </div>
        </Link>

        {/* Pending Commissions */}
        <Link
          to="/admin/commissions"
          className="p-5 rounded-brand bg-white border border-slate-200/90 shadow-xs hover:shadow-subtle hover:border-slate-300 transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-heading font-semibold uppercase tracking-wider text-slate-500">
                Commissions Queue
              </span>
              <div className="w-8 h-8 rounded-full bg-mint-pale text-mint-darker flex items-center justify-center group-hover:scale-105 transition-transform">
                <Banknote className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-heading font-bold text-navy">
                {pendingCommissions.length}
              </span>
              <span className="text-xs font-semibold text-mint-darker bg-mint-pale px-2 py-0.5 rounded-full border border-emerald-300/50">
                Pending Approval
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Vendor attribution sales</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-navy group-hover:translate-x-0.5 transition-all" />
          </div>
        </Link>

      </div>

      {/* Main Two-Column Layout with Balanced Proportions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (8 cols): Priority Pending Registrations & Incidents */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Section: Pending Registrations Queue Preview */}
          <div className="bg-white rounded-brand border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ClipboardList className="w-4 h-4 text-navy" />
                <h2 className="text-base font-heading font-bold text-navy">
                  Registration Review Queue
                </h2>
              </div>
              <Link
                to="/admin/registrations"
                className="text-xs font-semibold text-navy hover:underline flex items-center gap-1"
              >
                <span>View All ({registrations.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {pendingRegistrations.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {pendingRegistrations.slice(0, 4).map((reg) => (
                  <div key={reg.id} className="p-5 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <Link
                          to={`/admin/registrations/${reg.id}`}
                          className="font-mono font-bold text-sm text-navy hover:underline"
                        >
                          {reg.referenceNumber}
                        </Link>
                        <StatusBadge status={reg.status} size="sm" />
                        <span className="text-xs font-mono font-bold bg-mint-pale text-navy px-2 py-0.5 rounded border border-emerald-300">
                          {reg.bandCode}
                        </span>
                      </div>
                      <p className="text-xs text-content-body truncate">
                        Child: <strong>{reg.child.name}</strong> &bull; Guardian: {reg.guardian.fullName} ({reg.guardian.relationship})
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-content-muted">
                        <span>Submitted: {reg.submissionDate}</span>
                        <span>&bull;</span>
                        <span>Payment: <strong>{reg.paymentStatus}</strong></span>
                      </div>
                    </div>

                    <Link
                      to={`/admin/registrations/${reg.id}`}
                      className="px-4 py-1.5 text-xs font-heading font-semibold text-navy bg-mint-pale hover:bg-mint/40 rounded-brand border border-emerald-300/60 transition-colors flex-shrink-0 shadow-2xs"
                    >
                      Review
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center text-content-muted text-xs">
                No registrations currently pending review. All submissions are up to date.
              </div>
            )}
          </div>

          {/* Section: Open Assistance Incidents */}
          <div className="bg-white rounded-brand border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <h2 className="text-base font-heading font-bold text-navy">
                  Assistance Incidents Needing Follow-up
                </h2>
              </div>
              <Link
                to="/admin/incidents"
                className="text-xs font-semibold text-navy hover:underline flex items-center gap-1"
              >
                <span>All Incidents ({incidents.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {openIncidents.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {openIncidents.map((inc) => (
                  <div key={inc.id} className="p-5 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2.5">
                        <Link to={`/admin/incidents/${inc.id}`} className="font-mono font-bold text-sm text-navy hover:underline">
                          {inc.incidentRef}
                        </Link>
                        <StatusBadge status={inc.status} size="sm" />
                        <span className="text-xs font-mono font-bold text-navy bg-mint-pale px-2 py-0.5 rounded border border-emerald-300">
                          {inc.bandReference}
                        </span>
                      </div>
                      <p className="text-xs text-content-body truncate">
                        Location: {inc.voluntaryLocation || 'Not reported'} &bull; Caller: {inc.callerName || 'Anonymous'}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-content-muted">
                        <span>Logged: {inc.createdAt}</span>
                        <span>&bull;</span>
                        <span>Attempts: {inc.attempts.length} recorded</span>
                      </div>
                    </div>

                    <Link
                      to={`/admin/incidents/${inc.id}`}
                      className="px-4 py-1.5 text-xs font-heading font-semibold text-white bg-navy hover:bg-navy-light rounded-brand transition-colors flex-shrink-0 shadow-2xs"
                    >
                      Follow-up
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-10 text-center text-content-muted text-xs">
                No active incidents currently requiring follow-up.
              </div>
            )}
          </div>

        </div>

        {/* Right Column (4 cols): Fast Band Lookup Card, Inventory Snapshot & Activity Feed */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Exact Band Search Callout */}
          <div className="bg-navy text-white p-6 rounded-brand border border-navy-light shadow-card space-y-3">
            <div className="flex items-center gap-2 text-mint">
              <Search className="w-5 h-5" />
              <h3 className="font-heading font-bold text-base text-white">
                Exact Band Reference Lookup
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Instantly retrieve private child and guardian contact files by querying the unique printed band code.
            </p>
            <Button
              onClick={() => setIsLookupOpen(true)}
              variant="mint"
              size="md"
              className="w-full"
            >
              Open Lookup Tool
            </Button>
          </div>

          {/* Quick Inventory Summary */}
          <div className="bg-white p-5 rounded-brand border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-[11px] font-heading font-bold uppercase tracking-wider text-slate-500">
                Band Inventory Snapshot
              </h4>
              <Radio className="w-4 h-4 text-slate-400" />
            </div>
            <div className="space-y-2.5 text-xs pt-1">
              <div className="flex items-center justify-between">
                <span className="text-content-muted">Total Band Inventory:</span>
                <span className="font-mono font-bold text-navy">{bands.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-content-muted">Assigned to Children:</span>
                <span className="font-mono font-bold text-[#088F5B]">{childrenRecords.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-content-muted">Available in Stock:</span>
                <span className="font-mono font-bold text-navy">{availableBands.length}</span>
              </div>
            </div>
            <div className="pt-3 border-t border-slate-100">
              <Link
                to="/admin/bands"
                className="text-xs font-semibold text-navy hover:underline flex items-center justify-between"
              >
                <span>Manage Band Stock</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>

          {/* Recent Activity Log */}
          <div className="bg-white p-5 rounded-brand border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-[11px] font-heading font-bold uppercase tracking-wider text-slate-500">
                Recent Demonstration Actions
              </h4>
              <Link to="/admin/activity" className="text-[11px] font-semibold text-navy hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3 pt-1">
              {activity.slice(0, 5).map((act) => (
                <div key={act.id} className="text-xs space-y-1 pb-2.5 border-b border-slate-100 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between text-[10px] text-content-muted">
                    <span className="font-semibold text-navy">{act.actor}</span>
                    <span className="font-mono">{act.timestamp.substring(11)}</span>
                  </div>
                  <p className="text-slate-700 leading-snug font-medium">
                    {act.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Exact Band Lookup Modal */}
      <BandLookupModal isOpen={isLookupOpen} onClose={() => setIsLookupOpen(false)} />
    </div>
  );
};
