"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ShieldCheck,
  User,
  Mail,
  Phone,
  CreditCard,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  Check,
} from "lucide-react";
import { getApiUrl, setSession } from "../../lib/api";
import { registerSchema } from "../../lib/validations";
import type { UserResponse } from "../../types/patient";

export default function PatientRegisterPage() {
  const router = useRouter();
  const t = useTranslations("Register");
  const tVal = useTranslations("Validations");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    nationalId: "",
    password: "",
    confirmPassword: "",
  });
  const [obscure, setObscure] = useState(true);
  const [obscureConfirm, setObscureConfirm] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const update = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const markTouched = (key: keyof typeof form) =>
    setTouched((t) => ({ ...t, [key]: true }));

  // Per-field validation using Zod
  const fieldErrors = useMemo(() => {
    const result = registerSchema.safeParse(form);
    if (result.success) return {};
    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] as string;
      if (!errors[key]) errors[key] = issue.message;
    }
    return errors;
  }, [form]);

  const getFieldError = (key: keyof typeof form): string | undefined =>
    touched[key] ? fieldErrors[key] : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      nationalId: true,
      password: true,
      confirmPassword: true,
    });
    const result = registerSchema.safeParse(form);
    if (!result.success) {
      setError(tVal(result.error.issues[0].message));
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(getApiUrl("auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          identityDocument: form.nationalId.trim(),
          password: form.password,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const msg =
          data.error === "Phone already registered"
            ? t("phoneAlreadyRegistered")
            : data.error === "Email already registered"
              ? t("emailAlreadyRegistered")
              : data.message ?? data.error ?? t("registerFailed");
        throw new Error(msg);
      }
      const data = await res.json();
      if (data.token && data.user) {
        setSession(data.token, data.user as UserResponse);
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("registerError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-base-100/80 backdrop-blur border-b border-border">
        <div className="max-w-md mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            aria-label={t("back")}
            className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-foreground font-display">
            {t("title")}
          </h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        {/* Trust banner */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-primary/8 mb-7">
          <ShieldCheck className="w-7 h-7 text-primary shrink-0" />
          <p className="text-sm text-primary">
            {t("trustBanner")}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            id="firstName"
            label={t("firstName")}
            icon={<User className="w-4 h-4" />}
            value={form.firstName}
            onChange={(v) => update("firstName", v)}
            onBlur={() => markTouched("firstName")}
            error={getFieldError("firstName") ? tVal(getFieldError("firstName") as string) : undefined}
            required
          />
          <Field
            id="lastName"
            label={t("lastName")}
            icon={<User className="w-4 h-4" />}
            value={form.lastName}
            onChange={(v) => update("lastName", v)}
            onBlur={() => markTouched("lastName")}
            error={getFieldError("lastName") ? tVal(getFieldError("lastName") as string) : undefined}
            required
          />
          <Field
            id="email"
            label={t("email")}
            type="email"
            icon={<Mail className="w-4 h-4" />}
            value={form.email}
            onChange={(v) => update("email", v)}
            onBlur={() => markTouched("email")}
            error={getFieldError("email") ? tVal(getFieldError("email") as string) : undefined}
            required
          />
          <Field
            id="phone"
            label={t("phone")}
            type="tel"
            icon={<Phone className="w-4 h-4" />}
            value={form.phone}
            onChange={(v) => update("phone", v)}
            onBlur={() => markTouched("phone")}
            error={getFieldError("phone") ? tVal(getFieldError("phone") as string) : undefined}
            required
          />
          <Field
            id="nationalId"
            label={t("nationalId")}
            icon={<CreditCard className="w-4 h-4" />}
            value={form.nationalId}
            onChange={(v) => update("nationalId", v)}
            onBlur={() => markTouched("nationalId")}
            error={getFieldError("nationalId") ? tVal(getFieldError("nationalId") as string) : undefined}
            required
          />

          <PasswordField
            id="password"
            label={t("password")}
            value={form.password}
            obscure={obscure}
            onToggle={() => setObscure((v) => !v)}
            onChange={(v) => update("password", v)}
            onBlur={() => markTouched("password")}
            error={getFieldError("password") ? tVal(getFieldError("password") as string) : undefined}
          />

          <PasswordField
            id="confirmPassword"
            label={t("confirmPassword")}
            value={form.confirmPassword}
            obscure={obscureConfirm}
            onToggle={() => setObscureConfirm((v) => !v)}
            onChange={(v) => update("confirmPassword", v)}
            onBlur={() => markTouched("confirmPassword")}
            error={getFieldError("confirmPassword") ? tVal(getFieldError("confirmPassword") as string) : undefined}
          />

          {/* Password strength indicator */}
          {form.password.length > 0 && (
            <PasswordStrength password={form.password} />
          )}

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-full text-base font-bold"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : null}
            {isLoading ? t("creatingAccount") : t("createAccount")}
          </button>
        </form>
      </main>
    </div>
  );
}

// ─── Password strength indicator ──────────────────────────────

function PasswordStrength({ password }: { password: string }) {
  const t = useTranslations("Register");
  const checks = [
    { label: t("passwordMinLength"), ok: password.length >= 8 },
    { label: t("passwordUppercase"), ok: /[A-Z]/.test(password) },
    { label: t("passwordLowercase"), ok: /[a-z]/.test(password) },
    { label: t("passwordNumber"), ok: /[0-9]/.test(password) },
  ];
  const passed = checks.filter((c) => c.ok).length;
  const strengthLabels = [
    t("strengthVeryWeak"),
    t("strengthWeak"),
    t("strengthFair"),
    t("strengthGood"),
    t("strengthStrong"),
  ];
  const strengthLabel = strengthLabels[passed];
  const strengthColor = ["bg-red-500", "bg-red-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"][passed];

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full ${i < passed ? strengthColor : "bg-muted"}`}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{strengthLabel}</p>
      <ul className="space-y-1">
        {checks.map((c) => (
          <li
            key={c.label}
            className={`flex items-center gap-2 text-xs ${c.ok ? "text-green-600" : "text-muted-foreground"}`}
          >
            {c.ok ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
            {c.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Field components ─────────────────────────────────────────

interface FieldProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  type?: string;
  required?: boolean;
  error?: string;
}

function Field({ id, label, icon, value, onChange, onBlur, type = "text", required, error }: FieldProps) {
  return (
    <div className="form-control gap-1">
      <label htmlFor={id} className="label pb-0">
        <span className="label-text font-medium">{label}</span>
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {icon}
        </span>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          required={required}
          className={`input input-bordered w-full pl-10 ${error ? "input-error" : ""}`}
        />
      </div>
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1 mt-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  obscure: boolean;
  onToggle: () => void;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
}

function PasswordField({ id, label, value, obscure, onToggle, onChange, onBlur, error }: PasswordFieldProps) {
  const t = useTranslations("Register");
  return (
    <div className="form-control gap-1">
      <label htmlFor={id} className="label pb-0">
        <span className="label-text font-medium">{label}</span>
      </label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          id={id}
          type={obscure ? "password" : "text"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          required
          minLength={8}
          autoComplete="new-password"
          className={`input input-bordered w-full pl-10 pr-10 ${error ? "input-error" : ""}`}
        />
        <button
          type="button"
          onClick={onToggle}
          aria-label={obscure ? t("showPassword") : t("hidePassword")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {obscure ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
      </div>
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1 mt-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}
