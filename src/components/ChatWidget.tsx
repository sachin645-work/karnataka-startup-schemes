"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import Link from "next/link";
import { getSchemeById } from "@/lib/schemes";
import { getNextQuestion, computeRecommendations, type ChatState, type Question, type Recommendation } from "@/lib/chatFlow";
import { track } from "@/lib/mixpanel";

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

  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
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

  function toggle() {
    if (isOpen) {
      setIsOpen(false);
    } else {
      openChat();
    }
  }

  function askQuestion(question: Question) {
    setCurrentQuestionId(question.id);
    setMessages((m) => [...m, { role: "assistant", content: question.prompt }]);
    setInputType(question.inputType);
    setOptions(question.options ?? null);
  }

  function finish(finalAnswers: ChatState, finalName: string) {
    const recs = computeRecommendations(finalAnswers);
    track("recommendations_shown", { count: recs.length });
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
      <button
        type="button"
        onClick={toggle}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        className="fixed bottom-5 right-5 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-govorange-500 text-white shadow-lg hover:bg-govorange-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-govblue-900 focus-visible:ring-offset-2"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        ) : (
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
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[560px] w-[380px] max-w-[calc(100vw-2.5rem)] flex-col rounded-lg border border-govgray-300 bg-white shadow-2xl">
          <div className="rounded-t-lg border-b border-govgray-300 bg-govblue-900 px-4 py-3">
            <p className="font-semibold text-white">Scheme Assistant</p>
            <p className="text-xs text-white/70">Find schemes that match your situation.</p>
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
              <div className="space-y-3 pt-1">
                {recommendations.length === 0 && (
                  <p className="text-sm text-govgray-700/70">
                    Nothing here looks like a fit right now based on what you have shared.
                  </p>
                )}
                {(() => {
                  const strongFit = recommendations.filter((r) => r.tier === "strong-fit");
                  const general = recommendations.filter((r) => r.tier === "general");
                  if (strongFit.length > 0 && general.length > 0) {
                    return (
                      <>
                        <RecommendationGroup title="Best fit for you" recs={strongFit} />
                        <RecommendationGroup title="Also worth checking" recs={general} />
                      </>
                    );
                  }
                  return recommendations.length > 0 ? <RecommendationGroup recs={recommendations} /> : null;
                })()}
                {recommendations.length > 0 && (
                  <p className="pt-1 text-[11px] text-govgray-700/60">
                    Always verify eligibility and current status on the official page before relying on it.
                  </p>
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
                  onClick={() => track("view_all_schemes_from_chat")}
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

function RecommendationGroup({ title, recs }: { title?: string; recs: Recommendation[] }) {
  return (
    <div className="space-y-2">
      {title && <p className="text-xs font-semibold uppercase tracking-wide text-govgray-700/70">{title}</p>}
      {recs.map((rec) => {
        const scheme = getSchemeById(rec.schemeId);
        if (!scheme) return null;
        return (
          <a
            key={rec.schemeId}
            href={scheme.officialUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("scheme_link_clicked", { scheme: scheme.id })}
            className="block rounded-lg border border-govgray-300 bg-white p-3 hover:border-govblue-900 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-govblue-900 transition-all"
          >
            <p className="font-medium text-govblue-900 text-sm">{scheme.name}</p>
            <p className="mt-1 text-xs text-govgray-700/70">{rec.why}</p>
            <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-govorange-600">
              Visit official page
              <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17L17 7M17 7H8M17 7V16" />
              </svg>
            </span>
          </a>
        );
      })}
    </div>
  );
}
