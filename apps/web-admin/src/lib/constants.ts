import {
  Activity,
  CreditCard,
  Store,
  Users,
  HeartPulse,
  ShieldAlert,
  CalendarDays,
} from "lucide-react";

export const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: Activity, href: "/dashboard" },
  { id: "pacientes", label: "Pacientes", icon: Users, href: "/pacientes" },
  { id: "comercios", label: "Comercios", icon: Store, href: "/comercios" },
  { id: "financiamientos", label: "Financiamientos", icon: CreditCard, href: "/financiamientos" },
  { id: "triajes", label: "Triajes", icon: HeartPulse, href: "/triajes" },
  { id: "elder-care", label: "Elder Care", icon: ShieldAlert, href: "/elder-care" },
  { id: "suscripciones", label: "Suscripciones", icon: CalendarDays, href: "/suscripciones" },
];
