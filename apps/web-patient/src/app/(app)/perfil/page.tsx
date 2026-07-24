"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Award, LogOut, Mail, Phone, CreditCard, Shield, GraduationCap, RotateCcw, Settings, User, Camera, DollarSign, Activity } from "lucide-react";
import { clearSession, getStoredUser, getApiUrl, apiFetch } from "../../../lib/api";
import { profileGradient } from "../../../lib/creditLineStyles";
import { useTour, tours } from "../../../lib/tours";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("Profile");
  const tTours = useTranslations("Tours");
  const [user, setUser] = useState<UserResponse | null>(null);
  const { startTour, hasSeenTour, resetTours } = useTour();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoMessage, setPhotoMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    // Fetch fresh data from /auth/me, fall back to localStorage
    (async () => {
      try {
        const res = await apiFetch(getApiUrl("auth/me"));
        if (res.ok) {
          const data = (await res.json()) as UserResponse;
          setUser(data);
          return;
        }
      } catch {
        // ignore network errors
      }
      setUser(getStoredUser<UserResponse>());
    })();
  }, []);

  const handleLogout = async () => {
    await clearSession();
    router.push("/login");
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setPhotoMessage({ type: "error", text: t("photoInvalidFormat") });
      e.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setPhotoMessage({ type: "error", text: t("photoTooLarge") });
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setPhotoUploading(true);
      setPhotoMessage(null);
      try {
        const res = await apiFetch(getApiUrl("users/profile-photo"), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profilePhotoUrl: dataUrl }),
        });
        if (res.ok) {
          setUser((prev) => (prev ? { ...prev, profilePhotoUrl: dataUrl } : prev));
          setPhotoMessage({ type: "success", text: t("photoUpdated") });
        } else {
          setPhotoMessage({ type: "error", text: t("photoError") });
        }
      } catch {
        setPhotoMessage({ type: "error", text: t("photoError") });
      } finally {
        setPhotoUploading(false);
        e.target.value = "";
      }
    };
    reader.readAsDataURL(file);
  };

  const level = user?.level ?? 1;
  const points = user?.points ?? 0;
  const nextLevelPoints = levelThresholds[level] ?? levelThresholds[5];
  const progress = Math.min((points / nextLevelPoints) * 100, 100);
  const fullName = user?.fullName ?? `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();
  const isActive = user?.isActive ?? user?.active ?? false;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-foreground">
        {t("title")}
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
          {t("level", { level })}
        </h2>
        <p className="text-sm text-white/90 mt-1">
          {t("currentPoints", { points })}
        </p>

        {/* Progress to next level */}
        <div className="mt-5">
          <div className="flex justify-between text-xs text-white/80 mb-1.5">
            <span>{t("progressToNext", { level: level + 1 })}</span>
            <span>
              {t("progressPoints", { points, total: nextLevelPoints })}
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
          {t("personalData")}
        </h3>

        {/* Profile photo */}
        <div className="flex flex-col items-center gap-2 pb-2">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-2xl overflow-hidden">
              {user?.profilePhotoUrl ? (
                <img
                  src={user.profilePhotoUrl}
                  alt={fullName || ""}
                  className="w-full h-full object-cover"
                />
              ) : (
                (user?.firstName?.[0]?.toUpperCase() ?? "?")
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={photoUploading}
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary text-primary-content flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors disabled:opacity-50"
              aria-label={t("changePhoto")}
            >
              {photoUploading ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <Camera className="w-4 h-4" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handlePhotoChange}
              className="hidden"
            />
          </div>
          {photoMessage && (
            <p
              className={`text-xs text-center ${
                photoMessage.type === "success" ? "text-success" : "text-error"
              }`}
            >
              {photoMessage.text}
            </p>
          )}
        </div>

        <InfoRow
          icon={<User className="w-4 h-4" />}
          label={t("fullName")}
          value={fullName || "—"}
        />
        <InfoRow
          icon={<Mail className="w-4 h-4" />}
          label={t("email")}
          value={user?.email || "—"}
        />
        <InfoRow
          icon={<Phone className="w-4 h-4" />}
          label={t("phone")}
          value={user?.phone || "—"}
        />
        <InfoRow
          icon={<CreditCard className="w-4 h-4" />}
          label={t("nationalId")}
          value={user?.identityDocument || "—"}
        />
        <InfoRow
          icon={<DollarSign className="w-4 h-4" />}
          label={t("totalPaid")}
          value={user?.totalPaid != null ? `$${user.totalPaid.toFixed(2)}` : "—"}
        />
        <InfoRow
          icon={<Activity className="w-4 h-4" />}
          label={t("status")}
          value={isActive ? t("statusActive") : t("statusInactive")}
        />
        <InfoRow
          icon={<Shield className="w-4 h-4" />}
          label={t("kyc")}
          value={user?.kycStatus || "—"}
        />
      </div>

      {/* Settings link */}
      <Link
        href="/perfil/configuracion"
        className="block p-4 rounded-2xl border border-border bg-base-100 hover:border-primary hover:bg-primary/5 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Settings className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-foreground">{t("settings")}</p>
            <p className="text-xs text-muted-foreground">{t("settingsDesc")}</p>
          </div>
          <span className="text-muted-foreground">›</span>
        </div>
      </Link>

      {/* Tutorials */}
      <div className="p-5 rounded-2xl border border-border bg-base-100 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground font-display flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            {t("tutorials")}
          </h3>
          <button
            onClick={resetTours}
            className="btn btn-ghost btn-xs gap-1 text-muted-foreground"
            aria-label={t("resetTutorials")}
          >
            <RotateCcw className="w-3 h-3" />
            {t("reset")}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          {t("tutorialsDesc")}
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
                    {tTours(tour.name as any)}
                  </span>
                </div>
                {seen && (
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                    {t("seen")}
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
        {t("logout")}
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
