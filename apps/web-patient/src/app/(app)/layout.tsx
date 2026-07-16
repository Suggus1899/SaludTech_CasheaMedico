"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  QrCode,
  CalendarDays,
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
import { useTranslations } from "next-intl";
import type { UserResponse } from "../../types/patient";

const navSections = [
  {
    titleKey: "principal",
    items: [
      { href: "/dashboard", labelKey: "dashboard", icon: Home },
      { href: "/pagar", labelKey: "pagar", icon: QrCode },
      { href: "/cuotas", labelKey: "cuotas", icon: CalendarDays },
    ],
  },
  {
    titleKey: "comprar",
    items: [
      { href: "/comercios", labelKey: "comercios", icon: Store },
      { href: "/catalogo", labelKey: "catalogo", icon: Search },
      { href: "/suscripciones", labelKey: "suscripciones", icon: Pill },
    ],
  },
  {
    titleKey: "miSalud",
    items: [
      { href: "/triaje", labelKey: "triaje", icon: Stethoscope },
      { href: "/cuidado-mayor", labelKey: "cuidadoMayor", icon: Shield },
      { href: "/salud", labelKey: "salud", icon: Heart },
      { href: "/historial", labelKey: "historial", icon: FileText },
      { href: "/citas", labelKey: "citas", icon: CalendarPlus },
      { href: "/recordatorios", labelKey: "recordatorios", icon: Bell },
      { href: "/familia", labelKey: "familia", icon: Users },
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
  const t = useTranslations("Nav");
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
              <div key={section.titleKey}>
                <p className="px-3 mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                  {t(section.titleKey)}
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
                        {t(item.labelKey)}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* User info + logout */}
          <div className="border-t border-border p-3 space-y-2">
            <Link
              href="/perfil"
              className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                pathname === "/perfil" || pathname.startsWith("/perfil/")
                  ? "bg-primary text-primary-content"
                  : "hover:bg-base-200"
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                {user?.firstName?.[0]?.toUpperCase() ?? "?"}
              </div>
              <p className="flex-1 min-w-0 text-sm font-semibold truncate">
                {user?.firstName ?? "—"}
              </p>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-error hover:bg-error/10 transition-colors"
            >
              <LogOut className="w-4.5 h-4.5" />
              {t("logout")}
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
                  aria-label={t("closeMenu")}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Nav items */}
              <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
                {navSections.map((section) => (
                  <div key={section.titleKey}>
                    <p className="px-3 mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                      {t(section.titleKey)}
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
                            {t(item.labelKey)}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>

              {/* User info + logout */}
              <div className="border-t border-border p-3 space-y-2">
                <Link
                  href="/perfil"
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-colors ${
                    pathname === "/perfil" || pathname.startsWith("/perfil/")
                      ? "bg-primary text-primary-content"
                      : "hover:bg-base-200"
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                    {user?.firstName?.[0]?.toUpperCase() ?? "?"}
                  </div>
                  <p className="flex-1 min-w-0 text-sm font-semibold truncate">
                    {user?.firstName ?? "—"}
                  </p>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-error hover:bg-error/10 transition-colors"
                >
                  <LogOut className="w-4.5 h-4.5" />
                  {t("logout")}
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
              aria-label={t("openMenu")}
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Page title */}
            <h1 className="text-base font-bold text-foreground font-display">
              {currentPage ? t(currentPage.labelKey) : "SaludTech"}
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
