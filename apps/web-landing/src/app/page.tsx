"use client";

import { useState } from "react";
import MainNavbar from "./components/MainNavbar";
import Logo from "./components/Logo";
import { Footer } from "./components/SharedLayout";
import {
  CaretRight,
  DeviceMobile,
  QrCode,
  CreditCard,
  CheckCircle,
  Buildings,
  Waveform,
  Lightning,
  Clock,
  ShieldCheck,
} from "@phosphor-icons/react";

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
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

// ─── Trust Strip ─────────────────────────────────────────────────────────────
function TrustStrip() {
  const items = [
    { value: "0%", label: "Interés siempre", icon: CheckCircle, color: "text-secondary" },
    { value: "3 min", label: "Aprobación instantánea", icon: Lightning, color: "text-primary" },
    { value: "+200", label: "Comercios aliados", icon: Buildings, color: "text-accent" },
    { value: "14 días", label: "Tiempo entre cuotas", icon: Clock, color: "text-secondary" },
    { value: "100%", label: "Digital, sin papeles", icon: ShieldCheck, color: "text-primary" },
  ];
  return (
    <div className="bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-x divide-slate-100">
          {items.map((item) => (
            <div key={item.label} className="flex flex-col items-center py-5 px-4 gap-1 text-center">
              <item.icon className={`w-5 h-5 ${item.color} mb-1`} />
              <span className="font-display font-bold text-xl text-dark">{item.value}</span>
              <span className="text-xs text-slate-400 leading-tight">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


// ─── Cómo funciona ────────────────────────────────────────────────────────────
function ComoFunciona() {
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

// ─── Descarga ──────────────────────────────────────────────────────────────────
function Descarga() {
  const [contact, setContact] = useState("");
  const [sent, setSent] = useState(false);

  function handleNotify(e: React.FormEvent) {
    e.preventDefault();
    if (!contact.trim()) return;
    setSent(true);
    setContact("");
  }

  return (
    <section id="descarga" className="py-24 bg-linear-to-br from-primary-50 via-white to-secondary-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <div className="flex justify-center mb-6">
          <Logo size="lg" variant="icon" />
        </div>

        {/* Status badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/30 mb-5">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span className="text-secondary text-xs font-bold tracking-widest uppercase">
            App en desarrollo final
          </span>
        </div>

        <h2 className="font-display text-4xl sm:text-5xl font-bold text-dark mb-4">
          Muy pronto en tu bolsillo
        </h2>
        <p className="text-slate-500 text-lg mb-10 max-w-xl mx-auto">
          La app está en su fase final de pruebas. Déjanos tu teléfono o correo y serás de
          los primeros en descargarla cuando esté lista.
        </p>

        {/* Store buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-10">

          {/* Android — próximamente, primer en llegar */}
          <div className="relative group">
            <div className="flex items-center gap-3 px-6 py-4 bg-dark text-white rounded-2xl shadow-lg cursor-default select-none">
              {/* Android icon */}
              <svg className="w-7 h-7 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.523 15.341A4.91 4.91 0 0 0 19 12a4.91 4.91 0 0 0-1.477-3.341l1.292-1.292a.75.75 0 1 0-1.06-1.06l-1.294 1.293A6.938 6.938 0 0 0 12 7a6.938 6.938 0 0 0-4.461 1.6L6.245 7.307a.75.75 0 1 0-1.06 1.06l1.292 1.292A4.91 4.91 0 0 0 5 12a4.91 4.91 0 0 0 1.477 3.341l-1.292 1.292a.75.75 0 1 0 1.06 1.06l1.294-1.293A6.938 6.938 0 0 0 12 17a6.938 6.938 0 0 0 4.461-1.6l1.294 1.293a.75.75 0 1 0 1.06-1.06l-1.292-1.292zM9 12a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm6 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
              </svg>
              <div className="text-left">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                  <p className="text-xs text-secondary font-bold leading-none">Próximamente</p>
                </div>
                <p className="font-semibold text-sm leading-tight">Google Play</p>
              </div>
            </div>
            {/* Tooltip */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-56 bg-dark text-white text-xs rounded-xl px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-10">
              ¡Estamos en la recta final! Regístrate abajo para ser el primero 🚀
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-dark rotate-45" />
            </div>
          </div>

          {/* iOS — llega después */}
          <div className="relative group">
            <div className="flex items-center gap-3 px-6 py-4 bg-slate-400/60 text-white rounded-2xl shadow-md border-2 border-dashed border-slate-300 cursor-default select-none">
              {/* Apple icon */}
              <svg className="w-7 h-7 shrink-0 opacity-80" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <div className="text-left">
                <p className="text-xs text-white/70 font-semibold leading-none mb-0.5">En camino… 🍎</p>
                <p className="font-semibold text-sm leading-tight">App Store</p>
              </div>
            </div>
            {/* Tooltip */}
            <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-60 bg-dark text-white text-xs rounded-xl px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-10">
              La versión iOS llega justo después de Android. ¡Paciencia, manzaneros! 🍎
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-dark rotate-45" />
            </div>
          </div>
        </div>

        {/* Notification form */}
        <div className="max-w-md mx-auto mb-10">
          {sent ? (
            <div className="flex flex-col items-center gap-3 py-5 px-6 bg-secondary/10 border border-secondary/30 rounded-2xl">
              <CheckCircle className="w-8 h-8 text-secondary" weight="duotone" />
              <p className="font-display font-bold text-dark text-base">¡Listo! Te avisamos en cuanto esté disponible 🎉</p>
              <p className="text-slate-400 text-xs">Eres parte de los primeros usuarios de SaludTech.</p>
              <button
                onClick={() => setSent(false)}
                className="text-xs text-primary hover:underline mt-1"
              >
                Registrar otro contacto
              </button>
            </div>
          ) : (
            <form onSubmit={handleNotify} className="flex gap-2">
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Tu teléfono o correo electrónico"
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-dark placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <button
                type="submit"
                className="shrink-0 px-5 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-colors shadow-md shadow-primary/20"
              >
                Avísame
              </button>
            </form>
          )}
        </div>

        {/* Trust row */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-sm text-slate-500">
          {[
            { icon: ShieldCheck, text: "Datos protegidos" },
            { icon: CheckCircle, text: "Sin cuotas ocultas" },
            { icon: Lightning, text: "Aprobación en 3 min" },
          ].map((f) => (
            <div key={f.text} className="flex items-center gap-2">
              <f.icon className="w-4 h-4 text-secondary" />
              <span>{f.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <main>
      <MainNavbar />
      <Hero />
      <TrustStrip />
      <ComoFunciona />
      <Descarga />
      <Footer />
    </main>
  );
}
