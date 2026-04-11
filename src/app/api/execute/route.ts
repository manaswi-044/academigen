export const runtime = 'nodejs'

import { executeLimiter } from '@/lib/ratelimit'
import { createClient } from '@/lib/supabase/server'
import { executeWithPiston } from '@/lib/execute/piston'

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

  if (!code || !language) {
    return Response.json({ error: 'code and language are required' }, { status: 400 })
  }

  // Python runs client-side via Pyodide — no server needed
  if (language === 'Python') {
    return Response.json({
      note: 'Python executes directly in your browser via Pyodide. No server call needed.',
      stdout: '',
      stderr: '',
      exitCode: 0,
      language: 'Python'
    })
  }

  try {
    const result = await executeWithPiston(code, language)
    return Response.json(result)
  } catch (err: any) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
