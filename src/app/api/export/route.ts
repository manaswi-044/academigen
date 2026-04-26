export const runtime = 'nodejs'

import { exportLimiter } from '@/lib/ratelimit'
import { createClient } from '@/lib/supabase/server'
import { uploadFile } from '@/lib/storage/r2'

export async function POST(request: Request) {
  // 1. Auth guard
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Rate limit
  if (exportLimiter) {
    const { success } = await exportLimiter.limit(user.id)
    if (!success) {
      return Response.json(
        { error: 'Limit reached. Try again in 1 hour.' },
        { status: 429 }
      )
    }
  }

  // 3. Parse body
  const body = await request.json()
  const { documentId, content } = body

  if (!documentId || !content) {
    return Response.json({ error: 'Missing documentId or content' }, { status: 400 })
  }

  try {
    const renderUrl = process.env.RENDER_FASTAPI_URL || 'http://localhost:8000'
    
    // 4. Send to FastAPI microservice for PDF generation
    const response = await fetch(`${renderUrl}/export/pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content)
    })

    if (!response.ok) {
      throw new Error(`FastAPI responded with ${response.status}`)
    }

    const { pdf_bytes } = await response.json()
    const pdfBuffer = Buffer.from(pdf_bytes, 'hex')

    // 5. Upload to Cloudflare R2
    const timestamp = Date.now()
    const key = `exports/${user.id}/${documentId}/${timestamp}.pdf`
    
    const publicUrl = await uploadFile(pdfBuffer, key, 'application/pdf')

    return Response.json({
      success: true,
      url: publicUrl
    })

  } catch (err: any) {
    console.error('[Export Error]', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}