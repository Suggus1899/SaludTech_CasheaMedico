"use client";

import { useState } from "react";
import { DollarSign, Users, Store, AlertTriangle, TrendingUp, TrendingDown, Search, CreditCard } from "lucide-react";
import { useFetchData } from "../../../hooks/useFetchData";
import { getApiUrl } from "../../../lib/api";
import { AdminUser, AdminUsersResponse, DashboardStats } from "../../../types/admin";

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: stats, loading: statsLoading } = useFetchData<DashboardStats>(getApiUrl("admin/dashboard"));
  const { data: usersData, loading: usersLoading } = useFetchData<AdminUsersResponse>(getApiUrl("admin/users?limit=5&offset=0"));

  if (statsLoading || usersLoading) return <div className="p-8 text-center text-muted-foreground">Cargando dashboard...</div>;

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
            title: "Volumen Total",
            value: `$${Number(stats?.totalRevenue || 0).toFixed(2)}`,
            sub: "Transacciones totales",
            icon: DollarSign,
            trend: "up",
            progress: 100,
          },
          {
            title: "Pacientes",
            value: stats?.patients || 0,
            sub: `${stats?.users || 0} usuarios totales`,
            icon: Users,
            trend: "up",
            progress: 100,
          },
          {
            title: "Comercios Activos",
            value: stats?.activeMerchants || 0,
            sub: `${stats?.merchants || 0} comercios totales`,
            icon: Store,
            trend: "neutral",
            progress: 100,
          },
          {
            title: "Cuotas en Mora",
            value: stats?.overdueInstallments || 0,
            sub: `$${Number(stats?.pendingAmount || 0).toFixed(2)} pendiente`,
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

      {/* Tabla */}
      <div className="grid gap-6 lg:grid-cols-7">
        <div className="card bg-base-100 border border-base-300 shadow-sm lg:col-span-4">
          <div className="card-body">
            <h3 className="card-title font-(family-name:--font-syne)">Usuarios Recientes</h3>
            {filtered.length === 0 ? (
              <div className="text-center py-12 opacity-40">
                <Search className="w-10 h-10 mx-auto mb-3" />
                <p className="font-medium">Sin resultados</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-sm w-full">
                  <thead>
                    <tr className="border-base-300">
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Rol</th>
                      <th>Nivel</th>
                      <th className="text-right">Total Pagado</th>
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
                          <span className="badge badge-sm badge-primary badge-outline">Nv. {u.level}</span>
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
            <h3 className="card-title font-(family-name:--font-syne)">Resumen</h3>
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center pb-2 border-b border-base-300">
                <span className="text-sm opacity-60 flex items-center gap-2"><CreditCard className="w-4 h-4" /> Transacciones</span>
                <span className="font-bold">{stats?.transactions || 0}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-base-300">
                <span className="text-sm opacity-60 flex items-center gap-2"><CreditCard className="w-4 h-4" /> Líneas de Crédito</span>
                <span className="font-bold">{stats?.creditLines || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm opacity-60 flex items-center gap-2"><DollarSign className="w-4 h-4" /> Monto Pendiente</span>
                <span className="font-bold text-error">${Number(stats?.pendingAmount || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
