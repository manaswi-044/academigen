export const runtime = 'nodejs';

import { createClient } from '@/lib/supabase/server';
import { createDocument, updateDocument } from '@/lib/supabase/queries';

/**
 * Sync localStorage data to Supabase on login
 * Called from onboarding or dashboard after authentication
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { documents } = body; // Array of document objects from localStorage

    if (!Array.isArray(documents)) {
      return Response.json({ error: 'Invalid documents format' }, { status: 400 });
    }

    const syncedDocs = [];

    for (const doc of documents) {
      const { title, subject, language, content_json, template_id } = doc;

      if (!title || !subject || !language) {
        continue;
      }

      // Create document in Supabase
      const { document: created, error } = await createDocument(user.id, {
        title,
        subject,
        language,
        template_id,
      });

      if (!error && created) {
        // Update with content
        await updateDocument(created.id, { content_json: content_json || {} });
        syncedDocs.push(created);
      }
    }

    return Response.json({
      synced: syncedDocs.length,
      documents: syncedDocs,
    });
  } catch (err: any) {
    console.error('[Sync Error]', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
