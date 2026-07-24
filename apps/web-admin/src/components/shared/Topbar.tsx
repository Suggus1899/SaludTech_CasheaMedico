"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Menu, Search, Sun, Moon, Bell, ChevronDown, User, Settings, HelpCircle, LogOut, AlertTriangle, X, CheckCircle2, Clock } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { NAV_ITEMS } from "../../lib/constants";
import { getApiUrl, apiFetch } from "../../lib/api";
import { OverdueInstallment } from "../../types/admin";


export function Topbar({
  sidebarOpen,
  setSidebarOpen,
}: {
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const tNav = useTranslations("Nav");
  const tCommon = useTranslations("Common");
  const [rawSearch, setSearch] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [overdueList, setOverdueList] = useState<OverdueInstallment[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);

  const adminUser = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("admin_user") ?? "null") : null;

  useEffect(() => {
    const saved = localStorage.getItem("theme") === "dark";
    setIsDarkMode(saved);
  }, []);

  const toggleDarkMode = useCallback(() => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    document.documentElement.setAttribute("data-theme", next ? "saludtech-dark" : "saludtech");
    localStorage.setItem("theme", next ? "dark" : "light");
  }, [isDarkMode]);

  const handleOpenNotifications = useCallback(async () => {
    setNotifOpen((v) => !v);
    if (!notifOpen && overdueList.length === 0) {
      setNotifLoading(true);
      try {
        const res = await apiFetch(getApiUrl("admin/installments/overdue"));
        if (res.ok) setOverdueList(await res.json());
      } finally {
        setNotifLoading(false);
      }
    }
  }, [notifOpen, overdueList.length]);

  const handleLogout = useCallback(() => {
    // JWT cookie is cleared by the backend logout endpoint.
    // Call it fire-and-forget; redirect immediately for UX.
    fetch(getApiUrl("auth/logout"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    }).catch(() => {});
    // Also clear the client-side cookie for Next.js middleware
    document.cookie = "jwt_token=; path=/; max-age=0";
    localStorage.removeItem("admin_user");
    router.push("/login");
  }, [router]);

  const activeItem = NAV_ITEMS.find(item => item.href === pathname || (item.href !== "/dashboard" && pathname.startsWith(item.href)));
  const title = activeItem ? tNav(activeItem.id) : tNav("dashboard");

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-3">
        <button className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors" onClick={() => setSidebarOpen(true)} aria-label={tNav("openMenu")}>
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold font-(family-name:--font-syne)">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input type="search" placeholder={tNav("search")} value={rawSearch} onChange={(e) => setSearch(e.target.value)} aria-label={tNav("searchPanel")} className="pl-9 pr-4 py-2 bg-muted rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary w-40 sm:w-52 transition-all" />
        </div>


        <button onClick={toggleDarkMode} aria-label={isDarkMode ? tNav("switchLight") : tNav("switchDark")} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button onClick={handleOpenNotifications} className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <Bell className="w-5 h-5" />
            {overdueList.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-destructive rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                {overdueList.length > 9 ? "9+" : overdueList.length}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-12 z-40 w-80 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <span className="font-semibold text-sm font-(family-name:--font-syne)">{tNav("overdueInstallments")}</span>
                <button onClick={() => setNotifOpen(false)} className="p-1 rounded hover:bg-muted">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifLoading ? (
                  <div className="flex items-center justify-center py-8 text-muted-foreground gap-2 text-sm">
                    <Clock className="w-4 h-4 animate-spin" /> {tCommon("loading")}
                  </div>
                ) : overdueList.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    {tNav("noOverdue")}
                  </div>
                ) : (
                  overdueList.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 px-4 py-3 border-b border-border/60 last:border-0 hover:bg-accent/40 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5">
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.user?.fullName ?? tNav("patient")}</p>
                        <p className="text-xs text-muted-foreground">{tNav("overdueInstallment")} · ${item.amount?.toFixed(2) ?? "—"}</p>
                      </div>
                      <span className="text-xs text-destructive font-medium whitespace-nowrap">
                        {item.dueDate ? new Date(item.dueDate).toLocaleDateString("es-VE") : "—"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="dropdown dropdown-end">
          <button tabIndex={0} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-content font-bold text-sm">
              {(adminUser?.firstName?.[0] ?? "A").toUpperCase()}
            </div>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>
          <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box shadow-lg border border-base-300 w-56 z-50 p-1 mt-1">
            <li className="menu-title px-3 py-1">
              <p className="text-sm font-semibold">{adminUser?.firstName ?? tNav("administrator")}</p>
              <p className="text-xs opacity-60">{adminUser?.email ?? "admin@saludtech.com"}</p>
            </li>
            <li><hr className="my-1 border-base-300" /></li>
            <li><button onClick={handleLogout} className="text-error"><LogOut className="w-4 h-4" /> {tNav("logout")}</button></li>
          </ul>
        </div>
      </div>
    </header>
  );
}
