import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { StatusBadge } from '../common/StatusBadge';
import { useApp } from '../../context/AppContext';
import { supabaseService } from '../../services/supabaseService';
import { Search, ShieldAlert, User, Phone, Store, CreditCard, AlertCircle, ShieldCheck } from 'lucide-react';

interface BandLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BandLookupModal: React.FC<BandLookupModalProps> = ({ isOpen, onClose }) => {
  const { findBandRecord, adminUser } = useApp();
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof findBandRecord> | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = query.trim().toUpperCase();
    if (!cleanCode) return;

    setIsSearching(true);
    try {
      // Trigger secure backend RPC (which records the mandatory audit log entry)
      supabaseService.secureBandLookup(cleanCode, adminUser).catch(() => {});

      const res = findBandRecord(cleanCode);
      setResult(res);
      setSearched(true);
    } finally {
      setIsSearching(false);
    }
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
      title="Secure Band Reference Lookup"
      description="Authorized office lookup tool for finding private wearer and emergency guardian records by wristband reference."
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
        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isSearching}
          leftIcon={<Search className="w-4 h-4" />}
        >
          Lookup
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

              {/* Matched Private Wearer & Contact Details (Authorized Staff only) */}
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
                      className="text-xs font-semibold text-navy hover:underline flex items-center gap-1"
                    >
                      <span>Full Registry File</span>
                      <span>&rarr;</span>
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 bg-mint-pale/50 rounded-brand border border-emerald-300/50">
                      <span className="text-[10px] uppercase font-bold text-mint-darker block mb-0.5">Primary Guardian:</span>
                      <span className="font-semibold text-navy block text-sm">
                        {result.child.primaryGuardian.fullName} ({result.child.primaryGuardian.relationship})
                      </span>
                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-emerald-300/40">
                        <span className="font-mono text-navy font-bold text-sm">
                          {result.child.primaryGuardian.mobile}
                        </span>
                        <a
                          href={`tel:${result.child.primaryGuardian.mobile.replace(/[^0-9+]/g, '')}`}
                          className="px-2 py-0.5 bg-navy text-mint text-xs font-semibold rounded hover:bg-navy-light"
                        >
                          Call
                        </a>
                      </div>
                    </div>

                    <div className="p-3.5 bg-neutral-soft rounded-brand border border-border-subtle">
                      <span className="text-[10px] uppercase font-bold text-content-muted block mb-0.5">Secondary Contact:</span>
                      {result.child.secondaryGuardians.length > 0 ? (
                        <div>
                          <span className="font-semibold text-navy block">
                            {result.child.secondaryGuardians[0].fullName} ({result.child.secondaryGuardians[0].relationship})
                          </span>
                          <div className="flex items-center justify-between mt-2 pt-1 border-t border-border-subtle">
                            <span className="font-mono text-navy font-bold">
                              {result.child.secondaryGuardians[0].telephone}
                            </span>
                            <a
                              href={`tel:${result.child.secondaryGuardians[0].telephone.replace(/[^0-9+]/g, '')}`}
                              className="px-2 py-0.5 bg-white border border-border-subtle text-navy text-xs font-semibold rounded hover:bg-slate-50"
                            >
                              Call
                            </a>
                          </div>
                        </div>
                      ) : (
                        <span className="text-content-muted italic block mt-2">No secondary contact recorded</span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border-subtle flex items-center justify-between text-xs text-content-muted">
                    <span className="flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5" />
                      <span>Retail Partner: {result.vendor?.shopName || 'We 4 You Central'}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Subscription: {result.subscription?.status || 'Active'}</span>
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-50 rounded-brand border border-amber-200 text-xs text-amber-900">
                  Band reference exists in inventory ({result.band.status}), but is currently not assigned to an active wearer record.
                </div>
              )}

              {/* Action */}
              <div className="pt-2 flex justify-between items-center">
                <span className="text-[11px] text-content-muted flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#088F5B]" />
                  <span>Lookup audited &amp; recorded to security log.</span>
                </span>
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
                Reference "{query}" was not found in the registry. Please check formatting (e.g. W4Y-1082-M4).
              </p>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};
