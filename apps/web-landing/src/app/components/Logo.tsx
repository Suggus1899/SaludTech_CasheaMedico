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
  sm: { img: "h-7 w-7", icon: "w-7 h-7", text: "text-base" },
  md: { img: "h-9 w-9", icon: "w-9 h-9", text: "text-lg" },
  lg: { img: "h-12 w-12", icon: "w-12 h-12", text: "text-2xl" },
};

export default function Logo({ variant = "full", className = "", light = false, size = "md" }: LogoProps) {
  const [imgError, setImgError] = useState(false);
  const s = sizes[size];
  const textColor = light ? "text-white" : "text-[#0A2535]";
  const accentColor = light ? "text-[#1FC8A5]" : "text-[#1A6B8A]";

  if (!imgError) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <img
          src="/logostc.svg"
          alt="SaludTech"
          className={`${s.img} w-auto object-contain`}
          onError={() => setImgError(true)}
        />
        {variant === "full" && (
          <span className={`font-display font-bold ${s.text} ${textColor}`}>
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
        style={{ background: "linear-gradient(135deg, #1A6B8A, #17A589)" }}
      >
        {/* Caduceus cross */}
        <svg viewBox="0 0 24 24" fill="none" className="w-4/6 h-4/6">
          <rect x="10" y="3" width="4" height="18" rx="1.5" fill="white" opacity="0.9"/>
          <rect x="3" y="10" width="18" height="4" rx="1.5" fill="white" opacity="0.9"/>
          <path d="M8 7 Q12 4 16 7 Q12 10 8 13 Q12 16 16 17" stroke="white" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.5"/>
        </svg>
      </div>
      {variant === "full" && (
        <span className={`font-display font-bold ${s.text} ${textColor}`}>
          Salud<span className={accentColor}>Tech</span>
        </span>
      )}
    </div>
  );
}
