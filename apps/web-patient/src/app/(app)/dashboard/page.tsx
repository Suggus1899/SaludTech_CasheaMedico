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
  CreditCard,
  WifiOff,
} from "lucide-react";
import { useFetchData } from "../../../hooks/useFetchData";
import { getApiUrl, getStoredUser } from "../../../lib/api";
import { formatCurrency, formatDate, daysUntil } from "../../../lib/utils";
import type { CreditLine, Installment, UserResponse } from "../../../types/patient";

const creditLineMeta: Record<
  string,
  { title: string; from: string; to: string; icon: typeof Stethoscope }
> = {
  ESPECIALIDAD_PRINCIPAL: {
    title: "Especialidad Principal",
    from: "#60A5FA",
    to: "#2563EB",
    icon: Stethoscope,
  },
  SALUD_COTIDIANA: {
    title: "Salud Cotidiana",
    from: "#34D399",
    to: "#10B981",
    icon: Pill,
  },
  MAYOR_CUIDADO: {
    title: "Mayor Cuidado",
    from: "#A78BFA",
    to: "#7C3AED",
    icon: Shield,
  },
};

export default function DashboardPage() {
  const [user, setUser] = useState<UserResponse | null>(null);

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
      {/* Credit lines */}
      {linesLoading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner text-primary" />
        </div>
      ) : linesError ? (
        <div className="flex flex-col items-center py-12 gap-4">
          <WifiOff className="w-12 h-12 text-muted-foreground" />
          <p className="text-muted-foreground">No se pudieron cargar las líneas de crédito.</p>
          <button onClick={() => refetchLines()} className="btn btn-primary btn-sm">
            Reintentar
          </button>
        </div>
      ) : creditLines && creditLines.length > 0 ? (
        <div className="space-y-4">
          {creditLines.map((line) => (
            <CreditLineCard key={line.id} line={line} level={user?.level} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-8">
          No hay líneas de crédito disponibles
        </p>
      )}

      {/* Quick actions */}
      <section>
        <h2
          className="text-base font-bold text-foreground mb-3.5"
          style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
        >
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-4 gap-3">
          <QuickAction
            href="/triaje"
            icon={<Stethoscope className="w-5 h-5" />}
            label="Triaje"
            color="#1A6B8A"
          />
          <QuickAction
            href="/pagar"
            icon={<QrCode className="w-5 h-5" />}
            label="Pagar"
            color="#6366F1"
          />
          <QuickAction
            href="/suscripciones"
            icon={<Pill className="w-5 h-5" />}
            label="Medicinas"
            color="#10B981"
          />
          <QuickAction
            href="/cuidado-mayor"
            icon={<Shield className="w-5 h-5" />}
            label="Cuidado Mayor"
            color="#7C3AED"
          />
        </div>
        <div className="grid grid-cols-4 gap-3 mt-3">
          <QuickAction
            href="/cuotas"
            icon={<CalendarDays className="w-5 h-5" />}
            label="Cuotas"
            color="#0EA5E9"
          />
        </div>
      </section>

      {/* Upcoming payments */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2
            className="text-base font-bold text-foreground"
            style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
          >
            Próximos Pagos
          </h2>
          <Link
            href="/cuotas"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Ver todas
          </Link>
        </div>
        <div className="space-y-2.5">
          {pendingInstallments.length === 0 ? (
            <p className="text-center text-muted-foreground py-6 text-sm">
              No hay pagos pendientes 🎉
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
                    storeName={inst.transaction?.merchant?.tradeName ?? "Comercio"}
                    installment={
                      inst.installmentNumber && inst.totalInstallments
                        ? `${inst.installmentNumber} de ${inst.totalInstallments}`
                        : "—"
                    }
                    dueLabel={
                      isUrgent
                        ? `Vence en ${days} día${days === 1 ? "" : "s"}`
                        : `Vence el ${formatDate(inst.dueDate)}`
                    }
                    amount={inst.amount}
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
  const meta = creditLineMeta[line.type] ?? {
    title: "Línea de Salud",
    from: "#60A5FA",
    to: "#2563EB",
    icon: CreditCard,
  };
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
            <span className="text-xs font-bold text-black/85">Nivel {level}</span>
          </Link>
        )}
      </div>

      <p
        className="text-4xl font-bold mt-5 leading-none"
        style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
      >
        ${line.available.toFixed(2)}
      </p>
      <p className="text-sm text-black/65 mt-1">Disponible para financiar</p>

      <div className="mt-5">
        <div className="flex justify-between text-xs text-black/70 mb-1.5">
          <span>Utilizado</span>
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
      <span
        className="text-xs font-semibold text-foreground text-center leading-tight"
        style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
      >
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
  isUrgent,
}: {
  storeName: string;
  installment: string;
  dueLabel: string;
  amount: number;
  isUrgent: boolean;
}) {
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
        <p
          className="text-sm font-semibold text-foreground truncate"
          style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
        >
          Cuota {installment} · {storeName}
        </p>
        <p
          className={`text-xs mt-0.5 ${
            isUrgent ? "text-error" : "text-muted-foreground"
          }`}
        >
          {dueLabel}
        </p>
      </div>
      <p
        className="text-base font-bold text-foreground shrink-0"
        style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
      >
        {formatCurrency(amount)}
      </p>
    </div>
  );
}
