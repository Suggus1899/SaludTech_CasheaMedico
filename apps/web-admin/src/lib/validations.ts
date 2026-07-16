import { z } from "zod";

const phoneRegex = /^(\+58|0)?4(12|14|16|24|26)\d{7}$/;
const rifRegex = /^[V|E|J|G|C]-?\d{6,9}$/i;
const nationalIdRegex = /^(V|E|G|J|C)?\d{6,9}$/i;

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "emailRequired")
    .email("emailInvalid"),
  password: z
    .string()
    .min(1, "passwordRequired")
    .min(8, "passwordMinLength"),
});

export const merchantFormSchema = z.object({
  legalName: z
    .string()
    .min(2, "legalNameMin")
    .max(100, "legalNameMax"),
  tradeName: z
    .string()
    .min(2, "tradeNameMin")
    .max(100, "tradeNameMax"),
  rif: z
    .string()
    .min(1, "rifRequired")
    .regex(rifRegex, "rifInvalid"),
  email: z
    .string()
    .min(1, "emailRequired")
    .email("emailInvalid"),
  phone: z
    .string()
    .min(1, "phoneRequired")
    .regex(phoneRegex, "phoneInvalid"),
  city: z
    .string()
    .min(2, "cityMin")
    .max(50, "cityMax"),
  contactName: z
    .string()
    .min(2, "contactNameMin")
    .max(100, "contactNameMax"),
});

export const patientFormSchema = z.object({
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
  identityDocument: z
    .string()
    .min(1, "identityRequired")
    .regex(nationalIdRegex, "identityInvalid"),
  password: z
    .string()
    .min(8, "passwordMinLength")
    .regex(/[A-Z]/, "passwordUppercase")
    .regex(/[a-z]/, "passwordLowercase")
    .regex(/\d/, "passwordNumber"),
});

export type LoginForm = z.infer<typeof loginSchema>;
export type MerchantForm = z.infer<typeof merchantFormSchema>;
export type PatientForm = z.infer<typeof patientFormSchema>;
