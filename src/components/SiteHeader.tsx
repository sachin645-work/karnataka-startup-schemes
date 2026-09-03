"use client";

import { useState } from "react";
import Link from "next/link";
import { SCHEMES, CATEGORY_LABELS, SchemeCategory } from "@/lib/schemes";

const CATEGORIES: SchemeCategory[] = ["funding", "schemes-programs", "startup-kit"];
const NAV_ITEMS = ["Department", "About Us", "Resources", "Notifications"];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [initiativesOpen, setInitiativesOpen] = useState(false);

  return (
    <header>
      {/* Utility bar */}
      <div className="bg-[#1a1a1a] text-white text-xs">
        <div className="mx-auto max-w-6xl px-4 py-1.5 flex items-center justify-between">
          <span className="opacity-70">Preview build · not the official portal</span>
          <div className="flex items-center gap-3 opacity-80">
            <span>EN | ಕನ್ನಡ</span>
            <button type="button" className="hover:underline">A-</button>
            <button type="button" className="hover:underline">A+</button>
          </div>
        </div>
      </div>

      {/* Masthead — original identity, no government emblem/wordmark */}
      <div className="border-b border-govgray-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-govblue-900 text-white flex items-center justify-center font-bold text-lg">
            K
          </div>
          <div>
            <p className="font-extrabold text-govblue-900 leading-tight">Karnataka Startup Schemes</p>
            <p className="text-xs text-govgray-700/70 leading-tight">
              Independent, unofficial guide — not a government service
            </p>
          </div>
        </div>
      </div>

      {/* Sticky primary nav */}
      <nav className="sticky top-0 z-40 bg-govorange-500 text-white shadow">
        <div className="mx-auto max-w-6xl px-4 flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm">
            <Link href="/" className="py-3 px-3 -mx-1 hover:bg-govorange-600 transition-colors font-semibold">
              Home
            </Link>

            <div
              className="relative"
              onMouseEnter={() => setInitiativesOpen(true)}
              onMouseLeave={() => setInitiativesOpen(false)}
            >
              <button
                type="button"
                onClick={() => setInitiativesOpen((v) => !v)}
                aria-expanded={initiativesOpen}
                className="py-3 px-3 hover:bg-govorange-600 transition-colors font-semibold"
              >
                Initiatives ▾
              </button>
              {initiativesOpen && (
                <div className="absolute left-0 top-full w-[560px] max-w-[90vw] bg-white text-govgray-700 shadow-xl border border-govgray-200 rounded-b grid grid-cols-3 gap-4 p-5">
                  {CATEGORIES.map((cat) => (
                    <div key={cat}>
                      <p className="font-bold text-govblue-900 text-sm mb-2">{CATEGORY_LABELS[cat]}</p>
                      <ul className="space-y-1.5">
                        {SCHEMES.filter((s) => s.category === cat).map((s) => (
                          <li key={s.id}>
                            {s.isExternal ? (
                              <a
                                href={s.officialUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs hover:text-govblue-700 hover:underline"
                              >
                                {s.name} ↗
                              </a>
                            ) : (
                              <Link
                                href={`/schemes/${s.id}`}
                                className="text-xs hover:text-govblue-700 hover:underline"
                              >
                                {s.name}
                              </Link>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {NAV_ITEMS.map((item) => (
              <a
                key={item}
                href="#"
                onClick={(e) => e.preventDefault()}
                title="Preview only"
                className="py-3 px-3 hover:bg-govorange-600 transition-colors hidden md:inline-block"
              >
                {item}
              </a>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label="Toggle menu"
            className="md:hidden py-3 px-2"
          >
            ☰
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-govorange-600 px-4 py-3 flex flex-col gap-2 text-sm">
            {NAV_ITEMS.map((item) => (
              <a key={item} href="#" onClick={(e) => e.preventDefault()} title="Preview only">
                {item}
              </a>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
