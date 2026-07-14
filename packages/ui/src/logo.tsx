"use client";

import { useState } from "react";

interface LogoProps {
  variant?: "full" | "icon";
  className?: string;
  /** Force light text (for dark backgrounds) */
  light?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: { img: "h-7 w-auto", icon: "w-7 h-7", text: "text-base" },
  md: { img: "h-9 w-auto", icon: "w-9 h-9", text: "text-lg" },
  lg: { img: "h-12 w-auto", icon: "w-12 h-12", text: "text-2xl" },
};

export function Logo({ variant = "full", className = "", light = false, size = "md" }: LogoProps) {
  const [imgError, setImgError] = useState(false);
  const s = sizes[size];
  const textColor = light ? "text-white" : "text-[#0f172a]";
  const accentColor = light ? "text-[#3b82f6]" : "text-[#2563eb]";

  if (!imgError) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <img
          src="/logostc.png"
          alt="SaludTech"
          className={`${s.img} w-auto object-contain`}
          onError={() => setImgError(true)}
        />
        {variant === "full" && (
          <span className={`font-bold ${s.text} ${textColor}`}>
            Salud<span className={accentColor}>Tech</span>
          </span>
        )}
      </div>
    );
  }

  // Fallback: SVG inline wordmark
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`${s.icon} rounded-xl flex items-center justify-center shrink-0`}
        style={{ background: "linear-gradient(135deg, #2563eb, #3b82f6)" }}
      >
        {/* Caduceus cross */}
        <svg viewBox="0 0 24 24" fill="none" className="w-4/6 h-4/6">
          <rect x="10" y="3" width="4" height="18" rx="1.5" fill="white" opacity="0.9" />
          <rect x="3" y="10" width="18" height="4" rx="1.5" fill="white" opacity="0.9" />
          <path
            d="M8 7 Q12 4 16 7 Q12 10 8 13 Q12 16 16 17"
            stroke="white"
            strokeWidth="1"
            strokeLinecap="round"
            fill="none"
            opacity="0.5"
          />
        </svg>
      </div>
      {variant === "full" && (
        <span className={`font-bold ${s.text} ${textColor}`}>
          Salud<span className={accentColor}>Tech</span>
        </span>
      )}
    </div>
  );
}
