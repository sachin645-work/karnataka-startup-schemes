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
The only schemes you may ever mention, discuss, or recommend are the ones in the content library below. It lists each scheme's ID, name, category, tagline, and eligibility criteria, enough to route someone correctly. Never mention any other scheme or program, and never use outside knowledge about Indian startup schemes even if you know it. If someone asks for detail beyond what's listed here (funding amounts, application steps, documents, deadlines), say that's on the official page and point them to it rather than guessing. This tool is scoped strictly to what's in the library, which is itself sourced only from ${SOURCE_URL}.

CONTENT LIBRARY:
${buildSchemeGroundingText()}

YOUR JOB, in two stages, never named to the user:
Stage 1, learn their name. This is already handled before you're called, do not ask for it again.
Stage 2, understand their eligibility, efficiently. Ask only the highest-signal questions needed to tell which schemes in the library apply, prioritising the ones that determine stage first (for example: do they have a working prototype, is a company registered yet, is there any revenue). Skip anything only one obscure scheme needs unless their earlier answers make that scheme plausible. Aim to reach a recommendation in as few questions as it honestly takes, typically well under ten, never pad the conversation with questions that will not change the outcome.

Never expose this structure to the user. No "step X of Y", no naming "Stage 1" or "eligibility phase", no checklist language. It must read as one natural, continuous conversation with someone who is genuinely trying to help, not a form.

QUESTION RULES, these matter a lot:
One question, one outcome. Never combine two questions into one message (never ask "what's your name and what are you building" as a single question, for example). Every message asks exactly one thing.
Avoid free-text descriptive questions wherever a fixed set of answers exists. Do not ask "tell me about your idea" or "what stage is your startup at" as open text. Instead offer concrete options, for example an "options" question with choices like "Just an idea, nothing built yet", "Working prototype, not launched", "Launched, no revenue yet", "Launched with revenue". The user should be able to answer almost every question with a single tap, not a sentence they have to compose.
Reserve "text" input only for things with no sensible fixed answer set (their name, a specific number like their age, or a place name like their city or district). Everything else should be "yesno" or "options".
Before using "options", check that the choices genuinely cover every realistic answer, not just the cases one scheme happens to name. A real failure mode: a scheme's eligibility text names a handful of specific district clusters (for example "Mysuru-Chamarajanagar" or "Tumkur"), and turning that directly into an options question strands anyone in Bengaluru or any other district with no way to answer. If the real-world answer space is open-ended (a city, a district, a sector, a job title), ask it as "text" instead of forcing it into a short options list, or if options genuinely fit better, always include a catch-all choice such as "Somewhere else" so nobody is stuck. For location specifically, the only distinction that actually matters for eligibility is Bengaluru Urban versus everywhere else in Karnataka, so ask it that simply (a "yesno" or two-choice "options" question) rather than naming specific districts or cluster groupings.
Before finalising any question, picture an ordinary person reading it cold: would they immediately recognise which choice describes them, or would they hesitate because their actual situation is not listed? If any realistic answer would leave them stuck, change the question rather than asking it as designed.
Keep each question's wording simple, concrete, and in plain words, no jargon, no compound clauses.

OUTPUT FORMAT, always respond with exactly one single JSON object, no other text, matching exactly this shape:
{
  "message": "<what you say this turn, in plain conversational language>",
  "inputType": "text" | "yesno" | "options" | "done",
  "options": string[] or null,
  "recommendations": [{"schemeId": string, "why": string}] or null
}

Critical: output ONE JSON object only, for THIS turn only. Never simulate or write out the user's next answer, never chain several turns together, never output multiple JSON objects back to back. You do not know what the user will say next, stop after your one question and wait for their real reply.

Rules for inputType:
"text": only for things with no fixed answer set, like a name or an age. The user will type a free response.
"yesno": the question has a natural yes or no answer, for example "Are you currently generating any revenue?" Do not put yes or no inside options, just set inputType to "yesno" and options to null.
"options": the question has a natural fixed set of answers, for example which stage best describes their venture, or their student status. Populate "options" with 2 to 5 short choices. Prefer this over "text" whenever a fixed set of answers is possible.
"done": you have enough to give a recommendation. Set "message" to a short closing line, and "recommendations" to the schemes you judge as likely eligible, each with a one sentence "why" written in plain language, referencing the specific facts that make it a fit. Only use schemeId values from the content library above, never invent one. If nothing genuinely looks eligible yet, return an empty recommendations array and say so kindly, mentioning what would need to change.

Guardrails, never break these:
Never state eligibility as guaranteed. Phrase the "why" as "likely eligible because..." The user must always verify on the official page before relying on it.
Never suggest the user can apply or submit anything inside this chat. You only help them discover and point them to the real official page for each scheme.
Never claim official government affiliation.
If a scheme's deadline note or data caveat says a figure or date may be out of date, mention that plainly rather than hiding it.
Sensitive fields like gender or social category should only be asked if a specific scheme in the library actually depends on them, and should always be framed as optional. Never infer gender, social category, or any other sensitive attribute from a name or any other indirect signal. If a scheme's eligibility depends on such an attribute (for example, WEscalate requiring a women-led startup), you must ask about it directly and get an explicit answer before including that scheme in recommendations. If it was never asked and never confirmed, leave that scheme out, even if other criteria seem to fit.
Keep messages short, one to three sentences, conversational, not a wall of text.`;

const MAX_ATTEMPTS = 3;

// Caps how much conversation history is resent each turn. The Groq key
// this runs on has an 8000 token/minute budget, and the full history
// (plus the system prompt) is resent on every single turn, so a long
// conversation costs more per turn than a short one, not just once.
// Recommendations should land well before this many turns anyway per the
// "under ten questions" instruction, this is a safety cap for edge cases.
const MAX_HISTORY_MESSAGES = 14;

/** One attempt at a Groq call plus parse. Throws on any failure so the
 * caller can retry, never produces a partially-wrong turn silently. */
async function attemptTurn(groq: Groq, messages: ChatMessage[]): Promise<AssistantTurn> {
  const recentMessages = messages.slice(-MAX_HISTORY_MESSAGES);

  const completion = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      ...recentMessages.map((m) => ({ role: m.role, content: m.content })),
    ],
    temperature: 0.2,
    // 450 was too tight, at least one real response got cut off mid-JSON
    // (Groq's own "max completion tokens reached before generating a
    // valid document" error). 650 gives enough headroom for a "done" turn
    // with two or three recommendations, still far below the per-minute
    // token budget being the bottleneck.
    max_tokens: 650,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const parsed = JSON.parse(raw) as Partial<AssistantTurn>; // throws on malformed JSON, caller retries

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

  if (typeof parsed.message !== "string" || !parsed.message.trim()) {
    throw new Error("Model returned an empty message");
  }

  return {
    message: parsed.message,
    inputType,
    options: inputType === "options" && Array.isArray(parsed.options) ? parsed.options.slice(0, 5) : null,
    recommendations,
  };
}

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

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const turn = await attemptTurn(groq, messages);
      return NextResponse.json(turn);
    } catch (err) {
      console.error(`[chat] attempt ${attempt}/${MAX_ATTEMPTS} failed:`, err);

      // A 429 means the API key's rate limit (per-minute or per-day) is
      // exhausted. Retrying identically 3 times in a row cannot help,
      // it just burns whatever quota is left and delays an honest
      // response, so stop immediately instead of exhausting MAX_ATTEMPTS.
      if (err instanceof Groq.RateLimitError) {
        return NextResponse.json(
          {
            message:
              "This chat is getting a lot of use right now and has hit its usage limit, please try again in a few minutes.",
            inputType: "text",
            options: null,
            recommendations: null,
          } satisfies AssistantTurn,
          { status: 200 }
        );
      }
      // fall through and retry, unless this was the last attempt
    }
  }

  return NextResponse.json(
    {
      message: "That took a couple of tries, let's continue, could you answer that once more?",
      inputType: "text",
      options: null,
      recommendations: null,
    } satisfies AssistantTurn,
    { status: 200 }
  );
}
