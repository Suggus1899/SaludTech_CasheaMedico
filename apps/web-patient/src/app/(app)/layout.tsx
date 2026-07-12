"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, QrCode, CalendarDays, User } from "lucide-react";
import { clearSession, getStoredUser } from "../../lib/api";
import { TourProvider, TourOverlay } from "../../lib/tours";
import type { UserResponse } from "../../types/patient";

const navItems = [
  { href: "/dashboard", label: "Inicio", icon: Home },
  { href: "/pagar", label: "Comprar", icon: QrCode },
  { href: "/cuotas", label: "Cuotas", icon: CalendarDays },
  { href: "/perfil", label: "Perfil", icon: User },
];

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserResponse | null>(null);

  useEffect(() => {
    setUser(getStoredUser<UserResponse>());
  }, []);

  const handleLogout = () => {
    clearSession();
    router.push("/login");
  };

  return (
    <TourProvider>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-base-100/80 backdrop-blur border-b border-border">
          <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-base font-bold text-foreground">
                Hola, {user?.firstName ?? "—"} 👋
              </span>
              <span className="text-xs text-muted-foreground">Bienvenido de vuelta</span>
            </div>
            <button
              onClick={handleLogout}
              aria-label="Cerrar sesión"
              className="btn btn-ghost btn-sm"
            >
              Salir
            </button>
          </div>
        </header>

        {/* Main content */}
        <main id="main-content" className="flex-1 max-w-md mx-auto w-full px-4 py-5 pb-24">
          {children}
        </main>

        {/* Bottom navigation */}
        <nav
          data-tour="bottom-nav"
          className="fixed bottom-0 inset-x-0 z-20 bg-base-100 border-t border-border"
          aria-label="Navegación principal"
        >
          <div className="max-w-md mx-auto grid grid-cols-4 h-16">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[11px] font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Guided tour overlay */}
        <TourOverlay />
      </div>
    </TourProvider>
  );
}
