"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  QrCode,
  Camera,
  CameraOff,
  AlertCircle,
  Store,
  CheckCircle2,
  ArrowLeft,
  Keyboard,
} from "lucide-react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { getApiUrl, apiFetch } from "../../../lib/api";
import { parseQrPayload, formatCurrency, formatWithVES, formatDate } from "../../../lib/utils";
import type { CheckoutPreview } from "../../../types/patient";

type Step = "scan" | "amount" | "checkout" | "success" | "error";

export default function PagarPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);

  const [step, setStep] = useState<Step>("scan");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualPayload, setManualPayload] = useState("");
  const [merchantId, setMerchantId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [numInstallments, setNumInstallments] = useState(3);
  const [preview, setPreview] = useState<CheckoutPreview | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Start camera on mount
  useEffect(() => {
    if (step !== "scan") return;
    let cancelled = false;

    const startCamera = async () => {
      try {
        const reader = new BrowserMultiFormatReader();
        readerRef.current = reader;
        const controls = await reader.decodeFromVideoDevice(
          undefined,
          videoRef.current!,
          (result) => {
            if (result && !cancelled) {
              handleQrPayload(result.getText());
            }
          }
        );
        controlsRef.current = controls;
      } catch {
        if (!cancelled) {
          setCameraError(
            "No se pudo acceder a la cámara. Usa el modo manual o verifica los permisos."
          );
        }
      }
    };

    startCamera();

    return () => {
      cancelled = true;
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const stopCamera = () => {
    controlsRef.current?.stop();
    controlsRef.current = null;
  };

  const handleQrPayload = async (payload: string) => {
    stopCamera();
    setError(null);
    setIsProcessing(true);

    // Dynamic QR (has | signature) or static merchant QR
    if (payload.includes("|") || payload.includes(":")) {
      const parsed = parseQrPayload(payload);
      if (!parsed) {
        setError("QR inválido o corrupto");
        setStep("error");
        setIsProcessing(false);
        return;
      }
      await fetchPreview(parsed.merchantId, parsed.amount, payload);
    } else {
      // Static QR — just merchantId
      setMerchantId(payload);
      setStep("amount");
      setIsProcessing(false);
    }
  };

  const fetchPreview = async (
    mId: string,
    amt: number,
    qrToken: string,
    installments = 3
  ) => {
    try {
      const res = await apiFetch(getApiUrl("patient/transactions/preview"), {
        method: "POST",
        body: JSON.stringify({
          merchantId: mId,
          amount: amt,
          requestedInstallments: installments,
          qrToken,
        }),
      });
      if (!res.ok) throw new Error("preview failed");
      const data = (await res.json()) as CheckoutPreview;
      setPreview(data);
      setMerchantId(mId);
      setStep("checkout");
    } catch {
      setError("No se pudo simular el financiamiento. Intenta de nuevo.");
      setStep("error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualPayload.trim()) return;
    handleQrPayload(manualPayload.trim());
  };

  const handleAmountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number.parseFloat(amount);
    if (!amt || amt <= 0 || !merchantId) return;
    const dummyToken = `${merchantId}:${amt}:${Date.now()}`;
    await fetchPreview(merchantId, amt, dummyToken, numInstallments);
  };

  const handleRecomputePreview = async (newInstallments: number) => {
    if (!merchantId || !preview) return;
    setNumInstallments(newInstallments);
    const amt = preview.amount;
    const dummyToken = `${merchantId}:${amt}:${Date.now()}`;
    await fetchPreview(merchantId, amt, dummyToken, newInstallments);
  };

  const handleConfirmPayment = async () => {
    if (!preview || !merchantId) return;
    setIsProcessing(true);
    try {
      const qrToken =
        manualPayload || `${merchantId}:${preview.amount}:${Date.now()}`;
      const res = await apiFetch(getApiUrl("patient/transactions"), {
        method: "POST",
        body: JSON.stringify({
          merchantId,
          amount: preview.amount,
          requestedInstallments: preview.requestedInstallments,
          qrToken,
        }),
      });
      if (!res.ok) throw new Error("payment failed");
      setStep("success");
      setTimeout(() => router.push("/dashboard"), 1800);
    } catch {
      setError("Error en el pago. Revisa tu límite disponible.");
      setStep("error");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetToScan = () => {
    setError(null);
    setManualPayload("");
    setAmount("");
    setPreview(null);
    setMerchantId(null);
    setStep("scan");
  };

  // ─── Scan step ─────────────────────────────────────────────────────────
  if (step === "scan") {
    return (
      <div className="max-w-lg mx-auto space-y-5">
        <button
          onClick={() => router.back()}
          aria-label="Volver"
          className="btn btn-ghost btn-sm -ml-2"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>

        <h1 className="text-xl font-bold text-foreground">
          Escanear QR
        </h1>

        {/* Camera viewport */}
        <div className="relative aspect-square w-full max-w-sm mx-auto rounded-2xl overflow-hidden bg-black">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            muted
            playsInline
          />
          {/* Overlay frame */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-8 border-2 border-primary rounded-xl" />
          </div>
          {isProcessing && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="loading loading-spinner text-primary" />
            </div>
          )}
        </div>

        {cameraError && (
          <div
            role="alert"
            className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg"
          >
            <CameraOff className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{cameraError}</span>
          </div>
        )}

        {/* Manual fallback */}
        <form onSubmit={handleManualSubmit} className="space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Keyboard className="w-4 h-4" />
            <span>O pega el código QR manualmente:</span>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualPayload}
              onChange={(e) => setManualPayload(e.target.value)}
              placeholder="Pega aquí el código del QR"
              className="input input-bordered flex-1 text-sm"
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={isProcessing}>
              Validar
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ─── Amount entry step ─────────────────────────────────────────────────
  if (step === "amount") {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <button
          onClick={resetToScan}
          aria-label="Volver"
          className="btn btn-ghost btn-sm -ml-2"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>

        <div className="text-center pt-6">
          <Store className="w-12 h-12 text-primary mx-auto" />
          <h1 className="text-xl font-bold text-foreground mt-4">
            Ingresar Monto
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Comercio: {merchantId}
          </p>
        </div>

        <form onSubmit={handleAmountSubmit} className="space-y-6">
          <div className="form-control">
            <label className="label justify-center">
              <span className="label-text">Ingresa el monto de tu factura</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground">
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                autoFocus
                className="input input-bordered w-full text-center text-3xl font-bold pl-10 font-display"
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Número de cuotas</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[3, 6, 9, 12].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setNumInstallments(n)}
                  className={`btn btn-sm ${numInstallments === n ? "btn-primary" : "btn-outline"}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full text-base font-bold"
            disabled={isProcessing || !amount}
          >
            {isProcessing ? <span className="loading loading-spinner loading-sm" /> : null}
            Continuar
          </button>
        </form>
      </div>
    );
  }

  // ─── Checkout step ─────────────────────────────────────────────────────
  if (step === "checkout" && preview) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <button
          onClick={resetToScan}
          aria-label="Volver"
          className="btn btn-ghost btn-sm -ml-2"
        >
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>

        <h1 className="text-xl font-bold text-foreground">
          Resumen de Financiamiento
        </h1>

        {/* Merchant card */}
        <div className="p-6 rounded-2xl border border-border bg-base-100 text-center">
          <Store className="w-12 h-12 text-primary mx-auto" />
          <p className="text-lg font-bold text-foreground mt-4 font-display">
            {merchantId}
          </p>
          <p className="text-4xl font-bold text-foreground mt-2 font-display">
            {formatCurrency(preview.amount)}
          </p>
          {preview.amountVES ? (
            <p className="text-sm text-muted-foreground mt-1">
              (Bs. {new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(preview.amountVES)})
            </p>
          ) : null}
          <p className="text-sm text-muted-foreground mt-1">Monto Total a Financiar</p>
        </div>

        {/* Installment breakdown */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground font-display">
              Desglose de Pago ({preview.requestedInstallments} cuotas)
            </h2>
          </div>

          {/* Installment selector */}
          <div className="flex gap-2 mb-4">
            {[3, 6, 9, 12].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => handleRecomputePreview(n)}
                disabled={isProcessing}
                className={`btn btn-xs ${numInstallments === n ? "btn-primary" : "btn-outline"}`}
              >
                {n}
              </button>
            ))}
          </div>
          <ul className="space-y-2">
            {preview.installments.map((inst) => (
              <li key={inst.installmentNumber} className="flex justify-between py-2">
                <span className="text-sm text-muted-foreground">
                  Cuota {inst.installmentNumber} ({formatDate(inst.dueDate)})
                </span>
                <div className="text-right">
                  <span className="text-sm font-semibold text-foreground font-display block">
                    {formatCurrency(inst.amount)}
                  </span>
                  {inst.amountVES ? (
                    <span className="text-xs text-muted-foreground">
                      (Bs. {new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(inst.amountVES)})
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <button
          onClick={handleConfirmPayment}
          disabled={isProcessing}
          className="btn btn-primary w-full text-base font-bold"
        >
          {isProcessing ? <span className="loading loading-spinner loading-sm" /> : null}
          Confirmar y Pagar
        </button>
      </div>
    );
  }

  // ─── Success step ──────────────────────────────────────────────────────
  if (step === "success") {
    return (
      <div className="max-w-lg mx-auto flex flex-col items-center py-20 px-6 text-center">
        <div className="p-6 rounded-full bg-success/10">
          <CheckCircle2 className="w-14 h-14 text-success" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mt-6 font-display">
          ¡Pago Exitoso!
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          Tu financiamiento ha sido procesado correctamente.
        </p>
      </div>
    );
  }

  // ─── Error step ────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center py-20 px-6 text-center space-y-4">
      <div className="p-6 rounded-full bg-destructive/10">
        <AlertCircle className="w-14 h-14 text-destructive" />
      </div>
      <p className="text-base text-muted-foreground">{error}</p>
      <button onClick={resetToScan} className="btn btn-primary">
        Intentar de nuevo
      </button>
    </div>
  );
}
