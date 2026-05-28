/**
 * DEMO FIXTURES — NOT API DATA.
 *
 * These are typed, hand-authored samples in the exact shape of the API contract
 * (`@/types/api`). They exist for two honest reasons:
 *   1. The `/walkthrough` route renders every screen offline for stakeholders.
 *   2. Screen components fall back to these when rendered without live data.
 *
 * The real application paths fetch from the FastAPI backend and pass real data in.
 * Nothing here is persisted or sent anywhere. Keep it clearly separated from the
 * API client so "what's real vs mocked" stays obvious.
 */
import type {
  ApiDeadline,
  ApiDocument,
  ApiParty,
  ApiStage,
  ApiTaskGroup,
  ApiUser,
  ExtractionJob,
  TransactionCard,
  TransactionDetail,
} from '@/types/api';

export const DEMO_USER: ApiUser = {
  id: 'demo-user',
  name: 'Brett Predmore',
  email: 'brett.predmore@icloud.com',
  brokerage: 'RE/MAX Real Estate Group',
  licenseNo: 'FA100002032',
};

export const DEMO_TRANSACTIONS: TransactionCard[] = [
  {
    id: 'demo-tx',
    address: '4902 Cherry Springs Drive',
    city: 'Colorado Springs',
    stage: 'Appraisal',
    status: 'appraisal',
    daysToClose: 15,
    progress: 0.58,
    next: 'Appraisal due Nov 10',
    urgent: true,
    parties: 'Buyer · Seller',
    price: 520000,
    active: true,
  },
  {
    id: 'demo-tx-2',
    address: '1108 Cherry Creek Dr',
    city: 'Denver',
    stage: 'Inspection',
    status: 'inspection',
    daysToClose: 22,
    progress: 0.34,
    next: 'Inspection objection Thu',
    urgent: false,
    parties: 'Nguyen · Park',
    price: 1295000,
    active: false,
  },
];

const DEMO_PARTIES: ApiParty[] = [
  { id: 'p1', role: 'buyer', name: 'Buyer (redacted)', sub: 'Joint Tenants', phone: '(719) 555-0142', email: 'buyer@example.com' },
  { id: 'p2', role: 'seller', name: 'Seller (redacted)', sub: 'Owner-occupant', phone: '(719) 555-0190', email: 'seller@example.com' },
  { id: 'p3', role: 'listing_agent', name: 'Casey Keith', sub: 'Coldwell Banker Realty', phone: '(719) 330-1236', email: 'caseykeith02@gmail.com' },
  { id: 'p4', role: 'title', name: 'Land Title Company', sub: 'Earnest money holder', phone: '(719) 555-0123', email: 'closer@landtitle.com' },
];

const DEMO_STAGES: ApiStage[] = [
  { id: 'under_contract', label: 'Under Contract', day: 0, done: true },
  { id: 'inspection', label: 'Inspection', day: 8, done: true },
  { id: 'appraisal', label: 'Appraisal', day: 18, done: false, current: true },
  { id: 'loan', label: 'Loan Approval', day: 24, done: false },
  { id: 'closing', label: 'Closing', day: 30, done: false },
];

const DEMO_DEADLINES: ApiDeadline[] = [
  { id: 'd1', event: 'Seller’s Property Disclosure', reference: '§ 10', category: 'Seller Disclosures', date: '2025-10-24', rawValue: '10/24/2025', isUrgent: false, isNa: false },
  { id: 'd2', event: 'Inspection Objection', reference: '§ 10', category: 'Inspection and Due Diligence', date: '2025-10-29', rawValue: '10/29/2025', isUrgent: false, isNa: false },
  { id: 'd3', event: 'Inspection Resolution', reference: '§ 10', category: 'Inspection and Due Diligence', date: '2025-10-31', rawValue: '10/31/2025', isUrgent: true, isNa: false },
  { id: 'd4', event: 'Appraisal Deadline', reference: '§ 6', category: 'Appraisal', date: '2025-11-10', rawValue: '11/10/2025', isUrgent: true, isNa: false },
  { id: 'd5', event: 'New Loan Terms Deadline', reference: '§ 5', category: 'Loan and Credit', date: '2025-11-07', rawValue: '11/7/2025', isUrgent: false, isNa: false },
  { id: 'd6', event: 'Closing Date', reference: '§ 12', category: 'Closing and Possession', date: '2025-11-20', rawValue: '11/20/2025', isUrgent: true, isNa: false },
];

const DEMO_TASKS: ApiTaskGroup[] = [
  {
    group: 'Contract & Deadlines',
    items: [
      { id: 't1', group: 'Contract & Deadlines', title: 'Fully executed contract distributed', due: 'Oct 21', state: 'done', isPostClose: false, aiNote: 'AI extracted from §27 signatures' },
      { id: 't2', group: 'Contract & Deadlines', title: 'Earnest money receipted ($5,000)', due: 'Oct 28', state: 'doing', isPostClose: false, aiNote: null },
    ],
  },
  {
    group: 'Inspection',
    items: [
      { id: 't3', group: 'Inspection', title: 'Inspection objection delivered', due: 'Oct 29', state: 'done', isPostClose: false, aiNote: null },
      { id: 't4', group: 'Inspection', title: 'Inspection resolution executed', due: 'Oct 31', state: 'doing', isPostClose: false, aiNote: 'Roof + gazebo provisions per §30' },
    ],
  },
  {
    group: 'Loan & Appraisal',
    items: [
      { id: 't5', group: 'Loan & Appraisal', title: 'Appraisal received', due: 'Nov 10', state: 'todo', isPostClose: false, aiNote: 'Upcoming — high priority' },
      { id: 't6', group: 'Loan & Appraisal', title: 'Loan terms cleared', due: 'Nov 07', state: 'todo', isPostClose: false, aiNote: null },
    ],
  },
  {
    group: 'Closing',
    items: [
      { id: 't7', group: 'Closing', title: 'Final walkthrough', due: 'Nov 19', state: 'todo', isPostClose: false, aiNote: null },
      { id: 't8', group: 'Closing', title: 'Settlement signing', due: 'Nov 20', state: 'todo', isPostClose: false, aiNote: null },
    ],
  },
  {
    group: 'Post-close',
    items: [
      { id: 't9', group: 'Post-close', title: 'Send closing gift', due: 'Day +1', state: 'todo', isPostClose: true, aiNote: null },
      { id: 't10', group: 'Post-close', title: 'Request review from buyer', due: 'Day +5', state: 'todo', isPostClose: true, aiNote: null },
    ],
  },
];

const DEMO_DOCUMENTS: ApiDocument[] = [
  { id: 'doc1', name: 'Contract to Buy and Sell', source: 'CTME', state: 'received', detail: 'CBS1-8-24 · Oct 21' },
  { id: 'doc2', name: 'Seller’s Property Disclosure', source: 'CTME', state: 'received', detail: 'Oct 24' },
  { id: 'doc3', name: 'Inspection report', source: 'Inspector', state: 'received', detail: 'Oct 28' },
  { id: 'doc4', name: 'Appraisal report', source: 'Lender', state: 'pending', detail: 'Due Nov 10' },
  { id: 'doc5', name: 'Closing Disclosure', source: 'Title', state: 'upcoming', detail: '3-day delivery window' },
  { id: 'doc6', name: 'Well / septic permit', source: '—', state: 'na', detail: 'City water & sewer — N/A' },
];

export const DEMO_DETAIL: TransactionDetail = {
  id: 'demo-tx',
  address: '4902 Cherry Springs Drive',
  city: 'Colorado Springs, CO 80923',
  status: 'appraisal',
  property: { id: 'prop1', type: 'Single Family', beds: 4, baths: 3, sqft: 2600, mls: 'PLAT 10743', isRural: false, hasHoa: true },
  parties: DEMO_PARTIES,
  stages: DEMO_STAGES,
  money: { price: 520000, earnest: 5000, closeDate: '2025-11-20', daysToClose: 15 },
  deadlines: DEMO_DEADLINES,
  tasks: DEMO_TASKS,
  documents: DEMO_DOCUMENTS,
  counts: { done: 3, doing: 3, todo: 6, na: 1, active: 9 },
};

export const DEMO_EXTRACTION: ExtractionJob = {
  id: 'demo-job',
  status: 'complete',
  fields: [
    { id: 'f1', label: 'Property', value: '4902 Cherry Springs Drive, Colorado Springs CO 80923', confidence: 0.99, reviewStatus: 'pending', category: 'property' },
    { id: 'f2', label: 'Buyer', value: 'Buyer (redacted)', confidence: 0.94, reviewStatus: 'pending', category: 'party' },
    { id: 'f3', label: 'Seller', value: 'Seller (redacted)', confidence: 0.93, reviewStatus: 'pending', category: 'party' },
    { id: 'f4', label: 'Purchase price', value: '$520,000', confidence: 0.99, reviewStatus: 'pending', category: 'price' },
    { id: 'f5', label: 'Earnest money', value: '$5,000 · Land Title Company', confidence: 0.98, reviewStatus: 'pending', category: 'price' },
    { id: 'f6', label: 'Loan type', value: 'Conventional', confidence: 0.95, reviewStatus: 'pending', category: 'financing' },
  ],
  deadlines: DEMO_DEADLINES,
  flags: [
    { title: 'Association documents required', detail: 'Owners Association deadlines present — HOA docs due Nov 3.' },
    { title: 'Roof replacement provision', detail: '§30.2 — seller to replace roof before closing; buyer approves materials.' },
    { title: 'Gazebo removal provision', detail: '§30.1 — two gazebos to be removed and concrete patched.' },
  ],
};
