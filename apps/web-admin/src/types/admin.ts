import React from "react";

export type View = "overview" | "pacientes" | "comercios" | "financiamientos" | "triajes" | "elder-care" | "suscripciones";

export interface OverdueInstallment {
  id: string;
  dueDate: string;
  amount: number;
  status: string;
  user?: { fullName: string };
}

export interface NavItem {
  id: View;
  label: string;
  icon: React.ElementType;
}

export type FetchState<T> = { data: T | null; loading: boolean; error: string | null };

export type FetchAction<T> =
  | { type: "loading" }
  | { type: "success"; payload: T }
  | { type: "error"; payload: string };

// ─── Admin API response shapes (mirrors backend-go/internal/admin) ──────────

/** GET admin/dashboard — KPI counters. Numeric/decimal fields arrive as strings. */
export interface DashboardStats {
  users: number;
  patients: number;
  merchants: number;
  activeMerchants: number;
  transactions: number;
  totalRevenue: string;
  overdueInstallments: number;
  pendingAmount: string;
  creditLines: number;
}

/** A user row from GET admin/users (ListUsersRow). Nullable text fields may be null. */
export interface AdminUser {
  id: string;
  phone: string;
  email: string | null;
  full_name: string;
  national_id: string | null;
  role: string;
  level: number;
  points: number;
  total_paid: string;
  installments_paid_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/** GET admin/users response envelope. */
export interface AdminUsersResponse {
  users: AdminUser[];
  total: number;
  limit: number;
  offset: number;
}

/** A credit line row from GET admin/credit-lines (ListAllCreditLinesRow). */
export interface CreditLine {
  id: string;
  user_id: string;
  type: string;
  limit_usd: string;
  used_usd: string;
  status: string;
  paused_at: string | null;
  reactivated_at: string | null;
  created_at: string;
  updated_at: string;
  blocked_at: string | null;
  user_name: string;
  user_phone: string;
}

/** GET admin/credit-lines response envelope. */
export interface CreditLinesResponse {
  creditLines: CreditLine[];
  total: number;
  limit: number;
  offset: number;
}
