"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle, User, Building2, Shield, CreditCard } from "lucide-react";

const FAQS = [
  {
    category: "Usuarios",
    icon: User,
    color: "text-primary",
    activeBg: "bg-primary",
    items: [
      {
        q: "¿Qué es SaludTech?",
        a: "SaludTech es una plataforma de financiamiento médico sin intereses (BNPL — Buy Now, Pay Later). Te permite pagar servicios de salud —farmacias, clínicas, especialistas, telemedicina y Elder Care— pagando solo una inicial y el resto en cuotas cada 14 días, con 0% de interés.",
      },
      {
        q: "¿Quién puede registrarse?",
        a: "Cualquier persona venezolana mayor de 18 años con cédula de identidad vigente y número de teléfono activo. No necesitas historial crediticio previo ni cuenta bancaria.",
      },
      {
        q: "¿Cuánto tiempo tarda la aprobación?",
        a: "La pre-aprobación es en menos de 3 minutos desde la app. Solo necesitas tu cédula, número de teléfono y datos básicos. No hay papeles, ni visitas a oficina, ni esperas.",
      },
      {
        q: "¿Hay intereses o cargos ocultos?",
        a: "No. SaludTech cobra 0% de interés siempre. El único cargo adicional posible es el de reactivación ($4) si una cuota vence sin pagar y necesitas reactivar tu cuenta. No hay cuota de membresía, ni cargos de apertura.",
      },
      {
        q: "¿Cómo funciona el pago en el comercio?",
        a: "El comercio genera un código QR desde su portal. Tú lo escaneas con la app de SaludTech, ves el desglose (inicial + cuotas), confirmas con tu PIN biométrico, y listo. Toda la operación toma menos de 30 segundos.",
      },
      {
        q: "¿Qué pasa si no pago una cuota a tiempo?",
        a: "Tu línea se pausa temporalmente hasta que regularices el pago. Se aplica un cargo de reactivación de $4. También puedes perder puntos Club SaludTech acumulados. Activar los recordatorios en la app evita esto.",
      },
      {
        q: "¿Puedo usar SaludTech para pagar online?",
        a: "Sí. Además de los comercios físicos con QR, puedes pagar servicios de telemedicina y farmacias online directamente desde la app, sin necesidad de escanear ningún código.",
      },
      {
        q: "¿En qué moneda funciona SaludTech?",
        a: "SaludTech opera en dólares americanos (USD). Los montos también se muestran en bolívares a la tasa BCV del día para tu referencia, pero el cobro se realiza en USD.",
      },
      {
        q: "¿Cómo pago mis cuotas?",
        a: "Desde la app puedes pagar con pago móvil interbancario, transferencia bancaria o divisas en efectivo en los puntos habilitados. Recibirás recordatorios automáticos 3 días antes de cada vencimiento.",
      },
    ],
  },
  {
    category: "Líneas de crédito",
    icon: CreditCard,
    color: "text-secondary",
    activeBg: "bg-secondary",
    items: [
      {
        q: "¿Cuántas líneas de crédito existen?",
        a: "SaludTech ofrece tres líneas: Salud Cotidiana (medicamentos y consultas del día a día, hasta $80), Especialidad Principal (procedimientos especializados, hasta $250+) y Mayor Cuidado (servicios Elder Care a domicilio, suscripción mensual).",
      },
      {
        q: "¿Cómo se calcula mi límite de crédito inicial?",
        a: "Al registrarte se evalúa tu perfil (datos de identidad, teléfono, historial declarado). Todos los usuarios comienzan en Nivel 1 con una línea de ~$80. El límite crece automáticamente al subir de nivel.",
      },
      {
        q: "¿Puedo usar varias líneas al mismo tiempo?",
        a: "Sí. Puedes tener transacciones activas en Salud Cotidiana y Especialidad Principal simultáneamente, siempre que tengas saldo disponible en cada línea.",
      },
      {
        q: "¿Cuántas cuotas tiene cada línea?",
        a: "Salud Cotidiana: 1 inicial + 1 cuota (Nivel 1-2) o 3 cuotas (Nivel 3+). Especialidad Principal: 3 cuotas (Nivel 1-2), hasta 12 cuotas (Nivel 6). Mayor Cuidado: débito mensual automático.",
      },
      {
        q: "¿Qué pasa cuando pago una cuota? ¿Recupero disponible?",
        a: "Sí. Cada cuota que pagas libera ese monto en tu línea disponible, igual que una tarjeta de crédito revolvente. Esto te permite hacer nuevas compras sin esperar a que se cierre el plan.",
      },
      {
        q: "¿Qué servicios cubre Salud Cotidiana?",
        a: "Medicamentos en farmacias y droguerías, consultas de medicina general, exámenes de rutina (hemograma, glucosa, lipidograma) y productos de salud en supermercados especializados.",
      },
      {
        q: "¿La línea Especialidad Principal cubre hospitalización?",
        a: "Sí, siempre que el comercio aliado sea la clínica o el centro médico que presta el servicio. La cobertura incluye hospitalización electiva, cirugías programadas, imagenología avanzada y consultas especializadas.",
      },
    ],
  },
  {
    category: "Club SaludTech",
    icon: Shield,
    color: "text-amber-600",
    activeBg: "bg-amber-500",
    items: [
      {
        q: "¿Qué es el Club SaludTech?",
        a: "Es el programa de fidelización de SaludTech. Acumulas puntos por cada pago puntual y al subir de nivel accedes a mayor límite de crédito, menor porcentaje inicial, más cuotas disponibles y beneficios exclusivos.",
      },
      {
        q: "¿Cómo acumulo puntos?",
        a: "Ganas puntos de varias formas: pago a tiempo (+10 pts por cuota), pago anticipado (+15 pts, más del 10% de bonus), referir un amigo que se registra (+40 pts), y uso mensual activo (+5 pts).",
      },
      {
        q: "¿Cuántos niveles hay?",
        a: "Hay 6 niveles: Nivel 1 Bronce, Nivel 2 Plata, Nivel 3 Oro, Nivel 4 Platino, Nivel 5 Diamante y Nivel 6 Elite. Cada nivel desbloquea mejores condiciones de financiamiento.",
      },
      {
        q: "¿Qué cambia al subir de nivel?",
        a: "Al subir de nivel aumenta tu límite de crédito, disminuye el porcentaje de pago inicial (de 50% en Nivel 1 a 25% en Nivel 6), y accedes a más cuotas. A partir del Nivel 3 puedes financiar en 6, 9 o 12 cuotas. El Nivel 4+ desbloquea Elder Care.",
      },
      {
        q: "¿Puedo perder mi nivel?",
        a: "Tu nivel no baja automáticamente, pero los puntos no pagados por cuotas vencidas se descuentan. Si tu saldo de puntos cae por debajo del umbral mínimo del nivel actual, podrías descender. Pagar puntualmente mantiene y sube tu nivel.",
      },
      {
        q: "¿Cómo refiero a un amigo?",
        a: "Desde la sección 'Referidos' en la app obtienes tu código o enlace único. Cuando tu amigo se registra y realiza su primera compra, ambos reciben los puntos de referido automáticamente.",
      },
      {
        q: "¿Los puntos tienen fecha de vencimiento?",
        a: "Los puntos no vencen mientras tu cuenta esté activa y hayas realizado al menos una transacción en los últimos 6 meses. Las cuentas inactivas por más de 6 meses pueden perder los puntos acumulados.",
      },
    ],
  },
  {
    category: "Elder Care",
    icon: Shield,
    color: "text-accent",
    activeBg: "bg-accent",
    items: [
      {
        q: "¿Qué es la línea Mayor Cuidado?",
        a: "Es una suscripción mensual para contratar servicios de salud a domicilio para adultos mayores. Incluye enfermera, cuidador/a profesional, fisioterapia y visita de especialista en geriatría. Los cobros se debitan automáticamente cada mes de tu línea Mayor Cuidado.",
      },
      {
        q: "¿Desde qué nivel está disponible Elder Care?",
        a: "La línea Mayor Cuidado se desbloquea a partir del Nivel 4 (Platino). Esto garantiza que el usuario tiene un historial de pago responsable antes de acceder a servicios de suscripción recurrente.",
      },
      {
        q: "¿Quién puede recibir los servicios Elder Care?",
        a: "El titular de la cuenta puede contratar los servicios para cualquier adulto mayor bajo su cuidado: padres, abuelos, suegros u otro familiar directo. No es necesario que el beneficiario sea usuario de SaludTech.",
      },
      {
        q: "¿Cuánto cuesta la suscripción?",
        a: "El costo varía según el plan y nivel: desde $100/mes (Nivel 4) hasta $150/mes (Nivel 6 Elite). El plan se descuenta automáticamente de tu línea Mayor Cuidado en la fecha de renovación.",
      },
      {
        q: "¿Puedo elegir los días y horarios del servicio?",
        a: "Sí. Al activar la suscripción seleccionas los días, horarios y tipo de servicio desde la app. Puedes modificar la agenda con al menos 24 horas de anticipación sin costo adicional.",
      },
      {
        q: "¿Puedo cancelar la suscripción Elder Care?",
        a: "Sí, sin penalización y en cualquier momento desde la app. Los servicios agendados dentro del período ya pagado se completan normalmente. El débito del siguiente mes no se realiza.",
      },
      {
        q: "¿Están certificados los cuidadores?",
        a: "Sí. Todos los profesionales de la red Elder Care de SaludTech cuentan con verificación de identidad, antecedentes penales y certificación en primeros auxilios. Los enfermeros tienen título universitario registrado.",
      },
      {
        q: "¿Qué pasa si el cuidador no puede asistir?",
        a: "SaludTech garantiza sustitución en menos de 2 horas o reprogramación sin costo. Si la cobertura falla, ese día se acredita en tu próxima factura.",
      },
    ],
  },
  {
    category: "Comercios",
    icon: Building2,
    color: "text-primary",
    activeBg: "bg-primary",
    items: [
      {
        q: "¿Quién puede afiliarse como comercio?",
        a: "Cualquier negocio del sector salud en Venezuela con RIF y capacidad de emitir factura fiscal: farmacias, clínicas, consultorios, laboratorios, centros de imagenología, fisioterapia, odontología, ópticas y servicios de Elder Care.",
      },
      {
        q: "¿Cuánto tarda la activación?",
        a: "La activación típica es de 48 horas para consultorios individuales y hasta 5 días hábiles para clínicas con múltiples sucursales. El proceso es 100% digital, sin visitas a oficina.",
      },
      {
        q: "¿Qué documentos necesito para afiliarme?",
        a: "Registro mercantil (o documento constitutivo), última acta de junta directiva vigente, RIF actualizado en PDF, cédula vigente del representante legal y una factura fiscal emitida por el negocio.",
      },
      {
        q: "¿Cómo genero el cobro con QR?",
        a: "Desde tu portal web de comercio ingresas el monto y descripción del servicio. El sistema genera un QR único válido por 5 minutos. El paciente lo escanea y confirma. Recibes la notificación de pago confirmado en tiempo real.",
      },
      {
        q: "¿Cuándo y cómo recibo el pago?",
        a: "SaludTech te liquida en el ciclo acordado (semanal o quincenal) el monto acumulado de tus transacciones, menos el MDR. La liquidación se realiza por transferencia bancaria o pago móvil a la cuenta registrada.",
      },
      {
        q: "¿Qué es el MDR y cuánto es?",
        a: "El MDR (Merchant Discount Rate) es la comisión que el comercio paga a SaludTech por el servicio de financiamiento. El MDR estándar es 3.5% por transacción. Este costo no se traslada al paciente. Comercios con alto volumen pueden acceder a tarifas preferenciales.",
      },
      {
        q: "¿Asumo algún riesgo si el paciente no paga sus cuotas?",
        a: "No. SaludTech asume el 100% del riesgo crediticio del paciente. Una vez que la transacción es confirmada (el paciente paga la inicial y SaludTech valida), tu pago está garantizado independientemente de que el paciente pague sus cuotas.",
      },
      {
        q: "¿Necesito instalar algún hardware o POS?",
        a: "No. Solo necesitas acceso a internet y un dispositivo para mostrar el QR (tablet, computadora o imprimir el código). No hay terminales físicas, ni instalaciones, ni costos de hardware.",
      },
      {
        q: "¿Puedo tener varias sucursales?",
        a: "Sí. Puedes gestionar múltiples sucursales desde un mismo portal de comercio. Cada sucursal tiene su propia cuenta y reporte de transacciones, pero la liquidación se puede consolidar en una sola cuenta bancaria.",
      },
    ],
  },
];

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
          <ChevronDown
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
  const [activeCategory, setActiveCategory] = useState("Usuarios");

  const current = FAQS.find((f) => f.category === activeCategory)!;
  const totalQuestions = FAQS.reduce((acc, f) => acc + f.items.length, 0);

  return (
    <section id="faq" className="py-24 bg-surface">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-slate-100 text-slate-600 mb-4">
            <HelpCircle className="w-3.5 h-3.5" /> Preguntas frecuentes
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-dark mb-3">
            Resolvemos tus dudas
          </h2>
          <p className="text-slate-500 text-lg">
            {totalQuestions} preguntas organizadas por tema. Usuarios, líneas de crédito, Club, Elder Care y Comercios.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar categories */}
          <div className="lg:w-56 shrink-0">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {FAQS.map((f) => {
                const isActive = activeCategory === f.category;
                return (
                  <button
                    key={f.category}
                    onClick={() => setActiveCategory(f.category)}
                    className={`w-full flex items-center justify-between gap-2 px-4 py-3.5 text-sm font-semibold transition-all border-b border-slate-50 last:border-0 text-left ${
                      isActive
                        ? "bg-primary text-white"
                        : "text-slate-600 hover:bg-slate-50 hover:text-primary"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <f.icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white/80" : f.color}`} />
                      <span>{f.category}</span>
                    </div>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-400"}`}>
                      {f.items.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Contact card */}
            <div className="mt-4 bg-white rounded-2xl border border-slate-100 p-4 text-center shadow-sm">
              <p className="text-slate-500 text-xs mb-2">¿No encuentras tu respuesta?</p>
              <a
                href="mailto:hola@saludtech.app"
                className="inline-flex items-center gap-1.5 text-primary text-xs font-bold hover:underline"
              >
                Escríbenos
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
                  <h3 className="font-display font-bold text-dark text-sm">{current.category}</h3>
                  <p className="text-slate-400 text-xs">{current.items.length} preguntas</p>
                </div>
              </div>

              {current.items.map((item, i) => (
                <FAQItem key={item.q} q={item.q} a={item.a} index={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
