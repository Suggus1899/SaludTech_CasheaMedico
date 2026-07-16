import { z } from "zod";

export interface LoginValidationMessages {
  emailRequired: string;
  emailInvalid: string;
  passwordRequired: string;
  passwordMinLength: string;
}

export function createLoginSchema(messages: LoginValidationMessages) {
  return z.object({
    email: z
      .string()
      .min(1, messages.emailRequired)
      .email(messages.emailInvalid),
    password: z
      .string()
      .min(1, messages.passwordRequired)
      .min(8, messages.passwordMinLength),
  });
}

export type LoginForm = z.infer<ReturnType<typeof createLoginSchema>>;
