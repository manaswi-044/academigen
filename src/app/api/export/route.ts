export const runtime = 'nodejs'

import { exportLimiter } from '@/lib/ratelimit'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { success } = await exportLimiter.limit(user.id)
  if (!success) {
    return Response.json(
      { error: 'Limit reached. Try again in 1 hour.' },
      { status: 429 }
    )
  }

  const { documentId } = await request.json()

  // Phase 3: PDF/DOCX generation + upload to R2
  return Response.json({
    status: 'ready',
    message: 'Export endpoint ready. PDF generation coming in Phase 3.',
    request_received: { documentId }
  })
}
