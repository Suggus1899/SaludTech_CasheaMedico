"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Users, CheckCircle2, XCircle } from "lucide-react";
import { useFetchData } from "@saludtech/shared";
import { getApiUrl, apiFetch } from "../../../lib/api";
import { ExportButton } from "../../../components/shared/ExportButton";
import { patientFormSchema } from "../../../lib/validations";

export default function PacientesPage() {
  const t = useTranslations("Patients");
  const tValidation = useTranslations("Validation");
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { data, loading } = useFetchData<any>(getApiUrl("admin/users?limit=50&offset=0"), [refreshTrigger]);

  // Modal state
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [patientForm, setPatientForm] = useState({ firstName: "", lastName: "", email: "", phone: "", identityDocument: "", password: "" });
  const [patientLoading, setPatientLoading] = useState(false);
  const [patientError, setPatientError] = useState<string | null>(null);
  const [patientSuccess, setPatientSuccess] = useState(false);

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setPatientError(null);
    const result = patientFormSchema.safeParse(patientForm);
    if (!result.success) {
      setPatientError(tValidation(result.error.issues[0].message));
      return;
    }
    setPatientLoading(true);
    try {
      const res = await apiFetch(getApiUrl("admin/users"), {
        method: "POST",
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
      setPatientError(err instanceof Error ? err.message : t("errorCreate"));
    } finally {
      setPatientLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">{t("loading")}</div>;

  const users = data?.users || [];
  const filtered = users.filter(
    (p: any) =>
      (p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.national_id?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (roleFilter === "ALL" || p.role === roleFilter) &&
      (statusFilter === "ALL" || (statusFilter === "ACTIVE" && p.is_active) || (statusFilter === "INACTIVE" && !p.is_active))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="opacity-60 text-sm">{t("found", { count: filtered.length })}</p>
        <div className="flex items-center gap-2">
          <ExportButton endpoint="admin/export/users" label={t("exportLabel")} />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="select select-sm select-bordered"
          >
            <option value="ALL">{t("allRoles")}</option>
            <option value="PATIENT">{t("rolePatient")}</option>
            <option value="MERCHANT">{t("roleMerchant")}</option>
            <option value="ADMIN">{t("roleAdmin")}</option>
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
          <div className="relative hidden sm:block">
            <input type="search" placeholder={t("searchPlaceholder")} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-4 pr-4 py-2 bg-muted rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary w-64 transition-all" />
          </div>
          <button className="btn btn-primary btn-sm gap-2" onClick={() => setIsAddPatientOpen(true)}>
            <Users className="w-4 h-4" /> {t("addPatient")}
          </button>
        </div>
      </div>
      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-16 opacity-40">
              <Users className="w-10 h-10 mx-auto mb-3" />
              <p className="font-medium">{t("noResults")}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-sm w-full">
                <thead>
                  <tr className="border-base-300">
                    <th>{t("colId")}</th>
                    <th>{t("colPatient")}</th>
                    <th>{t("colEmail")}</th>
                    <th>{t("colRole")}</th>
                    <th>{t("colLevel")}</th>
                    <th>{t("colPhone")}</th>
                    <th>{t("colStatus")}</th>
                    <th className="text-right">{t("colActions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p: any) => (
                    <tr key={p.id} className="hover:bg-base-200/40 transition-colors cursor-pointer border-base-300/60">
                      <td className="opacity-60 font-mono text-xs">{p.national_id || "—"}</td>
                      <td className="font-medium">{p.full_name}</td>
                      <td className="opacity-60 text-xs">{p.email}</td>
                      <td>
                        <span className={`badge badge-sm ${p.role === "ADMIN" ? "badge-secondary" : p.role === "MERCHANT" ? "badge-accent" : "badge-ghost"}`}>{p.role}</span>
                      </td>
                      <td>
                        <span className="badge badge-sm badge-primary badge-outline">{t("levelPrefix", { level: p.level })}</span>
                      </td>
                      <td className="text-xs">{p.phone}</td>
                      <td>
                        <span className={`badge badge-sm ${p.is_active ? "badge-primary" : "badge-ghost"}`}>
                          {p.is_active ? t("statusActive") : t("statusPaused")}
                        </span>
                      </td>
                      <td className="text-right space-x-2">
                        {!p.is_active && (
                          <button className="btn btn-xs btn-outline" onClick={async () => {
                            try {
                              const res = await apiFetch(getApiUrl(`admin/users/${p.id}/status`), {
                                method: 'PATCH',
                                body: JSON.stringify({ isActive: true }),
                              });
                              if (res.ok) setRefreshTrigger(prev => prev + 1);
                            } catch (e) { console.error(e); }
                          }}>{t("activate")}</button>
                        )}
                        {p.is_active && (
                          <button className="btn btn-xs btn-error" onClick={async () => {
                            try {
                              const res = await apiFetch(getApiUrl(`admin/users/${p.id}/status`), {
                                method: 'PATCH',
                                body: JSON.stringify({ isActive: false }),
                              });
                              if (res.ok) setRefreshTrigger(prev => prev + 1);
                            } catch (e) { console.error(e); }
                          }}>{t("pause")}</button>
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
            <h3 className="font-bold text-lg font-(family-name:--font-syne)">{t("addPatientTitle")}</h3>
            <p className="text-sm opacity-60 mb-4">{t("addPatientDescription")}</p>
            {patientSuccess ? (
              <div className="flex flex-col items-center py-8 gap-3 text-success">
                <CheckCircle2 className="w-12 h-12" />
                <p className="font-semibold">{t("successMessage")}</p>
              </div>
            ) : (
              <form onSubmit={handleAddPatient} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control gap-1">
                    <label htmlFor="firstName" className="label pb-0"><span className="label-text font-medium">{t("firstName")}</span></label>
                    <input id="firstName" className="input input-bordered w-full" required value={patientForm.firstName} onChange={(e) => setPatientForm({ ...patientForm, firstName: e.target.value })} />
                  </div>
                  <div className="form-control gap-1">
                    <label htmlFor="lastName" className="label pb-0"><span className="label-text font-medium">{t("lastName")}</span></label>
                    <input id="lastName" className="input input-bordered w-full" required value={patientForm.lastName} onChange={(e) => setPatientForm({ ...patientForm, lastName: e.target.value })} />
                  </div>
                </div>
                <div className="form-control gap-1">
                  <label htmlFor="identityDocument" className="label pb-0"><span className="label-text font-medium">{t("identityDocument")}</span></label>
                  <input id="identityDocument" className="input input-bordered w-full" required value={patientForm.identityDocument} onChange={(e) => setPatientForm({ ...patientForm, identityDocument: e.target.value })} />
                </div>
                <div className="form-control gap-1">
                  <label htmlFor="patEmail" className="label pb-0"><span className="label-text font-medium">{t("email")}</span></label>
                  <input id="patEmail" type="email" className="input input-bordered w-full" required value={patientForm.email} onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control gap-1">
                    <label htmlFor="phone" className="label pb-0"><span className="label-text font-medium">{t("phone")}</span></label>
                    <input id="phone" type="tel" className="input input-bordered w-full" required value={patientForm.phone} onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })} />
                  </div>
                  <div className="form-control gap-1">
                    <label htmlFor="patPassword" className="label pb-0"><span className="label-text font-medium">{t("password")}</span></label>
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
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setIsAddPatientOpen(false)}>{t("cancel")}</button>
                  <button type="submit" className="btn btn-primary btn-sm" disabled={patientLoading}>
                    {patientLoading && <span className="loading loading-spinner loading-xs" />}
                    {t("createPatient")}
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
