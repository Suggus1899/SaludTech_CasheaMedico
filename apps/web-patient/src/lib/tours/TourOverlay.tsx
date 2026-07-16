"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTour } from "./TourContext";
import { getTourById } from "./tours";

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function TourOverlay() {
  const { activeTourId, currentStep, nextStep, prevStep, endTour, skipTour } =
    useTour();
  const t = useTranslations("Tours");
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const tour = activeTourId ? getTourById(activeTourId) : null;
  const step = tour?.steps[currentStep];
  const isLastStep = tour ? currentStep === tour.steps.length - 1 : false;

  const updatePosition = useCallback(() => {
    if (!step) return;
    const el = document.querySelector(step.selector) as HTMLElement | null;
    if (!el) {
      setTargetRect(null);
      setTooltipPos(null);
      return;
    }

    // Scroll element into view
    el.scrollIntoView({ behavior: "smooth", block: "center" });

    // Wait a tick for scroll to settle
    setTimeout(() => {
      const rect = el.getBoundingClientRect();
      const padding = 8;
      setTargetRect({
        top: rect.top - padding,
        left: rect.left - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      });

      // Position tooltip
      const tooltipEl = tooltipRef.current;
      const tooltipHeight = tooltipEl?.offsetHeight ?? 200;
      const tooltipWidth = tooltipEl?.offsetWidth ?? 280;
      const side = step.side ?? "bottom";
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let top: number;
      let left: number;

      switch (side) {
        case "top":
          top = rect.top - tooltipHeight - 16;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case "left":
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.left - tooltipWidth - 16;
          break;
        case "right":
          top = rect.top + rect.height / 2 - tooltipHeight / 2;
          left = rect.right + 16;
          break;
        case "bottom":
        default:
          top = rect.bottom + 16;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
      }

      // Clamp to viewport with margin
      const margin = 16;
      left = Math.max(margin, Math.min(left, viewportWidth - tooltipWidth - margin));
      top = Math.max(margin, Math.min(top, viewportHeight - tooltipHeight - margin));

      setTooltipPos({ top, left });
    }, 300);
  }, [step]);

  useEffect(() => {
    if (!activeTourId) return;
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [activeTourId, currentStep, updatePosition]);

  if (!tour || !step) return null;

  return (
    <>
      {/* Dark overlay with cutout */}
      {targetRect && (
        <div
          className="fixed inset-0 z-[100] pointer-events-none"
          style={{
            backgroundColor: "rgba(0,0,0,0.55)",
            boxShadow: `0 0 0 9999px rgba(0,0,0,0.55)`,
            borderRadius: "12px",
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
            transition: "all 0.3s ease",
          }}
        />
      )}

      {/* Full-page click catcher (non-highlighted areas) */}
      {targetRect && (
        <div
          className="fixed inset-0 z-[99]"
          style={{
            backgroundColor: "rgba(0,0,0,0.55)",
            clipPath: `polygon(0% 0%, 0% 100%, ${targetRect.left}px 100%, ${targetRect.left}px ${targetRect.top + targetRect.height}px, ${targetRect.left + targetRect.width}px ${targetRect.top + targetRect.height}px, ${targetRect.left + targetRect.width}px ${targetRect.top}px, ${targetRect.left}px ${targetRect.top}px, ${targetRect.left}px 100%, 100% 100%, 100% 0%)`,
            transition: "clip-path 0.3s ease",
          }}
          onClick={skipTour}
        />
      )}

      {/* Highlight ring around target */}
      {targetRect && (
        <div
          className="fixed z-[101] pointer-events-none rounded-xl ring-4 ring-primary ring-offset-2 ring-offset-transparent"
          style={{
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height,
            transition: "all 0.3s ease",
          }}
        />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-[102] w-[280px] bg-base-100 rounded-2xl shadow-2xl border border-border p-4"
        style={{
          top: tooltipPos?.top ?? -9999,
          left: tooltipPos?.left ?? -9999,
          opacity: tooltipPos ? 1 : 0,
          transition: "top 0.3s ease, left 0.3s ease, opacity 0.2s ease",
        }}
      >
        {/* Close button */}
        <button
          onClick={skipTour}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={t("closeTutorial")}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Step indicator */}
        <div className="flex items-center gap-1.5 mb-2">
          {tour.steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === currentStep
                  ? "w-6 bg-primary"
                  : i < currentStep
                    ? "w-1.5 bg-primary/60"
                    : "w-1.5 bg-muted"
              }`}
            />
          ))}
        </div>

        <h3 className="text-sm font-bold text-foreground mb-1.5 pr-6">
          {t(`${tour.id}.steps.${currentStep}.title`)}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed mb-4">
          {t(`${tour.id}.steps.${currentStep}.body`)}
        </p>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground font-medium">
            {currentStep + 1} / {tour.steps.length}
          </span>
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={prevStep}
                className="btn btn-ghost btn-xs gap-1"
                aria-label={t("prevStep")}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                {t("back")}
              </button>
            )}
            {isLastStep ? (
              <button
                onClick={endTour}
                className="btn btn-primary btn-xs gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                {t("done")}
              </button>
            ) : (
              <button
                onClick={nextStep}
                className="btn btn-primary btn-xs gap-1"
              >
                {t("next")}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Skip link */}
        {!isLastStep && (
          <button
            onClick={skipTour}
            className="absolute -bottom-7 right-0 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("skipTutorial")}
          </button>
        )}
      </div>
    </>
  );
}
