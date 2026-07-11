const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost/api/v1';

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

// Keep existing logic but adapted to use getAuthHeaders
export const fetchPendingMerchants = async () => {
  const res = await fetch(getApiUrl('admin/merchants/pending'), {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch pending merchants');
  return res.json();
};

export const approveMerchant = async (id: string) => {
  const res = await fetch(getApiUrl(`admin/merchants/${id}/approve`), {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to approve merchant');
  return res.json();
};

export const fetchUsers = async () => {
  const res = await fetch(getApiUrl('admin/users'), {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
};

export const updateUserKyc = async (id: string, status: 'APPROVED' | 'REJECTED') => {
  const res = await fetch(getApiUrl(`admin/users/${id}/kyc?status=${status}`), {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to update KYC status');
  return res.json();
};
