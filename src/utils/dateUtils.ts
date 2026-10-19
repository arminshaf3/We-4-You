/**
 * Timezone-aware date and timestamp formatting utilities.
 * Handles UTC strings, ISO timestamps, and legacy 'YYYY-MM-DD HH:mm' UTC strings
 * and formats them accurately into the user's local timezone.
 */

export function parseTimestamp(timestamp?: string | Date | null): Date | null {
  if (!timestamp) return null;
  if (timestamp instanceof Date) return isNaN(timestamp.getTime()) ? null : timestamp;
  
  let s = String(timestamp).trim();
  if (!s) return null;

  // Legacy timestamps produced by `new Date().toISOString().replace('T', ' ').substring(0, 16)`
  // were generated from UTC. If no timezone offset is present, treat as UTC.
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(s)) {
    s = s.replace(' ', 'T') + ':00Z';
  } else if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(s)) {
    s = s.replace(' ', 'T') + 'Z';
  } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(s)) {
    s = s + ':00Z';
  }

  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Formats a timestamp into the user's local date and 12-hour time with seconds (e.g., "2026-10-19 06:00:25 PM").
 */
export function formatActivityTimestamp(timestamp?: string | Date | null, includeSeconds = true): string {
  const d = parseTimestamp(timestamp);
  if (!d) return String(timestamp || '');

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const strHours = String(hours).padStart(2, '0');

  if (includeSeconds) {
    return `${year}-${month}-${day} ${strHours}:${minutes}:${seconds} ${ampm}`;
  }
  return `${year}-${month}-${day} ${strHours}:${minutes} ${ampm}`;
}

/**
 * Formats a timestamp into just the local 12-hour time (e.g., "06:00 PM" or "06:00:25 PM").
 */
export function formatActivityTime(timestamp?: string | Date | null, includeSeconds = false): string {
  const d = parseTimestamp(timestamp);
  if (!d) return String(timestamp || '');

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const strHours = String(hours).padStart(2, '0');

  if (includeSeconds) {
    return `${strHours}:${minutes}:${seconds} ${ampm}`;
  }
  return `${strHours}:${minutes} ${ampm}`;
}

/**
 * Returns human-readable relative time string (e.g., "Just now", "2m ago", "1h ago", "Yesterday").
 */
export function formatRelativeTime(timestamp?: string | Date | null): string {
  const d = parseTimestamp(timestamp);
  if (!d) return '';

  const now = Date.now();
  const diffMs = now - d.getTime();
  if (diffMs < 0) return 'Just now';

  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 45) return 'Just now';
  if (diffSec < 90) return '1m ago';

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays}d ago`;

  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${month}/${day}`;
}

/**
 * High-status corporate date format for executive PDF reports (e.g. "October 19, 2026, 06:00:25 PM").
 */
export function formatCorporateDateTime(timestamp?: string | Date | null): string {
  const d = parseTimestamp(timestamp);
  if (!d) return String(timestamp || '');

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthName = months[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const strHours = String(hours).padStart(2, '0');

  return `${monthName} ${day}, ${year} at ${strHours}:${minutes}:${seconds} ${ampm}`;
}

/**
 * Returns a full ISO 8601 string for saving in persistence/database.
 */
export function createIsoTimestamp(): string {
  return new Date().toISOString();
}
