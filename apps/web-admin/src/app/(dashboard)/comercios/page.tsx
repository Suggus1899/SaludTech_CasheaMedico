"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Store, Building2, Pill, CheckCircle2, XCircle } from "lucide-react";
import { useFetchData } from "@saludtech/shared";
import { getApiUrl, apiFetch } from "../../../lib/api";
import { merchantFormSchema } from "../../../lib/validations";

export default function ComerciosPage() {
  const t = useTranslations("Merchants");
  const tValidation = useTranslations("Validation");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { data, loading } = useFetchData<any[]>(getApiUrl("admin/merchants"), [refreshTrigger]);

  // Modal state
  const [isAddMerchantOpen, setIsAddMerchantOpen] = useState(false);
  const [merchantForm, setMerchantForm] = useState({ legalName: "", tradeName: "", rif: "", category: "CLINIC", email: "", phone: "", city: "", contactName: "" });
  const [merchantLoading, setMerchantLoading] = useState(false);
  const [merchantError, setMerchantError] = useState<string | null>(null);
  const [merchantSuccess, setMerchantSuccess] = useState(false);

  const handleAddMerchant = async (e: React.FormEvent) => {
    e.preventDefault();
    setMerchantError(null);
    const result = merchantFormSchema.safeParse(merchantForm);
    if (!result.success) {
      setMerchantError(tValidation(result.error.issues[0].message));
      return;
    }
    setMerchantLoading(true);
    try {
      const res = await apiFetch(getApiUrl("admin/merchants"), {
        method: "POST",
        body: JSON.stringify(merchantForm),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message ?? `Error ${res.status}`);
      }
      setMerchantSuccess(true);
      setRefreshTrigger(v => v + 1);
      setTimeout(() => {
        setIsAddMerchantOpen(false);
        setMerchantSuccess(false);
        setMerchantForm({ legalName: "", tradeName: "", rif: "", category: "CLINIC", email: "", phone: "", city: "", contactName: "" });
      }, 1500);
    } catch (err: unknown) {
      setMerchantError(err instanceof Error ? err.message : t("errorCreate"));
    } finally {
      setMerchantLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">{t("loading")}</div>;

  const merchants = data?.merchants || [];
  const filtered = merchants.filter(
    (c: any) =>
      (c.trade_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.legal_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.rif?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.city?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (categoryFilter === "ALL" || c.category === categoryFilter) &&
      (statusFilter === "ALL" || (statusFilter === "ACTIVE" && c.is_active) || (statusFilter === "INACTIVE" && !c.is_active))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="opacity-60 text-sm">{t("found", { count: filtered.length })}</p>
        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="select select-sm select-bordered"
          >
            <option value="ALL">{t("allCategories")}</option>
            <option value="CLINIC">{t("catClinics")}</option>
            <option value="PHARMACY">{t("catPharmacies")}</option>
            <option value="LABORATORY">{t("catLaboratories")}</option>
            <option value="DENTAL">{t("catDental")}</option>
            <option value="OPTICS">{t("catOptics")}</option>
            <option value="ELDER_CARE">{t("catElderCare")}</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select select-sm select-bordered"
          >
            <option value="ALL">{t("all")}</option>
            <option value="ACTIVE">{t("active")}</option>
            <option value="INACTIVE">{t("inactive")}</option>
          </select>
          <div className="relative">
            <input type="search" placeholder={t("searchPlaceholder")} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-4 pr-4 py-2 bg-muted rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary w-full sm:w-64 transition-all" />
          </div>
          <button className="btn btn-primary btn-sm gap-2" onClick={() => setIsAddMerchantOpen(true)}>
            <Store className="w-4 h-4" /> {t("addMerchant")}
          </button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-16 text-muted-foreground">
            <Building2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">{t("noResults")}</p>
          </div>
        ) : (
          filtered.map((c: any) => (
            <div key={c.id} className="card bg-base-100 border border-base-300 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all cursor-pointer">
              <div className="card-body p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-base">{c.trade_name}</h4>
                    <p className="text-xs opacity-60 mt-0.5">{c.tax_id || "—"}</p>
                  </div>
                  <span className={`badge badge-sm ${c.is_active ? "badge-primary" : "badge-ghost"}`}>{c.is_active ? t("statusActive") : t("statusPending")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Pill className="w-3.5 h-3.5 opacity-60" />
                  <span className="text-sm opacity-60">{c.category}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-base-300 items-center">
                  <span className="opacity-60">{c.city || "—"}</span>
                  {!c.is_active ? (
                    <button className="btn btn-xs btn-primary" onClick={async () => {
                      try {
                        const res = await apiFetch(getApiUrl(`admin/merchants/${c.id}/approve`), {
                          method: 'POST',
                        });
                        if (res.ok) setRefreshTrigger(prev => prev + 1);
                      } catch (e) {
                        console.error(e);
                      }
                    }}>{t("approve")}</button>
                  ) : (
                    <span className="font-semibold">{c.contact_phone || "—"}</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Agregar Comercio */}
      {isAddMerchantOpen && (
        <div className="modal modal-open">
          <div className="modal-box w-full max-w-md mx-2 p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-lg font-(family-name:--font-syne)">{t("affiliateMerchant")}</h3>
            <p className="text-sm opacity-60 mb-4">{t("affiliateDescription")}</p>
            {merchantSuccess ? (
              <div className="flex flex-col items-center py-8 gap-3 text-success">
                <CheckCircle2 className="w-12 h-12" />
                <p className="font-semibold">{t("successMessage")}</p>
              </div>
            ) : (
              <form onSubmit={handleAddMerchant} className="space-y-4">
                <div className="form-control gap-1">
                  <label htmlFor="legalName" className="label pb-0"><span className="label-text font-medium">{t("legalName")}</span></label>
                  <input id="legalName" className="input input-bordered w-full" required value={merchantForm.legalName} onChange={(e) => setMerchantForm({ ...merchantForm, legalName: e.target.value })} />
                </div>
                <div className="form-control gap-1">
                  <label htmlFor="tradeName" className="label pb-0"><span className="label-text font-medium">{t("tradeName")}</span></label>
                  <input id="tradeName" className="input input-bordered w-full" required value={merchantForm.tradeName} onChange={(e) => setMerchantForm({ ...merchantForm, tradeName: e.target.value })} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-control gap-1">
                    <label htmlFor="rif" className="label pb-0"><span className="label-text font-medium">{t("rif")}</span></label>
                    <input id="rif" className="input input-bordered w-full" required value={merchantForm.rif} onChange={(e) => setMerchantForm({ ...merchantForm, rif: e.target.value })} />
                  </div>
                  <div className="form-control gap-1">
                    <label htmlFor="category" className="label pb-0"><span className="label-text font-medium">{t("category")}</span></label>
                    <select id="category" required value={merchantForm.category} onChange={(e) => setMerchantForm({ ...merchantForm, category: e.target.value })} className="select select-bordered w-full">
                      <option value="CLINIC">{t("catClinic")}</option>
                      <option value="PHARMACY">{t("catPharmacy")}</option>
                      <option value="DENTAL">{t("catDentistry")}</option>
                      <option value="OPTICAL">{t("catOptical")}</option>
                      <option value="LABORATORY">{t("catLaboratory")}</option>
                    </select>
                  </div>
                </div>
                <div className="form-control gap-1">
                  <label htmlFor="emailMerch" className="label pb-0"><span className="label-text font-medium">{t("contactEmail")}</span></label>
                  <input id="emailMerch" type="email" className="input input-bordered w-full" required value={merchantForm.email} onChange={(e) => setMerchantForm({ ...merchantForm, email: e.target.value })} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-control gap-1">
                    <label htmlFor="phoneMerch" className="label pb-0"><span className="label-text font-medium">{t("phone")}</span></label>
                    <input id="phoneMerch" type="tel" className="input input-bordered w-full" required value={merchantForm.phone} onChange={(e) => setMerchantForm({ ...merchantForm, phone: e.target.value })} />
                  </div>
                  <div className="form-control gap-1">
                    <label htmlFor="city" className="label pb-0"><span className="label-text font-medium">{t("city")}</span></label>
                    <input id="city" className="input input-bordered w-full" required value={merchantForm.city} onChange={(e) => setMerchantForm({ ...merchantForm, city: e.target.value })} />
                  </div>
                </div>
                <div className="form-control gap-1">
                  <label htmlFor="contactName" className="label pb-0"><span className="label-text font-medium">{t("contactName")}</span></label>
                  <input id="contactName" className="input input-bordered w-full" required value={merchantForm.contactName} onChange={(e) => setMerchantForm({ ...merchantForm, contactName: e.target.value })} />
                </div>
                {merchantError && (
                  <div role="alert" className="alert alert-error text-sm">
                    <XCircle className="w-4 h-4 shrink-0" />
                    <p>{merchantError}</p>
                  </div>
                )}
                <div className="flex justify-end gap-3 pt-4 border-t border-base-300">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsAddMerchantOpen(false)}>{t("cancel")}</button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={merchantLoading}>
                    {merchantLoading && <span className="loading loading-spinner loading-xs" />}
                    {t("affiliate")}
                  </button>
                </div>
              </form>
            )}
          </div>
          <div className="modal-backdrop" onClick={() => { setIsAddMerchantOpen(false); setMerchantError(null); setMerchantSuccess(false); }} />
        </div>
      )}
    </div>
  );
}
