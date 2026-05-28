/**
 * API contract types — the shape of JSON returned by the FastAPI backend.
 *
 * The backend serializes camelCase (Pydantic alias_generator=to_camel), so these
 * mirror the wire format exactly. UI components consume *view-model* types from
 * `@/types`; `@/lib/adapters` bridges API types → view models. Keep this file the
 * single source of truth for anything that crosses the network boundary.
 */

export type TransactionStatus =
  | 'under_contract'
  | 'inspection'
  | 'appraisal'
  | 'clear_to_close'
  | 'closed';

export type TaskState = 'todo' | 'doing' | 'done' | 'na';
export type ApiDocumentState = 'received' | 'pending' | 'upcoming' | 'na';
export type ExtractionStatus = 'pending' | 'running' | 'complete' | 'failed';
export type ReviewStatus = 'pending' | 'confirmed' | 'edited';
export type PartyRole =
  | 'buyer'
  | 'seller'
  | 'listing_agent'
  | 'lender'
  | 'title'
  | 'inspector';

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  brokerage: string;
  licenseNo: string;
}

export interface SessionResponse {
  user: ApiUser;
  token: string;
}

/** Dashboard card — GET /transactions */
export interface TransactionCard {
  id: string;
  address: string;
  city: string;
  stage: string;
  status: TransactionStatus;
  daysToClose: number;
  progress: number; // 0..1
  next: string;
  urgent: boolean;
  parties: string;
  price: number;
  active: boolean;
}

export interface ApiProperty {
  id: string;
  type: string;
  beds: number;
  baths: number;
  sqft: number;
  mls: string;
  isRural: boolean;
  hasHoa: boolean;
}

export interface ApiParty {
  id: string;
  role: PartyRole;
  name: string;
  sub: string;
  phone: string | null;
  email: string | null;
}

export interface ApiStage {
  id: string;
  label: string;
  day?: number;
  done: boolean;
  current?: boolean;
}

export interface ApiDeadline {
  /** Present on persisted deadlines; absent on freshly extracted ones. */
  id?: string;
  event: string;
  reference: string;
  category: string;
  date: string | null; // ISO date or null
  rawValue: string;
  isUrgent?: boolean;
  isNa: boolean;
}

export interface ApiTask {
  id: string;
  group: string;
  title: string;
  due: string;
  state: TaskState;
  aiNote?: string | null;
  isPostClose: boolean;
}

export interface ApiTaskGroup {
  group: string;
  items: ApiTask[];
}

export interface ApiDocument {
  id: string;
  name: string;
  source: string;
  state: ApiDocumentState;
  originalFilename?: string | null;
  detail?: string | null;
}

export interface TransactionMoney {
  price: number;
  earnest: number;
  closeDate: string | null;
  daysToClose: number;
}

export interface TransactionCounts {
  done: number;
  doing: number;
  todo: number;
  na: number;
  active: number;
}

/** Workspace detail — GET /transactions/{id} */
export interface TransactionDetail {
  id: string;
  address: string;
  city: string;
  status: TransactionStatus;
  property: ApiProperty;
  parties: ApiParty[];
  stages: ApiStage[];
  money: TransactionMoney;
  deadlines: ApiDeadline[];
  tasks: ApiTaskGroup[];
  documents: ApiDocument[];
  counts: TransactionCounts;
}

export interface ExtractedField {
  id: string;
  label: string;
  value: string;
  confidence: number; // 0..1
  reviewStatus: ReviewStatus;
  category: string;
}

export interface ExtractionFlag {
  title: string;
  detail: string;
}

/** Extraction job — GET /documents/{id}/extraction */
export interface ExtractionJob {
  id: string;
  status: ExtractionStatus;
  fields: ExtractedField[];
  deadlines: ApiDeadline[];
  flags: ExtractionFlag[];
}

export interface UploadResponse {
  documentId: string;
  status: string;
  extractionJobId: string;
}

export interface ConfirmExtractionRequest {
  overrides?: Record<string, string>;
  transactionId?: string;
}
