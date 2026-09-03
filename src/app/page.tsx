"use client";

import { useRef } from "react";
import { SOURCE_URL, DATA_LAST_VERIFIED } from "@/lib/schemes";
import { ChatWidget, ChatWidgetHandle } from "@/components/ChatWidget";

export default function Home() {
  const chatRef = useRef<ChatWidgetHandle>(null);

  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1 flex items-center justify-center px-6">
        <section className="max-w-xl text-center py-20">
          <p className="text-sm font-medium text-cyan-400 tracking-wide uppercase mb-4">
            Ankura
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-br from-ink-100 via-ink-100 to-violet-500 bg-clip-text text-transparent">
            Find your Karnataka startup scheme, by talking, not filling forms
          </h1>
          <p className="mt-6 text-ink-300">
            An independent AI assistant that asks a few natural questions,
            then points you to the real Startup Karnataka schemes you&apos;re
            likely eligible for — with a direct link to verify on the
            official page.
          </p>

          <button
            type="button"
            onClick={() => chatRef.current?.open()}
            className="mt-10 rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 px-8 py-3.5 text-ink-950 font-semibold shadow-[0_0_24px_rgba(139,92,246,0.4)] hover:shadow-[0_0_32px_rgba(139,92,246,0.6)] transition-shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900"
          >
            Start chatting →
          </button>
        </section>
      </div>

      <footer className="border-t border-ink-700 px-6 py-6 text-center text-xs text-ink-300">
        <p>
          Ankura is an independent, unofficial discovery tool — not a
          government service, and not affiliated with the Government of
          Karnataka.
        </p>
        <p className="mt-1">
          All scheme information is sourced from the official{" "}
          <a
            href={SOURCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:underline"
          >
            Startup Karnataka portal
          </a>
          . Data last checked: {DATA_LAST_VERIFIED}. Always verify on the
          official site before relying on it.
        </p>
      </footer>

      <ChatWidget ref={chatRef} />
    </main>
  );
}
