"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SCHEMES, CATEGORY_LABELS, SchemeCategory } from "@/lib/schemes";

const TABS: (SchemeCategory | "all")[] = ["all", "funding", "schemes-programs", "startup-kit"];

export default function SchemesHubPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("all");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return SCHEMES.filter((s) => {
      const matchesTab = tab === "all" || s.category === tab;
      const matchesQuery =
        query.trim() === "" ||
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.tagline.toLowerCase().includes(query.toLowerCase());
      return matchesTab && matchesQuery;
    });
  }, [tab, query]);

  return (
    <main className="min-h-screen bg-white">
      <div className="bg-govblue-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-12 text-center">
          <h1 className="text-3xl font-bold">Explore Schemes</h1>
          <p className="mt-2 text-govblue-50/90">
            Browse every scheme and initiative under Startup Karnataka, grouped by category.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by category">
            {TABS.map((t) => (
              <button
                key={t}
                type="button"
                role="tab"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-govblue-700 ${
                  tab === t
                    ? "bg-govorange-500 border-govorange-500 text-white"
                    : "border-govgray-300 text-govgray-700 hover:bg-govgray-50"
                }`}
              >
                {t === "all" ? "All" : CATEGORY_LABELS[t]}
              </button>
            ))}
          </div>

          <div>
            <label htmlFor="scheme-search" className="sr-only">
              Search schemes
            </label>
            <input
              id="scheme-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search schemes…"
              className="rounded border border-govgray-300 px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-govblue-700"
            />
          </div>
        </div>

        <p aria-live="polite" className="text-sm text-govgray-700/70 mb-4">
          {filtered.length} scheme{filtered.length !== 1 ? "s" : ""} found
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <Link
              key={s.id}
              href={`/schemes/${s.id}`}
              className="block rounded-lg border border-govgray-200 bg-white overflow-hidden hover:shadow-md hover:border-govblue-700 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-govblue-700"
            >
              <div className="bg-govblue-900 px-4 py-3">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-govorange-500">
                  {CATEGORY_LABELS[s.category]}
                </span>
                <p className="text-white font-semibold text-sm mt-0.5">{s.name}</p>
              </div>
              <div className="p-4">
                <p className="text-sm text-govgray-700/80">{s.tagline}</p>
                <span className="mt-3 inline-block text-sm font-medium text-govblue-700">
                  {s.isExternal ? "Visit official site →" : "Read more →"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
