'use client';

import { useCallback, useState } from 'react';

interface GeneratedRecord {
  aim: string;
  algorithm: string;
  code: string;
  source?: string;
}

/**
 * Free AI generation hook
 * Uses Groq free tier or offline templates (no payment required)
 */
export function useAIGenerationFree() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateRecord = useCallback(
    async (
      programTitle: string,
      language: string,
      subject: string,
      additionalContext?: string
    ): Promise<GeneratedRecord | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/ai/generate-record-free', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            programTitle,
            language,
            subject,
            additionalContext,
          }),
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'Generation failed');
        }

        const data = await response.json();
        return data;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMsg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const explainCode = useCallback(
    async (code: string, language: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/ai/explain-code-free', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, language }),
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || 'Explanation failed');
        }

        const data = await response.json();
        return data;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMsg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    generateRecord,
    explainCode,
    loading,
    error,
  };
}
