import { createClient } from './client';
import { PostgrestError } from '@supabase/supabase-js';

export interface Document {
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

export interface DocumentVersion {
  id: string;
  document_id: string;
  content_json: Record<string, any>;
  named_tag: string | null;
  created_at: string;
}

export interface Template {
  id: string;
  name: string;
  subject: string | null;
  file_url: string | null;
  parsed_structure: Record<string, any> | null;
  is_default: boolean;
  created_at: string;
}

// ─────────────────────────────────────────────────────────────────
// DOCUMENTS (Main CRUD)
// ─────────────────────────────────────────────────────────────────

/**
 * Create a new document for the user
 */
export async function createDocument(
  userId: string,
  data: {
    title: string;
    subject: string;
    language: string;
    template_id?: string;
    ex_number?: number;
    experiment_date?: string;
  }
): Promise<{ document: Document; error: PostgrestError | null }> {
  const supabase = await createClient();

  const { data: document, error } = await supabase
    .from('documents')
    .insert([
      {
        user_id: userId,
        title: data.title,
        subject: data.subject,
        language: data.language,
        template_id: data.template_id || null,
        ex_number: data.ex_number || null,
        experiment_date: data.experiment_date || null,
        content_json: {},
        status: 'draft',
      },
    ])
    .select()
    .single();

  return { document: document as Document, error };
}

/**
 * Get a single document by ID (with RLS check)
 */
export async function getDocument(
  documentId: string
): Promise<{ document: Document | null; error: PostgrestError | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', documentId)
    .single();

  return { document: data as Document, error };
}

/**
 * List all documents for the current user
 */
export async function listDocuments(
  limit = 50,
  offset = 0
): Promise<{ documents: Document[]; error: PostgrestError | null; count: number }> {
  const supabase = await createClient();

  const { data, error, count } = await supabase
    .from('documents')
    .select('*', { count: 'exact' })
    .order('updated_at', { ascending: false })
    .range(offset, offset + limit - 1);

  return { documents: data as Document[], error, count: count || 0 };
}

/**
 * Update document content and metadata
 */
export async function updateDocument(
  documentId: string,
  updates: Partial<{
    title: string;
    subject: string;
    language: string;
    content_json: Record<string, any>;
    status: 'draft' | 'submitted' | 'graded';
    template_id: string | null;
    experiment_date: string | null;
  }>
): Promise<{ document: Document | null; error: PostgrestError | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('documents')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', documentId)
    .select()
    .single();

  return { document: data as Document, error };
}

/**
 * Delete a document
 */
export async function deleteDocument(documentId: string): Promise<{ error: PostgrestError | null }> {
  const supabase = await createClient();

  const { error } = await supabase.from('documents').delete().eq('id', documentId);

  return { error };
}

// ─────────────────────────────────────────────────────────────────
// DOCUMENT VERSIONS
// ─────────────────────────────────────────────────────────────────

/**
 * Create a version snapshot of a document
 */
export async function createVersion(
  documentId: string,
  contentJson: Record<string, any>,
  namedTag?: string
): Promise<{ version: DocumentVersion | null; error: PostgrestError | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('document_versions')
    .insert([
      {
        document_id: documentId,
        content_json: contentJson,
        named_tag: namedTag || null,
      },
    ])
    .select()
    .single();

  return { version: data as DocumentVersion, error };
}

/**
 * Get all versions of a document
 */
export async function getVersions(
  documentId: string,
  limit = 20
): Promise<{ versions: DocumentVersion[]; error: PostgrestError | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('document_versions')
    .select('*')
    .eq('document_id', documentId)
    .order('created_at', { ascending: false })
    .limit(limit);

  return { versions: data as DocumentVersion[], error };
}

/**
 * Restore a document to a specific version
 */
export async function restoreVersion(
  documentId: string,
  versionId: string
): Promise<{ document: Document | null; error: PostgrestError | null }> {
  const supabase = await createClient();

  // Get the version content
  const { data: version, error: versionError } = await supabase
    .from('document_versions')
    .select('content_json')
    .eq('id', versionId)
    .single();

  if (versionError || !version) return { document: null, error: versionError };

  // Update document with version content
  const { data, error } = await supabase
    .from('documents')
    .update({
      content_json: version.content_json,
      updated_at: new Date().toISOString(),
    })
    .eq('id', documentId)
    .select()
    .single();

  return { document: data as Document, error };
}

// ─────────────────────────────────────────────────────────────────
// TEMPLATES
// ─────────────────────────────────────────────────────────────────

/**
 * Get default templates for a subject
 */
export async function getTemplates(
  subject?: string
): Promise<{ templates: Template[]; error: PostgrestError | null }> {
  const supabase = await createClient();

  let query = supabase.from('templates').select('*').eq('is_default', true);

  if (subject) {
    query = query.eq('subject', subject);
  }

  const { data, error } = await query;

  return { templates: data as Template[], error };
}

/**
 * Get a single template
 */
export async function getTemplate(
  templateId: string
): Promise<{ template: Template | null; error: PostgrestError | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('id', templateId)
    .single();

  return { template: data as Template, error };
}

/**
 * Create a custom template from uploaded file
 */
export async function createTemplate(
  data: {
    name: string;
    subject?: string;
    file_url: string;
    parsed_structure?: Record<string, any>;
  }
): Promise<{ template: Template | null; error: PostgrestError | null }> {
  const supabase = await createClient();

  const { data: template, error } = await supabase
    .from('templates')
    .insert([
      {
        name: data.name,
        subject: data.subject || null,
        file_url: data.file_url,
        parsed_structure: data.parsed_structure || null,
        is_default: false,
      },
    ])
    .select()
    .single();

  return { template: template as Template, error };
}
