"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { getSchemeById } from "@/lib/schemes";
import { track } from "@/lib/mixpanel";

type ChatMessage = { role: "user" | "assistant"; content: string };
type InputType = "text" | "yesno" | "options" | "done";
type Recommendation = { schemeId: string; why: string };

export type ChatWidgetHandle = { open: () => void };

const OPENING_MESSAGE =
  "Hi! I'm Ankura's assistant. I'll ask a few quick questions and point you toward Karnataka startup schemes you might qualify for. What's your name?";

export const ChatWidget = forwardRef<ChatWidgetHandle>(function ChatWidget(_props, ref) {
  const [isOpen, setIsOpen] = useState(false);
  const [started, setStarted] = useState(false);
  const startedRef = useRef(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputType, setInputType] = useState<InputType>("text");
  const [options, setOptions] = useState<string[] | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[] | null>(null);
  const [textValue, setTextValue] = useState("");
  const [loading, setLoading] = useState(false);

  function openChat() {
    setIsOpen(true);
    if (!startedRef.current) {
      startedRef.current = true;
      track("chatbot_opened");
      setStarted(true);
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

  async function send(userText: string) {
    const trimmed = userText.trim();
    if (!trimmed || loading) return;

    const next = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(next);
    setTextValue("");
    setLoading(true);
    setOptions(null);
    track("message_sent", { input_type: inputType });

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();

      setMessages((m) => [...m, { role: "assistant", content: data.message }]);
      setInputType(data.inputType ?? "text");
      setOptions(data.options ?? null);

      if (data.inputType === "done") {
        setRecommendations(data.recommendations ?? []);
        track("recommendations_shown", { count: (data.recommendations ?? []).length });
      }
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Something went wrong — could you try that again?" },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleTextSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(textValue);
  }

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        aria-label={isOpen ? "Close Ankura chat" : "Open Ankura chat"}
        className="fixed bottom-5 right-5 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-ink-950 shadow-[0_0_24px_rgba(139,92,246,0.5)] hover:shadow-[0_0_32px_rgba(139,92,246,0.7)] transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M21 12c0 4.418-4.03 8-9 8-1.09 0-2.13-.17-3.09-.49L3 21l1.6-4.28C3.6 15.34 3 13.73 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8Z" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[560px] w-[380px] max-w-[calc(100vw-2.5rem)] flex-col rounded-2xl border border-ink-600 bg-ink-800 shadow-2xl">
          <div className="rounded-t-2xl border-b border-ink-700 bg-gradient-to-r from-violet-600/20 to-cyan-500/20 px-4 py-3">
            <p className="font-semibold text-ink-100">Ankura</p>
            <p className="text-xs text-ink-300">
              Independent, unofficial — not a government service.
            </p>
          </div>

          <div aria-live="polite" className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-violet-600 px-3 py-2 text-sm text-white"
                    : "mr-auto max-w-[85%] rounded-2xl rounded-bl-sm bg-ink-700 px-3 py-2 text-sm text-ink-100"
                }
              >
                {m.content}
              </div>
            ))}
            {loading && <p className="text-xs text-ink-300">Thinking…</p>}

            {recommendations && (
              <div className="space-y-2 pt-1">
                {recommendations.length === 0 && (
                  <p className="text-sm text-ink-300">
                    Nothing here looks like a fit right now based on what you&apos;ve shared.
                  </p>
                )}
                {recommendations.map((rec) => {
                  const scheme = getSchemeById(rec.schemeId);
                  if (!scheme) return null;
                  return (
                    <a
                      key={rec.schemeId}
                      href={scheme.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => track("scheme_link_clicked", { scheme: scheme.id })}
                      className="block rounded-xl border border-ink-600 bg-ink-900 p-3 hover:border-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 transition-colors"
                    >
                      <p className="font-medium text-ink-100">{scheme.name}</p>
                      <p className="mt-1 text-xs text-ink-300">{rec.why}</p>
                      <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-cyan-400">
                        View on official site
                        <svg aria-hidden="true" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M7 17L17 7M17 7H8M17 7V16" />
                        </svg>
                      </span>
                    </a>
                  );
                })}
                <p className="pt-1 text-[11px] text-ink-300">
                  Always verify eligibility and current status on the official page before relying on it.
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-ink-700 p-3">
            {inputType === "yesno" && !loading && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => send("Yes")}
                  className="flex-1 rounded-lg border border-ink-600 py-2 text-sm text-ink-100 hover:bg-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => send("No")}
                  className="flex-1 rounded-lg border border-ink-600 py-2 text-sm text-ink-100 hover:bg-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
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
                    onClick={() => send(o)}
                    className="rounded-lg border border-ink-600 px-3 py-2 text-left text-sm text-ink-100 hover:bg-ink-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                  >
                    {o}
                  </button>
                ))}
              </div>
            )}

            {(inputType === "text" || inputType === "done") && (
              <form onSubmit={handleTextSubmit} className="flex gap-2">
                <label htmlFor="ankura-chat-input" className="sr-only">
                  Type a message
                </label>
                <input
                  id="ankura-chat-input"
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  disabled={loading}
                  placeholder={started ? "Type your answer…" : "Say hi to get started…"}
                  className="flex-1 rounded-lg border border-ink-600 bg-ink-900 px-3 py-2 text-sm text-ink-100 placeholder:text-ink-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 px-3 py-2 text-sm font-medium text-ink-950 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                >
                  Send
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
});
