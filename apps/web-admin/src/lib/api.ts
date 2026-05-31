export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';

// We mock an admin token for now or leave it empty if we just login as admin
// In a real flow, this would come from a Context/Local Storage after admin login.
// For the MVP, we assume you logged in with an ADMIN account.
let adminToken = '';

export const setAdminToken = (token: string) => {
  adminToken = token;
};

export const fetchPendingMerchants = async () => {
  const res = await fetch(`${API_URL}/admin/merchants/pending`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  if (!res.ok) throw new Error('Failed to fetch pending merchants');
  return res.json();
};

export const approveMerchant = async (id: string) => {
  const res = await fetch(`${API_URL}/admin/merchants/${id}/approve`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  if (!res.ok) throw new Error('Failed to approve merchant');
  return res.json();
};

export const fetchUsers = async () => {
  const res = await fetch(`${API_URL}/admin/users`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
};

export const updateUserKyc = async (id: string, status: 'APPROVED' | 'REJECTED') => {
  const res = await fetch(`${API_URL}/admin/users/${id}/kyc?status=${status}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  if (!res.ok) throw new Error('Failed to update KYC status');
  return res.json();
};
