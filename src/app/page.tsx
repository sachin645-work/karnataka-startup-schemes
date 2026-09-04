import Link from "next/link";
import { SCHEMES } from "@/lib/schemes";
import { HeroCarousel } from "@/components/HeroCarousel";
import { PosterCard } from "@/components/PosterCard";

const POLICY_PILLARS = [
  { icon: "🏛", title: "Infrastructure", desc: "Growing physical and institutional infrastructure, with a deliberate push into regions beyond Bengaluru." },
  { icon: "👥", title: "Student ecosystem", desc: "Giving students across every stream real chances to build and test entrepreneurial skills, not just study them." },
  { icon: "⬆", title: "Growth of startups", desc: "Aiming to grow the base of startups in the state and help more of them become genuine high-growth companies." },
  { icon: "🚀", title: "Innovative technology", desc: "Encouraging tech solutions aimed squarely at social and environmental challenges, not just commercial ones." },
  { icon: "🤝", title: "Incubation & acceleration", desc: "Building the incubation and acceleration infrastructure that turns early ideas into fundable companies." },
  { icon: "💰", title: "Funding avenues", desc: "Opening more paths to capital, from government grants to institutional and angel investment." },
];

const IMPACT_STATS = [
  { icon: "👥", value: "Best Performer", label: "States' Startup Ranking, 4th Edition" },
  { icon: "🚀", value: "₹170+ Cr", label: "Support disbursed to startups" },
  { icon: "⭐", value: "40+", label: "Unicorns" },
  { icon: "🏛", value: "14", label: "Centres of Excellence" },
];

export default function Home() {
  return (
    <>
      <HeroCarousel />

      {/* About */}
      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-4 py-14 text-center">
          <p className="text-govorange-500 font-semibold text-sm uppercase tracking-wide">About</p>
          <h2 className="mt-2 text-2xl font-bold text-govblue-900">
            Karnataka&apos;s startup ecosystem, at a glance
          </h2>
          <p className="mt-4 text-govgray-700 leading-relaxed">
            Karnataka runs a wide range of startup schemes and programs, spanning funding,
            incubation, and market-access support, each with its own eligibility rules and
            application process. Together they cover everything from a first idea to a
            growth-stage venture scaling up.
          </p>
        </div>
      </section>

      {/* Policy pillars */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-2xl font-bold text-govblue-900 text-center mb-2">
            Karnataka Startup Policy 2025-30, Pillars
          </h2>
          <p className="text-center text-govgray-700/70 mb-8 max-w-2xl mx-auto">
            The state&apos;s current startup policy is organised around six pillars, and most
            schemes map to one or more of them.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {POLICY_PILLARS.map((p) => (
              <div key={p.title} className="rounded border border-govgray-300 bg-white p-5">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-govorange-500 text-white text-base" aria-hidden="true">
                  {p.icon}
                </span>
                <p className="mt-3 font-bold text-govblue-900">{p.title}</p>
                <p className="mt-1 text-sm text-govgray-700/80">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Initiatives preview strip, poster-style cards, static per scope */}
      <section className="bg-white border-t border-govgray-300">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-2xl font-bold text-center text-govblue-900">Initiatives under Startup Karnataka</h2>
          <p className="text-center text-govgray-700/70 mt-2 mb-10">
            A snapshot of what&apos;s available, see the full list on the Schemes page.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {SCHEMES.slice(0, 4).map((s) => (
              <PosterCard
                key={s.id}
                href={s.isExternal ? s.officialUrl : `/schemes/${s.id}`}
                isExternal={s.isExternal}
                icon="⚡"
                posterTitle={s.name.split("(")[0].trim()}
                categoryLabel="Startup Karnataka"
                tagline={s.tagline}
              />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/schemes" className="inline-block rounded bg-govorange-500 hover:bg-govorange-600 text-white px-6 py-3 font-semibold transition-colors">
              View all schemes →
            </Link>
          </div>
        </div>
      </section>

      {/* Impact stats */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-xl font-semibold text-govblue-900 text-center mb-8">
            Karnataka&apos;s startup ecosystem, in numbers
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {IMPACT_STATS.map((s) => (
              <div key={s.label} className="rounded-lg bg-govpink-50 p-5 text-center">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-govblue-900 text-white text-lg" aria-hidden="true">
                  {s.icon}
                </span>
                <p className="mt-3 text-xl md:text-2xl font-extrabold text-govblue-900">{s.value}</p>
                <p className="mt-1 text-xs text-govgray-700/70">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-govgray-700/50">
            Figures as published on the official Startup Karnataka portal.
          </p>
        </div>
      </section>
    </>
  );
}
