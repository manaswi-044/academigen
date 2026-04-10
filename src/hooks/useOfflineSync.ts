"use client";

import { useEffect, useState, useRef } from "react";
import { saveDocumentLocally, processSyncQueue, Document } from "@/lib/storage/indexedDB";

// Mock toast system since complex shadcn toasters might not be installed yet
const mockToast = (message: string) => {
  // In a real app we'd trigger a react-hot-toast or sonner component here
  console.log(`[Toast] ${message}`);
};

export function useOfflineSync(currentDocument: Document | null) {
  const [isOffline, setIsOffline] = useState(false);
  const docRef = useRef(currentDocument);

  // Keep ref updated
  useEffect(() => {
    docRef.current = currentDocument;
  }, [currentDocument]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOffline = () => {
      setIsOffline(true);
      mockToast("Offline mode active. Python execution works!");
    };

    const handleOnline = () => {
      setIsOffline(false);
      mockToast("Back online. Syncing your records...");
      processSyncQueue().catch(console.error);
    };

    // Initial state
    if (!navigator.onLine) {
      handleOffline();
    }

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  // Autosave interval
  useEffect(() => {
    const intervalId = setInterval(() => {
      const doc = docRef.current;
      if (doc && doc.id) {
        doc.updated_at = Date.now();
        saveDocumentLocally(doc).catch(console.error);
      }
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  return { isOffline };
}
