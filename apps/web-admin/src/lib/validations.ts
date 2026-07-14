import { z } from "zod";

const phoneRegex = /^(\+58|0)?4(12|14|16|24|26)\d{7}$/;
const rifRegex = /^[V|E|J|G|C]-?\d{6,9}$/i;
const nationalIdRegex = /^(V|E|G|J|C)?\d{6,9}$/i;

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El email es requerido")
    .email("Email inválido"),
  password: z
    .string()
    .min(1, "La contraseña es requerida")
    .min(8, "La contraseña debe tener mínimo 8 caracteres"),
});

export const merchantFormSchema = z.object({
  legalName: z
    .string()
    .min(2, "La razón social debe tener al menos 2 caracteres")
    .max(100, "La razón social no puede exceder 100 caracteres"),
  tradeName: z
    .string()
    .min(2, "El nombre comercial debe tener al menos 2 caracteres")
    .max(100, "El nombre comercial no puede exceder 100 caracteres"),
  rif: z
    .string()
    .min(1, "El RIF es requerido")
    .regex(rifRegex, "Formato inválido. Ej: J-12345678 o V-12345678"),
  email: z
    .string()
    .min(1, "El email es requerido")
    .email("Email inválido"),
  phone: z
    .string()
    .min(1, "El teléfono es requerido")
    .regex(phoneRegex, "Formato inválido. Ej: +584121234567"),
  city: z
    .string()
    .min(2, "La ciudad debe tener al menos 2 caracteres")
    .max(50, "La ciudad no puede exceder 50 caracteres"),
  contactName: z
    .string()
    .min(2, "El nombre del contacto debe tener al menos 2 caracteres")
    .max(100, "El nombre del contacto no puede exceder 100 caracteres"),
});

export const patientFormSchema = z.object({
  firstName: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "El nombre no puede exceder 50 caracteres"),
  lastName: z
    .string()
    .min(2, "El apellido debe tener al menos 2 caracteres")
    .max(50, "El apellido no puede exceder 50 caracteres"),
  email: z
    .string()
    .min(1, "El email es requerido")
    .email("Email inválido"),
  phone: z
    .string()
    .min(1, "El teléfono es requerido")
    .regex(phoneRegex, "Formato inválido. Ej: +584121234567"),
  identityDocument: z
    .string()
    .min(1, "La cédula es requerida")
    .regex(nationalIdRegex, "Formato inválido. Ej: V12345678"),
  password: z
    .string()
    .min(8, "La contraseña debe tener mínimo 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
    .regex(/[a-z]/, "Debe contener al menos una minúscula")
    .regex(/\d/, "Debe contener al menos un número"),
});

export type LoginForm = z.infer<typeof loginSchema>;
export type MerchantForm = z.infer<typeof merchantFormSchema>;
export type PatientForm = z.infer<typeof patientFormSchema>;
