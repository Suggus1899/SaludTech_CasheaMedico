"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { LogOut } from "lucide-react";
import { Logo } from "@saludtech/ui";
import { NAV_ITEMS } from "../../lib/constants";

export function Sidebar({
  onLogout,
}: {
  onLogout: () => void;
}) {
  const pathname = usePathname();
  const tNav = useTranslations("Nav");

  const adminUser = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("admin_user") ?? "null") : null;

  return (
    <>
      <div className="p-6 flex-1">
        <div className="mb-10">
          <Logo size="md" />
        </div>
        <nav className="space-y-1" aria-label={tNav("mainNav")}>
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.id}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  active
                    ? "bg-primary/10 text-primary border-l-2 border-primary pl-[10px]"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {tNav(item.id)}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-border space-y-1">
        <Link
          href="/ajustes"
          aria-current={pathname === "/ajustes" ? "page" : undefined}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
            pathname === "/ajustes"
              ? "bg-primary/10 text-primary"
              : "hover:bg-muted"
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-content font-bold text-xs shrink-0">
            {(adminUser?.firstName?.[0] ?? "A").toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{adminUser?.firstName ?? tNav("administrator")}</p>
            <p className="text-xs text-muted-foreground truncate">{tNav("settings")}</p>
          </div>
        </Link>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut className="w-4 h-4" /> {tNav("logout")}
        </button>
      </div>
    </>
  );
}
