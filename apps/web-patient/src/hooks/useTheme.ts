"use client";

import { useState, useEffect, useCallback } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "theme";
const DARK_THEME = "saludtech-dark";
const LIGHT_THEME = "saludtech";

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  const attr = theme === "dark" ? DARK_THEME : LIGHT_THEME;
  document.documentElement.setAttribute("data-theme", attr);
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => getStoredTheme());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    applyTheme(theme);
    setMounted(true);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    applyTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage may be unavailable
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  return { theme, toggleTheme, setTheme, mounted };
}
