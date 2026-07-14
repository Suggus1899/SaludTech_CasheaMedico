"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Logo } from "@saludtech/ui";
import { getApiUrl } from "../../lib/api";

function VerifyContent() {
  const router = useSearchParams();
  const token = router.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token de verificacion no encontrado en la URL.");
      return;
    }

    async function verify() {
      try {
        const res = await fetch(getApiUrl(`auth/verify-email?token=${token}`));
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          setStatus("success");
          setMessage("Tu correo ha sido verificado exitosamente. Ya puedes usar SaludTech.");
        } else {
          setStatus("error");
          setMessage(data.error || data.message || "Token invalido o expirado.");
        }
      } catch {
        setStatus("error");
        setMessage("Error de conexion. Intenta mas tarde.");
      }
    }
    verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
          {status === "loading" && (
            <div className="text-center">
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-blue-500 animate-spin" />
              <h1 className="text-xl font-bold text-slate-800 mb-2">Verificando tu correo...</h1>
              <p className="text-slate-500 text-sm">Espera un momento.</p>
            </div>
          )}

          {status === "success" && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h1 className="text-xl font-bold text-slate-800 mb-2">Correo verificado</h1>
              <p className="text-slate-600 text-sm mb-6">{message}</p>
              <button
                onClick={() => (window.location.href = "/dashboard")}
                className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors"
              >
                Ir a mi cuenta
              </button>
            </div>
          )}

          {status === "error" && (
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-600" />
              </div>
              <h1 className="text-xl font-bold text-slate-800 mb-2">Error de verificacion</h1>
              <p className="text-slate-600 text-sm mb-6">{message}</p>
              <button
                onClick={() => (window.location.href = "/login")}
                className="w-full bg-slate-200 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-300 transition-colors"
              >
                Volver al login
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-slate-400 text-xs mt-6">
          SaludTech — Salud financiada a tu alcance.
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>}>
      <VerifyContent />
    </Suspense>
  );
}
