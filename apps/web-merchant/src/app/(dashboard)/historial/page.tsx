"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Clock, Filter, Download, RefreshCw } from "lucide-react";
import { getApiUrl, apiFetch } from "../../../lib/api";

interface HistoryTx {
  id: string;
  totalAmount: number;
  status: string;
  description: string;
  mdrFee: number;
  createdAt: string;
}

export default function HistorialPage() {
  const t = useTranslations("History");
  const [historyTxs, setHistoryTxs] = useState<HistoryTx[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyFilter, setHistoryFilter] = useState("");

  useEffect(() => {
    const fetchAllTransactions = async () => {
      setHistoryLoading(true);
      try {
        const res = await apiFetch(getApiUrl("merchant/transactions?limit=100&offset=0"), {});
        if (!res.ok) return;
        const data = await res.json();
        const txs = data.transactions || [];
        const mapped = txs.map((tx: any) => ({
          id: String(tx.id).slice(0, 8).toUpperCase(),
          totalAmount: Number(tx.total_amount || 0),
          status: String(tx.status || "PENDING"),
          description: String(tx.description ?? t("medicalCharge")),
          mdrFee: Number(tx.mdr_fee || 0),
          createdAt: String(tx.created_at),
          creditLineType: tx.credit_line_type as string | undefined,
        }));
        setHistoryTxs(mapped);
      } finally {
        setHistoryLoading(false);
      }
    };
    fetchAllTransactions();
  }, []);

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            placeholder={t("filterPlaceholder")}
            value={historyFilter}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHistoryFilter(e.target.value)}
            className="pl-9 pr-4 py-2 bg-muted rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary w-full"
            aria-label={t("filterAriaLabel")}
          />
        </div>
        <button
          onClick={() => {
            const csv = ["ID,Descripción,Monto,Estado,Fecha",
              ...historyTxs.map(t => `${t.id},"${t.description}",${t.totalAmount},${t.status},${t.createdAt}`)
            ].join("\n");
            const a = document.createElement("a");
            a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
            a.download = "historial.csv";
            a.click();
          }}
          aria-label={t("exportAriaLabel")}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Download className="w-4 h-4" /> {t("exportCsv")}
        </button>
      </div>

      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="p-0">
          {historyLoading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
              <RefreshCw className="w-5 h-5 animate-spin" /> {t("loading")}
            </div>
          ) : historyTxs.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Clock className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">{t("empty")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left px-4 py-3 font-medium">{t("colId")}</th>
                    <th className="text-left px-4 py-3 font-medium">{t("colDescription")}</th>
                    <th className="text-left px-4 py-3 font-medium">{t("colLine")}</th>
                    <th className="text-right px-4 py-3 font-medium">{t("colAmount")}</th>
                    <th className="text-right px-4 py-3 font-medium">{t("colMdr")}</th>
                    <th className="text-center px-4 py-3 font-medium">{t("colStatus")}</th>
                    <th className="text-left px-4 py-3 font-medium">{t("colDate")}</th>
                  </tr>
                </thead>
                <tbody>
                  {historyTxs
                    .filter(tx =>
                      historyFilter === "" ||
                      tx.id.toLowerCase().includes(historyFilter.toLowerCase()) ||
                      tx.description.toLowerCase().includes(historyFilter.toLowerCase())
                    )
                    .map((tx) => (
                      <tr key={tx.id} className="border-b border-border/60 hover:bg-accent/40 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{tx.id}</td>
                        <td className="px-4 py-3">{tx.description}</td>
                        <td className="px-4 py-3">
                          {(tx as HistoryTx & { creditLineType?: string }).creditLineType && (
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              (tx as HistoryTx & { creditLineType?: string }).creditLineType === 'MAYOR_CUIDADO'
                                ? 'bg-violet-100 text-violet-700'
                                : (tx as HistoryTx & { creditLineType?: string }).creditLineType === 'SALUD_COTIDIANA'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {(tx as HistoryTx & { creditLineType?: string }).creditLineType === 'MAYOR_CUIDADO' ? t("lineMajorCare")
                                : (tx as HistoryTx & { creditLineType?: string }).creditLineType === 'SALUD_COTIDIANA' ? t("lineDailyHealth")
                                : t("lineSpecialty")}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">${tx.totalAmount.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-destructive text-xs">-${tx.mdrFee.toFixed(2)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`badge ${
                            tx.status === "ACTIVE" || tx.status === "COMPLETED" ? "badge-primary" :
                            tx.status === "OVERDUE" ? "badge-error" : "badge-ghost"
                          }`}>
                            {tx.status === "ACTIVE" || tx.status === "COMPLETED" ? t("statusSettled") :
                             tx.status === "OVERDUE" ? t("statusOverdue") : t("statusPending")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {new Date(tx.createdAt).toLocaleDateString("es-VE")}
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
  );
}
