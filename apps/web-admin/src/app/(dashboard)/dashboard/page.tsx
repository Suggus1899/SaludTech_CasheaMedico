"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { DollarSign, Users, Store, AlertTriangle, TrendingUp, TrendingDown, Search, CreditCard, BarChart3 } from "lucide-react";
import { useFetchData } from "@saludtech/shared";
import { getApiUrl } from "../../../lib/api";
import { AdminUser, AdminUsersResponse, DashboardStats, AnalyticsResponse } from "../../../types/admin";
import {
  RevenueLineChart,
  TransactionStatusPie,
  InstallmentStatusBar,
  TopMerchantsChart,
  CategoryDonut,
  TriageFunnel,
} from "../../../components/charts/AnalyticsCharts";

export default function DashboardPage() {
  const t = useTranslations("Dashboard");
  const tCommon = useTranslations("Common");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const { data: stats, loading: statsLoading } = useFetchData<DashboardStats>(getApiUrl("admin/dashboard"));
  const { data: usersData, loading: usersLoading } = useFetchData<AdminUsersResponse>(getApiUrl("admin/users?limit=5&offset=0"));
  const analyticsParams = new URLSearchParams();
  if (dateFrom) analyticsParams.set("from", dateFrom);
  if (dateTo) analyticsParams.set("to", dateTo);
  const analyticsUrl = getApiUrl(`admin/analytics${analyticsParams.toString() ? `?${analyticsParams}` : ""}`);
  const { data: analytics, loading: analyticsLoading } = useFetchData<AnalyticsResponse>(analyticsUrl, [dateFrom, dateTo]);

  if (statsLoading || usersLoading) {
    return (
      <div className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card bg-base-100 border border-base-300 shadow-sm">
              <div className="card-body p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="skeleton h-4 w-24 rounded" />
                  <div className="skeleton w-8 h-8 rounded-lg" />
                </div>
                <div className="skeleton h-9 w-20 rounded" />
                <div className="skeleton h-3 w-32 rounded" />
                <div className="skeleton h-1.5 w-full rounded-full mt-1" />
              </div>
            </div>
          ))}
        </div>
        <div className="skeleton h-48 w-full rounded-2xl" />
      </div>
    );
  }

  const users: AdminUser[] = usersData?.users || [];
  const filtered = users.filter(
    (u) =>
      u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: t("kpiTotalVolume"),
            value: `$${Number(stats?.totalRevenue || 0).toFixed(2)}`,
            sub: t("kpiTotalTransactions"),
            icon: DollarSign,
            trend: "up",
            progress: 0,
          },
          {
            title: t("kpiPatients"),
            value: stats?.patients || 0,
            sub: t("kpiUsersTotal", { count: stats?.users || 0 }),
            icon: Users,
            trend: "up",
            progress: stats?.users ? Math.min(((stats?.patients ?? 0) / stats.users) * 100, 100) : 0,
          },
          {
            title: t("kpiActiveMerchants"),
            value: stats?.activeMerchants || 0,
            sub: t("kpiMerchantsTotal", { count: stats?.merchants || 0 }),
            icon: Store,
            trend: "neutral",
            progress: stats?.merchants ? Math.min(((stats?.activeMerchants ?? 0) / stats.merchants) * 100, 100) : 0,
          },
          {
            title: t("kpiOverdueInstallments"),
            value: stats?.overdueInstallments || 0,
            sub: t("kpiPending", { amount: Number(stats?.pendingAmount || 0).toFixed(2) }),
            icon: AlertTriangle,
            trend: (stats?.overdueInstallments ?? 0) > 0 ? "down" : "up",
            progress: stats?.creditLines ? Math.min(((stats?.overdueInstallments ?? 0) / stats?.creditLines) * 100, 100) : 0,
          },
        ].map((kpi) => (
          <div
            key={kpi.title}
            className="card bg-base-100 border border-base-300 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 cursor-pointer group overflow-hidden"
          >
            <div className="card-body p-4">
              <div className="flex flex-row items-center justify-between pb-2">
                <span className="text-sm font-medium opacity-60">{kpi.title}</span>
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <kpi.icon className={`h-4 w-4 ${kpi.trend === "down" ? "text-error" : "text-primary"}`} />
                </div>
              </div>
              <div className={`text-3xl font-bold tracking-tight font-(family-name:--font-syne) ${kpi.trend === "down" ? "text-error" : ""}`}>
                {kpi.value}
              </div>
              <p className={`text-xs mt-1 flex items-center gap-1 ${kpi.trend === "up" ? "text-success" : kpi.trend === "down" ? "text-error" : "opacity-60"}`}>
                {kpi.trend === "up" && <TrendingUp className="w-3 h-3" />}
                {kpi.trend === "down" && <TrendingDown className="w-3 h-3" />}
                {kpi.sub}
              </p>
              <div className="mt-3 h-1.5 rounded-full bg-base-300 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${kpi.trend === "down" ? "bg-error" : "bg-primary"}`}
                  style={{ width: `${Math.min(kpi.progress, 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Charts */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 flex-wrap">
          <BarChart3 className="w-5 h-5 text-primary" />
          <h2 className="text-xl font-bold font-(family-name:--font-syne)">{t("analytics")}</h2>
          <div className="ml-auto flex items-center gap-2">
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input input-bordered input-sm text-sm" />
            <span className="text-xs text-muted-foreground">→</span>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="input input-bordered input-sm text-sm" />
          </div>
        </div>

        {/* Revenue + Transaction Status */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="card bg-base-100 border border-base-300 shadow-sm lg:col-span-2">
            <div className="card-body">
              <h3 className="card-title font-(family-name:--font-syne)">{t("revenueByMonth")}</h3>
              {analyticsLoading ? (
                <div className="h-[280px] flex items-center justify-center text-sm opacity-40">{tCommon("loading")}</div>
              ) : (
                <RevenueLineChart data={analytics?.revenueByMonth ?? []} />
              )}
            </div>
          </div>
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body">
              <h3 className="card-title font-(family-name:--font-syne)">{t("transactionStatus")}</h3>
              {analyticsLoading ? (
                <div className="h-[280px] flex items-center justify-center text-sm opacity-40">{tCommon("loading")}</div>
              ) : (
                <TransactionStatusPie data={analytics?.transactionStatus ?? []} />
              )}
            </div>
          </div>
        </div>

        {/* Installments + Top Merchants */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body">
              <h3 className="card-title font-(family-name:--font-syne)">{t("installmentStatus")}</h3>
              {analyticsLoading ? (
                <div className="h-[280px] flex items-center justify-center text-sm opacity-40">{tCommon("loading")}</div>
              ) : (
                <InstallmentStatusBar data={analytics?.installmentStatus ?? []} />
              )}
            </div>
          </div>
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body">
              <h3 className="card-title font-(family-name:--font-syne)">{t("topMerchantsByRevenue")}</h3>
              {analyticsLoading ? (
                <div className="h-[280px] flex items-center justify-center text-sm opacity-40">{tCommon("loading")}</div>
              ) : (
                <TopMerchantsChart data={analytics?.topMerchants ?? []} />
              )}
            </div>
          </div>
        </div>

        {/* Category Donut + Triage Funnel */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body">
              <h3 className="card-title font-(family-name:--font-syne)">{t("merchantsByCategory")}</h3>
              {analyticsLoading ? (
                <div className="h-[280px] flex items-center justify-center text-sm opacity-40">{tCommon("loading")}</div>
              ) : (
                <CategoryDonut data={analytics?.categoryDistribution ?? []} />
              )}
            </div>
          </div>
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body">
              <h3 className="card-title font-(family-name:--font-syne)">{t("triageFunnel")}</h3>
              {analyticsLoading ? (
                <div className="h-[280px] flex items-center justify-center text-sm opacity-40">{tCommon("loading")}</div>
              ) : (
                <TriageFunnel data={analytics?.triageConversion ?? { pending_count: 0, reviewing_count: 0, resolved_count: 0, referred_count: 0, completed_count: 0 }} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="grid gap-6 lg:grid-cols-7">
        <div className="card bg-base-100 border border-base-300 shadow-sm lg:col-span-4">
          <div className="card-body">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center justify-between">
                <h3 className="card-title font-(family-name:--font-syne)">{t("recentUsers")}</h3>
                <Link href="/pacientes" className="text-xs font-semibold text-primary hover:underline">Ver todos →</Link>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-40" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar..."
                  className="input input-bordered input-sm pl-9 w-44 text-sm"
                />
              </div>
            </div>
            {filtered.length === 0 ? (
              <div className="text-center py-12 opacity-40">
                <Search className="w-10 h-10 mx-auto mb-3" />
                <p className="font-medium">{t("noResults")}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-sm w-full">
                  <thead>
                    <tr className="border-base-300">
                      <th>{t("colName")}</th>
                      <th>{t("colEmail")}</th>
                      <th>{t("colRole")}</th>
                      <th>{t("colLevel")}</th>
                      <th className="text-right">{t("colTotalPaid")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((u) => (
                      <tr key={u.id} className="hover:bg-base-200/40 transition-colors cursor-pointer border-base-300/60">
                        <td className="font-medium">{u.full_name}</td>
                        <td className="opacity-60">{u.email}</td>
                        <td>
                          <span className={`badge badge-sm ${u.role === "ADMIN" ? "badge-secondary" : u.role === "MERCHANT" ? "badge-accent" : "badge-ghost"}`}>{u.role}</span>
                        </td>
                        <td>
                          <span className="badge badge-sm badge-primary badge-outline">{t("levelPrefix", { level: u.level })}</span>
                        </td>
                        <td className="text-right font-semibold">${Number(u.total_paid || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        <div className="card bg-base-100 border border-base-300 shadow-sm lg:col-span-3">
          <div className="card-body">
            <h3 className="card-title font-(family-name:--font-syne)">{t("summary")}</h3>
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center pb-2 border-b border-base-300">
                <span className="text-sm opacity-60 flex items-center gap-2"><CreditCard className="w-4 h-4" /> {t("summaryTransactions")}</span>
                <span className="font-bold">{stats?.transactions || 0}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-base-300">
                <span className="text-sm opacity-60 flex items-center gap-2"><CreditCard className="w-4 h-4" /> {t("summaryCreditLines")}</span>
                <span className="font-bold">{stats?.creditLines || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm opacity-60 flex items-center gap-2"><DollarSign className="w-4 h-4" /> {t("summaryPendingAmount")}</span>
                <span className="font-bold text-error">${Number(stats?.pendingAmount || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
