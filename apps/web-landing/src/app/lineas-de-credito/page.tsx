"use client";

import {
  Pill,
  Stethoscope,
  Shield,
  CheckCircle,
  Medal,
  CaretRight,
  ArrowRight,
  TrendUp,
  Clock,
  Lightning,
  Heart,
  Baby,
  TestTube,
  Scan,
  Bone,
  HandHeart,
  PersonSimpleCircle,
  Eye,
  Person,
  FirstAidKit,
  CreditCard,
  Buildings,
} from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import SimuladorCuotas from "../../components/SimuladorCuotas";
import SharedLayout from "../../components/SharedLayout";
import { useTranslations } from "next-intl";

function Hero() {
  const t = useTranslations("CreditLines.hero");
  return (
    <section className="pt-32 pb-20 bg-hero-gradient relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 right-0 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-secondary/10 blur-3xl" />
      </div>
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 border border-primary/30 mb-6">
            <Medal className="w-4 h-4 text-primary" weight="duotone" />
            <span className="text-primary text-xs font-semibold tracking-widest uppercase">{t("badge")}</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            {t("titleLine1")}
            <br />
            <span className="bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary">
              {t("titleLine2")}
            </span>
          </h1>
          <p className="text-slate-300 text-xl mb-8 leading-relaxed">
            {t("subtitle")}
          </p>
          <a href="#simulador" className="inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-secondary text-white font-bold text-base hover:bg-secondary-dark transition-colors">
            {t("calculateInstallments")}
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
        <div className="hidden md:flex justify-center">
          <Image
            src="/assets/payment_illustration.png"
            alt="Payment illustration"
            width={420}
            height={320}
            className="w-full max-w-sm rounded-3xl shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
}

// ─── Líneas de crédito ────────────────────────────────────────────────────────
function LineasDeCredito() {
  const t = useTranslations("CreditLines.lines");

  const lines = [
    {
      name: t("dailyName"),
      icon: Pill,
      color: "text-secondary",
      bg: "bg-secondary",
      lightBg: "bg-secondary-50",
      border: "border-secondary/20",
      tagBg: "bg-secondary/10 text-secondary",
      limit: t("dailyLimit"),
      desc: t("dailyDesc"),
      features: [
        t("dailyFeature1"),
        t("dailyFeature2"),
        t("dailyFeature3"),
        t("dailyFeature4"),
      ],
      badge: t("dailyBadge"),
    },
    {
      name: t("specialtyName"),
      icon: Stethoscope,
      color: "text-primary",
      bg: "bg-primary",
      lightBg: "bg-primary-50",
      border: "border-primary/30",
      tagBg: "bg-primary/10 text-primary",
      limit: t("specialtyLimit"),
      desc: t("specialtyDesc"),
      features: [
        t("specialtyFeature1"),
        t("specialtyFeature2"),
        t("specialtyFeature3"),
        t("specialtyFeature4"),
      ],
      badge: t("specialtyBadge"),
      featured: true,
    },
    {
      name: t("elderCareName"),
      icon: Shield,
      color: "text-accent",
      bg: "bg-accent",
      lightBg: "bg-accent-50",
      border: "border-accent/20",
      tagBg: "bg-accent/10 text-accent",
      limit: t("elderCareLimit"),
      desc: t("elderCareDesc"),
      features: [
        t("elderCareFeature1"),
        t("elderCareFeature2"),
        t("elderCareFeature3"),
        t("elderCareFeature4"),
      ],
      badge: t("elderCareBadge"),
    },
  ];

  return (
    <section id="servicios" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="section-tag bg-accent-50 text-accent mb-4">
            <CreditCard className="w-3.5 h-3.5" weight="duotone" /> {t("tag")}
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-dark mb-4">
            {t("title")}
          </h2>
          <p className="text-slate-500 text-lg">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          {lines.map((line) => (
            <div
              key={line.name}
              className={`relative rounded-3xl border ${line.border} p-8 card-hover ${
                line.featured
                  ? "bg-hero-gradient shadow-2xl shadow-primary/20 sm:scale-105"
                  : "bg-white shadow-md"
              }`}
            >
              {line.badge && (
                <div className={`absolute -top-3.5 left-6 px-3 py-1 rounded-full text-xs font-bold ${
                  line.featured ? "bg-secondary text-white" : `${line.tagBg}`
                }`}>
                  {line.badge}
                </div>
              )}

              <div className={`w-14 h-14 rounded-2xl ${line.featured ? "bg-white/15" : line.lightBg} flex items-center justify-center mb-5`}>
                <line.icon className={`w-7 h-7 ${line.featured ? "text-white" : line.color}`} />
              </div>

              <div className={`text-3xl font-display font-bold mb-1 ${line.featured ? "text-white" : "text-dark"}`}>
                {line.limit}
              </div>
              <h3 className={`font-display font-bold text-lg mb-3 ${line.featured ? "text-white" : "text-dark"}`}>
                {line.name}
              </h3>
              <p className={`text-sm leading-relaxed mb-6 ${line.featured ? "text-white/70" : "text-slate-500"}`}>
                {line.desc}
              </p>

              <ul className="space-y-2.5">
                {line.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <CheckCircle
                      className={`w-4 h-4 shrink-0 mt-0.5 ${line.featured ? "text-secondary" : line.color}`}
                      weight="duotone"
                    />
                    <span className={`text-sm ${line.featured ? "text-white/80" : "text-slate-600"}`}>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Especialidades ───────────────────────────────────────────────────────────
function Especialidades() {
  const t = useTranslations("CreditLines.specialties");

  const categories = [
    { icon: Pill, label: t("pharmacy"), color: "text-secondary", bg: "bg-secondary-50" },
    { icon: Heart, label: t("cardiology"), color: "text-red-500", bg: "bg-red-50" },
    { icon: Stethoscope, label: t("generalMedicine"), color: "text-primary", bg: "bg-primary-50" },
    { icon: Baby, label: t("pediatrics"), color: "text-amber-500", bg: "bg-amber-50" },
    { icon: TestTube, label: t("laboratories"), color: "text-purple-500", bg: "bg-purple-50" },
    { icon: Scan, label: t("imaging"), color: "text-blue-600", bg: "bg-blue-50" },
    { icon: Bone, label: t("traumatology"), color: "text-orange-500", bg: "bg-orange-50" },
    { icon: HandHeart, label: t("elderCare"), color: "text-accent", bg: "bg-accent-50" },
    { icon: PersonSimpleCircle, label: t("dermatology"), color: "text-pink-500", bg: "bg-pink-50" },
    { icon: Eye, label: t("ophthalmology"), color: "text-indigo-500", bg: "bg-indigo-50" },
    { icon: Person, label: t("physiotherapy"), color: "text-teal-500", bg: "bg-teal-50" },
    { icon: FirstAidKit, label: t("emergencies"), color: "text-red-600", bg: "bg-red-50" },
  ];

  return (
    <section className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <div className="section-tag bg-primary-100 text-primary mb-4">
            <Buildings className="w-3.5 h-3.5" /> {t("tag")}
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-dark mb-3">
            {t("title")}
          </h2>
          <p className="text-slate-500">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.label}
              className="card-hover bg-white rounded-2xl p-4 flex flex-col items-center gap-3 shadow-sm border border-slate-100 cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-xl ${cat.bg} flex items-center justify-center`}>
                <cat.icon className={`w-6 h-6 ${cat.color}`} weight="duotone" />
              </div>
              <span className="text-xs font-semibold text-slate-700 text-center leading-tight">{cat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function LineasDetalle() {
  const t = useTranslations("CreditLines.detail");

  const lineas = [
    {
      nombre: t("dailyName"),
      icon: Pill,
      color: "text-secondary",
      bg: "bg-secondary",
      lightBg: "bg-secondary-50",
      border: "border-secondary/20",
      limite: t("dailyLimit"),
      inicial: t("dailyInitial"),
      cuotas: t("dailyInstallments"),
      desc: t("dailyDesc"),
      usoCases: [
        t("dailyUse1"),
        t("dailyUse2"),
        t("dailyUse3"),
        t("dailyUse4"),
      ],
      nota: t("dailyNote"),
    },
    {
      nombre: t("specialtyName"),
      icon: Stethoscope,
      color: "text-primary",
      bg: "bg-primary",
      lightBg: "bg-primary-50",
      border: "border-primary/30",
      limite: t("specialtyLimit"),
      inicial: t("specialtyInitial"),
      cuotas: t("specialtyInstallments"),
      desc: t("specialtyDesc"),
      usoCases: [
        t("specialtyUse1"),
        t("specialtyUse2"),
        t("specialtyUse3"),
        t("specialtyUse4"),
      ],
      nota: t("specialtyNote"),
      featured: true,
    },
    {
      nombre: t("elderCareName"),
      icon: Shield,
      color: "text-accent",
      bg: "bg-accent",
      lightBg: "bg-accent-50",
      border: "border-accent/20",
      limite: t("elderCareLimit"),
      inicial: t("elderCareInitial"),
      cuotas: t("elderCareInstallments"),
      desc: t("elderCareDesc"),
      usoCases: [
        t("elderCareUse1"),
        t("elderCareUse2"),
        t("elderCareUse3"),
        t("elderCareUse4"),
      ],
      nota: t("elderCareNote"),
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="font-display text-4xl font-bold text-dark mb-4">
            {t("title")}
          </h2>
          <p className="text-slate-500 text-lg">
            {t("subtitle")}
          </p>
        </div>

        <div className="space-y-8">
          {lineas.map((l) => (
            <div
              key={l.nombre}
              className={`rounded-3xl border ${l.border} overflow-hidden ${l.featured ? "shadow-xl shadow-primary/10" : "shadow-sm"}`}
            >
              <div className={`grid grid-cols-1 md:grid-cols-3 ${l.featured ? "bg-hero-gradient" : "bg-white"}`}>
                {/* Header col */}
                <div className={`p-8 ${l.featured ? "" : `${l.lightBg}`}`}>
                  <div className={`w-14 h-14 rounded-2xl ${l.featured ? "bg-white/15" : l.lightBg} flex items-center justify-center mb-4`}>
                    <l.icon className={`w-7 h-7 ${l.featured ? "text-white" : l.color}`} />
                  </div>
                  <h3 className={`font-display font-bold text-2xl mb-2 ${l.featured ? "text-white" : "text-dark"}`}>{l.nombre}</h3>
                  <p className={`text-sm leading-relaxed ${l.featured ? "text-white/70" : "text-slate-500"}`}>{l.desc}</p>
                  <div className={`mt-4 inline-block px-3 py-1 rounded-full text-xs font-bold ${l.featured ? "bg-secondary/20 text-secondary" : `bg-white text-slate-600 border border-slate-200`}`}>
                    {l.nota}
                  </div>
                </div>

                {/* Stats col */}
                <div className={`p-6 md:p-8 border-t md:border-t-0 md:border-l ${l.featured ? "border-white/10" : "border-slate-100"}`}>
                  <div className="space-y-5">
                    {[
                      { label: t("statLimit"), value: l.limite, icon: TrendUp },
                      { label: t("statInitial"), value: l.inicial, icon: Lightning },
                      { label: t("statInstallments"), value: l.cuotas, icon: Clock },
                    ].map((stat) => (
                      <div key={stat.label} className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg ${l.featured ? "bg-white/10" : l.lightBg} flex items-center justify-center shrink-0`}>
                          <stat.icon className={`w-4 h-4 ${l.featured ? "text-white/60" : l.color}`} />
                        </div>
                        <div>
                          <p className={`text-xs ${l.featured ? "text-white/50" : "text-slate-400"}`}>{stat.label}</p>
                          <p className={`font-bold text-sm ${l.featured ? "text-white" : "text-dark"}`}>{stat.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Use cases col */}
                <div className={`p-6 md:p-8 border-t md:border-t-0 md:border-l ${l.featured ? "border-white/10" : "border-slate-100"}`}>
                  <p className={`text-xs font-semibold uppercase tracking-wider mb-4 ${l.featured ? "text-white/50" : "text-slate-400"}`}>
                    {t("useCases")}
                  </p>
                  <ul className="space-y-3">
                    {l.usoCases.map((uc) => (
                      <li key={uc} className="flex items-start gap-2.5">
                        <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 ${l.featured ? "text-secondary" : l.color}`} weight="duotone" />
                        <span className={`text-sm ${l.featured ? "text-white/80" : "text-slate-600"}`}>{uc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ComoCrece() {
  const t = useTranslations("CreditLines.howItGrows");

  const niveles = [
    { num: 1, label: t("levelBronze"), cotidiana: "$80", especialidad: "$100", elderCare: "—", inicial: "50%", color: "bg-amber-600" },
    { num: 2, label: t("levelSilver"), cotidiana: "$80", especialidad: "$130", elderCare: "—", inicial: "45%", color: "bg-slate-400" },
    { num: 3, label: t("levelGold"), cotidiana: "$80", especialidad: "$180", elderCare: "—", inicial: "40%", color: "bg-yellow-500" },
    { num: 4, label: t("levelPlatinum"), cotidiana: "$80", especialidad: "$200", elderCare: "$100/mes", inicial: "35%", color: "bg-cyan-500" },
    { num: 5, label: t("levelDiamond"), cotidiana: "$80", especialidad: "$250", elderCare: "$130/mes", inicial: "30%", color: "bg-primary" },
    { num: 6, label: t("levelElite"), cotidiana: "$80", especialidad: "$250+", elderCare: "$150/mes", inicial: "25%", color: "bg-accent" },
  ];

  return (
    <section className="py-24 bg-surface">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-amber-50 text-amber-600 mb-4">
            <Medal className="w-3.5 h-3.5" weight="duotone" /> {t("tag")}
          </div>
          <h2 className="font-display text-4xl font-bold text-dark mb-4">
            {t("title")}
          </h2>
          <p className="text-slate-500 text-lg">
            {t("subtitle")}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t("colLevel")}</th>
                <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t("colDaily")}</th>
                <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t("colSpecialty")}</th>
                <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t("colElderCare")}</th>
                <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t("colInitial")}</th>
              </tr>
            </thead>
            <tbody>
              {niveles.map((n, i) => (
                <tr key={n.num} className={`border-b border-slate-50 ${i % 2 === 0 ? "" : "bg-slate-50/50"}`}>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full ${n.color} flex items-center justify-center text-white text-xs font-bold`}>{n.num}</div>
                      <span className="font-semibold text-dark text-sm">{n.label}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-700 font-medium">{n.cotidiana}</td>
                  <td className="p-4 text-sm text-slate-700 font-medium">{n.especialidad}</td>
                  <td className="p-4 text-sm">
                    {n.elderCare === "—"
                      ? <span className="text-slate-300">{t("notAvailable")}</span>
                      : <span className="text-accent font-semibold">{n.elderCare}</span>
                    }
                  </td>
                  <td className="p-4 text-sm font-bold text-primary">{n.inicial}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function CTAFinal() {
  const t = useTranslations("CreditLines.cta");
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
            {t("createAccount")}
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-7 py-4 rounded-xl border-2 border-white/40 text-white font-bold text-base hover:bg-white/10 transition-colors"
          >
            {t("backHome")}
            <CaretRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function LineasDeCreditoPage() {
  return (
    <SharedLayout>
      <Hero />
      <LineasDeCredito />
      <Especialidades />
      <LineasDetalle />
      <SimuladorCuotas />
      <ComoCrece />
      <CTAFinal />
    </SharedLayout>
  );
}
