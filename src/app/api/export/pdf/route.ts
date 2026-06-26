export const runtime = 'nodejs';

import { createClient } from '@/lib/supabase/server';
import { getDocument } from '@/lib/supabase/queries';

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { documentId } = body;

  if (!documentId) {
    return Response.json({ error: 'Missing documentId' }, { status: 400 });
  }

  // Verify document ownership
  const { document, error: docError } = await getDocument(documentId);

  if (docError || !document) {
    return Response.json({ error: 'Document not found' }, { status: 404 });
  }

  if (document.user_id !== user.id) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    // Extract content from document
    const content = document.content_json || {};
    const { title, subject, language, aim, algorithm, code, output, result } = content;

    // Call Python FastAPI service
    const response = await fetch(`${PYTHON_SERVICE_URL}/export/pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: title || document.title,
        subject: subject || document.subject,
        language: language || document.language,
        author: user.user_metadata?.full_name || 'Student',
        aim: aim || '',
        algorithm: algorithm || '',
        code: code || '',
        output: output || '',
        result: result || '',
      }),
    });

    if (!response.ok) {
      throw new Error(`PDF service responded with ${response.status}`);
    }

    const { pdf_bytes } = await response.json();

    if (!pdf_bytes) {
      throw new Error('No PDF generated');
    }

    // Convert hex string back to buffer
    const pdfBuffer = Buffer.from(pdf_bytes, 'hex');

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${document.title}.pdf"`,
      },
    });
  } catch (err: any) {
    console.error('[PDF Export Error]', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
