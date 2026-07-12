"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Award, LogOut, Mail, Phone, CreditCard, Shield, GraduationCap, RotateCcw } from "lucide-react";
import { clearSession, getStoredUser } from "../../../lib/api";
import { profileGradient } from "../../../lib/creditLineStyles";
import { useTour, tours } from "../../../lib/tours";
import type { UserResponse } from "../../../types/patient";

const levelThresholds: Record<number, number> = {
  1: 50,
  2: 150,
  3: 300,
  4: 600,
  5: 1000,
};

export default function PerfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserResponse | null>(null);
  const { startTour, hasSeenTour, resetTours } = useTour();

  useEffect(() => {
    setUser(getStoredUser<UserResponse>());
  }, []);

  const handleLogout = () => {
    clearSession();
    router.push("/login");
  };

  const level = user?.level ?? 1;
  const points = user?.points ?? 0;
  const nextLevelPoints = levelThresholds[level] ?? levelThresholds[5];
  const progress = Math.min((points / nextLevelPoints) * 100, 100);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-foreground">
        Mi Perfil
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Level card */}
        <div className="lg:col-span-1">
          {/* Level card */}
          <div
            className="p-6 rounded-3xl text-white text-center"
        style={{
          background: `linear-gradient(135deg, ${profileGradient.from}, ${profileGradient.to})`,
          boxShadow: `0 10px 20px ${profileGradient.shadow}`,
        }}
      >
        <div className="p-4 rounded-full bg-white/15 inline-block">
          <Award className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-bold mt-4 font-display">
          Nivel {level}
        </h2>
        <p className="text-sm text-white/90 mt-1">
          Puntos actuales: {points} pts
        </p>

        {/* Progress to next level */}
        <div className="mt-5">
          <div className="flex justify-between text-xs text-white/80 mb-1.5">
            <span>Progreso al nivel {level + 1}</span>
            <span>
              {points}/{nextLevelPoints} pts
            </span>
          </div>
          <div className="h-2 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full rounded-full bg-white/80 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        </div>
        </div>

        {/* Right: Personal data + tutorials */}
        <div className="lg:col-span-2 space-y-6">
      {/* User info */}
      <div className="p-5 rounded-2xl border border-border bg-base-100 space-y-3">
        <h3 className="text-base font-bold text-foreground font-display">
          Datos Personales
        </h3>

        <InfoRow
          icon={<Mail className="w-4 h-4" />}
          label="Correo"
          value={user?.email ?? "—"}
        />
        <InfoRow
          icon={<Phone className="w-4 h-4" />}
          label="Teléfono"
          value={user?.phone ?? "—"}
        />
        <InfoRow
          icon={<CreditCard className="w-4 h-4" />}
          label="Cédula"
          value={user?.identityDocument ?? "—"}
        />
        <InfoRow
          icon={<Shield className="w-4 h-4" />}
          label="KYC"
          value={user?.kycStatus ?? "—"}
        />
      </div>

      {/* Tutorials */}
      <div className="p-5 rounded-2xl border border-border bg-base-100 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            Tutoriales
          </h3>
          <button
            onClick={resetTours}
            className="btn btn-ghost btn-xs gap-1 text-muted-foreground"
            aria-label="Reiniciar tutoriales"
          >
            <RotateCcw className="w-3 h-3" />
            Reiniciar
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          Aprende a usar cada sección con un tour guiado paso a paso.
        </p>
        <div className="space-y-2">
          {tours.map((tour) => {
            const seen = hasSeenTour(tour.id);
            return (
              <button
                key={tour.id}
                onClick={() => {
                  if (tour.startRoute) {
                    router.push(tour.startRoute);
                  }
                  // Small delay to allow navigation before starting tour
                  setTimeout(() => startTour(tour.id), 500);
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all text-left"
              >
                <div className="flex items-center gap-2.5">
                  <GraduationCap className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm font-medium text-foreground">
                    {tour.name}
                  </span>
                </div>
                {seen && (
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                    Visto
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="btn btn-error btn-outline w-full gap-2"
      >
        <LogOut className="w-4 h-4" />
        Cerrar Sesión
      </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-border last:border-0">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-sm text-muted-foreground flex-1">{label}</span>
      <span className="text-sm font-semibold text-foreground font-display">
        {value}
      </span>
    </div>
  );
}
