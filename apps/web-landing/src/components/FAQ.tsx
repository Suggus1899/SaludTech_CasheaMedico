"use client";

import { useState } from "react";
import { CaretDown, Question, User, Buildings, Shield, CreditCard } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

const FAQS = [
  {
    categoryKey: "users",
    icon: User,
    color: "text-primary",
    activeBg: "bg-primary",
  },
  {
    categoryKey: "creditLines",
    icon: CreditCard,
    color: "text-secondary",
    activeBg: "bg-secondary",
  },
  {
    categoryKey: "club",
    icon: Shield,
    color: "text-amber-600",
    activeBg: "bg-amber-500",
  },
  {
    categoryKey: "elderCare",
    icon: Shield,
    color: "text-accent",
    activeBg: "bg-accent",
  },
  {
    categoryKey: "merchants",
    icon: Buildings,
    color: "text-primary",
    activeBg: "bg-primary",
  },
];

const CATEGORY_ITEMS: Record<string, number> = {
  users: 9,
  creditLines: 7,
  club: 7,
  elderCare: 8,
  merchants: 9,
};

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border-b border-slate-100 last:border-0 ${open ? "bg-primary-50/40" : ""} transition-colors`}>
      <button
        className="w-full text-left group px-6 py-4"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-400 text-xs font-bold flex items-center justify-center mt-0.5 group-hover:bg-primary-100 group-hover:text-primary transition-colors">
              {index + 1}
            </span>
            <span className={`text-sm font-semibold leading-relaxed transition-colors ${open ? "text-primary" : "text-dark group-hover:text-primary"}`}>
              {q}
            </span>
          </div>
          <CaretDown
            className={`w-4 h-4 shrink-0 mt-0.5 text-slate-400 transition-transform duration-200 ${open ? "rotate-180 text-primary" : ""}`}
          />
        </div>
      </button>
      {open && (
        <div className="px-6 pb-5 pl-15">
          <p className="text-slate-500 text-sm leading-relaxed ml-9">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState("users");
  const t = useTranslations("FAQ");

  const current = FAQS.find((f) => f.categoryKey === activeCategory)!;
  const totalQuestions = Object.values(CATEGORY_ITEMS).reduce((acc, n) => acc + n, 0);
  const itemCount = CATEGORY_ITEMS[activeCategory];
  const items = Array.from({ length: itemCount }, (_, i) => ({
    q: t(`${activeCategory}.q${i + 1}`),
    a: t(`${activeCategory}.a${i + 1}`),
  }));

  return (
    <section id="faq" className="py-24 bg-surface">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-slate-100 text-slate-600 mb-4">
            <Question className="w-3.5 h-3.5" weight="duotone" /> {t("tag")}
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-dark mb-3">
            {t("title")}
          </h2>
          <p className="text-slate-500 text-lg">
            {t("subtitle", { count: totalQuestions })}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar categories */}
          <div className="lg:w-56 shrink-0">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {FAQS.map((f) => {
                const isActive = activeCategory === f.categoryKey;
                return (
                  <button
                    key={f.categoryKey}
                    onClick={() => setActiveCategory(f.categoryKey)}
                    className={`w-full flex items-center justify-between gap-2 px-4 py-3.5 text-sm font-semibold transition-all border-b border-slate-50 last:border-0 text-left ${
                      isActive
                        ? "bg-primary text-white"
                        : "text-slate-600 hover:bg-slate-50 hover:text-primary"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <f.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white/80" : f.color}`} />
                      <span>{t(`categories.${f.categoryKey}`)}</span>
                    </div>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"}`}>
                      {CATEGORY_ITEMS[f.categoryKey]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Contact card */}
            <div className="mt-4 bg-white rounded-2xl border border-slate-100 p-4 text-center shadow-sm">
              <p className="text-slate-500 text-xs mb-2">{t("notFoundAnswer")}</p>
              <a
                href="mailto:hola@saludtech.app"
                className="inline-flex items-center gap-1.5 text-primary text-xs font-bold hover:underline"
              >
                {t("writeToUs")}
              </a>
            </div>
          </div>

          {/* FAQ list */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Category header */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className={`w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center`}>
                  <current.icon className={`w-4 h-4 ${current.color}`} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-dark text-sm">{t(`categories.${current.categoryKey}`)}</h3>
                  <p className="text-slate-400 text-xs">{t("questionsCount", { count: itemCount })}</p>
                </div>
              </div>

              {items.map((item, i) => (
                <FAQItem key={i} q={item.q} a={item.a} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
