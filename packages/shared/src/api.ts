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

// ─── Session helpers (minimal display data only — JWT is in httpOnly cookie) ────

/**
 * Minimal user data stored in localStorage for UI display only.
 * Sensitive fields (email, phone, national_id) are NOT stored here.
 * Fetch the full user profile from GET /api/v1/auth/me when needed.
 */
export interface MinimalUser {
  id: string;
  firstName: string;
  role: string;
  level?: number;
}

/**
 * Creates a session helper bound to a specific localStorage key.
 * Each app (patient, admin, merchant) stores its minimal user object
 * under a different key, but shares the same JWT cookie.
 */
export function createSessionHelpers(storageKey: string) {
  return {
    /**
     * Stores only minimal user data (id, firstName, role, level) in localStorage.
     * Sensitive PII (email, phone, national_id) is NOT persisted.
     */
    setSession(_token: string, user: unknown): void {
      try {
        const minimal: MinimalUser = {
          id: (user as Record<string, string>)?.id ?? "",
          firstName: (user as Record<string, string>)?.firstName ?? "",
          role: (user as Record<string, string>)?.role ?? "",
          level: (user as Record<string, number>)?.level,
        };
        localStorage.setItem(storageKey, JSON.stringify(minimal));
      } catch {
        // localStorage may be unavailable in private browsing
      }
    },

    /**
     * Fetches the full current user profile from GET /api/v1/auth/me.
     * Use this instead of getStoredUser when you need sensitive fields.
     */
    async fetchCurrentUser<T>(): Promise<T | null> {
      try {
        const res = await apiFetch(getApiUrl("auth/me"));
        if (!res.ok) return null;
        return (await res.json()) as T;
      } catch {
        return null;
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
      // Also clear the client-side cookie set for Next.js middleware
      try {
        document.cookie = "jwt_token=; path=/; max-age=0";
      } catch {
        // document may be unavailable
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
