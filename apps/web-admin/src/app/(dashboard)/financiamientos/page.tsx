"use client";

import { useState } from "react";
import { CreditCard } from "lucide-react";
import { useFetchData } from "../../../hooks/useFetchData";
import { getApiUrl } from "../../../lib/api";

export default function FinanciamientosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data, loading } = useFetchData<any>(getApiUrl("admin/transactions?size=50"));

  if (loading) return <div className="p-8 text-center text-muted-foreground">Cargando financiamientos...</div>;

  const txs = data?.content || [];
  const filtered = txs.filter(
    (f: any) =>
      f.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.merchant?.tradeName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="opacity-60 text-sm">{filtered.length} transacciones encontradas</p>
        <div className="relative hidden sm:block mr-2">
          <input type="search" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-4 pr-4 py-2 bg-muted rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary w-52 transition-all" />
        </div>
        <button className="btn btn-primary btn-sm gap-2">
          <CreditCard className="w-4 h-4" /> Nuevo Financiamiento
        </button>
      </div>
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-16 opacity-40">
              <CreditCard className="w-10 h-10 mx-auto mb-3" />
              <p className="font-medium">Sin resultados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-sm w-full">
                <thead>
                  <tr className="border-base-300">
                    <th>Fecha</th>
                    <th>Paciente</th>
                    <th>Comercio</th>
                    <th>Monto (Total)</th>
                    <th>Cuotas</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((f: any) => (
                    <tr key={f.id} className="hover:bg-base-200/40 transition-colors cursor-pointer border-base-300/60">
                      <td className="opacity-60 font-mono text-xs">{new Date(f.createdAt).toLocaleDateString()}</td>
                      <td className="font-medium">{f.user?.fullName}</td>
                      <td className="opacity-60">{f.merchant?.tradeName}</td>
                      <td className="font-semibold">${f.amount?.toFixed(2)}</td>
                      <td>{f.numberOfInstallments}</td>
                      <td>
                        <span className={`badge badge-sm ${
                          f.status === "ACTIVE" ? "badge-primary" : f.status === "FAILED" ? "badge-error" : "badge-ghost"
                        }`}>{f.status}</span>
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
