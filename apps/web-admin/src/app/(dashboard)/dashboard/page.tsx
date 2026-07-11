"use client";

import { useState } from "react";
import { DollarSign, Users, Store, AlertTriangle, TrendingUp, TrendingDown, Search } from "lucide-react";
import { useFetchData } from "../../../hooks/useFetchData";
import { getApiUrl } from "../../../lib/api";

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: stats, loading: statsLoading } = useFetchData<any>(getApiUrl("admin/dashboard/stats"));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: txData, loading: txLoading } = useFetchData<any>(getApiUrl("admin/transactions?size=5"));

  if (statsLoading || txLoading) return <div className="p-8 text-center text-muted-foreground">Cargando dashboard...</div>;

  const transactions = txData?.content || [];
  const filtered = transactions.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (tx: any) =>
      tx.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.merchant?.tradeName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: "Volumen Financiado",
            value: `$${stats?.totalActiveDebt?.toFixed(2) || "0.00"}`,
            sub: "Total deuda activa",
            icon: DollarSign,
            trend: "up",
            progress: 100,
          },
          {
            title: "Pacientes Activos",
            value: stats?.totalPatients || 0,
            sub: "Registrados",
            icon: Users,
            trend: "up",
            progress: 100,
          },
          {
            title: "Comercios Afiliados",
            value: stats?.activeMerchants || 0,
            sub: "Clínicas y farmacias",
            icon: Store,
            trend: "neutral",
            progress: 100,
          },
          {
            title: "Cuotas en Mora",
            value: stats?.overdueInstallments || 0,
            sub: `$${stats?.overdueAmount?.toFixed(2) || "0.00"} vencido`,
            icon: AlertTriangle,
            trend: stats?.overdueInstallments > 0 ? "down" : "up",
            progress: (stats?.defaultRate || 0),
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
            <h3 className="card-title font-(family-name:--font-syne)">Transacciones Recientes</h3>
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
                      <th>Paciente</th>
                      <th>Comercio</th>
                      <th>Estado</th>
                      <th className="text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {filtered.map((tx: any) => (
                      <tr key={tx.id} className="hover:bg-base-200/40 transition-colors cursor-pointer border-base-300/60">
                        <td className="font-medium">{tx.user?.fullName}</td>
                        <td className="opacity-60">{tx.merchant?.tradeName}</td>
                        <td>
                          <span className={`badge badge-sm ${tx.status === "COMPLETED" ? "badge-primary" : "badge-ghost"}`}>{tx.status}</span>
                        </td>
                        <td className="text-right font-semibold">${tx.amount?.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
