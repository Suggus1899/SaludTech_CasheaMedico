"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Stethoscope,
  Pill,
  ArrowLeft,
  AlertTriangle,
  Store,
} from "lucide-react";
import { getApiUrl, apiFetch } from "../../../lib/api";
import { formatCurrency } from "../../../lib/utils";
import { useTranslations } from "next-intl";
import type { MedicalService, MedicalSupply } from "../../../types/patient";

type Tab = "services" | "supplies";

const serviceCategories = [
  { value: "", labelKey: "catAll" },
  { value: "CONSULTATION", labelKey: "catConsultation" },
  { value: "LAB_TEST", labelKey: "catLabTest" },
  { value: "DENTAL", labelKey: "catDental" },
  { value: "IMAGING", labelKey: "catImaging" },
  { value: "PROCEDURE", labelKey: "catProcedure" },
  { value: "VACCINATION", labelKey: "catVaccination" },
];

const supplyCategories = [
  { value: "", labelKey: "catAllM" },
  { value: "MEDICATION", labelKey: "catMedication" },
  { value: "DEVICE", labelKey: "catDevice" },
  { value: "SUPPLY", labelKey: "catSupply" },
  { value: "OXYGEN", labelKey: "catOxygen" },
  { value: "NUTRITION", labelKey: "catNutrition" },
  { value: "PERSONAL_CARE", labelKey: "catPersonalCare" },
];

export default function CatalogoPage() {
  const t = useTranslations("Catalog");
  const tCommon = useTranslations("Common");
  const [tab, setTab] = useState<Tab>("services");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [services, setServices] = useState<MedicalService[]>([]);
  const [supplies, setSupplies] = useState<MedicalSupply[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const endpoint = tab === "services" ? "patient/catalog/services" : "patient/catalog/supplies";
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (search) params.set("search", search);

    (async () => {
      try {
        const res = await apiFetch(getApiUrl(`${endpoint}?${params}`));
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();
        if (tab === "services") {
          setServices(data);
        } else {
          setSupplies(data);
        }
      } catch {
        if (tab === "services") setServices([]);
        else setSupplies([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [tab, category, search]);

  const currentCategories = tab === "services" ? serviceCategories : supplyCategories;
  const results = tab === "services" ? services : supplies;

  return (
    <div className="space-y-5">
      <Link href="/dashboard" className="btn btn-ghost btn-sm -ml-2">
        <ArrowLeft className="w-4 h-4" /> {tCommon("back")}
      </Link>

      <div>
        <h1 className="text-xl font-bold text-foreground font-display">
          {t("title")}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {t("subtitle")}
        </p>
      </div>

      {/* Search */}
      <div data-tour="catalog-search" className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="input input-bordered w-full pl-10 text-sm"
        />
      </div>

      {/* Tabs */}
      <div className="tabs tabs-boxed">
        <button
          onClick={() => { setTab("services"); setCategory(""); }}
          className={`tab ${tab === "services" ? "tab-active" : ""}`}
        >
          <Stethoscope className="w-4 h-4 mr-1.5 inline" />
          {t("services")}
        </button>
        <button
          onClick={() => { setTab("supplies"); setCategory(""); }}
          className={`tab ${tab === "supplies" ? "tab-active" : ""}`}
        >
          <Pill className="w-4 h-4 mr-1.5 inline" />
          {t("supplies")}
        </button>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        {currentCategories.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`btn btn-xs ${category === c.value ? "btn-primary" : "btn-outline"}`}
          >
            {t(c.labelKey)}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner text-primary" />
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center py-12 gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/40">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <p className="text-sm text-muted-foreground">{t("noResults")}</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            {t("resultsCount", { count: results.length })}
          </p>
          <div data-tour="catalog-results" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {tab === "services"
            ? services.map((svc) => (
                <Link
                  key={svc.id}
                  href={`/comercios/${svc.merchantId}`}
                  className="block p-4 rounded-2xl border border-border bg-base-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground font-display">
                        {svc.name}
                      </p>
                      {svc.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {svc.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Store className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {svc.merchantName}
                          {svc.merchantCity ? ` · ${svc.merchantCity}` : ""}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-base font-bold text-foreground font-display">
                        {formatCurrency(svc.priceUsd)}
                      </p>
                      {svc.priceVES && (
                        <p className="text-xs text-muted-foreground">
                          (Bs. {new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(svc.priceVES)})
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            : supplies.map((sup) => (
                <Link
                  key={sup.id}
                  href={`/comercios/${sup.merchantId}`}
                  className="block p-4 rounded-2xl border border-border bg-base-100 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground font-display">
                          {sup.name}
                        </p>
                        {sup.requiresPrescription && (
                          <span className="badge badge-warning badge-xs gap-1">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            {tCommon("receta")}
                          </span>
                        )}
                      </div>
                      {sup.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {sup.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Store className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {sup.merchantName}
                          {sup.merchantCity ? ` · ${sup.merchantCity}` : ""}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-base font-bold text-foreground font-display">
                        {formatCurrency(sup.priceUsd)}
                      </p>
                      {sup.priceVES && (
                        <p className="text-xs text-muted-foreground">
                          (Bs. {new Intl.NumberFormat("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(sup.priceVES)})
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </>
      )}
    </div>
  );
}
