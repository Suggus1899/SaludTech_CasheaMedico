"use client";

import { useState } from "react";
import { Calculator, CreditCard, CheckCircle, CaretDown } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

const NIVELES = [
  { nivel: 1, inicial: 0.50, cuotas: 3, limite: 80 },
  { nivel: 2, inicial: 0.45, cuotas: 3, limite: 130 },
  { nivel: 3, inicial: 0.40, cuotas: 6, limite: 180 },
  { nivel: 4, inicial: 0.35, cuotas: 9, limite: 240 },
  { nivel: 5, inicial: 0.30, cuotas: 12, limite: 320 },
  { nivel: 6, inicial: 0.25, cuotas: 12, limite: 400 },
];

export default function SimuladorCuotas() {
  const [monto, setMonto] = useState(150);
  const [nivelIdx, setNivelIdx] = useState(0);
  const t = useTranslations("CreditLines.simulator");

  const nivel = NIVELES[nivelIdx];
  const inicial = monto * nivel.inicial;
  const financiado = monto - inicial;
  const cuota = financiado / nivel.cuotas;
  const excede = financiado > nivel.limite;

  const levelLabels = [
    t("level1"), t("level2"), t("level3"), t("level4"), t("level5"), t("level6"),
  ];

  return (
    <section id="simulador" className="py-24 bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-primary-100 text-primary mb-4">
            <Calculator className="w-3.5 h-3.5" /> {t("tag")}
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-dark mb-3">
            {t("title")}
          </h2>
          <p className="text-slate-500 text-lg">
            {t("subtitle")}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Controls */}
            <div className="p-8 space-y-8">
              {/* Monto */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  {t("amountLabel")}
                </label>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl font-display font-bold text-dark">${monto}</span>
                  <span className="text-slate-400 text-sm">{t("currency")}</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={400}
                  step={10}
                  value={monto}
                  onChange={(e) => setMonto(Number(e.target.value))}
                  className="w-full h-2 bg-primary-100 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>$20</span>
                  <span>$400</span>
                </div>
              </div>

              {/* Nivel */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  {t("levelLabel")}
                </label>
                <div className="relative">
                  <select
                    value={nivelIdx}
                    onChange={(e) => setNivelIdx(Number(e.target.value))}
                    className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary pr-10"
                  >
                    {NIVELES.map((n, i) => (
                      <option key={n.nivel} value={i}>{levelLabels[i]}</option>
                    ))}
                  </select>
                  <CaretDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  {t("lineAvailable")} <strong className="text-slate-600">${nivel.limite}</strong> · {t("upToInstallments", { count: nivel.cuotas })}
                </p>
              </div>

              {excede && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs">
                  {t("exceedWarning", { limit: nivel.limite })}
                </div>
              )}
            </div>

            {/* Result */}
            <div className="bg-hero-gradient p-8 flex flex-col justify-between">
              <div>
                <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-6">
                  {t("summary")}
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/8">
                    <div>
                      <p className="text-white/60 text-xs">{t("totalPrice")}</p>
                      <p className="text-white font-bold text-xl">${monto.toFixed(2)}</p>
                    </div>
                    <CreditCard className="w-5 h-5 text-white/40" />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/8">
                    <div>
                      <p className="text-white/60 text-xs">{t("payToday", { percent: (nivel.inicial * 100).toFixed(0) })}</p>
                      <p className="text-secondary font-bold text-xl">${inicial.toFixed(2)}</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-secondary" weight="duotone" />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-2xl bg-primary/20 border border-primary/30">
                    <div>
                      <p className="text-white/60 text-xs">{t("installmentsOf", { count: nivel.cuotas })}</p>
                      <p className="text-white font-bold text-2xl">${cuota.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-primary-light text-xs font-bold">{t("zeroInterest")}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  {Array.from({ length: Math.min(nivel.cuotas, 4) }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-white/60">
                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-white/40 text-xs shrink-0">
                        {i + 1}
                      </div>
                      <span>{t("installmentLine", { num: i + 1, amount: `$${cuota.toFixed(2)}`, day: (i + 1) * 14 })}</span>
                    </div>
                  ))}
                  {nivel.cuotas > 4 && (
                    <p className="text-white/40 text-xs pl-7">{t("moreInstallments", { count: nivel.cuotas - 4 })}</p>
                  )}
                </div>
              </div>

              <a
                href="#descarga"
                className="mt-6 w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-secondary text-white font-bold text-sm hover:bg-secondary-dark transition-colors"
              >
                {t("wantToUse")}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
