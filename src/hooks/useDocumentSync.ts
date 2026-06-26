'use client';

import { useCallback, useRef, useEffect } from 'react';

interface DocContent {
  id?: string;
  title: string;
  subject: string;
  language: string;
  content_json?: Record<string, any>;
  [key: string]: any;
}

/**
 * Hook for auto-syncing document changes to Supabase
 * Debounces saves to avoid excessive API calls
 */
export function useDocumentSync(documentId: string | null, debounceMs = 2000) {
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const lastSaved = useRef<string>('');

  const saveDocument = useCallback(
    async (content: DocContent) => {
      // Don't save if no documentId or content hasn't changed
      const contentStr = JSON.stringify(content);
      if (!documentId || contentStr === lastSaved.current) {
        return;
      }

      try {
        const response = await fetch(`/api/documents/${documentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(content),
        });

        if (response.ok) {
          lastSaved.current = contentStr;
          console.log('[Auto-Save] Document saved');
        }
      } catch (err) {
        console.error('[Auto-Save Error]', err);
      }
    },
    [documentId]
  );

  const debouncedSave = useCallback(
    (content: DocContent) => {
      // Clear existing timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      // Set new timer
      debounceTimer.current = setTimeout(() => {
        saveDocument(content);
      }, debounceMs);
    },
    [saveDocument, debounceMs]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return { debouncedSave, saveDocument };
}
