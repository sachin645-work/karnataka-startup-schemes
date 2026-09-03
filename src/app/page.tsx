"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import {
  SCHEMES,
  Answers,
  classifySchemes,
  COVERED_STATES,
  SCHEME_DATA_LAST_VERIFIED,
} from "@/lib/schemes";
import { track } from "@/lib/mixpanel";
import { SchemeCard } from "@/components/SchemeCard";
import { ProfileStrip } from "@/components/ProfileStrip";
import { Chatbot } from "@/components/Chatbot";

const REQUIRED_FIELDS: (keyof Answers)[] = [
  "state",
  "isIndianCitizen",
  "age",
  "studentStatus",
  "hasPrototype",
  "dpiitStatus",
  "hasRevenue",
];

function isComplete(draft: Partial<Answers>): draft is Answers {
  return REQUIRED_FIELDS.every((f) => draft[f] !== undefined);
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [showFlow, setShowFlow] = useState(false);
  const [draft, setDraft] = useState<Partial<Answers>>({});
  const [notApplicableExpanded, setNotApplicableExpanded] = useState(false);

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

  const complete = isComplete(draft);
  const results = complete ? classifySchemes(draft) : null;

  useEffect(() => {
    if (results) {
      track("recommendations_shown", {
        now: results.now.length,
        later: results.later.length,
        not_applicable: results.notApplicable.length,
      });
    }
    // Only fire when the profile just became complete / changes while complete.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complete, draft.state, draft.isIndianCitizen, draft.age, draft.studentStatus, draft.hasPrototype, draft.dpiitStatus, draft.hasRevenue]);

  const stateNotCovered = draft.state && !COVERED_STATES.includes(draft.state);

  return (
    <main className="min-h-screen bg-navy-50/30">
      {/* Persistent independence disclaimer — stays visible while scrolling. */}
      <div className="sticky top-0 z-40 border-b border-navy-100 bg-navy-50 px-4 py-2 text-sm text-navy-800">
        <div className="mx-auto flex max-w-5xl items-start gap-2">
          <span aria-hidden="true">ⓘ</span>
          <p>
            This is an independent discovery tool, not an official government
            platform. Every scheme links out to its real official page, and
            applications happen there — never here.
          </p>
        </div>
      </div>

      <section className="mx-auto max-w-4xl px-6 pt-14 pb-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-navy-950">
          Find the government schemes actually meant for you
        </h1>
        <p className="mt-4 text-navy-700 max-w-2xl mx-auto">
          For Karnataka student entrepreneurs, from a first idea to an
          incorporated company. Skip the scattered portals — see which
          schemes apply to your stage, right now.
        </p>

        {!showFlow && (
          <>
            <button
              type="button"
              onClick={() => setShowFlow(true)}
              className="mt-8 rounded-lg bg-navy-600 px-6 py-3 text-white font-medium hover:bg-navy-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-600"
            >
              Understand Me → find my matches
            </button>
            <p className="mt-2 text-xs text-navy-500">Takes about 2 minutes.</p>
          </>
        )}
      </section>

      {showFlow && (
        <section className="mx-auto max-w-2xl px-6 pb-8">
          <h2 className="text-lg font-semibold text-navy-950 mb-3">Your profile</h2>
          <ProfileStrip user={user} onChange={setDraft} />
        </section>
      )}

      {showFlow && user && (
        <section className="mx-auto max-w-5xl px-6 pb-10" aria-live="polite">
          {!complete ? (
            <p className="text-sm text-navy-500 border border-dashed border-navy-200 rounded-lg p-6 text-center">
              Answer the questions above to see which schemes are a Now, a
              Later, or don&apos;t apply to you.
            </p>
          ) : (
            <>
              {stateNotCovered && (
                <p className="mb-6 rounded-lg border border-navy-100 bg-navy-50 px-4 py-3 text-sm text-navy-700">
                  We currently index Karnataka&apos;s state schemes plus the
                  national ones. {draft.state} state-specific schemes
                  aren&apos;t indexed yet — you&apos;ll still see every
                  national scheme you qualify for below.
                </p>
              )}

              <div className="mb-10">
                <h2 className="text-2xl font-bold text-navy-950 mb-1">Now</h2>
                <p className="text-sm text-navy-500 mb-4">
                  {results!.now.length === 0
                    ? "Nothing matches right now."
                    : `${results!.now.length} scheme${results!.now.length > 1 ? "s" : ""} you qualify for today.`}
                </p>
                {results!.now.length > 0 && (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {results!.now.map(({ scheme, reason }) => (
                      <SchemeCard key={scheme.id} scheme={scheme} status="now" reason={reason} source="results" />
                    ))}
                  </div>
                )}
              </div>

              <div className="mb-10">
                <h2 className="text-lg font-semibold text-navy-800 mb-1">Later</h2>
                <p className="text-sm text-navy-500 mb-4">
                  {results!.later.length === 0
                    ? "Nothing pending unlock."
                    : `${results!.later.length} scheme${results!.later.length > 1 ? "s" : ""} you could grow into.`}
                </p>
                {results!.later.length > 0 && (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {results!.later.map(({ scheme, reason }) => (
                      <SchemeCard key={scheme.id} scheme={scheme} status="later" reason={reason} source="results" />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setNotApplicableExpanded((v) => !v)}
                  className="text-sm font-medium text-navy-500 hover:text-navy-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-600 rounded"
                >
                  {notApplicableExpanded ? "Hide" : "Show"} {results!.notApplicable.length} scheme
                  {results!.notApplicable.length !== 1 ? "s" : ""} that don&apos;t apply to you
                </button>
                {notApplicableExpanded && (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {results!.notApplicable.map(({ scheme, reason }) => (
                      <SchemeCard
                        key={scheme.id}
                        scheme={scheme}
                        status="not_applicable"
                        reason={reason}
                        source="results"
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      )}

      {!showFlow && (
        <section className="mx-auto max-w-5xl px-6 pb-24">
          <h2 className="text-xl font-semibold text-navy-950 mb-6">All schemes</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SCHEMES.map((scheme) => (
              <SchemeCard key={scheme.id} scheme={scheme} source="browse" />
            ))}
          </div>
        </section>
      )}

      <footer className="mx-auto max-w-5xl px-6 pb-10 pt-4 text-center text-xs text-navy-400">
        Scheme data last verified: {SCHEME_DATA_LAST_VERIFIED}
      </footer>

      <Chatbot />
    </main>
  );
}
