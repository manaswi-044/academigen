export const runtime = 'nodejs'

import { aiLimiter } from '@/lib/ratelimit'
import { createClient } from '@/lib/supabase/server'
import {
  generateWithClaude,
  generateWithGroq,
  generateOfflineTemplate,
  type GenerateRequest
} from '@/lib/ai/generate'

export async function POST(request: Request) {
  // 1. Auth guard
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Rate limit
  const { success } = await aiLimiter.limit(user.id)
  if (!success) {
    return Response.json(
      { error: 'Limit reached. Try again in 1 hour.' },
      { status: 429 }
    )
  }

  // 3. Parse body
  const body = await request.json() as GenerateRequest

  // 4. 3-Layer fallback: Claude → Groq → Offline Template
  let stream: ReadableStream<Uint8Array>

  try {
    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'YOUR_KEY_HERE') {
      throw new Error('Claude key not configured')
    }
    stream = await generateWithClaude(body)
    console.log('[AI] Using Claude Haiku')
  } catch (claudeErr) {
    console.warn('[AI] Claude failed, trying Groq:', claudeErr)
    try {
      if (!process.env.GROQ_API_KEY || process.env.GROQ_API_KEY === 'YOUR_KEY_HERE') {
        throw new Error('Groq key not configured')
      }
      stream = await generateWithGroq(body)
      console.log('[AI] Using Groq LLaMA3')
    } catch (groqErr) {
      console.warn('[AI] Groq failed, using offline template:', groqErr)
      stream = await generateOfflineTemplate(body)
      console.log('[AI] Using Offline Template')
    }
  }

  // 5. Stream back to client (SSE)
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    }
  })
}
