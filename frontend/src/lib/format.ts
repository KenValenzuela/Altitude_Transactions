/**
 * Presentation helpers shared across screens: money, dates, party initials, and
 * derived "days until" values. Pure functions, no side effects.
 */
import type { ApiParty, PartyRole } from '@/types/api';

export function formatPrice(dollars: number): string {
  return `$${dollars.toLocaleString('en-US')}`;
}

/** "2025-11-20" → { mon: "Nov", day: "20", dow: "Thu" } */
export function splitDate(iso: string | null): { mon: string; day: string; dow: string } {
  if (!iso) return { mon: '—', day: '', dow: '' };
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return { mon: iso, day: '', dow: '' };
  return {
    mon: d.toLocaleDateString('en-US', { month: 'short' }),
    day: String(d.getDate()),
    dow: d.toLocaleDateString('en-US', { weekday: 'short' }),
  };
}

export function formatDateShort(iso: string | null): string {
  const { mon, day } = splitDate(iso);
  return day ? `${mon} ${day}` : mon;
}

/** Whole days from `from` (default today) to the ISO date; negative if past. */
export function daysUntil(iso: string | null, from: Date = new Date()): number | null {
  if (!iso) return null;
  const target = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const base = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  return Math.round((target.getTime() - base.getTime()) / 86_400_000);
}

export function initialsFromName(name: string): string {
  const cleaned = name.replace(/\(.*?\)/g, '').trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const ROLE_LABELS: Record<PartyRole, string> = {
  buyer: 'Buyer',
  seller: 'Seller',
  listing_agent: 'Listing Agent',
  lender: 'Lender',
  title: 'Title',
  inspector: 'Inspector',
};

const ROLE_COLORS: Record<PartyRole, string> = {
  buyer: '#1E3A66',
  seller: '#B8862F',
  listing_agent: '#5C6B82',
  lender: '#4A6B82',
  title: '#B8624A',
  inspector: '#85724B',
};

export function roleLabel(role: PartyRole): string {
  return ROLE_LABELS[role] ?? role;
}

export function partyColor(party: ApiParty): string {
  return ROLE_COLORS[party.role] ?? '#5C6B82';
}
