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
  ChevronRight,
} from "lucide-react";
import { useFetchData } from "@saludtech/shared";
import { getApiUrl } from "../../../lib/api";
import { formatWithVES, formatCurrency, formatVES, formatDate } from "../../../lib/utils";
import { useTranslations } from "next-intl";
import type { Installment } from "../../../types/patient";

export default function CuotasPage() {
  const t = useTranslations("Installments");
  const tCommon = useTranslations("Common");
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
        <h1 className="text-xl font-bold text-foreground">
          {t("title")}
        </h1>
        <button
          onClick={() => refetch()}
          aria-label={t("reload")}
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
          {t("tabPending", { count: pending.length })}
        </button>
        <button
          role="tab"
          aria-selected={tab === "overdue"}
          className={`tab ${tab === "overdue" ? "tab-active" : ""}`}
          onClick={() => setTab("overdue")}
        >
          {t("tabOverdue", { count: overdue.length })}
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
          <p className="text-muted-foreground">{t("loadError")}</p>
          <button onClick={() => refetch()} className="btn btn-primary btn-sm">
            {tCommon("retry")}
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
            {tab === "overdue" ? t("noOverdue") : t("noPending")}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div data-tour="installment-list" className="hidden lg:block overflow-x-auto rounded-2xl border border-border">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>{t("colNumber")}</th>
                  <th>{t("colMerchant")}</th>
                  <th>{t("colAmount")}</th>
                  <th>{t("colDue")}</th>
                  <th>{t("colStatus")}</th>
                  <th className="text-right">{t("colAction")}</th>
                </tr>
              </thead>
              <tbody>
                {current.map((inst, idx) => {
                  const isOverdue = tab === "overdue";
                  const merchant = inst.transaction?.merchant?.tradeName ?? t("merchant");
                  return (
                    <tr key={inst.id} data-tour={idx === 0 ? "installment-card" : undefined}>
                      <td className="font-semibold">#{inst.installmentNumber ?? "—"}</td>
                      <td>{merchant}</td>
                      <td>
                        <div className="font-semibold">{formatCurrency(inst.amount)}</div>
                        {inst.amountVES && inst.amountVES > 0 && (
                          <div className="text-xs text-muted-foreground">(Bs. {formatVES(inst.amountVES)})</div>
                        )}
                      </td>
                      <td className="text-sm">{formatDate(inst.dueDate)}</td>
                      <td>
                        <span className={`badge badge-sm ${isOverdue ? "badge-error" : "badge-warning"}`}>
                          {isOverdue ? t("overdue") : t("pending")}
                        </span>
                      </td>
                      <td className="text-right">
                        <Link href={`/cuotas/${inst.id}`} className="btn btn-primary btn-xs">
                          {t("pay")}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul data-tour="installment-list" className="lg:hidden space-y-3">
            {current.map((inst, idx) => {
              const isOverdue = tab === "overdue";
              const merchant = inst.transaction?.merchant?.tradeName ?? t("merchant");
              return (
                <li key={inst.id} data-tour={idx === 0 ? "installment-card" : undefined}>
                  <Link
                    href={`/cuotas/${inst.id}`}
                    className={`block p-4 rounded-2xl border bg-base-100 hover:shadow-md transition-shadow ${
                      isOverdue ? "border-error/30" : "border-border"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
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
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-foreground font-display truncate">
                            #{inst.installmentNumber ?? "—"}
                          </p>
                          <span className={`badge badge-xs ${isOverdue ? "badge-error" : "badge-warning"}`}>
                            {isOverdue ? t("overdue") : t("pending")}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {merchant}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {t("dueLabel", { date: formatDate(inst.dueDate) })}
                        </p>
                        <div className="flex items-baseline gap-1.5 mt-2">
                          <span
                            className={`text-lg font-bold font-display ${
                              isOverdue ? "text-error" : "text-foreground"
                            }`}
                          >
                            {formatCurrency(inst.amount)}
                          </span>
                          {inst.amountVES && inst.amountVES > 0 && (
                            <span className="text-xs text-muted-foreground">
                              (Bs. {formatVES(inst.amountVES)})
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0 mt-1" />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
