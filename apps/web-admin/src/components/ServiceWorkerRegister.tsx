"use client";

import { useEffect, useState } from "react";
import { RefreshCw, X } from "lucide-react";
import { useTranslations } from "next-intl";

export default function ServiceWorkerRegister() {
  const t = useTranslations("ServiceWorker");
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const handleUpdate = (event: Event) => {
      const reg = event.target as ServiceWorkerRegistration;
      if (reg.waiting) {
        setWaitingWorker(reg.waiting);
        setUpdateAvailable(true);
      }
    };

    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        reg.addEventListener("updatefound", handleUpdate);
      })
      .catch(() => undefined);

    const onControllerChange = () => {
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  const applyUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
    }
  };

  if (!updateAvailable) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 z-50 max-w-md mx-auto">
      <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-base-100 shadow-lg border border-border">
        <div className="p-2 rounded-full bg-primary/10 text-primary shrink-0">
          <RefreshCw className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-bold text-foreground"
            style={{ fontFamily: "var(--font-inter, sans-serif)" }}
          >
            {t("newVersion")}
          </p>
          <p className="text-xs text-muted-foreground">{t("reloadToUpdate")}</p>
        </div>
        <button
          onClick={applyUpdate}
          className="btn btn-primary btn-sm"
        >
          {t("update")}
        </button>
        <button
          onClick={() => setUpdateAvailable(false)}
          aria-label={t("close")}
          className="btn btn-ghost btn-sm btn-square"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
