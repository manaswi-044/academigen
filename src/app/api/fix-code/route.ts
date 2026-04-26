export const runtime = 'nodejs'

import { aiLimiter } from '@/lib/ratelimit'
import { createClient } from '@/lib/supabase/server'
import Anthropic from "@anthropic-ai/sdk"

export async function POST(request: Request) {
  // 1. Auth guard
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Rate limit
  if (aiLimiter) {
    const { success } = await aiLimiter.limit(user.id)
    if (!success) {
      return Response.json(
        { error: 'Limit reached. Try again in 1 hour.' },
        { status: 429 }
      )
    }
  }

  // 3. Parse body
  const { code, error, language } = await request.json()

  if (!code || !error) {
    return Response.json({ error: 'Missing code or error context' }, { status: 400 })
  }

  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })

    const prompt = `You are an expert debugger. The following ${language} code threw an error during execution.
Fix the code and return ONLY the corrected code inside a Markdown code block. Do not provide any explanation or apologies.

CODE:
\`\`\`${language.toLowerCase()}
${code}
\`\`\`

ERROR:
${error}`

    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    })

    const responseText = response.content[0].type === 'text' ? response.content[0].text : ''
    
    // Extract the code from the response block
    const codeMatch = responseText.match(/```(?:\w+)?\n([\s\S]*?)```/)
    const fixedCode = codeMatch ? codeMatch[1].trim() : responseText.trim()

    return Response.json({
      success: true,
      fixedCode
    })

  } catch (err: any) {
    console.error('[Auto-Fix Error]', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}
