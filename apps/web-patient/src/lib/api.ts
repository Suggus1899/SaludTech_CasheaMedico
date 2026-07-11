const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost/api/v1";

export function getApiUrl(path: string): string {
  if (process.env.NEXT_PUBLIC_MOCK_API === "true") return `/api/mock/${path}`;
  return `${API_BASE}/${path}`;
}

export function getAuthHeaders(): Record<string, string> {
  let token: string | null = null;
  if (typeof window !== "undefined") {
    try {
      token = localStorage.getItem("jwt_token");
    } catch {
      token = null;
    }
  }
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export function setSession(token: string, user: unknown): void {
  try {
    localStorage.setItem("jwt_token", token);
    localStorage.setItem("patient_user", JSON.stringify(user));
  } catch {
    // localStorage may be unavailable in private browsing
  }
  const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";
  document.cookie = `jwt_token=${token}; path=/; max-age=86400; SameSite=Lax${isSecure ? "; Secure" : ""}`;
}

export function clearSession(): void {
  try {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("patient_user");
  } catch {
    // localStorage may be unavailable
  }
  document.cookie = "jwt_token=; path=/; max-age=0; SameSite=Lax";
}

export function getStoredUser<T>(): T | null {
  if (typeof window === "undefined") return null;
  let raw: string | null = null;
  try {
    raw = localStorage.getItem("patient_user");
  } catch {
    return null;
  }
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}
