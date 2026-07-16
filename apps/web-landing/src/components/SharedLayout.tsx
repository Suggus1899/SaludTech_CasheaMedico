"use client";

import { useState } from "react";
import Link from "next/link";
import {
  UserPlus,
  List,
  X,
  Envelope,
  MapPin,
} from "@phosphor-icons/react";
import { Logo } from "@saludtech/ui";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@saludtech/i18n";

// ─── Navbar ───────────────────────────────────────────────────────────────────
export function Navbar() {
  const [open, setOpen] = useState(false);
  const t = useTranslations("Nav");

  const links = [
    { href: "/#como-funciona", label: t("howItWorks") },
    { href: "/lineas-de-credito", label: t("creditLines") },
    { href: "/lineas-de-credito#simulador", label: t("simulator") },
    { href: "/club", label: t("club") },
    { href: "/telemedicina", label: t("telemedicine") },
    { href: "/faq", label: t("faq") },
    { href: "/para-comercios", label: t("merchants") },
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
            <LanguageSwitcher />
            <Link
              href="/para-comercios"
              className="text-sm font-semibold text-primary hover:underline"
            >
              {t("iAmMerchant")}
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              {t("register")}
            </Link>
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center gap-2">
            <div className="md:hidden">
              <LanguageSwitcher />
            </div>
            <button
              type="button"
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition-colors"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? t("closeMenu") : t("openMenu")}
              aria-expanded={open}
            >
              {open ? <X className="w-5 h-5" /> : <List className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu — animated slide-down */}
        <div
          className="md:hidden overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            maxHeight: open ? '400px' : '0px',
            opacity: open ? 1 : 0,
          }}
        >
          <div className="py-4 border-t border-slate-100 space-y-1 bg-white">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block px-3 py-2.5 text-sm font-medium text-slate-700 hover:text-primary hover:bg-primary-50 rounded-lg transition-colors"
              >
                {l.label}
              </Link>
            ))}
            <div className="pt-3 flex flex-col gap-2 px-3">
              <Link
                href="/para-comercios"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-primary text-primary font-semibold text-sm hover:bg-primary hover:text-white transition-all"
              >
                {t("iAmMerchant")}
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all"
              >
                <UserPlus className="w-4 h-4" />
                {t("register")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
export function Footer() {
  const t = useTranslations("Footer");

  const links: Record<string, { label: string; href: string }[]> = {
    [t("sectionProduct")]: [
      { label: t("productHowItWorks"), href: "/#como-funciona" },
      { label: t("productCreditLines"), href: "/lineas-de-credito" },
      { label: t("productInstallmentSimulator"), href: "/lineas-de-credito#simulador" },
      { label: t("productClub"), href: "/club" },
      { label: t("productTelemedicine"), href: "/telemedicina" },
      { label: t("productElderCare"), href: "/telemedicina#elder-care" },
    ],
    [t("sectionMerchants")]: [
      { label: t("merchantsAffiliate"), href: "/para-comercios" },
      { label: t("merchantsHowItWorks"), href: "/para-comercios#como-funciona-comercio" },
      { label: t("merchantsPortal"), href: "#" },
      { label: t("merchantsDocuments"), href: "/para-comercios#proceso" },
    ],
    [t("sectionLegal")]: [
      { label: t("legalTerms"), href: "#" },
      { label: t("legalPrivacy"), href: "#" },
      { label: t("legalFaq"), href: "/faq" },
      { label: t("legalContact"), href: "mailto:hola@saludtech.app" },
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
              {t("description")}
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a
                href="mailto:hola@saludtech.app"
                className="flex items-center gap-2 text-white/40 hover:text-white text-xs transition-colors"
              >
                <Envelope className="w-4 h-4" />
                hola@saludtech.app
              </a>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className="flex items-center gap-2 text-white/40 text-xs">
                <MapPin className="w-4 h-4" />
                {t("location")}
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
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
          <p className="text-white/30 text-xs">
            {t("tagline")}
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
