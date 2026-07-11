"use client";

import { DeviceMobile, CaretRight, CreditCard, Waveform, QrCode, CheckCircle } from "@phosphor-icons/react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-hero-gradient pt-16">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -right-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-1/4 -left-32 w-80 h-80 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Text */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 border border-primary/30">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-primary text-xs font-semibold tracking-widest uppercase">
                BNPL Médico · Sin intereses
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight">
              Tu salud,
              <br />
              <span className="text-gradient-primary bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
                sin esperar
              </span>
              <br />
              ni endeudarte
            </h1>

            <p className="text-slate-300 text-lg sm:text-xl leading-relaxed max-w-lg">
              Accede a farmacias, clínicas, especialistas y cuidado para adultos
              mayores. Paga solo la inicial y el resto en cuotas cada 14 días,{" "}
              <strong className="text-white">con 0% de interés.</strong>
            </p>

            <div className="flex flex-wrap gap-4">
              <a href="#descarga" className="btn btn-primary gap-2 px-7 py-4 text-base h-auto">
                <DeviceMobile className="w-5 h-5" />
                Descargar app gratis
              </a>
              <a href="#como-funciona" className="btn btn-ghost text-white border-white/30 hover:bg-white/10 gap-2 px-7 py-4 text-base h-auto">
                Cómo funciona
                <CaretRight className="w-5 h-5" />
              </a>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 sm:gap-8 pt-4">
              {[
                { value: "0%", label: "Interés siempre" },
                { value: "3 min", label: "Aprobación" },
                { value: "14 días", label: "Entre cuotas" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-3xl font-display font-bold text-white">{s.value}</div>
                  <div className="text-slate-400 text-sm mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual card mockup */}
          <div className="hidden md:flex justify-center items-center">
            <div className="relative">
              {/* Main app card */}
              <div className="w-64 md:w-72 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-white/60 text-xs">Línea disponible</p>
                    <p className="text-white font-display font-bold text-2xl">$240.00</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-primary/30 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-primary-light" weight="duotone" />
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Salud Cotidiana", amount: "$80", color: "bg-secondary" },
                    { label: "Especialidad", amount: "$120", color: "bg-primary" },
                    { label: "Mayor Cuidado", amount: "$40", color: "bg-accent" },
                  ].map((line) => (
                    <div key={line.label} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${line.color}`} />
                        <span className="text-white/80 text-xs">{line.label}</span>
                      </div>
                      <span className="text-white text-sm font-semibold">{line.amount}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 p-3 rounded-xl bg-linear-to-r from-secondary/20 to-primary/20 border border-secondary/30">
                  <div className="flex items-center gap-2">
                    <Waveform className="w-4 h-4 text-secondary" weight="duotone" />
                    <span className="text-white/80 text-xs font-medium">Nivel 2 · 45/50 pts al siguiente</span>
                  </div>
                </div>
              </div>

              {/* Floating QR badge */}
              <div className="absolute -bottom-6 -left-8 bg-white rounded-2xl p-4 shadow-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                    <QrCode className="w-5 h-5 text-primary" weight="duotone" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Pago en clínica</p>
                    <p className="text-sm font-bold text-dark">Escanea y listo</p>
                  </div>
                </div>
              </div>

              {/* Floating approval badge */}
              <div className="absolute -top-4 -right-8 bg-white rounded-2xl px-4 py-3 shadow-2xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-secondary" weight="duotone" />
                  <span className="text-sm font-bold text-dark">¡Aprobado!</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">en 3 minutos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
