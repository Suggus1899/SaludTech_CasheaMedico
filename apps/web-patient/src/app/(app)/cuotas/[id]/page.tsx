"use client";

import { useState, use, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Info,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
  Building2,
  Wallet,
  Globe,
  Check,
} from "lucide-react";
import { getApiUrl, apiFetch } from "../../../../lib/api";
import { formatCurrency, formatWithVES, formatDate } from "../../../../lib/utils";
import { useTranslations } from "next-intl";
import type { Installment } from "../../../../types/patient";
import {
  detectBrand,
  formatCardNumber,
  isValidCardNumber,
  isValidCvv,
  isValidExpiration,
  brandLabels,
  type CardBrand,
} from "../../../../lib/cardValidation";

const testCards = [
  { label: "Visa", number: "4111111111111111" },
  { label: "Mastercard", number: "5555555555554444" },
  { label: "Amex", number: "378282246310005" },
  { label: "Discover", number: "6011111111111117" },
];

type BankOption = {
  id: string;
  icon: "building" | "globe" | "wallet";
  supportedCards: string;
};

const bankOptions: BankOption[] = [
  { id: "bankBanesco", icon: "building", supportedCards: "Visa / Mastercard" },
  { id: "bankBDV", icon: "building", supportedCards: "Visa / Mastercard" },
  { id: "bankMercantil", icon: "building", supportedCards: "Visa / Mastercard" },
  { id: "bankProvincial", icon: "building", supportedCards: "Visa / Mastercard" },
  { id: "bankBNC", icon: "building", supportedCards: "Visa / Mastercard" },
  { id: "bankCaroni", icon: "building", supportedCards: "Visa / Mastercard" },
  { id: "bankBancaribe", icon: "building", supportedCards: "Visa / Mastercard" },
  { id: "bankTesoro", icon: "building", supportedCards: "Visa / Mastercard" },
  { id: "bankBancamiga", icon: "building", supportedCards: "Visa / Mastercard" },
  { id: "bankBangente", icon: "building", supportedCards: "Visa / Mastercard" },
  { id: "bank100", icon: "building", supportedCards: "Visa / Mastercard" },
  { id: "zinli", icon: "wallet", supportedCards: "Visa / Mastercard / Discover" },
  { id: "paypal", icon: "globe", supportedCards: "Visa / Mastercard / Discover" },
  { id: "stripe", icon: "globe", supportedCards: "Visa / Mastercard / Discover" },
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
  const [selectedBank, setSelectedBank] = useState<string>("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});

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

  const brand = useMemo<CardBrand>(() => detectBrand(cardNumber), [cardNumber]);
  const cardNumberError = useMemo(() => {
    if (!touched.cardNumber || !cardNumber) return null;
    return isValidCardNumber(cardNumber) ? null : t("cardNumberInvalid");
  }, [cardNumber, touched.cardNumber]);
  const cvvError = useMemo(() => {
    if (!touched.cvv || !cvv) return null;
    return isValidCvv(cvv, brand) ? null : t("cvvInvalid");
  }, [cvv, brand, touched.cvv]);
  const expError = useMemo(() => {
    if (!touched.expMonth || !touched.expYear) return null;
    if (!expMonth || !expYear) return null;
    return isValidExpiration(expMonth, expYear) ? null : t("expInvalid");
  }, [expMonth, expYear, touched.expMonth, touched.expYear]);

  const isFormValid =
    !!selectedBank &&
    !!fullName.trim() &&
    isValidCardNumber(cardNumber) &&
    isValidCvv(cvv, brand) &&
    isValidExpiration(expMonth, expYear);

  const handleCardNumberChange = (v: string) => {
    setCardNumber(formatCardNumber(v));
  };

  const handleCvvChange = (v: string) => {
    const digits = v.replace(/\D/g, "");
    const maxLen = brand === "amex" ? 4 : 3;
    setCvv(digits.slice(0, maxLen));
  };

  const handleExpMonthChange = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 2);
    setExpMonth(digits);
  };

  const handleExpYearChange = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 4);
    setExpYear(digits);
  };

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
          bankName: selectedBank ? t(selectedBank) : undefined,
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
  const selectedBankOption = bankOptions.find((b) => b.id === selectedBank);

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

        {/* Security notice */}
        <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-success/10 mb-4">
          <ShieldCheck className="w-4 h-4 text-success shrink-0 mt-0.5" />
          <p className="text-xs text-success leading-relaxed">
            {t("securityNotice")}
          </p>
        </div>

        {/* Payment method / bank selector */}
        <div className="mb-4">
          <label className="label pb-1">
            <span className="label-text font-medium">{t("paymentMethod")}</span>
          </label>
          <select
            value={selectedBank}
            onChange={(e) => setSelectedBank(e.target.value)}
            className="select select-bordered w-full"
          >
            <option value="">{t("selectBank")}</option>
            <optgroup label={t("venezuelanBanks")}>
              {bankOptions
                .filter((b) => b.icon === "building")
                .map((b) => (
                  <option key={b.id} value={b.id}>
                    {t(b.id)}
                  </option>
                ))}
            </optgroup>
            <optgroup label={t("international")}>
              {bankOptions
                .filter((b) => b.icon !== "building")
                .map((b) => (
                  <option key={b.id} value={b.id}>
                    {t(b.id)}
                  </option>
                ))}
            </optgroup>
          </select>
          {selectedBankOption && (
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span className="badge badge-primary gap-1 py-3">
                {selectedBankOption.icon === "building" && <Building2 className="w-3.5 h-3.5" />}
                {selectedBankOption.icon === "wallet" && <Wallet className="w-3.5 h-3.5" />}
                {selectedBankOption.icon === "globe" && <Globe className="w-3.5 h-3.5" />}
                {t(selectedBankOption.id)}
              </span>
              <span className="badge badge-outline gap-1 py-3">
                <span className="text-xs text-muted-foreground">{t("supportedCards")}:</span>
                {selectedBankOption.supportedCards}
              </span>
            </div>
          )}
        </div>

        {/* Test card quick-select */}
        <div data-tour="test-cards" className="mb-4">
          <p className="text-xs text-muted-foreground mb-2">{t("testCards")}</p>
          <div className="flex flex-wrap gap-2">
            {testCards.map((c) => (
              <button
                key={c.number}
                type="button"
                onClick={() => {
                  setCardNumber(formatCardNumber(c.number));
                  setTouched((p) => ({ ...p, cardNumber: true }));
                }}
                className={`btn btn-xs ${cardNumber === formatCardNumber(c.number) ? "btn-primary" : "btn-outline"}`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="form-control gap-1">
            <label className="label pb-0">
              <span className="label-text font-medium">{t("cardNumber")}</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => handleCardNumberChange(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, cardNumber: true }))}
                placeholder="4111 1111 1111 1111"
                className={`input input-bordered w-full pr-20 ${
                  cardNumberError ? "input-error" : touched.cardNumber && !cardNumberError && cardNumber ? "input-success" : ""
                }`}
              />
              {brand !== "unknown" && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground flex items-center gap-1">
                  {touched.cardNumber && !cardNumberError && cardNumber && (
                    <Check className="w-4 h-4 text-success" />
                  )}
                  {brandLabels[brand]}
                </span>
              )}
            </div>
            {cardNumberError && (
              <p className="text-xs text-error mt-0.5">{cardNumberError}</p>
            )}
            {brand !== "unknown" && touched.cardNumber && !cardNumberError && cardNumber && (
              <p className="text-xs text-success mt-0.5">{t("cardDetected")}: {brandLabels[brand]}</p>
            )}
          </div>
          <Input label={t("cardHolder")} value={fullName} onChange={setFullName} type="text" placeholder="APPROVED" />
          <div className="grid grid-cols-3 gap-3">
            <div className="form-control gap-1">
              <label className="label pb-0">
                <span className="label-text font-medium">{t("expMonth")}</span>
              </label>
              <input
                type="text"
                value={expMonth}
                onChange={(e) => handleExpMonthChange(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, expMonth: true, expYear: true }))}
                placeholder="01"
                className={`input input-bordered w-full ${
                  expError ? "input-error" : touched.expMonth && !expError && expMonth && expYear ? "input-success" : ""
                }`}
              />
            </div>
            <div className="form-control gap-1">
              <label className="label pb-0">
                <span className="label-text font-medium">{t("expYear")}</span>
              </label>
              <input
                type="text"
                value={expYear}
                onChange={(e) => handleExpYearChange(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, expMonth: true, expYear: true }))}
                placeholder="2027"
                className={`input input-bordered w-full ${
                  expError ? "input-error" : touched.expYear && !expError && expMonth && expYear ? "input-success" : ""
                }`}
              />
            </div>
            <div className="form-control gap-1">
              <label className="label pb-0">
                <span className="label-text font-medium">{t("cvv")}</span>
              </label>
              <input
                type="text"
                value={cvv}
                onChange={(e) => handleCvvChange(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, cvv: true }))}
                placeholder={brand === "amex" ? "1234" : "123"}
                className={`input input-bordered w-full ${
                  cvvError ? "input-error" : touched.cvv && !cvvError && cvv ? "input-success" : ""
                }`}
              />
            </div>
          </div>
          {expError && (
            <p className="text-xs text-error -mt-2">{expError}</p>
          )}
          {cvvError && (
            <p className="text-xs text-error -mt-2">{cvvError}</p>
          )}
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
        disabled={isPaying || !isFormValid}
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
