import { z } from "zod";

// Venezuelan phone: +58 4XX-XXXXXXX or 04XX-XXXXXXX
const phoneRegex = /^(\+58|0)?4(12|14|16|24|26)\d{7}$/;

// Venezuelan national ID: V/E/G/J/C + 6-9 digits
const nationalIdRegex = /^(V|E|G|J|C)?\d{6,9}$/i;

export const registerSchema = z
  .object({
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
      .regex(phoneRegex, "Formato inválido. Ej: +584121234567 o 04121234567"),
    nationalId: z
      .string()
      .min(1, "La cédula es requerida")
      .regex(nationalIdRegex, "Formato inválido. Ej: V12345678 o 12345678"),
    password: z
      .string()
      .min(8, "La contraseña debe tener mínimo 8 caracteres")
      .max(100, "La contraseña no puede exceder 100 caracteres")
      .regex(/[A-Z]/, "Debe incluir al menos una mayúscula")
      .regex(/[a-z]/, "Debe incluir al menos una minúscula")
      .regex(/[0-9]/, "Debe incluir al menos un número"),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

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

export type RegisterForm = z.infer<typeof registerSchema>;
export type LoginForm = z.infer<typeof loginSchema>;
