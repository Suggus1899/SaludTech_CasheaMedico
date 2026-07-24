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
import { useFetchData } from "@saludtech/shared";
import { getApiUrl, apiFetch, getStoredUser } from "../../../lib/api";
import { formatCurrency, formatDate } from "../../../lib/utils";
import {
  elderCareServiceStyles,
  elderCareHeroGradient,
  elderCareAccentColor,
  elderCareEmptyColor,
} from "../../../lib/creditLineStyles";
import { useTranslations } from "next-intl";
import type { Subscription, UserResponse } from "../../../types/patient";

interface ServiceDef {
  type: keyof typeof elderCareServiceStyles;
  labelKey: string;
  descKey: string;
  icon: LucideIcon;
  defaultAmount: number;
}

const services: ServiceDef[] = [
  {
    type: "NURSE",
    labelKey: "serviceNurse",
    descKey: "serviceNurseDesc",
    icon: Heart,
    defaultAmount: 120,
  },
  {
    type: "CAREGIVER",
    labelKey: "serviceCaregiver",
    descKey: "serviceCaregiverDesc",
    icon: HeartHandshake,
    defaultAmount: 90,
  },
  {
    type: "PHYSIOTHERAPY",
    labelKey: "servicePhysiotherapy",
    descKey: "servicePhysiotherapyDesc",
    icon: Activity,
    defaultAmount: 100,
  },
  {
    type: "GERIATRIC_SPECIALIST",
    labelKey: "serviceGeriatric",
    descKey: "serviceGeriatricDesc",
    icon: Stethoscope,
    defaultAmount: 150,
  },
];

const serviceLabelKeys: Record<string, string> = {
  NURSE: "labelNurse",
  CAREGIVER: "labelCaregiver",
  PHYSIOTHERAPY: "labelPhysiotherapy",
  GERIATRIC_SPECIALIST: "labelGeriatric",
  VISITA_DIARIA: "labelVisitaDiaria",
  ENFERMERIA_24H: "labelEnfermeria24h",
};

const PLACEHOLDER_MERCHANT_ID = "00000000-0000-0000-0000-000000000001";

export default function CuidadoMayorPage() {
  const t = useTranslations("ElderCare");
  const tCommon = useTranslations("Common");
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
      await apiFetch(getApiUrl("patient/elder-care/subscriptions"), {
        method: "POST",
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
      await apiFetch(getApiUrl(`patient/elder-care/subscriptions/${id}`), {
        method: "DELETE",
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
          {t("title")}
        </h1>
        {tab === "subscriptions" && (
          <button
            onClick={() => refetch()}
            aria-label={t("reload")}
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
          {t("tabServices")}
        </button>
        <button
          role="tab"
          aria-selected={tab === "subscriptions"}
          className={`tab ${tab === "subscriptions" ? "tab-active" : ""}`}
          onClick={() => setTab("subscriptions")}
        >
          {t("tabSubscriptions")}
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
              {t("heroTitle")}
            </h2>
            <p className="text-sm text-white/85 mt-2 leading-relaxed">
              {t("heroDesc")}
            </p>
          </div>

          {/* Level locked notice */}
          {isLocked && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-warning/10 border border-warning/30">
              <Lock className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-foreground font-display">
                  {t("levelLocked", { level: userLevel })}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("levelLockedDesc")}
                </p>
              </div>
            </div>
          )}

          {/* Service cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
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
                      {t(s.labelKey)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t(s.descKey)}</p>
                    <p
                      className="text-sm font-bold mt-1 font-display"
                      style={{ color: style.color }}
                    >
                      {formatCurrency(s.defaultAmount)}{tCommon("perMonth")}
                    </p>
                  </div>
                  <button
                    onClick={() => !isLocked && setConfirmService(s)}
                    disabled={isLocked}
                    className="btn btn-sm text-white"
                    style={{ backgroundColor: style.color }}
                  >
                    {isLocked ? <Lock className="w-3.5 h-3.5" /> : t("subscribe")}
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
                {t("noSubscriptions")}
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                {t("noSubscriptionsDesc")}
              </p>
            </div>
          ) : (
            <ul className="grid grid-cols-1 lg:grid-cols-2 gap-3">
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
                        {sub.merchant?.tradeName ?? t("provider")}
                      </p>
                      <span
                        className={`badge badge-sm ${
                          isActive ? "badge-primary" : "badge-ghost"
                        }`}
                      >
                        {isActive ? t("active") : t("cancelled")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                      <Activity className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {serviceLabelKeys[sub.serviceType ?? ""] ? t(serviceLabelKeys[sub.serviceType ?? ""]) : sub.serviceType}
                      </span>
                      <span className="flex-1" />
                      <span
                        className="text-sm font-bold font-display"
                        style={{ color: elderCareAccentColor }}
                      >
                        {formatCurrency(sub.monthlyAmount ?? 0)}{tCommon("perMonth")}
                      </span>
                    </div>
                    {sub.nextBilling && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {t("nextBilling", { date: formatDate(sub.nextBilling) })}
                        </span>
                      </div>
                    )}
                    {isActive && (
                      <div className="flex justify-end mt-2.5">
                        <button
                          onClick={() => setCancelId(sub.id)}
                          className="btn btn-ghost btn-xs text-error gap-1"
                        >
                          <X className="w-3 h-3" /> {t("cancel")}
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
                {t(confirmService.labelKey)}
              </h3>
            </div>
            <p className="py-4 text-sm">
              {t("subscribeConfirm", { amount: formatCurrency(confirmService.defaultAmount) })}
            </p>
            <div
              className="flex items-start gap-2 p-2.5 rounded-lg"
              style={{ backgroundColor: `${elderCareServiceStyles[confirmService.type].color}14` }}
            >
              <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: elderCareServiceStyles[confirmService.type].color }} />
              <p className="text-xs text-muted-foreground">
                {t("cancelAnytime")}
              </p>
            </div>
            <div className="modal-action">
              <button onClick={() => setConfirmService(null)} className="btn btn-ghost btn-sm">
                {tCommon("cancel")}
              </button>
              <button
                onClick={handleSubscribe}
                disabled={isSubscribing}
                className="btn btn-sm text-white"
                style={{ backgroundColor: elderCareServiceStyles[confirmService.type].color }}
              >
                {isSubscribing ? <span className="loading loading-spinner loading-xs" /> : null}
                {t("confirm")}
              </button>
            </div>
          </div>
          <button
            className="modal-backdrop"
            aria-label={t("close")}
            onClick={() => setConfirmService(null)}
          />
        </div>
      )}

      {/* Cancel confirm modal */}
      {cancelId && (
        <div className="modal modal-open" role="dialog" aria-modal="true">
          <div className="modal-box">
            <h3 className="text-lg font-bold font-display">
              {t("cancelTitle")}
            </h3>
            <p className="py-4 text-sm text-muted-foreground">
              {t("cancelConfirm")}
            </p>
            <div className="modal-action">
              <button onClick={() => setCancelId(null)} className="btn btn-ghost btn-sm">
                {t("no")}
              </button>
              <button
                onClick={() => handleCancel(cancelId)}
                disabled={isCancelling}
                className="btn btn-error btn-sm text-error-content"
              >
                {isCancelling ? <span className="loading loading-spinner loading-xs" /> : null}
                {t("cancel")}
              </button>
            </div>
          </div>
          <button
            className="modal-backdrop"
            aria-label={t("close")}
            onClick={() => setCancelId(null)}
          />
        </div>
      )}
    </div>
  );
}
