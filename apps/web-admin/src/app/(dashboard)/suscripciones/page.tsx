"use client";

import { useState } from "react";
import { Pill } from "lucide-react";
import { useFetchData } from "../../../hooks/useFetchData";
import { getApiUrl } from "../../../lib/api";

export default function SuscripcionesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data, loading } = useFetchData<any[]>(getApiUrl("admin/subscriptions/all"));

  if (loading) return <div className="p-8 text-center text-muted-foreground">Cargando suscripciones...</div>;

  const subs: any[] = data || [];
  const filtered = subs.filter((s: any) =>
    s.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.merchantName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{filtered.length} suscripciones de farmacia activas</p>
        <div className="relative hidden sm:block mr-2">
          <input type="search" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-4 pr-4 py-2 bg-muted rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary w-52 transition-all" />
        </div>
      </div>
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-16 opacity-40">
              <Pill className="w-10 h-10 mx-auto mb-3" />
              <p>Sin suscripciones activas</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-sm w-full">
                <thead>
                  <tr className="border-base-300">
                    <th>Producto</th>
                    <th>Farmacia</th>
                    <th>Monto/Mes</th>
                    <th>Próximo Cobro</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s: any) => (
                    <tr key={s.id} className="hover:bg-base-200/40 border-base-300/60">
                      <td className="font-medium">{s.productName}</td>
                      <td className="opacity-60">{s.merchantName}</td>
                      <td className="font-semibold">${s.amount?.toFixed(2)}</td>
                      <td className="text-xs opacity-60">{s.nextBillingDate ? new Date(s.nextBillingDate).toLocaleDateString('es-VE') : '—'}</td>
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
