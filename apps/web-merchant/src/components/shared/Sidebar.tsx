"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Clock, QrCode, Wallet, Shield, Stethoscope, LogOut, Package, Store } from "lucide-react";
import { Logo } from "@saludtech/ui";
import { useCallback, useEffect, useState } from "react";
import { getApiUrl } from "../../lib/api";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [merchantUser, setMerchantUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setMerchantUser(JSON.parse(localStorage.getItem("merchant_user") ?? "null"));
    }
  }, []);

  const handleLogout = useCallback(() => {
    // JWT cookie is cleared by the backend logout endpoint.
    fetch(getApiUrl("auth/logout"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    }).catch(() => {});
    localStorage.removeItem("merchant_user");
    router.push("/login");
  }, [router]);

  const navItems = [
    { href: "/checkout", icon: Clock, label: "Autorizaciones (Caja)" },
    { href: "/dashboard", icon: QrCode, label: "Generar QR" },
    { href: "/servicios", icon: Stethoscope, label: "Servicios" },
    { href: "/insumos", icon: Package, label: "Insumos" },
    { href: "/liquidaciones", icon: Wallet, label: "Liquidaciones" },
    { href: "/historial", icon: Clock, label: "Historial de Transacciones" },
    { href: "/suscripciones-ec", icon: Shield, label: "Elder Care" },
    { href: "/perfil", icon: Store, label: "Mi Perfil" },
  ];

  return (
    <>
      <div className="p-6 flex-1">
        <div className="mb-10">
          <Logo size="md" />
        </div>
        <nav className="space-y-1" aria-label="Navegación del portal">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-primary/10 text-primary border-l-2 border-primary pl-[10px]"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" /> {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Stethoscope className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-none">{merchantUser?.firstName ?? "Comercio"}</p>
            <p className="text-xs text-muted-foreground mt-0.5">ID: {merchantUser?.id?.slice(0, 8) ?? "M-992"}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut className="w-4 h-4" /> Cerrar Sesión
        </button>
      </div>
    </>
  );
}
