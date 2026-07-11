const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost/api/v1";

export function getApiUrl(path: string): string {
  if (process.env.NEXT_PUBLIC_MOCK_API === "true") return `/api/mock/${path}`;
  return `${API_BASE}/${path}`;
}

export function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("jwt_token") : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}
