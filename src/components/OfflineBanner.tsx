"use client";

import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateStatus = () => setIsOffline(!navigator.onLine);
    
    // Check initial status
    updateStatus();

    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="fixed top-0 left-0 w-full bg-yellow-400 text-black font-semibold text-center text-sm py-2 px-4 shadow-md z-50 flex items-center justify-center gap-2 animate-in slide-in-from-top duration-300">
      <AlertCircle className="w-4 h-4" />
      <span>Offline mode — Python execution still works</span>
    </div>
  );
}
