"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSchemeById } from "@/lib/schemes";

const AUTO_ADVANCE_MS = 3000;

type Slide = {
  schemeId: string;
  eyebrow: string;
  description: string;
  posterTitle: string;
  bannerTag: string;
};

const SLIDES: Slide[] = [
  {
    schemeId: "leap",
    eyebrow: "#KarnatakaLEAPS",
    description:
      "Karnataka is investing in six emerging clusters beyond Bengaluru, decentralising growth and building local innovation infrastructure.",
    posterTitle: "LEAP",
    bannerTag: "TRANSFORMING EMERGING CLUSTERS BEYOND BENGALURU",
  },
  {
    schemeId: "rgep",
    eyebrow: "#RGEP",
    description:
      "A 12-month funded runway for Science & Engineering graduates with an early-stage idea and no company yet.",
    posterTitle: "RGEP",
    bannerTag: "APPLICATIONS FOR KARNATAKA'S SCIENCE & ENGINEERING GRADUATES",
  },
  {
    schemeId: "wescalate",
    eyebrow: "#WEscalate",
    description:
      "Two structured tracks, incubation and acceleration, built specifically for women-led startups in Biotech, AgriTech, MedTech, and Cleantech.",
    posterTitle: "WEscalate",
    bannerTag: "INCUBATION & ACCELERATION FOR WOMEN-LED STARTUPS",
  },
  {
    schemeId: "grand-challenges",
    eyebrow: "#GrandChallenges",
    description:
      "A challenge-based program funding real technology solutions to persistent public problems, open to startups at any stage.",
    posterTitle: "CHALLENGES",
    bannerTag: "SCOUTING TECH SOLUTIONS TO PUBLIC PROBLEMS",
  },
  {
    schemeId: "nain-2.0",
    eyebrow: "#NAIN2.0",
    description:
      "Funded innovation centres inside technology colleges outside Bengaluru Urban, giving students funding and mentorship on their own campus.",
    posterTitle: "NAIN 2.0",
    bannerTag: "50 INNOVATION CENTRES OUTSIDE BENGALURU",
  },
];

/** Pure, no client clock state needed: recomputed on each render, which is
 *  plenty for a day-granularity countdown that only changes via slide navigation. */
function daysUntil(deadlineDate?: string): number | null {
  if (!deadlineDate) return null;
  const msLeft = new Date(deadlineDate).getTime() - Date.now();
  return msLeft > 0 ? Math.ceil(msLeft / (1000 * 60 * 60 * 24)) : 0;
}

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const scheme = getSchemeById(slide.schemeId);
  const daysLeft = daysUntil(scheme?.deadlineDate);
  const href = scheme ? `/schemes/${scheme.id}` : "/schemes";

  function go(delta: number) {
    setIndex((i) => (i + delta + SLIDES.length) % SLIDES.length);
  }

  // Auto-advances every AUTO_ADVANCE_MS; restarts from whichever slide is current,
  // so a manual click (which also changes `index`) resets the countdown instead of
  // fighting it.
  useEffect(() => {
    const id = setTimeout(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, AUTO_ADVANCE_MS);
    return () => clearTimeout(id);
  }, [index]);

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-4 py-12 grid gap-8 md:grid-cols-2 items-center">
        {/* Left panel */}
        <div>
          <p className="text-govorange-500 font-bold text-sm">{slide.eyebrow}</p>
          <h1 className="mt-2 text-3xl md:text-4xl font-extrabold leading-tight text-govblue-900">
            {scheme?.name ?? slide.posterTitle}
          </h1>
          <p className="mt-4 text-govgray-700">{slide.description}</p>
          {daysLeft !== null && (
            <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-govpink-50 border border-govorange-500/40 px-3 py-1.5 text-xs font-semibold text-govorange-600">
              <span aria-hidden="true">⏳</span>
              {daysLeft > 0
                ? `Applications close in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`
                : "Applications close today"}
            </p>
          )}
          <div className="mt-6 flex gap-3 flex-wrap">
            <Link
              href={href}
              className="rounded bg-govorange-500 hover:bg-govorange-600 text-white px-6 py-3 font-semibold transition-colors"
            >
              Read More
            </Link>
            <Link
              href="/schemes"
              className="rounded border border-govblue-900 text-govblue-900 hover:bg-govgray-50 px-6 py-3 font-semibold transition-colors"
            >
              Explore All Schemes
            </Link>
          </div>
        </div>

        {/* Right panel, poster-style card, navy as an accent within the card, not the page */}
        <div className="rounded-lg bg-govblue-900 text-white p-8 text-center shadow-lg">
          <p className="text-[10px] tracking-widest uppercase text-white/60">
            Startup Ecosystem Portal
          </p>
          <p
            className={`mt-4 font-black tracking-wide text-govorange-500 ${
              slide.posterTitle.length > 6 ? "text-3xl md:text-4xl" : "text-5xl md:text-6xl"
            }`}
          >
            {slide.posterTitle}
          </p>
          <div className="mt-6 bg-govorange-500 px-4 py-2 rounded">
            <p className="text-xs md:text-sm font-bold tracking-wide text-white">{slide.bannerTag}</p>
          </div>
        </div>
      </div>

      {/* Carousel controls */}
      <div className="flex items-center justify-center gap-4 pb-8">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous slide"
          className="h-8 w-8 rounded-full border border-govgray-300 hover:bg-govgray-50 flex items-center justify-center text-govblue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-govorange-500"
        >
          ‹
        </button>
        <div className="flex gap-2" role="tablist" aria-label="Slides">
          {SLIDES.map((s, i) => (
            <button
              key={s.schemeId}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2.5 w-2.5 rounded-full transition-colors ${
                i === index ? "bg-govorange-500" : "bg-govgray-300"
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next slide"
          className="h-8 w-8 rounded-full border border-govgray-300 hover:bg-govgray-50 flex items-center justify-center text-govblue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-govorange-500"
        >
          ›
        </button>
      </div>
    </section>
  );
}
