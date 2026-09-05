"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import Link from "next/link";
import { getSchemeById } from "@/lib/schemes";
import { getNextQuestion, computeRecommendations, type ChatState, type Question, type Recommendation } from "@/lib/chatFlow";
import { track, registerFounderName } from "@/lib/mixpanel";
import { logSession, isInternal } from "@/lib/supabase";

type ChatMessage = { role: "user" | "assistant"; content: string };
type InputType = "text" | "yesno" | "options" | "done";

export type ChatWidgetHandle = { open: () => void };

const OPENING_MESSAGE =
  "Hi! I can help you find Karnataka startup schemes you might be eligible for. Say hi to start the conversation.";
const NAME_PROMPT = "What's your name?";

export const ChatWidget = forwardRef<ChatWidgetHandle>(function ChatWidget(_props, ref) {
  const [isOpen, setIsOpen] = useState(false);
  const [greeted, setGreeted] = useState(false);
  const [started, setStarted] = useState(false);
  const startedRef = useRef(false);
  const [name, setName] = useState("");
  const [answers, setAnswers] = useState<ChatState>({});
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputType, setInputType] = useState<InputType>("text");
  const [options, setOptions] = useState<string[] | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[] | null>(null);
  const [textValue, setTextValue] = useState("");
  const [loading] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const recsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    if (recommendations && recsRef.current) {
      // When results appear, land at the START of them (with the closing line
      // peeking above) so the founder reads top-to-bottom and scrolls down to
      // the end, instead of jumping straight to the last row.
      const delta = recsRef.current.getBoundingClientRect().top - el.getBoundingClientRect().top;
      el.scrollTop = Math.max(0, el.scrollTop + delta - 56);
    } else {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, recommendations]);

  function openChat() {
    setIsOpen(true);
    if (!startedRef.current) {
      startedRef.current = true;
      track("chatbot_opened");
      setMessages([{ role: "assistant", content: OPENING_MESSAGE }]);
      setInputType("text");
    }
  }

  useImperativeHandle(ref, () => ({ open: openChat }));

  function askQuestion(question: Question) {
    setCurrentQuestionId(question.id);
    setMessages((m) => [...m, { role: "assistant", content: question.prompt }]);
    setInputType(question.inputType);
    setOptions(question.options ?? null);
  }

  function finish(finalAnswers: ChatState, finalName: string) {
    const recs = computeRecommendations(finalAnswers);
    track("recommendations_shown", { count: recs.length });
    void logSession({
      name: finalName || null,
      persona: finalAnswers.persona ?? null,
      answers: finalAnswers,
      recommendations: recs.map((r) => ({ schemeId: r.schemeId, tier: r.tier })),
      result_count: recs.length,
      was_empty: recs.length === 0,
      internal: isInternal(),
    });
    setRecommendations(recs);
    setInputType("done");

    const closing =
      recs.length > 0
        ? "I hope you find these Karnataka startup schemes helpful for your journey."
        : `Thanks for walking through this, ${finalName}. Nothing here looks like a fit right now, but that can change fast as things move.`;
    setMessages((m) => [...m, { role: "assistant", content: closing }]);
  }

  function handleAnswer(rawValue: string) {
    const trimmed = rawValue.trim();
    if (!trimmed || loading) return;

    setMessages((m) => [...m, { role: "user", content: trimmed }]);
    setTextValue("");
    setOptions(null);

    if (!greeted) {
      setGreeted(true);
      track("chatbot_greeted");
      setMessages((m) => [...m, { role: "assistant", content: NAME_PROMPT }]);
      setInputType("text");
      return;
    }

    if (!started) {
      setStarted(true);
      setName(trimmed);
      registerFounderName(trimmed);
      track("message_sent", { question: "name" });
      const first = getNextQuestion({});
      if (first) askQuestion(first);
      return;
    }

    track("message_sent", { question: currentQuestionId });
    const nextAnswers = currentQuestionId ? { ...answers, [currentQuestionId]: trimmed } : answers;
    setAnswers(nextAnswers);

    const next = getNextQuestion(nextAnswers);
    if (next) {
      askQuestion(next);
    } else {
      finish(nextAnswers, name);
    }
  }

  function handleTextSubmit(e: React.FormEvent) {
    e.preventDefault();
    handleAnswer(textValue);
  }

  function restart() {
    track("chatbot_restarted");
    startedRef.current = true;
    setGreeted(false);
    setStarted(false);
    setName("");
    setAnswers({});
    setCurrentQuestionId(null);
    setRecommendations(null);
    setTextValue("");
    setMessages([{ role: "assistant", content: OPENING_MESSAGE }]);
    setInputType("text");
    setOptions(null);
  }

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={openChat}
          aria-label="Open chat"
          className="fixed bottom-5 right-5 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-govorange-500 text-white shadow-lg hover:bg-govorange-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-govblue-900 focus-visible:ring-offset-2"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <line x1="12" y1="1.5" x2="12" y2="4" strokeLinecap="round" />
            <circle cx="12" cy="1.15" r="0.9" fill="currentColor" stroke="none" />
            <path
              d="M4 7.5C4 6.12 5.12 5 6.5 5h11C18.88 5 20 6.12 20 7.5v7c0 1.38-1.12 2.5-2.5 2.5H9l-3.5 3v-3H6.5C5.12 17 4 15.88 4 14.5v-7Z"
              strokeLinejoin="round"
            />
            <circle cx="9.3" cy="10.75" r="1.15" fill="currentColor" stroke="none" />
            <circle cx="14.7" cy="10.75" r="1.15" fill="currentColor" stroke="none" />
          </svg>
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-5 right-5 z-50 flex h-[min(680px,calc(100vh-3rem))] w-[560px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-lg border border-govgray-300 bg-white shadow-2xl">
          <div className="flex items-center justify-end border-b border-govgray-200 px-2 py-1.5">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="flex h-7 w-7 items-center justify-center rounded-full text-govgray-700/60 hover:bg-govgray-100 hover:text-govgray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-govblue-900"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div ref={messagesRef} aria-live="polite" className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "ml-auto max-w-[85%] rounded-lg rounded-br-sm bg-govblue-900 px-3 py-2 text-sm text-white"
                    : "mr-auto max-w-[85%] rounded-lg rounded-bl-sm bg-govgray-50 border border-govgray-300 px-3 py-2 text-sm text-govgray-700"
                }
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="mr-auto flex items-center gap-1 rounded-lg rounded-bl-sm bg-govgray-50 border border-govgray-300 px-3 py-2.5 w-fit" aria-label="Assistant is typing">
                <span className="h-1.5 w-1.5 rounded-full bg-govgray-700/50 animate-bounce [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-govgray-700/50 animate-bounce [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-govgray-700/50 animate-bounce" />
              </div>
            )}

            {recommendations && (
              <div ref={recsRef} className="space-y-2 pt-1">
                {recommendations.length === 0 && (
                  <p className="text-sm text-govgray-700/70">
                    Nothing here looks like a fit right now based on what you have shared.
                  </p>
                )}
                {recommendations.length > 0 && (
                  <>
                    <div className="overflow-hidden rounded-lg border border-govgray-300">
                      <table className="w-full border-collapse text-sm">
                        <thead>
                          <tr className="bg-govgray-50 text-left text-xs font-semibold uppercase tracking-wide text-govgray-700/70">
                            <th className="border-b border-govgray-300 px-3 py-2">Scheme</th>
                            <th className="border-b border-govgray-300 px-3 py-2">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            ...recommendations.filter((r) => r.tier === "strong-fit"),
                            ...recommendations.filter((r) => r.tier === "general"),
                          ].map((rec) => {
                            const scheme = getSchemeById(rec.schemeId);
                            if (!scheme) return null;
                            return (
                              <tr key={rec.schemeId} className="border-b border-govgray-200 align-top last:border-0">
                                <td className="px-3 py-2">
                                  <a
                                    href={scheme.officialUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => track("scheme_link_clicked", { scheme: scheme.id })}
                                    className="font-medium text-govblue-900 hover:text-govorange-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-govblue-900"
                                  >
                                    {scheme.name}
                                  </a>
                                </td>
                                <td className="px-3 py-2 text-govgray-700/80">{scheme.tagline}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    <p className="pt-1 text-[11px] text-govgray-700/60">
                      Always verify eligibility and current status on the official page before relying on it.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-govgray-300 p-3">
            {inputType === "yesno" && !loading && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleAnswer("Yes")}
                  className="flex-1 rounded border border-govgray-300 py-2 text-sm text-govgray-700 hover:bg-govgray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-govblue-900"
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => handleAnswer("No")}
                  className="flex-1 rounded border border-govgray-300 py-2 text-sm text-govgray-700 hover:bg-govgray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-govblue-900"
                >
                  No
                </button>
              </div>
            )}

            {inputType === "options" && options && !loading && (
              <div className="flex flex-col gap-2">
                {options.map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => handleAnswer(o)}
                    className="rounded border border-govgray-300 px-3 py-2 text-left text-sm text-govgray-700 hover:bg-govgray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-govblue-900"
                  >
                    {o}
                  </button>
                ))}
              </div>
            )}

            {inputType === "text" && (
              <form onSubmit={handleTextSubmit} className="flex gap-2">
                <label htmlFor="scheme-chat-input" className="sr-only">
                  Type a message
                </label>
                <input
                  id="scheme-chat-input"
                  name="scheme-chat-input"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  disabled={loading}
                  placeholder={greeted ? "Type your answer..." : "Say hello to get started..."}
                  className="flex-1 rounded border border-govgray-300 bg-white px-3 py-2 text-sm text-govgray-700 placeholder:text-govgray-700/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-govblue-900 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded bg-govorange-500 px-3 py-2 text-sm font-medium text-white hover:bg-govorange-600 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-govblue-900"
                >
                  Send
                </button>
              </form>
            )}

            {inputType === "done" && !loading && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={restart}
                  className="flex-1 rounded border border-govgray-300 py-2 text-sm text-govgray-700 hover:bg-govgray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-govblue-900"
                >
                  Start Over
                </button>
                <Link
                  href="/schemes"
                  onClick={() => {
                    track("view_all_schemes_from_chat");
                    setIsOpen(false);
                  }}
                  className="flex-1 rounded bg-govorange-500 py-2 text-center text-sm font-medium text-white hover:bg-govorange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-govblue-900"
                >
                  View All Schemes
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
});
