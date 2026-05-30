export * from './domain';

import type {
  Contact,
  PartyRole,
  DocumentRequirement,
  ExtractedField,
  ExtractionJob,
  SourceDocument,
  Task,
  TaskStatus,
  Transaction,
  TransactionCard,
} from './domain';

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  brokerage?: string;
  licenseNo?: string;
};

export type SessionResponse = { user: ApiUser; token: string };
export type ConfirmExtractionRequest = { overrides?: Record<string, string>; transactionId?: string };
export type TransactionDetail = Transaction;
export type ApiTransactionCard = TransactionCard;
export type ApiExtractionJob = ExtractionJob;
export type ApiExtractedField = ExtractedField;
export type ApiDeadline = import('./domain').Deadline;
export type ApiTask = Task;
export type ApiTaskGroup = { group: string; items: ApiTask[] };
export type ApiDocument = DocumentRequirement | SourceDocument;
export type ApiDocumentState = 'received' | 'pending' | 'upcoming' | 'na' | 'reviewed' | 'approved' | 'missing';
export type TaskState = TaskStatus;
export type ApiProperty = { id: string; type?: string; beds?: number; baths?: number; sqft?: number; mls?: string; isRural: boolean; hasHoa: boolean };
export type ApiParty = Contact & { role: PartyRole };
export type ApiStage = { id: string; label: string; day?: number; done: boolean; current?: boolean };
