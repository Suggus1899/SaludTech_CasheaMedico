"use client";

import { useState } from "react";
import Link from "next/link";
import { Pill, RefreshCw, Store, Calendar, X, Plus, QrCode } from "lucide-react";
import { useFetchData } from "@saludtech/shared";
import { getApiUrl, apiFetch } from "../../../lib/api";
import { formatCurrency, formatDate } from "../../../lib/utils";
import { useTranslations } from "next-intl";
import type { Subscription } from "../../../types/patient";

export default function SuscripcionesPage() {
  const t = useTranslations("Subscriptions");
  const tCommon = useTranslations("Common");
  const { data, loading, error, refetch } = useFetchData<Subscription[]>(
    getApiUrl("patient/subscriptions")
  );
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const subscriptions = data ?? [];

  const handleCancel = async (id: string) => {
    setCancellingId(id);
    try {
      await apiFetch(getApiUrl(`patient/subscriptions/${id}`), {
        method: "DELETE",
      });
      setConfirmId(null);
      refetch();
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="space-y-5">
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

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner text-primary" />
        </div>
      ) : error ? (
        <p className="text-center text-muted-foreground py-8">
          {t("loadError")}
        </p>
      ) : subscriptions.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <div className="p-6 rounded-full bg-success/10">
            <Pill className="w-12 h-12 text-success" />
          </div>
          <h2 className="text-lg font-bold text-foreground mt-5">
            {t("noSubscriptions")}
          </h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs">
            {t("noSubscriptionsDesc")}
          </p>
          <Link href="/pagar" className="btn btn-primary btn-sm mt-5 gap-2">
            <QrCode className="w-4 h-4" /> {t("scanQR")}
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {subscriptions.map((sub) => {
            const isActive = sub.status === "ACTIVE";
            return (
              <li
                key={sub.id}
                className={`p-4 rounded-2xl border bg-base-100 ${
                  isActive ? "border-success/30" : "border-border"
                }`}
              >
                <div className="flex items-start justify-between">
                  <p className="text-sm font-bold text-foreground font-display">
                    {sub.plan ?? t("medicine")}
                  </p>
                  <span
                    className={`badge badge-sm ${
                      isActive ? "badge-success" : "badge-ghost"
                    }`}
                  >
                    {isActive ? t("active") : t("cancelled")}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 mt-2">
                  <Store className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {sub.merchant?.tradeName ?? "—"}
                  </span>
                  <span className="flex-1" />
                  <span className="text-sm font-bold text-success font-display">
                    {formatCurrency(sub.monthlyAmount ?? 0)}{tCommon("perMonth")}
                  </span>
                </div>

                {sub.nextBilling && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {t("nextBilling", { date: formatDate(sub.nextBilling) })}
                    </span>
                  </div>
                )}

                {isActive && (
                  <div className="flex justify-end mt-2.5">
                    <button
                      onClick={() => setConfirmId(sub.id)}
                      disabled={cancellingId === sub.id}
                      className="btn btn-ghost btn-xs text-error gap-1"
                    >
                      <X className="w-3 h-3" /> {t("cancel")}
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Confirm cancel modal */}
      {confirmId && (
        <div
          className="modal modal-open"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-title"
        >
          <div className="modal-box">
            <h3 id="cancel-title" className="text-lg font-bold font-display">
              {t("cancelTitle")}
            </h3>
            <p className="py-4 text-sm text-muted-foreground">
              {t("cancelConfirm")}
            </p>
            <div className="modal-action">
              <button onClick={() => setConfirmId(null)} className="btn btn-ghost btn-sm">
                {t("no")}
              </button>
              <button
                onClick={() => handleCancel(confirmId)}
                disabled={cancellingId === confirmId}
                className="btn btn-error btn-sm text-error-content"
              >
                {cancellingId === confirmId ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : null}
                {t("yesCancel")}
              </button>
            </div>
          </div>
          <button
            className="modal-backdrop"
            aria-label={t("close")}
            onClick={() => setConfirmId(null)}
          />
        </div>
      )}
    </div>
  );
}
