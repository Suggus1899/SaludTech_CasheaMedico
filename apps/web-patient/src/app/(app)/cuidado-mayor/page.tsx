"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  Heart,
  HeartHandshake,
  Activity,
  Stethoscope,
  Info,
  X,
  Calendar,
  RefreshCw,
  Lock,
  type LucideIcon,
} from "lucide-react";
import { useFetchData } from "../../../hooks/useFetchData";
import { getApiUrl, getAuthHeaders, getStoredUser } from "../../../lib/api";
import { formatCurrency, formatDate } from "../../../lib/utils";
import {
  elderCareServiceStyles,
  elderCareHeroGradient,
  elderCareAccentColor,
  elderCareEmptyColor,
} from "../../../lib/creditLineStyles";
import type { Subscription, UserResponse } from "../../../types/patient";

interface ServiceDef {
  type: keyof typeof elderCareServiceStyles;
  label: string;
  icon: LucideIcon;
  description: string;
  defaultAmount: number;
}

const services: ServiceDef[] = [
  {
    type: "NURSE",
    label: "Enfermera",
    icon: Heart,
    description: "Cuidado de salud profesional en el hogar",
    defaultAmount: 120,
  },
  {
    type: "CAREGIVER",
    label: "Cuidador/a",
    icon: HeartHandshake,
    description: "Acompañamiento y asistencia diaria",
    defaultAmount: 90,
  },
  {
    type: "PHYSIOTHERAPY",
    label: "Fisioterapia",
    icon: Activity,
    description: "Rehabilitación y ejercicio terapéutico",
    defaultAmount: 100,
  },
  {
    type: "GERIATRIC_SPECIALIST",
    label: "Geriatría",
    icon: Stethoscope,
    description: "Consulta especializada en adultos mayores",
    defaultAmount: 150,
  },
];

const serviceLabels: Record<string, string> = {
  NURSE: "Enfermera",
  CAREGIVER: "Cuidador/a",
  PHYSIOTHERAPY: "Fisioterapia",
  GERIATRIC_SPECIALIST: "Geriatría",
  VISITA_DIARIA: "Visita Diaria",
  ENFERMERIA_24H: "Enfermería 24H",
};

const PLACEHOLDER_MERCHANT_ID = "00000000-0000-0000-0000-000000000001";

export default function CuidadoMayorPage() {
  const [tab, setTab] = useState<"services" | "subscriptions">("services");
  const [user, setUser] = useState<UserResponse | null>(null);

  useEffect(() => {
    setUser(getStoredUser<UserResponse>());
  }, []);

  const userLevel = user?.level ?? 1;
  const isLocked = userLevel < 4;
  const { data, loading, refetch } = useFetchData<Subscription[]>(
    getApiUrl("patient/elder-care/subscriptions")
  );
  const [confirmService, setConfirmService] = useState<ServiceDef | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const subscriptions = data ?? [];

  const handleSubscribe = async () => {
    if (!confirmService) return;
    setIsSubscribing(true);
    try {
      await fetch(getApiUrl("patient/elder-care/subscriptions"), {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          merchantId: PLACEHOLDER_MERCHANT_ID,
          serviceType: confirmService.type,
          monthlyAmount: confirmService.defaultAmount,
        }),
      });
      setConfirmService(null);
      refetch();
      setTab("subscriptions");
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleCancel = async (id: string) => {
    setIsCancelling(true);
    try {
      await fetch(getApiUrl(`patient/elder-care/subscriptions/${id}`), {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      setCancelId(null);
      refetch();
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground">
          Cuidado Mayor
        </h1>
        {tab === "subscriptions" && (
          <button
            onClick={() => refetch()}
            aria-label="Recargar"
            className="btn btn-ghost btn-sm btn-square"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div role="tablist" className="tabs tabs-boxed">
        <button
          role="tab"
          aria-selected={tab === "services"}
          className={`tab ${tab === "services" ? "tab-active" : ""}`}
          onClick={() => setTab("services")}
        >
          Servicios
        </button>
        <button
          role="tab"
          aria-selected={tab === "subscriptions"}
          className={`tab ${tab === "subscriptions" ? "tab-active" : ""}`}
          onClick={() => setTab("subscriptions")}
        >
          Mis Suscripciones
        </button>
      </div>

      {tab === "services" ? (
        <div className="space-y-4">
          {/* Hero */}
          <div
            className="p-5 rounded-2xl text-white"
            style={{
              background: `linear-gradient(135deg, ${elderCareHeroGradient.from}, ${elderCareHeroGradient.to})`,
            }}
          >
            <Shield className="w-9 h-9" />
            <h2 className="text-xl font-bold mt-3">
              Cuidado para tus seres queridos
            </h2>
            <p className="text-sm text-white/85 mt-2 leading-relaxed">
              Suscripciones mensuales para adultos mayores usando tu línea MAYOR CUIDADO.
              Requiere nivel 4+.
            </p>
          </div>

          {/* Level locked notice */}
          {isLocked && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-warning/10 border border-warning/30">
              <Lock className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-foreground font-display">
                  Nivel {userLevel} — Bloqueado
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Necesitas nivel 4 o superior para suscribirte a servicios de Cuidado Mayor.
                  Sigue pagando tus cuotas a tiempo para subir de nivel.
                </p>
              </div>
            </div>
          )}

          {/* Service cards */}
          <div className="space-y-3">
            {services.map((s) => {
              const Icon = s.icon;
              const style = elderCareServiceStyles[s.type];
              return (
                <div
                  key={s.type}
                  className={`p-4 rounded-2xl border border-border bg-base-100 flex items-center gap-3.5 ${
                    isLocked ? "opacity-60" : ""
                  }`}
                >
                  <div
                    className="p-3 rounded-xl"
                    style={{ backgroundColor: `${style.color}1A`, color: style.color }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground font-display">
                      {s.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
                    <p
                      className="text-sm font-bold mt-1 font-display"
                      style={{ color: style.color }}
                    >
                      {formatCurrency(s.defaultAmount)}/mes
                    </p>
                  </div>
                  <button
                    onClick={() => !isLocked && setConfirmService(s)}
                    disabled={isLocked}
                    className="btn btn-sm text-white"
                    style={{ backgroundColor: style.color }}
                  >
                    {isLocked ? <Lock className="w-3.5 h-3.5" /> : "Suscribir"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div>
          {loading ? (
            <div className="flex justify-center py-12">
              <span className="loading loading-spinner" style={{ color: elderCareAccentColor }} />
            </div>
          ) : subscriptions.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <Shield className="w-14 h-14" style={{ color: elderCareEmptyColor }} />
              <h2 className="text-lg font-bold text-foreground mt-4">
                Sin suscripciones activas
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                Activa un servicio de cuidado en la pestaña "Servicios".
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {subscriptions.map((sub) => {
                const isActive = sub.status === "ACTIVE";
                return (
                  <li
                    key={sub.id}
                    className={`p-4 rounded-2xl border bg-base-100 ${
                      isActive ? "border-primary/30" : "border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-bold text-foreground font-display">
                        {sub.merchant?.tradeName ?? "Proveedor"}
                      </p>
                      <span
                        className={`badge badge-sm ${
                          isActive ? "badge-primary" : "badge-ghost"
                        }`}
                      >
                        {isActive ? "Activa" : "Cancelada"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                      <Activity className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {serviceLabels[sub.serviceType ?? ""] ?? sub.serviceType}
                      </span>
                      <span className="flex-1" />
                      <span
                        className="text-sm font-bold font-display"
                        style={{ color: elderCareAccentColor }}
                      >
                        {formatCurrency(sub.monthlyAmount ?? 0)}/mes
                      </span>
                    </div>
                    {sub.nextBilling && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Próximo cobro: {formatDate(sub.nextBilling)}
                        </span>
                      </div>
                    )}
                    {isActive && (
                      <div className="flex justify-end mt-2.5">
                        <button
                          onClick={() => setCancelId(sub.id)}
                          className="btn btn-ghost btn-xs text-error gap-1"
                        >
                          <X className="w-3 h-3" /> Cancelar
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* Subscribe confirm modal */}
      {confirmService && (
        <div className="modal modal-open" role="dialog" aria-modal="true">
          <div className="modal-box">
            <div className="flex items-center gap-2">
              <confirmService.icon className="w-5 h-5" style={{ color: elderCareServiceStyles[confirmService.type].color }} />
              <h3 className="text-lg font-bold font-display">
                {confirmService.label}
              </h3>
            </div>
            <p className="py-4 text-sm">
              Se cargará {formatCurrency(confirmService.defaultAmount)}/mes a tu línea MAYOR
              CUIDADO.
            </p>
            <div
              className="flex items-start gap-2 p-2.5 rounded-lg"
              style={{ backgroundColor: `${elderCareServiceStyles[confirmService.type].color}14` }}
            >
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: elderCareServiceStyles[confirmService.type].color }} />
              <p className="text-xs text-muted-foreground">
                Puedes cancelar en cualquier momento.
              </p>
            </div>
            <div className="modal-action">
              <button onClick={() => setConfirmService(null)} className="btn btn-ghost btn-sm">
                Cancelar
              </button>
              <button
                onClick={handleSubscribe}
                disabled={isSubscribing}
                className="btn btn-sm text-white"
                style={{ backgroundColor: elderCareServiceStyles[confirmService.type].color }}
              >
                {isSubscribing ? <span className="loading loading-spinner loading-xs" /> : null}
                Confirmar
              </button>
            </div>
          </div>
          <button
            className="modal-backdrop"
            aria-label="Cerrar"
            onClick={() => setConfirmService(null)}
          />
        </div>
      )}

      {/* Cancel confirm modal */}
      {cancelId && (
        <div className="modal modal-open" role="dialog" aria-modal="true">
          <div className="modal-box">
            <h3 className="text-lg font-bold font-display">
              Cancelar Suscripción
            </h3>
            <p className="py-4 text-sm text-muted-foreground">
              ¿Estás seguro? El cobro del próximo mes no se realizará.
            </p>
            <div className="modal-action">
              <button onClick={() => setCancelId(null)} className="btn btn-ghost btn-sm">
                No
              </button>
              <button
                onClick={() => handleCancel(cancelId)}
                disabled={isCancelling}
                className="btn btn-error btn-sm text-error-content"
              >
                {isCancelling ? <span className="loading loading-spinner loading-xs" /> : null}
                Cancelar
              </button>
            </div>
          </div>
          <button
            className="modal-backdrop"
            aria-label="Cerrar"
            onClick={() => setCancelId(null)}
          />
        </div>
      )}
    </div>
  );
}
