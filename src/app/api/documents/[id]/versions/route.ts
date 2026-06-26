export const runtime = 'nodejs';

import { createClient } from '@/lib/supabase/server';
import { getDocument, createVersion, getVersions } from '@/lib/supabase/queries';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify document ownership
  const { document, error: docError } = await getDocument(params.id);

  if (docError || !document) {
    return Response.json({ error: 'Document not found' }, { status: 404 });
  }

  if (document.user_id !== user.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit') || '20');

  const { versions, error } = await getVersions(params.id, limit);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ versions });
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify document ownership
  const { document, error: docError } = await getDocument(params.id);

  if (docError || !document) {
    return Response.json({ error: 'Document not found' }, { status: 404 });
  }

  if (document.user_id !== user.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { named_tag } = body;

  const { version, error } = await createVersion(params.id, document.content_json, named_tag);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(version, { status: 201 });
}
