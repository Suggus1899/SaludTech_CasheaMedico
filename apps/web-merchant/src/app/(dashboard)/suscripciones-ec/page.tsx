"use client";

import { useState, useEffect } from "react";
import { Shield, UserPlus, Activity, RefreshCw } from "lucide-react";
import { getApiUrl, apiFetch } from "../../../lib/api";

export default function SuscripcionesEcPage() {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch(getApiUrl("merchant/elder-care/subscriptions"), {});
        if (res.ok) setSubs(await res.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const SERVICE_LABELS: Record<string, string> = {
    NURSE: "Enfermera",
    CAREGIVER: "Cuidador/a",
    PHYSIOTHERAPY: "Fisioterapia",
    GERIATRIC_SPECIALIST: "Geriatría",
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
        <RefreshCw className="w-5 h-5 animate-spin" /> Cargando suscripciones Elder Care...
      </div>
    );

  const activeCount = subs.filter((s: any) => s.status === "ACTIVE").length;
  const serviceTypes = new Set(subs.map((s: any) => s.service_type)).size;

  return (
    <div className="max-w-4xl space-y-6">
      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Suscriptores Activos", value: activeCount, icon: Shield, color: "text-violet-600" },
          { label: "Total Suscripciones", value: subs.length, icon: UserPlus, color: "text-blue-600" },
          { label: "Servicios Diferentes", value: serviceTypes, icon: Activity, color: "text-pink-600" },
        ].map((kpi) => (
          <div key={kpi.label} className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body flex-row items-center gap-4 p-5">
              <div className="p-2.5 rounded-lg bg-base-200">
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold font-(family-name:--font-syne)">{kpi.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{kpi.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body pb-0">
          <h3 className="card-title font-(family-name:--font-syne)">Suscripciones Elder Care</h3>
          <p className="text-sm text-base-content/60">Pacientes suscritos a tus servicios de cuidado mayor</p>
        </div>
        <div className="p-0">
          {subs.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Shield className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">Sin suscripciones activas</p>
              <p className="text-sm mt-1">Los pacientes pueden suscribirse desde su app.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-muted-foreground">
                    <th className="text-left px-4 py-3 font-medium">Servicio</th>
                    <th className="text-right px-4 py-3 font-medium">Monto/Mes</th>
                    <th className="text-center px-4 py-3 font-medium">Estado</th>
                    <th className="text-left px-4 py-3 font-medium">Próximo Cobro</th>
                  </tr>
                </thead>
                <tbody>
                  {subs.map((s: any) => (
                    <tr key={s.id} className="border-b border-border/60 hover:bg-accent/40 transition-colors">
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold">
                          <Shield className="w-3 h-3" />
                          {SERVICE_LABELS[s.service_type] ?? s.service_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-primary">
                        ${Number(s.monthly_amount ?? 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`badge ${s.status === "ACTIVE" ? "badge-primary" : "badge-ghost"}`}>
                          {s.status === "ACTIVE" ? "Activa" : "Cancelada"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {s.next_billing_date
                          ? new Date(s.next_billing_date).toLocaleDateString("es-VE")
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
