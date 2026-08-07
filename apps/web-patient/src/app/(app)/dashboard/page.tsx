"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Stethoscope,
  QrCode,
  Pill,
  Shield,
  CalendarDays,
  AlertCircle,
  Clock,
  Award,
  WifiOff,
  Store,
  Search,
  GraduationCap,
} from "lucide-react";
import { useFetchData } from "@saludtech/shared";
import { getApiUrl, getStoredUser } from "../../../lib/api";
import { formatCurrency, formatWithVES, formatDate, daysUntil } from "../../../lib/utils";
import {
  getCreditLineStyle,
  quickActionStyles,
} from "../../../lib/creditLineStyles";
import { useTour } from "../../../lib/tours";
import { useTranslations } from "next-intl";
import type { CreditLine, Installment, UserResponse } from "../../../types/patient";

export default function DashboardPage() {
  const [user, setUser] = useState<UserResponse | null>(null);
  const { startTour, hasSeenTour } = useTour();
  const t = useTranslations("Dashboard");
  const tCommon = useTranslations("Common");

  useEffect(() => {
    setUser(getStoredUser<UserResponse>());
  }, []);

  const { data: creditLines, loading: linesLoading, error: linesError, refetch: refetchLines } = useFetchData<CreditLine[]>(
    getApiUrl("patient/credit-lines")
  );
  const { data: installments } = useFetchData<Installment[]>(
    getApiUrl("patient/transactions/my/installments/pending")
  );

  const pendingInstallments = (installments ?? []).slice(0, 4);

  return (
    <div className="space-y-7">
      {/* Tutorial prompt — shown once for new users */}
      {!hasSeenTour("dashboard") && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20">
          <GraduationCap className="w-5 h-5 text-primary shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-semibold text-foreground">{t("tourPromptTitle")}</p>
            <p className="text-[11px] text-muted-foreground">{t("tourPromptDesc")}</p>
          </div>
          <button
            onClick={() => startTour("dashboard")}
            className="btn btn-primary btn-xs"
          >
            {t("seeTour")}
          </button>
        </div>
      )}

      {/* Credit lines */}
      <div data-tour="credit-lines">
      {linesLoading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner text-primary" />
        </div>
      ) : linesError ? (
        <div className="flex flex-col items-center py-12 gap-4">
          <WifiOff className="w-12 h-12 text-muted-foreground" />
          <p className="text-muted-foreground">{t("loadCreditLinesError")}</p>
          <button onClick={() => refetchLines()} className="btn btn-primary btn-sm">
            {tCommon("retry")}
          </button>
        </div>
      ) : creditLines && creditLines.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {creditLines.map((line) => (
            <CreditLineCard key={line.id} line={line} level={user?.level} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center py-12 gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/40">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
          <p className="text-sm text-muted-foreground text-center">{t("noCreditLines")}</p>
        </div>
      )}
      </div>

      {/* Quick actions */}
      <section data-tour="quick-actions">
        <h2 className="text-base font-bold text-foreground mb-3.5">
          {t("quickActions")}
        </h2>
        <div className="grid grid-cols-4 lg:grid-cols-7 gap-3">
          <QuickAction
            href="/triaje"
            icon={<Stethoscope className="w-5 h-5" />}
            label={t("triaje")}
            color={quickActionStyles.triaje.color}
          />
          <QuickAction
            href="/pagar"
            icon={<QrCode className="w-5 h-5" />}
            label={t("pay")}
            color={quickActionStyles.pagar.color}
          />
          <QuickAction
            href="/suscripciones"
            icon={<Pill className="w-5 h-5" />}
            label={t("medicines")}
            color={quickActionStyles.medicinas.color}
          />
          <QuickAction
            href="/cuidado-mayor"
            icon={<Shield className="w-5 h-5" />}
            label={t("elderCare")}
            color={quickActionStyles.cuidadoMayor.color}
          />
          <QuickAction
            href="/comercios"
            icon={<Store className="w-5 h-5" />}
            label={t("merchants")}
            color="#2563eb"
          />
          <QuickAction
            href="/catalogo"
            icon={<Search className="w-5 h-5" />}
            label={t("catalog")}
            color="#0891b2"
          />
          <QuickAction
            href="/cuotas"
            icon={<CalendarDays className="w-5 h-5" />}
            label={t("installments")}
            color={quickActionStyles.cuotas.color}
          />
        </div>
      </section>

      {/* Upcoming payments */}
      <section data-tour="upcoming-payments">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-foreground">
            {t("upcomingPayments")}
          </h2>
          <Link
            href="/cuotas"
            className="text-sm font-semibold text-primary hover:underline"
          >
            {t("viewAll")}
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {pendingInstallments.length === 0 ? (
            <p className="text-center text-muted-foreground py-6 text-sm">
              {t("noPendingPayments")}
            </p>
          ) : (
            pendingInstallments.map((inst) => {
              const days = daysUntil(inst.dueDate);
              const isUrgent = days <= 2;
              return (
                <Link
                  key={inst.id}
                  href={`/cuotas/${inst.id}`}
                  className="block"
                >
                  <PaymentCard
                    storeName={inst.transaction?.merchant?.tradeName ?? t("merchant")}
                    installment={
                      inst.installmentNumber && inst.totalInstallments
                        ? `${inst.installmentNumber} de ${inst.totalInstallments}`
                        : "—"
                    }
                    dueLabel={
                      isUrgent
                        ? t("dueInDays", { count: days })
                        : t("dueOnDate", { date: formatDate(inst.dueDate) })
                    }
                    amount={inst.amount}
                    amountVES={inst.amountVES}
                    isUrgent={isUrgent}
                  />
                </Link>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}

function CreditLineCard({ line, level }: { line: CreditLine; level?: number }) {
  const t = useTranslations("Dashboard");
  const meta = getCreditLineStyle(line.type);
  const Icon = meta.icon;
  const used = line.limitAmount - line.available;
  const progress = line.limitAmount > 0 ? (used / line.limitAmount) * 100 : 0;

  return (
    <div
      className="rounded-3xl p-6 text-black shadow-lg"
      style={{
        background: `linear-gradient(135deg, ${meta.from}, ${meta.to})`,
        boxShadow: `0 12px 24px ${meta.from}59`,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon className="w-4 h-4 text-black/60" />
          <span className="text-sm font-medium text-black/75">{meta.title}</span>
        </div>
        {level != null && (
          <Link
            href="/perfil"
            className="px-3 py-1 rounded-full bg-black/10 flex items-center gap-1"
          >
            <Award className="w-3.5 h-3.5 text-black/85" />
            <span className="text-xs font-bold text-black/85">{t("level", { level })}</span>
          </Link>
        )}
      </div>

      <p className="text-4xl font-bold mt-5 leading-none font-display">
        ${line.available.toFixed(2)}
      </p>
      <p className="text-sm text-black/65 mt-1">{t("availableToFinance")}</p>

      <div className="mt-5">
        <div className="flex justify-between text-xs text-black/70 mb-1.5">
          <span>{t("used")}</span>
          <span>
            ${used.toFixed(2)} / ${line.limitAmount.toFixed(2)}
          </span>
        </div>
        <div className="h-2 rounded-full bg-black/15 overflow-hidden">
          <div
            className="h-full rounded-full bg-black/40"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  label,
  color,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2.5 p-4 rounded-2xl border border-border bg-base-100 hover:shadow-md transition-shadow"
    >
      <div
        className="p-2.5 rounded-full"
        style={{ backgroundColor: `${color}1A`, color }}
      >
        {icon}
      </div>
      <span className="text-xs font-semibold text-foreground text-center leading-tight font-display">
        {label}
      </span>
    </Link>
  );
}

function PaymentCard({
  storeName,
  installment,
  dueLabel,
  amount,
  amountVES,
  isUrgent,
}: {
  storeName: string;
  installment: string;
  dueLabel: string;
  amount: number;
  amountVES?: number;
  isUrgent: boolean;
}) {
  const t = useTranslations("Dashboard");
  return (
    <div
      className={`p-4 rounded-2xl border bg-base-100 flex items-center gap-3.5 ${
        isUrgent ? "border-error/30" : "border-border"
      }`}
    >
      <div
        className={`p-2.5 rounded-xl ${
          isUrgent ? "bg-error/10 text-error" : "bg-primary/10 text-primary"
        }`}
      >
        {isUrgent ? (
          <AlertCircle className="w-5 h-5" />
        ) : (
          <Clock className="w-5 h-5" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate font-display">
          {t("installmentLabel", { installment, storeName })}
        </p>
        <p
          className={`text-xs mt-0.5 ${
            isUrgent ? "text-error" : "text-muted-foreground"
          }`}
        >
          {dueLabel}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-base font-bold text-foreground font-display">
          {formatCurrency(amount)}
        </p>
        {amountVES ? (
          <p className="text-xs text-muted-foreground">
            (Bs. {new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amountVES)})
          </p>
        ) : null}
      </div>
    </div>
  );
}
