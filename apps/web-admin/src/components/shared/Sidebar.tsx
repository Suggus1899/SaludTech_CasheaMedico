"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Sidebar as SharedSidebar } from "@saludtech/ui";
import { NAV_ITEMS } from "../../lib/constants";

export function Sidebar({
  onLogout,
}: {
  onLogout: () => void;
}) {
  const pathname = usePathname();
  const tNav = useTranslations("Nav");

  const adminUser = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("admin_user") ?? "null") : null;

  const navItems = NAV_ITEMS.map((item) => ({
    href: item.href,
    icon: item.icon,
    label: tNav(item.id),
  }));

  const user = {
    href: "/ajustes",
    avatar: (
      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-content font-bold text-xs shrink-0">
        {(adminUser?.firstName?.[0] ?? "A").toUpperCase()}
      </div>
    ),
    name: adminUser?.firstName ?? tNav("administrator"),
    subtitle: tNav("settings"),
  };

  const isActive = (href: string, current: string) =>
    current === href || (href !== "/dashboard" && current.startsWith(href));

  return (
    <SharedSidebar
      navItems={navItems}
      navAriaLabel={tNav("mainNav")}
      user={user}
      onLogout={onLogout}
      logoutLabel={tNav("logout")}
      isActive={isActive}
    />
  );
}
