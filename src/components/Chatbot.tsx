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
        onClick={toggle}
        aria-label="Open help chat"
        className="fixed bottom-5 right-5 z-50 h-14 w-14 rounded-full bg-slate-900 text-white text-2xl shadow-lg hover:bg-slate-800"
      >
        {open ? "×" : "💬"}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[420px] w-[340px] flex-col rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="border-b border-slate-200 px-4 py-3">
            <p className="font-medium text-slate-900">Scheme Finder help</p>
            <p className="text-xs text-slate-500">
              I can explain schemes and terms — not tell you if you&apos;re eligible.
            </p>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
            {messages.length === 0 && (
              <p className="text-sm text-slate-400">
                Ask me something like &quot;what is DPIIT recognition?&quot;
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "ml-auto max-w-[85%] rounded-lg bg-slate-900 px-3 py-2 text-sm text-white"
                    : "mr-auto max-w-[85%] rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-800"
                }
              >
                {m.content}
              </div>
            ))}
            {loading && <p className="text-xs text-slate-400">Thinking…</p>}
          </div>

          <form onSubmit={send} className="flex gap-2 border-t border-slate-200 p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a question…"
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
