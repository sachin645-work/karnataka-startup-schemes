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
  return (
    <a
      href={scheme.officialUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("scheme_card_clicked", { scheme: scheme.name, source })}
      className="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-slate-300"
    >
      <h3 className="font-semibold text-slate-900">{scheme.name}</h3>
      <p className="mt-1 text-sm text-slate-600">{scheme.tagline}</p>
      {reason && (
        <p className="mt-3 text-sm text-emerald-700 bg-emerald-50 rounded-md px-3 py-2">
          {reason}
        </p>
      )}
      {scheme.unverifiedNote && (
        <p className="mt-2 text-xs text-amber-700">⚠ {scheme.unverifiedNote}</p>
      )}
      <span className="mt-3 inline-block text-sm font-medium text-slate-700">
        Read more →
      </span>
    </a>
  );
}
