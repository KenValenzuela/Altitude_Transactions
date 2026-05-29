/**
 * Typed API client for the Altitude FastAPI backend.
 *
 * One thin wrapper around `fetch` that centralizes the base URL, JSON handling,
 * the stubbed auth token, and a consistent error type. Every network call in the
 * app goes through here — components never call `fetch` directly.
 */
import { API_BASE_URL } from './config';
import type {
  ApiDocument,
  ApiTask,
  ApiUser,
  ConfirmExtractionRequest,
  ExtractionJob,
  SessionResponse,
  TaskState,
  ApiDocumentState,
  TransactionCard,
  TransactionDetail,
  UploadResponse,
} from '@/types/api';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const TOKEN_KEY = 'altitude.token';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

const USER_KEY = 'altitude.user';

export function setStoredUser(user: ApiUser | null): void {
  if (typeof window === 'undefined') return;
  if (user) window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  else window.localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): ApiUser | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ApiUser;
  } catch {
    return null;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(0, 'Could not reach the Altitude API. Is the backend running?');
  }

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail ?? body.message ?? detail;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  // --- auth (stubbed) ---
  createSession: () =>
    request<SessionResponse>('/auth/session', { method: 'POST', body: '{}' }),

  // --- transactions ---
  listTransactions: () => request<TransactionCard[]>('/transactions'),
  getTransaction: (id: string) => request<TransactionDetail>(`/transactions/${id}`),

  // --- documents & extraction ---
  uploadDocument: (file: File, transactionId?: string) => {
    const form = new FormData();
    form.append('file', file);
    if (transactionId) form.append('transactionId', transactionId);
    return request<UploadResponse>('/documents/upload', { method: 'POST', body: form });
  },
  getExtraction: (documentId: string) =>
    request<ExtractionJob>(`/documents/${documentId}/extraction`),
  confirmExtraction: (jobId: string, body: ConfirmExtractionRequest = {}) =>
    request<TransactionDetail>(`/extractions/${jobId}/confirm`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  // --- mutations ---
  updateTask: (id: string, state: TaskState) =>
    request<ApiTask>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ state }) }),
  updateDocument: (id: string, state: ApiDocumentState) =>
    request<ApiDocument>(`/documents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ state }),
    }),
};
