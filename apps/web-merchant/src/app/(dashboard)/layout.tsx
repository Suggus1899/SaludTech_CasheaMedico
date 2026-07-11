"use client";

import { useState } from "react";
import { Sidebar } from "../../components/shared/Sidebar";
import { Topbar } from "../../components/shared/Topbar";
import { Logo } from "@saludtech/ui";
import { X } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm md:hidden" 
          onClick={() => setSidebarOpen(false)} 
          aria-hidden="true" 
        />
      )}

      {/* Sidebar — desktop */}
      <aside className="hidden md:flex md:flex-col w-60 border-r border-border bg-card shrink-0">
        <Sidebar />
      </aside>

      {/* Sidebar — mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transform transition-transform duration-300 md:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Menú lateral"
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Logo size="sm" />
          <button onClick={() => setSidebarOpen(false)} aria-label="Cerrar menú" className="p-2 rounded-lg hover:bg-muted">
            <X className="w-5 h-5" />
          </button>
        </div>
        <Sidebar />
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-base-200/50">
          {children}
        </main>
      </div>
    </div>
  );
}
