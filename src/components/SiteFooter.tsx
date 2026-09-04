"use client";

import { SOURCE_URL, DATA_LAST_VERIFIED } from "@/lib/schemes";

export function SiteFooter() {
  return (
    <footer className="bg-govblue-900 text-white mt-auto">
      <div className="mx-auto max-w-6xl px-4 py-10 grid gap-8 sm:grid-cols-3 text-sm">
        <div>
          <p className="font-semibold mb-2">Before You Apply</p>
          <p className="text-white/70">
            Confirm eligibility, deadlines, and funding details on the scheme&apos;s official
            page before applying.
          </p>
        </div>
        <div>
          <p className="font-semibold mb-2">Preview pages</p>
          <ul className="space-y-1 text-white/70">
            {["Copyright Policy", "Terms & Conditions", "Privacy Policy", "Sitemap"].map((p) => (
              <li key={p}>
                <a href="#" onClick={(e) => e.preventDefault()} title="Preview only" className="hover:underline">
                  {p}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold mb-2">Source</p>
          <p className="text-white/70">
            Scheme details reflect the{" "}
            <a href={SOURCE_URL} target="_blank" rel="noopener noreferrer" className="text-govorange-500 hover:underline">
              Startup Karnataka portal
            </a>{" "}
            as of the date below.
          </p>
          <p className="mt-2 text-white/50 text-xs">Data last checked: {DATA_LAST_VERIFIED}</p>
        </div>
      </div>
      <div className="bg-govorange-500 text-white text-xs px-4 py-2 flex flex-wrap gap-4 justify-center">
        <span>Last Updated: {DATA_LAST_VERIFIED}</span>
        <span>Version: preview-1.0</span>
      </div>
      <div className="border-t border-white/10 py-3 text-center text-xs text-white/60">
        © 2026 Karnataka Startup Schemes.
      </div>
    </footer>
  );
}
