import { z } from "zod";

// Venezuelan phone: +58 4XX-XXXXXXX or 04XX-XXXXXXX
const phoneRegex = /^(\+58|0)?4(12|14|16|24|26)\d{7}$/;

// Venezuelan national ID: V/E/G/J/C + 6-9 digits
const nationalIdRegex = /^(V|E|G|J|C)?\d{6,9}$/i;

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "firstNameMin")
      .max(50, "firstNameMax"),
    lastName: z
      .string()
      .min(2, "lastNameMin")
      .max(50, "lastNameMax"),
    email: z
      .string()
      .min(1, "emailRequired")
      .email("emailInvalid"),
    phone: z
      .string()
      .min(1, "phoneRequired")
      .regex(phoneRegex, "phoneInvalid"),
    nationalId: z
      .string()
      .min(1, "nationalIdRequired")
      .regex(nationalIdRegex, "nationalIdInvalid"),
    password: z
      .string()
      .min(8, "passwordMin")
      .max(100, "passwordMax")
      .regex(/[A-Z]/, "passwordUppercase")
      .regex(/[a-z]/, "passwordLowercase")
      .regex(/[0-9]/, "passwordNumber"),
    confirmPassword: z.string().min(1, "confirmRequired"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "passwordsNoMatch",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "emailRequired")
    .email("emailInvalid"),
  password: z
    .string()
    .min(1, "loginPasswordRequired")
    .min(8, "passwordMin"),
});

export type RegisterForm = z.infer<typeof registerSchema>;
export type LoginForm = z.infer<typeof loginSchema>;
