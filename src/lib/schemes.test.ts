import { describe, it, expect } from "vitest";
import {
  classifyScheme,
  classifySchemes,
  FILTER_KEYS,
  Scheme,
  Answers,
  DpiitStatus,
} from "./schemes";

const BASE_ANSWERS: Answers = {
  state: "Karnataka",
  isIndianCitizen: true,
  age: 22,
  studentStatus: "enrolled",
  hasPrototype: true,
  dpiitStatus: "not_registered",
  hasRevenue: false,
};

function baseScheme(filters: Scheme["filters"]): Scheme {
  return {
    id: "test-scheme",
    name: "Test Scheme",
    tagline: "",
    officialUrl: "https://example.com",
    filters,
    reason: () => "matched",
  };
}

/**
 * For every filter key a Scheme can carry, prove classifyScheme's outcome
 * actually depends on it: construct an answers pair that only differs on
 * that key, and assert the classification differs (or, for permanently
 * blocking keys, differs from "now"). This guards against a filter key
 * silently being added to the Scheme type without the checker reading it —
 * the exact class of bug reported against requireCitizenIndia.
 */
describe("classifyScheme reads every filter key", () => {
  const cases: Record<
    (typeof FILTER_KEYS)[number],
    { filters: Scheme["filters"]; passingAnswers: Answers; failingAnswers: Answers }
  > = {
    requireState: {
      filters: { requireState: "Karnataka" },
      passingAnswers: BASE_ANSWERS,
      failingAnswers: { ...BASE_ANSWERS, state: "Maharashtra" },
    },
    requireCitizenIndia: {
      filters: { requireCitizenIndia: true },
      passingAnswers: BASE_ANSWERS,
      failingAnswers: { ...BASE_ANSWERS, isIndianCitizen: false },
    },
    minAge: {
      filters: { minAge: 18 },
      passingAnswers: BASE_ANSWERS,
      failingAnswers: { ...BASE_ANSWERS, age: 16 },
    },
    maxAge: {
      filters: { maxAge: 30 },
      passingAnswers: BASE_ANSWERS,
      failingAnswers: { ...BASE_ANSWERS, age: 40 },
    },
    allowedStudentStatus: {
      filters: { allowedStudentStatus: ["graduated"] },
      passingAnswers: { ...BASE_ANSWERS, studentStatus: "graduated" },
      failingAnswers: { ...BASE_ANSWERS, studentStatus: "not_student" },
    },
    requiresPrototype: {
      filters: { requiresPrototype: true },
      passingAnswers: { ...BASE_ANSWERS, hasPrototype: true },
      failingAnswers: { ...BASE_ANSWERS, hasPrototype: false },
    },
    allowedDpiitStatus: {
      filters: { allowedDpiitStatus: ["dpiit_recognized" as DpiitStatus] },
      passingAnswers: { ...BASE_ANSWERS, dpiitStatus: "dpiit_recognized" },
      failingAnswers: { ...BASE_ANSWERS, dpiitStatus: "not_registered" },
    },
    requiresNoRevenue: {
      filters: { requiresNoRevenue: true },
      passingAnswers: { ...BASE_ANSWERS, hasRevenue: false },
      failingAnswers: { ...BASE_ANSWERS, hasRevenue: true },
    },
  };

  for (const key of FILTER_KEYS) {
    it(`evaluates ${key}`, () => {
      const { filters, passingAnswers, failingAnswers } = cases[key];
      const scheme = baseScheme(filters);
      expect(classifyScheme(scheme, passingAnswers).status).toBe("now");
      expect(classifyScheme(scheme, failingAnswers).status).not.toBe("now");
    });
  }

  it("has a test case for every key in FILTER_KEYS (no key silently skipped)", () => {
    expect(Object.keys(cases).sort()).toEqual([...FILTER_KEYS].sort());
  });
});

describe("the reported bug: citizen=yes, not-registered should surface DPIIT recognition", () => {
  it("classifies DPIIT Recognition as now for a citizen, not-registered profile", () => {
    const dpiitRecognition = baseScheme({
      requireCitizenIndia: true,
      allowedDpiitStatus: ["not_registered", "registered_not_dpiit"],
    });
    const result = classifyScheme(dpiitRecognition, {
      ...BASE_ANSWERS,
      isIndianCitizen: true,
      dpiitStatus: "not_registered",
    });
    expect(result.status).toBe("now");
  });
});

describe("now / later / not_applicable classification", () => {
  it("is not_applicable, not later, when a permanent and a progressable filter both fail", () => {
    const scheme = baseScheme({
      requireState: "Karnataka",
      allowedDpiitStatus: ["dpiit_recognized"],
    });
    const result = classifyScheme(scheme, {
      ...BASE_ANSWERS,
      state: "Maharashtra", // permanent
      dpiitStatus: "not_registered", // progressable
    });
    expect(result.status).toBe("not_applicable");
  });

  it("treats exceeding a revenue ceiling as not_applicable, not later (can't un-earn revenue)", () => {
    const scheme = baseScheme({ requiresNoRevenue: true });
    const result = classifyScheme(scheme, { ...BASE_ANSWERS, hasRevenue: true });
    expect(result.status).toBe("not_applicable");
  });

  it("treats being ahead of a DPIIT window (e.g. already recognized for a pre-registration scheme) as not_applicable", () => {
    const scheme = baseScheme({ allowedDpiitStatus: ["not_registered"] });
    const result = classifyScheme(scheme, { ...BASE_ANSWERS, dpiitStatus: "dpiit_recognized" });
    expect(result.status).toBe("not_applicable");
  });

  it("treats being behind a DPIIT window as later, with an unlock condition", () => {
    const scheme = baseScheme({ allowedDpiitStatus: ["dpiit_recognized"] });
    const result = classifyScheme(scheme, { ...BASE_ANSWERS, dpiitStatus: "not_registered" });
    expect(result.status).toBe("later");
    expect(result.reason.toLowerCase()).toContain("dpiit-recognized");
  });
});

describe("classifySchemes against real scheme data (worked profiles)", () => {
  it("DPIIT-recognized, revenue-generating Karnataka founder gets the post-recognition schemes now", () => {
    const answers: Answers = {
      state: "Karnataka",
      isIndianCitizen: true,
      age: 25,
      studentStatus: "not_student",
      hasPrototype: true,
      dpiitStatus: "dpiit_recognized",
      hasRevenue: true,
    };
    const { now, later, notApplicable } = classifySchemes(answers);
    expect(now.map((s) => s.scheme.id).sort()).toEqual(
      ["sisfs", "elevate-nxt", "sipp", "gem-startup-runway"].sort()
    );
    // Pre-registration schemes are behind this founder, not ahead — not_applicable, not later.
    expect(notApplicable.map((s) => s.scheme.id)).toEqual(
      expect.arrayContaining(["nidhi-eir"])
    );
    // RGEP requires pre-market (no revenue) — this founder has revenue, so it's out for good.
    expect(notApplicable.map((s) => s.scheme.id)).toEqual(expect.arrayContaining(["rgep"]));
    expect(later).toEqual([]);
  });

  it("pre-registration Karnataka graduate with no revenue gets the early-stage schemes now, later for the rest", () => {
    const answers: Answers = {
      state: "Karnataka",
      isIndianCitizen: true,
      age: 24,
      studentStatus: "graduated",
      hasPrototype: false,
      dpiitStatus: "not_registered",
      hasRevenue: false,
    };
    const { now, later } = classifySchemes(answers);
    expect(now.map((s) => s.scheme.id).sort()).toEqual(
      ["nidhi-prayas", "nidhi-eir", "rgep", "dpiit-recognition"].sort()
    );
    expect(later.map((s) => s.scheme.id).sort()).toEqual(
      ["sisfs", "elevate-nxt", "sipp", "gem-startup-runway"].sort()
    );
  });

  it("every scheme is classified into exactly one of now/later/not_applicable", () => {
    const answers: Answers = {
      state: "Maharashtra",
      isIndianCitizen: true,
      age: 22,
      studentStatus: "enrolled",
      hasPrototype: true,
      dpiitStatus: "not_registered",
      hasRevenue: false,
    };
    const { now, later, notApplicable } = classifySchemes(answers);
    expect(now.length + later.length + notApplicable.length).toBe(8);
  });
});
