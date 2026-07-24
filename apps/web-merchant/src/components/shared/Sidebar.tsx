"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Clock, QrCode, Wallet, Shield, Stethoscope, Package } from "lucide-react";
import { Sidebar as SharedSidebar } from "@saludtech/ui";
import { useCallback, useEffect, useState } from "react";
import { getApiUrl } from "../../lib/api";

export function Sidebar() {
  const router = useRouter();
  const t = useTranslations("Nav");
  const [merchantUser, setMerchantUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setMerchantUser(JSON.parse(localStorage.getItem("merchant_user") ?? "null"));
    }
  }, []);

  const handleLogout = useCallback(() => {
    fetch(getApiUrl("auth/logout"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    }).catch(() => {});
    document.cookie = "jwt_token=; path=/; max-age=0";
    localStorage.removeItem("merchant_user");
    router.push("/login");
  }, [router]);

  const navItems = [
    { href: "/checkout", icon: Clock, label: t("authorizations") },
    { href: "/dashboard", icon: QrCode, label: t("generateQr") },
    { href: "/servicios", icon: Stethoscope, label: t("services") },
    { href: "/insumos", icon: Package, label: t("supplies") },
    { href: "/liquidaciones", icon: Wallet, label: t("settlements") },
    { href: "/historial", icon: Clock, label: t("history") },
    { href: "/suscripciones-ec", icon: Shield, label: t("elderCare") },
  ];

  const user = {
    href: "/perfil",
    avatar: (
      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
        <Stethoscope className="w-4 h-4 text-primary-foreground" />
      </div>
    ),
    name: merchantUser?.firstName ?? t("merchant"),
    subtitle: `ID: ${merchantUser?.id?.slice(0, 8) ?? "M-992"}`,
  };

  return (
    <SharedSidebar
      navItems={navItems}
      navAriaLabel={t("navAriaLabel")}
      user={user}
      onLogout={handleLogout}
      logoutLabel={t("logout")}
    />
  );
}
