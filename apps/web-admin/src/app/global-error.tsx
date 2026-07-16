"use client";

import { useTranslations } from "next-intl";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Errors");
  return (
    <html lang="es">
      <body>
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-bold text-foreground">
                {t("criticalError")}
              </h1>
              <p className="text-sm text-muted-foreground">
                {error.message || t("appLoadError")}
              </p>
            </div>
            <button
              onClick={reset}
              className="btn btn-primary gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              {t("retry")}
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
