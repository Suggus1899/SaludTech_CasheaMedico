"use client";

import { useState } from "react";
import {
  Stethoscope,
  MapPin,
  Building2,
  Bot,
  UserCheck,
  AlertCircle,
} from "lucide-react";
import { useFetchData } from "@saludtech/shared";
import { getApiUrl, apiFetch } from "../../../lib/api";
import { formatDate } from "../../../lib/utils";
import { useTranslations } from "next-intl";
import type { Triage, RecommendedMerchant } from "../../../types/patient";

const categories = [
  { key: "catDental", label: "Dental" },
  { key: "catVision", label: "Visión" },
  { key: "catCardiac", label: "Cardíaco" },
  { key: "catFever", label: "Fiebre" },
  { key: "catChestPain", label: "Dolor pecho" },
  { key: "catGeneral", label: "General" },
];

const specialtyLabelKeys: Record<string, string> = {
  GENERAL_PRACTICE: "specGeneralPractice",
  CARDIOLOGY: "specCardiology",
  DENTISTRY: "specDentistry",
  OPHTHALMOLOGY: "specOphthalmology",
  INTERNAL_MEDICINE: "specInternalMedicine",
  EMERGENCY_MEDICINE: "specEmergencyMedicine",
};

const statusLabelKeys: Record<string, { key: string; className: string }> = {
  PENDING: { key: "statusPending", className: "badge-warning" },
  REVIEWING: { key: "statusReviewing", className: "badge-info" },
  RESOLVED: { key: "statusResolved", className: "badge-success" },
  REFERRED: { key: "statusReferred", className: "badge-primary" },
  COMPLETED: { key: "statusCompleted", className: "badge-success" },
};

const urgencyLabelKeys: Record<string, { key: string; className: string }> = {
  LOW: { key: "urgencyLow", className: "badge-success" },
  MEDIUM: { key: "urgencyMedium", className: "badge-warning" },
  HIGH: { key: "urgencyHigh", className: "badge-error" },
  EMERGENCY: { key: "urgencyEmergency", className: "badge-error" },
};

function severityColor(s: number): string {
  if (s >= 8) return "text-error";
  if (s >= 5) return "text-warning";
  return "text-success";
}

export default function TriajePage() {
  const t = useTranslations("Triage");
  const tCommon = useTranslations("Common");
  const { data: triages, loading, refetch } = useFetchData<Triage[]>(
    getApiUrl("patient/triage")
  );

  const [symptoms, setSymptoms] = useState("");
  const [severity, setSeverity] = useState(5);
  const [selectedCats, setSelectedCats] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [merchants, setMerchants] = useState<RecommendedMerchant[] | null>(null);
  const [merchantsLoading, setMerchantsLoading] = useState(false);

  const toggleCat = (cat: string) => {
    setSelectedCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const selected = Array.from(selectedCats).join(", ");
      const fullSymptoms = selected
        ? `${symptoms.trim()} [Categorías: ${selected}]`
        : symptoms.trim();

      const res = await apiFetch(getApiUrl("patient/triage"), {
        method: "POST",
        body: JSON.stringify({
          symptoms: fullSymptoms,
          perceivedSeverity: severity,
        }),
      });
      if (!res.ok) throw new Error("submit failed");
      setSymptoms("");
      setSeverity(5);
      setSelectedCats(new Set());
      setSuccess(true);
      refetch();
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError(t("submitError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadMerchants = async (triageId: string) => {
    setMerchantsLoading(true);
    setMerchants([]);
    try {
      const res = await apiFetch(
        getApiUrl(`patient/triage/${triageId}/recommended-merchants`)
      );
      if (!res.ok) throw new Error();
      const data = (await res.json()) as RecommendedMerchant[];
      setMerchants(data);
    } catch {
      setMerchants([]);
    } finally {
      setMerchantsLoading(false);
    }
  };

  return (
    <div className="space-y-7">
      <h1 className="text-xl font-bold text-foreground">
        {t("title")}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: New triage form */}
      <form
        onSubmit={handleSubmit}
        className="p-5 rounded-2xl border border-border bg-base-100 space-y-4"
      >
        <div className="flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-primary" />
          <h2 className="text-base font-bold text-foreground font-display">
            {t("newConsult")}
          </h2>
        </div>

        {/* Categories */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2">
            {t("symptomType")}
          </p>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isSelected = selectedCats.has(cat.label);
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => toggleCat(cat.label)}
                  className={`badge cursor-pointer transition-colors ${
                    isSelected ? "badge-primary" : "badge-ghost"
                  }`}
                >
                  {t(cat.key)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Symptoms textarea */}
        <div className="form-control">
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder={t("symptomsPlaceholder")}
            rows={3}
            className="textarea textarea-bordered w-full"
          />
        </div>

        {/* Severity slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-foreground">
              {t("discomfortLevel")}
            </span>
            <span
              className={`badge badge-sm font-bold ${severityColor(severity)}`}
            >
              {severity}/10
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={severity}
            onChange={(e) => setSeverity(Number(e.target.value))}
            className="range range-primary range-xs"
            step={1}
          />
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 text-sm text-success bg-success/10 p-3 rounded-lg">
            <UserCheck className="w-4 h-4" />
            <span>{t("successMsg")}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !symptoms.trim()}
          className="btn btn-primary w-full font-semibold"
        >
          {isSubmitting ? <span className="loading loading-spinner loading-sm" /> : null}
          {t("submitSymptoms")}
        </button>
      </form>

      {/* Right: History */}
      <section>
        <h2 className="text-lg font-bold text-foreground mb-4 font-display">
          {t("consultHistory")}
        </h2>

        {loading ? (
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner text-primary" />
          </div>
        ) : !triages || triages.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {t("noHistory")}
          </p>
        ) : (
          <ul className="space-y-3">
            {triages.map((triage) => {
              const status = statusLabelKeys[triage.status ?? ""] ?? {
                key: triage.status ?? "—",
                className: "badge-ghost",
              };
              const urgency = urgencyLabelKeys[triage.priority ?? ""] ?? {
                key: "urgencyLow",
                className: "badge-success",
              };
              return (
                <li
                  key={triage.id}
                  className="p-4 rounded-2xl border border-border bg-base-100 space-y-3"
                >
                  <div className="flex justify-between">
                    <span className={`badge badge-sm ${urgency.className}`}>
                      {urgencyLabelKeys[triage.priority ?? ""] ? t(urgency.key) : triage.priority ?? "—"}
                    </span>
                    <span className={`badge badge-sm ${status.className}`}>
                      {statusLabelKeys[triage.status ?? ""] ? t(status.key) : triage.status ?? "—"}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {triage.symptoms}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(triage.createdAt)}
                  </p>

                  {triage.recommendation && (
                    <div className="flex items-start gap-1.5 p-2.5 rounded-lg bg-primary/8">
                      <Bot className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <p className="text-xs text-primary">{triage.recommendation}</p>
                    </div>
                  )}

                  <button
                    onClick={() => loadMerchants(triage.id)}
                    disabled={merchantsLoading}
                    className="btn btn-outline btn-sm w-full gap-2"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    {t("viewSpecialists")}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Merchants modal */}
      {merchants && (
        <div className="modal modal-open" role="dialog" aria-modal="true">
          <div className="modal-box">
            <h3 className="text-lg font-bold mb-4 font-display">
              {t("specialistsTitle")}
            </h3>
            {merchantsLoading ? (
              <div className="flex justify-center py-8">
                <span className="loading loading-spinner text-primary" />
              </div>
            ) : merchants.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">
                {t("noSpecialists")}
              </p>
            ) : (
              <ul className="space-y-2.5">
                {merchants.map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center gap-3 p-3.5 rounded-xl border border-border bg-muted"
                  >
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground font-display">
                        {m.tradeName}
                      </p>
                      <p className="text-xs text-muted-foreground">{m.city ?? "—"}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="modal-action">
              <button onClick={() => setMerchants(null)} className="btn btn-ghost btn-sm">
                {t("close")}
              </button>
            </div>
          </div>
          <button
            className="modal-backdrop"
            aria-label={t("close")}
            onClick={() => setMerchants(null)}
          />
        </div>
      )}
      </div>
    </div>
  );
}
