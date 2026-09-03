/**
 * Scheme content is written in original phrasing based on publicly stated
 * facts (eligibility rules, funding figures, structure) gathered from the
 * official Startup Karnataka portal (eitbt.karnataka.gov.in/startup) and
 * its sub-portals. It is not a copy of the source site's own text.
 * Verified 2026-09-04, treat the official site as authoritative; this
 * data goes stale until someone re-checks it by hand.
 */

export type SchemeCategory = "funding" | "schemes-programs" | "startup-kit";

export type EvaluationCriterion = { criterion: string; weight: number };

export type Scheme = {
  id: string;
  name: string;
  category: SchemeCategory;
  tagline: string;
  officialUrl: string;
  /** External partner platforms we just redirect to, rather than templating a full page. */
  isExternal?: boolean;
  /** "full" = every template section seeded; "light" = overview + key facts + official link. */
  depth: "full" | "light";
  overview: string;
  objectives?: string[];
  eligibilityLabel?: string; // defaults to "Eligibility Criteria"
  eligibility?: string[];
  programStructure?: string[];
  evaluationSteps?: string[];
  evaluationCriteria?: EvaluationCriterion[];
  benefits?: string[];
  applicationProcess?: string;
  deadlineNote?: string;
  documentsRequired?: string[];
  downloads?: string[];
  contact?: string;
  unverifiedNote?: string;
};

export const DATA_LAST_VERIFIED = "2026-09-04";
export const SOURCE_URL = "https://eitbt.karnataka.gov.in/startup/public/en";

export const SCHEMES: Scheme[] = [
  // ───────────────────────── SCHEMES & PROGRAMS (full depth) ─────────────────────────
  {
    id: "leap",
    name: "Local Economy Accelerator Program (LEAP)",
    category: "schemes-programs",
    tagline: "A 5-year push to grow six startup clusters outside Bengaluru.",
    officialUrl: "https://eitbt.karnataka.gov.in/startup/public/134/local-economy-accelerator-program-leap/en",
    depth: "full",
    overview:
      "LEAP is a large, multi-year state initiative aimed at spreading Karnataka's startup activity beyond Bengaluru. Rather than a single grant, it funds a wide set of sub-programs, labs, hackathons, research support, and outreach, across six named regional clusters, with the goal of building durable local innovation infrastructure rather than one-off funding.",
    objectives: [
      "Build innovation and prototyping infrastructure in colleges outside Bengaluru Urban District",
      "Create jobs and reduce the concentration of startup activity in Bengaluru alone",
      "Support deep-tech and applied-research work close to where students and early founders actually are",
    ],
    eligibilityLabel: "Who Can Apply / Target Beneficiaries",
    eligibility: [
      "Educational institutions and student innovators located in one of the six named clusters",
      "Class A clusters: Mysuru–Chamarajanagar, Mangaluru–Udupi, Hubbali–Belagavi–Dharwad",
      "Class B clusters: Tumkur, Kalaburagi, Shivamogga",
      "Early-stage ventures based in these regions, depending on the specific sub-program",
    ],
    programStructure: [
      "16 sub-programs in total, each with its own budget and scope",
      "Innovation Labs sub-program: 20 labs planned, about ₹1.25 crore per lab, ₹25 crore total over 5 years",
      "Other components include prototype-development facilities, large-scale hackathons and bootcamps, a research fund, and support for outreach/event participation",
    ],
    benefits: [
      "Access to physical lab and prototyping infrastructure without needing to be in Bengaluru",
      "Structured hackathons, bootcamps, and mentoring events run locally in each cluster",
      "A path into the wider Startup Karnataka ecosystem for institutions previously outside it",
    ],
    downloads: ["List of colleges eligible for the Innovation Labs component"],
    unverifiedNote:
      "Overall figures (₹1,000 crore over 5 years, ₹200 crore for the current year) come from a cited government order, confirm the current allocation on the official page.",
  },
  {
    id: "rgep",
    name: "Rajiv Gandhi Entrepreneurship Program (RGEP)",
    category: "schemes-programs",
    tagline: "A 12-month stipend for very early-stage Science/Engineering graduates.",
    officialUrl: "https://eitbt.karnataka.gov.in/startup/public/107/rajiv-gandhi-entrepreneurship-program/en",
    depth: "full",
    overview:
      "RGEP is aimed at a narrow, specific moment: a recent Science or Engineering graduate who has an idea but hasn't built a company, taken funding, or gone to market yet. It pays a modest monthly stipend for a year so a small cohort can work on their idea full-time, without requiring them to have already incorporated anything.",
    objectives: [
      "Give graduates a funded runway to explore a genuine idea before committing to employment",
      "Shift the default choice for capable graduates away from immediate job-seeking",
    ],
    eligibility: [
      "Indian citizen, domiciled in Karnataka",
      "Completed a 3- or 4-year degree in Science or Engineering (relevant work experience is a plus, not required)",
      "30 years old or younger on the date of application",
      "Not currently employed for remuneration anywhere",
      "Holds no stake in any other startup",
      "Received no more than ₹5 lakh cumulatively from government or private grants so far",
      "Not generating revenue from any product or service",
      "Idea is between early ideation and early prototype, not yet introduced to the market in any form",
      "Able to work on the idea full-time for the full 12-month program",
    ],
    programStructure: ["Supports 30 innovators per cohort", "₹25,000 per month, paid for 12 months"],
    evaluationSteps: [
      "Data sufficiency check, applications are screened for basic eligibility and required documents, including a pitch deck",
      "Jury round, shortlisted applicants present in person to a 3-member jury (industry, academia, corporate) for about 20 minutes each",
    ],
    evaluationCriteria: [
      { criterion: "Novelty / innovation", weight: 30 },
      { criterion: "Potential socio-economic impact", weight: 30 },
      { criterion: "Clarity of the problem statement", weight: 20 },
      { criterion: "Feasibility and implementation plan", weight: 10 },
      { criterion: "Commercial potential", weight: 10 },
    ],
    documentsRequired: ["Pitch deck", "Proof of degree", "Proof of Karnataka domicile and citizenship"],
    downloads: ["Operational guidelines", "Pitch deck template"],
    applicationProcess: "Apply through the official portal's application form ahead of the stated deadline.",
    deadlineNote: "Site has listed 31 Aug 2026 as a past application round's deadline, check the official page for the current round.",
    contact:
      "Karnataka Startup Cell, Karnataka Innovation and Technology Society (KITS), Dept. of Electronics, IT & BT, Government of Karnataka, Bengaluru. Phone: 080-22231007.",
  },
  {
    id: "nain-2.0",
    name: "New Age Innovation Network 2.0 (NAIN 2.0)",
    category: "schemes-programs",
    tagline: "Funded innovation centres for colleges outside Bengaluru Urban.",
    officialUrl: "https://eitbt.karnataka.gov.in/startup/public/51/nain-2.0/en",
    depth: "full",
    overview:
      "NAIN 2.0 sets up dedicated innovation centres inside technology colleges located outside Bengaluru Urban District, so students can work on practical, local-problem projects with funding and mentorship attached to their own institution rather than needing to travel to a hub.",
    objectives: [
      "Encourage frugal, practical innovation among students at the college level",
      "Build lasting innovation infrastructure at institutions outside the capital",
    ],
    eligibilityLabel: "Who Can Apply / Target Institutions",
    eligibility: [
      "Technology institutions of higher learning located outside Bengaluru Urban District",
      "Government engineering colleges are prioritised",
      "Centre focus areas: IT/Electronics or Biotechnology",
    ],
    programStructure: [
      "50 new centres planned: 35 focused on IT/Electronics, 15 on Biotechnology",
      "Each centre is linked to a Project Monitoring Unit / Anchor Institute for mentoring and industry connections",
      "Per-project funding of up to ₹5 lakh, for up to 10 projects a year, over 3 years",
    ],
    benefits: [
      "Direct funding for student project work, not just theoretical training",
      "Assigned mentors to help formulate a real business model, not just a class project",
      "Institutional incubation infrastructure that outlasts any one cohort of students",
      "Regional reach, support concentrated outside Bengaluru specifically",
    ],
  },
  {
    id: "wescalate",
    name: "WEscalate",
    category: "schemes-programs",
    tagline: "Incubation and acceleration built specifically for women-led startups.",
    officialUrl: "https://eitbt.karnataka.gov.in/startup/public/109/wescalate/en",
    depth: "full",
    overview:
      "WEscalate runs two connected tracks for women-led startups in a small set of sectors, an incubation track for early-stage founders and an acceleration track for those ready to scale, delivered through partner incubators rather than run directly by the department.",
    objectives: [
      "Support early-stage women entrepreneurs through structured incubation",
      "Help growth-stage women-led startups scale up with funding and market access",
      "Make Karnataka's startup ecosystem measurably more inclusive",
    ],
    eligibility: [
      "Startup is women-led",
      "Sector is Biotech, AgriTech, MedTech/Healthtech, or Cleantech",
      "Early-stage (for the incubation track) or growth/scale-up stage (for the acceleration track)",
    ],
    programStructure: [
      "30 startups supported per year across 2 sector-specific cohorts of 15 each",
      "Incubation track: 6 months, up to ₹20 lakh grant-in-aid per cohort",
      "Acceleration track: 6 months, up to ₹30 lakh per cohort, including an ₹8.7 lakh deployment grant split among the top 3 performers",
    ],
    benefits: [
      "Business-skills training, mentoring, and peer learning during incubation",
      "Market validation and investor-connect support during acceleration",
      "A real chance at a deployment grant for top performers, not just mentorship",
    ],
    applicationProcess: "Apply through an empanelled incubator or accelerator partner, not directly to the department.",
  },
  {
    id: "grassroot-innovation",
    name: "Grassroot Innovation Programme",
    category: "schemes-programs",
    tagline: "Grants for citizen innovators outside the usual startup pipeline.",
    officialUrl: "https://eitbt.karnataka.gov.in/startup/public/112/grassroot-innovation/en",
    depth: "full",
    overview:
      "This programme is deliberately not aimed at typical tech founders, it exists to fund practical, working innovations from people like farmers, artisans, labourers, and technicians who've solved a real local problem but sit outside the usual startup-funding conversation entirely.",
    objectives: [
      "Recognise and fund innovation happening outside formal startup channels",
      "Help commercialise genuinely useful local inventions",
    ],
    eligibility: [
      "Indian citizen, domiciled in Karnataka",
      "The innovation is not already part of a government initiative or public-private partnership",
      "Neither the applicant nor the innovation has previously received Karnataka or central government funding",
    ],
    programStructure: ["Grants of up to ₹4 lakh per feasible project, approved by an expert committee"],
    evaluationCriteria: [
      { criterion: "Novelty", weight: 30 },
      { criterion: "Social impact", weight: 30 },
      { criterion: "Business potential", weight: 20 },
      { criterion: "Feasibility and implementation", weight: 10 },
      { criterion: "Environmental sustainability", weight: 10 },
    ],
    documentsRequired: [
      "Voter ID or ration card",
      "Proof of profession (professional certificate, professional ID, or labour department ID)",
    ],
  },
  {
    id: "preferential-market-access",
    name: "Preferential Market Access (PMA)",
    category: "schemes-programs",
    tagline: "Helps registered startups sell directly to Karnataka government departments.",
    officialUrl: "https://eitbt.karnataka.gov.in/startup/public/116/preferential-market-access/en",
    depth: "full",
    overview:
      "PMA isn't a grant, it's a market-access mechanism. Once empanelled, a startup can be procured from directly by state departments and PSUs, without going through the usual open-tender barriers that normally favour larger, established vendors.",
    objectives: [
      "Give startups a realistic path to government customers",
      "Encourage state departments to consider startup vendors, not just established suppliers",
    ],
    eligibilityLabel: "Prerequisites",
    eligibility: [
      "Registered with Startup Karnataka",
      "Also registered on the Karnataka e-Procurement portal",
    ],
    programStructure: ["Empanelment is valid for 3 years, refreshed through an annual call"],
    downloads: [
      "Enabling government order",
      "List of eligible technology products/solutions across 12 sectors",
      "Amendment to rules",
    ],
  },

  // ───────────────────────── FUNDING (lighter depth) ─────────────────────────
  {
    id: "elevate",
    name: "ELEVATE",
    category: "funding",
    tagline: "Karnataka's flagship startup grant-in-aid program, run in annual editions.",
    officialUrl: "https://elevate.startupkarnataka.in/",
    depth: "light",
    overview:
      "ELEVATE is the state's main recurring grant-in-aid program for incorporated startups, run as separate yearly (and sometimes regional or DeepTech-specific) editions, including ELEVATE NxT 2026, ELEVATE 2025, ELEVATE 2024, ELEVATE Kalyana Karnataka 2022, Amrita Startups 2022, and an ELEVATE Pitch Masterclass. Each edition has its own eligibility and funding cap, so check the specific edition you're applying to on the official microsite.",
  },
  {
    id: "grand-challenges",
    name: "Grand Challenges of Karnataka",
    category: "funding",
    tagline: "Scouting new technology to solve specific public problems.",
    officialUrl: "https://eitbt.karnataka.gov.in/startup/public/47/grand-challenges-of-karnataka/en",
    depth: "light",
    overview:
      "A challenge-based program looking for real technology solutions to persistent public issues, things like urban development, healthcare access, food security, environmental quality, and education, with a stated goal of surfacing at least 25 solutions with measurable social impact.",
  },
  {
    id: "beyond-bengaluru-seed-fund",
    name: "Beyond Bengaluru Cluster Seed Fund",
    category: "funding",
    tagline: "Seed capital for early-stage tech startups outside Bengaluru Urban.",
    officialUrl: "https://eitbt.karnataka.gov.in/startup/public/50/beyond-bengaluru-cluster-seed-fund/en",
    depth: "light",
    overview:
      "Provides seed capital, mentorship, and investor-network access specifically to early-stage startups working in emerging technology clusters outside Bengaluru Urban District, the goal is narrowing the funding gap between Bengaluru and the rest of the state.",
  },
  {
    id: "fund-of-funds",
    name: "Fund of Funds",
    category: "funding",
    tagline: "A ₹500 crore fund backing startups with longer research timelines.",
    officialUrl: "https://eitbt.karnataka.gov.in/startup/public/49/fund-of-funds/en",
    depth: "light",
    overview:
      "An indirect funding vehicle (invests via other funds, not directly into startups) aimed at ventures with longer gestation periods, deep-science and R&D-heavy startups in particular, with priority given to startups from the Beyond-Bengaluru clusters.",
  },
  {
    id: "kitven",
    name: "KITVEN",
    category: "funding",
    tagline: "Karnataka's own state-backed venture capital fund.",
    officialUrl: "http://www.kitven.in/",
    isExternal: true,
    depth: "light",
    overview: "A state-backed venture fund operating as its own entity, visit its site directly for current fund details and how to pitch.",
  },

  // ───────────────────────── STARTUP KIT (lighter depth) ─────────────────────────
  {
    id: "letsventure",
    name: "Startup Karnataka × LetsVenture",
    category: "startup-kit",
    tagline: "Mentorship, market access, and fundraising support via a private platform partnership.",
    officialUrl: "https://site.karnataka.letsventure.com/",
    isExternal: true,
    depth: "light",
    overview: "A partnership giving Karnataka startups access to LetsVenture's investor and mentorship network, visit the partner site directly to register.",
  },
  {
    id: "propel",
    name: "Propel",
    category: "startup-kit",
    tagline: "A startup enablement and acceleration platform.",
    officialUrl: "https://propel.eitbt.karnataka.gov.in/",
    isExternal: true,
    depth: "light",
    overview: "A dedicated platform for startup enablement and acceleration support, visit directly for current programs.",
  },
  {
    id: "booster-kit",
    name: "Booster Kit",
    category: "startup-kit",
    tagline: "A directory of partner service providers offering discounted startup services.",
    officialUrl: "https://eitbt.karnataka.gov.in/startup/public/129/booster-kit/en",
    depth: "light",
    overview:
      "A curated list of partner organisations offering free or discounted services to registered startups, things like company-management tools, investor-readiness support, legal/IP/incorporation help, and market research. Partners are listed at the organisation level; see the official page for the current partner list and how to claim an offer.",
  },
  {
    id: "incentives-2025-30",
    name: "Incentives 2025-30",
    category: "startup-kit",
    tagline: "Fiscal incentives for startups meeting the state's official Startup definition.",
    officialUrl: "https://eitbt.karnataka.gov.in/startup/public/151/incentives-2025-30/en",
    depth: "light",
    overview:
      "Startups that meet the Karnataka Startup Policy 2025-30's definition of a \"Startup\" and are registered with KITS can claim a set of fiscal incentives, including reimbursement of State GST, see the official page for the full list of incentives and eligibility detail.",
  },
  {
    id: "incubation-hub",
    name: "Incubation Hub",
    category: "startup-kit",
    tagline: "An index of Karnataka's incubators, TBIs, and Centres of Excellence.",
    officialUrl: "https://eitbt.karnataka.gov.in/startup/public/144/incubation-hub/en",
    depth: "light",
    overview:
      "A directory linking out to K-tech Innovation Hubs, Technology Business Incubators (including ones at IISc and Manipal), Centres of Excellence, and NAIN Incubation Centres.",
  },
];

export function getSchemeById(id: string): Scheme | undefined {
  return SCHEMES.find((s) => s.id === id);
}

export function getSchemesByCategory(category: SchemeCategory): Scheme[] {
  return SCHEMES.filter((s) => s.category === category);
}

export const CATEGORY_LABELS: Record<SchemeCategory, string> = {
  funding: "Funding",
  "schemes-programs": "Schemes & Programs",
  "startup-kit": "Startup Kit",
};
