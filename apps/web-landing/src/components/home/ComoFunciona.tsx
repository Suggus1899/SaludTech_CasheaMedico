"use client";

import { UserPlus, Lightning, QrCode, CreditCard } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

export default function ComoFunciona() {
  const t = useTranslations("Home.howItWorks");

  const steps = [
    {
      num: "01",
      icon: UserPlus,
      title: t("step1Title"),
      desc: t("step1Desc"),
      color: "text-primary",
      bg: "bg-primary-50",
      border: "border-primary/20",
    },
    {
      num: "02",
      icon: Lightning,
      title: t("step2Title"),
      desc: t("step2Desc"),
      color: "text-secondary",
      bg: "bg-secondary-50",
      border: "border-secondary/20",
    },
    {
      num: "03",
      icon: QrCode,
      title: t("step3Title"),
      desc: t("step3Desc"),
      color: "text-accent",
      bg: "bg-accent-50",
      border: "border-accent/20",
    },
    {
      num: "04",
      icon: CreditCard,
      title: t("step4Title"),
      desc: t("step4Desc"),
      color: "text-primary",
      bg: "bg-primary-50",
      border: "border-primary/20",
    },
  ];

  return (
    <section id="como-funciona" className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="section-tag bg-primary-100 text-primary mb-4">
            <Lightning className="w-3.5 h-3.5" /> {t("tag")}
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-dark mb-4">
            {t("title")}
          </h2>
          <p className="text-slate-500 text-lg">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={step.num} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-px bg-linear-to-r from-slate-200 to-transparent z-10 translate-x-2" />
              )}
              <div className={`card-hover bg-white rounded-2xl p-6 border ${step.border} shadow-sm h-full`}>
                <div className="flex items-start justify-between mb-5">
                  <div className={`w-12 h-12 rounded-xl ${step.bg} flex items-center justify-center`}>
                    <step.icon className={`w-6 h-6 ${step.color}`} />
                  </div>
                  <span className={`font-display text-4xl font-bold ${step.color} opacity-20`}>
                    {step.num}
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg text-dark mb-2">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
