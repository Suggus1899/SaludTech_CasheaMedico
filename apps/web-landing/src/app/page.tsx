"use client";

import { useState } from "react";
import SimuladorCuotas from "./components/SimuladorCuotas";
import FAQ from "./components/FAQ";
import Logo from "./components/Logo";
import {
  Heart,
  Stethoscope,
  Pill,
  Shield,
  Star,
  ChevronRight,
  Smartphone,
  QrCode,
  CreditCard,
  CheckCircle2,
  Users,
  Building2,
  Activity,
  HeartPulse,
  UserCheck,
  Zap,
  Award,
  ArrowRight,
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  Clock,
  ShieldCheck,
} from "lucide-react";

// ─── Navbar ──────────────────────────────────────────────────────────────────
function Navbar() {
  const [open, setOpen] = useState(false);
  const links = [
    { href: "#como-funciona", label: "Cómo funciona" },
    { href: "#simulador", label: "Simulador" },
    { href: "#club", label: "Club" },
    { href: "#faq", label: "FAQ" },
    { href: "/para-comercios", label: "Comercios" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#">
            <Logo size="md" />
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-medium text-slate-600 hover:text-primary transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <a href="#comercios" className="text-sm font-semibold text-primary hover:underline">
              Soy Comercio
            </a>
            <a
              href="#descarga"
              className="btn-primary text-sm px-5 py-2.5"
            >
              <Smartphone className="w-4 h-4" />
              Descarga la app
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden py-4 border-t border-slate-100 space-y-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block px-3 py-2.5 text-sm font-medium text-slate-700 hover:text-primary hover:bg-primary-50 rounded-lg"
              >
                {l.label}
              </a>
            ))}
            <div className="pt-3 flex flex-col gap-2 px-3">
              <a href="#comercios" className="btn-outline text-sm justify-center">
                Soy Comercio
              </a>
              <a href="#descarga" className="btn-primary text-sm justify-center">
                <Smartphone className="w-4 h-4" />
                Descarga la app
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-hero-gradient pt-16">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -right-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-1/4 -left-32 w-80 h-80 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 border border-primary/30">
              <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="text-primary text-xs font-semibold tracking-widest uppercase">
                BNPL Médico · Sin intereses
              </span>
            </div>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight">
              Tu salud,
              <br />
              <span className="text-gradient-primary bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                sin esperar
              </span>
              <br />
              ni endeudarte
            </h1>

            <p className="text-slate-300 text-lg sm:text-xl leading-relaxed max-w-lg">
              Accede a farmacias, clínicas, especialistas y cuidado para adultos
              mayores. Paga solo la inicial y el resto en cuotas cada 14 días,{" "}
              <strong className="text-white">con 0% de interés.</strong>
            </p>

            <div className="flex flex-wrap gap-4">
              <a href="#descarga" className="btn-primary text-base px-7 py-4">
                <Smartphone className="w-5 h-5" />
                Descargar app gratis
              </a>
              <a href="#como-funciona" className="btn-secondary text-base px-7 py-4">
                Cómo funciona
                <ChevronRight className="w-5 h-5" />
              </a>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-4">
              {[
                { value: "0%", label: "Interés siempre" },
                { value: "3 min", label: "Aprobación" },
                { value: "14 días", label: "Entre cuotas" },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-3xl font-display font-bold text-white">{s.value}</div>
                  <div className="text-slate-400 text-sm mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Visual card mockup */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="relative">
              {/* Main app card */}
              <div className="w-72 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-white/60 text-xs">Línea disponible</p>
                    <p className="text-white font-display font-bold text-2xl">$240.00</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-primary/30 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-primary-light" />
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Salud Cotidiana", amount: "$80", color: "bg-secondary" },
                    { label: "Especialidad", amount: "$120", color: "bg-primary" },
                    { label: "Mayor Cuidado", amount: "$40", color: "bg-accent" },
                  ].map((line) => (
                    <div key={line.label} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${line.color}`} />
                        <span className="text-white/80 text-xs">{line.label}</span>
                      </div>
                      <span className="text-white text-sm font-semibold">{line.amount}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 p-3 rounded-xl bg-gradient-to-r from-secondary/20 to-primary/20 border border-secondary/30">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-secondary" />
                    <span className="text-white/80 text-xs font-medium">Nivel 2 · 45/50 pts al siguiente</span>
                  </div>
                </div>
              </div>

              {/* Floating QR badge */}
              <div className="absolute -bottom-6 -left-8 bg-white rounded-2xl p-4 shadow-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                    <QrCode className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Pago en clínica</p>
                    <p className="text-sm font-bold text-dark">Escanea y listo</p>
                  </div>
                </div>
              </div>

              {/* Floating approval badge */}
              <div className="absolute -top-4 -right-8 bg-white rounded-2xl px-4 py-3 shadow-2xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-secondary" />
                  <span className="text-sm font-bold text-dark">¡Aprobado!</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">en 3 minutos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Trust Strip ─────────────────────────────────────────────────────────────
function TrustStrip() {
  const items = [
    { value: "0%", label: "Interés siempre", icon: CheckCircle2, color: "text-secondary" },
    { value: "3 min", label: "Aprobación instantánea", icon: Zap, color: "text-primary" },
    { value: "+200", label: "Comercios aliados", icon: Building2, color: "text-accent" },
    { value: "14 días", label: "Tiempo entre cuotas", icon: Clock, color: "text-secondary" },
    { value: "100%", label: "Digital, sin papeles", icon: ShieldCheck, color: "text-primary" },
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

// ─── App Features ─────────────────────────────────────────────────────────────
function AppFeatures() {
  const features = [
    {
      tag: "Aprobación",
      title: "Pre-aprobamos tu línea en 3 minutos",
      desc: "Sin visitar oficinas ni llenar formularios en papel. Solo cédula y teléfono. Podrás usar tu línea de crédito médico de inmediato en cualquier comercio aliado.",
      cta: "Descargar app",
      ctaHref: "#descarga",
      color: "from-primary/10 to-primary/5",
      border: "border-primary/20",
      iconBg: "bg-primary-50",
      icon: Zap,
      iconColor: "text-primary",
      mockupLines: [
        { label: "Tu línea", value: "$160", sub: "Aprobado al instante" },
        { label: "Estado", value: "Activo", badge: "verde" },
        { label: "Primera compra", value: "Lista para usar", badge: null },
      ],
    },
    {
      tag: "Flexibilidad",
      title: "Compra en clínica o paga en línea",
      desc: "Usa SaludTech en consultorios físicos escaneando el QR o paga servicios de telemedicina y farmacias online directamente desde la app.",
      cta: "Ver comercios",
      ctaHref: "/para-comercios",
      color: "from-accent/10 to-accent/5",
      border: "border-accent/20",
      iconBg: "bg-accent-50",
      icon: QrCode,
      iconColor: "text-accent",
      mockupLines: [
        { label: "Modo", value: "QR en tienda", sub: null },
        { label: "O también", value: "Pago en línea", badge: null },
        { label: "Comercios", value: "+200 aliados", badge: null },
      ],
    },
    {
      tag: "Cotidiano",
      title: "Farmacia del día a día sin preocuparte",
      desc: "La línea Salud Cotidiana cubre medicamentos, consultas de medicina general y farmacias. Paga 1 inicial + 1 cuota en 14 días. Sin interés, sin trámites.",
      cta: "Ver líneas de crédito",
      ctaHref: "/lineas-de-credito",
      color: "from-secondary/10 to-secondary/5",
      border: "border-secondary/20",
      iconBg: "bg-secondary-50",
      icon: Pill,
      iconColor: "text-secondary",
      mockupLines: [
        { label: "Línea Cotidiana", value: "$80", sub: null },
        { label: "Cuotas", value: "1 inicial + 1", badge: null },
        { label: "Interés", value: "0%", badge: "verde" },
      ],
    },
  ];

  return (
    <section className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-16">
          <div className="section-tag bg-primary-100 text-primary mb-4">
            <Smartphone className="w-3.5 h-3.5" /> La app
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-dark mb-4">
            Con SaludTech obtén al instante lo que necesitas
          </h2>
          <p className="text-slate-500 text-lg">
            Tres razones para elegir SaludTech antes que cualquier otra opción.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className={`rounded-3xl border ${f.border} bg-gradient-to-br ${f.color} p-6 flex flex-col`}>
              <div className={`w-11 h-11 rounded-2xl ${f.iconBg} flex items-center justify-center mb-4`}>
                <f.icon className={`w-6 h-6 ${f.iconColor}`} />
              </div>
              <div className={`inline-flex self-start px-2.5 py-1 rounded-full text-xs font-bold mb-2 ${f.iconBg} ${f.iconColor}`}>
                {f.tag}
              </div>
              <h3 className="font-display font-bold text-dark text-lg mb-2 leading-snug">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed flex-1">{f.desc}</p>

              {/* Mini mockup */}
              <div className="mt-5 bg-white/70 backdrop-blur rounded-2xl p-4 border border-white/80 space-y-2">
                {f.mockupLines.map((line) => (
                  <div key={line.label} className="flex items-center justify-between">
                    <span className="text-slate-400 text-xs">{line.label}</span>
                    <div className="flex items-center gap-1.5">
                      {line.badge === "verde" && (
                        <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                      )}
                      <span className="text-dark text-xs font-bold">{line.value}</span>
                    </div>
                  </div>
                ))}
              </div>

              <a
                href={f.ctaHref}
                className={`mt-5 flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-bold transition-colors ${
                  f.iconColor === "text-primary"
                    ? "bg-primary text-white hover:bg-primary-dark"
                    : f.iconColor === "text-secondary"
                    ? "bg-secondary text-white hover:bg-secondary-dark"
                    : "bg-accent text-white hover:opacity-90"
                }`}
              >
                {f.cta}
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Red de Aliados ───────────────────────────────────────────────────────────
function RedAliados() {
  const categorias = [
    { label: "Farmacia", icon: Pill, count: "48" },
    { label: "Clínica", icon: Building2, count: "32" },
    { label: "Especialistas", icon: Stethoscope, count: "67" },
    { label: "Laboratorio", icon: Activity, count: "24" },
    { label: "Imagenología", icon: ShieldCheck, count: "18" },
    { label: "Fisioterapia", icon: Heart, count: "21" },
    { label: "Odontología", icon: Star, count: "30" },
    { label: "Elder Care", icon: Shield, count: "15" },
  ];

  return (
    <section id="aliados" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <div className="section-tag bg-secondary-50 text-secondary mb-3">
              <Building2 className="w-3.5 h-3.5" /> Red de aliados
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-bold text-dark">
              Estas clínicas y farmacias
              <br />
              <span className="text-primary">ya aceptan SaludTech</span>
            </h2>
          </div>
          <a
            href="/para-comercios"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-primary text-primary font-bold text-sm hover:bg-primary hover:text-white transition-colors"
          >
            Afiliar mi comercio
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
              <span className="text-xs text-slate-400">{cat.count} aliados</span>
            </button>
          ))}
        </div>

        {/* Logos placeholder strip */}
        <div className="relative overflow-hidden rounded-2xl bg-surface border border-slate-100 py-6 px-8">
          <p className="text-center text-xs text-slate-400 uppercase tracking-wider font-semibold mb-6">Algunos de nuestros comercios aliados</p>
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

// ─── Cómo funciona ────────────────────────────────────────────────────────────
function ComoFunciona() {
  const steps = [
    {
      num: "01",
      icon: Smartphone,
      title: "Descarga la app",
      desc: "Regístrate con tu cédula, número de teléfono y datos básicos. Sin papeleo.",
      color: "text-primary",
      bg: "bg-primary-50",
      border: "border-primary/20",
    },
    {
      num: "02",
      icon: Zap,
      title: "Aprobación en 3 min",
      desc: "Evaluamos tu perfil al instante y te asignamos tus líneas de crédito médico.",
      color: "text-secondary",
      bg: "bg-secondary-50",
      border: "border-secondary/20",
    },
    {
      num: "03",
      icon: QrCode,
      title: "Escanea en el comercio",
      desc: "El comercio genera un QR. Tú lo escaneas y pagas la inicial directamente desde la app.",
      color: "text-accent",
      bg: "bg-accent-50",
      border: "border-accent/20",
    },
    {
      num: "04",
      icon: CreditCard,
      title: "Paga en cuotas",
      desc: "El resto se divide en 3 cuotas iguales cada 14 días. Sin interés, sin sorpresas.",
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
            <Zap className="w-3.5 h-3.5" /> Simple y rápido
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-dark mb-4">
            Cómo funciona SaludTech
          </h2>
          <p className="text-slate-500 text-lg">
            Desde el registro hasta tu primera compra en menos de 5 minutos.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div key={step.num} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-full w-full h-px bg-gradient-to-r from-slate-200 to-transparent z-10 translate-x-2" />
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

// ─── Líneas de crédito ────────────────────────────────────────────────────────
function LineasDeCredito() {
  const lines = [
    {
      name: "Salud Cotidiana",
      icon: Pill,
      color: "text-secondary",
      bg: "bg-secondary",
      lightBg: "bg-secondary-50",
      border: "border-secondary/20",
      tagBg: "bg-secondary/10 text-secondary",
      limit: "Hasta $80",
      desc: "Para el día a día: farmacias, medicamentos, consultas generales y supermercados de salud.",
      features: [
        "Farmacias y droguerías",
        "Medicamentos recurrentes",
        "Consultas medicina general",
        "Pago inicial + 1 cuota (14 días)",
      ],
      badge: "Lo más usado",
    },
    {
      name: "Especialidad Principal",
      icon: Stethoscope,
      color: "text-primary",
      bg: "bg-primary",
      lightBg: "bg-primary-50",
      border: "border-primary/30",
      tagBg: "bg-primary/10 text-primary",
      limit: "Hasta $250",
      desc: "Para procedimientos, especialistas, imagenología, laboratorios y cirugías electivas.",
      features: [
        "Clínicas y hospitales privados",
        "Especialistas (cardiólogo, traumatólogo…)",
        "Laboratorios e imagenología",
        "Hasta 9 cuotas (nivel 3+)",
      ],
      badge: "Más popular",
      featured: true,
    },
    {
      name: "Mayor Cuidado",
      icon: Shield,
      color: "text-accent",
      bg: "bg-accent",
      lightBg: "bg-accent-50",
      border: "border-accent/20",
      tagBg: "bg-accent/10 text-accent",
      limit: "Hasta $150/mes",
      desc: "Suscripción mensual para el cuidado integral de adultos mayores. Nivel 4+ requerido.",
      features: [
        "Enfermera a domicilio",
        "Cuidador/a profesional",
        "Fisioterapia en casa",
        "Especialista en geriatría",
      ],
      badge: "Elder Care",
    },
  ];

  return (
    <section id="servicios" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="section-tag bg-accent-50 text-accent mb-4">
            <CreditCard className="w-3.5 h-3.5" /> Líneas de crédito
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-dark mb-4">
            Una línea para cada necesidad
          </h2>
          <p className="text-slate-500 text-lg">
            Tres líneas especializadas que crecen contigo a medida que subes de nivel.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {lines.map((line) => (
            <div
              key={line.name}
              className={`relative rounded-3xl border ${line.border} p-8 card-hover ${
                line.featured
                  ? "bg-hero-gradient shadow-2xl shadow-primary/20 scale-105"
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
                    <CheckCircle2
                      className={`w-4 h-4 shrink-0 mt-0.5 ${line.featured ? "text-secondary" : line.color}`}
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
  const categories = [
    { icon: Pill, label: "Farmacia", color: "text-secondary", bg: "bg-secondary-50" },
    { icon: Heart, label: "Cardiología", color: "text-red-500", bg: "bg-red-50" },
    { icon: Stethoscope, label: "Medicina General", color: "text-primary", bg: "bg-primary-50" },
    { icon: Users, label: "Pediatría", color: "text-amber-500", bg: "bg-amber-50" },
    { icon: Activity, label: "Laboratorios", color: "text-purple-500", bg: "bg-purple-50" },
    { icon: Building2, label: "Imagenología", color: "text-blue-600", bg: "bg-blue-50" },
    { icon: HeartPulse, label: "Traumatología", color: "text-orange-500", bg: "bg-orange-50" },
    { icon: Shield, label: "Elder Care", color: "text-accent", bg: "bg-accent-50" },
    { icon: UserCheck, label: "Dermatología", color: "text-pink-500", bg: "bg-pink-50" },
    { icon: Star, label: "Oftalmología", color: "text-indigo-500", bg: "bg-indigo-50" },
    { icon: TrendingUp, label: "Fisioterapia", color: "text-teal-500", bg: "bg-teal-50" },
    { icon: Zap, label: "Urgencias / Triage", color: "text-red-600", bg: "bg-red-50" },
  ];

  return (
    <section className="py-20 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <div className="section-tag bg-primary-100 text-primary mb-4">
            <Building2 className="w-3.5 h-3.5" /> Red de comercios
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-dark mb-3">
            Especialidades médicas que aceptan SaludTech
          </h2>
          <p className="text-slate-500">
            Más de 12 especialidades en nuestra red de comercios aliados.
          </p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.label}
              className="card-hover bg-white rounded-2xl p-4 flex flex-col items-center gap-3 shadow-sm border border-slate-100 cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-xl ${cat.bg} flex items-center justify-center`}>
                <cat.icon className={`w-6 h-6 ${cat.color}`} />
              </div>
              <span className="text-xs font-semibold text-slate-700 text-center leading-tight">{cat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Telemedicina & Triage ────────────────────────────────────────────────────
function Telemedicina() {
  const steps = [
    { icon: Smartphone, title: "Describe tus síntomas", desc: "Desde la app, indica qué sientes, el nivel de severidad y desde cuándo." },
    { icon: Zap, title: "Análisis IA en segundos", desc: "Nuestro sistema clasifica urgencia y te sugiere la especialidad correcta." },
    { icon: UserCheck, title: "Responde un médico real", desc: "Un doctor revisa tu caso y confirma o ajusta la recomendación." },
    { icon: Building2, title: "Te referimos al especialista", desc: "Con financiamiento ya aprobado para que no pierdas tiempo buscando cómo pagar." },
  ];

  return (
    <section id="triage" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Visual */}
          <div className="relative order-2 lg:order-1">
            <div className="w-full max-w-md mx-auto">
              {/* Triage card UI */}
              <div className="bg-hero-gradient rounded-3xl p-6 shadow-2xl shadow-dark/40">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                    <Activity className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Triaje Inteligente</p>
                    <p className="text-white/50 text-xs">Análisis en tiempo real</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20">
                    <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                    <span className="text-red-300 text-xs font-semibold">URGENCIA ALTA</span>
                  </div>
                </div>

                <div className="bg-white/8 rounded-2xl p-4 mb-4 space-y-3">
                  <p className="text-white/70 text-xs uppercase tracking-wider font-semibold">Síntomas reportados</p>
                  <div className="flex flex-wrap gap-2">
                    {["Dolor pecho", "Dificultad respirar", "Mareos"].map((s) => (
                      <span key={s} className="px-2.5 py-1 rounded-full bg-white/10 text-white/80 text-xs">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="bg-white/8 rounded-2xl p-4 mb-4">
                  <p className="text-white/70 text-xs uppercase tracking-wider font-semibold mb-2">Especialidad recomendada</p>
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-400" />
                    <span className="text-white font-semibold">Cardiología</span>
                  </div>
                </div>

                <div className="bg-secondary/15 border border-secondary/30 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white text-sm font-semibold">Línea Especialidad disponible</p>
                      <p className="text-white/60 text-xs mt-1">$180 disponibles · Cardiólogo más cercano a 2.1km</p>
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
                    <p className="text-xs text-slate-500">Médico revisó tu caso</p>
                    <p className="text-sm font-bold text-dark">Hace 2 minutos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="order-1 lg:order-2 space-y-8">
            <div>
              <div className="section-tag bg-red-50 text-red-600 mb-4">
                <HeartPulse className="w-3.5 h-3.5" /> Exclusivo SaludTech
              </div>
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-dark mb-4">
                Telemedicina y
                <br />
                <span className="text-gradient-primary">Triage inteligente</span>
              </h2>
              <p className="text-slate-500 text-lg leading-relaxed">
                Antes de ir a la clínica, consulta online. Nuestro sistema combina IA y
                médicos reales para darte la orientación correcta — y ya llegas con el
                financiamiento listo.
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

            <a href="#descarga" className="btn-primary inline-flex">
              Probar ahora gratis
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
  const services = [
    { icon: UserCheck, title: "Enfermera a domicilio", desc: "Cuidado y control médico en casa, sin desplazamientos." },
    { icon: Heart, title: "Cuidador/a profesional", desc: "Acompañamiento diario certificado para adultos mayores." },
    { icon: TrendingUp, title: "Fisioterapia en casa", desc: "Rehabilitación y movilidad sin salir del hogar." },
    { icon: Stethoscope, title: "Especialista en geriatría", desc: "Seguimiento médico especializado para la tercera edad." },
  ];

  return (
    <section id="elder-care" className="py-24 bg-gradient-to-br from-accent-50 via-white to-primary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div>
              <div className="section-tag bg-accent-50 text-accent mb-4">
                <Shield className="w-3.5 h-3.5" /> Elder Care · Nivel 4+
              </div>
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-dark mb-4">
                Cuidado especial para
                <br />
                <span className="text-gradient-accent">tus adultos mayores</span>
              </h2>
              <p className="text-slate-500 text-lg leading-relaxed">
                La línea <strong className="text-dark">Mayor Cuidado</strong> te permite contratar servicios de
                salud a domicilio para adultos mayores mediante una suscripción mensual sin
                intereses. Disponible para usuarios nivel 4+.
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
              <ShieldCheck className="w-5 h-5 text-accent shrink-0" />
              <p className="text-sm text-slate-700">
                <strong>Suscripción flexible:</strong> cancela cuando quieras, sin penalizaciones.
              </p>
            </div>
          </div>

          {/* Elder care visual */}
          <div className="flex justify-center">
            <div className="w-full max-w-sm space-y-4">
              <div className="bg-hero-gradient rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-accent/30 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-accent-light" />
                  </div>
                  <div>
                    <p className="text-white font-bold">Mayor Cuidado</p>
                    <p className="text-white/50 text-xs">Suscripción activa</p>
                  </div>
                  <div className="ml-auto px-2.5 py-1 rounded-full bg-secondary/20 text-secondary text-xs font-bold">ACTIVA</div>
                </div>

                {[
                  { service: "Enfermera · 3 días/sem", amount: "$45/mes" },
                  { service: "Fisioterapia · 2 días/sem", amount: "$30/mes" },
                ].map((item) => (
                  <div key={item.service} className="flex items-center justify-between p-3 rounded-xl bg-white/8 mb-3">
                    <span className="text-white/70 text-sm">{item.service}</span>
                    <span className="text-white font-semibold text-sm">{item.amount}</span>
                  </div>
                ))}

                <div className="mt-2 p-3 rounded-xl border border-accent/30 bg-accent/10">
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-xs">Total mensual</span>
                    <span className="text-white font-bold">$75/mes</span>
                  </div>
                  <div className="text-white/40 text-xs mt-1">Debitado de línea Mayor Cuidado</div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 shadow-md border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Award className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Requisito</p>
                    <p className="text-sm font-bold text-dark">Nivel 4 en Club SaludTech</p>
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

// ─── Club SaludTech ────────────────────────────────────────────────────────────
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
    { icon: TrendingUp, title: "Límite de crédito creciente", desc: "Cada nivel que subes aumenta tu disponible en todas tus líneas." },
    { icon: Clock, title: "Más cuotas disponibles", desc: "Nivel 3+ desbloquea hasta 6, 9 y 12 cuotas para compras grandes." },
    { icon: Zap, title: "Puntos por puntualidad", desc: "10 pts pagando a tiempo, 15 pts pagando antes del vencimiento." },
    { icon: Shield, title: "Mayor Cuidado desbloqueado", desc: "Nivel 4+ activa la línea de Elder Care para tu familia." },
  ];

  return (
    <section id="club" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="section-tag bg-amber-50 text-amber-600 mb-4">
            <Award className="w-3.5 h-3.5" /> Club SaludTech
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-16">
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

// ─── Para Comercios ────────────────────────────────────────────────────────────
function ParaComercios() {
  const benefits = [
    { icon: TrendingUp, title: "Aumenta tus ventas", desc: "Clientes que antes no podían pagar ahora sí pueden. Accede a más pacientes." },
    { icon: CreditCard, title: "Liquidación garantizada", desc: "SaludTech te paga el total de la venta. Tú no asumes el riesgo de cuotas." },
    { icon: QrCode, title: "QR en segundos", desc: "Genera un código QR desde tu portal y el paciente paga desde su app al instante." },
    { icon: ShieldCheck, title: "Sin papeleo", desc: "Registro 100% digital. Tu comercio activo en menos de 48 horas." },
  ];

  return (
    <section id="comercios" className="py-24 bg-hero-gradient">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div>
              <div className="section-tag bg-white/10 text-white/80 border border-white/20 mb-4">
                <Building2 className="w-3.5 h-3.5" /> Para Comercios
              </div>
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
                Lleva SaludTech
                <br />
                a tu clínica o farmacia
              </h2>
              <p className="text-white/60 text-lg leading-relaxed">
                Únete a la red de comercios de salud más innovadora de Venezuela.
                Sin riesgos, sin cobros adicionales, con liquidación garantizada.
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
              <a href="mailto:comercios@saludtech.app" className="btn-primary text-base px-7 py-4">
                <Mail className="w-5 h-5" />
                Registrar mi comercio
              </a>
              <a href="tel:+58000SALUDTECH" className="btn-secondary text-base px-7 py-4">
                <Phone className="w-5 h-5" />
                Hablar con un asesor
              </a>
            </div>
          </div>

          {/* Merchant portal card */}
          <div className="hidden lg:block">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/30 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-primary-light" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Portal Comercio</p>
                  <p className="text-white/40 text-xs">Clínica Santa María · Activo</p>
                </div>
                <div className="ml-auto px-2 py-1 rounded-full bg-secondary/20 text-secondary text-xs font-bold">EN LÍNEA</div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: "Ventas este mes", value: "$3,240", icon: TrendingUp, color: "text-secondary" },
                  { label: "Transacciones", value: "47", icon: CreditCard, color: "text-primary-light" },
                  { label: "Pacientes nuevos", value: "12", icon: Users, color: "text-accent-light" },
                  { label: "Liquidación pend.", value: "$890", icon: Clock, color: "text-amber-400" },
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
                  <p className="text-white/60 text-xs mb-1">Generar QR de cobro</p>
                  <p className="text-white font-semibold">$150.00 · Consulta cardiología</p>
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

// ─── Descarga ──────────────────────────────────────────────────────────────────
function Descarga() {
  const [contact, setContact] = useState("");
  const [sent, setSent] = useState(false);

  function handleNotify(e: React.FormEvent) {
    e.preventDefault();
    if (!contact.trim()) return;
    setSent(true);
    setContact("");
  }

  return (
    <section id="descarga" className="py-24 bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <div className="flex justify-center mb-6">
          <Logo size="lg" variant="icon" />
        </div>

        {/* Status badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/30 mb-5">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
          <span className="text-secondary text-xs font-bold tracking-widest uppercase">
            App en desarrollo final
          </span>
        </div>

        <h2 className="font-display text-4xl sm:text-5xl font-bold text-dark mb-4">
          Muy pronto en tu bolsillo
        </h2>
        <p className="text-slate-500 text-lg mb-10 max-w-xl mx-auto">
          La app está en su fase final de pruebas. Déjanos tu teléfono o correo y serás de
          los primeros en descargarla cuando esté lista.
        </p>

        {/* Store buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">

          {/* Android — próximamente, primer en llegar */}
          <div className="relative group">
            <div className="flex items-center gap-3 px-6 py-4 bg-dark text-white rounded-2xl shadow-lg cursor-default select-none">
              {/* Android icon */}
              <svg className="w-7 h-7 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.523 15.341A4.91 4.91 0 0 0 19 12a4.91 4.91 0 0 0-1.477-3.341l1.292-1.292a.75.75 0 1 0-1.06-1.06l-1.294 1.293A6.938 6.938 0 0 0 12 7a6.938 6.938 0 0 0-4.461 1.6L6.245 7.307a.75.75 0 1 0-1.06 1.06l1.292 1.292A4.91 4.91 0 0 0 5 12a4.91 4.91 0 0 0 1.477 3.341l-1.292 1.292a.75.75 0 1 0 1.06 1.06l1.294-1.293A6.938 6.938 0 0 0 12 17a6.938 6.938 0 0 0 4.461-1.6l1.294 1.293a.75.75 0 1 0 1.06-1.06l-1.292-1.292zM9 12a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm6 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
              </svg>
              <div className="text-left">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                  <p className="text-xs text-secondary font-bold leading-none">Próximamente</p>
                </div>
                <p className="font-semibold text-sm leading-tight">Google Play</p>
              </div>
            </div>
            {/* Tooltip */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-56 bg-dark text-white text-xs rounded-xl px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-10">
              ¡Estamos en la recta final! Regístrate abajo para ser el primero 🚀
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-dark rotate-45" />
            </div>
          </div>

          {/* iOS — llega después */}
          <div className="relative group">
            <div className="flex items-center gap-3 px-6 py-4 bg-slate-400/60 text-white rounded-2xl shadow-md border-2 border-dashed border-slate-300 cursor-default select-none">
              {/* Apple icon */}
              <svg className="w-7 h-7 shrink-0 opacity-80" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <div className="text-left">
                <p className="text-xs text-white/70 font-semibold leading-none mb-0.5">En camino… 🍎</p>
                <p className="font-semibold text-sm leading-tight">App Store</p>
              </div>
            </div>
            {/* Tooltip */}
            <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-60 bg-dark text-white text-xs rounded-xl px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl z-10">
              La versión iOS llega justo después de Android. ¡Paciencia, manzaneros! 🍎
              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-dark rotate-45" />
            </div>
          </div>
        </div>

        {/* Notification form */}
        <div className="max-w-md mx-auto mb-10">
          {sent ? (
            <div className="flex flex-col items-center gap-3 py-5 px-6 bg-secondary/10 border border-secondary/30 rounded-2xl">
              <CheckCircle2 className="w-8 h-8 text-secondary" />
              <p className="font-display font-bold text-dark text-base">¡Listo! Te avisamos en cuanto esté disponible 🎉</p>
              <p className="text-slate-400 text-xs">Eres parte de los primeros usuarios de SaludTech.</p>
              <button
                onClick={() => setSent(false)}
                className="text-xs text-primary hover:underline mt-1"
              >
                Registrar otro contacto
              </button>
            </div>
          ) : (
            <form onSubmit={handleNotify} className="flex gap-2">
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Tu teléfono o correo electrónico"
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-dark placeholder-slate-400 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <button
                type="submit"
                className="shrink-0 px-5 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-colors shadow-md shadow-primary/20"
              >
                Avísame
              </button>
            </form>
          )}
        </div>

        {/* Trust row */}
        <div className="flex flex-wrap justify-center gap-8 text-sm text-slate-500">
          {[
            { icon: ShieldCheck, text: "Datos protegidos" },
            { icon: CheckCircle2, text: "Sin cuotas ocultas" },
            { icon: Zap, text: "Aprobación en 3 min" },
          ].map((f) => (
            <div key={f.text} className="flex items-center gap-2">
              <f.icon className="w-4 h-4 text-secondary" />
              <span>{f.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  const links: Record<string, { label: string; href: string }[]> = {
    Producto: [
      { label: "Cómo funciona", href: "#como-funciona" },
      { label: "Líneas de crédito", href: "/lineas-de-credito" },
      { label: "Simulador de cuotas", href: "#simulador" },
      { label: "Club SaludTech", href: "#club" },
      { label: "Telemedicina", href: "#triage" },
      { label: "Elder Care", href: "#elder-care" },
    ],
    Comercios: [
      { label: "Afilia tu comercio", href: "/para-comercios" },
      { label: "Cómo funciona el cobro", href: "/para-comercios#como-funciona-comercio" },
      { label: "Portal de comercios", href: "#" },
      { label: "Documentos requeridos", href: "/para-comercios#proceso" },
    ],
    Legal: [
      { label: "Términos y condiciones", href: "#" },
      { label: "Política de privacidad", href: "#" },
      { label: "Preguntas frecuentes", href: "#faq" },
      { label: "Contacto", href: "mailto:hola@saludtech.app" },
    ],
  };

  return (
    <footer className="bg-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <Logo size="md" light />
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Financiamiento médico sin interés para ti y tu familia. Tu salud primero,
              el pago después.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a href="mailto:hola@saludtech.app" className="flex items-center gap-2 text-white/40 hover:text-white text-xs transition-colors">
                <Mail className="w-4 h-4" />
                hola@saludtech.app
              </a>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <a href="#" className="flex items-center gap-2 text-white/40 hover:text-white text-xs transition-colors">
                <MapPin className="w-4 h-4" />
                Venezuela
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 className="font-semibold text-sm mb-4 text-white/80">{section}</h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    <a href={item.href} className="text-white/40 hover:text-white text-sm transition-colors">
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} SaludTech. Todos los derechos reservados.
          </p>
          <p className="text-white/30 text-xs">
            Financiamiento sin interés · No somos un banco · Venezuela
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <main>
      <Navbar />
      <Hero />
      <TrustStrip />
      <AppFeatures />
      <RedAliados />
      <ComoFunciona />
      <LineasDeCredito />
      <Especialidades />
      <Telemedicina />
      <ElderCare />
      <ClubSaludTech />
      <ParaComercios />
      <SimuladorCuotas />
      <FAQ />
      <Descarga />
      <Footer />
    </main>
  );
}
