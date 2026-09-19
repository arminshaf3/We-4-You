import React from 'react';
import { PageHeader } from '../../components/admin/PageHeader';
import { useApp } from '../../context/AppContext';
import { History, Shield, User, Clock, Info } from 'lucide-react';

export const ActivityHistoryPage: React.FC = () => {
  const { activity } = useApp();

  return (
    <div>
      <PageHeader
        title="Demonstration Activity History"
        description="Chronological log of simulated administrative actions, vendor modifications, approvals, and payout records."
      />

      {/* Scope Disclaimer */}
      <div className="p-4 bg-slate-50 rounded-brand border border-slate-200 text-xs text-content-muted mb-6 flex items-start gap-2.5 max-w-2xl">
        <Info className="w-4 h-4 text-navy flex-shrink-0 mt-0.5" />
        <div>
          <strong>Notice:</strong> This timeline logs actions performed during the demonstration session in browser memory. It is a visual representation for demonstration evaluation and is not a tamper-proof production audit trail.
        </div>
      </div>

      <div className="bg-white rounded-brand border border-border-subtle shadow-subtle p-6 max-w-4xl space-y-6">
        {activity.length > 0 ? (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {activity.map((act) => (
              <div key={act.id} className="relative text-xs space-y-1">
                {/* Node dot */}
                <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-navy border-2 border-white ring-2 ring-mint/40" />
                
                <div className="flex items-center justify-between text-[11px] text-content-muted">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-navy">{act.actor}</span>
                    <span className="text-slate-300">&bull;</span>
                    <span className="font-mono bg-neutral-soft px-1.5 py-0.2 rounded border">
                      {act.actionType}
                    </span>
                  </div>
                  <span>{act.timestamp}</span>
                </div>

                <p className="text-sm font-medium text-content-body leading-relaxed pt-0.5">
                  {act.description}
                </p>

                <span className="text-[10px] text-content-muted block font-mono">
                  Entity: {act.entityType} ({act.entityId})
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-content-muted italic">No activity recorded yet.</p>
        )}
      </div>
    </div>
  );
};
