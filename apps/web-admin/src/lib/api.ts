import {
  getApiUrl,
  getAuthHeaders,
  apiFetch,
  createSessionHelpers,
} from "@saludtech/shared";
import type { FetchState, FetchAction } from "@saludtech/shared";
import { useFetchData } from "@saludtech/shared";

export { getApiUrl, getAuthHeaders, apiFetch, useFetchData };
export type { FetchState, FetchAction };

// Admin-specific session helpers (stores user under "admin_user")
const session = createSessionHelpers("admin_user");
export const setSession = session.setSession;
export const clearSession = session.clearSession;
export const getStoredUser = session.getStoredUser;

// Keep existing logic but adapted to use apiFetch
export const fetchPendingMerchants = async () => {
  const res = await apiFetch(getApiUrl('admin/merchants/pending'));
  if (!res.ok) throw new Error('Failed to fetch pending merchants');
  return res.json();
};

export const approveMerchant = async (id: string) => {
  const res = await apiFetch(getApiUrl(`admin/merchants/${id}/approve`), {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to approve merchant');
  return res.json();
};

export const fetchUsers = async () => {
  const res = await apiFetch(getApiUrl('admin/users'));
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
};

export const updateUserKyc = async (id: string, status: 'APPROVED' | 'REJECTED') => {
  const res = await apiFetch(getApiUrl(`admin/users/${id}/kyc?status=${status}`), {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to update KYC status');
  return res.json();
};
