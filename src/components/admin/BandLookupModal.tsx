import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { StatusBadge } from '../common/StatusBadge';
import { useApp } from '../../context/AppContext';
import { Search, ShieldAlert, User, Phone, Store, CreditCard, AlertCircle } from 'lucide-react';

interface BandLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BandLookupModal: React.FC<BandLookupModalProps> = ({ isOpen, onClose }) => {
  const { findBandRecord } = useApp();
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof findBandRecord> | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const res = findBandRecord(query.trim());
    setResult(res);
    setSearched(true);
  };

  const handleReset = () => {
    setQuery('');
    setSearched(false);
    setResult(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        handleReset();
        onClose();
      }}
      title="Exact Band Reference Lookup"
      description="Internal office tool to find private individual and emergency contact records by band reference."
      maxWidth="lg"
    >
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value.toUpperCase())}
          placeholder="Enter printed code (e.g. W4Y-1082-M4)"
          className="flex-1 h-12 px-4 text-base font-mono uppercase font-semibold rounded-brand border border-border-subtle bg-white text-navy focus:outline-none focus:ring-2 focus:ring-navy"
        />
        <Button type="submit" variant="primary" size="md" leftIcon={<Search className="w-4 h-4" />}>
          Search
        </Button>
      </form>

      {searched && (
        <div className="space-y-4 animate-in fade-in">
          {result?.band ? (
            <div className="space-y-4">
              {/* Band Header Card */}
              <div className="p-4 rounded-brand bg-neutral-soft border border-border-subtle flex items-center justify-between">
                <div>
                  <span className="text-xs text-content-muted block">Band Reference Code</span>
                  <span className="text-xl font-mono font-bold text-navy">{result.band.referenceCode}</span>
                </div>
                <StatusBadge status={result.band.status} />
              </div>

              {/* Matched Private Wearer & Contact Details (Admin-only) */}
              {result.child ? (
                <div className="p-5 rounded-brand bg-white border border-border-subtle shadow-subtle space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
                    <div className="flex items-center gap-2 text-navy font-heading font-bold text-base">
                      <User className="w-5 h-5 text-navy" />
                      <span>{result.child.name}</span>
                      <span className="text-xs font-normal text-content-muted">({result.child.ageRange})</span>
                    </div>
                    <Link
                      to={`/admin/children/${result.child.id}`}
                      onClick={onClose}
                      className="text-xs font-semibold text-navy hover:underline"
                    >
                      View Full Wearer Profile →
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-content-muted block mb-0.5">Primary Contact:</span>
                      <span className="font-semibold text-navy block text-sm">
                        {result.child.primaryGuardian.fullName} ({result.child.primaryGuardian.relationship})
                      </span>
                      <span className="font-mono text-navy font-semibold flex items-center gap-1 mt-1">
                        <Phone className="w-3.5 h-3.5 text-[#088F5B]" />
                        {result.child.primaryGuardian.mobile}
                      </span>
                      {result.child.primaryGuardian.email && (
                        <span className="text-content-muted block mt-0.5">{result.child.primaryGuardian.email}</span>
                      )}
                    </div>

                    <div>
                      <span className="text-content-muted block mb-0.5">Emergency Secondary Contact:</span>
                      {result.child.secondaryGuardians.length > 0 ? (
                        <div>
                          <span className="font-semibold text-navy block">
                            {result.child.secondaryGuardians[0].fullName} ({result.child.secondaryGuardians[0].relationship})
                          </span>
                          <span className="font-mono text-navy flex items-center gap-1 mt-0.5">
                            <Phone className="w-3.5 h-3.5 text-navy" />
                            {result.child.secondaryGuardians[0].telephone}
                          </span>
                        </div>
                      ) : (
                        <span className="text-content-muted italic">No secondary contact recorded</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-xs text-content-muted">
                    <span className="flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5" />
                      <span>Vendor: {result.vendor?.shopName || 'We 4 You Office'}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Subscription: {result.subscription?.status || 'Active'}</span>
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 rounded-brand border border-amber-200 text-xs text-amber-900">
                  Band is in inventory ({result.band.status}), but has not been assigned to a wearer record yet.
                </div>
              )}

              {/* Action */}
              <div className="pt-2 flex justify-end">
                <Link
                  to={`/admin/incidents?new=true&band=${result.band.referenceCode}`}
                  onClick={onClose}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-navy text-white text-xs font-semibold rounded-brand hover:bg-navy-light transition-colors"
                >
                  <AlertCircle className="w-4 h-4 text-mint" />
                  <span>Log Assistance Incident for this Band</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-brand border border-slate-200 space-y-2">
              <ShieldAlert className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-base font-heading font-semibold text-navy">No Band Found</h4>
              <p className="text-xs text-content-muted max-w-sm mx-auto">
                Reference "{query}" was not found in the demonstration inventory. Check formatting (e.g. W4Y-XXXX-XX).
              </p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};
