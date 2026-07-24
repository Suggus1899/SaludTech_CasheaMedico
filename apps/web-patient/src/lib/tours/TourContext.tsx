"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";

export interface TourStep {
  /** CSS selector for the target element to highlight */
  selector: string;
  /** Title shown in the tooltip */
  title: string;
  /** Body text shown in the tooltip */
  body: string;
  /** Optional side: "top" | "bottom" | "left" | "right" (default: "bottom") */
  side?: "top" | "bottom" | "left" | "right";
}

export interface TourDefinition {
  id: string;
  name: string;
  /** Route where this tour starts (e.g. "/dashboard") */
  startRoute?: string;
  steps: TourStep[];
}

interface TourContextValue {
  /** Currently active tour id, or null */
  activeTourId: string | null;
  /** Current step index (0-based) */
  currentStep: number;
  /** Whether the tour overlay is visible */
  isTourActive: boolean;
  /** Start a tour by id */
  startTour: (tourId: string) => void;
  /** Go to next step */
  nextStep: () => void;
  /** Go to previous step */
  prevStep: () => void;
  /** End the tour and mark it as seen */
  endTour: () => void;
  /** Skip the tour and mark it as seen */
  skipTour: () => void;
  /** Whether a tour has been completed before (from localStorage) */
  hasSeenTour: (tourId: string) => boolean;
  /** Reset tour history so they can be shown again */
  resetTours: () => void;
}

const TourContext = createContext<TourContextValue | null>(null);

const STORAGE_KEY = "saludtech-tours-seen";

function getSeenTours(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveSeenTours(seen: Record<string, boolean>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seen));
  } catch {
    /* ignore */
  }
}

export function TourProvider({ children }: { children: ReactNode }) {
  const [activeTourId, setActiveTourId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [seenTours, setSeenTours] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setSeenTours(getSeenTours());
  }, []);

  const isTourActive = activeTourId !== null;

  const startTour = useCallback((tourId: string) => {
    setActiveTourId(tourId);
    setCurrentStep(0);
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep((prev) => prev + 1);
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  }, []);

  const endTour = useCallback(() => {
    if (activeTourId) {
      const updated = { ...seenTours, [activeTourId]: true };
      setSeenTours(updated);
      saveSeenTours(updated);
    }
    setActiveTourId(null);
    setCurrentStep(0);
  }, [activeTourId, seenTours]);

  const skipTour = useCallback(() => {
    if (activeTourId) {
      const updated = { ...seenTours, [activeTourId]: true };
      setSeenTours(updated);
      saveSeenTours(updated);
    }
    setActiveTourId(null);
    setCurrentStep(0);
  }, [activeTourId, seenTours]);

  const hasSeenTour = useCallback(
    (tourId: string) => !!seenTours[tourId],
    [seenTours]
  );

  const resetTours = useCallback(() => {
    setSeenTours({});
    saveSeenTours({});
  }, []);

  const value: TourContextValue = {
    activeTourId,
    currentStep,
    isTourActive,
    startTour,
    nextStep,
    prevStep,
    endTour,
    skipTour,
    hasSeenTour,
    resetTours,
  };

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useTour() {
  const ctx = useContext(TourContext);
  if (!ctx) {
    throw new Error("useTour must be used within a TourProvider");
  }
  return ctx;
}
