"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { locales, localeLabels, localeFlags, type Locale } from "./config";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function changeLocale(newLocale: Locale) {
    document.cookie = `locale=${newLocale};path=/;max-age=31536000;samesite=lax`;
    setOpen(false);
    router.refresh();
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1 text-sm rounded-lg hover:bg-base-200 transition-colors"
        aria-label="Change language"
      >
        <span className="text-lg">{localeFlags[locale]}</span>
        <span className="hidden sm:inline">{localeLabels[locale]}</span>
      </button>
      {open && (
        <ul className="absolute right-0 mt-1 z-50 menu bg-base-100 rounded-lg shadow-lg border border-base-300 min-w-[140px]">
          {locales.map((l) => (
            <li key={l}>
              <button
                type="button"
                onClick={() => changeLocale(l)}
                className={`flex items-center gap-2 px-3 py-2 text-sm w-full text-left rounded-lg ${
                  l === locale ? "bg-primary text-primary-content" : "hover:bg-base-200"
                }`}
              >
                <span className="text-lg">{localeFlags[l]}</span>
                <span>{localeLabels[l]}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
