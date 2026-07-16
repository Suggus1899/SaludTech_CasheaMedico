"use client";

import { useTranslations } from "next-intl";
import { Download } from "lucide-react";

interface ExportButtonProps {
  endpoint: string;
  label: string;
}

export function ExportButton({ endpoint, label }: ExportButtonProps) {
  const tCommon = useTranslations("Common");
  const handleExport = () => {
    const url = getApiUrl(endpoint);
    window.open(url, "_blank");
  };

  return (
    <button
      onClick={handleExport}
      className="btn btn-sm btn-outline gap-2"
      title={tCommon("exportToCsv", { label })}
    >
      <Download className="w-4 h-4" />
      {tCommon("csv")}
    </button>
  );
}

function getApiUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost/api/v1";
  return `${base}/${path}`;
}
