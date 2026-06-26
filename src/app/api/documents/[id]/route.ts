export const runtime = 'nodejs';

import { createClient } from '@/lib/supabase/server';
import { getDocument, updateDocument, deleteDocument } from '@/lib/supabase/queries';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { document, error } = await getDocument(params.id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  if (!document) {
    return Response.json({ error: 'Document not found' }, { status: 404 });
  }

  // Check ownership
  if (document.user_id !== user.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  return Response.json(document);
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify ownership first
  const { document: existingDoc, error: fetchError } = await getDocument(params.id);

  if (fetchError || !existingDoc) {
    return Response.json({ error: 'Document not found' }, { status: 404 });
  }

  if (existingDoc.user_id !== user.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { document, error } = await updateDocument(params.id, body);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(document);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify ownership
  const { document, error: fetchError } = await getDocument(params.id);

  if (fetchError || !document) {
    return Response.json({ error: 'Document not found' }, { status: 404 });
  }

  if (document.user_id !== user.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { error } = await deleteDocument(params.id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true }, { status: 204 });
}
