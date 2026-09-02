import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { SCHEMES } from "@/lib/schemes";

export const ELIGIBILITY_REDIRECT_MESSAGE =
  "I can't tell you that directly — click 'Understand Me' above and answer a few quick questions to get your real answer.";

// Deterministic guard: eligibility verdicts must always come from the rules
// engine, never from the model's own judgment. Matching on intent keywords
// here is more reliable than a system-prompt instruction the model could
// drift from.
const ELIGIBILITY_INTENT = /\b(am i eligible|eligib|do i qualify|qualify|which scheme|what scheme|right (for|scheme) me|best (for|scheme) me|suit(s|able) (for )?me)\b/i;

const SCHEME_CONTEXT = SCHEMES.map(
  (s) => `- ${s.name}: ${s.tagline}${s.unverifiedNote ? ` (Note: ${s.unverifiedNote})` : ""}`
).join("\n");

const SYSTEM_PROMPT = `You are the help assistant embedded in Scheme Finder, an independent (non-official) tool that helps Karnataka student entrepreneurs with a working prototype discover which government schemes apply to them.

You may ONLY use the information below to answer. Do not use outside knowledge about schemes, funding amounts, or eligibility beyond what is listed here.

What this product does:
- Shows all schemes as browsable cards, open to everyone.
- Has an "Understand Me" flow (Google sign-in + a short question set) that filters schemes down to what a specific user actually qualifies for, with a one-line reason per match.
- Every scheme links out to its real, official government page — this product does not process applications itself.
- This is an independent discovery tool, not an official government platform.

Scheme list you may explain (name and short description only — do not invent funding figures or eligibility rules beyond this):
${SCHEME_CONTEXT}

Rules:
- Never tell a user they are or are not eligible for anything, and never guess which scheme fits them personally.
- You may explain terms (e.g. "what is DPIIT recognition"), describe what a scheme is for, or explain how this product works.
- Keep answers short and in plain language — assume the reader may be new to startup terminology.`;

export async function POST(request: Request) {
  const { message } = await request.json();

  if (typeof message !== "string" || !message.trim()) {
    return NextResponse.json({ error: "message is required" }, { status: 400 });
  }

  if (ELIGIBILITY_INTENT.test(message)) {
    return NextResponse.json({ reply: ELIGIBILITY_REDIRECT_MESSAGE, redirected: true });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { reply: "Chat isn't configured yet — set GROQ_API_KEY to enable it.", redirected: false },
      { status: 200 }
    );
  }

  const groq = new Groq({ apiKey });
  const completion = await groq.chat.completions.create({
    model: "openai/gpt-oss-20b",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: message },
    ],
    temperature: 0.2,
    max_tokens: 300,
  });

  const reply =
    completion.choices[0]?.message?.content?.trim() ??
    "Sorry, I couldn't generate a reply just now.";

  return NextResponse.json({ reply, redirected: false });
}
