import { NextResponse } from "next/server";
import Groq from "groq-sdk";

/**
 * The eligibility flow itself is a fixed question tree (see
 * src/lib/chatFlow.ts) that runs entirely in the browser, no network call
 * per question, so there's nothing left to be slow or to hallucinate bad
 * options. This route does exactly one thing: once recommendations are
 * already computed deterministically, best-effort ask a small, fast Groq
 * model to phrase a warmer one-sentence closing line. If every model
 * below is slow, rate-limited, or unavailable, the caller already has a
 * perfectly good templated fallback ready, so this always degrades
 * silently rather than surfacing an error.
 *
 * Tried in order, first one that returns wins. Different models draw from
 * separate rate-limit pools on Groq, so if one is exhausted the next can
 * still go through, this is a real backstop, not just a style choice.
 */
const MODEL_FALLBACK_CHAIN = ["openai/gpt-oss-20b", "qwen/qwen3.8-27b", "openai/gpt-oss-120b"];

export async function POST(request: Request) {
  const { name, schemeNames } = (await request.json()) as { name?: string; schemeNames?: string[] };

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ message: null });
  }

  const groq = new Groq({ apiKey });
  const userContent = `Name: ${name}. Likely-fit programs: ${
    schemeNames && schemeNames.length ? schemeNames.join(", ") : "none found yet"
  }.`;

  for (const model of MODEL_FALLBACK_CHAIN) {
    try {
      const completion = await groq.chat.completions.create(
        {
          model,
          messages: [
            {
              role: "system",
              content:
                "Write exactly one short, warm, plain sentence, at most 25 words, closing an eligibility chat about Karnataka startup schemes. No em dashes, no markdown, no quotation marks, just the sentence itself.",
            },
            { role: "user", content: userContent },
          ],
          temperature: 0.5,
          max_tokens: 60,
        },
        { timeout: 2500 }
      );

      const text = completion.choices[0]?.message?.content?.trim();
      if (text) return NextResponse.json({ message: text });
    } catch (err) {
      console.error(`[chat] closing-message model ${model} failed, trying next:`, err);
    }
  }

  return NextResponse.json({ message: null });
}
