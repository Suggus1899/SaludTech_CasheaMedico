"use client";

import { Medal, TrendUp, Clock, Lightning, Shield, ArrowRight, UserPlus } from "@phosphor-icons/react";
import Link from "next/link";
import SharedLayout from "../../components/SharedLayout";

function ClubSaludTech() {
  const levels = [
    { num: 1, label: "Bronce", limit: "$80", installments: "3 cuotas", color: "bg-amber-600", text: "text-amber-700", bg: "bg-amber-50" },
    { num: 2, label: "Plata", limit: "$130", installments: "3 cuotas", color: "bg-slate-400", text: "text-slate-600", bg: "bg-slate-50" },
    { num: 3, label: "Oro", limit: "$180", installments: "hasta 6", color: "bg-yellow-500", text: "text-yellow-700", bg: "bg-yellow-50" },
    { num: 4, label: "Platino", limit: "$240", installments: "hasta 9", color: "bg-cyan-500", text: "text-cyan-700", bg: "bg-cyan-50" },
    { num: 5, label: "Diamante", limit: "$320", installments: "hasta 12", color: "bg-primary", text: "text-primary-dark", bg: "bg-primary-50" },
    { num: 6, label: "Elite", limit: "$400+", installments: "hasta 12", color: "bg-accent", text: "text-accent", bg: "bg-accent-50" },
  ];

  const benefits = [
    { icon: TrendUp, title: "Límite de crédito creciente", desc: "Cada nivel que subes aumenta tu disponible en todas tus líneas." },
    { icon: Clock, title: "Más cuotas disponibles", desc: "Nivel 3+ desbloquea hasta 6, 9 y 12 cuotas para compras grandes." },
    { icon: Lightning, title: "Puntos por puntualidad", desc: "10 pts pagando a tiempo, 15 pts pagando antes del vencimiento." },
    { icon: Shield, title: "Mayor Cuidado desbloqueado", desc: "Nivel 4+ activa la línea de Elder Care para tu familia." },
  ];

  return (
    <section id="club" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="section-tag bg-amber-50 text-amber-600 mb-4">
            <Medal className="w-3.5 h-3.5" weight="duotone" /> Club SaludTech
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-dark mb-4">
            Paga bien, sube de nivel,
            <br />
            <span className="text-gradient-primary">accede a más</span>
          </h2>
          <p className="text-slate-500 text-lg">
            Premiamos tu responsabilidad financiera con más crédito, más cuotas y más beneficios.
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
  return (
    <section className="pt-32 pb-20 bg-hero-gradient relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 right-0 w-96 h-96 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
      </div>
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/15 border border-amber-400/30 mb-6">
          <Medal className="w-4 h-4 text-amber-400" weight="duotone" />
          <span className="text-amber-300 text-xs font-semibold tracking-widest uppercase">Club SaludTech</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          Paga bien,
          <br />
          <span className="bg-clip-text text-transparent bg-linear-to-r from-amber-400 to-primary">
            sube de nivel, accede a más
          </span>
        </h1>
        <p className="text-slate-300 text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
          Tu responsabilidad financiera tiene recompensa. Cada nivel desbloquea mayor crédito, más cuotas y beneficios exclusivos.
        </p>
        <a href="#club" className="inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-amber-500 text-white font-bold text-base hover:bg-amber-600 transition-colors">
          Ver mis beneficios
          <ArrowRight className="w-5 h-5" />
        </a>
      </div>
    </section>
  );
}

function CTAFinal() {
  return (
    <section className="py-20 bg-linear-to-r from-primary to-secondary">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="font-display text-4xl font-bold text-white mb-4">
          Empieza en Nivel 1 hoy
        </h2>
        <p className="text-white/80 text-lg mb-8">
          Regístrate en la página y comienza a construir tu historial de salud financiero.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-white text-primary font-bold text-base hover:bg-primary-50 transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            Crear cuenta gratis
          </Link>
          <Link
            href="/lineas-de-credito"
            className="inline-flex items-center gap-2 px-7 py-4 rounded-xl border-2 border-white/40 text-white font-bold text-base hover:bg-white/10 transition-colors"
          >
            Ver líneas de crédito
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
