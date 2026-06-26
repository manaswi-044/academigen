export const runtime = 'nodejs';

import { createClient } from '@/lib/supabase/server';
import { createDocument, listDocuments } from '@/lib/supabase/queries';

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  const { documents, error, count } = await listDocuments(limit, offset);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ documents, total: count });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { title, subject, language, template_id, ex_number, experiment_date } = body;

  if (!title || !subject || !language) {
    return Response.json(
      { error: 'Missing required fields: title, subject, language' },
      { status: 400 }
    );
  }

  const { document, error } = await createDocument(user.id, {
    title,
    subject,
    language,
    template_id,
    ex_number,
    experiment_date,
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(document, { status: 201 });
}
