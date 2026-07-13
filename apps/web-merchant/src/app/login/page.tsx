"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FlaskConical, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Logo } from "@saludtech/ui";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost/api/v1";

function getApiUrl(path: string): string {
  if (process.env.NEXT_PUBLIC_MOCK_API === "true") return `/api/mock/${path}`;
  return `${API_BASE}/${path}`;
}

export default function MerchantLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDemoMode = () => {
    const demoUser = { id: "mc-001", email: "comercio@saludtech.com", firstName: "Clínica", lastName: "Santa María", role: "MERCHANT", merchantId: "m-001" };
    localStorage.setItem("merchant_user", JSON.stringify(demoUser));
    document.cookie = "jwt_token=demo-token; path=/; max-age=86400; SameSite=Lax";
    router.push("/");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch(getApiUrl("auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message ?? "Credenciales incorrectas");
      }
      const data = await res.json();
      // JWT is now stored in an httpOnly cookie by the backend.
      localStorage.setItem("merchant_user", JSON.stringify(data.user));
      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Logo size="lg" className="mb-4" />
          <h1 className="text-2xl font-bold font-(family-name:--font-syne) text-foreground">
            Portal Comercio
          </h1>
          <p className="text-sm text-muted-foreground mt-1">SaludTech — Plataforma BNPL Médica</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl shadow-sm p-8">
          <h2 className="text-lg font-semibold font-(family-name:--font-syne) mb-6">
            Inicia sesión
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="form-control gap-1">
              <label htmlFor="email" className="label pb-0"><span className="label-text font-medium">Correo electrónico</span></label>
              <input
                id="email"
                type="email"
                placeholder="comercio@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                aria-required="true"
                className="input input-bordered w-full"
              />
            </div>

            <div className="form-control gap-1">
              <label htmlFor="password" className="label pb-0"><span className="label-text font-medium">Contraseña</span></label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  aria-required="true"
                  className="input input-bordered w-full pr-10"
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
              <div role="alert" className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
              {isLoading ? <span className="loading loading-spinner loading-sm" /> : null}
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>

          {process.env.NEXT_PUBLIC_MOCK_API === "true" && (
            <div className="mt-4 pt-4 border-t border-border">
              <button
                type="button"
                onClick={handleDemoMode}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg border-2 border-dashed border-secondary text-secondary hover:bg-secondary/10 transition-all text-sm font-medium"
              >
                <FlaskConical className="w-4 h-4" />
                Entrar en Modo Demo
              </button>
              <p className="text-center text-xs text-muted-foreground mt-2">Datos simulados — sin backend real</p>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          ¿Problemas para acceder? Contacta a{" "}
          <a href="mailto:soporte@saludtech.com" className="text-primary hover:underline">
            soporte@saludtech.com
          </a>
        </p>
      </div>
    </div>
  );
}
