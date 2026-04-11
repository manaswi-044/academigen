import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

export interface GenerateRequest {
  programTitle: string;
  language: string;
  subject: string;
  aim?: string;
  algorithm?: string;
}

/**
 * Layer 1: Google Gemini 1.5 Flash — fastest and free tier available.
 * Returns a ReadableStream for Server-Sent Events.
 */
export async function generateWithGemini(
  params: GenerateRequest
): Promise<ReadableStream<Uint8Array>> {
  const prompt = buildPrompt(params);
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const response = await model.generateContentStream(prompt);

        for await (const chunk of response.stream) {
          const text = chunk.text();
          if (text) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
            );
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (err: any) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: err.message })}\n\n`)
        );
        controller.close();
      }
    },
  });

  return stream;
}

/**
 * Layer 2: Groq LLaMA3 — free fallback if Gemini is unavailable.
 */
export async function generateWithGroq(
  params: GenerateRequest
): Promise<ReadableStream<Uint8Array>> {
  const prompt = buildPrompt(params);
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const response = await fetch(
          "https://api.groq.com/openai/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            },
            body: JSON.stringify({
              model: "llama3-8b-8192",
              messages: [{ role: "user", content: prompt }],
              stream: true,
              max_tokens: 2000,
            }),
          }
        );

        if (!response.ok || !response.body) {
          throw new Error(`Groq responded with ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

          for (const line of lines) {
            const data = line.replace("data: ", "").trim();
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              const text = parsed.choices?.[0]?.delta?.content ?? "";
              if (text) {
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ text })}\n\n`
                  )
                );
              }
            } catch {}
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (err: any) {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: err.message })}\n\n`)
        );
        controller.close();
      }
    },
  });

  return stream;
}

/**
 * Layer 3: Static offline template — works with zero API keys.
 */
export async function generateOfflineTemplate(
  params: GenerateRequest
): Promise<ReadableStream<Uint8Array>> {
  const encoder = new TextEncoder();
  const template = buildOfflineTemplate(params);

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      // Stream the offline template in chunks to mimic real streaming
      const chunks = template.match(/.{1,40}/g) ?? [template];
      let i = 0;

      const tick = () => {
        if (i < chunks.length) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ text: chunks[i] })}\n\n`
            )
          );
          i++;
          setTimeout(tick, 20);
        } else {
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        }
      };

      tick();
    },
  });

  return stream;
}

// ─── Helpers ──────────────────────────────────────────────────────────

function buildPrompt(params: GenerateRequest): string {
  return `You are an academic lab record assistant. Generate a structured lab record in Markdown.

Program Title: ${params.programTitle}
Subject: ${params.subject}
Programming Language: ${params.language}
${params.aim ? `Aim: ${params.aim}` : ""}
${params.algorithm ? `Algorithm hint: ${params.algorithm}` : ""}

Generate the following sections only (no extra commentary):
1. **Aim** — One sentence goal.
2. **Algorithm** — Numbered steps, concise.
3. **Program** — Complete, working ${params.language} code inside a fenced code block.
4. **Output** — Example output clearly formatted.
5. **Result** — One sentence confirming success.

Keep the entire record under 400 words. Be direct and professional.`;
}

function buildOfflineTemplate(params: GenerateRequest): string {
  return `## Aim
To implement and execute **${params.programTitle}** using ${params.language}.

## Algorithm
1. Start the program.
2. Define necessary variables and data structures.
3. Implement the core logic for ${params.programTitle}.
4. Display the output.
5. Stop the program.

## Program
\`\`\`${params.language.toLowerCase()}
# ${params.programTitle}
# Replace this with the actual implementation

def main():
    print("${params.programTitle} - Output")

if __name__ == "__main__":
    main()
\`\`\`

## Output
\`\`\`
${params.programTitle} - Output
\`\`\`

## Result
The program for **${params.programTitle}** was successfully implemented using ${params.language}.`;
}