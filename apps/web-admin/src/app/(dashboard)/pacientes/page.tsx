"use client";

import { useState } from "react";
import { Users, CheckCircle2, XCircle } from "lucide-react";
import { useFetchData } from "../../../hooks/useFetchData";
import { getApiUrl, getAuthHeaders } from "../../../lib/api";

export default function PacientesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { data, loading } = useFetchData<any>(getApiUrl("admin/users?size=50"), [refreshTrigger]);
  
  // Modal state
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [patientForm, setPatientForm] = useState({ firstName: "", lastName: "", email: "", phone: "", identityDocument: "", password: "" });
  const [patientLoading, setPatientLoading] = useState(false);
  const [patientError, setPatientError] = useState<string | null>(null);
  const [patientSuccess, setPatientSuccess] = useState(false);

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setPatientError(null);
    setPatientLoading(true);
    try {
      const res = await fetch(getApiUrl("admin/users"), {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(patientForm),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message ?? `Error ${res.status}`);
      }
      setPatientSuccess(true);
      setRefreshTrigger(v => v + 1);
      setTimeout(() => {
        setIsAddPatientOpen(false);
        setPatientSuccess(false);
        setPatientForm({ firstName: "", lastName: "", email: "", phone: "", identityDocument: "", password: "" });
      }, 1500);
    } catch (err: unknown) {
      setPatientError(err instanceof Error ? err.message : "Error al crear paciente");
    } finally {
      setPatientLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Cargando pacientes...</div>;

  const users = data?.content || [];
  const filtered = users.filter(
    (p: any) =>
      p.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.identityDocument?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="opacity-60 text-sm">{filtered.length} pacientes encontrados</p>
        <div className="relative hidden sm:block mr-2">
          <input type="search" placeholder="Buscar pacientes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-4 pr-4 py-2 bg-muted rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary w-52 transition-all" />
        </div>
        <button className="btn btn-primary btn-sm gap-2" onClick={() => setIsAddPatientOpen(true)}>
          <Users className="w-4 h-4" /> Agregar Paciente
        </button>
      </div>
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-16 opacity-40">
              <Users className="w-10 h-10 mx-auto mb-3" />
              <p className="font-medium">Sin resultados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-sm w-full">
                <thead>
                  <tr className="border-base-300">
                    <th>Documento</th>
                    <th>Paciente</th>
                    <th>Nivel</th>
                    <th>Teléfono</th>
                    <th>Estado Cuenta</th>
                    <th className="text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p: any) => (
                    <tr key={p.id} className="hover:bg-base-200/40 transition-colors cursor-pointer border-base-300/60">
                      <td className="opacity-60 font-mono text-xs">{p.identityDocument}</td>
                      <td className="font-medium">{p.fullName}</td>
                      <td>
                        <span className="badge badge-sm badge-primary badge-outline">Nv. {p.level}</span>
                      </td>
                      <td>{p.phone}</td>
                      <td>
                        <span className={`badge badge-sm ${p.active ? "badge-primary" : "badge-ghost"}`}>
                          {p.active ? "Activo" : "Pausado"}
                        </span>
                      </td>
                      <td className="text-right space-x-2">
                        {!p.active && (
                          <button className="btn btn-xs btn-outline" onClick={async () => {
                            try {
                              const res = await fetch(getApiUrl(`admin/users/${p.id}/status?activate=true`), {
                                method: 'POST',
                                headers: getAuthHeaders(),
                              });
                              if (res.ok) setRefreshTrigger(prev => prev + 1);
                            } catch (e) { console.error(e); }
                          }}>Activar</button>
                        )}
                        {p.active && (
                          <button className="btn btn-xs btn-error" onClick={async () => {
                            try {
                              const res = await fetch(getApiUrl(`admin/users/${p.id}/status?activate=false`), {
                                method: 'POST',
                                headers: getAuthHeaders(),
                              });
                              if (res.ok) setRefreshTrigger(prev => prev + 1);
                            } catch (e) { console.error(e); }
                          }}>Pausar</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Agregar Paciente */}
      {isAddPatientOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md p-6">
            <h3 className="font-bold text-lg font-(family-name:--font-syne)">Agregar Paciente</h3>
            <p className="text-sm opacity-60 mb-4">Crea una cuenta de paciente y asigna una línea de crédito inicial.</p>
            {patientSuccess ? (
              <div className="flex flex-col items-center py-8 gap-3 text-success">
                <CheckCircle2 className="w-12 h-12" />
                <p className="font-semibold">Paciente creado exitosamente</p>
              </div>
            ) : (
              <form onSubmit={handleAddPatient} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control gap-1">
                    <label htmlFor="firstName" className="label pb-0"><span className="label-text font-medium">Nombre</span></label>
                    <input id="firstName" className="input input-bordered w-full" required value={patientForm.firstName} onChange={(e) => setPatientForm({ ...patientForm, firstName: e.target.value })} />
                  </div>
                  <div className="form-control gap-1">
                    <label htmlFor="lastName" className="label pb-0"><span className="label-text font-medium">Apellido</span></label>
                    <input id="lastName" className="input input-bordered w-full" required value={patientForm.lastName} onChange={(e) => setPatientForm({ ...patientForm, lastName: e.target.value })} />
                  </div>
                </div>
                <div className="form-control gap-1">
                  <label htmlFor="identityDocument" className="label pb-0"><span className="label-text font-medium">Cédula</span></label>
                  <input id="identityDocument" className="input input-bordered w-full" required value={patientForm.identityDocument} onChange={(e) => setPatientForm({ ...patientForm, identityDocument: e.target.value })} />
                </div>
                <div className="form-control gap-1">
                  <label htmlFor="patEmail" className="label pb-0"><span className="label-text font-medium">Correo Electrónico</span></label>
                  <input id="patEmail" type="email" className="input input-bordered w-full" required value={patientForm.email} onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control gap-1">
                    <label htmlFor="phone" className="label pb-0"><span className="label-text font-medium">Teléfono</span></label>
                    <input id="phone" type="tel" className="input input-bordered w-full" required value={patientForm.phone} onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })} />
                  </div>
                  <div className="form-control gap-1">
                    <label htmlFor="patPassword" className="label pb-0"><span className="label-text font-medium">Contraseña</span></label>
                    <input id="patPassword" type="password" className="input input-bordered w-full" required value={patientForm.password} onChange={(e) => setPatientForm({ ...patientForm, password: e.target.value })} />
                  </div>
                </div>
                {patientError && (
                  <div role="alert" className="alert alert-error text-sm">
                    <XCircle className="w-4 h-4 shrink-0" />
                    <p>{patientError}</p>
                  </div>
                )}
                <div className="flex justify-end gap-3 pt-4 border-t border-base-300">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsAddPatientOpen(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={patientLoading}>
                    {patientLoading && <span className="loading loading-spinner loading-xs" />}
                    Crear Paciente
                  </button>
                </div>
              </form>
            )}
          </div>
          <div className="modal-backdrop" onClick={() => { setIsAddPatientOpen(false); setPatientError(null); setPatientSuccess(false); }} />
        </div>
      )}
    </div>
  );
}
