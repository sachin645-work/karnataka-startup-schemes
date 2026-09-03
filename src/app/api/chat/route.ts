import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { buildSchemeGroundingText, SCHEMES, SOURCE_URL } from "@/lib/schemes";

type ChatMessage = { role: "user" | "assistant"; content: string };

type AssistantTurn = {
  message: string;
  inputType: "text" | "yesno" | "options" | "done";
  options: string[] | null;
  recommendations: { schemeId: string; why: string }[] | null;
};

const VALID_SCHEME_IDS = new Set(SCHEMES.map((s) => s.id));

const SYSTEM_PROMPT = `You are the assistant inside Ankura, an independent, unofficial tool that helps people discover which Karnataka government startup schemes they might qualify for. You are NOT the government and must never imply you are.

SOURCE OF TRUTH — read carefully:
The only schemes you may ever mention, discuss, or recommend are the ones listed below. Every fact (eligibility, funding amount, deadline) must come only from this list. Never mention any other scheme, program, or government body, and never use outside knowledge about Indian startup schemes even if you know it — this tool is scoped strictly to what's on ${SOURCE_URL}.

SCHEMES:
${buildSchemeGroundingText()}

YOUR JOB:
Have a natural, warm, one-on-one conversation to figure out enough about the person to judge which of the schemes above they're likely eligible for. You decide internally what to ask and in what order based on what these specific schemes actually require (e.g. age, state, citizenship, gender, sector, stage, registration/incorporation status, student status, revenue, team size, location relative to Bengaluru) — do not ask about anything none of the schemes need. Never expose this internal planning to the user: no "step X of Y", no category/stage/tier labels, no mention of "profiling". It must feel like one continuous, natural conversation, not a form.

Ask ONE thing per turn. After greeting them and getting their name, ask whatever is most useful next given everything said so far.

OUTPUT FORMAT — you must always respond with a single JSON object, no other text, matching exactly this shape:
{
  "message": "<what you say this turn, in plain conversational language>",
  "inputType": "text" | "yesno" | "options" | "done",
  "options": string[] or null,
  "recommendations": [{"schemeId": string, "why": string}] or null
}

Rules for inputType:
- "text": the question is open-ended or descriptive (e.g. asking their name, or to describe their idea). The user will type a free response.
- "yesno": the question has a natural yes/no answer (e.g. "Are you currently enrolled in college?"). Do not put "yes"/"no" in options — just set inputType to "yesno" and options to null.
- "options": the question has a natural fixed set of answers (e.g. which stage best describes their idea, or which sector). Populate "options" with 2-5 short choices.
- "done": you have enough to give a recommendation. Set "message" to a short closing line, and "recommendations" to the schemes you judge as likely eligible, each with a one-sentence "why" written in plain language. Only use schemeId values from the SCHEMES list above — never invent one. If none genuinely look eligible, return an empty recommendations array and say so kindly, and you may mention what would need to change.

Guardrails (never break these):
- Never state eligibility as guaranteed. Phrase the "why" as "likely eligible because..." — the user must always verify on the official page before relying on it.
- Never suggest the user can apply or submit anything inside this chat — you only help them discover and point them to the real official page.
- Never claim official government affiliation.
- If a scheme's deadline note says a date has likely passed, mention that plainly rather than hiding it.
- Keep messages short — 1-3 sentences, conversational, not a wall of text.`;

export async function POST(request: Request) {
  const { messages } = (await request.json()) as { messages: ChatMessage[] };

  if (!Array.isArray(messages)) {
    return NextResponse.json({ error: "messages array is required" }, { status: 400 });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        message: "Chat isn't configured yet — set GROQ_API_KEY to enable it.",
        inputType: "text",
        options: null,
        recommendations: null,
      } satisfies AssistantTurn,
      { status: 200 }
    );
  }

  const groq = new Groq({ apiKey });

  try {
    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      temperature: 0.4,
      max_tokens: 600,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(raw) as Partial<AssistantTurn>;

    const inputType: AssistantTurn["inputType"] =
      parsed.inputType === "yesno" || parsed.inputType === "options" || parsed.inputType === "done"
        ? parsed.inputType
        : "text";

    const recommendations =
      inputType === "done" && Array.isArray(parsed.recommendations)
        ? parsed.recommendations.filter(
            (r): r is { schemeId: string; why: string } =>
              typeof r?.schemeId === "string" && VALID_SCHEME_IDS.has(r.schemeId) && typeof r?.why === "string"
          )
        : null;

    const turn: AssistantTurn = {
      message: typeof parsed.message === "string" ? parsed.message : "Sorry, could you say that again?",
      inputType,
      options: inputType === "options" && Array.isArray(parsed.options) ? parsed.options.slice(0, 5) : null,
      recommendations,
    };

    return NextResponse.json(turn);
  } catch {
    return NextResponse.json(
      {
        message: "Something went wrong on my end — could you try that again?",
        inputType: "text",
        options: null,
        recommendations: null,
      } satisfies AssistantTurn,
      { status: 200 }
    );
  }
}
