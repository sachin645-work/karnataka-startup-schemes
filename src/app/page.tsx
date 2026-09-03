"use client";

import { useEffect, useRef, useState } from "react";
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
  const [browseAllExpanded, setBrowseAllExpanded] = useState(false);
  const resultsRef = useRef<HTMLElement>(null);

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

  useEffect(() => {
    if (results) {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [results]);

  function handleUnderstandMeClick() {
    setShowFlow(true);
  }

  function handleComplete(answers: Answers) {
    const matches = matchSchemes(answers);
    setResults(matches);
    track("recommendations_shown", { count: matches.length });
  }

  function handleSearchAgain() {
    setResults(null);
    setShowFlow(true);
    setBrowseAllExpanded(false);
  }

  return (
    <main className="min-h-screen bg-navy-50/40">
      <section className="mx-auto max-w-4xl px-6 pt-16 pb-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-navy-950">
          Find the government schemes actually meant for you
        </h1>
        <p className="mt-4 text-navy-700 max-w-2xl mx-auto">
          For Karnataka student entrepreneurs with a working prototype. Skip the
          scattered portals — see which schemes apply to your stage, in one place.
        </p>

        {!results && (
          <>
            <button
              onClick={handleUnderstandMeClick}
              className="mt-8 rounded-lg bg-navy-900 px-6 py-3 text-white font-medium hover:bg-navy-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
            >
              Understand Me → find my matches
            </button>
            <p className="mt-2 text-xs text-navy-500">Takes about 2 minutes.</p>
          </>
        )}
      </section>

      <div className="mx-auto max-w-2xl px-6 pb-10">
        <div className="rounded-lg border border-navy-100 bg-white px-4 py-3 text-sm text-navy-700 flex gap-2">
          <span aria-hidden="true">ⓘ</span>
          <p>
            Built around Karnataka&apos;s Startup Policy 2025-30 and the central
            schemes most relevant to student founders. This is an independent
            discovery tool, not an official government platform — every scheme
            links out to its real official page, and applications happen there.
          </p>
        </div>
      </div>

      {showFlow && !results && (
        <section className="mx-auto max-w-md px-6 pb-16">
          <UnderstandMeFlow user={user} onComplete={handleComplete} />
        </section>
      )}

      {results && (
        <section ref={resultsRef} className="mx-auto max-w-5xl px-6 pb-10 scroll-mt-8">
          <div className="flex items-center justify-between gap-4 mb-1 flex-wrap">
            <h2 className="text-2xl font-bold text-navy-950">Schemes that match you</h2>
            <button
              onClick={handleSearchAgain}
              className="text-sm font-medium text-navy-700 hover:text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 rounded"
            >
              Search again
            </button>
          </div>
          <p aria-live="polite" className="text-sm text-navy-500 mb-6">
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
        {results ? (
          <button
            onClick={() => setBrowseAllExpanded((v) => !v)}
            className="text-sm font-medium text-navy-600 hover:text-navy-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 rounded"
          >
            {browseAllExpanded ? "Hide" : "Browse"} all {SCHEMES.length} schemes
          </button>
        ) : (
          <h2 className="text-xl font-semibold text-navy-950 mb-6">All schemes</h2>
        )}

        {(!results || browseAllExpanded) && (
          <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${results ? "mt-4" : ""}`}>
            {SCHEMES.map((scheme) => (
              <SchemeCard key={scheme.id} scheme={scheme} source="browse" />
            ))}
          </div>
        )}
      </section>

      <Chatbot />
    </main>
  );
}
