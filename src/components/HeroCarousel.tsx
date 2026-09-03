"use client";

import { useState } from "react";
import Link from "next/link";

type Slide = {
  eyebrow: string;
  description: string;
  posterTitle: string;
  bannerTag: string;
  href: string;
};

const SLIDES: Slide[] = [
  {
    eyebrow: "#KarnatakaLEAPS",
    description:
      "Karnataka is investing in six emerging clusters beyond Bengaluru, decentralising growth and building local innovation infrastructure.",
    posterTitle: "LEAP",
    bannerTag: "TRANSFORMING EMERGING CLUSTERS BEYOND BENGALURU",
    href: "/schemes/leap",
  },
  {
    eyebrow: "#RGEP",
    description:
      "A 12-month funded runway for Science & Engineering graduates with an early-stage idea and no company yet.",
    posterTitle: "RGEP",
    bannerTag: "APPLICATIONS FOR KARNATAKA'S SCIENCE & ENGINEERING GRADUATES",
    href: "/schemes/rgep",
  },
];

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];

  function go(delta: number) {
    setIndex((i) => (i + delta + SLIDES.length) % SLIDES.length);
  }

  return (
    <section className="bg-govblue-900 text-white">
      <div className="mx-auto max-w-6xl px-4 py-16 grid gap-8 md:grid-cols-2 items-center">
        {/* Left panel */}
        <div>
          <p className="text-govorange-500 font-bold text-sm">{slide.eyebrow}</p>
          <h1 className="mt-2 text-3xl md:text-4xl font-extrabold leading-tight">
            Find the Karnataka startup scheme that&apos;s actually built for you
          </h1>
          <p className="mt-4 text-white/90">{slide.description}</p>
          <div className="mt-6 flex gap-3 flex-wrap">
            <Link
              href={slide.href}
              className="rounded bg-govorange-500 hover:bg-govorange-600 px-6 py-3 font-semibold transition-colors"
            >
              Read More
            </Link>
            <Link
              href="/schemes"
              className="rounded border border-white/60 hover:bg-white/10 px-6 py-3 font-semibold transition-colors"
            >
              Explore All Schemes
            </Link>
          </div>
        </div>

        {/* Right panel — poster-style, no logo imagery */}
        <div className="rounded-lg bg-white/5 border border-white/15 p-8 text-center">
          <p className="text-5xl md:text-6xl font-black tracking-wide text-govorange-500">
            {slide.posterTitle}
          </p>
          <div className="mt-6 bg-govblue-700 px-4 py-2 rounded">
            <p className="text-xs md:text-sm font-bold tracking-wide">{slide.bannerTag}</p>
          </div>
        </div>
      </div>

      {/* Carousel controls */}
      <div className="flex items-center justify-center gap-4 pb-8">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous slide"
          className="h-8 w-8 rounded-full border border-white/40 hover:bg-white/10 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-govorange-500"
        >
          ‹
        </button>
        <div className="flex gap-2" role="tablist" aria-label="Slides">
          {SLIDES.map((s, i) => (
            <button
              key={s.posterTitle}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-2.5 w-2.5 rounded-full transition-colors ${
                i === index ? "bg-govorange-500" : "bg-white/30"
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next slide"
          className="h-8 w-8 rounded-full border border-white/40 hover:bg-white/10 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-govorange-500"
        >
          ›
        </button>
      </div>
    </section>
  );
}
