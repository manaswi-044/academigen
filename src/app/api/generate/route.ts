export const runtime = 'nodejs'

import { aiLimiter } from '@/lib/ratelimit'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  // 1. Get user session
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Check rate limit
  const { success, limit, remaining, reset } = await aiLimiter.limit(user.id)
  if (!success) {
    return Response.json(
      { error: 'Limit reached. Try again in 1 hour.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': String(remaining),
          'X-RateLimit-Reset': String(reset)
        }
      }
    )
  }

  // 3. Parse request body
  const { programTitle, language, subject } = await request.json()

  // 4. AI generation placeholder — Phase 3 will wire Claude here
  return Response.json({
    status: 'ready',
    message: 'AI generation endpoint ready. Claude integration coming in Phase 3.',
    request_received: { programTitle, language, subject }
  })
}
