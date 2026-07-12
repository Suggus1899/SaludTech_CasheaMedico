"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";
import { getApiUrl, setSession } from "../../lib/api";
import type { UserResponse } from "../../types/patient";

export default function PatientRegisterPage() {
  const router = useRouter();
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

  const update = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.password.length < 8) {
      setError("La contraseña debe tener mínimo 8 caracteres");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (!form.email.includes("@")) {
      setError("Email inválido");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch(getApiUrl("auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        throw new Error(data.message ?? "No se pudo registrar");
      }
      const data = await res.json();
      if (data.token && data.user) {
        setSession(data.token, data.user as UserResponse);
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al registrar");
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
            aria-label="Volver"
            className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-foreground font-display">
            Crear Cuenta
          </h1>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-6">
        {/* Trust banner */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-primary/8 mb-7">
          <ShieldCheck className="w-7 h-7 text-primary shrink-0" />
          <p className="text-sm text-primary">
            Tus datos están protegidos y se usan únicamente para verificar tu identidad.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field
            id="firstName"
            label="Nombre"
            icon={<User className="w-4 h-4" />}
            value={form.firstName}
            onChange={(v) => update("firstName", v)}
            required
          />
          <Field
            id="lastName"
            label="Apellido"
            icon={<User className="w-4 h-4" />}
            value={form.lastName}
            onChange={(v) => update("lastName", v)}
            required
          />
          <Field
            id="email"
            label="Correo electrónico"
            type="email"
            icon={<Mail className="w-4 h-4" />}
            value={form.email}
            onChange={(v) => update("email", v)}
            required
          />
          <Field
            id="phone"
            label="Teléfono (Ej. +584141234567)"
            type="tel"
            icon={<Phone className="w-4 h-4" />}
            value={form.phone}
            onChange={(v) => update("phone", v)}
            required
          />
          <Field
            id="nationalId"
            label="Cédula (Ej. V-12345678)"
            icon={<CreditCard className="w-4 h-4" />}
            value={form.nationalId}
            onChange={(v) => update("nationalId", v)}
            required
          />

          <div className="form-control gap-1">
            <label htmlFor="password" className="label pb-0">
              <span className="label-text font-medium">Contraseña</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                id="password"
                type={obscure ? "password" : "text"}
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="input input-bordered w-full pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setObscure((v) => !v)}
                aria-label={obscure ? "Mostrar contraseña" : "Ocultar contraseña"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {obscure ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="form-control gap-1">
            <label htmlFor="confirmPassword" className="label pb-0">
              <span className="label-text font-medium">Confirmar Contraseña</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                id="confirmPassword"
                type={obscureConfirm ? "password" : "text"}
                value={form.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className="input input-bordered w-full pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setObscureConfirm((v) => !v)}
                aria-label={obscureConfirm ? "Mostrar contraseña" : "Ocultar contraseña"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {obscureConfirm ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
          </div>

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
            {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
          </button>
        </form>
      </main>
    </div>
  );
}

interface FieldProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}

function Field({ id, label, icon, value, onChange, type = "text", required }: FieldProps) {
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
          required={required}
          className="input input-bordered w-full pl-10"
        />
      </div>
    </div>
  );
}
