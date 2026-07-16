"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft, Package, Plus, Trash2, Pencil, X, AlertCircle, Check, Pill } from "lucide-react";
import { getApiUrl, apiFetch } from "../../../lib/api";

const supplyCategories = [
  "MEDICATION", "MEDICAL_DEVICE", "PPE", "CONSUMABLE", "EQUIPMENT", "OTHER",
];

const categoryKeyMap: Record<string, string> = {
  MEDICATION: "catMedication",
  MEDICAL_DEVICE: "catMedicalDevice",
  PPE: "catPpe",
  CONSUMABLE: "catConsumable",
  EQUIPMENT: "catEquipment",
  OTHER: "catOther",
};

export default function MerchantSuppliesPage() {
  const t = useTranslations("Supplies");
  const [supplies, setSupplies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "MEDICATION",
    subcategory: "",
    priceUSD: "",
    unit: "unidad",
    stock: "0",
    minStock: "10",
    requiresPrescription: false,
  });

  const fetchSupplies = async () => {
    try {
      const res = await apiFetch(getApiUrl("merchant/supplies"), {});
      if (res.ok) {
        const data = await res.json();
        setSupplies(data.supplies || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSupplies(); }, []);

  const resetForm = () => {
    setForm({ name: "", description: "", category: "MEDICATION", subcategory: "", priceUSD: "", unit: "unidad", stock: "0", minStock: "10", requiresPrescription: false });
    setEditingId(null);
    setShowForm(false);
    setError(null);
  };

  const handleEdit = (s: any) => {
    setEditingId(s.id);
    setForm({
      name: s.name || "",
      description: s.description || "",
      category: s.category || "MEDICATION",
      subcategory: s.subcategory || "",
      priceUSD: s.price_usd ? String(s.price_usd) : "",
      unit: s.unit || "unidad",
      stock: s.stock != null ? String(s.stock) : "0",
      minStock: s.min_stock != null ? String(s.min_stock) : "10",
      requiresPrescription: !!s.requires_prescription,
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
        unit: form.unit,
        stock: parseInt(form.stock) || 0,
        minStock: parseInt(form.minStock) || 10,
        requiresPrescription: form.requiresPrescription,
        isActive: true,
      };
      const url = editingId
        ? getApiUrl(`merchant/supplies/${editingId}`)
        : getApiUrl("merchant/supplies");
      const method = editingId ? "PUT" : "POST";
      const res = await apiFetch(url, {
        method,
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(t("errorSave"));
      resetForm();
      fetchSupplies();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("errorSave"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("confirmDelete"))) return;
    try {
      await apiFetch(getApiUrl(`merchant/supplies/${id}`), {
        method: "DELETE",
      });
      fetchSupplies();
    } catch {
      // ignore
    }
  };

  const lowStock = (s: any) => s.stock <= (s.min_stock || 0);

  return (
    <div className="space-y-6">
      <Link href="/dashboard" className="btn btn-ghost btn-sm -ml-2">
        <ArrowLeft className="w-4 h-4" /> {t("back")}
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold font-(family-name:--font-syne) flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" /> {t("title")}
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
      ) : supplies.length === 0 && !showForm ? (
        <div className="text-center py-16 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">{t("empty")}</p>
          <p className="text-xs mt-1">{t("emptyHint")}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-sm w-full">
            <thead>
              <tr className="border-base-300">
                <th>{t("colName")}</th>
                <th>{t("colCategory")}</th>
                <th className="text-right">{t("colPrice")}</th>
                <th className="text-center">{t("colStock")}</th>
                <th>{t("colPrescription")}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {supplies.map((s) => (
                <tr key={s.id} className="hover:bg-base-200/40 border-base-300/60">
                  <td className="font-medium">{s.name}</td>
                  <td><span className="badge badge-xs badge-ghost">{categoryKeyMap[s.category] ? t(categoryKeyMap[s.category] as any) : s.category}</span></td>
                  <td className="text-right font-semibold">${Number(s.price_usd || 0).toFixed(2)}</td>
                  <td className="text-center">
                    <span className={`badge badge-sm ${lowStock(s) ? "badge-error" : "badge-ghost"}`}>
                      {s.stock} {s.unit}
                    </span>
                  </td>
                  <td className="text-center">
                    {s.requires_prescription ? <Pill className="w-4 h-4 text-warning mx-auto" /> : "—"}
                  </td>
                  <td className="text-right">
                    <button onClick={() => handleEdit(s)} className="btn btn-ghost btn-xs">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDelete(s.id)} className="btn btn-ghost btn-xs text-error">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                    {supplyCategories.map((c) => <option key={c} value={c}>{t(categoryKeyMap[c] as any)}</option>)}
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
                  <input type="number" step="0.01" min="0" value={form.priceUSD} onChange={(e) => setForm({ ...form, priceUSD: e.target.value })} placeholder="5.00" className="input input-bordered w-full text-sm" required />
                </div>
                <div className="form-control gap-1">
                  <label className="label pb-0"><span className="label-text font-medium">{t("fieldUnit")}</span></label>
                  <input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder={t("fieldUnitPlaceholder")} className="input input-bordered w-full text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control gap-1">
                  <label className="label pb-0"><span className="label-text font-medium">{t("fieldStock")}</span></label>
                  <input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="input input-bordered w-full text-sm" />
                </div>
                <div className="form-control gap-1">
                  <label className="label pb-0"><span className="label-text font-medium">{t("fieldMinStock")}</span></label>
                  <input type="number" min="0" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} className="input input-bordered w-full text-sm" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.requiresPrescription} onChange={(e) => setForm({ ...form, requiresPrescription: e.target.checked })} className="checkbox checkbox-sm checkbox-primary" />
                <span className="text-sm">{t("requiresPrescription")}</span>
              </label>
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
