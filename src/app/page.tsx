"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { SCHEMES, Answers, matchSchemes } from "@/lib/schemes";
import { track } from "@/lib/mixpanel";
import { SchemeCard } from "@/components/SchemeCard";
import { UnderstandMeFlow } from "@/components/UnderstandMeFlow";
import { Chatbot } from "@/components/Chatbot";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [showFlow, setShowFlow] = useState(false);
  const [results, setResults] = useState<{ scheme: (typeof SCHEMES)[number]; reason: string }[] | null>(
    null
  );

  useEffect(() => {
    track("page_view");
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => setUser(data.user));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        track("google_signin_completed");
        setShowFlow(true);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  function handleUnderstandMeClick() {
    setShowFlow(true);
    if (!user) return; // UnderstandMeFlow itself tracks the click before sign-in
  }

  function handleComplete(answers: Answers) {
    const matches = matchSchemes(answers);
    setResults(matches);
    track("recommendations_shown", { count: matches.length });
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="mx-auto max-w-4xl px-6 pt-16 pb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
          Find the government schemes actually meant for you
        </h1>
        <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
          For Karnataka student entrepreneurs with a working prototype. Skip the
          scattered portals — see which schemes apply to your stage, in one place.
        </p>
        <p className="mt-4 text-xs text-slate-500 max-w-xl mx-auto">
          This is an independent discovery tool, not an official government platform.
          All applications happen on the government&apos;s own site.
        </p>

        {!results && (
          <button
            onClick={handleUnderstandMeClick}
            className="mt-8 rounded-lg bg-slate-900 px-6 py-3 text-white font-medium hover:bg-slate-800"
          >
            Understand Me →
          </button>
        )}
      </section>

      {showFlow && !results && (
        <section className="mx-auto max-w-md px-6 pb-16">
          <UnderstandMeFlow user={user} onComplete={handleComplete} />
        </section>
      )}

      {results && (
        <section className="mx-auto max-w-5xl px-6 pb-16">
          <h2 className="text-xl font-semibold text-slate-900 mb-1">
            Schemes that match you
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            {results.length === 0
              ? "No current schemes match your answers."
              : `${results.length} scheme${results.length > 1 ? "s" : ""} found.`}
          </p>
          {results.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {results.map(({ scheme, reason }) => (
                <SchemeCard key={scheme.id} scheme={scheme} reason={reason} source="results" />
              ))}
            </div>
          )}
        </section>
      )}

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">
          All schemes
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SCHEMES.map((scheme) => (
            <SchemeCard key={scheme.id} scheme={scheme} source="browse" />
          ))}
        </div>
      </section>

      <Chatbot />
    </main>
  );
}
