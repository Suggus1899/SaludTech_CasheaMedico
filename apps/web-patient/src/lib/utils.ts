import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function daysUntil(iso: string): number {
  const due = new Date(iso).getTime();
  const now = Date.now();
  return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
}

/** Decode base64 in both browser and Node/SSR environments */
function decodeBase64(input: string): string {
  if (typeof atob === "function") return atob(input);
  return Buffer.from(input, "base64").toString("utf-8");
}

/** Parse the HMAC QR payload: merchantId:amount:nonce:timestamp|signature */
export function parseQrPayload(payloadBase64: string): {
  merchantId: string;
  amount: number;
  nonce: string;
  timestamp: string;
  signature: string;
} | null {
  try {
    const decoded = decodeBase64(payloadBase64);
    const parts = decoded.split("|");
    if (parts.length !== 2) return null;
    const dataParts = parts[0].split(":");
    if (dataParts.length !== 4) return null;
    return {
      merchantId: dataParts[0],
      amount: Number.parseFloat(dataParts[1]),
      nonce: dataParts[2],
      timestamp: dataParts[3],
      signature: parts[1],
    };
  } catch {
    return null;
  }
}
