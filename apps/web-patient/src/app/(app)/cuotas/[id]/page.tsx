"use client";

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Info,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { getApiUrl, apiFetch } from "../../../../lib/api";
import { formatCurrency, formatWithVES, formatDate } from "../../../../lib/utils";
import { useTranslations } from "next-intl";
import type { Installment } from "../../../../types/patient";

const testCards = [
  { label: "Visa", number: "4111111111111111" },
  { label: "Mastercard", number: "5555555555554444" },
  { label: "Amex", number: "378282246310005" },
  { label: "Discover", number: "6011111111111117" },
];

export default function PayInstallmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const t = useTranslations("PayInstallment");
  const tCommon = useTranslations("Common");

  const [installment, setInstallment] = useState<Installment | null>(null);
  const [loading, setLoading] = useState(true);
  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");
  const [expMonth, setExpMonth] = useState("");
  const [expYear, setExpYear] = useState("");
  const [fullName, setFullName] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch(getApiUrl(`patient/installments/${id}`));
        if (!res.ok) throw new Error("Error");
        const data = (await res.json()) as Installment;
        setInstallment(data ?? null);
      } catch {
        setError(t("loadError"));
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
      const res = await apiFetch(getApiUrl("patient/payments"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          installmentId: installment.id,
          method: "CARD",
          cardNumber,
          cvv,
          expirationMonth: expMonth,
          expirationYear: expYear,
          fullName,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message ?? "Error");
      }
      setSuccess(true);
      setTimeout(() => router.push("/cuotas"), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("paymentError"));
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
        <h2 className="text-2xl font-bold text-foreground mt-6 font-display">
          {t("successTitle")}
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          {t("successDesc")}
        </p>
      </div>
    );
  }

  if (!installment) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">{t("notFound")}</p>
        <button onClick={() => router.push("/cuotas")} className="btn btn-primary btn-sm mt-4">
          {t("backToInstallments")}
        </button>
      </div>
    );
  }

  const isOverdue = installment.status === "OVERDUE";
  const merchant = installment.transaction?.merchant?.tradeName ?? t("merchant");

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <button
        onClick={() => router.back()}
        aria-label={t("back")}
        className="btn btn-ghost btn-sm -ml-2"
      >
        <ArrowLeft className="w-4 h-4" /> {t("back")}
      </button>

      <h1 className="text-xl font-bold text-foreground">
        {t("title")}
      </h1>

      {/* Summary */}
      <div
        data-tour="amount-summary"
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
            <p className="text-base font-bold text-foreground font-display">
              Cuota #{installment.installmentNumber ?? "—"} · {merchant}
            </p>
            <p
              className={`text-xs mt-0.5 ${
                isOverdue ? "text-error" : "text-muted-foreground"
              }`}
            >
              {t("dueLabel", { date: formatDate(installment.dueDate) })}
            </p>
          </div>
        </div>

        <div className="divider my-4" />

        <div className="space-y-2">
          <Row label={t("installmentAmount")} value={formatWithVES(installment.amount, installment.amountVES)} />
          <Row
            label={t("totalToPay")}
            value={formatWithVES(installment.amount, installment.amountVES)}
            bold
          />
        </div>
      </div>

      {/* Payment method — Card form */}
      <section data-tour="card-form">
        <h2 className="text-base font-bold text-foreground mb-3 font-display">
          {t("cardData")}
        </h2>

        {/* Test card quick-select */}
        <div data-tour="test-cards" className="mb-4">
          <p className="text-xs text-muted-foreground mb-2">{t("testCards")}</p>
          <div className="flex flex-wrap gap-2">
            {testCards.map((c) => (
              <button
                key={c.number}
                type="button"
                onClick={() => setCardNumber(c.number)}
                className={`btn btn-xs ${cardNumber === c.number ? "btn-primary" : "btn-outline"}`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Input label={t("cardNumber")} value={cardNumber} onChange={setCardNumber} type="text" placeholder="4111 1111 1111 1111" />
          <Input label={t("cardHolder")} value={fullName} onChange={setFullName} type="text" placeholder="APPROVED" />
          <div className="grid grid-cols-3 gap-3">
            <Input label={t("expMonth")} value={expMonth} onChange={setExpMonth} type="text" placeholder="01" />
            <Input label={t("expYear")} value={expYear} onChange={setExpYear} type="text" placeholder="2027" />
            <Input label={t("cvv")} value={cvv} onChange={setCvv} type="text" placeholder="123" />
          </div>
        </div>
      </section>

      {/* Notice */}
      <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-primary/8">
        <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-primary leading-relaxed">
          {t("paymentNotice")}
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
        disabled={isPaying || !cardNumber || !cvv || !expMonth || !expYear || !fullName}
        className="btn btn-primary w-full text-base font-bold"
      >
        {isPaying ? <span className="loading loading-spinner loading-sm" /> : null}
        {isPaying
          ? t("processing")
          : t("confirmPay", { amount: formatWithVES(installment.amount, installment.amountVES) })}
      </button>

      {/* Confirm modal */}
      {showConfirm && (
        <div className="modal modal-open" role="dialog" aria-modal="true">
          <div className="modal-box">
            <h3 className="text-lg font-bold font-display">
              {t("confirmTitle")}
            </h3>
            <p className="py-4 text-sm text-muted-foreground">
              {t("confirmBody", { amount: formatWithVES(installment.amount, installment.amountVES), number: installment.installmentNumber ?? "—", merchant })}
            </p>
            <div className="modal-action">
              <button onClick={() => setShowConfirm(false)} className="btn btn-ghost btn-sm">
                {tCommon("cancel")}
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
                {t("yesPay")}
              </button>
            </div>
          </div>
          <button
            className="modal-backdrop"
            aria-label={t("close")}
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
        className={`text-foreground font-display ${bold ? "text-lg font-bold" : "text-sm font-semibold"}`}
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
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type: string;
  placeholder?: string;
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
        placeholder={placeholder}
        className="input input-bordered w-full"
      />
    </div>
  );
}
