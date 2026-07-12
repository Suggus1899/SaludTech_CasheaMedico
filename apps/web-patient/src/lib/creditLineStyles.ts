import {
  Stethoscope,
  Pill,
  Shield,
  CreditCard,
  type LucideIcon,
} from "lucide-react";

export interface CreditLineStyle {
  title: string;
  from: string;
  to: string;
  icon: LucideIcon;
}

export const creditLineStyles: Record<string, CreditLineStyle> = {
  ESPECIALIDAD_PRINCIPAL: {
    title: "Especialidad Principal",
    from: "#60A5FA",
    to: "#2563EB",
    icon: Stethoscope,
  },
  SALUD_COTIDIANA: {
    title: "Salud Cotidiana",
    from: "#34D399",
    to: "#10B981",
    icon: Pill,
  },
  MAYOR_CUIDADO: {
    title: "Mayor Cuidado",
    from: "#A78BFA",
    to: "#7C3AED",
    icon: Shield,
  },
};

export const defaultCreditLineStyle: CreditLineStyle = {
  title: "Línea de Salud",
  from: "#60A5FA",
  to: "#2563EB",
  icon: CreditCard,
};

export function getCreditLineStyle(type: string): CreditLineStyle {
  return creditLineStyles[type] ?? defaultCreditLineStyle;
}

export interface QuickActionStyle {
  color: string;
}

export const quickActionStyles: Record<string, QuickActionStyle> = {
  triaje: { color: "#1A6B8A" },
  pagar: { color: "#6366F1" },
  medicinas: { color: "#10B981" },
  cuidadoMayor: { color: "#7C3AED" },
  cuotas: { color: "#0EA5E9" },
};

export interface ElderCareServiceStyle {
  color: string;
  gradientFrom: string;
  gradientTo: string;
}

export const elderCareServiceStyles: Record<string, ElderCareServiceStyle> = {
  NURSE: { color: "#8B5CF6", gradientFrom: "#7C3AED", gradientTo: "#5B21B6" },
  CAREGIVER: { color: "#6366F1", gradientFrom: "#7C3AED", gradientTo: "#5B21B6" },
  PHYSIOTHERAPY: { color: "#7C3AED", gradientFrom: "#7C3AED", gradientTo: "#5B21B6" },
  GERIATRIC_SPECIALIST: { color: "#5B21B6", gradientFrom: "#7C3AED", gradientTo: "#5B21B6" },
};

export const elderCareHeroGradient = {
  from: "#7C3AED",
  to: "#5B21B6",
};

export const elderCareAccentColor = "#7C3AED";
export const elderCareEmptyColor = "#DDD6FE";

export const profileGradient = {
  from: "#1A6B8A",
  to: "#0F4C5C",
  shadow: "rgba(26, 107, 138, 0.3)",
};
