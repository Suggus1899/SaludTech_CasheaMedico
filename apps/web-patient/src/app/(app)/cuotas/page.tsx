"use client";

import { useState } from "react";
import Link from "next/link";
import {
  RefreshCw,
  Clock,
  AlertTriangle,
  CalendarCheck,
  CheckCircle2,
  WifiOff,
} from "lucide-react";
import { useFetchData } from "../../../hooks/useFetchData";
import { getApiUrl } from "../../../lib/api";
import { formatCurrency, formatDate } from "../../../lib/utils";
import type { Installment } from "../../../types/patient";

export default function CuotasPage() {
  const [tab, setTab] = useState<"pending" | "overdue">("pending");
  const { data, loading, error, refetch } = useFetchData<Installment[]>(
    getApiUrl("patient/transactions/my/installments/pending")
  );

  const installments = data ?? [];
  const pending = installments.filter((i) => i.status === "PENDING");
  const overdue = installments.filter((i) => i.status === "OVERDUE");
  const current = tab === "pending" ? pending : overdue;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1
          className="text-xl font-bold text-foreground"
          style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
        >
          Mis Cuotas
        </h1>
        <button
          onClick={() => refetch()}
          aria-label="Recargar"
          className="btn btn-ghost btn-sm btn-square"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div role="tablist" className="tabs tabs-boxed">
        <button
          role="tab"
          aria-selected={tab === "pending"}
          className={`tab ${tab === "pending" ? "tab-active" : ""}`}
          onClick={() => setTab("pending")}
        >
          Pendientes ({pending.length})
        </button>
        <button
          role="tab"
          aria-selected={tab === "overdue"}
          className={`tab ${tab === "overdue" ? "tab-active" : ""}`}
          onClick={() => setTab("overdue")}
        >
          En mora ({overdue.length})
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner text-primary" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center py-12 gap-4">
          <WifiOff className="w-12 h-12 text-muted-foreground" />
          <p className="text-muted-foreground">No se pudieron cargar las cuotas.</p>
          <button onClick={() => refetch()} className="btn btn-primary btn-sm">
            Reintentar
          </button>
        </div>
      ) : current.length === 0 ? (
        <div className="flex flex-col items-center py-12 gap-4">
          {tab === "overdue" ? (
            <CheckCircle2 className="w-14 h-14 text-primary" />
          ) : (
            <CalendarCheck className="w-14 h-14 text-muted-foreground" />
          )}
          <p className="text-base text-muted-foreground">
            {tab === "overdue" ? "Sin cuotas en mora" : "Sin cuotas pendientes"}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {current.map((inst) => {
            const isOverdue = tab === "overdue";
            const merchant = inst.transaction?.merchant?.tradeName ?? "Comercio";
            return (
              <li key={inst.id}>
                <Link
                  href={`/cuotas/${inst.id}`}
                  className={`block p-4 rounded-2xl border bg-base-100 hover:shadow-md transition-shadow ${
                    isOverdue ? "border-error/30" : "border-border"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isOverdue ? "bg-error/10 text-error" : "bg-primary/10 text-primary"
                      }`}
                    >
                      {isOverdue ? (
                        <AlertTriangle className="w-5 h-5" />
                      ) : (
                        <Clock className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-bold text-foreground"
                        style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
                      >
                        Cuota #
                        {inst.installmentNumber ?? "—"} · {merchant}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Vence: {formatDate(inst.dueDate)}
                      </p>
                    </div>
                    <p
                      className={`text-base font-bold shrink-0 ${
                        isOverdue ? "text-error" : "text-foreground"
                      }`}
                      style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
                    >
                      {formatCurrency(inst.amount)}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
