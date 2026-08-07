"use client";

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Stethoscope,
  Pill,
  ShoppingCart,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Package,
} from "lucide-react";
import { getApiUrl, apiFetch, getStoredUser } from "../../../../lib/api";
import { formatCurrency, formatWithVES, formatDate } from "../../../../lib/utils";
import { useTranslations } from "next-intl";
import type {
  MedicalService,
  MedicalSupply,
  CheckoutResponse,
  UserResponse,
} from "../../../../types/patient";

// Max installments allowed per user level (Modo Más Cuotas)
const maxInstallmentsForLevel = (level: number): number => {
  if (level >= 6) return 12;
  if (level >= 5) return 9;
  if (level >= 3) return 6;
  return 3;
};

// Minimum purchase amount for a given number of installments
const minAmountForInstallments = (n: number): number => {
  if (n >= 12) return 600;
  if (n >= 9) return 450;
  if (n >= 6) return 300;
  return 0;
};

type Tab = "services" | "supplies";

export default function MerchantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const t = useTranslations("MerchantDetail");
  const tCommon = useTranslations("Common");

  const [tab, setTab] = useState<Tab>("services");
  const [services, setServices] = useState<MedicalService[]>([]);
  const [supplies, setSupplies] = useState<MedicalSupply[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<{ type: "SERVICE" | "SUPPLY"; id: string; name: string; price: number; qty: number }[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [numInstallments, setNumInstallments] = useState(3);
  const [creditLineType, setCreditLineType] = useState("ESPECIALIDAD_PRINCIPAL");
  const [checkoutResult, setCheckoutResult] = useState<CheckoutResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [userLevel, setUserLevel] = useState(1);
  const [merchantName, setMerchantName] = useState("");

  useEffect(() => {
    const user = getStoredUser<UserResponse>();
    if (user?.level) setUserLevel(user.level);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [svcRes, supRes, mRes] = await Promise.all([
          apiFetch(getApiUrl(`patient/merchants/${id}/services`)),
          apiFetch(getApiUrl(`patient/merchants/${id}/supplies`)),
          apiFetch(getApiUrl(`patient/merchants/${id}`)),
        ]);
        if (svcRes.ok) setServices(await svcRes.json());
        if (supRes.ok) setSupplies(await supRes.json());
        if (mRes.ok) { const m = await mRes.json(); setMerchantName(m.tradeName || ""); }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const addToCart = (type: "SERVICE" | "SUPPLY", item: MedicalService | MedicalSupply) => {
    const existing = cart.find((c) => c.id === item.id);
    if (existing) {
      if (type === "SERVICE") return; // Services: only 1
      setCart(cart.map((c) => (c.id === item.id ? { ...c, qty: c.qty + 1 } : c)));
    } else {
      setCart([...cart, { type, id: item.id, name: item.name, price: item.priceUsd, qty: 1 }]);
    }
  };

  const removeFromCart = (itemId: string) => {
    setCart(cart.filter((c) => c.id !== itemId));
  };

  const updateQty = (itemId: string, delta: number) => {
    setCart(cart.map((c) => (c.id === itemId ? { ...c, qty: Math.max(1, c.qty + delta) } : c)));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setError(null);
    setIsProcessing(true);
    try {
      const res = await apiFetch(getApiUrl("patient/transactions/checkout"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantId: id,
          items: cart.map((c) => ({ type: c.type, id: c.id, quantity: c.qty })),
          requestedInstallments: numInstallments,
          creditLineType,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message ?? t("checkoutError"));
      }
      const data = (await res.json()) as CheckoutResponse;
      setCheckoutResult(data);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("checkoutError"));
    } finally {
      setIsProcessing(false);
    }
  };

  if (success && checkoutResult) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center py-12 text-center">
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

        <div className="p-5 rounded-2xl border border-border bg-base-100 space-y-3">
          {/* Purchased items */}
          {checkoutResult.items.length > 0 && (
            <div className="border-b border-border pb-3">
              <p className="text-xs font-semibold text-foreground mb-2">
                {t("purchasedItems")}
              </p>
              <div className="space-y-1.5">
                {checkoutResult.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="font-semibold font-display">
                      {formatCurrency(item.priceUsd * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">{t("totalAmount")}</span>
            <span className="text-sm font-bold font-display">
              {formatWithVES(checkoutResult.totalAmount, checkoutResult.totalAmountVES)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">{t("downPayment")}</span>
            <span className="text-sm font-bold font-display">
              {formatWithVES(checkoutResult.downPayment, checkoutResult.downPaymentVES)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">{t("financed")}</span>
            <span className="text-sm font-bold font-display">
              {formatWithVES(checkoutResult.financedAmount, checkoutResult.financedAmountVES)}
            </span>
          </div>
          <div className="border-t border-border pt-3">
            <p className="text-xs font-semibold text-foreground mb-2">
              {t("installmentsLabel", { count: checkoutResult.numInstallments })}
            </p>
            {checkoutResult.installments.map((inst) => (
              <div key={inst.installmentNumber} className="flex justify-between py-1">
                <span className="text-xs text-muted-foreground">
                  {t("installmentLine", { number: inst.installmentNumber, date: formatDate(inst.dueDate) })}
                </span>
                <span className="text-xs font-semibold font-display">
                  {formatWithVES(inst.amount, inst.amountVES)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => router.push("/cuotas")}
            className="btn btn-primary w-full"
          >
            {t("viewInstallments")}
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="btn btn-ghost w-full"
          >
            {t("goDashboard")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-5${cart.length > 0 ? " pb-24" : ""}`}>
      <button
        onClick={() => router.back()}
        className="btn btn-ghost btn-sm -ml-2"
      >
        <ArrowLeft className="w-4 h-4" /> {tCommon("back")}
      </button>

      {merchantName && (
        <h1 className="text-xl font-bold text-foreground font-display">{merchantName}</h1>
      )}

      {/* Tabs */}
      <div data-tour="merchant-tabs" className="tabs tabs-boxed">
        <button
          onClick={() => setTab("services")}
          className={`tab ${tab === "services" ? "tab-active" : ""}`}
        >
          <Stethoscope className="w-4 h-4 mr-1.5 inline" />
          {t("services", { count: services.length })}
        </button>
        <button
          onClick={() => setTab("supplies")}
          className={`tab ${tab === "supplies" ? "tab-active" : ""}`}
        >
          <Pill className="w-4 h-4 mr-1.5 inline" />
          {t("supplies", { count: supplies.length })}
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4 rounded-2xl border border-border bg-base-100">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-3/4 rounded" />
                  <div className="skeleton h-3 w-1/2 rounded" />
                  <div className="skeleton h-3 w-1/3 rounded" />
                </div>
                <div className="space-y-2 text-right">
                  <div className="skeleton h-5 w-16 rounded" />
                  <div className="skeleton h-7 w-20 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : tab === "services" ? (
        <div className="space-y-3">
          {services.length === 0 ? (
            <div className="flex flex-col items-center py-12 gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/40">
                <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/>
              </svg>
              <p className="text-sm text-muted-foreground">{t("noServices")}</p>
            </div>
          ) : (
            services.map((svc, idx) => (
              <div
                key={svc.id}
                data-tour={idx === 0 ? "catalog-item" : undefined}
                className="p-4 rounded-2xl border border-border bg-base-100"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground font-display">
                      {svc.name}
                    </p>
                    {svc.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {svc.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      {svc.durationMin && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {svc.durationMin} {tCommon("minutes")}
                        </span>
                      )}
                      {svc.subcategory && (
                        <span className="text-xs text-muted-foreground">
                          {svc.subcategory}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-base font-bold text-foreground font-display">
                      {formatCurrency(svc.priceUsd)}
                    </p>
                    {svc.priceVES && (
                      <p className="text-xs text-muted-foreground">
                        (Bs. {new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(svc.priceVES)})
                      </p>
                    )}
                    <button
                      onClick={() => addToCart("SERVICE", svc)}
                      className="btn btn-primary btn-xs mt-2"
                    >
                      <ShoppingCart className="w-3 h-3" /> {t("add")}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {supplies.length === 0 ? (
            <div className="flex flex-col items-center py-12 gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/40">
                <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/>
              </svg>
              <p className="text-sm text-muted-foreground">{t("noSupplies")}</p>
            </div>
          ) : (
            supplies.map((sup) => (
              <div
                key={sup.id}
                className="p-4 rounded-2xl border border-border bg-base-100"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground font-display">
                        {sup.name}
                      </p>
                      {sup.requiresPrescription && (
                        <span className="badge badge-warning badge-xs gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          {tCommon("receta")}
                        </span>
                      )}
                    </div>
                    {sup.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {sup.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      {sup.unit && (
                        <span className="text-xs text-muted-foreground">
                          {tCommon("unit")}: {sup.unit}
                        </span>
                      )}
                      {sup.stock != null && (
                        <span className={`flex items-center gap-1 text-xs ${sup.stock > 10 ? "text-success" : "text-warning"}`}>
                          <Package className="w-3 h-3" />
                          {tCommon("stock")}: {sup.stock}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-base font-bold text-foreground font-display">
                      {formatCurrency(sup.priceUsd)}
                    </p>
                    {sup.priceVES && (
                      <p className="text-xs text-muted-foreground">
                        (Bs. {new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(sup.priceVES)})
                      </p>
                    )}
                    <button
                      onClick={() => addToCart("SUPPLY", sup)}
                      className="btn btn-primary btn-xs mt-2"
                    >
                      <ShoppingCart className="w-3 h-3" /> {t("add")}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Cart bar */}
      {cart.length > 0 && (
        <div data-tour="checkout-cart" className="fixed bottom-0 left-0 right-0 z-50 bg-base-100 border-t border-border p-4 shadow-lg">
          <div className="max-w-md mx-auto space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">
                {t("cart", { count: cart.length })}
              </span>
              <span className="text-base font-bold text-foreground font-display">
                {formatCurrency(cartTotal)}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCheckout(true)}
                className="btn btn-primary flex-1"
              >
                <ShoppingCart className="w-4 h-4" />
                {t("checkout")}
              </button>
              <button
                onClick={() => setCart([])}
                className="btn btn-ghost btn-sm"
              >
                {t("clear")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout modal */}
      {showCheckout && (
        <div className="modal modal-open" role="dialog" aria-modal="true">
          <div className="modal-box w-full max-w-md mx-2">
            <h3 className="text-lg font-bold font-display">{t("checkoutTitle")}</h3>

            {/* Cart items */}
            <div className="py-4 space-y-2">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(item.price)} {tCommon("each")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.type === "SUPPLY" && (
                      <>
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="btn btn-ghost btn-sm btn-circle"
                        >
                          −
                        </button>
                        <span className="text-sm font-semibold w-6 text-center">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="btn btn-ghost btn-sm btn-circle"
                        >
                          +
                        </button>
                      </>
                    )}
                    {item.type === "SERVICE" && (
                      <span className="text-xs text-muted-foreground">x1</span>
                    )}
                    <span className="text-sm font-bold font-display ml-2">
                      {formatCurrency(item.price * item.qty)}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="btn btn-ghost btn-xs text-error"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t border-border pt-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{tCommon("total")}</span>
                <span className="text-lg font-bold font-display">
                  {formatCurrency(cartTotal)}
                </span>
              </div>
            </div>

            {/* Credit line selector */}
            <div className="mt-4">
              <label className="label pb-1">
                <span className="label-text font-medium text-sm">{t("creditLine")}</span>
              </label>
              <select
                value={creditLineType}
                onChange={(e) => {
                  const val = e.target.value;
                  setCreditLineType(val);
                  if (val === "SALUD_COTIDIANA") setNumInstallments(1);
                  else if (numInstallments === 1) setNumInstallments(3);
                }}
                className="select select-bordered w-full text-sm"
              >
                <option value="ESPECIALIDAD_PRINCIPAL">{t("lineEspecialidad")}</option>
                <option value="SALUD_COTIDIANA">{t("lineCotidiana")}</option>
                <option value="MAYOR_CUIDADO">{t("lineMayorCuidado")}</option>
              </select>
            </div>

            {/* Installments selector — dynamic by user level */}
            <div className="mt-3">
              <label className="label pb-1">
                <span className="label-text font-medium text-sm">
                  {t("installments")} {creditLineType === "SALUD_COTIDIANA" && t("cotidianaLabel")}
                </span>
              </label>
              {creditLineType === "SALUD_COTIDIANA" ? (
                <div className="alert alert-info text-xs py-2">
                  {t("cotidianaNote")}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-4 gap-2">
                    {[3, 6, 9, 12].map((n) => {
                      const maxAllowed = maxInstallmentsForLevel(userLevel);
                      const minAmount = minAmountForInstallments(n);
                      const isLocked = n > maxAllowed;
                      const isAmountLow = cartTotal < minAmount;
                      const isDisabled = isLocked || isAmountLow;
                      return (
                        <button
                          key={n}
                          onClick={() => !isDisabled && setNumInstallments(n)}
                          disabled={isDisabled}
                          title={
                            isLocked
                              ? t("lockedLevel", { level: userLevel, max: maxAllowed })
                              : isAmountLow
                              ? t("minAmount", { count: n, amount: minAmount })
                              : t("biweeklyInstallments", { count: n })
                          }
                          className={`btn btn-sm ${
                            numInstallments === n ? "btn-primary" : isDisabled ? "btn-disabled opacity-40" : "btn-outline"
                          }`}
                        >
                          {n}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("levelMaxInstallments", { level: userLevel, max: maxInstallmentsForLevel(userLevel) })}
                  </p>
                </>
              )}
            </div>

            {error && (
              <div className="mt-3 p-3 rounded-lg bg-error/10 text-error text-sm">
                {error}
              </div>
            )}

            <div className="modal-action">
              <button
                onClick={() => setShowCheckout(false)}
                className="btn btn-ghost btn-sm"
              >
                {tCommon("cancel")}
              </button>
              <button
                onClick={handleCheckout}
                disabled={isProcessing || cart.length === 0}
                className="btn btn-primary btn-sm"
              >
                {isProcessing ? <span className="loading loading-spinner loading-xs" /> : null}
                {t("confirmPurchase")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
