"use client";

import {
  Buildings,
  FileText,
  CheckCircle,
  QrCode,
  TrendUp,
  CreditCard,
  ShieldCheck,
  Users,
  Clock,
  ArrowRight,
  Phone,
  Envelope,
  CaretRight,
  Star,
  Pill,
  Stethoscope,
  Waveform,
  Heart,
  Shield,
} from "@phosphor-icons/react";
import Link from "next/link";
import SharedLayout from "../../components/SharedLayout";
import { useTranslations } from "next-intl";

// ─── Hero Comercios ────────────────────────────────────────────────────────────
function Hero() {
  const t = useTranslations("Merchants.hero");
  return (
    <section className="pt-32 pb-20 bg-hero-gradient overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 -right-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 -left-20 w-72 h-72 rounded-full bg-secondary/10 blur-3xl" />
      </div>
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 border border-primary/30 mb-6">
          <Buildings className="w-4 h-4 text-primary" />
          <span className="text-primary text-xs font-semibold tracking-widest uppercase">{t("badge")}</span>
        </div>
        <h1 className="font-display text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">
          {t("titleLine1")}
          <br />
          <span className="bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary">
            {t("titleLine2")}
          </span>
        </h1>
        <p className="text-slate-300 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          {t("subtitle")}
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <a
            href="#proceso"
            className="inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-primary text-white font-bold text-base hover:bg-primary-dark transition-colors shadow-lg shadow-primary/30"
          >
            {t("seeHowToAffiliate")}
            <ArrowRight className="w-5 h-5" />
          </a>
          <a
            href="tel:+58000SALUDTECH"
            className="inline-flex items-center gap-2 px-7 py-4 rounded-xl border-2 border-white/30 text-white font-bold text-base hover:bg-white/10 transition-colors"
          >
            <Phone className="w-5 h-5" weight="regular" />
            {t("talkToAdvisor")}
          </a>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-16 max-w-2xl mx-auto">
          {[
            { value: t("stat1Value"), label: t("stat1Label") },
            { value: t("stat2Value"), label: t("stat2Label") },
            { value: t("stat3Value"), label: t("stat3Label") },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-display font-bold text-white">{s.value}</div>
              <div className="text-slate-400 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Beneficios ────────────────────────────────────────────────────────────────
function Beneficios() {
  const t = useTranslations("Merchants.benefits");

  const items = [
    {
      icon: TrendUp,
      title: t("item1Title"),
      desc: t("item1Desc"),
      color: "text-secondary",
      bg: "bg-secondary-50",
    },
    {
      icon: CreditCard,
      title: t("item2Title"),
      desc: t("item2Desc"),
      color: "text-primary",
      bg: "bg-primary-50",
    },
    {
      icon: Users,
      title: t("item3Title"),
      desc: t("item3Desc"),
      color: "text-accent",
      bg: "bg-accent-50",
    },
    {
      icon: QrCode,
      title: t("item4Title"),
      desc: t("item4Desc"),
      color: "text-primary",
      bg: "bg-primary-50",
    },
    {
      icon: ShieldCheck,
      title: t("item5Title"),
      desc: t("item5Desc"),
      color: "text-secondary",
      bg: "bg-secondary-50",
    },
    {
      icon: Clock,
      title: t("item6Title"),
      desc: t("item6Desc"),
      color: "text-accent",
      bg: "bg-accent-50",
    },
  ];

  return (
    <section id="beneficios" className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-dark mb-4">
            {t("title")}
          </h2>
          <p className="text-slate-500 text-lg">
            {t("subtitle")}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.title} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
              <div className={`w-12 h-12 rounded-2xl ${item.bg} flex items-center justify-center mb-5`}>
                <item.icon className={`w-6 h-6 ${item.color}`} />
              </div>
              <h3 className="font-display font-bold text-dark text-lg mb-2">{item.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Cómo funciona para el comercio ──────────────────────────────────────────
function ComoFunciona() {
  const t = useTranslations("Merchants.howItWorks");

  const steps = [
    {
      num: "01",
      title: t("step1Title"),
      desc: t("step1Desc"),
    },
    {
      num: "02",
      title: t("step2Title"),
      desc: t("step2Desc"),
    },
    {
      num: "03",
      title: t("step3Title"),
      desc: t("step3Desc"),
    },
    {
      num: "04",
      title: t("step4Title"),
      desc: t("step4Desc"),
    },
    {
      num: "05",
      title: t("step5Title"),
      desc: t("step5Desc"),
    },
    {
      num: "06",
      title: t("step6Title"),
      desc: t("step6Desc"),
    },
  ];

  return (
    <section id="como-funciona-comercio" className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-primary-100 text-primary mb-4">
            <QrCode className="w-3.5 h-3.5" weight="duotone" /> {t("tag")}
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-dark mb-4">
            {t("title")}
          </h2>
          <p className="text-slate-500 text-lg">
            {t("subtitle")}
          </p>
        </div>

        <div className="relative">
          <div className="hidden md:block absolute left-6 top-8 bottom-8 w-px bg-linear-to-b from-primary via-secondary to-accent" />
          <div className="space-y-6">
            {steps.map((step, i) => (
              <div key={step.num} className="relative flex gap-6 md:pl-16">
                <div className="hidden md:flex absolute left-0 w-12 h-12 rounded-full bg-white border-2 border-primary items-center justify-center shrink-0 font-display font-bold text-primary text-sm">
                  {step.num}
                </div>
                <div className="flex md:hidden w-10 h-10 rounded-full bg-primary-50 border border-primary/30 items-center justify-center shrink-0 font-display font-bold text-primary text-xs">
                  {i + 1}
                </div>
                <div className="bg-surface rounded-2xl p-5 border border-slate-100 flex-1">
                  <h4 className="font-display font-bold text-dark mb-1">{step.title}</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Proceso de afiliación ────────────────────────────────────────────────────
function ProcesoAfiliacion() {
  const t = useTranslations("Merchants.affiliation");

  const pasos = [
    {
      num: 1,
      title: t("step1Title"),
      desc: t("step1Desc"),
      icon: FileText,
    },
    {
      num: 2,
      title: t("step2Title"),
      desc: t("step2Desc"),
      icon: CheckCircle,
    },
    {
      num: 3,
      title: t("step3Title"),
      desc: t("step3Desc"),
      icon: ShieldCheck,
    },
    {
      num: 4,
      title: t("step4Title"),
      desc: t("step4Desc"),
      icon: Buildings,
    },
  ];

  const documentos = [
    { nombre: t("doc1Name"), desc: t("doc1Desc") },
    { nombre: t("doc2Name"), desc: t("doc2Desc") },
    { nombre: t("doc3Name"), desc: t("doc3Desc") },
    { nombre: t("doc4Name"), desc: t("doc4Desc") },
    { nombre: t("doc5Name"), desc: t("doc5Desc") },
  ];

  return (
    <section id="proceso" className="py-24 bg-linear-to-br from-dark via-slate-900 to-dark text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-white/10 text-white/70 mb-4">
            <Star className="w-3.5 h-3.5" weight="duotone" /> {t("tag")}
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold mb-4">
            {t("title")}
          </h2>
          <p className="text-white/60 text-lg">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
          {/* Pasos */}
          <div className="space-y-5">
            {pasos.map((paso) => (
              <div key={paso.num} className="flex gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/8 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                  <paso.icon className="w-6 h-6 text-primary-light" />
                </div>
                <div>
                  <div className="text-white/40 text-xs font-semibold mb-1">{t("stepLabel", { num: paso.num })}</div>
                  <h4 className="font-display font-bold text-white mb-1">{paso.title}</h4>
                  <p className="text-white/60 text-sm leading-relaxed">{paso.desc}</p>
                </div>
              </div>
            ))}

            <a
              href="mailto:comercios@saludtech.app"
              className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-primary text-white font-bold text-base hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20 mt-4"
            >
              <Envelope className="w-5 h-5" />
              {t("startRegistration")}
            </a>
          </div>

          {/* Documentos requeridos */}
          <div className="bg-white/5 rounded-3xl border border-white/10 p-7">
            <h3 className="font-display font-bold text-white text-xl mb-2">{t("documentsTitle")}</h3>
            <p className="text-white/50 text-sm mb-6">{t("documentsSubtitle")}</p>
            <div className="space-y-4">
              {documentos.map((doc) => (
                <div key={doc.nombre} className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-secondary shrink-0 mt-0.5" weight="duotone" />
                  <div>
                    <p className="text-white font-semibold text-sm">{doc.nombre}</p>
                    <p className="text-white/50 text-xs">{doc.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-white/60 text-sm">{t("doubtsAboutDocs")}</p>
              <a href="mailto:comercios@saludtech.app" className="flex items-center gap-2 text-primary-light text-sm font-semibold mt-2 hover:underline">
                <Envelope className="w-4 h-4" />
                comercios@saludtech.app
              </a>
              <a href="tel:+58000SALUDTECH" className="flex items-center gap-2 text-primary-light text-sm font-semibold mt-1 hover:underline">
                <Phone className="w-4 h-4" />
                +58 000-SALUDTECH
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Categorías aceptadas ──────────────────────────────────────────────────────
function Categorias() {
  const t = useTranslations("Merchants.categories");

  const cats = [
    t("cat1"), t("cat2"), t("cat3"), t("cat4"),
    t("cat5"), t("cat6"), t("cat7"), t("cat8"),
    t("cat9"), t("cat10"), t("cat11"), t("cat12"),
  ];

  return (
    <section className="py-20 bg-surface">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-dark mb-4">
          {t("title")}
        </h2>
        <p className="text-slate-500 mb-10">{t("subtitle")}</p>
        <div className="flex flex-wrap justify-center gap-3">
          {cats.map((cat) => (
            <span
              key={cat}
              className="px-4 py-2 bg-white rounded-full text-sm font-semibold text-slate-700 border border-slate-200 shadow-sm"
            >
              {cat}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA final ────────────────────────────────────────────────────────────────
function CTAFinal() {
  const t = useTranslations("Merchants.cta");
  return (
    <section className="py-20 bg-primary">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="font-display text-4xl font-bold text-white mb-4">
          {t("title")}
        </h2>
        <p className="text-white/70 text-lg mb-8">
          {t("subtitle")}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="mailto:comercios@saludtech.app"
            className="inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-white text-primary font-bold text-base hover:bg-primary-50 transition-colors"
          >
            <Envelope className="w-5 h-5" />
            {t("affiliateMerchant")}
          </a>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-7 py-4 rounded-xl border-2 border-white/40 text-white font-bold text-base hover:bg-white/10 transition-colors"
          >
            {t("seeMainLanding")}
            <CaretRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Red de Aliados ───────────────────────────────────────────────────────────
function RedAliados() {
  const t = useTranslations("Merchants.allies");

  const categorias = [
    { label: t("cat1Label"), icon: Pill, count: "48" },
    { label: t("cat2Label"), icon: Buildings, count: "32" },
    { label: t("cat3Label"), icon: Stethoscope, count: "67" },
    { label: t("cat4Label"), icon: Waveform, count: "24" },
    { label: t("cat5Label"), icon: ShieldCheck, count: "18" },
    { label: t("cat6Label"), icon: Heart, count: "21" },
    { label: t("cat7Label"), icon: Star, count: "30" },
    { label: t("cat8Label"), icon: Shield, count: "15" },
  ];

  return (
    <section id="aliados" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <div className="section-tag bg-secondary-50 text-secondary mb-3">
              <Buildings className="w-3.5 h-3.5" /> {t("tag")}
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-dark">
              {t("titleLine1")}
              <br />
              <span className="text-primary">{t("titleLine2")}</span>
            </h2>
          </div>
          <a
            href="#proceso"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-primary text-primary font-bold text-sm hover:bg-primary hover:text-white transition-colors"
          >
            {t("affiliateMerchant")}
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Category grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-10">
          {categorias.map((cat) => (
            <button
              key={cat.label}
              className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-surface border border-slate-100 hover:border-primary hover:bg-primary-50 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-white group-hover:bg-primary/10 flex items-center justify-center border border-slate-100 transition-colors">
                <cat.icon className="w-5 h-5 text-slate-500 group-hover:text-primary transition-colors" />
              </div>
              <span className="text-xs font-semibold text-slate-600 group-hover:text-primary transition-colors text-center leading-tight">{cat.label}</span>
              <span className="text-xs text-slate-400">{t("alliesCount", { count: cat.count })}</span>
            </button>
          ))}
        </div>

        {/* Logos placeholder strip */}
        <div className="relative overflow-hidden rounded-2xl bg-surface border border-slate-100 py-6 px-8">
          <p className="text-center text-xs text-slate-400 uppercase tracking-wider font-semibold mb-6">{t("someAllies")}</p>
          <div className="flex flex-wrap justify-center items-center gap-6 opacity-60">
            {[
              "Farmatodo", "Locatel", "Clinica El Ávila", "Centro Médico",
              "Bio Centro", "Vargas Medical", "Clínica Las Mercedes", "PharmaCare",
            ].map((name) => (
              <div key={name} className="px-5 py-2.5 bg-white rounded-xl border border-slate-200 text-sm font-semibold text-slate-500 shadow-sm">
                {name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Para Comercios Banner ─────────────────────────────────────────────────────
function ParaComerciosBanner() {
  const t = useTranslations("Merchants.banner");

  const benefits = [
    { icon: TrendUp, title: t("benefit1Title"), desc: t("benefit1Desc") },
    { icon: CreditCard, title: t("benefit2Title"), desc: t("benefit2Desc") },
    { icon: QrCode, title: t("benefit3Title"), desc: t("benefit3Desc") },
    { icon: ShieldCheck, title: t("benefit4Title"), desc: t("benefit4Desc") },
  ];

  return (
    <section id="comercios-banner" className="py-24 bg-hero-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="space-y-8">
            <div>
              <div className="section-tag bg-white/10 text-white/80 border border-white/20 mb-4">
                <Buildings className="w-3.5 h-3.5" /> {t("tag")}
              </div>
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
                {t("titleLine1")}
                <br />
                {t("titleLine2")}
              </h2>
              <p className="text-white/60 text-lg leading-relaxed">
                {t("subtitle")}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {benefits.map((b) => (
                <div key={b.title} className="bg-white/8 backdrop-blur rounded-2xl p-5 border border-white/10">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center mb-3">
                    <b.icon className="w-5 h-5 text-primary-light" />
                  </div>
                  <h4 className="font-semibold text-white text-sm mb-1">{b.title}</h4>
                  <p className="text-white/50 text-xs leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <a href="mailto:comercios@saludtech.app" className="btn btn-primary gap-2 px-7 py-4 text-base h-auto">
                <Envelope className="w-5 h-5" />
                {t("registerMerchant")}
              </a>
              <a href="tel:+58000SALUDTECH" className="btn btn-ghost text-white border-white/30 hover:bg-white/10 gap-2 px-7 py-4 text-base h-auto">
                <Phone className="w-5 h-5" />
                {t("talkToAdvisor")}
              </a>
            </div>
          </div>

          {/* Merchant portal card */}
          <div className="hidden md:block">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/30 flex items-center justify-center">
                  <Buildings className="w-5 h-5 text-primary-light" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{t("portalTitle")}</p>
                  <p className="text-white/40 text-xs">{t("portalSubtitle")}</p>
                </div>
                <div className="ml-auto px-2 py-1 rounded-full bg-secondary/20 text-secondary text-xs font-bold">{t("online")}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: t("stat1Label"), value: "$3,240", icon: TrendUp, color: "text-secondary" },
                  { label: t("stat2Label"), value: "47", icon: CreditCard, color: "text-primary-light" },
                  { label: t("stat3Label"), value: "12", icon: Users, color: "text-accent-light" },
                  { label: t("stat4Label"), value: "$890", icon: Clock, color: "text-amber-400" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-white/8 rounded-xl p-3">
                    <stat.icon className={`w-4 h-4 ${stat.color} mb-2`} />
                    <div className="text-white font-bold text-lg">{stat.value}</div>
                    <div className="text-white/40 text-xs">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="bg-white/8 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-xs mb-1">{t("generateQr")}</p>
                  <p className="text-white font-semibold">{t("qrDescription")}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function ParaComerciosPage() {
  return (
    <SharedLayout>
      <Hero />
      <Beneficios />
      <ComoFunciona />
      <ParaComerciosBanner />
      <RedAliados />
      <ProcesoAfiliacion />
      <Categorias />
      <CTAFinal />
    </SharedLayout>
  );
}
