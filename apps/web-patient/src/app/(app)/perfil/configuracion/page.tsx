"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Sun,
  Moon,
  Bell,
  Mail,
  Clock,
  Lock,
  Fingerprint,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useTheme } from "../../../../hooks/useTheme";
import { getApiUrl, apiFetch } from "../../../../lib/api";

type NotificationPrefs = {
  push: boolean;
  email: boolean;
  reminders: boolean;
};

const DEFAULT_PREFS: NotificationPrefs = {
  push: true,
  email: true,
  reminders: true,
};

function loadPrefs(): NotificationPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem("notification_prefs");
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFS;
  }
}

function savePrefs(prefs: NotificationPrefs) {
  try {
    localStorage.setItem("notification_prefs", JSON.stringify(prefs));
  } catch {
    // localStorage may be unavailable
  }
}

export default function ConfiguracionPage() {
  const router = useRouter();
  const { theme, toggleTheme, mounted } = useTheme();
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setPrefs(loadPrefs());
  }, []);

  const updatePref = (key: keyof NotificationPrefs, value: boolean) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    savePrefs(next);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus({ type: null, message: "" });

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: "error", message: "Las contraseñas no coinciden." });
      return;
    }

    if (newPassword.length < 8) {
      setPasswordStatus({ type: "error", message: "La nueva contraseña debe tener al menos 8 caracteres." });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiFetch(getApiUrl("users/password"), {
        method: "PATCH",
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPasswordStatus({
          type: "error",
          message: data.error || "Error al cambiar la contraseña.",
        });
      } else {
        setPasswordStatus({ type: "success", message: "Contraseña actualizada correctamente." });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      setPasswordStatus({
        type: "error",
        message: "Error de conexión. Intenta de nuevo.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          aria-label="Volver"
          className="btn btn-ghost btn-sm btn-square"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-foreground font-display">
          Configuración
        </h1>
      </div>

      {/* ─── Apariencia ─────────────────────────────────────────── */}
      <section className="p-5 rounded-2xl border border-border bg-base-100 space-y-4">
        <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
          <Sun className="w-5 h-5 text-primary" />
          Apariencia
        </h2>

        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              {mounted && theme === "dark" ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Modo {mounted && theme === "dark" ? "Oscuro" : "Claro"}
              </p>
              <p className="text-xs text-muted-foreground">
                Cambia entre tema claro y oscuro
              </p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="btn btn-sm btn-primary gap-2"
            aria-label="Cambiar tema"
          >
            {mounted && theme === "dark" ? (
              <>
                <Sun className="w-4 h-4" /> Claro
              </>
            ) : (
              <>
                <Moon className="w-4 h-4" /> Oscuro
              </>
            )}
          </button>
        </div>
      </section>

      {/* ─── Notificaciones ─────────────────────────────────────── */}
      <section className="p-5 rounded-2xl border border-border bg-base-100 space-y-4">
        <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          Notificaciones
        </h2>

        <ToggleRow
          icon={<Bell className="w-5 h-5" />}
          label="Notificaciones Push"
          description="Recibe alertas en tu dispositivo"
          checked={prefs.push}
          onChange={(v) => updatePref("push", v)}
        />
        <ToggleRow
          icon={<Mail className="w-5 h-5" />}
          label="Notificaciones por Email"
          description="Resúmenes y alertas por correo"
          checked={prefs.email}
          onChange={(v) => updatePref("email", v)}
        />
        <ToggleRow
          icon={<Clock className="w-5 h-5" />}
          label="Recordatorio de Cuotas"
          description="Te avisa antes del vencimiento"
          checked={prefs.reminders}
          onChange={(v) => updatePref("reminders", v)}
        />
      </section>

      {/* ─── Seguridad ──────────────────────────────────────────── */}
      <section className="p-5 rounded-2xl border border-border bg-base-100 space-y-4">
        <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary" />
          Seguridad
        </h2>

        <form onSubmit={handlePasswordSubmit} className="space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Cambiar Contraseña</h3>

          {/* Current password */}
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Contraseña actual"
              required
              className="input input-bordered w-full pr-10"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-label="Mostrar/ocultar contraseña"
            >
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* New password */}
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nueva contraseña (mín. 8 caracteres)"
              required
              minLength={8}
              className="input input-bordered w-full pr-10"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-label="Mostrar/ocultar contraseña"
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Confirm password */}
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmar nueva contraseña"
              required
              className="input input-bordered w-full pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              aria-label="Mostrar/ocultar contraseña"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Feedback */}
          {passwordStatus.type && (
            <div
              className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
                passwordStatus.type === "success"
                  ? "bg-success/10 text-success"
                  : "bg-error/10 text-error"
              }`}
            >
              {passwordStatus.type === "success" ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              {passwordStatus.message}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !currentPassword || !newPassword || !confirmPassword}
            className="btn btn-primary w-full gap-2"
          >
            {isSubmitting && <span className="loading loading-spinner loading-sm" />}
            Actualizar Contraseña
          </button>
        </form>

        {/* Biometry placeholder */}
        <div className="flex items-center justify-between py-2 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-base-200 flex items-center justify-center text-muted-foreground">
              <Fingerprint className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Biometría</p>
              <p className="text-xs text-muted-foreground">Acceso con huella o rostro</p>
            </div>
          </div>
          <span className="badge badge-ghost badge-sm">Próximamente</span>
        </div>
      </section>
    </div>
  );
}

function ToggleRow({
  icon,
  label,
  description,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`toggle ${checked ? "toggle-primary" : ""}`}
        aria-pressed={checked}
        aria-label={label}
      >
        <input type="checkbox" checked={checked} readOnly className="sr-only" />
      </button>
    </div>
  );
}
