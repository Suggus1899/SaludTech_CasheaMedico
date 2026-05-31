"use client";

import {
  Building2,
  FileText,
  CheckCircle2,
  QrCode,
  TrendingUp,
  CreditCard,
  ShieldCheck,
  Users,
  Clock,
  ArrowRight,
  Phone,
  Mail,
  ChevronRight,
  Star,
} from "lucide-react";
import Link from "next/link";
import SharedLayout from "../components/SharedLayout";

// ─── Hero Comercios ────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="pt-32 pb-20 bg-hero-gradient overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 -right-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 -left-20 w-72 h-72 rounded-full bg-secondary/10 blur-3xl" />
      </div>
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 border border-primary/30 mb-6">
          <Building2 className="w-4 h-4 text-primary" />
          <span className="text-primary text-xs font-semibold tracking-widest uppercase">Para Comercios · Clínicas · Farmacias</span>
        </div>
        <h1 className="font-display text-5xl sm:text-6xl font-bold text-white mb-6 leading-tight">
          Acepta SaludTech y
          <br />
          <span className="bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary">
            aumenta tus ventas +20%
          </span>
        </h1>
        <p className="text-slate-300 text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Ofrece financiamiento sin interés a tus pacientes. SaludTech asume el riesgo,
          tú recibes el pago completo al instante.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <a
            href="#proceso"
            className="inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-primary text-white font-bold text-base hover:bg-primary-dark transition-colors shadow-lg shadow-primary/30"
          >
            Ver cómo afiliarse
            <ArrowRight className="w-5 h-5" />
          </a>
          <a
            href="tel:+58000SALUDTECH"
            className="inline-flex items-center gap-2 px-7 py-4 rounded-xl border-2 border-white/30 text-white font-bold text-base hover:bg-white/10 transition-colors"
          >
            <Phone className="w-5 h-5" />
            Hablar con un asesor
          </a>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-16 max-w-2xl mx-auto">
          {[
            { value: "+20%", label: "Aumento en ventas" },
            { value: "48h", label: "Activación típica" },
            { value: "0", label: "Riesgo para ti" },
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
  const items = [
    {
      icon: TrendingUp,
      title: "Aumenta tu ticket promedio",
      desc: "Los pacientes que antes diferían la consulta o el medicamento ahora compran sin dudarlo. Tu ticket promedio sube porque no hay fricción de pago.",
      color: "text-secondary",
      bg: "bg-secondary-50",
    },
    {
      icon: CreditCard,
      title: "Liquidación garantizada",
      desc: "SaludTech te paga el 100% de la transacción (menos el MDR de 3.5%). Tú no gestionas cuotas ni cobros al paciente.",
      color: "text-primary",
      bg: "bg-primary-50",
    },
    {
      icon: Users,
      title: "Acceso a más pacientes",
      desc: "Los usuarios de SaludTech buscan activamente comercios aliados en la app. Tu clínica o farmacia aparece geolocalizada para usuarios cercanos.",
      color: "text-accent",
      bg: "bg-accent-50",
    },
    {
      icon: QrCode,
      title: "Cobro en segundos con QR",
      desc: "Genera el QR desde tu portal de comercio. El paciente lo escanea y confirma. Sin POS adicional, sin integración compleja.",
      color: "text-primary",
      bg: "bg-primary-50",
    },
    {
      icon: ShieldCheck,
      title: "Sin riesgo de impago",
      desc: "El riesgo crediticio del paciente lo asume SaludTech, no tú. Una vez confirmada la transacción, el pago está garantizado.",
      color: "text-secondary",
      bg: "bg-secondary-50",
    },
    {
      icon: Clock,
      title: "Activación en 48 horas",
      desc: "Proceso 100% digital. Sin visitas a oficinas, sin papeleo físico. Sube los documentos, firma el contrato digital y listo.",
      color: "text-accent",
      bg: "bg-accent-50",
    },
  ];

  return (
    <section id="beneficios" className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-16">
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-dark mb-4">
            ¿Por qué elegir SaludTech para tu negocio?
          </h2>
          <p className="text-slate-500 text-lg">
            El método de pago que convierte más pacientes en clientes.
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
  const steps = [
    {
      num: "01",
      title: "El paciente llega a tu consulta",
      desc: "El paciente ya tiene SaludTech instalado y con su línea de crédito aprobada. Decide pagar con SaludTech.",
    },
    {
      num: "02",
      title: "Generas el QR de cobro",
      desc: "Desde tu portal web de comercio ingresas el monto y descripción del servicio. El sistema genera un QR único e irrepetible (válido 5 min).",
    },
    {
      num: "03",
      title: "El paciente escanea y confirma",
      desc: "El paciente escanea el QR con la app de SaludTech, ve el desglose (inicial + cuotas) y confirma el pago con su PIN.",
    },
    {
      num: "04",
      title: "Recibes confirmación instantánea",
      desc: "Tu portal muestra el pago confirmado en tiempo real. Puedes emitir la factura y entregar el servicio.",
    },
    {
      num: "05",
      title: "SaludTech gestiona las cuotas",
      desc: "A partir de aquí SaludTech cobra las cuotas al paciente cada 14 días. Tú ya cobraste — sin intervención adicional de tu parte.",
    },
    {
      num: "06",
      title: "Recibes la liquidación",
      desc: "En el ciclo de liquidación acordado (semanal o quincenal), SaludTech transfiere el monto acumulado menos el MDR (3.5%).",
    },
  ];

  return (
    <section id="como-funciona-comercio" className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-primary-100 text-primary mb-4">
            <QrCode className="w-3.5 h-3.5" /> Flujo de cobro
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-dark mb-4">
            Cómo funciona el cobro con SaludTech
          </h2>
          <p className="text-slate-500 text-lg">
            De la consulta al cobro en menos de 60 segundos.
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
  const pasos = [
    {
      num: 1,
      title: "Completa el formulario",
      desc: "Llena el formulario de registro online. Toma menos de 5 minutos.",
      icon: FileText,
    },
    {
      num: 2,
      title: "Sube los documentos",
      desc: "Registro mercantil, acta de junta directiva, RIF actualizado, cédula del representante y factura fiscal.",
      icon: CheckCircle2,
    },
    {
      num: 3,
      title: "Firma el contrato digital",
      desc: "Revisas y firmas el contrato de manera 100% digital y segura. Sin visitas ni papeles.",
      icon: ShieldCheck,
    },
    {
      num: 4,
      title: "Recibe acceso al portal",
      desc: "En 48 horas recibes tus credenciales para el portal de comercio y ya puedes generar QRs.",
      icon: Building2,
    },
  ];

  const documentos = [
    { nombre: "Registro mercantil", desc: "o documento constitutivo de la empresa" },
    { nombre: "Acta de junta directiva", desc: "última acta vigente" },
    { nombre: "RIF actualizado", desc: "en PDF · uno por sucursal con razón social distinta" },
    { nombre: "Cédula vigente", desc: "del o los representantes legales" },
    { nombre: "Factura fiscal", desc: "capacidad para emitir factura fiscal (manual o digital)" },
  ];

  return (
    <section id="proceso" className="py-24 bg-linear-to-br from-dark via-slate-900 to-dark text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-white/10 text-white/70 mb-4">
            <Star className="w-3.5 h-3.5" /> Afiliación
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold mb-4">
            Afíliate en 4 pasos
          </h2>
          <p className="text-white/60 text-lg">
            Proceso 100% digital. Activación típica en 48 horas.
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
                  <div className="text-white/40 text-xs font-semibold mb-1">PASO {paso.num}</div>
                  <h4 className="font-display font-bold text-white mb-1">{paso.title}</h4>
                  <p className="text-white/60 text-sm leading-relaxed">{paso.desc}</p>
                </div>
              </div>
            ))}

            <a
              href="mailto:comercios@saludtech.app"
              className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-primary text-white font-bold text-base hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20 mt-4"
            >
              <Mail className="w-5 h-5" />
              Iniciar mi registro
            </a>
          </div>

          {/* Documentos requeridos */}
          <div className="bg-white/5 rounded-3xl border border-white/10 p-7">
            <h3 className="font-display font-bold text-white text-xl mb-2">Documentos requeridos</h3>
            <p className="text-white/50 text-sm mb-6">Ten estos documentos listos para agilizar el proceso.</p>
            <div className="space-y-4">
              {documentos.map((doc) => (
                <div key={doc.nombre} className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-semibold text-sm">{doc.nombre}</p>
                    <p className="text-white/50 text-xs">{doc.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-white/60 text-sm">¿Tienes dudas sobre los documentos?</p>
              <a href="mailto:comercios@saludtech.app" className="flex items-center gap-2 text-primary-light text-sm font-semibold mt-2 hover:underline">
                <Mail className="w-4 h-4" />
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
  const cats = [
    "Farmacia / Droguería",
    "Clínica privada",
    "Consultorio médico",
    "Laboratorio clínico",
    "Imagenología / Radiología",
    "Fisioterapia",
    "Odontología",
    "Óptica",
    "Centro de diálisis",
    "Servicio de Elder Care",
    "Centro de triage / urgencias",
    "Nutrición y dietética",
  ];

  return (
    <section className="py-20 bg-surface">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-dark mb-4">
          Categorías de comercios aceptados
        </h2>
        <p className="text-slate-500 mb-10">Si tu negocio es del sector salud, SaludTech es para ti.</p>
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
  return (
    <section className="py-20 bg-primary">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <h2 className="font-display text-4xl font-bold text-white mb-4">
          ¿Listo para crecer con SaludTech?
        </h2>
        <p className="text-white/70 text-lg mb-8">
          Únete a la red de comercios de salud más innovadora de Venezuela.
          Sin riesgos. Sin papeles. En 48 horas.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="mailto:comercios@saludtech.app"
            className="inline-flex items-center gap-2 px-7 py-4 rounded-xl bg-white text-primary font-bold text-base hover:bg-primary-50 transition-colors"
          >
            <Mail className="w-5 h-5" />
            Afiliar mi comercio
          </a>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-7 py-4 rounded-xl border-2 border-white/40 text-white font-bold text-base hover:bg-white/10 transition-colors"
          >
            Ver landing principal
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function ParaComercios() {
  return (
    <SharedLayout>
      <Hero />
      <Beneficios />
      <ComoFunciona />
      <ProcesoAfiliacion />
      <Categorias />
      <CTAFinal />
    </SharedLayout>
  );
}
