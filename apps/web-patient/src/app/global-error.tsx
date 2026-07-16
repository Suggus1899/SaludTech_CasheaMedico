"use client";

import { AlertCircle, RotateCcw } from "lucide-react";
import { NextIntlClientProvider, useTranslations } from "next-intl";
import { defaultLocale, locales, type Locale } from "@saludtech/i18n";
import esMessages from "../i18n/messages/es.json";
import enMessages from "../i18n/messages/en.json";
import frMessages from "../i18n/messages/fr.json";
import itMessages from "../i18n/messages/it.json";

const messageMap: Record<Locale, Record<string, unknown>> = {
  es: esMessages,
  en: enMessages,
  fr: frMessages,
  it: itMessages,
};

function getCookieLocale(): Locale {
  if (typeof document === "undefined") return defaultLocale;
  const match = document.cookie.match(/(?:^|;\s*)locale=([^;]+)/);
  const val = match?.[1] as Locale | undefined;
  return val && locales.includes(val) ? val : defaultLocale;
}

function ErrorContent({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("GlobalError");
  const tCommon = useTranslations("Common");

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-foreground">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {error.message || t("defaultMessage")}
          </p>
        </div>
        <button
          onClick={reset}
          className="btn btn-primary gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          {tCommon("retry")}
        </button>
      </div>
    </div>
  );
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = getCookieLocale();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messageMap[locale]}>
          <ErrorContent error={error} reset={reset} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
