"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Pill, Plus, Trash2, Clock, Bell, X, AlertCircle } from "lucide-react";
import { getApiUrl, apiFetch } from "../../../lib/api";

const frequencyConfig: Record<string, string> = {
  DAILY: "Diario",
  TWICE_DAILY: "2x al día",
  THREE_TIMES_DAY: "3x al día",
  WEEKLY: "Semanal",
  AS_NEEDED: "Según necesidad",
};

export default function MedicationRemindersPage() {
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    medicationName: "",
    dosage: "",
    frequency: "DAILY",
    times: ["08:00"],
    endDate: "",
    notes: "",
  });

  const fetchReminders = async () => {
    try {
      const res = await apiFetch(getApiUrl("patient/medication-reminders"));
      if (res.ok) {
        const data = await res.json();
        setReminders(data.reminders || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReminders(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.medicationName) {
      setError("El nombre del medicamento es obligatorio");
      return;
    }
    setSaving(true);
    try {
      const res = await apiFetch(getApiUrl("patient/medication-reminders"), {
        method: "POST",
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Error al crear recordatorio");
      setShowAdd(false);
      setForm({ medicationName: "", dosage: "", frequency: "DAILY", times: ["08:00"], endDate: "", notes: "" });
      fetchReminders();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este recordatorio?")) return;
    try {
      await apiFetch(getApiUrl(`patient/medication-reminders/${id}`), {
        method: "DELETE",
      });
      fetchReminders();
    } catch {
      // ignore
    }
  };

  const updateTime = (idx: number, value: string) => {
    const newTimes = [...form.times];
    newTimes[idx] = value;
    setForm({ ...form, times: newTimes });
  };

  const addTime = () => setForm({ ...form, times: [...form.times, "20:00"] });
  const removeTime = (idx: number) => setForm({ ...form, times: form.times.filter((_, i) => i !== idx) });

  return (
    <div className="space-y-6">
      <Link href="/dashboard" className="btn btn-ghost btn-sm -ml-2">
        <ArrowLeft className="w-4 h-4" /> Volver
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground font-display flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" /> Recordatorios
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Medicación recurrente y recordatorios
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn btn-primary btn-sm gap-2">
          <Plus className="w-4 h-4" /> Nuevo
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner text-primary" />
        </div>
      ) : reminders.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Pill className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No tienes recordatorios activos</p>
          <p className="text-xs mt-1">Agrega tu medicación recurrente</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reminders.map((r) => (
            <div key={r.id} className="card bg-base-100 border border-base-300 shadow-sm">
              <div className="card-body p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Pill className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold font-display">{r.medication_name}</h3>
                      {r.dosage && <p className="text-xs text-muted-foreground">{r.dosage}</p>}
                    </div>
                  </div>
                  <button onClick={() => handleDelete(r.id)} className="btn btn-ghost btn-xs text-error">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <span className="badge badge-sm badge-outline">{frequencyConfig[r.frequency] || r.frequency}</span>
                  {(r.times || []).map((t: string, i: number) => (
                    <span key={i} className="badge badge-sm badge-primary gap-1">
                      <Clock className="w-3 h-3" /> {String(t).slice(0, 5)}
                    </span>
                  ))}
                </div>
                {r.notes && <p className="text-xs text-muted-foreground pt-1">{r.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add modal */}
      {showAdd && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <h3 className="text-lg font-bold font-display">Nuevo Recordatorio</h3>
            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div className="form-control gap-1">
                <label className="label pb-0"><span className="label-text font-medium">Medicamento</span></label>
                <input value={form.medicationName} onChange={(e) => setForm({ ...form, medicationName: e.target.value })} placeholder="Ej: Metformina 500mg" className="input input-bordered w-full text-sm" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control gap-1">
                  <label className="label pb-0"><span className="label-text font-medium">Dosis</span></label>
                  <input value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} placeholder="1 tableta" className="input input-bordered w-full text-sm" />
                </div>
                <div className="form-control gap-1">
                  <label className="label pb-0"><span className="label-text font-medium">Frecuencia</span></label>
                  <select value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} className="select select-bordered w-full text-sm">
                    {Object.entries(frequencyConfig).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-control gap-1">
                <label className="label pb-0"><span className="label-text font-medium">Horarios</span></label>
                <div className="space-y-2">
                  {form.times.map((t, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input type="time" value={t} onChange={(e) => updateTime(i, e.target.value)} className="input input-bordered flex-1 text-sm" />
                      {form.times.length > 1 && (
                        <button type="button" onClick={() => removeTime(i)} className="btn btn-ghost btn-xs text-error">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={addTime} className="btn btn-outline btn-xs">+ Agregar horario</button>
                </div>
              </div>
              <div className="form-control gap-1">
                <label className="label pb-0"><span className="label-text font-medium">Fecha fin (opcional)</span></label>
                <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="input input-bordered w-full text-sm" />
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
                  {saving && <span className="loading loading-spinner loading-xs" />} Guardar
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
