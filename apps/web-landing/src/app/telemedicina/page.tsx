"use client";

import {
  ClipboardText,
  Lightning,
  UserCheck,
  Buildings,
  Heartbeat,
  Waveform,
  CheckCircle,
  Heart,
  ArrowRight,
  Shield,
  Person,
  Stethoscope,
} from "@phosphor-icons/react";
import SharedLayout from "../../components/SharedLayout";
import { useTranslations } from "next-intl";

// ─── Telemedicina & Triage ────────────────────────────────────────────────────
function Telemedicina() {
  const t = useTranslations("Telemedicine.triage");

  const steps = [
    { icon: ClipboardText, title: t("step1Title"), desc: t("step1Desc") },
    { icon: Lightning, title: t("step2Title"), desc: t("step2Desc") },
    { icon: UserCheck, title: t("step3Title"), desc: t("step3Desc") },
    { icon: Buildings, title: t("step4Title"), desc: t("step4Desc") },
  ];

  const symptoms = [t("symptom1"), t("symptom2"), t("symptom3")];

  return (
    <section id="triage" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Visual */}
          <div className="relative order-2 lg:order-1">
            <div className="w-full max-w-sm sm:max-w-md mx-auto">
              {/* Triage card UI */}
              <div className="bg-hero-gradient rounded-3xl p-6 shadow-2xl shadow-dark/40">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                    <Waveform className="w-5 h-5 text-red-400" weight="duotone" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{t("cardTitle")}</p>
                    <p className="text-white/50 text-xs">{t("cardSubtitle")}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20">
                    <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                    <span className="text-red-300 text-xs font-semibold">{t("highUrgency")}</span>
                  </div>
                </div>

                <div className="bg-white/8 rounded-2xl p-4 mb-4 space-y-3">
                  <p className="text-white/70 text-xs uppercase tracking-wider font-semibold">{t("reportedSymptoms")}</p>
                  <div className="flex flex-wrap gap-2">
                    {symptoms.map((s) => (
                      <span key={s} className="px-2.5 py-1 rounded-full bg-white/10 text-white/80 text-xs">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="bg-white/8 rounded-2xl p-4 mb-4">
                  <p className="text-white/70 text-xs uppercase tracking-wider font-semibold mb-2">{t("recommendedSpecialty")}</p>
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-400" />
                    <span className="text-white font-semibold">{t("cardiology")}</span>
                  </div>
                </div>

                <div className="bg-secondary/15 border border-secondary/30 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-secondary shrink-0 mt-0.5" weight="duotone" />
                    <div>
                      <p className="text-white text-sm font-semibold">{t("lineAvailable")}</p>
                      <p className="text-white/60 text-xs mt-1">{t("lineAvailableDesc")}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Doctor badge */}
              <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl p-4 shadow-xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">{t("doctorReviewed")}</p>
                    <p className="text-sm font-bold text-dark">{t("reviewedTime")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="order-1 lg:order-2 space-y-8">
            <div>
              <div className="section-tag bg-red-50 text-red-600 mb-4">
                <Heartbeat className="w-3.5 h-3.5" /> {t("tag")}
              </div>
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-dark mb-4">
                {t("titleLine1")}
                <br />
                <span className="text-gradient-primary">{t("titleLine2")}</span>
              </h2>
              <p className="text-slate-500 text-lg leading-relaxed">
                {t("subtitle")}
              </p>
            </div>

            <div className="space-y-4">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                    <step.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-dark text-sm">{step.title}</h4>
                    <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <a href="/#descarga" className="btn-primary inline-flex">
              {t("tryNowFree")}
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Elder Care ────────────────────────────────────────────────────────────────
function ElderCare() {
  const t = useTranslations("Telemedicine.elderCare");

  const services = [
    { icon: UserCheck, title: t("service1Title"), desc: t("service1Desc") },
    { icon: Heart, title: t("service2Title"), desc: t("service2Desc") },
    { icon: Person, title: t("service3Title"), desc: t("service3Desc") },
    { icon: Stethoscope, title: t("service4Title"), desc: t("service4Desc") },
  ];

  const subscriptionItems = [
    { service: t("service1Label"), amount: t("service1Amount") },
    { service: t("service2Label"), amount: t("service2Amount") },
  ];

  return (
    <section id="elder-care" className="py-24 bg-linear-to-br from-accent-50 via-white to-primary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="space-y-8">
            <div>
              <div className="section-tag bg-accent-50 text-accent mb-4">
                <Shield className="w-3.5 h-3.5" /> {t("tag")}
              </div>
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-dark mb-4">
                {t("titleLine1")}
                <br />
                <span className="text-gradient-accent">{t("titleLine2")}</span>
              </h2>
              <p className="text-slate-500 text-lg leading-relaxed">
                {t.rich("subtitle", {
                  strong: (chunks) => <strong className="text-dark">{chunks}</strong>
                })}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {services.map((s) => (
                <div key={s.title} className="bg-white rounded-2xl p-5 border border-accent/10 shadow-sm card-hover">
                  <div className="w-10 h-10 rounded-xl bg-accent-50 flex items-center justify-center mb-3">
                    <s.icon className="w-5 h-5 text-accent" />
                  </div>
                  <h4 className="font-semibold text-dark text-sm mb-1">{s.title}</h4>
                  <p className="text-slate-500 text-xs leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 p-4 rounded-2xl bg-accent/8 border border-accent/20">
              <CheckCircle className="w-5 h-5 text-accent shrink-0" weight="duotone" />
              <p className="text-sm text-slate-700">
                {t.rich("flexibleSubscription", {
                  strong: (chunks) => <strong>{chunks}</strong>
                })}
              </p>
            </div>
          </div>

          {/* Elder care visual */}
          <div className="flex justify-center order-first lg:order-last">
            <div className="w-full max-w-sm space-y-4">
              <div className="bg-hero-gradient rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-accent/30 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-accent-light" />
                  </div>
                  <div>
                    <p className="text-white font-bold">{t("cardTitle")}</p>
                    <p className="text-white/50 text-xs">{t("cardSubtitle")}</p>
                  </div>
                  <div className="ml-auto px-2.5 py-1 rounded-full bg-secondary/20 text-secondary text-xs font-bold">{t("active")}</div>
                </div>

                {subscriptionItems.map((item) => (
                  <div key={item.service} className="flex items-center justify-between p-3 rounded-xl bg-white/8 mb-3">
                    <span className="text-white/70 text-sm">{item.service}</span>
                    <span className="text-white font-semibold text-sm">{item.amount}</span>
                  </div>
                ))}

                <div className="mt-2 p-3 rounded-xl border border-accent/30 bg-accent/10">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-xs">{t("monthlyTotal")}</span>
                    <span className="text-white font-bold">{t("monthlyTotalAmount")}</span>
                  </div>
                  <div className="text-white/40 text-xs mt-1">{t("debitedFrom")}</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-md border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">{t("requirementLabel")}</p>
                    <p className="text-sm font-bold text-dark">{t("requirementValue")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function TelemedicinaPage() {
  return (
    <SharedLayout>
      <Telemedicina />
      <ElderCare />
    </SharedLayout>
  );
}
