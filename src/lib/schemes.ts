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

export function matchSchemes(answers: Answers): { scheme: Scheme; reason: string }[] {
  return SCHEMES.filter((scheme) => passesFilters(scheme, answers)).map((scheme) => ({
    scheme,
    reason: scheme.reason(answers),
  }));
}

function passesFilters(scheme: Scheme, a: Answers): boolean {
  const f = scheme.filters;
  if (f.requireState && a.state !== f.requireState) return false;
  if (f.requireCitizenIndia && !a.isIndianCitizen) return false;
  if (f.minAge !== undefined && a.age < f.minAge) return false;
  if (f.maxAge !== undefined && a.age > f.maxAge) return false;
  if (f.allowedStudentStatus && !f.allowedStudentStatus.includes(a.studentStatus)) return false;
  if (f.requiresPrototype && !a.hasPrototype) return false;
  if (f.allowedDpiitStatus && !f.allowedDpiitStatus.includes(a.dpiitStatus)) return false;
  if (f.requiresNoRevenue && a.hasRevenue) return false;
  return true;
}
