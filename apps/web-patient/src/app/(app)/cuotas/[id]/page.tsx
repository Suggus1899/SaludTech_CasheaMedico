"use client";

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  AlertTriangle,
  Smartphone,
  Building2,
  DollarSign,
  CheckCircle2,
  Info,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { getApiUrl, getAuthHeaders } from "../../../../lib/api";
import { formatCurrency, formatDate } from "../../../../lib/utils";
import type { Installment } from "../../../../types/patient";

const methods = [
  { value: "PAGO_MOVIL", label: "Pago Móvil", icon: Smartphone },
  { value: "TRANSFERENCIA", label: "Transferencia", icon: Building2 },
  { value: "ZELLE", label: "Zelle", icon: DollarSign },
];

export default function PayInstallmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [installment, setInstallment] = useState<Installment | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState("PAGO_MOVIL");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [reference, setReference] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(getApiUrl(`patient/installments/${id}`), {
          headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error("Error");
        const data = (await res.json()) as Installment;
        setInstallment(data ?? null);
      } catch {
        setError("No se pudo cargar la cuota.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleConfirm = async () => {
    if (!installment) return;
    setError(null);
    setIsPaying(true);
    try {
      const res = await fetch(getApiUrl("patient/payments"), {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          installmentId: installment.id,
          method: selectedMethod,
          phone: selectedMethod === "PAGO_MOVIL" ? phone : undefined,
          email: selectedMethod === "ZELLE" ? email : undefined,
          reference,
        }),
      });
      if (!res.ok) throw new Error("Error");
      setSuccess(true);
      setTimeout(() => router.push("/cuotas"), 1800);
    } catch {
      setError("No se pudo procesar el pago. Intenta de nuevo.");
    } finally {
      setIsPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner text-primary" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex flex-col items-center py-20 px-6 text-center">
        <div className="p-6 rounded-full bg-success/10">
          <CheckCircle2 className="w-14 h-14 text-success" />
        </div>
        <h2
          className="text-2xl font-bold text-foreground mt-6"
          style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
        >
          ¡Pago Confirmado!
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          Tu cuota ha sido registrada exitosamente.
        </p>
      </div>
    );
  }

  if (!installment) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">Cuota no encontrada.</p>
        <button onClick={() => router.push("/cuotas")} className="btn btn-primary btn-sm mt-4">
          Volver a cuotas
        </button>
      </div>
    );
  }

  const isOverdue = installment.status === "OVERDUE";
  const merchant = installment.transaction?.merchant?.tradeName ?? "Comercio";

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.back()}
        aria-label="Volver"
        className="btn btn-ghost btn-sm -ml-2"
      >
        <ArrowLeft className="w-4 h-4" /> Volver
      </button>

      <h1
        className="text-xl font-bold text-foreground"
        style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
      >
        Pagar Cuota
      </h1>

      {/* Summary */}
      <div
        className={`p-5 rounded-2xl border bg-base-100 ${
          isOverdue ? "border-error/30" : "border-border"
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div
            className={`p-2.5 rounded-full ${
              isOverdue ? "bg-error/10 text-error" : "bg-primary/10 text-primary"
            }`}
          >
            {isOverdue ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <CreditCard className="w-5 h-5" />
            )}
          </div>
          <div>
            <p
              className="text-base font-bold text-foreground"
              style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
            >
              Cuota #{installment.installmentNumber ?? "—"} · {merchant}
            </p>
            <p
              className={`text-xs mt-0.5 ${
                isOverdue ? "text-error" : "text-muted-foreground"
              }`}
            >
              Vence: {formatDate(installment.dueDate)}
            </p>
          </div>
        </div>

        <div className="divider my-4" />

        <div className="space-y-2">
          <Row label="Monto cuota" value={formatCurrency(installment.amount)} />
          <Row
            label="Total a pagar"
            value={formatCurrency(installment.amount)}
            bold
          />
        </div>
      </div>

      {/* Payment method */}
      <section>
        <h2
          className="text-base font-bold text-foreground mb-3"
          style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
        >
          Método de Pago
        </h2>
        <div className="space-y-2.5">
          {methods.map((m) => {
            const isSelected = selectedMethod === m.value;
            const Icon = m.icon;
            return (
              <button
                key={m.value}
                onClick={() => setSelectedMethod(m.value)}
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl border transition-colors ${
                  isSelected
                    ? "border-primary bg-primary/8"
                    : "border-border bg-base-100 hover:bg-muted"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isSelected ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <span
                  className={`flex-1 text-left text-sm ${
                    isSelected ? "font-semibold text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {m.label}
                </span>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-primary" />}
              </button>
            );
          })}
        </div>
      </section>

      {/* Report fields */}
      <div className="space-y-3">
        {selectedMethod === "PAGO_MOVIL" && (
          <>
            <Input label="Teléfono" value={phone} onChange={setPhone} type="tel" />
            <Input
              label="Nro. Referencia"
              value={reference}
              onChange={setReference}
              type="text"
            />
          </>
        )}
        {selectedMethod === "ZELLE" && (
          <>
            <Input label="Correo Zelle" value={email} onChange={setEmail} type="email" />
            <Input
              label="Referencia"
              value={reference}
              onChange={setReference}
              type="text"
            />
          </>
        )}
        {selectedMethod === "TRANSFERENCIA" && (
          <Input
            label="Nro. Referencia"
            value={reference}
            onChange={setReference}
            type="text"
          />
        )}
      </div>

      {/* Notice */}
      <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-primary/8">
        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-primary leading-relaxed">
          El pago se registra en el sistema. Tu cuenta se reactivará automáticamente una
          vez confirmado.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <button
        onClick={() => setShowConfirm(true)}
        disabled={isPaying}
        className="btn btn-primary w-full text-base font-bold"
      >
        {isPaying ? <span className="loading loading-spinner loading-sm" /> : null}
        {isPaying
          ? "Procesando..."
          : `Confirmar Pago · ${formatCurrency(installment.amount)}`}
      </button>

      {/* Confirm modal */}
      {showConfirm && (
        <div className="modal modal-open" role="dialog" aria-modal="true">
          <div className="modal-box">
            <h3
              className="text-lg font-bold"
              style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
            >
              Confirmar Pago
            </h3>
            <p className="py-4 text-sm text-muted-foreground">
              Vas a pagar {formatCurrency(installment.amount)} para la cuota #
              {installment.installmentNumber ?? "—"} de {merchant}. ¿Deseas continuar?
            </p>
            <div className="modal-action">
              <button onClick={() => setShowConfirm(false)} className="btn btn-ghost btn-sm">
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowConfirm(false);
                  handleConfirm();
                }}
                disabled={isPaying}
                className="btn btn-primary btn-sm"
              >
                {isPaying ? <span className="loading loading-spinner loading-xs" /> : null}
                Sí, pagar
              </button>
            </div>
          </div>
          <button
            className="modal-backdrop"
            aria-label="Cerrar"
            onClick={() => setShowConfirm(false)}
          />
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span
        className={`text-foreground ${bold ? "text-lg font-bold" : "text-sm font-semibold"}`}
        style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
      >
        {value}
      </span>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type: string;
}) {
  return (
    <div className="form-control gap-1">
      <label className="label pb-0">
        <span className="label-text font-medium">{label}</span>
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input input-bordered w-full"
      />
    </div>
  );
}
