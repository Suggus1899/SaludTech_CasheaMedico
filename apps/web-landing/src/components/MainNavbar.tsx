"use client";

import { useState } from "react";
import { UserPlus, List, X } from "@phosphor-icons/react";
import { Logo } from "@saludtech/ui";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@saludtech/i18n";

export default function MainNavbar() {
  const [open, setOpen] = useState(false);
  const t = useTranslations("Nav");

  const links = [
    { href: "/#como-funciona", label: t("howItWorks") },
    { href: "/lineas-de-credito", label: t("creditLines") },
    { href: "/lineas-de-credito#simulador", label: t("simulator") },
    { href: "/telemedicina", label: t("telemedicine") },
    { href: "/club", label: t("club") },
    { href: "/faq", label: t("faq") },
    { href: "/para-comercios", label: t("merchants") },
  ];

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
            <LanguageSwitcher />
            <a
              href="/para-comercios"
              className="text-sm font-semibold text-primary hover:underline"
            >
              {t("iAmMerchant")}
            </a>
            <a href="/login" className="btn btn-primary btn-sm gap-2">
              <UserPlus className="w-4 h-4" />
              {t("register")}
            </a>
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center gap-2">
            <div className="md:hidden">
              <LanguageSwitcher />
            </div>
            <button
              type="button"
              className="md:hidden p-2 rounded-lg hover:bg-slate-100 active:bg-slate-200 transition-colors relative z-10"
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
                className="btn btn-outline btn-primary btn-sm w-full justify-center"
              >
                {t("iAmMerchant")}
              </a>
              <a
                href="/login"
                className="btn btn-primary btn-sm w-full justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                {t("register")}
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
