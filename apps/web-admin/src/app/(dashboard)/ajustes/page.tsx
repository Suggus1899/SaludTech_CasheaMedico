"use client";

import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@saludtech/i18n";
import { Globe } from "lucide-react";

export default function SettingsPage() {
  const t = useTranslations("Settings");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-(family-name:--font-syne)">{t("title")}</h1>
        <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Globe className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">{t("language")}</h2>
            <p className="text-sm text-muted-foreground">{t("languageDescription")}</p>
          </div>
        </div>
        <div className="pl-13">
          <LanguageSwitcher className="inline-block" />
        </div>
      </div>
    </div>
  );
}
