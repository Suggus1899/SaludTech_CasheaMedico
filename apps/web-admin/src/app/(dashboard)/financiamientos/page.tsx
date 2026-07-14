"use client";

import { useState } from "react";
import { CreditCard, Pencil, X, AlertCircle, Check } from "lucide-react";
import { useFetchData } from "../../../hooks/useFetchData";
import { getApiUrl, apiFetch } from "../../../lib/api";
import { CreditLine, CreditLinesResponse } from "../../../types/admin";
import { ExportButton } from "../../../components/shared/ExportButton";

export default function FinanciamientosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const { data, loading, refetch } = useFetchData<CreditLinesResponse>(getApiUrl("admin/credit-lines?limit=50&offset=0"));
  const [editing, setEditing] = useState<CreditLine | null>(null);
  const [newLimit, setNewLimit] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Cargando líneas de crédito...</div>;

  const lines: CreditLine[] = data?.creditLines || [];
  const filtered = lines.filter(
    (f) =>
      (f.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.user_phone?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === "ALL" || f.status === statusFilter) &&
      (typeFilter === "ALL" || f.type === typeFilter)
  );

  const lineTypeLabels: Record<string, string> = {
    ESPECIALIDAD_PRINCIPAL: "Especialidad Principal",
    SALUD_COTIDIANA: "Salud Cotidiana",
    MAYOR_CUIDADO: "Mayor Cuidado",
  };

  const handleEdit = (line: CreditLine) => {
    setEditing(line);
    setNewLimit(String(line.limit_usd || 0));
    setError(null);
  };

  const handleSave = async () => {
    if (!editing) return;
    setError(null);
    const limit = parseFloat(newLimit);
    if (isNaN(limit) || limit < 0) {
      setError("El límite debe ser un número válido");
      return;
    }
    setSaving(true);
    try {
      const res = await apiFetch(getApiUrl(`admin/credit-lines/${editing.id}/limit`), {
        method: "PATCH",
        body: JSON.stringify({ limitUSD: limit }),
      });
      if (!res.ok) throw new Error("Error al actualizar");
      setEditing(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="opacity-60 text-sm">{filtered.length} líneas de crédito</p>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="text-success text-sm flex items-center gap-1">
              <Check className="w-4 h-4" /> Límite actualizado
            </span>
          )}
          <ExportButton endpoint="admin/export/transactions" label="transacciones" />
          <ExportButton endpoint="admin/export/installments" label="cuotas" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select select-sm select-bordered"
          >
            <option value="ALL">Todos los estados</option>
            <option value="ACTIVE">Activas</option>
            <option value="PAUSED">Pausadas</option>
            <option value="BLOCKED">Bloqueadas</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="select select-sm select-bordered"
          >
            <option value="ALL">Todos los tipos</option>
            <option value="ESPECIALIDAD_PRINCIPAL">Especialidad Principal</option>
            <option value="SALUD_COTIDIANA">Salud Cotidiana</option>
            <option value="MAYOR_CUIDADO">Mayor Cuidado</option>
          </select>
          <div className="relative hidden sm:block">
            <input type="search" placeholder="Buscar por nombre, tipo, telefono..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-4 pr-4 py-2 bg-muted rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary w-64 transition-all" />
          </div>
        </div>
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
                    <th>Paciente</th>
                    <th>Tipo de Línea</th>
                    <th className="text-right">Límite</th>
                    <th className="text-right">Usado</th>
                    <th className="text-right">Disponible</th>
                    <th>Estado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((f) => {
                    const limit = Number(f.limit_usd || 0);
                    const used = Number(f.used_usd || 0);
                    const available = limit - used;
                    return (
                      <tr key={f.id} className="hover:bg-base-200/40 transition-colors border-base-300/60">
                        <td className="font-medium">{f.user_name || "—"}</td>
                        <td>
                          <span className="badge badge-sm badge-outline">{lineTypeLabels[f.type] || f.type}</span>
                        </td>
                        <td className="text-right font-semibold">${limit.toFixed(2)}</td>
                        <td className="text-right text-warning">${used.toFixed(2)}</td>
                        <td className="text-right text-success font-semibold">${available.toFixed(2)}</td>
                        <td>
                          <span className={`badge badge-sm ${available > 0 ? "badge-primary" : "badge-error"}`}>
                            {available > 0 ? "Disponible" : "Agotado"}
                          </span>
                        </td>
                        <td className="text-right">
                          <button onClick={() => handleEdit(f)} className="btn btn-ghost btn-xs">
                            <Pencil className="w-3.5 h-3.5" /> Ajustar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="modal modal-open">
          <div className="modal-box max-w-sm">
            <h3 className="text-lg font-bold font-(family-name:--font-syne)">Ajustar Límite de Crédito</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {editing.user_name} · {lineTypeLabels[editing.type] || editing.type}
            </p>
            <div className="mt-4 space-y-3">
              <div className="form-control gap-1">
                <label className="label pb-0"><span className="label-text font-medium">Nuevo Límite (USD)</span></label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newLimit}
                  onChange={(e) => setNewLimit(e.target.value)}
                  className="input input-bordered w-full text-sm"
                />
              </div>
              <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <p>Usado: ${Number(editing.used_usd || 0).toFixed(2)}</p>
                <p>Disponible actual: ${(Number(editing.limit_usd || 0) - Number(editing.used_usd || 0)).toFixed(2)}</p>
              </div>
              {error && (
                <div className="alert alert-error text-sm py-2">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2 border-t border-base-300">
                <button onClick={() => setEditing(null)} className="btn btn-ghost btn-sm">Cancelar</button>
                <button onClick={handleSave} disabled={saving} className="btn btn-primary btn-sm gap-1">
                  {saving ? <span className="loading loading-spinner loading-xs" /> : <Check className="w-4 h-4" />}
                  Guardar
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setEditing(null)} />
        </div>
      )}
    </div>
  );
}
