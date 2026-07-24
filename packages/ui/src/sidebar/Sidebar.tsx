"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { Logo } from "../logo";

export interface SidebarNavItem {
  href: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
}

export interface SidebarUser {
  href: string;
  avatar: ReactNode;
  name: string;
  subtitle: string;
}

export interface SidebarProps {
  navItems: SidebarNavItem[];
  navAriaLabel: string;
  user: SidebarUser;
  onLogout: () => void;
  logoutLabel: string;
  isActive?: (href: string, pathname: string) => boolean;
}

const defaultIsActive = (href: string, pathname: string) =>
  pathname === href || pathname.startsWith(href);

export function Sidebar({
  navItems,
  navAriaLabel,
  user,
  onLogout,
  logoutLabel,
  isActive = defaultIsActive,
}: SidebarProps) {
  const pathname = usePathname();
  const userActive = pathname === user.href;

  return (
    <>
      <div className="p-6 flex-1">
        <div className="mb-10">
          <Logo size="md" />
        </div>
        <nav className="space-y-1" aria-label={navAriaLabel}>
          {navItems.map((item) => {
            const active = isActive(item.href, pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  active
                    ? "bg-primary/10 text-primary border-l-2 border-primary pl-[10px]"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-border space-y-1">
        <Link
          href={user.href}
          aria-current={userActive ? "page" : undefined}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
            userActive ? "bg-primary/10 text-primary" : "hover:bg-muted"
          }`}
        >
          {user.avatar}
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.subtitle}</p>
          </div>
        </Link>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut className="w-4 h-4" /> {logoutLabel}
        </button>
      </div>
    </>
  );
}
