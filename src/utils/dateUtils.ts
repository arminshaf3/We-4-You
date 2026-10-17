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
 * Formats a timestamp into the user's local date and 12-hour time (e.g., "2026-10-03 06:00 PM").
 */
export function formatActivityTimestamp(timestamp?: string | Date | null): string {
  const d = parseTimestamp(timestamp);
  if (!d) return String(timestamp || '');

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const strHours = String(hours).padStart(2, '0');

  return `${year}-${month}-${day} ${strHours}:${minutes} ${ampm}`;
}

/**
 * Formats a timestamp into just the local 12-hour time (e.g., "06:00 PM").
 */
export function formatActivityTime(timestamp?: string | Date | null): string {
  const d = parseTimestamp(timestamp);
  if (!d) return String(timestamp || '');

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const strHours = String(hours).padStart(2, '0');

  return `${strHours}:${minutes} ${ampm}`;
}

/**
 * Returns a full ISO 8601 string for saving in persistence/database.
 */
export function createIsoTimestamp(): string {
  return new Date().toISOString();
}
