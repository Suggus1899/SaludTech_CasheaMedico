"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Pill } from "lucide-react";
import { useFetchData } from "@saludtech/shared";
import { getApiUrl } from "../../../lib/api";

export default function SuscripcionesPage() {
  const t = useTranslations("Subscriptions");
  const [searchTerm, setSearchTerm] = useState("");
  const { data, loading } = useFetchData<any>(getApiUrl("admin/subscriptions/all?limit=50&offset=0"));

  if (loading) return <div className="p-8 text-center text-muted-foreground">{t("loading")}</div>;

  const subs: any[] = data?.subscriptions || [];
  const filtered = subs.filter((s: any) =>
    s.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.merchant_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{t("count", { count: filtered.length })}</p>
        <div className="relative hidden sm:block mr-2">
          <input type="search" placeholder={t("searchPlaceholder")} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-4 pr-4 py-2 bg-muted rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary w-52 transition-all" />
        </div>
      </div>
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-16 opacity-40">
              <Pill className="w-10 h-10 mx-auto mb-3" />
              <p>{t("noActive")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-sm w-full">
                <thead>
                  <tr className="border-base-300">
                    <th>{t("colProduct")}</th>
                    <th>{t("colPharmacy")}</th>
                    <th>{t("colPatient")}</th>
                    <th>{t("colAmountMonth")}</th>
                    <th>{t("colNextBilling")}</th>
                    <th>{t("colStatus")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s: any) => (
                    <tr key={s.id} className="hover:bg-base-200/40 border-base-300/60">
                      <td className="font-medium">{s.product_name}</td>
                      <td className="opacity-60">{s.merchant_name || "—"}</td>
                      <td className="opacity-60 text-xs">{s.user_name || "—"}</td>
                      <td className="font-semibold">${Number(s.amount || 0).toFixed(2)}</td>
                      <td className="text-xs opacity-60">{s.next_billing_date ? new Date(s.next_billing_date).toLocaleDateString('es-VE') : '—'}</td>
                      <td>
                        <span className={`badge badge-sm ${s.status === 'ACTIVE' ? 'badge-primary' : 'badge-ghost'}`}>{s.status}</span>
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
