"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  QrCode,
  CalendarDays,
  User,
  Store,
  Search,
  Pill,
  Shield,
  Stethoscope,
  LogOut,
  Menu,
  X,
  Heart,
  FileText,
  CalendarPlus,
  Bell,
  Users,
} from "lucide-react";
import { clearSession, getStoredUser } from "../../lib/api";
import { TourProvider, TourOverlay } from "../../lib/tours";
import type { UserResponse } from "../../types/patient";

const navSections = [
  {
    title: "Principal",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: Home },
      { href: "/pagar", label: "Pagar", icon: QrCode },
      { href: "/cuotas", label: "Cuotas", icon: CalendarDays },
    ],
  },
  {
    title: "Comprar",
    items: [
      { href: "/comercios", label: "Comercios", icon: Store },
      { href: "/catalogo", label: "Catálogo", icon: Search },
      { href: "/suscripciones", label: "Suscripciones", icon: Pill },
    ],
  },
  {
    title: "Mi Salud",
    items: [
      { href: "/triaje", label: "Triaje", icon: Stethoscope },
      { href: "/cuidado-mayor", label: "Cuidado Mayor", icon: Shield },
      { href: "/salud", label: "Perfil de Salud", icon: Heart },
      { href: "/historial", label: "Historial", icon: FileText },
      { href: "/citas", label: "Citas", icon: CalendarPlus },
      { href: "/recordatorios", label: "Recordatorios", icon: Bell },
      { href: "/familia", label: "Familia", icon: Users },
    ],
  },
  {
    title: "Cuenta",
    items: [
      { href: "/perfil", label: "Perfil", icon: User },
    ],
  },
];

const allNavItems = navSections.flatMap((s) => s.items);

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setUser(getStoredUser<UserResponse>());
  }, []);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await clearSession();
    router.push("/login");
  };

  const currentPage = allNavItems.find((n) => pathname.startsWith(n.href));

  return (
    <TourProvider>
      <div className="min-h-screen bg-background flex">
        {/* ─── Sidebar (desktop) ───────────────────────────────────── */}
        <aside
          data-tour="bottom-nav"
          className="hidden lg:flex flex-col w-60 shrink-0 border-r border-border bg-base-100 h-screen sticky top-0"
        >
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-border">
            <span className="text-lg font-bold text-primary font-display">
              SaludTech
            </span>
          </div>

          {/* Nav items */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
            {navSections.map((section) => (
              <div key={section.title}>
                <p className="px-3 mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                  {section.title}
                </p>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-current={isActive ? "page" : undefined}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-primary text-primary-content"
                            : "text-muted-foreground hover:bg-base-200 hover:text-foreground"
                        }`}
                      >
                        <Icon className="w-4.5 h-4.5 shrink-0" />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* User info + logout */}
          <div className="border-t border-border p-3 space-y-2">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                {user?.firstName?.[0]?.toUpperCase() ?? "?"}
              </div>
              <p className="flex-1 min-w-0 text-sm font-semibold text-foreground truncate">
                {user?.firstName ?? "—"}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-error hover:bg-error/10 transition-colors"
            >
              <LogOut className="w-4.5 h-4.5" />
              Cerrar Sesión
            </button>
          </div>
        </aside>

        {/* ─── Mobile sidebar drawer ──────────────────────────────── */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setSidebarOpen(false)}
            />
            {/* Drawer */}
            <aside className="relative w-64 h-full bg-base-100 border-r border-border flex flex-col animate-in slide-in-from-left">
              {/* Close button */}
              <div className="h-16 flex items-center justify-between px-4 border-b border-border">
                <span className="text-lg font-bold text-primary font-display">
                  SaludTech
                </span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="btn btn-ghost btn-sm btn-square"
                  aria-label="Cerrar menú"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Nav items */}
              <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
                {navSections.map((section) => (
                  <div key={section.title}>
                    <p className="px-3 mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                      {section.title}
                    </p>
                    <div className="space-y-1">
                      {section.items.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            aria-current={isActive ? "page" : undefined}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                              isActive
                                ? "bg-primary text-primary-content"
                                : "text-muted-foreground hover:bg-base-200 hover:text-foreground"
                            }`}
                          >
                            <Icon className="w-4.5 h-4.5 shrink-0" />
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>

              {/* User info + logout */}
              <div className="border-t border-border p-3 space-y-2">
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    {user?.firstName?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <p className="flex-1 min-w-0 text-sm font-semibold text-foreground truncate">
                    {user?.firstName ?? "—"}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-error hover:bg-error/10 transition-colors"
                >
                  <LogOut className="w-4.5 h-4.5" />
                  Cerrar Sesión
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* ─── Main content area ──────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top bar */}
          <header className="sticky top-0 z-30 bg-base-100/80 backdrop-blur border-b border-border h-16 flex items-center px-4 lg:px-8">
            {/* Hamburger (mobile) */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden btn btn-ghost btn-sm btn-square mr-2"
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Page title */}
            <h1 className="text-base font-bold text-foreground font-display">
              {currentPage?.label ?? "SaludTech"}
            </h1>

            {/* Spacer */}
            <div className="flex-1" />

            {/* User avatar (mobile — desktop has it in sidebar) */}
            <div className="lg:hidden flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-xs">
                {user?.firstName?.[0]?.toUpperCase() ?? "?"}
              </div>
            </div>
          </header>

          {/* Content */}
          <main
            id="main-content"
            className="flex-1 overflow-y-auto p-4 lg:p-8"
          >
            <div className="max-w-6xl mx-auto w-full pb-20 lg:pb-0">
              {children}
            </div>
          </main>
        </div>

        {/* Guided tour overlay */}
        <TourOverlay />
      </div>
    </TourProvider>
  );
}
