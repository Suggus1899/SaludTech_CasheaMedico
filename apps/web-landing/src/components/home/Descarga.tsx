"use client";

import { useState } from "react";
import Logo from "../Logo";
import { CheckCircle, ShieldCheck, Lightning } from "@phosphor-icons/react";

export default function Descarga() {
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
