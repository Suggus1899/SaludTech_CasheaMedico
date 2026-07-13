// ─── Shared fetch types ──────────────────────────────────────────
export interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export interface FetchAction<T> {
  type: "loading" | "success" | "error";
  payload?: T | string;
}

// ─── Shared API helpers ──────────────────────────────────────────
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost/api/v1";

export function getApiUrl(path: string): string {
  if (process.env.NEXT_PUBLIC_MOCK_API === "true") return `/api/mock/${path}`;
  return `${API_BASE}/${path}`;
}

// JWT is stored in an httpOnly cookie set by the backend.
// getAuthHeaders() only returns Content-Type — the cookie is sent
// automatically with credentials: "include".
export function getAuthHeaders(): Record<string, string> {
  return { "Content-Type": "application/json" };
}

// apiFetch wraps fetch with credentials: "include" so the httpOnly
// JWT cookie is sent automatically. Use this instead of fetch for
// all authenticated API calls.
export function apiFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  return fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });
}

// ─── Session helpers (user object only — JWT is in httpOnly cookie) ────

/**
 * Creates a session helper bound to a specific localStorage key.
 * Each app (patient, admin, merchant) stores its user object under
 * a different key, but shares the same JWT cookie.
 */
export function createSessionHelpers(storageKey: string) {
  return {
    setSession(_token: string, user: unknown): void {
      try {
        localStorage.setItem(storageKey, JSON.stringify(user));
      } catch {
        // localStorage may be unavailable in private browsing
      }
    },

    clearSession(): Promise<void> {
      // Fire-and-forget logout call to clear the httpOnly cookie
      try {
        fetch(getApiUrl("auth/logout"), {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        }).catch(() => {});
      } catch {
        // fetch may be unavailable
      }
      try {
        localStorage.removeItem(storageKey);
      } catch {
        // localStorage may be unavailable
      }
      return Promise.resolve();
    },

    getStoredUser<T>(): T | null {
      if (typeof window === "undefined") return null;
      let raw: string | null = null;
      try {
        raw = localStorage.getItem(storageKey);
      } catch {
        return null;
      }
      if (!raw) return null;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return null;
      }
    },
  };
}
