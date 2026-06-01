"use client";

import { useState } from "react";
import { Smartphone, Menu, X } from "lucide-react";
import Logo from "./Logo";

const links = [
  { href: "/#como-funciona", label: "Cómo funciona" },
  { href: "/lineas-de-credito", label: "Líneas de crédito" },
  { href: "/lineas-de-credito#simulador", label: "Simulador" },
  { href: "/telemedicina", label: "Telemedicina" },
  { href: "/club", label: "Club" },
  { href: "/faq", label: "FAQ" },
  { href: "/para-comercios", label: "Comercios" },
];

export default function MainNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm"
      style={{ isolation: "isolate" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#">
            <Logo size="md" />
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-slate-600 hover:text-primary transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* CTA desktop */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="/para-comercios"
              className="text-sm font-semibold text-primary hover:underline"
            >
              Soy Comercio
            </a>
            <a href="/#descarga" className="btn-primary text-sm px-5 py-2.5">
              <Smartphone className="w-4 h-4" />
              Descarga la app
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition-colors relative z-10"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu — animated slide-down */}
        <div
          className="md:hidden overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            maxHeight: open ? "400px" : "0px",
            opacity: open ? 1 : 0,
          }}
        >
          <div className="py-4 border-t border-slate-100 space-y-1 bg-white">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block px-3 py-2.5 text-sm font-medium text-slate-700 hover:text-primary hover:bg-primary-50 rounded-lg transition-colors"
              >
                {l.label}
              </a>
            ))}
            <div className="pt-3 flex flex-col gap-2 px-3">
              <a
                href="/para-comercios"
                className="btn-outline text-sm justify-center"
              >
                Soy Comercio
              </a>
              <a
                href="/#descarga"
                className="btn-primary text-sm justify-center"
              >
                <Smartphone className="w-4 h-4" />
                Descarga la app
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
