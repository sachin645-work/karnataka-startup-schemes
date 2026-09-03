"use client";

import { Scheme, Classification } from "@/lib/schemes";
import { track } from "@/lib/mixpanel";

export function SchemeCard({
  scheme,
  status,
  reason,
  source,
}: {
  scheme: Scheme;
  /** Omit for the plain pre-signin browse view (no classification yet). */
  status?: Classification;
  /** "now": why it matches. "later": what would unlock it. "not_applicable": why it never will. */
  reason?: string;
  source: "browse" | "results";
}) {
  return (
    <a
      href={scheme.officialUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("scheme_card_clicked", { scheme: scheme.name, source, status })}
      className={`block rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-600 ${
        status === "now"
          ? "border-navy-600 border-l-4 hover:border-navy-700"
          : "border-navy-100 hover:border-navy-300"
      } ${status === "not_applicable" ? "opacity-80" : ""}`}
    >
      <h3 className="font-semibold text-navy-950">{scheme.name}</h3>
      <p className="mt-1 text-sm text-navy-700/80">{scheme.tagline}</p>

      {status === "now" && reason && (
        <p className="mt-3 text-sm text-navy-800 bg-navy-50 rounded-md px-3 py-2">
          <span className="font-medium">Why it matches: </span>
          {reason}
        </p>
      )}
      {status === "later" && reason && (
        <p className="mt-3 text-sm text-navy-700 bg-navy-50/60 rounded-md px-3 py-2">
          <span className="font-medium">What unlocks this: </span>
          {reason}
        </p>
      )}
      {status === "not_applicable" && reason && (
        <p className="mt-3 text-sm text-navy-500">
          <span className="font-medium">Why not: </span>
          {reason}
        </p>
      )}

      {scheme.unverifiedNote && (
        <p className="mt-2 flex items-start gap-1 text-xs text-maroon-700">
          <span aria-hidden="true">⚠</span>
          <span>{scheme.unverifiedNote}</span>
        </p>
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
