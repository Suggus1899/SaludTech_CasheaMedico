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
import { getApiUrl, getAuthHeaders } from "../../../../lib/api";
import { formatCurrency, formatWithVES, formatDate } from "../../../../lib/utils";
import type {
  MedicalService,
  MedicalSupply,
  CheckoutResponse,
} from "../../../../types/patient";

type Tab = "services" | "supplies";

export default function MerchantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

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

  useEffect(() => {
    (async () => {
      try {
        const [svcRes, supRes] = await Promise.all([
          fetch(getApiUrl(`patient/merchants/${id}/services`), { headers: getAuthHeaders() }),
          fetch(getApiUrl(`patient/merchants/${id}/supplies`), { headers: getAuthHeaders() }),
        ]);
        if (svcRes.ok) setServices(await svcRes.json());
        if (supRes.ok) setSupplies(await supRes.json());
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
      const res = await fetch(getApiUrl("patient/transactions/checkout"), {
        method: "POST",
        headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantId: id,
          items: cart.map((c) => ({ type: c.type, id: c.id, quantity: c.qty })),
          requestedInstallments: numInstallments,
          creditLineType,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message ?? "Checkout failed");
      }
      const data = (await res.json()) as CheckoutResponse;
      setCheckoutResult(data);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error en el checkout");
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
            ¡Compra Exitosa!
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Tu financiamiento ha sido aprobado
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-base-100 space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Monto Total</span>
            <span className="text-sm font-bold font-display">
              {formatWithVES(checkoutResult.totalAmount, checkoutResult.totalAmountVES)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Inicial (Down Payment)</span>
            <span className="text-sm font-bold font-display">
              {formatWithVES(checkoutResult.downPayment, checkoutResult.downPaymentVES)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Financiado</span>
            <span className="text-sm font-bold font-display">
              {formatWithVES(checkoutResult.financedAmount, checkoutResult.financedAmountVES)}
            </span>
          </div>
          <div className="border-t border-border pt-3">
            <p className="text-xs font-semibold text-foreground mb-2">
              Cuotas ({checkoutResult.numInstallments})
            </p>
            {checkoutResult.installments.map((inst) => (
              <div key={inst.installmentNumber} className="flex justify-between py-1">
                <span className="text-xs text-muted-foreground">
                  Cuota {inst.installmentNumber} · {formatDate(inst.dueDate)}
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
            Ver mis cuotas
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            className="btn btn-ghost w-full"
          >
            Ir al dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <button
        onClick={() => router.back()}
        className="btn btn-ghost btn-sm -ml-2"
      >
        <ArrowLeft className="w-4 h-4" /> Volver
      </button>

      {/* Tabs */}
      <div className="tabs tabs-boxed">
        <button
          onClick={() => setTab("services")}
          className={`tab ${tab === "services" ? "tab-active" : ""}`}
        >
          <Stethoscope className="w-4 h-4 mr-1.5 inline" />
          Servicios ({services.length})
        </button>
        <button
          onClick={() => setTab("supplies")}
          className={`tab ${tab === "supplies" ? "tab-active" : ""}`}
        >
          <Pill className="w-4 h-4 mr-1.5 inline" />
          Insumos ({supplies.length})
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner text-primary" />
        </div>
      ) : tab === "services" ? (
        <div className="space-y-3">
          {services.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">
              No hay servicios disponibles
            </p>
          ) : (
            services.map((svc) => (
              <div
                key={svc.id}
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
                          {svc.durationMin} min
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
                      <ShoppingCart className="w-3 h-3" /> Agregar
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
            <p className="text-center text-muted-foreground py-8 text-sm">
              No hay insumos disponibles
            </p>
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
                          Receta
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
                          Unidad: {sup.unit}
                        </span>
                      )}
                      {sup.stock != null && (
                        <span className={`flex items-center gap-1 text-xs ${sup.stock > 10 ? "text-success" : "text-warning"}`}>
                          <Package className="w-3 h-3" />
                          Stock: {sup.stock}
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
                      <ShoppingCart className="w-3 h-3" /> Agregar
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
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-base-100 border-t border-border p-4 shadow-lg">
          <div className="max-w-md mx-auto space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">
                Carrito ({cart.length} items)
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
                Checkout
              </button>
              <button
                onClick={() => setCart([])}
                className="btn btn-ghost btn-sm"
              >
                Vaciar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout modal */}
      {showCheckout && (
        <div className="modal modal-open" role="dialog" aria-modal="true">
          <div className="modal-box max-w-md">
            <h3 className="text-lg font-bold font-display">Resumen de Compra</h3>

            {/* Cart items */}
            <div className="py-4 space-y-2">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(item.price)} c/u
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.type === "SUPPLY" && (
                      <>
                        <button
                          onClick={() => updateQty(item.id, -1)}
                          className="btn btn-ghost btn-xs btn-circle"
                        >
                          −
                        </button>
                        <span className="text-sm font-semibold w-6 text-center">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateQty(item.id, 1)}
                          className="btn btn-ghost btn-xs btn-circle"
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
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-lg font-bold font-display">
                  {formatCurrency(cartTotal)}
                </span>
              </div>
            </div>

            {/* Credit line selector */}
            <div className="mt-4">
              <label className="label pb-1">
                <span className="label-text font-medium text-sm">Línea de Crédito</span>
              </label>
              <select
                value={creditLineType}
                onChange={(e) => setCreditLineType(e.target.value)}
                className="select select-bordered w-full text-sm"
              >
                <option value="ESPECIALIDAD_PRINCIPAL">Especialidad Principal</option>
                <option value="SALUD_COTIDIANA">Salud Cotidiana</option>
                <option value="MAYOR_CUIDADO">Cuidado Mayor</option>
              </select>
            </div>

            {/* Installments selector */}
            <div className="mt-3">
              <label className="label pb-1">
                <span className="label-text font-medium text-sm">Cuotas</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[3, 6, 9, 12].map((n) => (
                  <button
                    key={n}
                    onClick={() => setNumInstallments(n)}
                    className={`btn btn-sm ${numInstallments === n ? "btn-primary" : "btn-outline"}`}
                  >
                    {n}
                  </button>
                ))}
              </div>
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
                Cancelar
              </button>
              <button
                onClick={handleCheckout}
                disabled={isProcessing || cart.length === 0}
                className="btn btn-primary btn-sm"
              >
                {isProcessing ? <span className="loading loading-spinner loading-xs" /> : null}
                Confirmar Compra
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
