"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarPlus, Calendar, Clock, Store, X, CheckCircle2, AlertCircle } from "lucide-react";
import { getApiUrl, apiFetch } from "../../../lib/api";
import { formatDate } from "../../../lib/utils";

const statusConfig: Record<string, { label: string; badge: string }> = {
  PENDING: { label: "Pendiente", badge: "badge-warning" },
  CONFIRMED: { label: "Confirmada", badge: "badge-info" },
  COMPLETED: { label: "Completada", badge: "badge-success" },
  CANCELLED: { label: "Cancelada", badge: "badge-ghost" },
  NO_SHOW: { label: "No asistió", badge: "badge-error" },
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [merchants, setMerchants] = useState<any[]>([]);
  const [merchantServices, setMerchantServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    merchantId: "",
    serviceId: "",
    appointmentDate: "",
    appointmentTime: "09:00",
    durationMin: 30,
    notes: "",
  });

  const fetchAppointments = async () => {
    try {
      const res = await apiFetch(getApiUrl("patient/appointments?limit=50&offset=0"));
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const fetchMerchants = async () => {
    try {
      const res = await apiFetch(getApiUrl("patient/merchants"));
      if (res.ok) setMerchants(await res.json());
    } catch {
      // ignore
    }
  };

  const fetchServices = async (merchantId: string) => {
    if (!merchantId) { setMerchantServices([]); return; }
    try {
      const res = await apiFetch(getApiUrl(`patient/merchants/${merchantId}/services`));
      if (res.ok) setMerchantServices(await res.json());
    } catch {
      setMerchantServices([]);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  useEffect(() => {
    if (showAdd) fetchMerchants();
  }, [showAdd]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.merchantId || !form.appointmentDate || !form.appointmentTime) {
      setError("Comercio, fecha y hora son obligatorios");
      return;
    }
    setSaving(true);
    try {
      const res = await apiFetch(getApiUrl("patient/appointments"), {
        method: "POST",
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? "Error al agendar");
      }
      setShowAdd(false);
      setForm({ merchantId: "", serviceId: "", appointmentDate: "", appointmentTime: "09:00", durationMin: 30, notes: "" });
      fetchAppointments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("¿Cancelar esta cita?")) return;
    try {
      await apiFetch(getApiUrl(`patient/appointments/${id}`), {
        method: "DELETE",
      });
      fetchAppointments();
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      <Link href="/dashboard" className="btn btn-ghost btn-sm -ml-2">
        <ArrowLeft className="w-4 h-4" /> Volver
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground font-display flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" /> Citas Médicas
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Agenda consultas con comercios aliados
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn btn-primary btn-sm gap-2">
          <CalendarPlus className="w-4 h-4" /> Agendar
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner text-primary" />
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No tienes citas agendadas</p>
          <p className="text-xs mt-1">Agenda tu primera consulta</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((a) => {
            const cfg = statusConfig[a.status] || statusConfig.PENDING;
            return (
              <div key={a.id} className="card bg-base-100 border border-base-300 shadow-sm">
                <div className="card-body p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Store className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold font-display">{a.merchant_name || "Comercio"}</h3>
                        {a.service_name && <p className="text-xs text-muted-foreground">{a.service_name}</p>}
                      </div>
                    </div>
                    <span className={`badge badge-sm ${cfg.badge}`}>{cfg.label}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {formatDate(a.appointment_date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {String(a.appointment_time).slice(0, 5)}
                    </span>
                    <span>{a.duration_min} min</span>
                  </div>
                  {a.notes && <p className="text-xs text-muted-foreground pt-1">{a.notes}</p>}
                  {(a.status === "PENDING" || a.status === "CONFIRMED") && (
                    <button onClick={() => handleCancel(a.id)} className="btn btn-ghost btn-xs text-error btn-sm w-fit">
                      <X className="w-3.5 h-3.5" /> Cancelar
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <h3 className="text-lg font-bold font-display">Agendar Cita</h3>
            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div className="form-control gap-1">
                <label className="label pb-0"><span className="label-text font-medium">Comercio</span></label>
                <select
                  value={form.merchantId}
                  onChange={(e) => {
                    setForm({ ...form, merchantId: e.target.value, serviceId: "" });
                    fetchServices(e.target.value);
                  }}
                  className="select select-bordered w-full text-sm"
                  required
                >
                  <option value="">Seleccionar...</option>
                  {merchants.map((m: any) => <option key={m.id} value={m.id}>{m.trade_name}</option>)}
                </select>
              </div>
              {merchantServices.length > 0 && (
                <div className="form-control gap-1">
                  <label className="label pb-0"><span className="label-text font-medium">Servicio (opcional)</span></label>
                  <select
                    value={form.serviceId}
                    onChange={(e) => setForm({ ...form, serviceId: e.target.value })}
                    className="select select-bordered w-full text-sm"
                  >
                    <option value="">Sin servicio específico</option>
                    {merchantServices.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control gap-1">
                  <label className="label pb-0"><span className="label-text font-medium">Fecha</span></label>
                  <input type="date" value={form.appointmentDate} onChange={(e) => setForm({ ...form, appointmentDate: e.target.value })} className="input input-bordered w-full text-sm" required />
                </div>
                <div className="form-control gap-1">
                  <label className="label pb-0"><span className="label-text font-medium">Hora</span></label>
                  <input type="time" value={form.appointmentTime} onChange={(e) => setForm({ ...form, appointmentTime: e.target.value })} className="input input-bordered w-full text-sm" required />
                </div>
              </div>
              <div className="form-control gap-1">
                <label className="label pb-0"><span className="label-text font-medium">Duración (min)</span></label>
                <input type="number" value={form.durationMin} onChange={(e) => setForm({ ...form, durationMin: parseInt(e.target.value) || 30 })} className="input input-bordered w-full text-sm" />
              </div>
              <div className="form-control gap-1">
                <label className="label pb-0"><span className="label-text font-medium">Notas</span></label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="textarea textarea-bordered w-full text-sm" />
              </div>
              {error && (
                <div className="alert alert-error text-sm py-2">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2 border-t border-base-300">
                <button type="button" onClick={() => setShowAdd(false)} className="btn btn-ghost btn-sm">Cancelar</button>
                <button type="submit" disabled={saving} className="btn btn-primary btn-sm">
                  {saving && <span className="loading loading-spinner loading-xs" />} Agendar
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={() => setShowAdd(false)} />
        </div>
      )}
    </div>
  );
}
