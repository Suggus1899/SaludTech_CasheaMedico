"use client";

import { useState } from "react";
import { Heart, Copy, Check, Envelope, Code, Coffee } from "@phosphor-icons/react";
import SharedLayout from "../../components/SharedLayout";
import { useTranslations } from "next-intl";

const ZINLI_EMAIL = "suggus1899@gmail.com";

export default function ApoyaPage() {
  const t = useTranslations("Apoya");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ZINLI_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback: select text
    }
  };

  return (
    <SharedLayout>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 right-0 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-accent/10 blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 border border-primary/30 mb-6">
            <Heart className="w-4 h-4 text-primary" weight="duotone" />
            <span className="text-primary text-xs font-semibold tracking-widest uppercase">
              {t("badge")}
            </span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            {t("titleLine1")}
            <br />
            <span className="text-gradient-primary">{t("titleLine2")}</span>
          </h1>
          <p className="text-slate-300 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            {t("subtitle")}
          </p>
        </div>
      </section>

      {/* Creator section */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="section-tag bg-primary-50 text-primary mb-4">
              <Code className="w-3.5 h-3.5" weight="duotone" /> {t("creatorTag")}
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-dark mb-4">
              {t("creatorTitle")}
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed max-w-2xl mx-auto">
              {t("creatorDesc")}
            </p>
          </div>

          {/* Donation card */}
          <div className="bg-surface rounded-3xl border border-slate-100 p-8 sm:p-10 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mb-5">
                <Heart className="w-8 h-8 text-primary" weight="duotone" />
              </div>
              <h3 className="font-display text-2xl font-bold text-dark mb-3">
                {t("donateTitle")}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-md mb-6">
                {t("donateDesc")}
              </p>

              {/* Zinli email */}
              <div className="w-full max-w-md p-4 rounded-2xl bg-base-200 border border-slate-200 mb-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Envelope className="w-5 h-5 text-primary shrink-0" />
                    <div className="min-w-0 text-left">
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                        {t("zinliLabel")}
                      </p>
                      <p className="text-sm font-mono font-semibold text-dark truncate">
                        {ZINLI_EMAIL}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleCopy}
                    className={`btn btn-sm shrink-0 ${copied ? "btn-success" : "btn-outline"}`}
                    aria-label={t("copy")}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        {t("copied")}
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        {t("copy")}
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-primary/8 w-full max-w-md">
                <Coffee className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-primary leading-relaxed text-left">
                  {t("instructions")}
                </p>
              </div>
            </div>
          </div>

          {/* Thank you */}
          <div className="text-center mt-10">
            <p className="font-display text-xl text-dark font-bold mb-2">
              {t("thankYou")}
            </p>
            <p className="text-slate-400 text-sm">
              {t("thankYouDesc")}
            </p>
          </div>
        </div>
      </section>
    </SharedLayout>
  );
}
