"use client";

import { useState } from "react";
import { track } from "@/lib/mixpanel";

type Message = { role: "user" | "assistant"; content: string };

export function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  function toggle() {
    if (!open) track("chatbot_opened");
    setOpen(!open);
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setMessages((m) => [...m, { role: "user", content: text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();

      if (data.redirected) {
        track("chatbot_eligibility_redirect");
      }

      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "Something went wrong — try again in a moment." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        aria-label={open ? "Close help chat" : "Open help chat"}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-navy-600 text-white shadow-lg hover:bg-navy-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-800"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M21 12c0 4.418-4.03 8-9 8-1.09 0-2.13-.17-3.09-.49L3 21l1.6-4.28C3.6 15.34 3 13.73 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8Z" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[420px] w-[340px] flex-col rounded-xl border border-navy-100 bg-white shadow-xl">
          <div className="border-b border-navy-100 px-4 py-3">
            <p className="font-medium text-navy-950">Scheme Finder help</p>
            <p className="text-xs text-navy-500">
              I can explain schemes and terms — not tell you if you&apos;re eligible.
            </p>
          </div>

          <div aria-live="polite" className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
            {messages.length === 0 && (
              <p className="text-sm text-navy-400">
                Ask me something like &quot;what is DPIIT recognition?&quot;
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "ml-auto max-w-[85%] rounded-lg bg-navy-600 px-3 py-2 text-sm text-white"
                    : "mr-auto max-w-[85%] rounded-lg bg-navy-50 px-3 py-2 text-sm text-navy-800"
                }
              >
                {m.content}
              </div>
            ))}
            {loading && <p className="text-xs text-navy-400">Thinking…</p>}
          </div>

          <form onSubmit={send} className="flex gap-2 border-t border-navy-100 p-3">
            <label htmlFor="chat-input" className="sr-only">
              Ask a question
            </label>
            <input
              id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a question…"
              className="flex-1 rounded-lg border border-navy-200 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-600"
            />
            <button
              type="submit"
              className="rounded-lg bg-navy-600 px-3 py-2 text-sm font-medium text-white hover:bg-navy-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-600"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
