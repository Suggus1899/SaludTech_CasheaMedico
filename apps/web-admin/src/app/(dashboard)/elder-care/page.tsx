"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Shield, Building2, Activity } from "lucide-react";
import { useFetchData } from "@saludtech/shared";
import { getApiUrl } from "../../../lib/api";

export default function ElderCarePage() {
  const t = useTranslations("ElderCare");
  const [searchTerm, setSearchTerm] = useState("");
  const { data, loading } = useFetchData<any>(getApiUrl("admin/elder-care?limit=50&offset=0"));

  if (loading) return <div className="p-8 text-center text-muted-foreground">{t("loading")}</div>;

  const subs: any[] = data?.subscriptions || [];

  const filtered = subs.filter((s: any) =>
    s.merchant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.service_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeSubs = subs.filter((s: any) => s.status === "ACTIVE");
  const serviceTypes = new Set(subs.map((s: any) => s.service_type));

  const SERVICE_LABELS: Record<string, string> = {
    NURSE: t("serviceNurse"), CAREGIVER: t("serviceCaregiver"),
    PHYSIOTHERAPY: t("servicePhysiotherapy"), GERIATRIC_SPECIALIST: t("serviceGeriatric"),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="opacity-60 text-sm">{t("count", { count: filtered.length })}</p>
        <div className="relative">
          <input type="search" placeholder={t("searchPlaceholder")} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-4 pr-4 py-2 bg-muted rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary w-full sm:w-52 transition-all" />
        </div>
      </div>
      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: t("kpiActiveSubscribers"), value: activeSubs.length, icon: Shield, color: "text-violet-600" },
          { label: t("kpiTotalSubscriptions"), value: subs.length, icon: Building2, color: "text-blue-600" },
          { label: t("kpiServiceTypes"), value: serviceTypes.size, icon: Activity, color: "text-pink-600" },
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
          <h3 className="card-title font-(family-name:--font-syne)">{t("subscriptionsTitle")}</h3>
        </div>
        <div className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-12 opacity-40"><Shield className="w-10 h-10 mx-auto mb-3" /><p>{t("noSubscriptions")}</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-sm w-full">
                <thead>
                  <tr className="border-base-300">
                    <th>{t("colPatient")}</th>
                    <th>{t("colProvider")}</th>
                    <th>{t("colService")}</th>
                    <th>{t("colAmountMonth")}</th>
                    <th>{t("colNextBilling")}</th>
                    <th>{t("colStatus")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s: any) => (
                    <tr key={s.id} className="hover:bg-base-200/40 border-base-300/60">
                      <td className="font-medium">{s.user_name || "—"}</td>
                      <td className="opacity-60">{s.merchant_name || "—"}</td>
                      <td><span className="badge badge-sm badge-ghost">{SERVICE_LABELS[s.service_type] ?? s.service_type}</span></td>
                      <td className="font-semibold">${Number(s.monthly_amount || 0).toFixed(2)}</td>
                      <td className="opacity-60 text-xs">{s.next_billing_date ? new Date(s.next_billing_date).toLocaleDateString('es-VE') : '—'}</td>
                      <td><span className={`badge badge-sm ${s.status === 'ACTIVE' ? 'badge-primary' : 'badge-ghost'}`}>{s.status}</span></td>
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
