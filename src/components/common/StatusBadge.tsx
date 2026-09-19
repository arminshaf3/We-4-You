import React from 'react';

export type StatusBadgeVariant =
  | 'active'
  | 'approved'
  | 'verified'
  | 'resolved'
  | 'available'
  | 'assigned'
  | 'pending'
  | 'pending_verification'
  | 'expiring_soon'
  | 'update_requested'
  | 'in_progress'
  | 'rejected'
  | 'lost'
  | 'expired'
  | 'reversed'
  | 'retired'
  | 'ended'
  | 'inactive'
  | 'new';

interface StatusBadgeProps {
  status: StatusBadgeVariant | string;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'md',
  className = '',
}) => {
  const normalized = status.toLowerCase().replace(/[\s-]/g, '_');

  const getStyle = (s: string) => {
    switch (s) {
      case 'active':
      case 'approved':
      case 'verified':
      case 'resolved':
      case 'available':
      case 'assigned':
        // High contrast dark green text on pale mint background (meets accessibility)
        return 'bg-mint-pale text-mint-darker border border-emerald-300/60 font-semibold';

      case 'pending':
      case 'pending_verification':
      case 'awaiting_confirmation':
        return 'bg-amber-50 text-amber-900 border border-amber-200/80 font-medium';

      case 'expiring_soon':
      case 'contacting_guardian':
        return 'bg-orange-50 text-orange-900 border border-orange-200 font-medium';

      case 'update_requested':
      case 'in_progress':
      case 'new':
        return 'bg-sky-50 text-sky-900 border border-sky-200 font-medium';

      case 'rejected':
      case 'lost':
      case 'expired':
      case 'reversed':
        return 'bg-rose-50 text-rose-900 border border-rose-200 font-medium';

      case 'retired':
      case 'ended':
      case 'inactive':
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200 font-medium';
    }
  };

  const displayText =
    label ||
    status
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 rounded-full',
    md: 'text-xs px-2.5 py-1 rounded-full',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap select-none ${getStyle(
        normalized
      )} ${sizeClasses[size]} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75"></span>
      {displayText}
    </span>
  );
};
