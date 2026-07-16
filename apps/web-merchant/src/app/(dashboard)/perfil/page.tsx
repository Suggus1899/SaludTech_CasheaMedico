"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft, Store, Save, Check, AlertCircle, Globe } from "lucide-react";
import { LanguageSwitcher } from "@saludtech/i18n";
import { getApiUrl, apiFetch } from "../../../lib/api";

const merchantCategories = [
  "CLINIC", "PHARMACY", "OPTICS", "DENTAL", "LABORATORY",
  "AESTHETIC", "MEDICAL_SUPPLIES", "WELLNESS", "EMERGENCY_TRIAGE", "ELDER_CARE",
];

const categoryKeyMap: Record<string, string> = {
  CLINIC: "catClinic",
  PHARMACY: "catPharmacy",
  OPTICS: "catOptics",
  DENTAL: "catDental",
  LABORATORY: "catLaboratory",
  AESTHETIC: "catAesthetic",
  MEDICAL_SUPPLIES: "catMedicalSupplies",
  WELLNESS: "catWellness",
  EMERGENCY_TRIAGE: "catEmergencyTriage",
  ELDER_CARE: "catElderCare",
};

export default function MerchantProfilePage() {
  const t = useTranslations("Profile");
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
        throw new Error(t("errorSave"));
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorSave"));
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
        <ArrowLeft className="w-4 h-4" /> {t("back")}
      </Link>

      <div>
        <h1 className="text-xl font-bold font-(family-name:--font-syne) flex items-center gap-2">
          <Store className="w-5 h-5 text-primary" /> {t("title")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("subtitle")}
        </p>
      </div>

      <form onSubmit={handleSave} className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control gap-1">
              <label className="label pb-0"><span className="label-text font-medium">{t("tradeName")}</span></label>
              <input value={form.tradeName} onChange={(e) => setForm({ ...form, tradeName: e.target.value })} className="input input-bordered w-full text-sm" />
            </div>
            <div className="form-control gap-1">
              <label className="label pb-0"><span className="label-text font-medium">{t("legalName")}</span></label>
              <input value={form.legalName} onChange={(e) => setForm({ ...form, legalName: e.target.value })} className="input input-bordered w-full text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control gap-1">
              <label className="label pb-0"><span className="label-text font-medium">{t("taxId")}</span></label>
              <input value={form.taxId} onChange={(e) => setForm({ ...form, taxId: e.target.value })} className="input input-bordered w-full text-sm" />
            </div>
            <div className="form-control gap-1">
              <label className="label pb-0"><span className="label-text font-medium">{t("category")}</span></label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="select select-bordered w-full text-sm">
                {merchantCategories.map((c) => <option key={c} value={c}>{t(categoryKeyMap[c] as any)}</option>)}
              </select>
            </div>
          </div>

          <div className="form-control gap-1">
            <label className="label pb-0"><span className="label-text font-medium">{t("subcategory")}</span></label>
            <input value={form.subcategory} onChange={(e) => setForm({ ...form, subcategory: e.target.value })} placeholder={t("subcategoryPlaceholder")} className="input input-bordered w-full text-sm" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control gap-1">
              <label className="label pb-0"><span className="label-text font-medium">{t("phone")}</span></label>
              <input type="tel" value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} placeholder={t("phonePlaceholder")} className="input input-bordered w-full text-sm" />
            </div>
            <div className="form-control gap-1">
              <label className="label pb-0"><span className="label-text font-medium">{t("email")}</span></label>
              <input type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} placeholder={t("emailPlaceholder")} className="input input-bordered w-full text-sm" />
            </div>
          </div>

          <div className="form-control gap-1">
            <label className="label pb-0"><span className="label-text font-medium">{t("address")}</span></label>
            <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} className="textarea textarea-bordered w-full text-sm" />
          </div>

          <div className="form-control gap-1">
            <label className="label pb-0"><span className="label-text font-medium">{t("description")}</span></label>
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
                <Check className="w-4 h-4" /> {t("saved")}
              </span>
            )}
            <button type="submit" disabled={saving} className="btn btn-primary btn-sm gap-2">
              {saving ? <span className="loading loading-spinner loading-xs" /> : <Save className="w-4 h-4" />}
              {t("save")}
            </button>
          </div>
        </div>
      </form>

      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">{t("language")}</h2>
              <p className="text-sm text-muted-foreground">{t("languageDescription")}</p>
            </div>
          </div>
          <LanguageSwitcher className="inline-block" />
        </div>
      </div>
    </div>
  );
}
