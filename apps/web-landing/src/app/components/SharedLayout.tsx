"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Smartphone,
  Menu,
  X,
  Mail,
  MapPin,
} from "lucide-react";
import Logo from "./Logo";

// ─── Navbar ───────────────────────────────────────────────────────────────────
export function Navbar() {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/#como-funciona", label: "Cómo funciona" },
    { href: "/lineas-de-credito", label: "Líneas de crédito" },
    { href: "/#simulador", label: "Simulador" },
    { href: "/#club", label: "Club" },
    { href: "/#faq", label: "FAQ" },
    { href: "/para-comercios", label: "Comercios" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <Logo size="md" />
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-slate-600 hover:text-primary transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/para-comercios"
              className="text-sm font-semibold text-primary hover:underline"
            >
              Soy Comercio
            </Link>
            <Link
              href="/#descarga"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-colors"
            >
              <Smartphone className="w-4 h-4" />
              Descarga la app
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100"
            onClick={() => setOpen(!open)}
            aria-label="Menú"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden py-4 border-t border-slate-100 space-y-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block px-3 py-2.5 text-sm font-medium text-slate-700 hover:text-primary hover:bg-primary-50 rounded-lg"
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-3 flex flex-col gap-2 px-3">
              <Link
                href="/para-comercios"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-primary text-primary font-semibold text-sm hover:bg-primary hover:text-white transition-all"
              >
                Soy Comercio
              </Link>
              <Link
                href="/#descarga"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all"
              >
                <Smartphone className="w-4 h-4" />
                Descarga la app
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
export function Footer() {
  const links: Record<string, { label: string; href: string }[]> = {
    Producto: [
      { label: "Cómo funciona", href: "/#como-funciona" },
      { label: "Líneas de crédito", href: "/lineas-de-credito" },
      { label: "Simulador de cuotas", href: "/#simulador" },
      { label: "Club SaludTech", href: "/#club" },
      { label: "Telemedicina", href: "/#triage" },
      { label: "Elder Care", href: "/#elder-care" },
    ],
    Comercios: [
      { label: "Afilia tu comercio", href: "/para-comercios" },
      { label: "Cómo funciona el cobro", href: "/para-comercios#como-funciona-comercio" },
      { label: "Portal de comercios", href: "#" },
      { label: "Documentos requeridos", href: "/para-comercios#proceso" },
    ],
    Legal: [
      { label: "Términos y condiciones", href: "#" },
      { label: "Política de privacidad", href: "#" },
      { label: "Preguntas frecuentes", href: "/#faq" },
      { label: "Contacto", href: "mailto:hola@saludtech.app" },
    ],
  };

  return (
    <footer className="bg-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <Logo size="md" light />
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Financiamiento médico sin interés para ti y tu familia. Tu salud primero,
              el pago después.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a
                href="mailto:hola@saludtech.app"
                className="flex items-center gap-2 text-white/40 hover:text-white text-xs transition-colors"
              >
                <Mail className="w-4 h-4" />
                hola@saludtech.app
              </a>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className="flex items-center gap-2 text-white/40 text-xs">
                <MapPin className="w-4 h-4" />
                Venezuela
              </span>
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 className="font-semibold text-sm mb-4 text-white/80">{section}</h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="text-white/40 hover:text-white text-sm transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} SaludTech. Todos los derechos reservados.
          </p>
          <p className="text-white/30 text-xs">
            Financiamiento sin interés · No somos un banco · Venezuela
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── SharedLayout wrapper ──────────────────────────────────────────────────────
export default function SharedLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="pt-16">{children}</div>
      <Footer />
    </>
  );
}
