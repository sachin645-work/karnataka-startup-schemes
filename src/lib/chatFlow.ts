/**
 * Deterministic question tree for the eligibility chatbot. Every question,
 * its options, and which question comes next are fixed in code, not
 * decided by a model at chat time. This exists because letting an LLM
 * invent the next question and its options on the fly was both slow (a
 * network round trip to reason about it on every turn) and unreliable (it
 * once turned a scheme's narrow eligibility text directly into an options
 * list, stranding anyone outside those exact districts). Walking a fixed
 * tree is instant and its answer space is controlled by hand.
 */

export type ChatState = Record<string, string>;

export type Question = {
  id: string;
  prompt: string;
  inputType: "yesno" | "options" | "text";
  options?: string[];
};

export const PERSONA_STUDENT = "Student or recent graduate with an idea";
export const PERSONA_STARTUP = "Building or running a registered startup";
export const PERSONA_GRASSROOTS =
  "A practical solution outside the startup world, like a farmer, artisan, or technician";

const STUDYING = "Currently studying (final year or earlier)";
const RECENT_GRAD = "Recently graduated, within the last couple of years";

const BENGALURU = "Bengaluru Urban";
const ELSEWHERE = "Elsewhere in Karnataka";

const ALREADY_LIVE = "Already live or sold in some form";

const WESCALATE_SECTORS = ["Biotech", "AgriTech", "MedTech / Healthtech", "Cleantech"];

const Q = {
  persona: {
    id: "persona",
    prompt: "Which of these best describes you right now?",
    inputType: "options",
    options: [PERSONA_STUDENT, PERSONA_STARTUP, PERSONA_GRASSROOTS],
  },
  grassrootsCitizen: {
    id: "grassrootsCitizen",
    prompt: "Are you an Indian citizen currently living in Karnataka?",
    inputType: "yesno",
  },
  grassrootsPriorFunding: {
    id: "grassrootsPriorFunding",
    prompt: "Have you or this innovation received any government funding before, from Karnataka or the central government?",
    inputType: "yesno",
  },
  grassrootsGovProgram: {
    id: "grassrootsGovProgram",
    prompt: "Is this innovation already part of a government program or public-private partnership?",
    inputType: "yesno",
  },
  gradStatus: {
    id: "gradStatus",
    prompt: "Which best describes you?",
    inputType: "options",
    options: [STUDYING, RECENT_GRAD],
  },
  collegeLocation: {
    id: "collegeLocation",
    prompt: "Is your college located in Bengaluru Urban district, or elsewhere in Karnataka?",
    inputType: "options",
    options: [BENGALURU, ELSEWHERE],
  },
  gradCitizen: {
    id: "gradCitizen",
    prompt: "Are you an Indian citizen currently domiciled in Karnataka?",
    inputType: "yesno",
  },
  gradDegree: {
    id: "gradDegree",
    prompt: "Did you complete a 3 or 4 year degree in Science or Engineering?",
    inputType: "yesno",
  },
  gradAge: {
    id: "gradAge",
    prompt: "What's your age?",
    inputType: "text",
  },
  gradEmployed: {
    id: "gradEmployed",
    prompt: "Are you currently employed for pay anywhere?",
    inputType: "yesno",
  },
  gradStake: {
    id: "gradStake",
    prompt: "Do you already hold a stake in any other startup?",
    inputType: "yesno",
  },
  gradFunding: {
    id: "gradFunding",
    prompt: "Have you or this idea received more than 5 lakh rupees in funding so far, from any source?",
    inputType: "yesno",
  },
  gradRevenue: {
    id: "gradRevenue",
    prompt: "Is this idea currently generating any revenue?",
    inputType: "yesno",
  },
  gradStage: {
    id: "gradStage",
    prompt: "Which best describes where the idea is right now?",
    inputType: "options",
    options: ["Just an idea, nothing built yet", "Early prototype, not on the market yet", ALREADY_LIVE],
  },
  registered: {
    id: "registered",
    prompt: "Is your startup formally registered or incorporated?",
    inputType: "yesno",
  },
  location: {
    id: "location",
    prompt: "Is your startup based in Bengaluru Urban district, or elsewhere in Karnataka?",
    inputType: "options",
    options: [BENGALURU, ELSEWHERE],
  },
  sector: {
    id: "sector",
    prompt: "Which of these best matches your sector?",
    inputType: "options",
    options: [...WESCALATE_SECTORS, "Something else"],
  },
  womenLed: {
    id: "womenLed",
    prompt: "Is your startup women-led? This is optional, and only relevant for one specific program.",
    inputType: "yesno",
  },
  stage: {
    id: "stage",
    prompt: "Which best describes your startup's stage?",
    inputType: "options",
    options: ["Early stage, not generating revenue yet", "Growth stage, scaling up"],
  },
  eProcurement: {
    id: "eProcurement",
    prompt: "Are you also registered on the Karnataka e-Procurement portal?",
    inputType: "yesno",
  },
} as const satisfies Record<string, Question>;

/** Walks the tree given everything answered so far. Returns null when there's nothing left to ask. */
export function getNextQuestion(state: ChatState): Question | null {
  if (!state.persona) return Q.persona;

  if (state.persona === PERSONA_GRASSROOTS) {
    if (!state.grassrootsCitizen) return Q.grassrootsCitizen;
    if (state.grassrootsCitizen === "No") return null;
    if (!state.grassrootsPriorFunding) return Q.grassrootsPriorFunding;
    if (state.grassrootsPriorFunding === "Yes") return null;
    if (!state.grassrootsGovProgram) return Q.grassrootsGovProgram;
    return null;
  }

  if (state.persona === PERSONA_STUDENT) {
    if (!state.gradStatus) return Q.gradStatus;

    if (state.gradStatus === STUDYING) {
      if (!state.collegeLocation) return Q.collegeLocation;
      return null;
    }

    if (!state.gradCitizen) return Q.gradCitizen;
    if (state.gradCitizen === "No") return null;
    if (!state.gradDegree) return Q.gradDegree;
    if (state.gradDegree === "No") return null;
    if (!state.gradAge) return Q.gradAge;
    if (Number.isNaN(Number(state.gradAge)) || Number(state.gradAge) > 30) return null;
    if (!state.gradEmployed) return Q.gradEmployed;
    if (state.gradEmployed === "Yes") return null;
    if (!state.gradStake) return Q.gradStake;
    if (state.gradStake === "Yes") return null;
    if (!state.gradFunding) return Q.gradFunding;
    if (state.gradFunding === "Yes") return null;
    if (!state.gradRevenue) return Q.gradRevenue;
    if (state.gradRevenue === "Yes") return null;
    if (!state.gradStage) return Q.gradStage;
    return null;
  }

  if (state.persona === PERSONA_STARTUP) {
    if (!state.registered) return Q.registered;
    if (state.registered === "No") return null;
    if (!state.location) return Q.location;
    if (!state.sector) return Q.sector;
    if (WESCALATE_SECTORS.includes(state.sector) && !state.womenLed) return Q.womenLed;
    if (!state.stage) return Q.stage;
    if (!state.eProcurement) return Q.eProcurement;
    return null;
  }

  return null;
}

export type RecommendationTier = "strong-fit" | "general";
export type Recommendation = { schemeId: string; why: string; tier: RecommendationTier };

/** Past Grand Challenges rounds have leaned toward these kinds of public problems per sector, stated as
 *  illustrative history only, never as the current open categories, which rotate round to round. */
const SECTOR_CHALLENGE_HINT: Record<string, string> = {
  Biotech: "primary healthcare delivery and undernutrition",
  AgriTech: "agricultural pest diagnostics and food security",
  "MedTech / Healthtech": "primary healthcare delivery",
  Cleantech: "water conservation and environmental quality",
};

const STAGE_LABEL: Record<string, string> = {
  "Early stage, not generating revenue yet": "early-stage",
  "Growth stage, scaling up": "growth-stage",
};

/**
 * Honest safety net so the assistant never ends on a blank dead-end for
 * someone the tool is actually for (PRD: "fail safe, no dead ends"). These
 * are framed as open starting points to explore, never as eligibility
 * matches, so the "no false you-are-eligible" guardrail still holds.
 */
function generalStartingPoints(): Recommendation[] {
  return [
    {
      schemeId: "incubation-hub",
      tier: "general",
      why: "Not matched to your answers, but this directory of Karnataka incubators, TBIs, and Centres of Excellence is open to anyone looking for a place to build or a mentor to call.",
    },
    {
      schemeId: "grand-challenges",
      tier: "general",
      why: "Not gated to your answers either, but it is open to any startup with a real technology solution to a public problem, worth exploring as your idea takes shape. Confirm the current open categories on the official page.",
    },
  ];
}

/**
 * A hard exclude is someone the Karnataka scheme set genuinely does not
 * serve, not an Indian citizen domiciled in Karnataka. For them an empty
 * result is the honest answer, so the safety net deliberately stays off.
 */
function isHardExcluded(state: ChatState): boolean {
  return state.grassrootsCitizen === "No" || state.gradCitizen === "No";
}

/** Deterministic eligibility matching, no model judgment involved. */
export function computeRecommendations(state: ChatState): Recommendation[] {
  const recs = computeGatedRecommendations(state);
  if (recs.length === 0 && !isHardExcluded(state)) {
    return generalStartingPoints();
  }
  return recs;
}

/** The strict, gated matching. Returns only schemes whose actual criteria the answers satisfy. */
function computeGatedRecommendations(state: ChatState): Recommendation[] {
  const recs: Recommendation[] = [];

  if (state.persona === PERSONA_GRASSROOTS) {
    if (
      state.grassrootsCitizen === "Yes" &&
      state.grassrootsPriorFunding === "No" &&
      state.grassrootsGovProgram === "No"
    ) {
      recs.push({
        schemeId: "grassroot-innovation",
        tier: "strong-fit",
        why: "You're a Karnataka-based citizen innovator whose work hasn't already received government funding or been folded into an existing government program, which is exactly who this grant supports.",
      });
    }
    return recs;
  }

  if (state.persona === PERSONA_STUDENT) {
    if (state.gradStatus === STUDYING) {
      if (state.collegeLocation === ELSEWHERE) {
        recs.push({
          schemeId: "nain-2.0",
          tier: "strong-fit",
          why: "Your college is outside Bengaluru Urban district, which is exactly where NAIN 2.0 sets up its funded innovation centres.",
        });
        recs.push({
          schemeId: "leap",
          tier: "strong-fit",
          why: "LEAP funds student innovation in specific district clusters outside Bengaluru, likely including yours, confirm your exact district is on the current list on the official page.",
        });
      }
      return recs;
    }

    const rgepEligible =
      state.gradCitizen === "Yes" &&
      state.gradDegree === "Yes" &&
      !Number.isNaN(Number(state.gradAge)) &&
      Number(state.gradAge) <= 30 &&
      state.gradEmployed === "No" &&
      state.gradStake === "No" &&
      state.gradFunding === "No" &&
      state.gradRevenue === "No" &&
      state.gradStage !== ALREADY_LIVE;
    if (rgepEligible) {
      recs.push({
        schemeId: "rgep",
        tier: "strong-fit",
        why: "You're a Karnataka-domiciled Science or Engineering graduate, 30 or under, not employed, without a stake in another startup, and your idea hasn't gone to market yet, which matches RGEP's stated criteria closely.",
      });
    }
    return recs;
  }

  if (state.persona === PERSONA_STARTUP) {
    if (state.registered !== "Yes") {
      recs.push({
        schemeId: "incubation-hub",
        tier: "strong-fit",
        why: "Most other programs need a registered startup first, this directory can help you find an incubator to get there.",
      });
      return recs;
    }

    const stageWord = STAGE_LABEL[state.stage ?? ""] ?? "growing";
    const sectorHint = SECTOR_CHALLENGE_HINT[state.sector ?? ""];
    const hasSector = Boolean(state.sector) && state.sector !== "Something else";
    const sectorArticle = hasSector && /^[aeiou]/i.test(state.sector ?? "") ? "an" : "a";
    const teamClause = hasSector ? `${sectorArticle} ${state.sector} team` : "a team";

    recs.push({
      schemeId: "elevate",
      tier: "general",
      why: `ELEVATE is Karnataka's main recurring grant-in-aid program for registered startups; as ${teamClause} currently ${stageWord}, check the current edition's own eligibility and funding cap before applying.`,
    });
    recs.push({
      schemeId: "grand-challenges",
      tier: "general",
      why: sectorHint
        ? `Open to any startup with a real technology solution to a public problem, worth a look regardless of stage. Past rounds have leaned toward challenges close to ${sectorHint}, confirm the current categories on the official page since they rotate.`
        : "Open to any startup with a real technology solution to a public problem, worth a look regardless of stage.",
    });
    recs.push({
      schemeId: "booster-kit",
      tier: "general",
      why: `A directory of discounted services, legal, IP, incorporation, and tools, especially useful while you're ${stageWord}.`,
    });
    recs.push({
      schemeId: "incubation-hub",
      tier: "general",
      why: "A directory of Karnataka's incubators and Centres of Excellence if you're looking for a home base or mentorship.",
    });
    recs.push({
      schemeId: "incentives-2025-30",
      tier: "general",
      why: "If you meet the state's official Startup definition and are registered with KITS, you can likely claim these fiscal incentives, regardless of sector or stage.",
    });
    recs.push({
      schemeId: "kitven",
      tier: "general",
      why: "Karnataka's own state-backed VC fund; being open across sectors and stages, it's worth pitching directly alongside anything else here.",
    });
    recs.push({
      schemeId: "letsventure",
      tier: "general",
      why: "Gives registered Karnataka startups access to LetsVenture's investor and mentorship network, open across sectors and stages including yours.",
    });
    recs.push({
      schemeId: "propel",
      tier: "general",
      why: `A general startup enablement and acceleration platform open to registered startups, including ${stageWord} teams like yours.`,
    });

    if (WESCALATE_SECTORS.includes(state.sector ?? "") && state.womenLed === "Yes") {
      recs.push({
        schemeId: "wescalate",
        tier: "strong-fit",
        why: "You said your startup is women-led and in one of WEscalate's supported sectors, which is exactly what this program is built for.",
      });
    }

    if (state.location === ELSEWHERE) {
      recs.push({
        schemeId: "leap",
        tier: "strong-fit",
        why: "LEAP funds ventures in specific clusters outside Bengaluru, likely including yours, confirm your exact district is on the current list.",
      });
      recs.push({
        schemeId: "beyond-bengaluru-seed-fund",
        tier: "strong-fit",
        why: "This seed fund specifically targets early-stage tech startups outside Bengaluru Urban district, like yours.",
      });
      recs.push({
        schemeId: "fund-of-funds",
        tier: "strong-fit",
        why: "Beyond-Bengaluru startups get priority here, worth exploring especially if your work has a longer research or R&D timeline.",
      });
    }

    if (state.eProcurement === "Yes") {
      recs.push({
        schemeId: "preferential-market-access",
        tier: "strong-fit",
        why: "You're registered with Startup Karnataka and on the e-Procurement portal, the two prerequisites PMA asks for.",
      });
    }

    return recs;
  }

  return recs;
}
