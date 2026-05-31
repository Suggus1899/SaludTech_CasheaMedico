"use client";

import {
  Pill,
  Stethoscope,
  Shield,
  CheckCircle2,
  Award,
  ChevronRight,
  ArrowRight,
  TrendingUp,
  Clock,
  Zap,
} from "lucide-react";
import Link from "next/link";
import SimuladorCuotas from "../components/SimuladorCuotas";
import SharedLayout from "../components/SharedLayout";

function Hero() {
  return (
    <section className="pt-32 pb-20 bg-hero-gradient relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 right-0 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-secondary/10 blur-3xl" />
      </div>
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 border border-primary/30 mb-6">
          <Award className="w-4 h-4 text-primary" />
          <span className="text-primary text-xs font-semibold tracking-widest uppercase">Líneas de Crédito Médico</span>
        </div>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
          Tres líneas para
          <br />
          <span className="bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary">
            cada necesidad de salud
          </span>
        </h1>
        <p className="text-slate-300 text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
          Desde medicamentos del día a día hasta servicios de Elder Care — SaludTech tiene la línea correcta para cada momento.
        </p>
        <a href="#simulador" className="inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-secondary text-white font-bold text-base hover:bg-secondary-dark transition-colors">
          Calcular mis cuotas
          <ArrowRight className="w-5 h-5" />
        </a>
      </div>
    </section>
  );
}

function LineasDetalle() {
  const lineas = [
    {
      nombre: "Salud Cotidiana",
      icon: Pill,
      color: "text-secondary",
      bg: "bg-secondary",
      lightBg: "bg-secondary-50",
      border: "border-secondary/20",
      limite: "$80",
      inicial: "50%",
      cuotas: "3 cuotas · c/14 días",
      desc: "Para el gasto médico recurrente: medicamentos, consultas de medicina general y supermercados de salud. Renueva su disponible conforme pagas.",
      usoCases: [
        "Medicamentos para hipertensión, diabetes, etc.",
        "Consulta médica general",
        "Farmacia y droguerías",
        "Exámenes de rutina (hemograma, glucosa...)",
      ],
      nota: "Disponible desde Nivel 1",
    },
    {
      nombre: "Especialidad Principal",
      icon: Stethoscope,
      color: "text-primary",
      bg: "bg-primary",
      lightBg: "bg-primary-50",
      border: "border-primary/30",
      limite: "Hasta $250",
      inicial: "40% (Nivel 3+: 35%)",
      cuotas: "3 – 12 cuotas según nivel",
      desc: "Para procedimientos especializados, cirugías electivas, laboratorios, imagenología y hospitalización. El límite crece con tu nivel.",
      usoCases: [
        "Consulta cardiológica, traumatológica, neurológica",
        "Cirugía electiva o estética",
        "Tomografía, resonancia magnética",
        "Hospitalización en clínica privada",
      ],
      nota: "Disponible desde Nivel 1 · Más cuotas desde Nivel 3",
      featured: true,
    },
    {
      nombre: "Mayor Cuidado",
      icon: Shield,
      color: "text-accent",
      bg: "bg-accent",
      lightBg: "bg-accent-50",
      border: "border-accent/20",
      limite: "$150/mes",
      inicial: "Suscripción mensual",
      cuotas: "Débito automático mensual",
      desc: "Suscripción mensual para contratar servicios a domicilio para adultos mayores. Los cobros se debitan automáticamente cada mes.",
      usoCases: [
        "Enfermera a domicilio (hasta 5 días/sem)",
        "Cuidador/a profesional certificado",
        "Fisioterapia en casa (hasta 3 días/sem)",
        "Especialista en geriatría a domicilio",
      ],
      nota: "Requiere Nivel 4 (Platino) o superior",
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="font-display text-4xl font-bold text-dark mb-4">
            Detalle de cada línea
          </h2>
          <p className="text-slate-500 text-lg">
            Entiende los límites, requisitos y casos de uso de cada línea.
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
                      { label: "Límite disponible", value: l.limite, icon: TrendingUp },
                      { label: "Pago inicial", value: l.inicial, icon: Zap },
                      { label: "Cuotas", value: l.cuotas, icon: Clock },
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
                    Casos de uso
                  </p>
                  <ul className="space-y-3">
                    {l.usoCases.map((uc) => (
                      <li key={uc} className="flex items-start gap-2.5">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${l.featured ? "text-secondary" : l.color}`} />
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
  const niveles = [
    { num: 1, label: "Bronce", cotidiana: "$80", especialidad: "$100", elderCare: "—", inicial: "50%", color: "bg-amber-600" },
    { num: 2, label: "Plata", cotidiana: "$80", especialidad: "$130", elderCare: "—", inicial: "45%", color: "bg-slate-400" },
    { num: 3, label: "Oro", cotidiana: "$80", especialidad: "$180", elderCare: "—", inicial: "40%", color: "bg-yellow-500" },
    { num: 4, label: "Platino", cotidiana: "$80", especialidad: "$200", elderCare: "$100/mes", inicial: "35%", color: "bg-cyan-500" },
    { num: 5, label: "Diamante", cotidiana: "$80", especialidad: "$250", elderCare: "$130/mes", inicial: "30%", color: "bg-primary" },
    { num: 6, label: "Elite", cotidiana: "$80", especialidad: "$250+", elderCare: "$150/mes", inicial: "25%", color: "bg-accent" },
  ];

  return (
    <section className="py-24 bg-surface">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-amber-50 text-amber-600 mb-4">
            <Award className="w-3.5 h-3.5" /> Club SaludTech
          </div>
          <h2 className="font-display text-4xl font-bold text-dark mb-4">
            Tu línea crece con tu nivel
          </h2>
          <p className="text-slate-500 text-lg">
            Paga a tiempo, sube de nivel y accede a límites mayores con menos inicial.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nivel</th>
                <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Salud Cotidiana</th>
                <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Especialidad</th>
                <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Mayor Cuidado</th>
                <th className="text-left p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Inicial</th>
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
                      ? <span className="text-slate-300">No disponible</span>
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
  return (
    <section className="py-20 bg-linear-to-r from-primary to-secondary">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="font-display text-4xl font-bold text-white mb-4">
          Activa tu línea en 3 minutos
        </h2>
        <p className="text-white/80 text-lg mb-8">
          Descarga la app, regístrate y accede a tu línea de crédito médico sin interés.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link
            href="/#descarga"
            className="inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-white text-primary font-bold text-base hover:bg-primary-50 transition-colors"
          >
            Descargar app
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-7 py-4 rounded-xl border-2 border-white/40 text-white font-bold text-base hover:bg-white/10 transition-colors"
          >
            Volver al inicio
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function LineasDeCredito() {
  return (
    <SharedLayout>
      <Hero />
      <LineasDetalle />
      <SimuladorCuotas />
      <ComoCrece />
      <CTAFinal />
    </SharedLayout>
  );
}
