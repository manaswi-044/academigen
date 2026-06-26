export const runtime = 'nodejs';

import { createClient } from '@/lib/supabase/server';
import { getDocument, restoreVersion } from '@/lib/supabase/queries';

export async function POST(
  request: Request,
  { params }: { params: { id: string; versionId: string } }
) {
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

  const { document: restored, error } = await restoreVersion(params.id, params.versionId);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(restored);
}
