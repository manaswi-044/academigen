"use client";

import { useEffect, useState } from "react";

export function useAdaptiveUI() {
  const [canHandlePremiumUI, setCanHandlePremiumUI] = useState(false);

  useEffect(() => {
    // Detect if device can handle heavy glassmorphism blur effects
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const hardwareConcurrency = navigator.hardwareConcurrency ?? 2;

    // We consider hardware threads > 4 and no reduced motion as high-end enough for glassmorphism
    if (!prefersReducedMotion && hardwareConcurrency > 4) {
      setCanHandlePremiumUI(true);
    }
  }, []);

  return { canHandlePremiumUI };
}
