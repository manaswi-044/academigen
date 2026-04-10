"use client";

import { useEffect, useState, ReactNode } from "react";
import { useAdaptiveUI } from "@/hooks/useAdaptiveUI";

export default function AdaptiveUIWrapper({ children }: { children: ReactNode }) {
  const { canHandlePremiumUI } = useAdaptiveUI();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!canHandlePremiumUI) {
      document.body.classList.add("no-glass");
    } else {
      document.body.classList.remove("no-glass");
    }
  }, [canHandlePremiumUI]);

  return (
    <div className={`min-h-screen transition-opacity duration-300 ${!mounted ? "opacity-0" : "opacity-100"}`}>
      {children}
    </div>
  );
}
