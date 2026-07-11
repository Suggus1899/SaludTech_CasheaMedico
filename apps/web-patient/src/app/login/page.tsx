"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Stethoscope, Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / marca */}
        <div className="flex flex-col items-center mb-10">
          <div
            className="p-5 rounded-3xl shadow-lg"
            style={{
              background: "linear-gradient(135deg, #1A6B8A, #17A589)",
              boxShadow: "0 8px 20px rgba(26, 107, 138, 0.4)",
            }}
          >
            <Stethoscope className="w-12 h-12 text-white" />
          </div>
          <h1
            className="text-3xl font-bold mt-6 text-foreground"
            style={{ fontFamily: "var(--font-outfit, sans-serif)" }}
          >
            SaludTech
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Salud financiada a tu alcance
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control gap-1">
            <label htmlFor="email" className="label pb-0">
              <span className="label-text font-medium">Correo electrónico</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                id="email"
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="input input-bordered w-full pl-10"
              />
            </div>
          </div>

          <div className="form-control gap-1">
            <label htmlFor="password" className="label pb-0">
              <span className="label-text font-medium">Contraseña</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="input input-bordered w-full pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
            className="btn btn-primary w-full h-13 text-base font-bold"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : null}
            {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          ¿No tienes cuenta?{" "}
          <button
            onClick={() => router.push("/registro")}
            className="font-bold text-primary hover:underline"
          >
            Crear cuenta
          </button>
        </p>
      </div>
    </div>
  );
}
