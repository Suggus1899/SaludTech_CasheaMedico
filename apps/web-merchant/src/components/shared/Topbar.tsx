"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, ArrowLeft, CheckCircle2, Sun, Moon, ChevronDown, User, Settings } from "lucide-react";

const VIEW_TITLES: Record<string, string> = {
  "/dashboard": "Generar Cobro BNPL",
  "/liquidaciones": "Liquidaciones",
  "/historial": "Historial de Transacciones",
  "/suscripciones-ec": "Elder Care — Mis Suscripciones",
};

export function Topbar({ setSidebarOpen }: { setSidebarOpen: (v: boolean) => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [merchantUser, setMerchantUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme") === "dark";
      setIsDarkMode(saved);
      document.documentElement.setAttribute("data-theme", saved ? "saludtech-dark" : "saludtech");
      setMerchantUser(JSON.parse(localStorage.getItem("merchant_user") ?? "null"));
    }
  }, []);

  const toggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    document.documentElement.setAttribute("data-theme", next ? "saludtech-dark" : "saludtech");
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-3">
        <button className="md:hidden p-2 rounded-lg hover:bg-muted" onClick={() => setSidebarOpen(true)} aria-label="Abrir menú">
          <Menu className="w-5 h-5" />
        </button>
        {pathname === "/historial" && (
          <button onClick={() => router.push("/dashboard")} aria-label="Volver" className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <h1 className="text-lg font-semibold font-(family-name:--font-syne)">{VIEW_TITLES[pathname] || "Dashboard"}</h1>
      </div>
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
          Sistema Operativo
        </div>
        <button onClick={toggleDarkMode} aria-label={isDarkMode ? "Modo claro" : "Modo oscuro"} className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        <div className="dropdown dropdown-end">
          <button tabIndex={0} aria-label="Menú de usuario" className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-muted transition-colors">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-content font-bold text-sm">
              {(merchantUser?.firstName?.[0] ?? "C").toUpperCase()}
            </div>
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </button>
          <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box shadow-lg border border-base-300 w-52 z-50 p-1 mt-1">
            <li className="menu-title px-3 py-1">
              <p className="text-sm font-semibold">{merchantUser?.firstName ?? "Comercio"}</p>
              <p className="text-xs opacity-60">{merchantUser?.email ?? ""}</p>
            </li>
            <li><hr className="my-1 border-base-300" /></li>
            <li>
              <button className="flex items-center gap-2">
                <User className="w-4 h-4" /> Mi Perfil
              </button>
            </li>
            <li>
              <button className="flex items-center gap-2">
                <Settings className="w-4 h-4" /> Configuración
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
