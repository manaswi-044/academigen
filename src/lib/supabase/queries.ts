import { createClient } from './server'

// --- TYPES ---
export interface Document {
  id: string
  user_id: string
  title: string
  subject?: string
  language?: string
  ex_number?: number
  experiment_date?: string
  content_json: any
  status: string
  updated_at: string
}

export interface CodeExecution {
  document_id: string
  code_snippet: string
  language: string
  output_text: string
  screenshot_url?: string
}

// --- QUERIES ---

/**
 * Creates a new document in the database
 */
export async function createDocument(data: {
  title: string
  subject: string
  language: string
  ex_number: number
  experiment_date: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error("Unauthorized")

  const { data: doc, error } = await supabase
    .from('documents')
    .insert({
      ...data,
      user_id: user.id,
      content_json: {},
      status: 'draft'
    })
    .select()
    .single()

  if (error) throw error
  return doc as Document
}

/**
 * Updates the content of an existing document
 */
export async function updateDocument(id: string, updates: Partial<Document>) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('documents')
    .update(updates)
    .eq('id', id)

  if (error) throw error
}

/**
 * Fetches all documents for the current authenticated user
 */
export async function getDocuments() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data as Document[]
}

/**
 * Saves a document version and enforces the 5-version limit
 */
export async function saveVersion(
  document_id: string,
  content_json: any,
  named_tag?: string
) {
  const supabase = await createClient()
  
  // 1. Insert the new version
  const { error: insertError } = await supabase
    .from('document_versions')
    .insert({
      document_id,
      content_json,
      named_tag
    })

  if (insertError) throw insertError

  // 2. Fetch all versions for this document, oldest first
  const { data: versions, error: fetchError } = await supabase
    .from('document_versions')
    .select('id')
    .eq('document_id', document_id)
    .order('created_at', { ascending: true })

  if (fetchError) throw fetchError

  // 3. If more than 5 versions, delete the oldest ones
  if (versions && versions.length > 5) {
    const idsToDelete = versions.slice(0, versions.length - 5).map(v => v.id)
    await supabase
      .from('document_versions')
      .delete()
      .in('id', idsToDelete)
  }
}

/**
 * Logs a code execution result
 */
export async function saveCodeExecution(data: CodeExecution) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('code_executions')
    .insert(data)

  if (error) throw error
}
