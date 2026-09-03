import Link from "next/link";
import { SCHEMES, getSchemeById } from "@/lib/schemes";

const POLICY_PILLARS = [
  { title: "Infrastructure", desc: "Growing physical and institutional infrastructure, with a deliberate push into regions beyond Bengaluru." },
  { title: "Student ecosystem", desc: "Giving students across every stream real chances to build and test entrepreneurial skills, not just study them." },
  { title: "Growth of startups", desc: "Aiming to grow the base of startups in the state and help more of them become genuine high-growth companies." },
  { title: "Innovative technology", desc: "Encouraging tech solutions aimed squarely at social and environmental challenges, not just commercial ones." },
  { title: "Incubation & acceleration", desc: "Building the incubation and acceleration infrastructure that turns early ideas into fundable companies." },
  { title: "Funding avenues", desc: "Opening more paths to capital, from government grants to institutional and angel investment." },
];

const IMPACT_STATS = [
  { value: "Best Performer", label: "States' Startup Ranking, 4th Edition" },
  { value: "₹170+ Cr", label: "Support disbursed to startups" },
  { value: "40+", label: "Unicorns" },
  { value: "14", label: "Centres of Excellence" },
];

const HERO_SCHEME_IDS = ["leap", "rgep"];

export default function Home() {
  const heroSchemes = HERO_SCHEME_IDS.map((id) => getSchemeById(id)!);

  return (
    <>
      {/* Hero — original layout, real CTAs to real scheme pages */}
      <section className="bg-govblue-900 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 grid gap-8 md:grid-cols-2 items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold leading-tight">
              Find the Karnataka startup scheme that&apos;s actually built for you
            </h1>
            <p className="mt-4 text-govblue-50/90">
              An independent, unofficial guide to every scheme and program under Startup
              Karnataka — browse by category, check real eligibility criteria, and go straight
              to the official page to apply.
            </p>
            <Link
              href="/schemes"
              className="mt-6 inline-block rounded bg-govorange-500 hover:bg-govorange-600 px-6 py-3 font-semibold transition-colors"
            >
              Explore Schemes →
            </Link>
          </div>
          <div className="space-y-3">
            {heroSchemes.map((s) => (
              <Link
                key={s.id}
                href={`/schemes/${s.id}`}
                className="block rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 p-4 transition-colors"
              >
                <p className="font-bold">{s.name}</p>
                <p className="text-sm text-govblue-50/80 mt-1">{s.tagline}</p>
                <span className="text-xs text-govorange-500 font-semibold mt-2 inline-block">
                  Read more →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-4 py-14 text-center">
          <p className="text-govorange-500 font-semibold text-sm uppercase tracking-wide">About</p>
          <h2 className="mt-2 text-2xl font-bold text-govblue-900">
            A single place to make sense of Karnataka&apos;s startup schemes
          </h2>
          <p className="mt-4 text-govgray-700 leading-relaxed">
            Karnataka runs a genuinely large number of startup schemes and programs, spread
            across funding, incubation, and market-access tracks — but they live on separate
            pages with separate eligibility rules. This site pulls them into one place so you
            can see what actually applies to you, in plain language, before heading to the
            official source to apply.
          </p>
        </div>
      </section>

      {/* Policy pillars */}
      <section className="bg-govgray-50">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-2xl font-bold text-govblue-900 text-center mb-2">
            Karnataka Startup Policy 2025-30 — Pillars
          </h2>
          <p className="text-center text-govgray-700/70 mb-8 max-w-2xl mx-auto">
            The state&apos;s current startup policy is organised around six pillars — most
            schemes on this site map to one or more of them.
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {POLICY_PILLARS.map((p) => (
              <div key={p.title} className="rounded border border-govgray-200 bg-white p-5">
                <p className="font-bold text-govblue-800">{p.title}</p>
                <p className="mt-1 text-sm text-govgray-700/80">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Initiatives preview strip (static, per scope) */}
      <section className="bg-govorange-500 text-white">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="text-2xl font-bold text-center">Initiatives under Startup Karnataka</h2>
          <p className="text-center text-white/85 mt-2 mb-8">A preview of what&apos;s available — see the full list on the Schemes page.</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SCHEMES.slice(0, 4).map((s) => (
              <div key={s.id} className="rounded-lg bg-white text-govgray-700 overflow-hidden">
                <div className="bg-govblue-900 text-white px-4 py-6 text-center">
                  <p className="font-extrabold text-lg">{s.name.split("(")[0].trim()}</p>
                </div>
                <div className="p-4">
                  <p className="text-xs text-govgray-700/80">{s.tagline}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/schemes" className="inline-block rounded bg-govblue-900 hover:bg-govblue-800 px-6 py-3 font-semibold transition-colors">
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
                <p className="text-xl md:text-2xl font-extrabold text-govblue-900">{s.value}</p>
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
