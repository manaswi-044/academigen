'use client';

import { useEffect, useState } from 'react';

interface Document {
  id: string;
  user_id: string;
  title: string;
  subject: string;
  language: string;
  ex_number: number | null;
  experiment_date: string | null;
  template_id: string | null;
  content_json: Record<string, any>;
  status: 'draft' | 'submitted' | 'graded';
  created_at: string;
  updated_at: string;
}

/**
 * Hook for fetching and managing user's documents
 */
export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async (limit = 50, offset = 0) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/documents?limit=${limit}&offset=${offset}`);

      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }

      const { documents } = await response.json();
      setDocuments(documents);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createDocument = async (data: {
    title: string;
    subject: string;
    language: string;
    template_id?: string;
  }) => {
    try {
      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create document');
      }

      const newDoc = await response.json();
      setDocuments([newDoc, ...documents]);
      return newDoc;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      setDocuments(documents.filter((d) => d.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return {
    documents,
    loading,
    error,
    fetchDocuments,
    createDocument,
    deleteDocument,
  };
}
