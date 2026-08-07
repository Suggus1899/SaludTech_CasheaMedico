"use client";

import { useState } from "react";
import Image from "next/image";
import { Logo } from "@saludtech/ui";
import { CheckCircle, ShieldCheck, Lightning, Globe } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

export default function Descarga() {
  const [contact, setContact] = useState("");
  const [sent, setSent] = useState(false);
  const t = useTranslations("Home.download");

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
            {t("badge")}
          </span>
        </div>

        <h2 className="font-display text-4xl sm:text-5xl font-bold text-dark mb-4">
          {t("title")}
        </h2>
        <p className="text-slate-500 text-lg mb-10 max-w-xl mx-auto">
          {t("subtitle")}
        </p>

        {/* App preview */}
        <div className="relative max-w-xs mx-auto mb-8">
          <Image
            src="/assets/hero_banner.png"
            alt="SaludTech app preview"
            width={320}
            height={200}
            className="w-full rounded-2xl shadow-xl border border-slate-200"
          />
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-10">
          <a
            href="/login"
            className="flex items-center gap-3 px-7 py-4 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-colors text-base font-semibold"
          >
            <Globe className="w-6 h-6 shrink-0" weight="duotone" />
            <div className="text-left">
              <p className="font-semibold text-sm leading-tight">{t("createAccountTitle")}</p>
              <p className="text-xs text-white/80 leading-tight">{t("createAccountSubtitle")}</p>
            </div>
          </a>
          <a
            href="/login"
            className="flex items-center gap-3 px-7 py-4 bg-white text-dark rounded-2xl shadow-md border border-slate-200 hover:border-primary hover:bg-primary-50 transition-all text-base font-semibold"
          >
            <CheckCircle className="w-6 h-6 shrink-0 text-secondary" weight="duotone" />
            <div className="text-left">
              <p className="font-semibold text-sm leading-tight">{t("haveAccountTitle")}</p>
              <p className="text-xs text-slate-400 leading-tight">{t("haveAccountSubtitle")}</p>
            </div>
          </a>
        </div>

        {/* Notification form */}
        <div className="max-w-md mx-auto mb-10">
          {sent ? (
            <div className="flex flex-col items-center gap-3 py-5 px-6 bg-secondary/10 border border-secondary/30 rounded-2xl">
              <CheckCircle className="w-8 h-8 text-secondary" weight="duotone" />
              <p className="font-display font-bold text-dark text-base">{t("successTitle")}</p>
              <p className="text-slate-400 text-xs">{t("successDesc")}</p>
              <button
                onClick={() => setSent(false)}
                className="text-xs text-primary hover:underline mt-1"
              >
                {t("registerAnother")}
              </button>
            </div>
          ) : (
            <form onSubmit={handleNotify} className="flex gap-2">
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder={t("placeholder")}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-dark placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <button
                type="submit"
                className="shrink-0 px-5 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-colors shadow-md shadow-primary/20"
              >
                {t("notifyMe")}
              </button>
            </form>
          )}
        </div>

        {/* Trust row */}
        <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-sm text-slate-500">
          {[
            { icon: ShieldCheck, text: t("trust1") },
            { icon: CheckCircle, text: t("trust2") },
            { icon: Lightning, text: t("trust3") },
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
