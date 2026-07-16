"use client";

import { CheckCircle, Lightning, Buildings, Clock, ShieldCheck } from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

export default function TrustStrip() {
  const t = useTranslations("Home.trustStrip");

  const items = [
    { value: t("stat1Value"), label: t("stat1Label"), icon: CheckCircle, color: "text-secondary" },
    { value: t("stat2Value"), label: t("stat2Label"), icon: Lightning, color: "text-primary" },
    { value: t("stat3Value"), label: t("stat3Label"), icon: Buildings, color: "text-accent" },
    { value: t("stat4Value"), label: t("stat4Label"), icon: Clock, color: "text-secondary" },
    { value: t("stat5Value"), label: t("stat5Label"), icon: ShieldCheck, color: "text-primary" },
  ];
  return (
    <div className="bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-x divide-slate-100">
          {items.map((item) => (
            <div key={item.label} className="flex flex-col items-center py-5 px-4 gap-1 text-center">
              <item.icon className={`w-5 h-5 ${item.color} mb-1`} />
              <span className="font-display font-bold text-xl text-dark">{item.value}</span>
              <span className="text-xs text-slate-400 leading-tight">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
