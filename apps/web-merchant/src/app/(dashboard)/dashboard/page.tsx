"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DollarSign, TrendingUp, Clock, QrCode, AlertCircle, RefreshCw, CheckCircle2, ArrowRight } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { getApiUrl, apiFetch } from "../../../lib/api";
import { Transaction, TransactionsResponse } from "../../../types/merchant";

interface DailyTx {
  id: string;
  amount: string;
  mdrFee: string;
  time: string;
  status: string;
}

export default function GenerarQRPage() {
  const router = useRouter();
  
  // ── Daily transactions state ──
  const [dailyTxs, setDailyTxs] = useState<DailyTx[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ── QR form state ──
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [qrPayload, setQrPayload] = useState("");
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrConfirmed, setQrConfirmed] = useState(false);
  const amountInputRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [defaultDesc, setDefaultDesc] = useState(() =>
    typeof window !== "undefined" ? (localStorage.getItem("default_qr_desc") ?? "") : ""
  );

  const fetchTodayTransactions = async () => {
    const res = await apiFetch(getApiUrl("merchant/transactions?limit=20&offset=0"), {});
    if (!res.ok) return [];
    const data = await res.json() as TransactionsResponse;
    const txs: Transaction[] = data.transactions || [];
    return txs.map((tx) => ({
      id: String(tx.id).slice(0, 8).toUpperCase(),
      amount: `$${Number(tx.total_amount || 0).toFixed(2)}`,
      mdrFee: `$${Number(tx.mdr_fee || 0).toFixed(2)}`,
      time: new Date(String(tx.created_at)).toLocaleTimeString("es-VE", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: tx.status === "COMPLETED" ? "Liquidado" : "Pendiente",
    }));
  };

  const handleRefreshCobros = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const txs = await fetchTodayTransactions();
      if (txs.length > 0) setDailyTxs(txs);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const fetchQrToken = async (amount: number, description: string): Promise<string> => {
    const res = await apiFetch(getApiUrl("merchant/qr/generate"), {
      method: "POST",
      body: JSON.stringify({ amount, description }),
    });
    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
    const data = await res.json();
    return data.qrToken as string;
  };

  const fetchQrStatus = async (token: string): Promise<string> => {
    const res = await apiFetch(getApiUrl(`merchant/qr/${token}/status`), {});
    if (!res.ok) return "UNKNOWN";
    const data = await res.json();
    return data.status as string;
  };

  const handleGenerateQR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    setError(null);
    setIsLoading(true);
    setQrConfirmed(false);
    try {
      const token = await fetchQrToken(parseFloat(amount), description || defaultDesc || "Cobro Médico");
      setQrPayload(token);
      setIsQrOpen(true);
      pollingRef.current = setInterval(async () => {
        const status = await fetchQrStatus(token);
        if (status === "ACTIVE" || status === "COMPLETED") {
          setQrConfirmed(true);
          if (pollingRef.current) clearInterval(pollingRef.current);
        } else if (status === "EXPIRED") {
          setIsQrOpen(false);
          setError("El QR expiró sin ser escaneado. Genera uno nuevo.");
          if (pollingRef.current) clearInterval(pollingRef.current);
        }
      }, 5000);
    } catch (err) {
      setError("No se pudo conectar al servidor. Verifique su sesión e intente de nuevo.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewCharge = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    setIsQrOpen(false);
    setAmount("");
    setDescription("");
    setQrPayload("");
    setQrConfirmed(false);
    setTimeout(() => amountInputRef.current?.focus(), 100);
  };

  useEffect(() => {
    handleRefreshCobros();
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [handleRefreshCobros]);

  const totalHoy = dailyTxs
    .filter((tx) => tx.status === "Liquidado")
    .reduce((acc, tx) => acc + parseFloat(tx.amount.replace("$", "")), 0);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        {[
          { label: "Recaudado hoy", value: `$${totalHoy.toFixed(2)}`, icon: DollarSign, color: "text-primary" },
          { label: "Transacciones", value: `${dailyTxs.length}`, icon: TrendingUp, color: "text-green-600" },
          { label: "Pendientes", value: `${dailyTxs.filter(t => t.status === "Pendiente").length}`, icon: Clock, color: "text-muted-foreground" },
        ].map((kpi) => (
          <div key={kpi.label} className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body flex-row items-center gap-4 p-5">
              <div className="p-2.5 rounded-lg bg-primary/10">
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold font-(family-name:--font-syne)">{kpi.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{kpi.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2 max-w-5xl">
        {/* Formulario QR */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body">
            <h3 className="card-title font-(family-name:--font-syne)">Nuevo Cobro</h3>
            <p className="text-sm text-base-content/60 mb-2">Genera un QR para que el paciente pague desde su app en cuotas sin interés.</p>
            <form onSubmit={handleGenerateQR} className="space-y-5">
              <div className="form-control gap-1">
                <label htmlFor="amount" className="label pb-0"><span className="label-text font-medium">Monto Total (USD)</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold pointer-events-none">$</span>
                  <input ref={amountInputRef} id="amount" type="number" step="0.01" min="1" placeholder="0.00" required aria-required="true" className="input input-bordered w-full pl-8 text-lg font-semibold" value={amount} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)} />
                </div>
              </div>
              <div className="form-control gap-1">
                <label htmlFor="desc" className="label pb-0"><span className="label-text font-medium">Descripción <span className="opacity-60 font-normal">(opcional)</span></span></label>
                <input id="desc" className="input input-bordered w-full" placeholder={defaultDesc || "Ej. Consulta Especialista + Rayos X"} value={description} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)} />
              </div>
              {amount && parseFloat(amount) > 0 && (
                <div className="p-4 rounded-lg bg-accent/60 border border-border space-y-1.5 text-sm">
                  <div className="flex justify-between font-semibold">
                    <span>Inicial (40%)</span><span>${(parseFloat(amount) * 0.4).toFixed(2)}</span>
                  </div>
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="flex justify-between text-muted-foreground">
                      <span>Cuota {n} de 3</span><span>${((parseFloat(amount) * 0.6) / 3).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}
              {error && (
                <div role="alert" className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /><span>{error}</span>
                </div>
              )}
              <button type="submit" className="btn btn-primary w-full gap-2" disabled={isLoading}>
                {isLoading ? <span className="loading loading-spinner loading-sm" /> : <QrCode className="w-5 h-5" />}
                {isLoading ? "Generando..." : "Generar Código QR"}
              </button>
            </form>
          </div>
        </div>

        {/* Cobros del día */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body">
            <div className="flex flex-row items-center justify-between mb-2">
            <div>
              <h3 className="card-title font-(family-name:--font-syne)">Cobros de Hoy</h3>
              <p className="text-sm text-base-content/60">Transacciones del día</p>
            </div>
            <button onClick={handleRefreshCobros} aria-label="Actualizar cobros" className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
            </div>
            <div className="space-y-3">
              {dailyTxs.map((tx, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-accent/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${tx.status === "Liquidado" ? "bg-primary/10" : "bg-muted"}`}>
                      <CheckCircle2 className={`w-4 h-4 ${tx.status === "Liquidado" ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{tx.id}</p>
                      <p className="text-xs text-muted-foreground">{tx.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{tx.amount}</p>
                    <p className="text-[10px] text-destructive">MDR: -{tx.mdrFee}</p>
                    <span className={`badge badge-xs mt-0.5 ${tx.status === "Liquidado" ? "badge-primary" : "badge-ghost"}`}>{tx.status}</span>
                  </div>
                </div>
              ))}
              <button onClick={() => router.push("/historial")} className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all mt-1">
                Ver historial completo <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal QR ──────────────────────────────────────────────────────── */}
      {isQrOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-sm flex flex-col items-center text-center p-8">
            <h3 className="text-xl font-bold font-(family-name:--font-syne) mb-1">Código QR Generado</h3>
            <p className="text-sm opacity-60 mb-4">El paciente escaneará este código desde su app SaludTech.</p>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-base-300 my-4">
              <QRCodeSVG value={qrPayload || "preview"} size={200} level="Q" includeMargin={false} />
            </div>

            <div className="space-y-1 mb-4">
              <p className="font-bold text-3xl text-primary font-(family-name:--font-syne)">${amount}</p>
              <p className="text-sm opacity-60">{description || defaultDesc || "Cobro Médico"}</p>
            </div>

            {qrConfirmed ? (
              <div className="alert alert-success text-sm mb-4">
                <CheckCircle2 className="w-4 h-4" />
                ¡Pago confirmado! El paciente aprobó el financiamiento.
              </div>
            ) : (
              <div className="alert mb-4">
                <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm">Esperando confirmación del paciente...</span>
              </div>
            )}

            <button className="btn btn-outline w-full" onClick={handleNewCharge}>
              Hacer otro cobro
            </button>
          </div>
          <div className="modal-backdrop" onClick={handleNewCharge} />
        </div>
      )}
    </>
  );
}
