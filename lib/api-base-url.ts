/**
 * Production is served behind an `/api` prefix (e.g. …/api/v2/auth/login).
 * Local dev backend serves routes at `/v2/...` (no `/api` prefix).
 *
 * In development, `NEXT_PUBLIC_USE_API_PROXY=true` + `API_PROXY_TARGET` makes the browser
 * call same-origin `/_imotrak_proxy/...` so Next can forward to the API — avoids CORS.
 */
const PRODUCTION_DEFAULT = 'https://imotrak.ur.ac.rw/api';

function defaultBaseUrl(): string {
  if (process.env.NODE_ENV !== 'development') {
    return PRODUCTION_DEFAULT;
  }

  const useProxy = process.env.NEXT_PUBLIC_USE_API_PROXY === 'true';
  if (useProxy) {
    // Use a same-origin relative base URL so it works even if Next devserver
    // auto-picks a different port (e.g. 3001) or is accessed via LAN IP.
    return '/_imotrak_proxy';
  }

  return 'http://localhost:4000';
}

const rawApiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_API_URL || defaultBaseUrl();

function normalizeApiBaseUrl(input: string): string {
  const trimmed = input.trim().replace(/\/+$/, '');

  // Allow relative base URLs (same-origin). Useful for dev proxy.
  if (trimmed.startsWith('/')) return trimmed;

  // Already absolute.
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  // Heuristic: local dev hosts should default to http, not https.
  if (/^(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(trimmed)) {
    return `http://${trimmed}`;
  }

  return `https://${trimmed}`;
}

export const API_BASE_URL = normalizeApiBaseUrl(rawApiBaseUrl);
