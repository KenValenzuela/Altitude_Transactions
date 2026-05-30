import { API_BASE_URL } from './config';
import type {
  ApiDocument,
  ApiDocumentState,
  ApiErrorBody,
  ApiTask,
  ApiUser,
  ConfirmExtractionRequest,
  ExtractedField,
  ExtractionJob,
  SessionResponse,
  TaskState,
  Transaction,
  TransactionCard,
  UploadResponse,
} from '@/types/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

const TOKEN_KEY = 'altitude.token';
const USER_KEY = 'altitude.user';

function getToken() {
  return typeof window === 'undefined' ? null : window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

export function setStoredUser(user: ApiUser | null) {
  if (typeof window === 'undefined') return;
  if (user) window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  else window.localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): ApiUser | null {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(window.localStorage.getItem(USER_KEY) || 'null') as ApiUser | null;
  } catch {
    return null;
  }
}

function getApiErrorMessage(body: ApiErrorBody | null, fallback: string) {
  if (!body) return fallback;
  if (typeof body.detail === 'string') return body.detail;
  if (body.detail?.message) return body.detail.message;
  return body.message ?? fallback;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const token = getToken();

  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json');

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(0, 'Could not reach the Altitude API. Start the FastAPI backend on port 8000.');
  }

  if (!response.ok) {
    let body: ApiErrorBody | null = null;
    try {
      body = (await response.json()) as ApiErrorBody;
    } catch {
      body = null;
    }
    throw new ApiError(response.status, getApiErrorMessage(body, response.statusText));
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const api = {
  createSession: () => request<SessionResponse>('/auth/session', { method: 'POST', body: '{}' }),
  listTransactions: () => request<TransactionCard[]>('/transactions'),
  getTransaction: (id: string) => request<Transaction>(`/transactions/${id}`),
  getExtractedFields: (id: string) => request<ExtractedField[]>(`/transactions/${id}/extracted-fields`),
  uploadDocument: (file: File, transactionId?: string) => {
    const form = new FormData();
    form.append('file', file);
    if (transactionId) form.append('transactionId', transactionId);
    return request<UploadResponse>('/documents/upload', { method: 'POST', body: form });
  },
  getExtraction: (documentId: string) => request<ExtractionJob>(`/documents/${documentId}/extraction`),
  getExtractionRun: (runId: string) => request<ExtractionJob>(`/extractions/${runId}`),
  confirmExtraction: (jobId: string, body: ConfirmExtractionRequest = {}) =>
    request<Transaction>(`/extractions/${jobId}/confirm`, { method: 'POST', body: JSON.stringify(body) }),
  approveField: (id: string, value?: string) =>
    request<ExtractedField>(`/extracted-fields/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(value ? { action: 'edit', value } : { action: 'approve' }),
    }),
  updateTask: (id: string, state: TaskState) =>
    request<ApiTask>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ state }) }),
  updateDocument: (id: string, state: ApiDocumentState) =>
    request<ApiDocument>(`/documents/${id}`, { method: 'PATCH', body: JSON.stringify({ state }) }),
};
