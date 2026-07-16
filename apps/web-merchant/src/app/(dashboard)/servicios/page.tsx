"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft, Stethoscope, Plus, Trash2, Pencil, X, AlertCircle, Check } from "lucide-react";
import { getApiUrl, apiFetch } from "../../../lib/api";
import { Service, ServicesResponse } from "../../../types/merchant";

const categories = [
  "CONSULTATION", "PROCEDURE", "DENTAL", "LABORATORY",
  "IMAGING", "THERAPY", "VACCINATION", "OTHER",
];

const categoryKeyMap: Record<string, string> = {
  CONSULTATION: "catConsultation",
  PROCEDURE: "catProcedure",
  DENTAL: "catDental",
  LABORATORY: "catLaboratory",
  IMAGING: "catImaging",
  THERAPY: "catTherapy",
  VACCINATION: "catVaccination",
  OTHER: "catOther",
};

export default function MerchantServicesPage() {
  const t = useTranslations("Services");
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "CONSULTATION",
    subcategory: "",
    priceUSD: "",
    durationMin: "30",
  });

  const fetchServices = async () => {
    try {
      const res = await apiFetch(getApiUrl("merchant/services"), {});
      if (res.ok) {
        const data = await res.json() as ServicesResponse;
        setServices(data.services || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  const resetForm = () => {
    setForm({ name: "", description: "", category: "CONSULTATION", subcategory: "", priceUSD: "", durationMin: "30" });
    setEditingId(null);
    setShowForm(false);
    setError(null);
  };

  const handleEdit = (s: Service) => {
    setEditingId(s.id);
    setForm({
      name: s.name || "",
      description: s.description || "",
      category: s.category || "CONSULTATION",
      subcategory: s.subcategory || "",
      priceUSD: s.price_usd ? String(s.price_usd) : "",
      durationMin: s.duration_min ? String(s.duration_min) : "30",
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name || !form.priceUSD) {
      setError(t("errorNamePrice"));
      return;
    }
    setSaving(true);
    try {
      const body = {
        name: form.name,
        description: form.description,
        category: form.category,
        subcategory: form.subcategory,
        priceUSD: parseFloat(form.priceUSD),
        durationMin: parseInt(form.durationMin) || 30,
        isActive: true,
      };
      const url = editingId
        ? getApiUrl(`merchant/services/${editingId}`)
        : getApiUrl("merchant/services");
      const method = editingId ? "PUT" : "POST";
      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(t("errorSave"));
      resetForm();
      fetchServices();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorSave"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("confirmDelete"))) return;
    try {
      await apiFetch(getApiUrl(`merchant/services/${id}`), {
        method: "DELETE",
      });
      fetchServices();
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      <Link href="/dashboard" className="btn btn-ghost btn-sm -ml-2">
        <ArrowLeft className="w-4 h-4" /> {t("back")}
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-(family-name:--font-syne) flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-primary" /> {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("subtitle")}
          </p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="btn btn-primary btn-sm gap-2">
          <Plus className="w-4 h-4" /> {t("new")}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner text-primary" />
        </div>
      ) : services.length === 0 && !showForm ? (
        <div className="text-center py-16 text-muted-foreground">
          <Stethoscope className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">{t("empty")}</p>
          <p className="text-xs mt-1">{t("emptyHint")}</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {services.map((s) => (
            <div key={s.id} className="card bg-base-100 border border-base-300 shadow-sm">
              <div className="card-body p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold font-(family-name:--font-syne)">{s.name}</h3>
                    <span className="badge badge-xs badge-outline mt-1">{categoryKeyMap[s.category] ? t(categoryKeyMap[s.category] as any) : s.category}</span>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(s)} className="btn btn-ghost btn-xs">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(s.id)} className="btn btn-ghost btn-xs text-error">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {s.description && <p className="text-xs text-muted-foreground">{s.description}</p>}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-lg font-bold text-primary">${Number(s.price_usd || 0).toFixed(2)}</span>
                  {s.duration_min > 0 && <span className="text-xs text-muted-foreground">{t("durationMin", { count: s.duration_min })}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md">
            <h3 className="text-lg font-bold font-(family-name:--font-syne)">
              {editingId ? t("editTitle") : t("newTitle")}
            </h3>
            <form onSubmit={handleSave} className="space-y-4 mt-4">
              <div className="form-control gap-1">
                <label className="label pb-0"><span className="label-text font-medium">{t("fieldName")}</span></label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder={t("fieldNamePlaceholder")} className="input input-bordered w-full text-sm" required />
              </div>
              <div className="form-control gap-1">
                <label className="label pb-0"><span className="label-text font-medium">{t("fieldDescription")}</span></label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="textarea textarea-bordered w-full text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control gap-1">
                  <label className="label pb-0"><span className="label-text font-medium">{t("fieldCategory")}</span></label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="select select-bordered w-full text-sm">
                    {categories.map((c) => <option key={c} value={c}>{t(categoryKeyMap[c] as any)}</option>)}
                  </select>
                </div>
                <div className="form-control gap-1">
                  <label className="label pb-0"><span className="label-text font-medium">{t("fieldSubcategory")}</span></label>
                  <input value={form.subcategory} onChange={(e) => setForm({ ...form, subcategory: e.target.value })} placeholder={t("fieldSubcategoryPlaceholder")} className="input input-bordered w-full text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control gap-1">
                  <label className="label pb-0"><span className="label-text font-medium">{t("fieldPrice")}</span></label>
                  <input type="number" step="0.01" min="0" value={form.priceUSD} onChange={(e) => setForm({ ...form, priceUSD: e.target.value })} placeholder="50.00" className="input input-bordered w-full text-sm" required />
                </div>
                <div className="form-control gap-1">
                  <label className="label pb-0"><span className="label-text font-medium">{t("fieldDuration")}</span></label>
                  <input type="number" min="1" value={form.durationMin} onChange={(e) => setForm({ ...form, durationMin: e.target.value })} className="input input-bordered w-full text-sm" />
                </div>
              </div>
              {error && (
                <div className="alert alert-error text-sm py-2">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2 border-t border-base-300">
                <button type="button" onClick={resetForm} className="btn btn-ghost btn-sm">{t("cancel")}</button>
                <button type="submit" disabled={saving} className="btn btn-primary btn-sm gap-1">
                  {saving ? <span className="loading loading-spinner loading-xs" /> : <Check className="w-4 h-4" />}
                  {editingId ? t("update") : t("create")}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={resetForm} />
        </div>
      )}
    </div>
  );
}
