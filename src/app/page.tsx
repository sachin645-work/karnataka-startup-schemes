"use client";

import { useRef } from "react";
import { SOURCE_URL, DATA_LAST_VERIFIED, SCHEMES } from "@/lib/schemes";
import { ChatWidget, ChatWidgetHandle } from "@/components/ChatWidget";

const NAV_ITEMS = ["Home", "About", "Initiatives", "Resources", "Notifications"];

const POLICY_PILLARS = [
  { title: "Infrastructure", desc: "Incubators, co-working spaces, and physical infrastructure for founders." },
  { title: "Student ecosystem", desc: "Programs built for students and campus-based innovation." },
  { title: "Growth of startups", desc: "Grant-in-aid and acceleration support at scale-up stage." },
  { title: "Innovative technology", desc: "DeepTech, AI/ML, and emerging-tech focused support." },
  { title: "Incubation & acceleration", desc: "Cohort-based programs pairing founders with mentors." },
  { title: "Funding avenues", desc: "Seed capital, grants, and market access routes." },
];

const IMPACT_STATS = [
  { value: "40+", label: "Unicorns" },
  { value: "₹170+ Cr", label: "Support to startups" },
  { value: "14", label: "Centres of Excellence" },
  { value: "14,000+", label: "DPIIT-registered startups" },
];

const INITIATIVE_HIGHLIGHTS = SCHEMES.filter((s) =>
  ["nain-2.0", "elevate-2026", "preferential-market-access", "wescalate"].includes(s.id)
);

export default function Home() {
  const chatRef = useRef<ChatWidgetHandle>(null);

  return (
    <main className="min-h-screen flex flex-col">
      {/* Utility bar — styled after the reference site, non-functional preview links */}
      <div className="bg-govblue-900 text-white text-xs">
        <div className="mx-auto max-w-6xl px-4 py-1.5 flex items-center justify-between">
          <span className="opacity-80">Preview · not the official site</span>
          <div className="flex items-center gap-4 opacity-80">
            <span>EN | ಕನ್ನಡ</span>
            <span>Accessibility</span>
            <span>A+ A-</span>
          </div>
        </div>
      </div>

      {/* Masthead — original branding, no government seal/CM/minister imagery */}
      <div className="border-b border-govgray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-govblue-700 text-white flex items-center justify-center font-bold text-lg">
              A
            </div>
            <div>
              <p className="font-semibold text-govblue-900 leading-tight">Ankura</p>
              <p className="text-xs text-govgray-700/70 leading-tight">
                Independent Startup Scheme Discovery
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Primary nav — preview only, not wired to real pages */}
      <nav className="bg-govblue-700 text-white">
        <div className="mx-auto max-w-6xl px-4 flex gap-6 text-sm">
          {NAV_ITEMS.map((item) => (
            <a
              key={item}
              href="#"
              onClick={(e) => e.preventDefault()}
              className="py-3 hover:bg-govblue-800 px-2 -mx-2 transition-colors"
              title="Preview only"
            >
              {item}
            </a>
          ))}
        </div>
      </nav>

      {/* Hero — the one genuinely functional entry point */}
      <section className="bg-gradient-to-br from-govblue-900 to-govblue-700 text-white">
        <div className="mx-auto max-w-6xl px-4 py-20 text-center">
          <h1 className="text-3xl md:text-5xl font-bold max-w-3xl mx-auto">
            Find the Karnataka startup scheme that&apos;s actually yours
          </h1>
          <p className="mt-4 max-w-xl mx-auto text-govblue-50/90">
            Ankura asks a few natural questions, then points you to the real
            schemes on the Startup Karnataka portal you&apos;re likely
            eligible for.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => chatRef.current?.open()}
              className="rounded bg-govorange-500 hover:bg-govorange-600 px-6 py-3 font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Start chatting →
            </button>
            <a
              href="#about"
              className="rounded border border-white/60 px-6 py-3 font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Learn more
            </a>
          </div>
        </div>
      </section>

      {/* About band — replaces the reference site's minister-quote section
          with original content, since we don't reproduce officials'
          photos/quotes */}
      <section id="about" className="bg-white">
        <div className="mx-auto max-w-3xl px-4 py-14 text-center">
          <h2 className="text-2xl font-bold text-govblue-900">About Ankura</h2>
          <p className="mt-4 text-govgray-700">
            Ankura is a small, independent project — not a government
            service, and not affiliated with the Government of Karnataka in
            any way. It exists to make one thing easier: figuring out which
            of the many real Startup Karnataka schemes actually apply to
            you, without reading through a dozen separate pages first.
          </p>
        </div>
      </section>

      {/* Policy pillars — factual categories from the real Karnataka
          Startup Policy 2025-30, shown as static preview cards */}
      <section className="bg-govgray-50">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-2xl font-bold text-govblue-900 text-center mb-8">
            Karnataka Startup Policy 2025-30 — Pillars
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {POLICY_PILLARS.map((p) => (
              <div key={p.title} className="rounded border border-govgray-200 bg-white p-5">
                <p className="font-semibold text-govblue-800">{p.title}</p>
                <p className="mt-1 text-sm text-govgray-700/80">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Initiatives grid — real schemes, real links out to the official site */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-2xl font-bold text-govblue-900 text-center mb-8">
            Initiatives under Startup Karnataka
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {INITIATIVE_HIGHLIGHTS.map((s) => (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded border border-govgray-200 p-4 hover:border-govblue-700 hover:shadow-sm transition-all"
              >
                <p className="font-semibold text-govblue-800 text-sm">{s.name}</p>
                <p className="mt-1 text-xs text-govgray-700/70">{s.tagline}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Impact stats — real, public figures cited from the official site */}
      <section className="bg-govblue-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-xl font-semibold text-center mb-8">
            Karnataka&apos;s startup ecosystem, in numbers
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {IMPACT_STATS.map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-bold text-govorange-500">{s.value}</p>
                <p className="mt-1 text-sm text-govblue-50/80">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-xs text-govblue-50/60">
            Figures as published on the official Startup Karnataka portal.
          </p>
        </div>
      </section>

      {/* Footer — multi-column, matching the reference site's structure */}
      <footer className="bg-govgray-50 border-t border-govgray-200 mt-auto">
        <div className="mx-auto max-w-6xl px-4 py-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 text-sm">
          <div>
            <p className="font-semibold text-govblue-900 mb-2">Ankura</p>
            <p className="text-govgray-700/80">
              Independent, unofficial discovery tool. Not a government
              service, and not affiliated with the Government of Karnataka.
            </p>
          </div>
          <div>
            <p className="font-semibold text-govblue-900 mb-2">Preview pages</p>
            <ul className="space-y-1 text-govgray-700/80">
              {["Department", "About Us", "Resources", "Grievances"].map((p) => (
                <li key={p}>
                  <a href="#" onClick={(e) => e.preventDefault()} title="Preview only" className="hover:underline">
                    {p}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold text-govblue-900 mb-2">Source</p>
            <p className="text-govgray-700/80">
              All scheme data is sourced from the official{" "}
              <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer" className="text-govblue-700 hover:underline">
                Startup Karnataka portal
              </a>
              .
            </p>
            <p className="mt-2 text-govgray-700/60 text-xs">
              Data last checked: {DATA_LAST_VERIFIED}
            </p>
          </div>
          <div>
            <p className="font-semibold text-govblue-900 mb-2">Always verify</p>
            <p className="text-govgray-700/80 text-xs">
              Nothing here is a guarantee of eligibility or an application.
              Always confirm on the official page before relying on any
              result.
            </p>
          </div>
        </div>
        <div className="border-t border-govgray-200 py-4 text-center text-xs text-govgray-700/60">
          © 2026 Ankura — an independent project, unaffiliated with any government body.
        </div>
      </footer>

      <ChatWidget ref={chatRef} />
    </main>
  );
}
