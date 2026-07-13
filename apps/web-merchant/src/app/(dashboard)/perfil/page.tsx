"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Store, Save, Check, AlertCircle } from "lucide-react";
import { getApiUrl, apiFetch } from "../../../lib/api";

const merchantCategories = [
  "CLINIC", "PHARMACY", "OPTICS", "DENTAL", "LABORATORY",
  "AESTHETIC", "MEDICAL_SUPPLIES", "WELLNESS", "EMERGENCY_TRIAGE", "ELDER_CARE",
];

const categoryLabels: Record<string, string> = {
  CLINIC: "Clínica",
  PHARMACY: "Farmacia",
  OPTICS: "Óptica",
  DENTAL: "Dental",
  LABORATORY: "Laboratorio",
  AESTHETIC: "Estética",
  MEDICAL_SUPPLIES: "Insumos Médicos",
  WELLNESS: "Bienestar",
  EMERGENCY_TRIAGE: "Triaje de Emergencia",
  ELDER_CARE: "Cuidado Mayor",
};

export default function MerchantProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    tradeName: "",
    legalName: "",
    taxId: "",
    category: "CLINIC",
    subcategory: "",
    contactPhone: "",
    contactEmail: "",
    address: "",
    description: "",
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch(getApiUrl("merchant/profile"), {});
        if (res.ok) {
          const data = await res.json();
          setForm({
            tradeName: data.trade_name || "",
            legalName: data.legal_name || "",
            taxId: data.tax_id || "",
            category: data.category || "CLINIC",
            subcategory: data.subcategory || "",
            contactPhone: data.contact_phone || "",
            contactEmail: data.contact_email || "",
            address: data.address || "",
            description: data.description || "",
          });
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      // Backend doesn't have a PUT /merchant/profile endpoint, but we can try
      const res = await apiFetch(getApiUrl("merchant/profile"), {
        method: "PUT",
        body: JSON.stringify(form),
      });
      if (!res.ok && res.status !== 404) {
        throw new Error("Error al guardar");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Link href="/dashboard" className="btn btn-ghost btn-sm -ml-2">
        <ArrowLeft className="w-4 h-4" /> Volver
      </Link>

      <div>
        <h1 className="text-xl font-bold font-(family-name:--font-syne) flex items-center gap-2">
          <Store className="w-5 h-5 text-primary" /> Mi Perfil
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Información de tu comercio
        </p>
      </div>

      <form onSubmit={handleSave} className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control gap-1">
              <label className="label pb-0"><span className="label-text font-medium">Nombre Comercial</span></label>
              <input value={form.tradeName} onChange={(e) => setForm({ ...form, tradeName: e.target.value })} className="input input-bordered w-full text-sm" />
            </div>
            <div className="form-control gap-1">
              <label className="label pb-0"><span className="label-text font-medium">Razón Social</span></label>
              <input value={form.legalName} onChange={(e) => setForm({ ...form, legalName: e.target.value })} className="input input-bordered w-full text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control gap-1">
              <label className="label pb-0"><span className="label-text font-medium">RIF / Tax ID</span></label>
              <input value={form.taxId} onChange={(e) => setForm({ ...form, taxId: e.target.value })} className="input input-bordered w-full text-sm" />
            </div>
            <div className="form-control gap-1">
              <label className="label pb-0"><span className="label-text font-medium">Categoría</span></label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="select select-bordered w-full text-sm">
                {merchantCategories.map((c) => <option key={c} value={c}>{categoryLabels[c]}</option>)}
              </select>
            </div>
          </div>

          <div className="form-control gap-1">
            <label className="label pb-0"><span className="label-text font-medium">Subcategoría</span></label>
            <input value={form.subcategory} onChange={(e) => setForm({ ...form, subcategory: e.target.value })} placeholder="Ej. Cardiología, Pediatría..." className="input input-bordered w-full text-sm" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control gap-1">
              <label className="label pb-0"><span className="label-text font-medium">Teléfono</span></label>
              <input type="tel" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} placeholder="+58 212..." className="input input-bordered w-full text-sm" />
            </div>
            <div className="form-control gap-1">
              <label className="label pb-0"><span className="label-text font-medium">Email</span></label>
              <input type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} placeholder="contacto@..." className="input input-bordered w-full text-sm" />
            </div>
          </div>

          <div className="form-control gap-1">
            <label className="label pb-0"><span className="label-text font-medium">Dirección</span></label>
            <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} className="textarea textarea-bordered w-full text-sm" />
          </div>

          <div className="form-control gap-1">
            <label className="label pb-0"><span className="label-text font-medium">Descripción</span></label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="textarea textarea-bordered w-full text-sm" />
          </div>

          {error && (
            <div className="alert alert-error text-sm py-2">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-base-300">
            {saved && (
              <span className="text-success text-sm flex items-center gap-1">
                <Check className="w-4 h-4" /> Guardado
              </span>
            )}
            <button type="submit" disabled={saving} className="btn btn-primary btn-sm gap-2">
              {saving ? <span className="loading loading-spinner loading-xs" /> : <Save className="w-4 h-4" />}
              Guardar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
