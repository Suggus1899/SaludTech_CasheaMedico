"use client";

import { Medal, TrendUp, Clock, Lightning, Shield, ArrowRight, UserPlus } from "@phosphor-icons/react";
import Link from "next/link";
import SharedLayout from "../../components/SharedLayout";
import { useTranslations } from "next-intl";

function ClubSaludTech() {
  const t = useTranslations("Club");

  const levels = [
    { num: 1, label: t("levels.bronze"), limit: "$80", installments: t("levels.installments3"), color: "bg-amber-600", text: "text-amber-700", bg: "bg-amber-50" },
    { num: 2, label: t("levels.silver"), limit: "$130", installments: t("levels.installments3"), color: "bg-slate-400", text: "text-slate-600", bg: "bg-slate-50" },
    { num: 3, label: t("levels.gold"), limit: "$180", installments: t("levels.upTo6"), color: "bg-yellow-500", text: "text-yellow-700", bg: "bg-yellow-50" },
    { num: 4, label: t("levels.platinum"), limit: "$240", installments: t("levels.upTo9"), color: "bg-cyan-500", text: "text-cyan-700", bg: "bg-cyan-50" },
    { num: 5, label: t("levels.diamond"), limit: "$320", installments: t("levels.upTo12"), color: "bg-primary", text: "text-primary-dark", bg: "bg-primary-50" },
    { num: 6, label: t("levels.elite"), limit: "$400+", installments: t("levels.upTo12"), color: "bg-accent", text: "text-accent", bg: "bg-accent-50" },
  ];

  const benefits = [
    { icon: TrendUp, title: t("benefits.growingLimitTitle"), desc: t("benefits.growingLimitDesc") },
    { icon: Clock, title: t("benefits.moreInstallmentsTitle"), desc: t("benefits.moreInstallmentsDesc") },
    { icon: Lightning, title: t("benefits.punctualityPointsTitle"), desc: t("benefits.punctualityPointsDesc") },
    { icon: Shield, title: t("benefits.elderCareUnlockedTitle"), desc: t("benefits.elderCareUnlockedDesc") },
  ];

  return (
    <section id="club" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="section-tag bg-amber-50 text-amber-600 mb-4">
            <Medal className="w-3.5 h-3.5" weight="duotone" /> {t("section.tag")}
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-dark mb-4">
            {t("section.titleLine1")}
            <br />
            <span className="text-gradient-primary">{t("section.titleLine2")}</span>
          </h2>
          <p className="text-slate-500 text-lg">
            {t("section.subtitle")}
          </p>
        </div>

        {/* Level grid */}
        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-16">
          {levels.map((lvl) => (
            <div
              key={lvl.num}
              className={`${lvl.bg} rounded-2xl p-4 text-center border border-slate-100 card-hover`}
            >
              <div className={`w-10 h-10 rounded-full ${lvl.color} mx-auto flex items-center justify-center mb-2`}>
                <span className="text-white font-bold text-sm">{lvl.num}</span>
              </div>
              <div className={`font-display font-bold text-sm ${lvl.text} mb-1`}>{lvl.label}</div>
              <div className="text-slate-700 font-bold text-base">{lvl.limit}</div>
              <div className="text-slate-500 text-xs mt-1">{lvl.installments}</div>
            </div>
          ))}
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b) => (
            <div key={b.title} className="bg-surface rounded-2xl p-6 border border-slate-100 card-hover">
              <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center mb-4">
                <b.icon className="w-6 h-6 text-primary" />
              </div>
              <h4 className="font-display font-bold text-dark mb-2">{b.title}</h4>
              <p className="text-slate-500 text-sm leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Hero() {
  const t = useTranslations("Club.hero");
  return (
    <section className="pt-32 pb-20 bg-hero-gradient relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 right-0 w-96 h-96 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
      </div>
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/15 border border-amber-400/30 mb-6">
          <Medal className="w-4 h-4 text-amber-400" weight="duotone" />
          <span className="text-amber-300 text-xs font-semibold tracking-widest uppercase">{t("badge")}</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          {t("titleLine1")}
          <br />
          <span className="bg-clip-text text-transparent bg-linear-to-r from-amber-400 to-primary">
            {t("titleLine2")}
          </span>
        </h1>
        <p className="text-slate-300 text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
          {t("subtitle")}
        </p>
        <a href="#club" className="inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-amber-500 text-white font-bold text-base hover:bg-amber-600 transition-colors">
          {t("seeBenefits")}
          <ArrowRight className="w-5 h-5" />
        </a>
      </div>
    </section>
  );
}

function CTAFinal() {
  const t = useTranslations("Club.cta");
  return (
    <section className="py-20 bg-linear-to-r from-primary to-secondary">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="font-display text-4xl font-bold text-white mb-4">
          {t("title")}
        </h2>
        <p className="text-white/80 text-lg mb-8">
          {t("subtitle")}
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-white text-primary font-bold text-base hover:bg-primary-50 transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            {t("createAccount")}
          </Link>
          <Link
            href="/lineas-de-credito"
            className="inline-flex items-center gap-2 px-7 py-4 rounded-xl border-2 border-white/40 text-white font-bold text-base hover:bg-white/10 transition-colors"
          >
            {t("seeCreditLines")}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function ClubPage() {
  return (
    <SharedLayout>
      <Hero />
      <ClubSaludTech />
      <CTAFinal />
    </SharedLayout>
  );
}
