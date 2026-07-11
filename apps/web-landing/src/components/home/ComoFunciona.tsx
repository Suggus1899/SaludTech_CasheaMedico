"use client";

import { DeviceMobile, Lightning, QrCode, CreditCard } from "@phosphor-icons/react";

export default function ComoFunciona() {
  const steps = [
    {
      num: "01",
      icon: DeviceMobile,
      title: "Descarga la app",
      desc: "Regístrate con tu cédula, número de teléfono y datos básicos. Sin papeleo.",
      color: "text-primary",
      bg: "bg-primary-50",
      border: "border-primary/20",
    },
    {
      num: "02",
      icon: Lightning,
      title: "Aprobación en 3 min",
      desc: "Evaluamos tu perfil al instante y te asignamos tus líneas de crédito médico.",
      color: "text-secondary",
      bg: "bg-secondary-50",
      border: "border-secondary/20",
    },
    {
      num: "03",
      icon: QrCode,
      title: "Escanea en el comercio",
      desc: "El comercio genera un QR. Tú lo escaneas y pagas la inicial directamente desde la app.",
      color: "text-accent",
      bg: "bg-accent-50",
      border: "border-accent/20",
    },
    {
      num: "04",
      icon: CreditCard,
      title: "Paga en cuotas",
      desc: "El resto se divide en 3 cuotas iguales cada 14 días. Sin interés, sin sorpresas.",
      color: "text-primary",
      bg: "bg-primary-50",
      border: "border-primary/20",
    },
  ];

  return (
    <section id="como-funciona" className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="section-tag bg-primary-100 text-primary mb-4">
            <Lightning className="w-3.5 h-3.5" /> Simple y rápido
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-dark mb-4">
            Cómo funciona SaludTech
          </h2>
          <p className="text-slate-500 text-lg">
            Desde el registro hasta tu primera compra en menos de 5 minutos.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={step.num} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-px bg-linear-to-r from-slate-200 to-transparent z-10 translate-x-2" />
              )}
              <div className={`card-hover bg-white rounded-2xl p-6 border ${step.border} shadow-sm h-full`}>
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-12 h-12 rounded-xl ${step.bg} flex items-center justify-center`}>
                    <step.icon className={`w-6 h-6 ${step.color}`} />
                  </div>
                  <span className={`font-display text-4xl font-bold ${step.color} opacity-20`}>
                    {step.num}
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg text-dark mb-2">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
