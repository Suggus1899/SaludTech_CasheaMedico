"use client";

import { useState } from "react";
import { Shield, Building2, Activity } from "lucide-react";
import { useFetchData } from "../../../hooks/useFetchData";
import { getApiUrl } from "../../../lib/api";

export default function ElderCarePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data, loading } = useFetchData<any>(getApiUrl("admin/elder-care"));

  if (loading) return <div className="p-8 text-center text-muted-foreground">Cargando datos Elder Care...</div>;

  const activeSubs: any[] = data?.activeSubscriptions || [];
  const elderMerchants: any[] = data?.elderCareMerchants || [];

  const filtered = activeSubs.filter((s: any) =>
    s.merchantName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.serviceType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const SERVICE_LABELS: Record<string, string> = {
    NURSE: 'Enfermera', CAREGIVER: 'Cuidador/a',
    PHYSIOTHERAPY: 'Fisioterapia', GERIATRIC_SPECIALIST: 'Geriatría',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="opacity-60 text-sm">{filtered.length} suscripciones Elder Care encontradas</p>
        <div className="relative hidden sm:block mr-2">
          <input type="search" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-4 pr-4 py-2 bg-muted rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary w-52 transition-all" />
        </div>
      </div>
      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Suscriptores Activos", value: data?.totalActiveSubscribers ?? 0, icon: Shield, color: "text-violet-600" },
          { label: "Proveedores Elder Care", value: elderMerchants.length, icon: Building2, color: "text-blue-600" },
          { label: "Tipos de Servicio", value: new Set(activeSubs.map((s:any) => s.serviceType)).size, icon: Activity, color: "text-pink-600" },
        ].map(kpi => (
          <div key={kpi.label} className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body flex-row items-center gap-4 p-5">
              <div className="p-3 rounded-xl bg-base-200"><kpi.icon className={`w-6 h-6 ${kpi.color}`} /></div>
              <div>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <div className="text-xs opacity-60">{kpi.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Subscriptions table */}
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body pb-0">
          <h3 className="card-title font-(family-name:--font-syne)">Suscripciones Elder Care Activas</h3>
        </div>
        <div className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-12 opacity-40"><Shield className="w-10 h-10 mx-auto mb-3" /><p>Sin suscripciones activas</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-sm w-full">
                <thead>
                  <tr className="border-base-300">
                    <th>Proveedor</th>
                    <th>Servicio</th>
                    <th>Monto/Mes</th>
                    <th>Próximo Cobro</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s: any) => (
                    <tr key={s.id} className="hover:bg-base-200/40 border-base-300/60">
                      <td className="font-medium">{s.merchantName}</td>
                      <td><span className="badge badge-sm badge-ghost">{SERVICE_LABELS[s.serviceType] ?? s.serviceType}</span></td>
                      <td className="font-semibold">${s.monthlyAmount?.toFixed(2)}</td>
                      <td className="opacity-60 text-xs">{s.nextBillingDate ? new Date(s.nextBillingDate).toLocaleDateString('es-VE') : '—'}</td>
                      <td><span className="badge badge-sm badge-primary">Activa</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Elder Care Merchants */}
      {elderMerchants.length > 0 && (
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body">
            <h3 className="card-title font-(family-name:--font-syne)">Proveedores de Cuidado Mayor</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {elderMerchants.map((m: any) => (
                <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30">
                  <div className="p-2 rounded-lg bg-violet-100"><Building2 className="w-4 h-4 text-violet-600" /></div>
                  <div>
                    <p className="text-sm font-semibold">{m.tradeName}</p>
                    <p className="text-xs text-muted-foreground">{m.subcategory ?? m.category}</p>
                  </div>
                  <span className={`badge badge-sm ml-auto ${m.isActive ? 'badge-primary' : 'badge-ghost'}`}>{m.isActive ? 'Activo' : 'Inactivo'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
