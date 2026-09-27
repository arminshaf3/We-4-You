import React, { useState, useMemo } from 'react';
import { PageHeader } from '../../components/admin/PageHeader';
import { useApp } from '../../context/AppContext';
import {
  History,
  ShieldCheck,
  User,
  Clock,
  Search,
  Filter,
  AlertTriangle,
  ClipboardList,
  CreditCard,
  Store,
  Layers,
  Sparkles,
  Lock,
  Calendar,
  Activity as ActivityIcon,
} from 'lucide-react';

export const ActivityHistoryPage: React.FC = () => {
  const { activity } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'incident' | 'registration' | 'payment' | 'vendor' | 'auth'>('all');

  const getEntityIcon = (entityType?: string, actionType?: string) => {
    switch (entityType?.toLowerCase()) {
      case 'incident':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'registration':
        return <ClipboardList className="w-4 h-4 text-sky-600" />;
      case 'payment':
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case 'vendor':
        return <Store className="w-4 h-4 text-purple-600" />;
      case 'plan':
        return <Layers className="w-4 h-4 text-indigo-600" />;
      case 'settings':
      case 'auth':
        return <ShieldCheck className="w-4 h-4 text-navy" />;
      default:
        return <History className="w-4 h-4 text-slate-500" />;
    }
  };

  const getBadgeStyle = (entityType?: string) => {
    switch (entityType?.toLowerCase()) {
      case 'incident':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'registration':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'payment':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'vendor':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'settings':
      case 'auth':
        return 'bg-navy/5 text-navy border-navy/20';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const filteredActivity = useMemo(() => {
    return activity.filter((act) => {
      const matchesSearch =
        act.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.actionType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.entityId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        categoryFilter === 'all'
          ? true
          : categoryFilter === 'auth'
          ? act.entityType === 'settings' || act.actionType.toLowerCase().includes('sign-in') || act.actionType.toLowerCase().includes('auth')
          : act.entityType === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [activity, searchTerm, categoryFilter]);

  const totalCount = activity.length;
  const incidentEvents = activity.filter((a) => a.entityType === 'incident').length;
  const regEvents = activity.filter((a) => a.entityType === 'registration').length;
  const paymentEvents = activity.filter((a) => a.entityType === 'payment').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Activity History"
        description="Comprehensive chronological audit trail of administrative operations, registrations, incident responses, and system events."
      />

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Events */}
        <div className="p-5 bg-white rounded-brand border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-heading font-semibold uppercase tracking-wider text-slate-500 truncate">
                Total Events
              </span>
              <div className="w-8 h-8 rounded-full bg-slate-100 text-navy flex items-center justify-center flex-shrink-0">
                <ActivityIcon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5">
              <span className="text-2xl sm:text-3xl font-heading font-bold text-navy">
                {totalCount}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
            <span>System audit records</span>
          </div>
        </div>

        {/* Registrations */}
        <div className="p-5 bg-white rounded-brand border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-heading font-semibold uppercase tracking-wider text-sky-700 truncate">
                Registrations
              </span>
              <div className="w-8 h-8 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
                <ClipboardList className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5">
              <span className="text-2xl sm:text-3xl font-heading font-bold text-sky-950">
                {regEvents}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
            <span>Submissions &amp; reviews</span>
          </div>
        </div>

        {/* Incidents & Support */}
        <div className="p-5 bg-white rounded-brand border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-heading font-semibold uppercase tracking-wider text-rose-700 truncate">
                Incident Reports
              </span>
              <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5">
              <span className="text-2xl sm:text-3xl font-heading font-bold text-rose-950">
                {incidentEvents}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
            <span>Attempts &amp; resolutions</span>
          </div>
        </div>

        {/* Payments & Billings */}
        <div className="p-5 bg-white rounded-brand border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-heading font-semibold uppercase tracking-wider text-emerald-800 truncate">
                Payments
              </span>
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#088F5B] flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2.5">
              <span className="text-2xl sm:text-3xl font-heading font-bold text-emerald-950">
                {paymentEvents}
              </span>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
            <span>Verified transactions</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-brand border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search activity description, actor, or entity ID..."
            className="w-full h-10 pl-10 pr-4 text-xs sm:text-sm rounded-brand border border-slate-200 bg-slate-50/50 text-navy placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-navy focus:bg-white transition-all"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'all', label: 'All Events' },
            { id: 'registration', label: 'Registrations' },
            { id: 'incident', label: 'Incidents' },
            { id: 'payment', label: 'Payments' },
            { id: 'vendor', label: 'Vendors' },
            { id: 'auth', label: 'Auth & Access' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id as any)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                categoryFilter === cat.id
                  ? 'bg-navy text-white shadow-2xs font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-navy'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Activity Stream Card */}
      <div className="bg-white rounded-brand border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-navy" />
            <h3 className="text-xs font-heading font-bold text-navy uppercase tracking-wider">
              Audit Event Stream
            </h3>
          </div>
          <span className="text-xs font-medium text-slate-500">
            Showing <strong className="text-navy font-semibold">{filteredActivity.length}</strong> event{filteredActivity.length === 1 ? '' : 's'}
          </span>
        </div>

        {filteredActivity.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredActivity.map((act) => {
              const entityIcon = getEntityIcon(act.entityType, act.actionType);
              const badgeStyle = getBadgeStyle(act.entityType);

              return (
                <div
                  key={act.id}
                  className="p-5 sm:p-6 hover:bg-slate-50/60 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    {/* Event Icon Capsule */}
                    <div className="w-10 h-10 rounded-brand bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-2xs">
                      {entityIcon}
                    </div>

                    {/* Event Body */}
                    <div className="space-y-1.5">
                      {/* Meta header: Actor & Action Badge */}
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-navy font-heading">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {act.actor}
                        </span>

                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badgeStyle}`}>
                          {act.actionType}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-sm font-medium text-slate-800 leading-relaxed">
                        {act.description}
                      </p>

                      {/* Entity Attribution */}
                      <div className="pt-0.5 flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                        <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                          {act.entityType?.toUpperCase()} : {act.entityId}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Timestamp Right aligned */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 flex-shrink-0 text-xs text-slate-500 font-mono">
                    <span className="inline-flex items-center gap-1 bg-slate-50 px-2 py-1 rounded border border-slate-200 text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {act.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <History className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-heading font-bold text-navy">No matching activity records</h4>
            <p className="text-xs text-content-muted mt-1 max-w-sm mx-auto">
              Try adjusting your search criteria or category filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityHistoryPage;
