export type UserRole = 'admin' | 'agent' | 'buyer_seller_portal' | 'vendor_external';
export type DocumentStatus =
  | 'upload_needed'
  | 'submitted'
  | 'needs_review'
  | 'approved'
  | 'rejected'
  | 'needs_revision'
  | 'not_applicable';
export type DeadlineStatus = 'upcoming' | 'due_soon' | 'overdue' | 'completed' | 'extended' | 'not_applicable';
export type ReviewStatus = 'pending_review' | 'approved' | 'rejected' | 'edited_then_approved';
export type TransactionStatus = 'draft' | 'active' | 'under_contract' | 'closing_soon' | 'closed' | 'archived' | 'cancelled';
export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'not_applicable';
export type ContactRole =
  | 'buyer'
  | 'seller'
  | 'buyer_agent'
  | 'buyer_brokerage'
  | 'listing_agent'
  | 'listing_brokerage'
  | 'lender_loan_officer'
  | 'title_escrow'
  | 'home_inspector'
  | 'hoa_management'
  | 'custom';
export type VendorCategory = 'home_inspector' | 'contractor' | 'title_company' | 'escrow_contact' | 'lender' | 'hoa_contact' | 'insurance' | 'repair_vendor' | 'photographer' | 'cleaner' | 'other';
export type AuditAction =
  | 'document_uploaded'
  | 'document_reviewed'
  | 'document_approved'
  | 'document_rejected'
  | 'document_marked_na'
  | 'deadline_changed'
  | 'amendment_uploaded'
  | 'amendment_approved'
  | 'contact_added'
  | 'contact_edited'
  | 'contact_removed'
  | 'vendor_attached'
  | 'vendor_removed'
  | 'task_completed'
  | 'ai_extraction_reviewed'
  | 'transaction_archived'
  | 'transaction_restored'
  | 'admin_template_changed';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Deadline {
  id: string;
  name: string;
  category: string;
  original_date: string;
  current_date: string;
  responsibleParty: string;
  status: DeadlineStatus;
  riskLevel: RiskLevel;
  relatedDocument?: string;
  relatedTask?: string;
  notes?: string;
  changed_by_amendment_id?: string;
  approved_by?: string;
  approved_at?: string;
}

export interface DocumentChecklistItem {
  id: string;
  name: string;
  category: string;
  required: boolean;
  status: DocumentStatus;
  affectsDeadlines: boolean;
  relatedDeadline?: string;
  relatedTask?: string;
  lastUpdated: string;
  uploadedBy?: string;
  approvedBy?: string;
  notes?: string;
  configurable: boolean;
}

export interface Contact {
  id: string;
  role: ContactRole;
  label: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  required: boolean;
  custom: boolean;
}

export interface Vendor {
  id: string;
  name: string;
  company: string;
  category: VendorCategory;
  phone: string;
  email: string;
  notes: string;
  active: boolean;
  relatedTransactions: string[];
}

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  dueDate: string;
  owner: string;
  relatedDeadline?: string;
}

export interface ReviewItem {
  id: string;
  transactionId: string;
  sourceDocument: string;
  fieldName: string;
  currentValue: string;
  proposedValue: string;
  confidence: number;
  status: ReviewStatus;
  note?: string;
}

export interface Amendment {
  id: string;
  name: string;
  uploadedAt: string;
  status: ReviewStatus;
  changes: Array<{ field: string; originalValue: string; proposedValue: string; approvedValue?: string }>;
  approved_by?: string;
  approved_at?: string;
}

export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  entityType: string;
  entityName: string;
  previousValue?: string;
  newValue?: string;
  user: string;
  timestamp: string;
  source: 'manual' | 'upload' | 'ai_assisted' | 'system';
  aiInvolved: boolean;
  reviewRequired: boolean;
}

export interface Transaction {
  id: string;
  propertyAddress: string;
  buyer: string;
  seller: string;
  agent: string;
  status: TransactionStatus;
  contractDate: string;
  closingDate: string;
  riskLevel: RiskLevel;
  lastUpdated: string;
  notes: string[];
  documents: DocumentChecklistItem[];
  deadlines: Deadline[];
  contacts: Contact[];
  vendors: string[];
  tasks: Task[];
  reviewItems: ReviewItem[];
  amendments: Amendment[];
  audit: AuditLogEntry[];
}

export const statusLabels: Record<DocumentStatus | DeadlineStatus | ReviewStatus | TransactionStatus | TaskStatus, string> = {
  upload_needed: 'Upload Needed',
  submitted: 'Submitted',
  needs_review: 'Needs Review',
  approved: 'Approved',
  rejected: 'Rejected',
  needs_revision: 'Needs Revision',
  not_applicable: 'Not Applicable',
  upcoming: 'Upcoming',
  due_soon: 'Due Soon',
  overdue: 'Overdue',
  completed: 'Completed',
  extended: 'Extended',
  pending_review: 'Pending Review',
  edited_then_approved: 'Edited Then Approved',
  draft: 'Draft',
  active: 'Active',
  under_contract: 'Under Contract',
  closing_soon: 'Closing Soon',
  closed: 'Closed',
  archived: 'Archived',
  cancelled: 'Cancelled',
  todo: 'To Do',
  in_progress: 'In Progress',
};

export const userPermissions: Record<UserRole, { label: string; canConfigure: boolean; canApprove: boolean; canDeleteAdminTemplates: boolean }> = {
  admin: { label: 'Brett / Admin', canConfigure: true, canApprove: true, canDeleteAdminTemplates: true },
  agent: { label: 'Agent / Broker User', canConfigure: false, canApprove: false, canDeleteAdminTemplates: false },
  buyer_seller_portal: { label: 'Buyer / Seller Portal User', canConfigure: false, canApprove: false, canDeleteAdminTemplates: false },
  vendor_external: { label: 'Vendor / External Party', canConfigure: false, canApprove: false, canDeleteAdminTemplates: false },
};

export const documentTemplates = [
  'Contract to Buy and Sell',
  'Seller Property Disclosure',
  'Lead-Based Paint Disclosure',
  'Inspection Objection',
  'Inspection Resolution',
  'Title Commitment',
  'Loan Conditions',
  'HOA Documents',
  'Closing Instructions',
  'Settlement Statement',
  'Contractor Invoice',
  'Repair Receipt',
  'Custom Addendum',
  'Inspection Follow-Up',
  'Custom Vendor Document',
];

export const defaultContactTypes: Array<{ role: ContactRole; label: string; required: boolean }> = [
  { role: 'buyer', label: 'Buyer', required: true },
  { role: 'seller', label: 'Seller', required: true },
  { role: 'buyer_agent', label: "Buyer’s Agent", required: true },
  { role: 'buyer_brokerage', label: 'Buyer Brokerage', required: true },
  { role: 'listing_agent', label: 'Listing Agent', required: true },
  { role: 'listing_brokerage', label: 'Listing Brokerage', required: true },
  { role: 'lender_loan_officer', label: 'Lender / Loan Officer', required: false },
  { role: 'title_escrow', label: 'Title / Escrow', required: true },
  { role: 'home_inspector', label: 'Home Inspector', required: false },
  { role: 'hoa_management', label: 'HOA Management', required: false },
];

const baseDocuments: DocumentChecklistItem[] = [
  { id: 'doc-contract', name: 'Contract to Buy and Sell', category: 'Contract', required: true, status: 'approved', affectsDeadlines: true, relatedDeadline: 'Inspection Objection', relatedTask: 'Seed statutory checklist', lastUpdated: '2026-06-04 10:42', uploadedBy: 'Brett Predmore', approvedBy: 'Brett Predmore', notes: 'Approved after human review. Deadlines seeded.', configurable: true },
  { id: 'doc-sd', name: 'Seller Property Disclosure', category: 'Disclosure', required: true, status: 'needs_review', affectsDeadlines: false, lastUpdated: '2026-06-05 08:18', uploadedBy: 'Listing Agent', notes: 'Verify signatures and property address.', configurable: true },
  { id: 'doc-inspection', name: 'Inspection Resolution', category: 'Inspection', required: true, status: 'upload_needed', affectsDeadlines: true, relatedDeadline: 'Inspection Resolution', lastUpdated: '2026-06-03 16:20', notes: 'Needed before inspection deadline is completed.', configurable: true },
  { id: 'doc-hoa', name: 'HOA Documents', category: 'HOA', required: false, status: 'not_applicable', affectsDeadlines: false, lastUpdated: '2026-06-02 13:04', approvedBy: 'Brett Predmore', notes: 'Marked N/A; property is not subject to HOA.', configurable: true },
  { id: 'doc-title', name: 'Title Commitment', category: 'Title', required: true, status: 'submitted', affectsDeadlines: true, relatedDeadline: 'Title Objection', lastUpdated: '2026-06-05 07:41', uploadedBy: 'Title / Escrow', notes: 'Submitted; awaiting Brett review.', configurable: true },
];

const baseContacts: Contact[] = defaultContactTypes.map((type, index) => ({
  id: `contact-${type.role}`,
  role: type.role,
  label: type.label,
  name: ['Jamie Carter', 'Morgan Lee', 'Alex Rivera', 'Front Range Brokerage', 'Taylor Smith', 'Altitude Listing Group', 'Priya Nair', 'Summit Title Team', 'Peak Home Inspections', ''][index] || 'Add contact',
  company: index === 7 ? 'Summit Title & Escrow' : undefined,
  email: index < 9 ? `${type.role.replaceAll('_', '.')}@example.com` : undefined,
  phone: index < 9 ? '(719) 555-0184' : undefined,
  required: type.required,
  custom: false,
}));

export const vendors: Vendor[] = [
  { id: 'vendor-inspector', name: 'Erin Cole', company: 'Peak Home Inspections', category: 'home_inspector', phone: '(719) 555-0121', email: 'erin@peakinspections.example', notes: 'Preferred inspection partner for Colorado Springs.', active: true, relatedTransactions: ['tx-spruce'] },
  { id: 'vendor-contractor', name: 'Luis Martin', company: 'Front Range Repairs', category: 'contractor', phone: '(720) 555-0145', email: 'luis@frontrangerepairs.example', notes: 'Fast invoice turnaround for inspection resolutions.', active: true, relatedTransactions: ['tx-spruce', 'tx-aspen'] },
  { id: 'vendor-title', name: 'Maya Fox', company: 'Summit Title & Escrow', category: 'title_company', phone: '(303) 555-0119', email: 'maya@summittitle.example', notes: 'Title and escrow contact combined for transaction files.', active: true, relatedTransactions: ['tx-spruce'] },
  { id: 'vendor-cleaner', name: 'Dana Ruiz', company: 'Move-Out Clean Co.', category: 'cleaner', phone: '(970) 555-0193', email: 'dana@moveoutclean.example', notes: 'Inactive until insurance renewal is confirmed.', active: false, relatedTransactions: [] },
];

export const transactions: Transaction[] = [
  {
    id: 'tx-spruce',
    propertyAddress: '1842 Spruce Mesa Drive, Colorado Springs, CO 80906',
    buyer: 'Jamie Carter',
    seller: 'Morgan Lee',
    agent: 'Brett Predmore',
    status: 'closing_soon',
    contractDate: '2026-05-22',
    closingDate: '2026-06-24',
    riskLevel: 'high',
    lastUpdated: '2026-06-05 08:18',
    notes: ['Inspection Resolution is still missing.', 'Title Commitment was submitted this morning and needs review.'],
    documents: baseDocuments,
    deadlines: [
      { id: 'dl-inspection', name: 'Inspection Objection', category: 'Inspection', original_date: '2026-06-06', current_date: '2026-06-06', responsibleParty: 'Brett / Buyer’s Agent', status: 'due_soon', riskLevel: 'high', relatedDocument: 'Inspection Resolution', relatedTask: 'Confirm inspection response', notes: 'Missing required document tied to upcoming deadline.' },
      { id: 'dl-title', name: 'Title Objection', category: 'Title', original_date: '2026-06-10', current_date: '2026-06-12', responsibleParty: 'Brett', status: 'extended', riskLevel: 'medium', relatedDocument: 'Title Commitment', changed_by_amendment_id: 'amd-1', approved_by: 'Brett Predmore', approved_at: '2026-06-04 15:12', notes: 'Extended by Amendment 1; original date preserved.' },
      { id: 'dl-closing', name: 'Closing Date', category: 'Closing', original_date: '2026-06-21', current_date: '2026-06-24', responsibleParty: 'All parties', status: 'upcoming', riskLevel: 'medium', changed_by_amendment_id: 'amd-1', approved_by: 'Brett Predmore', approved_at: '2026-06-04 15:12', notes: 'Critical transaction date.' },
    ],
    contacts: baseContacts,
    vendors: ['vendor-inspector', 'vendor-contractor', 'vendor-title'],
    tasks: [
      { id: 'task-review-title', title: 'Review submitted Title Commitment', status: 'todo', dueDate: '2026-06-05', owner: 'Brett', relatedDeadline: 'Title Objection' },
      { id: 'task-inspection-resolution', title: 'Upload or mark Inspection Resolution N/A', status: 'in_progress', dueDate: '2026-06-06', owner: 'Brett', relatedDeadline: 'Inspection Objection' },
      { id: 'task-verify-contacts', title: 'Confirm Listing Agent and Listing Brokerage contact rows', status: 'completed', dueDate: '2026-06-03', owner: 'Brett' },
    ],
    reviewItems: [
      { id: 'rev-title-date', transactionId: 'tx-spruce', sourceDocument: 'Title Commitment.pdf', fieldName: 'Title Objection Deadline', currentValue: '2026-06-10', proposedValue: '2026-06-12', confidence: 0.87, status: 'pending_review', note: 'AI-assisted extraction; Brett approval required before authoritative update.' },
      { id: 'rev-seller-disclosure', transactionId: 'tx-spruce', sourceDocument: 'Seller Property Disclosure.pdf', fieldName: 'Seller signature complete', currentValue: 'Unknown', proposedValue: 'Signed by seller', confidence: 0.78, status: 'pending_review' },
    ],
    amendments: [
      { id: 'amd-1', name: 'Amendment 1 — Closing and Title Extension', uploadedAt: '2026-06-04 14:52', status: 'approved', approved_by: 'Brett Predmore', approved_at: '2026-06-04 15:12', changes: [ { field: 'Closing Date', originalValue: '2026-06-21', proposedValue: '2026-06-24', approvedValue: '2026-06-24' }, { field: 'Title Objection', originalValue: '2026-06-10', proposedValue: '2026-06-12', approvedValue: '2026-06-12' } ] },
    ],
    audit: [
      { id: 'audit-1', action: 'document_uploaded', entityType: 'Document', entityName: 'Contract to Buy and Sell', user: 'Brett Predmore', timestamp: '2026-05-22 09:14', source: 'upload', aiInvolved: true, reviewRequired: true, newValue: 'Submitted for extraction review' },
      { id: 'audit-2', action: 'ai_extraction_reviewed', entityType: 'ReviewItem', entityName: 'Contract extraction', user: 'Brett Predmore', timestamp: '2026-05-22 10:33', source: 'ai_assisted', aiInvolved: true, reviewRequired: true, previousValue: 'Pending Review', newValue: 'Approved' },
      { id: 'audit-3', action: 'amendment_approved', entityType: 'Amendment', entityName: 'Amendment 1 — Closing and Title Extension', user: 'Brett Predmore', timestamp: '2026-06-04 15:12', source: 'manual', aiInvolved: true, reviewRequired: true, previousValue: '2026-06-21 closing', newValue: '2026-06-24 closing' },
      { id: 'audit-4', action: 'document_marked_na', entityType: 'Document', entityName: 'HOA Documents', user: 'Brett Predmore', timestamp: '2026-06-02 13:04', source: 'manual', aiInvolved: false, reviewRequired: false, newValue: 'Not Applicable' },
    ],
  },
  {
    id: 'tx-aspen',
    propertyAddress: '912 Aspen Ridge Lane, Boulder, CO 80302',
    buyer: 'Riley Grant',
    seller: 'Casey Nguyen',
    agent: 'Brett Predmore',
    status: 'under_contract',
    contractDate: '2026-05-30',
    closingDate: '2026-07-08',
    riskLevel: 'medium',
    lastUpdated: '2026-06-04 16:31',
    notes: ['Earnest money receipt is pending review.', 'Lender contact is incomplete.'],
    documents: [
      { ...baseDocuments[0], id: 'aspen-contract', status: 'approved', lastUpdated: '2026-05-30 12:14' },
      { ...baseDocuments[1], id: 'aspen-emd', name: 'Earnest Money Receipt', category: 'Financial', status: 'needs_review', affectsDeadlines: false, lastUpdated: '2026-06-04 16:31', uploadedBy: 'Agent' },
      { ...baseDocuments[2], id: 'aspen-title', name: 'Title Commitment', category: 'Title', status: 'upload_needed', affectsDeadlines: true, relatedDeadline: 'Title Objection', lastUpdated: '2026-06-04 09:00' },
    ],
    deadlines: [
      { id: 'aspen-dl-emd', name: 'Earnest Money Deadline', category: 'Financial', original_date: '2026-06-03', current_date: '2026-06-03', responsibleParty: 'Buyer’s Agent', status: 'overdue', riskLevel: 'critical', relatedDocument: 'Earnest Money Receipt', notes: 'Receipt uploaded late; requires review.' },
      { id: 'aspen-dl-title', name: 'Title Objection', category: 'Title', original_date: '2026-06-14', current_date: '2026-06-14', responsibleParty: 'Brett', status: 'upcoming', riskLevel: 'low', relatedDocument: 'Title Commitment' },
    ],
    contacts: baseContacts,
    vendors: ['vendor-contractor'],
    tasks: [{ id: 'aspen-task-emd', title: 'Review Earnest Money Receipt', status: 'todo', dueDate: '2026-06-05', owner: 'Brett' }],
    reviewItems: [{ id: 'aspen-rev-emd', transactionId: 'tx-aspen', sourceDocument: 'Earnest Money Receipt.pdf', fieldName: 'Deposit received', currentValue: 'Not confirmed', proposedValue: 'Received by title company', confidence: 0.92, status: 'pending_review' }],
    amendments: [],
    audit: [{ id: 'aspen-audit-1', action: 'document_uploaded', entityType: 'Document', entityName: 'Earnest Money Receipt', user: 'Agent', timestamp: '2026-06-04 16:31', source: 'upload', aiInvolved: false, reviewRequired: true, newValue: 'Needs Review' }],
  },
  {
    id: 'tx-closed',
    propertyAddress: '44 Pearl Street, Denver, CO 80203',
    buyer: 'Sam Brooks',
    seller: 'Taylor Kim',
    agent: 'Brett Predmore',
    status: 'archived',
    contractDate: '2026-03-12',
    closingDate: '2026-04-18',
    riskLevel: 'low',
    lastUpdated: '2026-04-19 11:05',
    notes: ['Archived after post-close checklist completion.'],
    documents: baseDocuments.map((doc) => ({ ...doc, id: `closed-${doc.id}`, status: doc.status === 'not_applicable' ? 'not_applicable' : 'approved' })),
    deadlines: [{ id: 'closed-dl', name: 'Closing Date', category: 'Closing', original_date: '2026-04-18', current_date: '2026-04-18', responsibleParty: 'All parties', status: 'completed', riskLevel: 'low' }],
    contacts: baseContacts,
    vendors: ['vendor-title'],
    tasks: [{ id: 'closed-task', title: 'Send archived transaction summary', status: 'completed', dueDate: '2026-04-19', owner: 'Brett' }],
    reviewItems: [],
    amendments: [],
    audit: [{ id: 'closed-audit', action: 'transaction_archived', entityType: 'Transaction', entityName: '44 Pearl Street', user: 'Brett Predmore', timestamp: '2026-04-19 11:05', source: 'manual', aiInvolved: false, reviewRequired: false, newValue: 'Archived' }],
  },
];

export function getTransaction(id: string) {
  return transactions.find((transaction) => transaction.id === id) ?? transactions[0];
}

export function activeTransactions() {
  return transactions.filter((transaction) => transaction.status !== 'archived' && transaction.status !== 'closed');
}

export function archivedTransactions() {
  return transactions.filter((transaction) => transaction.status === 'archived' || transaction.status === 'closed');
}

export function needingReview() {
  return transactions.flatMap((transaction) => [
    ...transaction.documents.filter((document) => document.status === 'needs_review' || document.status === 'submitted').map((document) => ({ transaction, label: document.name, type: 'Document' })),
    ...transaction.reviewItems.filter((item) => item.status === 'pending_review').map((item) => ({ transaction, label: item.fieldName, type: 'Review Item' })),
    ...transaction.amendments.filter((item) => item.status === 'pending_review').map((item) => ({ transaction, label: item.name, type: 'Amendment' })),
  ]);
}

export function urgentDeadlines() {
  return transactions
    .flatMap((transaction) => transaction.deadlines.map((deadline) => ({ transaction, deadline })))
    .filter(({ deadline }) => deadline.status === 'overdue' || deadline.status === 'due_soon' || deadline.riskLevel === 'critical' || deadline.riskLevel === 'high')
    .sort((a, b) => a.deadline.current_date.localeCompare(b.deadline.current_date));
}

export function allDocuments() {
  return transactions.flatMap((transaction) => transaction.documents.map((document) => ({ transaction, document })));
}

export function allAudit() {
  return transactions.flatMap((transaction) => transaction.audit.map((entry) => ({ transaction, entry }))).sort((a, b) => b.entry.timestamp.localeCompare(a.entry.timestamp));
}

export function allTransactionAlerts() {
  return transactions.flatMap((transaction) => transaction.notes.map((note) => ({ transaction, note })));
}
