export const runtime = 'nodejs'

import { executeLimiter } from '@/lib/ratelimit'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { success } = await executeLimiter.limit(user.id)
  if (!success) {
    return Response.json(
      { error: 'Limit reached. Try again in 1 hour.' },
      { status: 429 }
    )
  }

  const { code, language } = await request.json()

  // Phase 3: Piston API for C/Java; Pyodide handles Python client-side
  return Response.json({
    status: 'ready',
    message: 'Execution endpoint ready. Piston API integration coming in Phase 3.',
    request_received: { language, code_length: code?.length }
  })
}
