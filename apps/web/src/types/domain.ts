export type TransactionStatus =
  | 'draft'
  | 'under_contract'
  | 'in_review'
  | 'active'
  | 'closing'
  | 'closed'
  | 'cancelled';

export type ExtractionStatus =
  | 'queued'
  | 'uploading'
  | 'parsing_pdf'
  | 'extracting_fields'
  | 'generating_deadlines'
  | 'generating_tasks'
  | 'needs_review'
  | 'approved'
  | 'failed'
  | 'complete';

export type PopulationStatus =
  | 'populated'
  | 'missing_required'
  | 'not_applicable'
  | 'redacted_in_source'
  | 'completed'
  | 'needs_human_review'
  | 'manual_override'
  | 'superseded_by_amendment';

export type ReviewStatus = 'pending' | 'approved' | 'edited' | 'rejected';

/** WHY a field value is or is not present */
export type AvailabilityStatus = 'available' | 'missing' | 'unavailable_now' | 'redacted' | 'unreadable';

/** WHETHER the field applies to this specific transaction */
export type ApplicabilityStatus = 'applicable' | 'not_applicable' | 'conditional' | 'unknown';

/** Urgency tier for review triage */
export type RequiredLevel = 'required_to_create' | 'required_before_closing' | 'optional' | 'informational';

/** Broker's final decision — richer than ReviewStatus for UI routing */
export type ReviewDecision =
  | 'unreviewed'
  | 'approved'
  | 'edited'
  | 'marked_not_applicable'
  | 'marked_unavailable'
  | 'rejected';
export type PartyRole = 'buyer' | 'seller' | 'listing_agent' | 'lender' | 'title' | 'inspector';
export type TaskStatus = 'not_started' | 'in_progress' | 'complete' | 'not_applicable' | 'todo' | 'doing' | 'done' | 'na';
export type DeadlineApplicability = 'active' | 'not_applicable' | 'completed';
export type DeadlineStatus = DeadlineApplicability;
export type DocumentStatus = 'missing' | 'received' | 'reviewed' | 'approved' | 'pending' | 'upcoming' | 'na';
export type RiskLevel = 'low' | 'medium' | 'high';

export interface ApiResponse<T> {
  data: T;
  requestId?: string;
}

export interface ApiErrorBody {
  detail?: string | { message?: string };
  message?: string;
}

export interface Party {
  id: string;
  transactionId: string;
  role: string;
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
}

export interface SourceDocument {
  id: string;
  transactionId?: string;
  filename: string;
  documentType: string;
  mimeType?: string;
  fileSizeBytes?: number;
  storagePath?: string;
  sha256Hash?: string;
  uploadedBy?: string;
  uploadedAt: string;
}

export interface Document extends SourceDocument {
  status?: DocumentStatus;
}

export interface ExtractionRun {
  id: string;
  transactionId?: string;
  sourceDocumentId: string;
  status: ExtractionStatus;
  startedAt: string;
  completedAt?: string;
  modelName: string;
  schemaVersion: string;
  errorMessage?: string;
  progressPercent: number;
}

export interface ExtractedField {
  id: string;
  transactionId?: string;
  extractionRunId: string;
  fieldKey: string;
  label: string;
  value?: string;
  normalizedValue?: string;
  sourceDocumentId: string;
  sourcePage?: number;
  sourceSection?: string;
  evidenceText?: string;
  confidence: number;
  extractionMethod?: 'deterministic' | 'llm' | 'human_corrected' | 'imported' | 'fixture';
  riskLevel?: 'low' | 'medium' | 'high';
  valueType?: string;
  // Multi-dimensional triage state
  availabilityStatus: AvailabilityStatus;
  applicabilityStatus: ApplicabilityStatus;
  requiredLevel: RequiredLevel;
  blocking: boolean;
  reviewDecision: ReviewDecision;
  userFacingMessage?: string;
  suggestedAction?: string;
  originalValue?: string;
  editedValue?: string;
  conflictOptions?: string;
  // Legacy review fields
  populationStatus: PopulationStatus;
  reviewStatus: ReviewStatus | string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  category?: string;
}

export interface ExtractionReviewSummary {
  total: number;
  blockingUnreviewed: number;
  needsReview: number;
  confirmedNa: number;
  approved: number;
  missingExpected: number;
  lowConfidence: number;
  conflicts: number;
  canCreateTransaction: boolean;
  estimatedReviewMinutes: number;
}

export interface Deadline {
  id: string;
  transactionId: string;
  itemNumber?: string;
  sectionReference?: string;
  eventName: string;
  dueDate?: string;
  dueTime?: string;
  rawValue?: string;
  applicability: DeadlineApplicability;
  confidence?: number;
  responsibleParty?: string;
  calendarReady?: boolean;
  humanReviewRequired?: boolean;
  sourceDocumentId: string;
  sourcePage?: number;
  sourceSection?: string;
  linkedTaskId?: string;
  createdAt: string;
  event?: string;
  date?: string;
  isUrgent?: boolean;
  isNa?: boolean;
}

export interface Task {
  id: string;
  transactionId: string;
  title: string;
  category: string;
  status: TaskStatus;
  dueDate?: string;
  completedAt?: string;
  assignedRole?: string;
  notes?: string;
  notApplicableReason?: string;
  linkedDeadlineId?: string;
  sourceType?: string;
  createdAt?: string;
  updatedAt?: string;
  group?: string;
  state?: TaskStatus;
  due?: string;
  aiNote?: string;
  isPostClose?: boolean;
}

export interface TaskGroup {
  group: string;
  items: Task[];
}

export interface Contact {
  id: string;
  transactionId: string;
  role: string;
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  licenseNumber?: string;
  address?: string;
  notes?: string;
  required: boolean;
  complete: boolean;
  source: string;
  createdAt: string;
  updatedAt: string;
  sub?: string;
}

export interface DocumentRequirement {
  id: string;
  transactionId: string;
  documentName: string;
  category: string;
  purpose?: string;
  requiredStatus: 'required' | 'conditional' | 'not_applicable';
  receivedStatus: 'missing' | 'received' | 'reviewed' | 'approved';
  sourceDocumentId?: string;
  dueDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  name?: string;
  source?: string;
  state?: string;
}

export interface PostCloseTask {
  id: string;
  transactionId: string;
  title: string;
  recipientRole?: string;
  status: TaskStatus;
  dateSent?: string;
  dateCompleted?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLogItem {
  id: string;
  transactionId?: string;
  actorType: string;
  actorId?: string;
  eventType: string;
  entityType: string;
  entityId?: string;
  beforeValue?: string;
  afterValue?: string;
  createdAt: string;
  metadataJson?: string;
}

export type AuditEvent = ActivityLogItem;

export interface Transaction {
  id: string;
  propertyAddress: string;
  address: string;
  city: string;
  state: string;
  zip?: string;
  county?: string;
  legalDescription?: string;
  contractDate?: string;
  closingDate?: string;
  possessionDate?: string;
  possessionTime?: string;
  status: TransactionStatus;
  riskLevel: RiskLevel;
  completionPercent: number;
  createdAt: string;
  updatedAt: string;
  sourceDocuments: SourceDocument[];
  extractionRuns: ExtractionRun[];
  extractedFields: ExtractedField[];
  deadlines: Deadline[];
  tasks: TaskGroup[];
  contacts: Contact[];
  documentRequirements: DocumentRequirement[];
  postCloseTasks: PostCloseTask[];
  auditEvents: ActivityLogItem[];
  money: { price: number; earnest: number; closeDate?: string; daysToClose: number };
  counts: { done: number; doing: number; todo: number; na: number; active: number };
  documents?: DocumentRequirement[];
  parties?: Contact[];
}

export interface TransactionCard {
  id: string;
  address: string;
  city: string;
  stage: string;
  status: TransactionStatus;
  daysToClose: number;
  progress: number;
  next: string;
  urgent: boolean;
  parties: string;
  price: number;
  active: boolean;
}

export interface DashboardSummary {
  activeFiles: number;
  atRisk: number;
  averageProgress: number;
  nextDeadline?: string;
}

export interface UploadResponse {
  documentId: string;
  status: string;
  extractionJobId: string;
  transactionId?: string;
}

export interface UploadState {
  busy: boolean;
  fileName?: string;
  error?: string;
}

export interface ExtractionJob {
  id: string;
  status: ExtractionStatus;
  progressPercent: number;
  transactionId?: string;
  sourceDocumentId: string;
  fields: ExtractedField[];
  deadlines: Deadline[];
  flags: { title: string; detail: string }[];
  reviewSummary?: ExtractionReviewSummary;
}
