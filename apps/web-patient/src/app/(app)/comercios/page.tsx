"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Stethoscope,
  FlaskConical,
  Pill,
  Smile,
  Eye,
  Heart,
  Home,
  Search,
  ArrowLeft,
} from "lucide-react";
import { getApiUrl, apiFetch } from "../../../lib/api";
import { useTranslations } from "next-intl";
import type { Merchant } from "../../../types/patient";

const categoryConfig: Record<string, { labelKey: string; icon: React.ElementType; color: string }> = {
  CLINIC: { labelKey: "catClinic", icon: Stethoscope, color: "#2563eb" },
  LABORATORY: { labelKey: "catLaboratory", icon: FlaskConical, color: "#0891b2" },
  PHARMACY: { labelKey: "catPharmacy", icon: Pill, color: "#16a34a" },
  DENTAL: { labelKey: "catDental", icon: Smile, color: "#7c3aed" },
  OPTICS: { labelKey: "catOptics", icon: Eye, color: "#db2777" },
  ELDER_CARE: { labelKey: "catElderCare", icon: Home, color: "#ea580c" },
};

export default function ComerciosPage() {
  const t = useTranslations("Merchants");
  const tCommon = useTranslations("Common");
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch(getApiUrl("patient/merchants"));
        if (!res.ok) throw new Error("fetch failed");
        const data = (await res.json()) as Merchant[];
        setMerchants(data);
      } catch {
        setMerchants([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = merchants.filter((m) => {
    if (filter && m.category !== filter) return false;
    if (search && !m.tradeName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const grouped = filtered.reduce((acc, m) => {
    (acc[m.category] = acc[m.category] || []).push(m);
    return acc;
  }, {} as Record<string, Merchant[]>);

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard"
        className="btn btn-ghost btn-sm -ml-2"
      >
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
      <div data-tour="merchant-search" className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="input input-bordered w-full pl-10 text-sm"
        />
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("")}
          className={`btn btn-xs ${filter === "" ? "btn-primary" : "btn-outline"}`}
        >
          {t("all")}
        </button>
        {Object.entries(categoryConfig).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`btn btn-xs ${filter === key ? "btn-primary" : "btn-outline"}`}
          >
            {t(cfg.labelKey)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-6">
          {[...Array(2)].map((_, i) => (
            <section key={i}>
              <div className="flex items-center gap-2 mb-3">
                <div className="skeleton w-8 h-8 rounded-lg" />
                <div className="skeleton h-5 w-28 rounded" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="p-4 rounded-2xl border border-border bg-base-100">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="skeleton h-4 w-3/4 rounded" />
                        <div className="skeleton h-3 w-1/2 rounded" />
                      </div>
                      <div className="skeleton w-10 h-10 rounded-xl" />
                    </div>
                    <div className="skeleton h-3 w-20 rounded mt-3" />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="flex flex-col items-center py-12 gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/40">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <p className="text-sm text-muted-foreground">{t("noMerchants")}</p>
        </div>
      ) : (
        <div data-tour="merchant-list" className="space-y-6">
          {Object.entries(grouped).map(([category, items]) => {
            const cfg = categoryConfig[category] || { labelKey: category, icon: Heart, color: "#6b7280" };
            const Icon = cfg.icon;
            return (
              <section key={category}>
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: `${cfg.color}1A`, color: cfg.color }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <h2 className="text-base font-bold text-foreground font-display">
                    {t(cfg.labelKey)}
                  </h2>
                  <span className="text-xs text-muted-foreground">({items.length})</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map((m) => (
                    <Link
                      key={m.id}
                      href={`/comercios/${m.id}`}
                      className="block p-4 rounded-2xl border border-border bg-base-100 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground font-display truncate">
                            {m.tradeName}
                          </p>
                          {m.city && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {m.city}
                            </p>
                          )}
                          {m.subcategory && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {m.subcategory}
                            </p>
                          )}
                        </div>
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ backgroundColor: `${cfg.color}1A`, color: cfg.color }}
                        >
                          {m.tradeName.slice(0, 2).toUpperCase()}
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-primary mt-3">
                        {t("viewCatalog")}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
