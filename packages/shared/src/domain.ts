/**
 * Altitude Transactions — Shared Domain Types
 *
 * Pure TypeScript. No React, no Next.js, no React Native imports.
 * Used by web (Next.js), mobile (Expo), and future integrations.
 *
 * These types mirror the FastAPI response shapes from backend/app/models/
 * and the frontend/src/types/domain.ts active implementation.
 */

// ── Enums ────────────────────────────────────────────────────────────────────

export type TransactionStatus =
    | 'draft'
    | 'under_contract'
    | 'in_review'
    | 'active'
    | 'closing'
    | 'closed'
    | 'cancelled';

export type TaskStatus =
    | 'not_started'
    | 'in_progress'
    | 'complete'
    | 'not_applicable'
    | 'todo'        // legacy checklist state
    | 'doing'       // legacy checklist state
    | 'done'        // legacy checklist state
    | 'na';         // legacy checklist state

export type DeadlineApplicability = 'active' | 'not_applicable' | 'completed';

export type DocumentRequiredStatus = 'required' | 'conditional' | 'not_applicable';
export type DocumentReceivedStatus = 'missing' | 'received' | 'reviewed' | 'approved';
export type DocumentDisplayState = 'received' | 'pending' | 'upcoming' | 'na' | 'reviewed' | 'approved' | 'missing';

export type ReviewStatus = 'pending' | 'approved' | 'edited' | 'rejected';

export type ExtractionStatus =
    | 'queued'
    | 'uploading'
    | 'extracting'
    | 'reviewing'
    | 'confirmed'
    | 'failed';

export type PartyRole =
    | 'buyer'
    | 'seller'
    | 'buyers_agent'
    | 'listing_agent'
    | 'lender'
    | 'title'
    | 'inspector'
    | 'appraiser'
    | 'insurance'
    | 'attorney'
    | 'other';

// ── Core domain entities ─────────────────────────────────────────────────────

export interface Transaction {
    id: string;
    propertyAddress: string;
    address: string;
    city: string;
    state: string;
    zip?: string;
    closingDate?: string;
    status: TransactionStatus;
    completionPercent: number;
    createdAt: string;
    updatedAt: string;
    deadlines: Deadline[];
    tasks: TaskGroup[];
    contacts: Contact[];
    documentRequirements: DocumentRequirement[];
    postCloseTasks: PostCloseTask[];
    auditEvents: AuditEvent[];
    money: { price: number; earnest: number; closeDate?: string; daysToClose: number };
    counts: { done: number; doing: number; todo: number; na: number; active: number };
    documents?: DocumentRequirement[];
    parties?: Contact[];
}

export interface TransactionCard {
    id: string;
    address: string;
    city: string;
    status: TransactionStatus;
    daysToClose: number;
    progress: number;
    next: string;
    urgent: boolean;
    parties: string;
    price: number;
    active: boolean;
}

export interface Deadline {
    id: string;
    transactionId: string;
    itemNumber?: string;
    sectionReference?: string;
    eventName: string;
    dueDate?: string;
    rawValue?: string;
    applicability: DeadlineApplicability;
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
    state?: TaskStatus;
    dueDate?: string;
    completedAt?: string;
    assignedRole?: string;
    notes?: string;
    isPostClose?: boolean;
    aiNote?: string;
    due?: string;
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
    required: boolean;
    complete: boolean;
    source: string;
    createdAt: string;
    updatedAt: string;
}

export interface DocumentRequirement {
    id: string;
    transactionId: string;
    documentName: string;
    category: string;
    purpose?: string;
    requiredStatus: DocumentRequiredStatus;
    receivedStatus: DocumentReceivedStatus;
    sourceDocumentId?: string;
    dueDate?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
    name?: string;      // display alias for documentName
    source?: string;    // legacy field
    state?: string;     // display state alias
}

export interface SourceDocument {
    id: string;
    transactionId: string;
    filename: string;
    fileSize?: number;
    mimeType?: string;
    uploadedAt: string;
}

export interface ExtractedField {
    id: string;
    transactionId: string;
    fieldName: string;
    displayLabel: string;
    rawValue?: string;
    normalizedValue?: string;
    confidence?: number;
    reviewStatus: ReviewStatus;
    sourceDocumentId: string;
    sourcePage?: number;
    sourceSection?: string;
    notes?: string;
    updatedAt: string;
}

export interface ExtractionJob {
    id: string;
    transactionId?: string;
    sourceDocumentId: string;
    status: ExtractionStatus;
    fieldCount?: number;
    reviewedCount?: number;
    createdAt: string;
    updatedAt: string;
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

export interface AuditEvent {
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

// ── API response shapes ───────────────────────────────────────────────────────

export interface WeeklySummary {
    transactionId: string;
    weekStart: string;
    weekEnd: string;
    completedTaskCount: number;
    completedTasks: string[];
    upcomingDeadlines: Deadline[];
    overdueItems: Deadline[];
    openAlerts: number;
}

export interface NotificationPreference {
    userId: string;
    deadlineAlerts: boolean;
    taskReminders: boolean;
    weeklyDigest: boolean;
    overdueAlerts: boolean;
    expoPushToken?: string;
    updatedAt: string;
}

export interface DashboardSummary {
    activeFiles: number;
    atRisk: number;
    closingThisWeek: number;
    overdueDeadlines: number;
    pendingReviews: number;
}

export interface User {
    id: string;
    name: string;
    email: string;
    brokerage?: string;
    licenseNo?: string;
}

export interface SessionResponse {
    user: User;
    token: string;
}
