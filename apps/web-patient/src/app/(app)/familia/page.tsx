"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Users, UserPlus, Trash2, Check, X, AlertCircle, Phone, Mail } from "lucide-react";
import { getApiUrl, apiFetch } from "../../../lib/api";
import { useTranslations } from "next-intl";

export default function FamilyPage() {
  const t = useTranslations("Family");
  const tCommon = useTranslations("Common");
  const [members, setMembers] = useState<any[]>([]);
  const [caregivers, setCaregivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    phoneOrEmail: "",
    relation: "",
    permissions: [] as string[],
  });

  const permissionLabelKeys: Record<string, string> = {
    view_profile: "permViewProfile",
    make_payments: "permMakePayments",
    book_appointments: "permBookAppointments",
    view_records: "permViewRecords",
  };

  const fetchAll = async () => {
    try {
      const [memRes, careRes] = await Promise.all([
        apiFetch(getApiUrl("patient/family-members")),
        apiFetch(getApiUrl("patient/caregivers")),
      ]);
      if (memRes.ok) {
        const data = await memRes.json();
        setMembers(data.family_members || []);
      }
      if (careRes.ok) {
        const data = await careRes.json();
        setCaregivers(data.caregivers || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.phoneOrEmail) {
      setError(t("enterPhoneOrEmail"));
      return;
    }
    setSaving(true);
    try {
      const res = await apiFetch(getApiUrl("patient/family-members"), {
        method: "POST",
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? t("inviteError"));
      }
      setShowAdd(false);
      setForm({ phoneOrEmail: "", relation: "", permissions: [] });
      fetchAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : tCommon("error"));
    } finally {
      setSaving(false);
    }
  };

  const handleRespond = async (id: string, status: string) => {
    try {
      await apiFetch(getApiUrl(`patient/family-members/${id}`), {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      fetchAll();
    } catch {
      // ignore
    }
  };

  const handleRemove = async (id: string) => {
    if (!confirm(t("removeConfirm"))) return;
    try {
      await apiFetch(getApiUrl(`patient/family-members/${id}`), {
        method: "DELETE",
      });
      fetchAll();
    } catch {
      // ignore
    }
  };

  const togglePermission = (perm: string) => {
    setForm({
      ...form,
      permissions: form.permissions.includes(perm)
        ? form.permissions.filter((p) => p !== perm)
        : [...form.permissions, perm],
    });
  };

  return (
    <div className="space-y-6">
      <Link href="/dashboard" className="btn btn-ghost btn-sm -ml-2">
        <ArrowLeft className="w-4 h-4" /> {tCommon("back")}
      </Link>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground font-display flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("subtitle")}
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn btn-primary btn-sm gap-2">
          <UserPlus className="w-4 h-4" /> {t("invite")}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner text-primary" />
        </div>
      ) : (
        <>
          {/* People I care for (as caregiver) */}
          <div>
            <h2 className="text-sm font-semibold text-foreground mb-3">{t("peopleYouCareFor")}</h2>
            {members.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm border border-dashed border-base-300 rounded-xl">
                {t("notCaringForAnyone")}
              </div>
            ) : (
              <div className="space-y-3">
                {members.map((m) => (
                  <div key={m.id} className="card bg-base-100 border border-base-300 shadow-sm">
                    <div className="card-body p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-sm font-semibold font-display">{m.patient_name}</h3>
                          {m.relation && <p className="text-xs text-muted-foreground">{m.relation}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`badge badge-sm ${m.status === "ACTIVE" ? "badge-success" : m.status === "PENDING" ? "badge-warning" : "badge-ghost"}`}>
                            {m.status === "ACTIVE" ? t("statusActive") : m.status === "PENDING" ? t("statusPending") : t("statusRevoked")}
                          </span>
                          <button onClick={() => handleRemove(m.id)} className="btn btn-ghost btn-xs text-error">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      {m.permissions && m.permissions.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {m.permissions.map((p: string) => (
                            <span key={p} className="badge badge-xs badge-outline">{permissionLabelKeys[p] ? t(permissionLabelKeys[p] as any) : p}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Caregivers (people who care for me) */}
          {caregivers.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-foreground mb-3">{t("yourCaregivers")}</h2>
              <div className="space-y-3">
                {caregivers.map((c) => (
                  <div key={c.id} className="card bg-base-100 border border-base-300 shadow-sm">
                    <div className="card-body p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-sm font-semibold font-display">{c.caregiver_name}</h3>
                          {c.relation && <p className="text-xs text-muted-foreground">{c.relation}</p>}
                        </div>
                        <span className={`badge badge-sm ${c.status === "ACTIVE" ? "badge-success" : c.status === "PENDING" ? "badge-warning" : "badge-ghost"}`}>
                          {c.status === "ACTIVE" ? t("statusActive") : c.status === "PENDING" ? t("statusPending") : t("statusRevoked")}
                        </span>
                      </div>
                      {c.status === "PENDING" && (
                        <div className="flex gap-2 pt-1">
                          <button onClick={() => handleRespond(c.id, "ACTIVE")} className="btn btn-primary btn-xs gap-1">
                            <Check className="w-3.5 h-3.5" /> {t("approve")}
                          </button>
                          <button onClick={() => handleRespond(c.id, "REVOKED")} className="btn btn-ghost btn-xs text-error gap-1">
                            <X className="w-3.5 h-3.5" /> {t("reject")}
                          </button>
                        </div>
                      )}
                      {c.status === "ACTIVE" && (
                        <button onClick={() => handleRemove(c.id)} className="btn btn-ghost btn-xs text-error btn-sm w-fit">
                          <Trash2 className="w-3.5 h-3.5" /> {t("remove")}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Add modal */}
      {showAdd && (
        <div className="modal modal-open">
          <div className="modal-box w-full max-w-md mx-2">
            <h3 className="text-lg font-bold font-display">{t("inviteTitle")}</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              {t("inviteDesc")}
            </p>
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="form-control gap-1">
                <label className="label pb-0"><span className="label-text font-medium">{t("phoneOrEmail")}</span></label>
                <input value={form.phoneOrEmail} onChange={(e) => setForm({ ...form, phoneOrEmail: e.target.value })} placeholder={t("phoneOrEmailPlaceholder")} className="input input-bordered w-full text-sm" required />
              </div>
              <div className="form-control gap-1">
                <label className="label pb-0"><span className="label-text font-medium">{t("relation")}</span></label>
                <select value={form.relation} onChange={(e) => setForm({ ...form, relation: e.target.value })} className="select select-bordered w-full text-sm">
                  <option value="">{tCommon("select")}</option>
                  <option value="parent">{t("relationParent")}</option>
                  <option value="child">{t("relationChild")}</option>
                  <option value="spouse">{t("relationSpouse")}</option>
                  <option value="sibling">{t("relationSibling")}</option>
                  <option value="other">{t("relationOther")}</option>
                </select>
              </div>
              <div className="form-control gap-1">
                <label className="label pb-0"><span className="label-text font-medium">{t("permissions")}</span></label>
                <div className="space-y-2">
                  {Object.entries(permissionLabelKeys).map(([key, labelKey]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.permissions.includes(key)} onChange={() => togglePermission(key)} className="checkbox checkbox-sm checkbox-primary" />
                      <span className="text-sm">{t(labelKey as any)}</span>
                    </label>
                  ))}
                </div>
              </div>
              {error && (
                <div className="alert alert-error text-sm py-2">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2 border-t border-base-300">
                <button type="button" onClick={() => setShowAdd(false)} className="btn btn-ghost btn-sm">{tCommon("cancel")}</button>
                <button type="submit" disabled={saving} className="btn btn-primary btn-sm">
                  {saving && <span className="loading loading-spinner loading-xs" />} {t("invite")}
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
