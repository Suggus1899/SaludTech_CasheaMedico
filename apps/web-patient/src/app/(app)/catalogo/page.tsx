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
import { getApiUrl, getAuthHeaders } from "../../../lib/api";
import { formatCurrency } from "../../../lib/utils";
import type { MedicalService, MedicalSupply } from "../../../types/patient";

type Tab = "services" | "supplies";

const serviceCategories = [
  { value: "", label: "Todas" },
  { value: "CONSULTATION", label: "Consultas" },
  { value: "LAB_TEST", label: "Laboratorios" },
  { value: "DENTAL", label: "Dental" },
  { value: "IMAGING", label: "Imágenes" },
  { value: "PROCEDURE", label: "Procedimientos" },
  { value: "VACCINATION", label: "Vacunas" },
];

const supplyCategories = [
  { value: "", label: "Todos" },
  { value: "MEDICATION", label: "Medicamentos" },
  { value: "DEVICE", label: "Dispositivos" },
  { value: "SUPPLY", label: "Insumos" },
  { value: "OXYGEN", label: "Oxígeno" },
  { value: "NUTRITION", label: "Nutrición" },
  { value: "PERSONAL_CARE", label: "Cuidado Personal" },
];

export default function CatalogoPage() {
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
        const res = await fetch(getApiUrl(`${endpoint}?${params}`), {
          headers: getAuthHeaders(),
        });
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
        <ArrowLeft className="w-4 h-4" /> Volver
      </Link>

      <div>
        <h1 className="text-xl font-bold text-foreground font-display">
          Catálogo Médico
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Busca servicios e insumos en todos los comercios
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar (ej: cardiología, losartán, limpieza dental)..."
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
          Servicios
        </button>
        <button
          onClick={() => { setTab("supplies"); setCategory(""); }}
          className={`tab ${tab === "supplies" ? "tab-active" : ""}`}
        >
          <Pill className="w-4 h-4 mr-1.5 inline" />
          Insumos
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
            {c.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner text-primary" />
        </div>
      ) : results.length === 0 ? (
        <p className="text-center text-muted-foreground py-8 text-sm">
          No se encontraron resultados
        </p>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            {results.length} resultado(s)
          </p>
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
                            Receta
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
      )}
    </div>
  );
}
