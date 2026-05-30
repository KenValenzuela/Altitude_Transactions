/**
 * Altitude Transactions — Shared Constants
 *
 * Status labels, role labels, and other constants used by web and mobile.
 */

import type {TransactionStatus, TaskStatus, PartyRole} from './domain';

// ── Transaction status display ────────────────────────────────────────────────

export const TRANSACTION_STATUS_LABELS: Record<TransactionStatus, string> = {
    draft: 'Draft',
    under_contract: 'Under Contract',
    in_review: 'Under Review',
    active: 'Active',
    closing: 'Closing',
    closed: 'Closed',
    cancelled: 'Cancelled',
};

export const TRANSACTION_STATUS_ORDER: TransactionStatus[] = [
    'under_contract',
    'in_review',
    'active',
    'closing',
    'closed',
];

// ── Task status display ───────────────────────────────────────────────────────

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
    not_started: 'Not Started',
    in_progress: 'In Progress',
    complete: 'Complete',
    not_applicable: 'N/A',
    todo: 'Not Started',
    doing: 'In Progress',
    done: 'Complete',
    na: 'N/A',
};

// ── Party role display ────────────────────────────────────────────────────────

export const PARTY_ROLE_LABELS: Record<PartyRole, string> = {
    buyer: 'Buyer',
    seller: 'Seller',
    buyers_agent: "Buyer's Agent",
    listing_agent: 'Listing Agent',
    lender: 'Lender',
    title: 'Title / Escrow',
    inspector: 'Inspector',
    appraiser: 'Appraiser',
    insurance: 'Insurance',
    attorney: 'Attorney',
    other: 'Other',
};

// ── Colorado deadline categories ─────────────────────────────────────────────

export const DEADLINE_CATEGORIES = [
    'Inspection',
    'Appraisal',
    'Loan',
    'Title',
    'Survey',
    'HOA',
    'Environmental',
    'Other Conditions',
    'Possession',
    'Closing',
] as const;

export type DeadlineCategory = typeof DEADLINE_CATEGORIES[number];

// ── API configuration ─────────────────────────────────────────────────────────

export const API_VERSION = 'v1';
export const API_DEFAULT_PAGE_SIZE = 20;
