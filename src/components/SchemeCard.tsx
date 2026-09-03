"use client";

import { Scheme } from "@/lib/schemes";
import { track } from "@/lib/mixpanel";

export function SchemeCard({
  scheme,
  reason,
  source,
}: {
  scheme: Scheme;
  reason?: string;
  source: "browse" | "results";
}) {
  const matched = Boolean(reason);

  return (
    <a
      href={scheme.officialUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("scheme_card_clicked", { scheme: scheme.name, source })}
      className={`block rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 ${
        matched
          ? "border-gold-500 border-l-4 hover:border-gold-600"
          : "border-navy-100 hover:border-navy-300"
      }`}
    >
      {matched && (
        <span className="mb-2 inline-block rounded-full bg-gold-100 px-2 py-0.5 text-xs font-medium text-gold-700">
          Matches you
        </span>
      )}
      <h3 className="font-semibold text-navy-950">{scheme.name}</h3>
      <p className="mt-1 text-sm text-navy-700/80">{scheme.tagline}</p>
      {reason && (
        <p className="mt-3 text-sm text-navy-800 bg-navy-50 rounded-md px-3 py-2">
          {reason}
        </p>
      )}
      {scheme.unverifiedNote && (
        <p className="mt-2 text-xs text-navy-500">ⓘ {scheme.unverifiedNote}</p>
      )}
      <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-navy-700">
        Read more
        <svg
          aria-hidden="true"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M7 17L17 7M17 7H8M17 7V16" />
        </svg>
        <span className="sr-only">(opens the official page in a new tab)</span>
      </span>
    </a>
  );
}
