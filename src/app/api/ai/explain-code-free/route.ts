export const runtime = 'nodejs';

import { createClient } from '@/lib/supabase/server';

/**
 * Free code explanation using Groq (completely free)
 * Falls back to regex-based analysis if API unavailable
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { code, language } = body;

    if (!code || !language) {
      return Response.json(
        { error: 'Missing code or language' },
        { status: 400 }
      );
    }

    // Try Groq API first
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
      return await explainWithGroq(code, language);
    }

    // Fallback: Simple regex-based analysis (completely free)
    return explainOffline(code, language);
  } catch (err: any) {
    console.error('[Explain Error]', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}

async function explainWithGroq(code: string, language: string): Promise<Response> {
  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    return explainOffline(code, language);
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768',
        messages: [
          {
            role: 'user',
            content: `Explain this ${language} code in JSON format with keys: summary, line_by_line, concepts, complexity. Return ONLY valid JSON.\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\``,
          },
        ],
        max_tokens: 1500,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return Response.json(JSON.parse(jsonMatch[0]));
      }
    } catch {}
  } catch (err) {
    console.warn('Groq failed, using offline explanation', err);
  }

  return explainOffline(code, language);
}

function explainOffline(code: string, language: string): Response {
  const lines = code.split('\n').filter((l) => l.trim());
  const hasLoop = /for|while/i.test(code);
  const hasFunction = /function|def|public|private/i.test(code);
  const hasArray = /\[|array|list|vector/i.test(code);

  const lineByLine = lines
    .map((line, i) => `Line ${i + 1}: ${line.trim()}`)
    .join('\n');

  const concepts = [];
  if (hasFunction) concepts.push('Functions/Methods');
  if (hasLoop) concepts.push('Loops');
  if (hasArray) concepts.push('Arrays/Collections');
  if (/if|else/i.test(code)) concepts.push('Conditional statements');
  if (/^\s*class/m.test(code)) concepts.push('Object-oriented programming');

  return Response.json({
    summary: `This ${language} code contains ${lines.length} lines and uses ${concepts.join(', ') || 'basic logic'}`,
    line_by_line: lineByLine,
    concepts: concepts.join(', ') || 'Basic programming constructs',
    complexity: 'Time complexity depends on input size. See line-by-line explanation.',
    viva_questions: [
      `What does this code do?`,
      `Explain the logic of the main function`,
      `What is the purpose of the variables used?`,
      `How would you optimize this code?`,
      `What edge cases should be tested?`,
    ],
    answers: [
      `This code implements ${language} logic for a specific task`,
      `The main logic involves processing data through loops and conditions`,
      `Variables are used to store and manipulate data during execution`,
      `Optimization could involve better algorithms or data structures`,
      `Edge cases include empty inputs, negative numbers, and boundary conditions`,
    ],
    source: 'offline_analysis',
  });
}
