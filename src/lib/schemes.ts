/**
 * Every fact below is sourced only from eitbt.karnataka.gov.in/startup and
 * its official sub-portals (elevate.startupkarnataka.in). No external
 * scheme data is used anywhere in this app. Verified 2026-09-03 — the site
 * itself is the authority; if it changes, this file goes stale until
 * someone re-checks it by hand.
 */
export type Scheme = {
  id: string;
  name: string;
  tagline: string;
  url: string;
  eligibility: string[];
  funding: string;
  deadlineNote?: string;
};

export const SOURCE_URL = "https://eitbt.karnataka.gov.in/startup/public/en";
export const DATA_LAST_VERIFIED = "2026-09-03";

export const SCHEMES: Scheme[] = [
  {
    id: "rgep",
    name: "Rajiv Gandhi Entrepreneurship Program (RGEP)",
    tagline: "Monthly stipend to work on a very early-stage idea, pre-registration.",
    url: "https://eitbt.karnataka.gov.in/startup/public/107/rajiv-gandhi-entrepreneurship-program/en",
    eligibility: [
      "30 years or younger as on the date of application",
      "Completed a 3- or 4-year degree in Science or Engineering only",
      "Indian citizen, domiciled in Karnataka",
      "Not currently employed for remuneration",
      "No stake in any other startup",
      "Received not more than ₹5 lakh cumulatively from any govt/private grants so far",
      "Not generating any revenue yet",
      "Idea is between early ideation and early prototype — not yet introduced to the market in any form",
      "Able to work on this full-time for the 12-month program",
    ],
    funding: "₹25,000/month for 12 months, 30 spots.",
    deadlineNote: "Site lists an application deadline of 31 Aug 2026 — confirm current status on the official page.",
  },
  {
    id: "wescalate",
    name: "WEscalate",
    tagline: "Incubation and acceleration support for women-led startups in specific sectors.",
    url: "https://eitbt.karnataka.gov.in/startup/public/109/wescalate/en",
    eligibility: [
      "Women-led startup",
      "Early-stage (incubation track) or growth/scale-up stage (acceleration track)",
      "Sector must be Biotech, AgriTech, MedTech/Healthtech, or Cleantech",
    ],
    funding: "Incubation: up to ₹20 lakh per cohort. Acceleration: up to ₹30 lakh per cohort (incl. an ₹8.7 lakh deployment grant for the top 3 performers).",
  },
  {
    id: "elevate-2026",
    name: "ELEVATE 2026",
    tagline: "The flagship grant-in-aid for incorporated Karnataka startups improving on an existing product or process.",
    url: "https://elevate.startupkarnataka.in/",
    eligibility: [
      "Based anywhere in Karnataka",
      "Incorporated as a Private Limited Company, Registered Partnership, LLP, One Person Company, or Co-operative Society",
      "Turnover not exceeding ₹200 crore in any financial year since incorporation",
      "Within 10 years of incorporation at the time of application",
      "Independent entity — not a subsidiary or spin-off",
      "Minimum team size of two",
      "Not a beneficiary of the ELEVATE Grant-in-Aid scheme in the last 3 years",
    ],
    funding: "Up to ₹50 lakh, in 2 milestone-based tranches.",
    deadlineNote: "Site lists an application deadline of 15 Jul 2026 — confirm current status on the official page.",
  },
  {
    id: "elevate-nxt-2026",
    name: "ELEVATE NxT 2026",
    tagline: "The DeepTech track of ELEVATE — AI/ML, IoT, robotics, and similar.",
    url: "https://eitbt.karnataka.gov.in/startup/public/149/elevate-nxt-2026/en",
    eligibility: [
      "Based anywhere in India (not Karnataka-restricted for this track)",
      "Incorporated as a Private Limited Company, Registered Partnership, LLP, or Co-operative Society",
      "Turnover not exceeding ₹300 crore in any financial year since incorporation",
      "Within 20 years of incorporation at the time of application",
      "Independent entity, minimum team size of two",
      "Working on DeepTech — AI/ML, IoT, Blockchain, AR/VR, Robotics, 3D printing, or Drones",
      "Technology Readiness Level (TRL) between 3 and 8",
      "Not a beneficiary of the ELEVATE Grant-in-Aid scheme in the last 3 years",
    ],
    funding: "Up to ₹1 crore in grant-in-aid support.",
  },
  {
    id: "nain-2.0",
    name: "NAIN 2.0 (New Age Innovation Network)",
    tagline: "Project funding and mentorship for students at colleges outside Bengaluru Urban.",
    url: "https://eitbt.karnataka.gov.in/startup/public/51/nain-2.0/en",
    eligibility: [
      "Student at a technology institution of higher learning located outside Bengaluru Urban District",
      "Working on a local-problem, frugal-innovation project (IT/Electronics or Biotechnology focus centres)",
    ],
    funding: "Up to ₹5 lakh per student project, up to 10 projects/year per centre, over 3 years.",
  },
  {
    id: "grassroot-innovation",
    name: "Grassroot Innovation Programme",
    tagline: "Grants for citizen innovators — farmers, artisans, labourers, technicians — with a working idea.",
    url: "https://eitbt.karnataka.gov.in/startup/public/112/grassroot-innovation/en",
    eligibility: [
      "Indian citizen, domiciled in Karnataka",
      "Innovation is not already part of a government initiative or public-private partnership",
      "Neither the applicant nor the innovation has received prior funding from the Karnataka or central government",
      "Typically farmers, artisans, labourers, technicians, or similar grassroots innovators",
    ],
    funding: "Up to ₹4 lakh grant for feasible projects.",
  },
  {
    id: "preferential-market-access",
    name: "Preferential Market Access",
    tagline: "Helps already-registered startups sell to Karnataka government departments.",
    url: "https://eitbt.karnataka.gov.in/startup/public/116/preferential-market-access/en",
    eligibility: [
      "Registered with Startup Karnataka",
      "Also registered on the Karnataka Public Procurement Portal",
      "Empanelment runs for 3 years once approved",
    ],
    funding: "No cash grant — market access: eligibility to sell directly to Karnataka government departments and PSUs.",
  },
  {
    id: "beyond-bengaluru-seed-fund",
    name: "Beyond Bengaluru Cluster Seed Fund",
    tagline: "Seed capital and mentorship for early-stage tech startups outside Bengaluru Urban.",
    url: "https://eitbt.karnataka.gov.in/startup/public/50/beyond-bengaluru-cluster-seed-fund/en",
    eligibility: [
      "Based outside Bengaluru Urban District",
      "Early-stage startup",
      "Working in an emerging technology cluster",
    ],
    funding: "Seed capital, mentorship, and investor-network access — the page doesn't state a specific amount.",
  },
];

/** Renders the scheme data as grounding text for the assistant's system
 * prompt — the only source of scheme facts the model is allowed to use. */
export function buildSchemeGroundingText(): string {
  return SCHEMES.map((s) => {
    const lines = [
      `ID: ${s.id}`,
      `Name: ${s.name}`,
      `What it is: ${s.tagline}`,
      `Eligibility: ${s.eligibility.join("; ")}`,
      `Funding: ${s.funding}`,
    ];
    if (s.deadlineNote) lines.push(`Note: ${s.deadlineNote}`);
    return lines.join("\n");
  }).join("\n\n");
}

export function getSchemeById(id: string): Scheme | undefined {
  return SCHEMES.find((s) => s.id === id);
}
