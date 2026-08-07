"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Plus, Trash2, Stethoscope, FlaskConical, Syringe, Pill, Smile, Eye } from "lucide-react";
import { getApiUrl, apiFetch } from "../../../lib/api";
import { formatDate } from "../../../lib/utils";
import { useTranslations } from "next-intl";
import type { MedicalRecord } from "../../../types/patient";

const recordTypeConfig: Record<string, { labelKey: string; icon: React.ElementType; color: string }> = {
  CONSULTATION: { labelKey: "typeConsultation", icon: Stethoscope, color: "primary" },
  LAB_RESULT: { labelKey: "typeLabResult", icon: FlaskConical, color: "info" },
  PROCEDURE: { labelKey: "typeProcedure", icon: Syringe, color: "secondary" },
  DENTAL: { labelKey: "typeDental", icon: Smile, color: "accent" },
  VACCINATION: { labelKey: "typeVaccination", icon: Eye, color: "success" },
  PRESCRIPTION: { labelKey: "typePrescription", icon: Pill, color: "warning" },
  OTHER: { labelKey: "typeOther", icon: FileText, color: "ghost" },
};

export default function MedicalRecordsPage() {
  const t = useTranslations("History");
  const tCommon = useTranslations("Common");
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const [form, setForm] = useState({
    recordType: "CONSULTATION",
    diagnosis: "",
    prescription: "",
    doctorName: "",
    notes: "",
    recordDate: new Date().toISOString().split("T")[0],
  });

  const fetchRecords = async () => {
    try {
      const res = await apiFetch(getApiUrl("patient/medical-records?limit=50&offset=0"));
      if (res.ok) {
        const data = await res.json();
        setRecords(data.records || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRecords(); }, []);

  const displayed = filterType ? records.filter((r) => r.record_type === filterType) : records;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.diagnosis.trim()) {
      setFormError("El diagnóstico es obligatorio");
      return;
    }
    setFormError(null);
    setSaving(true);
    try {
      const res = await apiFetch(getApiUrl("patient/medical-records"), {
        method: "POST",
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowAdd(false);
        setForm({ recordType: "CONSULTATION", diagnosis: "", prescription: "", doctorName: "", notes: "", recordDate: new Date().toISOString().split("T")[0] });
        fetchRecords();
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => setDeleteId(id);

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await apiFetch(getApiUrl(`patient/medical-records/${deleteId}`), { method: "DELETE" });
      fetchRecords();
    } catch {
      // ignore
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Link href="/dashboard" className="btn btn-ghost btn-sm -ml-2">
        <ArrowLeft className="w-4 h-4" /> {tCommon("back")}
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground font-display flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" /> {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("subtitle")}
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn btn-primary btn-sm gap-2">
          <Plus className="w-4 h-4" /> {t("newRecord")}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner text-primary" />
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">{t("noRecords")}</p>
          <p className="text-xs mt-1">{t("addFirst")}</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setFilterType("")} className={`btn btn-xs ${filterType === "" ? "btn-primary" : "btn-outline"}`}>Todos</button>
            {Object.entries(recordTypeConfig).map(([k, v]) => (
              <button key={k} onClick={() => setFilterType(k)} className={`btn btn-xs ${filterType === k ? "btn-primary" : "btn-outline"}`}>{t(v.labelKey)}</button>
            ))}
          </div>
          {displayed.map((r) => {
            const cfg = recordTypeConfig[r.record_type] || recordTypeConfig.OTHER;
            const Icon = cfg.icon;
            return (
              <div key={r.id} className="card bg-base-100 border border-base-300 shadow-sm">
                <div className="card-body p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-${cfg.color}/10`}>
                        <Icon className={`w-4 h-4 text-${cfg.color}`} />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold font-display">{t(cfg.labelKey)}</h3>
                        <p className="text-xs text-muted-foreground">{formatDate(r.record_date)}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(r.id)} className="btn btn-ghost btn-xs text-error">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {r.doctor_name && (
                    <p className="text-xs text-muted-foreground">{t("doctorPrefix", { name: r.doctor_name })}</p>
                  )}
                  {r.diagnosis && (
                    <div className="pt-1">
                      <p className="text-xs font-semibold text-foreground">{t("diagnosis")}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{r.diagnosis}</p>
                    </div>
                  )}
                  {r.prescription && (
                    <div className="pt-1">
                      <p className="text-xs font-semibold text-foreground">{t("prescription")}</p>
                      <p className="text-sm text-muted-foreground mt-0.5 whitespace-pre-wrap">{r.prescription}</p>
                    </div>
                  )}
                  {r.notes && (
                    <div className="pt-1">
                      <p className="text-xs font-semibold text-foreground">{tCommon("notes")}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{r.notes}</p>
                    </div>
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
          <div className="modal-box w-full max-w-md mx-2">
            <h3 className="text-lg font-bold font-display">{t("newRecordTitle")}</h3>
            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-control gap-1">
                  <label className="label pb-0"><span className="label-text font-medium">{t("type")}</span></label>
                  <select value={form.recordType} onChange={(e) => setForm({ ...form, recordType: e.target.value })} className="select select-bordered w-full text-sm">
                    {Object.entries(recordTypeConfig).map(([k, v]) => <option key={k} value={k}>{t(v.labelKey)}</option>)}
                  </select>
                </div>
                <div className="form-control gap-1">
                  <label className="label pb-0"><span className="label-text font-medium">{tCommon("date")}</span></label>
                  <input type="date" value={form.recordDate} onChange={(e) => setForm({ ...form, recordDate: e.target.value })} className="input input-bordered w-full text-sm" />
                </div>
              </div>
              <div className="form-control gap-1">
                <label className="label pb-0"><span className="label-text font-medium">{t("doctor")}</span></label>
                <input value={form.doctorName} onChange={(e) => setForm({ ...form, doctorName: e.target.value })} placeholder={t("doctorPlaceholder")} className="input input-bordered w-full text-sm" />
              </div>
              <div className="form-control gap-1">
                <label className="label pb-0"><span className="label-text font-medium">{t("diagnosis")}</span></label>
                <textarea value={form.diagnosis} onChange={(e) => { setForm({ ...form, diagnosis: e.target.value }); setFormError(null); }} rows={2} className={`textarea textarea-bordered w-full text-sm${formError ? " textarea-error" : ""}`} />
                {formError && <p className="text-xs text-error mt-1">{formError}</p>}
              </div>
              <div className="form-control gap-1">
                <label className="label pb-0"><span className="label-text font-medium">{t("prescription")}</span></label>
                <textarea value={form.prescription} onChange={(e) => setForm({ ...form, prescription: e.target.value })} rows={2} className="textarea textarea-bordered w-full text-sm" />
              </div>
              <div className="form-control gap-1">
                <label className="label pb-0"><span className="label-text font-medium">{tCommon("notes")}</span></label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="textarea textarea-bordered w-full text-sm" />
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-base-300">
                <button type="button" onClick={() => setShowAdd(false)} className="btn btn-ghost btn-sm">{tCommon("cancel")}</button>
                <button type="submit" disabled={saving} className="btn btn-primary btn-sm">
                  {saving && <span className="loading loading-spinner loading-xs" />} {tCommon("save")}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={() => setShowAdd(false)} />
        </div>
      )}

      {deleteId && (
        <div className="modal modal-open" role="dialog" aria-modal="true">
          <div className="modal-box max-w-sm">
            <p className="font-semibold text-sm">{t("deleteConfirm")}</p>
            <div className="modal-action">
              <button onClick={() => setDeleteId(null)} className="btn btn-ghost btn-sm">{tCommon("cancel")}</button>
              <button onClick={confirmDelete} className="btn btn-error btn-sm">
                <Trash2 className="w-3.5 h-3.5" /> Eliminar
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setDeleteId(null)} />
        </div>
      )}
    </div>
  );
}
