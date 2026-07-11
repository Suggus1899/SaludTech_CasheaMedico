"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, AlertCircle, HeartPulse, ShieldCheck, Clock } from "lucide-react";
import { Logo } from "../../components/Logo";
import { getApiUrl, setSession } from "../../lib/api";
import type { UserResponse } from "../../types/patient";

export default function PatientLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch(getApiUrl("auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? "Credenciales incorrectas");
      }
      const data = await res.json();
      setSession(data.token, data.user as UserResponse);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* ─── Brand Panel ─── */}
      <div className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden bg-gradient-to-br from-[#0a2535] via-[#0d3347] to-[#134e6b]">
        {/* Decorative blurs */}
        <div className="absolute top-1/4 -right-32 w-96 h-96 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-1/4 -left-32 w-80 h-80 rounded-full bg-secondary/15 blur-3xl" />

        {/* Top: Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 backdrop-blur text-white font-bold">
              ST
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">
              Salud<span className="text-secondary">Tech</span>
            </span>
          </div>
        </div>

        {/* Middle: Value proposition */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Tu salud,
              <br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                sin esperar
              </span>
              <br />
              ni endeudarte
            </h1>
            <p className="text-white/60 text-lg max-w-md">
              Accede a farmacias, clínicas y especialistas. Paga en cuotas cada 14 días con 0% de interés.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: HeartPulse, title: "0% de interés siempre", desc: "Sin letras ocultas ni sorpresas" },
              { icon: Clock, title: "Aprobación en 3 minutos", desc: "Registro 100% digital" },
              { icon: ShieldCheck, title: "Red de +127 comercios", desc: "Farmacias, clínicas, laboratorios" },
            ].map((f) => (
              <div key={f.title} className="flex items-center gap-4">
                <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/10 backdrop-blur shrink-0">
                  <f.icon className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{f.title}</p>
                  <p className="text-white/50 text-xs">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Stats */}
        <div className="relative z-10 flex gap-8">
          {[
            { value: "0%", label: "Interés" },
            { value: "3 min", label: "Aprobación" },
            { value: "14 días", label: "Entre cuotas" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-white/40 text-xs mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Form Panel ─── */}
      <div className="flex items-center justify-center p-6 sm:p-12 bg-base-100">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex lg:hidden flex-col items-center mb-8">
            <Logo size="lg" />
            <p className="text-sm text-muted-foreground mt-2">Salud financiada a tu alcance</p>
          </div>

          {/* Header */}
          <div className="hidden lg:block mb-8">
            <h2 className="text-2xl font-bold text-base-content">Bienvenido de nuevo</h2>
            <p className="text-muted-foreground text-sm mt-1">Ingresa a tu cuenta para continuar</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="form-control gap-1.5">
              <label htmlFor="email" className="label pb-0">
                <span className="label-text font-medium text-sm">Correo electrónico</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="input input-bordered w-full pl-11 h-12 bg-base-200/50 focus:bg-base-100 transition-colors"
                />
              </div>
            </div>

            <div className="form-control gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="label pb-0">
                  <span className="label-text font-medium text-sm">Contraseña</span>
                </label>
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                  onClick={() => {}}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="input input-bordered w-full pl-11 pr-11 h-12 bg-base-200/50 focus:bg-base-100 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-base-content transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2.5 text-sm text-error bg-error/10 p-3.5 rounded-xl border border-error/20"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-full h-12 text-base font-semibold mt-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="divider text-xs text-muted-foreground my-6">o</div>

          {/* Register CTA */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              ¿No tienes cuenta?{" "}
              <button
                onClick={() => router.push("/registro")}
                className="font-bold text-primary hover:underline"
              >
                Crear cuenta gratis
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
