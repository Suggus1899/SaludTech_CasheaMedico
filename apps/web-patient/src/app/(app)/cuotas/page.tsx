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
  const [tab, setTab] = useState<"pending" | "paid">("pending");
  const { data: pendingData, loading: pendingLoading, error: pendingError, refetch: refetchPending } = useFetchData<Installment[]>(
    getApiUrl("patient/transactions/my/installments/pending")
  );
  const { data: paidData, loading: paidLoading, error: paidError, refetch: refetchPaid } = useFetchData<Installment[]>(
    getApiUrl("patient/transactions/my/installments/paid")
  );

  const pendingInstallments = pendingData ?? [];
  const paidInstallments = paidData ?? [];

  // Pending tab: overdue first, then pending — both sorted by due date
  const overdue = pendingInstallments
    .filter((i) => i.status === "OVERDUE")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const pending = pendingInstallments
    .filter((i) => i.status === "PENDING")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const pendingCombined = [...overdue, ...pending];

  const current = tab === "pending" ? pendingCombined : paidInstallments;
  const loading = tab === "pending" ? pendingLoading : paidLoading;
  const error = tab === "pending" ? pendingError : paidError;
  const refetch = () => { refetchPending(); refetchPaid(); };

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
          {t("tabPending", { count: pendingCombined.length })}
        </button>
        <button
          role="tab"
          aria-selected={tab === "paid"}
          className={`tab ${tab === "paid" ? "tab-active" : ""}`}
          onClick={() => setTab("paid")}
        >
          {t("tabPaid", { count: paidInstallments.length })}
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
          {tab === "paid" ? (
            <CheckCircle2 className="w-14 h-14 text-muted-foreground" />
          ) : (
            <CalendarCheck className="w-14 h-14 text-primary" />
          )}
          <p className="text-base text-muted-foreground">
            {tab === "paid" ? t("noPaid") : t("noPending")}
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
                  <th>{tab === "paid" ? t("colPaid") : t("colDue")}</th>
                  <th>{t("colStatus")}</th>
                  <th className="text-right">{t("colAction")}</th>
                </tr>
              </thead>
              <tbody>
                {current.map((inst, idx) => {
                  const isOverdue = inst.status === "OVERDUE";
                  const isPaid = inst.status === "PAID";
                  const merchant = inst.transaction?.merchant?.tradeName ?? t("merchant");
                  const dateLabel = isPaid && inst.paidAt ? inst.paidAt : inst.dueDate;
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
                      <td className="text-sm">{formatDate(dateLabel)}</td>
                      <td>
                        <span className={`badge badge-sm ${isPaid ? "badge-success" : isOverdue ? "badge-error" : "badge-warning"}`}>
                          {isPaid ? t("paid") : isOverdue ? t("overdue") : t("pending")}
                        </span>
                      </td>
                      <td className="text-right">
                        {isPaid ? (
                          <CheckCircle2 className="w-5 h-5 text-success inline-block" />
                        ) : (
                          <Link href={`/cuotas/${inst.id}`} className="btn btn-primary btn-xs">
                            {t("pay")}
                          </Link>
                        )}
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
              const isOverdue = inst.status === "OVERDUE";
              const isPaid = inst.status === "PAID";
              const merchant = inst.transaction?.merchant?.tradeName ?? t("merchant");
              const dateLabel = isPaid && inst.paidAt ? inst.paidAt : inst.dueDate;
              return (
                <li key={inst.id} data-tour={idx === 0 ? "installment-card" : undefined}>
                  <Link
                    href={`/cuotas/${inst.id}`}
                    className={`block p-4 rounded-2xl border bg-base-100 hover:shadow-md transition-shadow ${
                      isOverdue ? "border-error/30" : isPaid ? "border-success/30" : "border-border"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                          isPaid
                            ? "bg-success/10 text-success"
                            : isOverdue
                            ? "bg-error/10 text-error"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {isPaid ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : isOverdue ? (
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
                          <span className={`badge badge-xs ${isPaid ? "badge-success" : isOverdue ? "badge-error" : "badge-warning"}`}>
                            {isPaid ? t("paid") : isOverdue ? t("overdue") : t("pending")}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {merchant}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {isPaid && inst.paidAt
                            ? t("paidLabel", { date: formatDate(inst.paidAt) })
                            : t("dueLabel", { date: formatDate(inst.dueDate) })}
                        </p>
                        <div className="flex items-baseline gap-1.5 mt-2">
                          <span
                            className={`text-lg font-bold font-display ${
                              isPaid ? "text-success" : isOverdue ? "text-error" : "text-foreground"
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
