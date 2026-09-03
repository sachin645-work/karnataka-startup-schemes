"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { getSchemeById } from "@/lib/schemes";
import { track } from "@/lib/mixpanel";

type ChatMessage = { role: "user" | "assistant"; content: string };
type InputType = "text" | "yesno" | "options" | "done";
type Recommendation = { schemeId: string; why: string };

export type ChatWidgetHandle = { open: () => void };

const OPENING_MESSAGE =
  "Hi! I can help you find Karnataka startup schemes you might be eligible for. What's your name?";

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
        { role: "assistant", content: "Something went wrong, could you try that again?" },
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
        aria-label={isOpen ? "Close chat" : "Open chat"}
        className="fixed bottom-5 right-5 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-govorange-500 text-white shadow-lg hover:bg-govorange-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-govblue-900 focus-visible:ring-offset-2"
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
        <div className="fixed bottom-24 right-5 z-50 flex h-[560px] w-[380px] max-w-[calc(100vw-2.5rem)] flex-col rounded-lg border border-govgray-300 bg-white shadow-2xl">
          <div className="rounded-t-lg border-b border-govgray-300 bg-govblue-900 px-4 py-3">
            <p className="font-semibold text-white">Scheme Assistant</p>
            <p className="text-xs text-white/70">Independent guide, not a government service.</p>
          </div>

          <div aria-live="polite" className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
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
              <div className="space-y-2 pt-1">
                {recommendations.length === 0 && (
                  <p className="text-sm text-govgray-700/70">
                    Nothing here looks like a fit right now based on what you have shared.
                  </p>
                )}
                {recommendations.map((rec) => {
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
                <p className="pt-1 text-[11px] text-govgray-700/60">
                  Always verify eligibility and current status on the official page before relying on it.
                </p>
              </div>
            )}
          </div>

          <div className="border-t border-govgray-300 p-3">
            {inputType === "yesno" && !loading && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => send("Yes")}
                  className="flex-1 rounded border border-govgray-300 py-2 text-sm text-govgray-700 hover:bg-govgray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-govblue-900"
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => send("No")}
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
                    onClick={() => send(o)}
                    className="rounded border border-govgray-300 px-3 py-2 text-left text-sm text-govgray-700 hover:bg-govgray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-govblue-900"
                  >
                    {o}
                  </button>
                ))}
              </div>
            )}

            {(inputType === "text" || inputType === "done") && (
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
                  placeholder={started ? "Type your answer..." : "Say hello to get started..."}
                  className="flex-1 rounded border border-govgray-300 bg-white px-3 py-2 text-sm text-govgray-700 placeholder:text-govgray-700/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-govblue-900"
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
          </div>
        </div>
      )}
    </>
  );
});
