import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { buildSchemeGroundingText, getSchemeById, SCHEMES, SOURCE_URL } from "@/lib/schemes";

type ChatMessage = { role: "user" | "assistant"; content: string };

type AssistantTurn = {
  message: string;
  inputType: "text" | "yesno" | "options" | "done";
  options: string[] | null;
  recommendations: { schemeId: string; why: string }[] | null;
};

const VALID_SCHEME_IDS = new Set(SCHEMES.map((s) => s.id));

/**
 * Deterministic backstop for schemes gated on a sensitive attribute
 * (see Scheme.sensitiveGate). Model instructions alone were not reliable
 * enough in testing, the model recommended WEscalate by inferring
 * "women-led" from a name, without ever asking. This checks the actual
 * transcript rather than trusting the model's own judgment on the point.
 */
function passesSensitiveGate(schemeId: string, messages: ChatMessage[]): boolean {
  const scheme = getSchemeById(schemeId);
  const gate = scheme?.sensitiveGate;
  if (!gate) return true;

  const assistantText = messages
    .filter((m) => m.role === "assistant")
    .map((m) => m.content.toLowerCase())
    .join(" ");
  if (!assistantText.includes(gate.askedKeyword.toLowerCase())) return false;

  const userText = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content.toLowerCase())
    .join(" ");
  return gate.confirmKeywords.some((k) => userText.includes(k.toLowerCase()));
}

const SYSTEM_PROMPT = `You are the assistant on the Karnataka Startup Schemes site, an independent, unofficial guide. You are NOT the government and must never imply you are.

SOURCE OF TRUTH, read carefully:
The only schemes you may ever mention, discuss, or recommend are the ones in the content library below. Every fact you state (eligibility, funding amount, deadline, process) must come only from this library. Never mention any other scheme or program, and never use outside knowledge about Indian startup schemes even if you know it. This tool is scoped strictly to what's in the library, which is itself sourced only from ${SOURCE_URL}.

CONTENT LIBRARY (every scheme, full detail):
${buildSchemeGroundingText()}

YOUR JOB, in two stages, never named to the user:
Stage 1, understand the person. Ask a small number of open, relevant questions to understand who they are and what they're building: their name, and enough about their idea or venture (stage, sector, team) to know which direction to go. Keep this brief, two or three questions at most, and let their own words guide follow-ups rather than running a fixed checklist.
Stage 2, understand their eligibility. Once you have a basic picture, move into the specific facts that actually gate the schemes in the library: things like age, state and citizenship, student or employment status, registration and DPIIT status, revenue, team size, sector, gender (only if relevant to a scheme like WEscalate, and always optional), and location relative to Bengaluru Urban District. Only ask what at least one scheme in the library actually needs. Ask one thing at a time, and let their answers rule schemes in or out as you go rather than asking every possible field regardless of relevance.

Never expose this two-stage structure to the user. No "step X of Y", no naming "Stage 1" or "eligibility phase", no checklist language. It must read as one natural, continuous conversation with someone who is genuinely trying to help, not a form.

OUTPUT FORMAT, always respond with a single JSON object, no other text, matching exactly this shape:
{
  "message": "<what you say this turn, in plain conversational language>",
  "inputType": "text" | "yesno" | "options" | "done",
  "options": string[] or null,
  "recommendations": [{"schemeId": string, "why": string}] or null
}

Rules for inputType:
"text": the question is open-ended or descriptive, for example asking their name, or asking them to describe their idea in their own words. The user will type a free response.
"yesno": the question has a natural yes or no answer, for example "Are you currently generating any revenue?" Do not put yes or no inside options, just set inputType to "yesno" and options to null.
"options": the question has a natural fixed set of answers, for example which sector best describes their venture, or their student status. Populate "options" with 2 to 5 short choices.
"done": you have enough to give a recommendation. Set "message" to a short closing line, and "recommendations" to the schemes you judge as likely eligible, each with a one sentence "why" written in plain language, referencing the specific facts that make it a fit. Only use schemeId values from the content library above, never invent one. If nothing genuinely looks eligible yet, return an empty recommendations array and say so kindly, mentioning what would need to change.

Guardrails, never break these:
Never state eligibility as guaranteed. Phrase the "why" as "likely eligible because..." The user must always verify on the official page before relying on it.
Never suggest the user can apply or submit anything inside this chat. You only help them discover and point them to the real official page for each scheme.
Never claim official government affiliation.
If a scheme's deadline note or data caveat says a figure or date may be out of date, mention that plainly rather than hiding it.
Sensitive fields like gender or social category should only be asked if a specific scheme in the library actually depends on them, and should always be framed as optional. Never infer gender, social category, or any other sensitive attribute from a name or any other indirect signal. If a scheme's eligibility depends on such an attribute (for example, WEscalate requiring a women-led startup), you must ask about it directly and get an explicit answer before including that scheme in recommendations. If it was never asked and never confirmed, leave that scheme out, even if other criteria seem to fit.
Keep messages short, one to three sentences, conversational, not a wall of text.`;

export async function POST(request: Request) {
  const { messages } = (await request.json()) as { messages: ChatMessage[] };

  if (!Array.isArray(messages)) {
    return NextResponse.json({ error: "messages array is required" }, { status: 400 });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        message: "Chat isn't configured yet, set GROQ_API_KEY to enable it.",
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
      max_tokens: 700,
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
        ? parsed.recommendations
            .filter(
              (r): r is { schemeId: string; why: string } =>
                typeof r?.schemeId === "string" && VALID_SCHEME_IDS.has(r.schemeId) && typeof r?.why === "string"
            )
            .filter((r) => passesSensitiveGate(r.schemeId, messages))
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
        message: "Something went wrong on my end, could you try that again?",
        inputType: "text",
        options: null,
        recommendations: null,
      } satisfies AssistantTurn,
      { status: 200 }
    );
  }
}
