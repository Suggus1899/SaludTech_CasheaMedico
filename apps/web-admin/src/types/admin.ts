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
