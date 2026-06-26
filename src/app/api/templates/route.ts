export const runtime = 'nodejs';

import { createClient } from '@/lib/supabase/server';
import { getTemplates } from '@/lib/supabase/queries';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const subject = url.searchParams.get('subject') || undefined;

  const { templates, error } = await getTemplates(subject);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ templates });
}
