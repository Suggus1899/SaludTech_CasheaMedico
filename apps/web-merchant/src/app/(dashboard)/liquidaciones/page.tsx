"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Wallet, Calendar, RefreshCw } from "lucide-react";
import { getApiUrl, apiFetch } from "../../../lib/api";

interface Payout {
  id: string;
  period_start: string;
  period_end: string;
  gross_amount: number;
  mdr_deducted: number;
  net_amount: number;
  status: string;
  paid_at: string | null;
}

export default function LiquidacionesPage() {
  const t = useTranslations("Settlements");
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [payoutsLoading, setPayoutsLoading] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);

  useEffect(() => {
    const fetchPayouts = async () => {
      setPayoutsLoading(true);
      try {
        const res = await apiFetch(getApiUrl("merchant/payouts"), {});
        if (res.ok) {
          const data = await res.json();
          setPayouts(data.payouts || data || []);
        }
      } finally {
        setPayoutsLoading(false);
      }
    };
    fetchPayouts();
  }, []);

  return (
    <>
      <div className="max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{t("count", { count: payouts.length })}</p>
        </div>
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="p-0">
            {payoutsLoading ? (
              <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
                <RefreshCw className="w-5 h-5 animate-spin" /> {t("loading")}
              </div>
            ) : payouts.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Wallet className="w-10 h-10 mx-auto mb-3 opacity-40" />
                <p className="font-medium">{t("empty")}</p>
                <p className="text-sm mt-1">{t("emptyHint")}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground">
                      <th className="text-left px-4 py-3 font-medium">{t("colPeriod")}</th>
                      <th className="text-right px-4 py-3 font-medium">{t("colGross")}</th>
                      <th className="text-right px-4 py-3 font-medium">{t("colMdr")}</th>
                      <th className="text-right px-4 py-3 font-medium">{t("colNet")}</th>
                      <th className="text-center px-4 py-3 font-medium">{t("colStatus")}</th>
                      <th className="text-center px-4 py-3 font-medium">{t("colAction")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map((p) => (
                      <tr key={p.id} className="border-b border-border/60 hover:bg-accent/40 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>{p.period_start} — {p.period_end}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">${Number(p.gross_amount || 0).toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-destructive">-${Number(p.mdr_deducted || 0).toFixed(2)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-primary">${Number(p.net_amount || 0).toFixed(2)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`badge ${p.status === "PAID" ? "badge-primary" : "badge-ghost"}`}>
                            {p.status === "PAID" ? t("settled") : t("pending")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => setSelectedPayout(p)} className="text-xs text-primary hover:underline font-medium">
                            {t("viewDetail")}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Modal Detalle Liquidación ──────────────────────────────────────── */}
      {!!selectedPayout && (
        <div className="modal modal-open">
          <div className="modal-box w-full max-w-md mx-2 p-6">
            <h3 className="font-bold text-lg font-(family-name:--font-syne)">{t("detailTitle")}</h3>
            <p className="text-sm opacity-60 mb-4">{t("detailPeriod", { start: selectedPayout?.period_start, end: selectedPayout?.period_end })}</p>
            {selectedPayout && (
              <div className="space-y-3">
                {[
                  { label: t("detailGross"), value: `$${Number(selectedPayout.gross_amount || 0).toFixed(2)}` },
                  { label: t("detailMdr"), value: `-$${Number(selectedPayout.mdr_deducted || 0).toFixed(2)}`, red: true },
                  { label: t("detailNet"), value: `$${Number(selectedPayout.net_amount || 0).toFixed(2)}`, bold: true },
                  { label: t("detailStatus"), value: selectedPayout.status === "PAID" ? t("settled") : t("pending") },
                  { label: t("detailPaidAt"), value: selectedPayout.paid_at ? new Date(selectedPayout.paid_at).toLocaleDateString("es-VE") : "—" },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between text-sm border-b border-base-300 pb-2 last:border-0">
                    <span className="opacity-60">{row.label}</span>
                    <span className={row.bold ? "font-bold text-primary" : row.red ? "text-error" : "font-medium"}>{row.value}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="modal-action">
              <button className="btn btn-sm" onClick={() => setSelectedPayout(null)}>{t("close")}</button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setSelectedPayout(null)} />
        </div>
      )}
    </>
  );
}
