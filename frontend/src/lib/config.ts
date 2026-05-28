/**
 * Runtime configuration. The API base URL is read from a public env var so the
 * frontend can point at a local FastAPI instance in dev and a real host in prod.
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ??
  'http://localhost:8000/api';
