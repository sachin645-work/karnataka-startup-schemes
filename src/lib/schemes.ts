export type StudentStatus = "enrolled" | "graduated" | "not_student";
export type DpiitStatus = "not_registered" | "registered_not_dpiit" | "dpiit_recognized";

export type Answers = {
  state: string;
  isIndianCitizen: boolean;
  age: number;
  studentStatus: StudentStatus;
  hasPrototype: boolean;
  dpiitStatus: DpiitStatus;
  hasRevenue: boolean;
};

export type Scheme = {
  id: string;
  name: string;
  tagline: string;
  officialUrl: string;
  /** Facts pulled from secondary research and not yet confirmed against the
   * official source. Shown to the user so unverified figures are never
   * presented as settled fact. */
  unverifiedNote?: string;
  filters: {
    requireState?: string;
    requireCitizenIndia?: boolean;
    minAge?: number;
    maxAge?: number;
    allowedStudentStatus?: StudentStatus[];
    requiresPrototype?: boolean;
    allowedDpiitStatus?: DpiitStatus[];
    requiresNoRevenue?: boolean;
  };
  reason: (a: Answers) => string;
};

/** Every filter key that can appear on a Scheme, kept as a single source of
 * truth so the "does the checker read every key" test can't drift from the
 * actual Scheme type without also updating the test. */
export const FILTER_KEYS = [
  "requireState",
  "requireCitizenIndia",
  "minAge",
  "maxAge",
  "allowedStudentStatus",
  "requiresPrototype",
  "allowedDpiitStatus",
  "requiresNoRevenue",
] as const satisfies readonly (keyof Scheme["filters"])[];

export const SCHEME_DATA_LAST_VERIFIED = "2026-09-02";

export const SCHEMES: Scheme[] = [
  {
    id: "nidhi-prayas",
    name: "NIDHI-PRAYAS",
    tagline: "Ideation-to-prototype grant, applied through a NIDHI-supported incubator.",
    officialUrl: "https://nidhi.dst.gov.in/prayas",
    unverifiedNote: "Exact current funding cap varies by source — confirm on the official page before relying on it.",
    filters: {
      requireCitizenIndia: true,
      allowedDpiitStatus: ["not_registered", "registered_not_dpiit"],
    },
    reason: () =>
      "You're an Indian citizen who hasn't been DPIIT-recognized yet — PRAYAS is built for exactly this pre-registration prototyping stage.",
  },
  {
    id: "nidhi-eir",
    name: "NIDHI Entrepreneur-in-Residence (EIR)",
    tagline: "A stipend to work full-time on your idea before you register a company.",
    officialUrl: "https://nidhi.dst.gov.in/eir",
    unverifiedNote: "Exact stipend range varies by source — confirm on the official page before relying on it.",
    filters: {
      requireCitizenIndia: true,
      allowedDpiitStatus: ["not_registered"],
    },
    reason: () =>
      "You're not registered as a company yet — EIR is a fellowship made specifically to fund this pre-registration stage.",
  },
  {
    id: "rgep",
    name: "Rajiv Gandhi Entrepreneurship Program (RGEP)",
    tagline: "₹25,000/month for 12 months for Karnataka graduates with a pre-market idea.",
    officialUrl: "https://eitbt.karnataka.gov.in/startup",
    filters: {
      requireState: "Karnataka",
      maxAge: 30,
      allowedStudentStatus: ["graduated"],
      requiresNoRevenue: true,
    },
    reason: (a) =>
      `You're ${a.age}, Karnataka-domiciled, graduated, and pre-market — RGEP's age, domicile, graduation, and pre-market rules all pass.`,
  },
  {
    id: "dpiit-recognition",
    name: "DPIIT Recognition / Startup India Registration",
    tagline: "The gateway credential most later schemes require. Register once, unlock the rest.",
    officialUrl: "https://www.startupindia.gov.in/content/sih/en/startup-scheme.html",
    filters: {
      requireCitizenIndia: true,
      allowedDpiitStatus: ["not_registered", "registered_not_dpiit"],
    },
    reason: () =>
      "You don't have DPIIT recognition yet — this is the single most valuable next step, since it unlocks most other schemes on this page.",
  },
  {
    id: "sisfs",
    name: "Startup India Seed Fund Scheme (SISFS)",
    tagline: "Up to ₹20L grant plus ₹50L convertible-debt investment, via approved incubators.",
    officialUrl: "https://www.startupindia.gov.in/content/sih/en/government-schemes/startup-india-seed-fund-scheme.html",
    filters: {
      allowedDpiitStatus: ["dpiit_recognized"],
    },
    reason: () =>
      "You're DPIIT-recognized — SISFS is open to you for seed-stage funding.",
  },
  {
    id: "elevate-nxt",
    name: "ELEVATE / ELEVATE NxT (Karnataka)",
    tagline: "₹25L–₹1Cr grant-in-aid for incorporated Karnataka startups.",
    officialUrl: "https://eitbt.karnataka.gov.in/startup",
    unverifiedNote: "Exact grant band varies by source — confirm on the official page before relying on it.",
    filters: {
      requireState: "Karnataka",
      allowedDpiitStatus: ["dpiit_recognized"],
    },
    reason: () =>
      "You're DPIIT-recognized and Karnataka-based — ELEVATE NxT is a state grant-in-aid track built for you.",
  },
  {
    id: "sipp",
    name: "SIPP — Startups' IP Protection Scheme",
    tagline: "Government-subsidized patent, trademark, and design filing support.",
    officialUrl: "https://ipindia.gov.in/",
    filters: {
      allowedDpiitStatus: ["dpiit_recognized"],
    },
    reason: () =>
      "You're DPIIT-recognized — SIPP covers your patent/trademark filing fees, low effort for real value.",
  },
  {
    id: "gem-startup-runway",
    name: "GeM Startup Runway",
    tagline: "Sell directly to government buyers without the usual turnover/experience barriers.",
    officialUrl: "https://gem.gov.in/",
    filters: {
      allowedDpiitStatus: ["dpiit_recognized"],
    },
    reason: () =>
      "You're DPIIT-recognized — the GeM Startup Runway lets you sell to government buyers without normal vendor barriers.",
  },
];

export type Classification = "now" | "later" | "not_applicable";

export type ScoredScheme = {
  scheme: Scheme;
  status: Classification;
  /** "Now": why it matches. "Later": what would unlock it. "Not applicable": why it never will. */
  reason: string;
};

const DPIIT_ORDER: DpiitStatus[] = ["not_registered", "registered_not_dpiit", "dpiit_recognized"];

/**
 * Classifies one scheme against a full set of answers. A scheme is:
 * - "now" if every filter passes.
 * - "not_applicable" if any filter fails for a reason that cannot change
 *   (wrong state/citizenship, aged out, past a revenue or registration
 *   ceiling the scheme requires staying under).
 * - "later" if every failing filter is one the student can still grow into
 *   (not yet old enough, not yet graduated, no prototype yet, not yet
 *   registered/DPIIT-recognized).
 *
 * A scheme with both a permanent and a progressable failure is
 * not_applicable — a permanent blocker makes the progressable one moot.
 */
export function classifyScheme(scheme: Scheme, a: Answers): ScoredScheme {
  const f = scheme.filters;
  const permanent: string[] = [];
  const later: string[] = [];

  if (f.requireState !== undefined && a.state !== f.requireState) {
    permanent.push(`only open to ${f.requireState} residents`);
  }
  if (f.requireCitizenIndia && !a.isIndianCitizen) {
    permanent.push("requires Indian citizenship");
  }
  if (f.maxAge !== undefined && a.age > f.maxAge) {
    permanent.push(`requires age ${f.maxAge} or under`);
  }
  if (f.minAge !== undefined && a.age < f.minAge) {
    later.push(`unlocks once you turn ${f.minAge}`);
  }
  if (f.allowedStudentStatus !== undefined && !f.allowedStudentStatus.includes(a.studentStatus)) {
    if (f.allowedStudentStatus.includes("graduated") && a.studentStatus === "enrolled") {
      later.push("unlocks once you graduate");
    } else {
      permanent.push("doesn't match your student status");
    }
  }
  if (f.requiresPrototype && !a.hasPrototype) {
    later.push("unlocks once you have a working prototype");
  }
  if (f.allowedDpiitStatus !== undefined && !f.allowedDpiitStatus.includes(a.dpiitStatus)) {
    const currentIdx = DPIIT_ORDER.indexOf(a.dpiitStatus);
    const allowedIdxs = f.allowedDpiitStatus.map((s) => DPIIT_ORDER.indexOf(s));
    const minAllowed = Math.min(...allowedIdxs);
    const maxAllowed = Math.max(...allowedIdxs);
    if (currentIdx < minAllowed) {
      later.push(
        DPIIT_ORDER[minAllowed] === "dpiit_recognized"
          ? "unlocks once you're DPIIT-recognized"
          : "unlocks once you register your startup"
      );
    } else if (currentIdx > maxAllowed) {
      permanent.push("is only for an earlier registration stage than yours");
    }
  }
  if (f.requiresNoRevenue && a.hasRevenue) {
    permanent.push("is only for ventures with no revenue yet");
  }

  if (permanent.length === 0 && later.length === 0) {
    return { scheme, status: "now", reason: scheme.reason(a) };
  }
  if (permanent.length > 0) {
    const reason = permanent[0];
    return { scheme, status: "not_applicable", reason: reason.charAt(0).toUpperCase() + reason.slice(1) };
  }
  const reason = later[0];
  return { scheme, status: "later", reason: reason.charAt(0).toUpperCase() + reason.slice(1) };
}

export function classifySchemes(answers: Answers): {
  now: ScoredScheme[];
  later: ScoredScheme[];
  notApplicable: ScoredScheme[];
} {
  const scored = SCHEMES.map((scheme) => classifyScheme(scheme, answers));
  return {
    now: scored.filter((s) => s.status === "now"),
    later: scored.filter((s) => s.status === "later"),
    notApplicable: scored.filter((s) => s.status === "not_applicable"),
  };
}

/** States with at least one state-scoped scheme in this dataset. Used to
 * show honest coverage copy instead of a silent empty/Karnataka-only result. */
export const COVERED_STATES = Array.from(
  new Set(SCHEMES.map((s) => s.filters.requireState).filter((s): s is string => s !== undefined))
);
