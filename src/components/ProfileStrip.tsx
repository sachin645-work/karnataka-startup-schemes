"use client";

import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { Answers, DpiitStatus, StudentStatus } from "@/lib/schemes";
import { track } from "@/lib/mixpanel";

const INDIAN_STATES = [
  "Karnataka",
  "Maharashtra",
  "Tamil Nadu",
  "Telangana",
  "Delhi",
  "Uttar Pradesh",
  "Other",
];

type FieldId =
  | "state"
  | "isIndianCitizen"
  | "age"
  | "studentStatus"
  | "hasPrototype"
  | "dpiitStatus"
  | "hasRevenue";

const FIELD_ORDER: FieldId[] = [
  "state",
  "isIndianCitizen",
  "age",
  "studentStatus",
  "hasPrototype",
  "dpiitStatus",
  "hasRevenue",
];

const FIELD_QUESTION: Record<FieldId, string> = {
  state: "Which state are you in?",
  isIndianCitizen: "Are you an Indian citizen?",
  age: "What's your age?",
  studentStatus: "What's your student status?",
  hasPrototype: "Do you have a working prototype?",
  dpiitStatus: "Is your startup registered or DPIIT-recognized?",
  hasRevenue: "Have you generated any revenue yet?",
};

function chipLabel(field: FieldId, draft: Partial<Answers>): string {
  switch (field) {
    case "state":
      return draft.state ?? "";
    case "isIndianCitizen":
      return draft.isIndianCitizen ? "Indian citizen" : "Not an Indian citizen";
    case "age":
      return `Age ${draft.age}`;
    case "studentStatus":
      return (
        { enrolled: "Enrolled", graduated: "Graduated", not_student: "Not a student" } as Record<
          StudentStatus,
          string
        >
      )[draft.studentStatus!];
    case "hasPrototype":
      return draft.hasPrototype ? "Has a prototype" : "No prototype yet";
    case "dpiitStatus":
      return (
        {
          not_registered: "Not registered",
          registered_not_dpiit: "Registered, not DPIIT",
          dpiit_recognized: "DPIIT-recognized",
        } as Record<DpiitStatus, string>
      )[draft.dpiitStatus!];
    case "hasRevenue":
      return draft.hasRevenue ? "Has revenue" : "Pre-revenue";
  }
}

function isAnswered(draft: Partial<Answers>, field: FieldId): boolean {
  return draft[field] !== undefined;
}

export function ProfileStrip({
  user,
  onChange,
}: {
  user: User | null;
  onChange: (draft: Partial<Answers>) => void;
}) {
  const [draft, setDraft] = useState<Partial<Answers>>({ state: "Karnataka" });
  const [activeField, setActiveField] = useState<FieldId | null>("state");
  const [signInError, setSignInError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  async function startSignIn() {
    track("understand_me_clicked");
    setSignInError(null);
    setSigningIn(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch {
      setSignInError("Couldn't start Google sign-in — check your connection and try again.");
      setSigningIn(false);
    }
  }

  function setField<K extends FieldId>(field: K, value: Answers[K]) {
    const next = { ...draft, [field]: value };
    setDraft(next);
    onChange(next);
    track("question_answered", { question_id: field, value });

    const nextUnanswered = FIELD_ORDER.find((f) => !isAnswered(next, f));
    setActiveField(nextUnanswered ?? null);
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-navy-100 bg-white p-6 text-center">
        <p className="text-navy-800 mb-4">
          Sign in to see only the schemes you actually qualify for.
        </p>
        <button
          type="button"
          onClick={startSignIn}
          disabled={signingIn}
          className="rounded-lg bg-navy-600 px-5 py-2.5 text-white font-medium hover:bg-navy-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-600 disabled:opacity-60"
        >
          {signingIn ? "Opening Google sign-in…" : "Sign in with Google"}
        </button>
        {signInError && (
          <p role="alert" className="mt-3 text-sm text-maroon-700">
            {signInError}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-navy-100 bg-white p-5">
      {/* The accumulating profile strip: answered fields collapse into chips;
          tapping a chip reopens just that question inline. */}
      <div className="flex flex-wrap gap-2" role="list" aria-label="Your profile so far">
        {FIELD_ORDER.filter((f) => isAnswered(draft, f) || f === activeField).map((field) => {
          const answered = isAnswered(draft, field);
          const isActive = field === activeField;
          if (isActive) return null; // rendered as the open question box below
          return (
            <button
              key={field}
              type="button"
              role="listitem"
              onClick={() => setActiveField(field)}
              className="rounded-full border border-navy-300 bg-navy-50 px-3 py-1.5 text-sm text-navy-800 hover:bg-navy-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-600"
              aria-label={`${FIELD_QUESTION[field]} Currently: ${chipLabel(field, draft)}. Tap to change.`}
            >
              {chipLabel(field, draft)}
              <span aria-hidden="true" className="ml-1.5 text-navy-400">
                edit
              </span>
            </button>
          );
        })}
        {!activeField && (
          <span className="rounded-full bg-navy-600 px-3 py-1.5 text-sm text-white">
            Profile complete
          </span>
        )}
      </div>

      {activeField && (
        <div className="mt-4 border-t border-navy-100 pt-4">
          <FieldInput field={activeField} draft={draft} onChange={setField} />
        </div>
      )}
    </div>
  );
}

function FieldInput({
  field,
  draft,
  onChange,
}: {
  field: FieldId;
  draft: Partial<Answers>;
  onChange: <K extends FieldId>(field: K, value: Answers[K]) => void;
}) {
  const id = `field-${field}`;

  switch (field) {
    case "state":
      return (
        <div>
          <label htmlFor={id} className="block text-sm font-medium text-navy-800 mb-2">
            {FIELD_QUESTION.state}
          </label>
          <select
            id={id}
            value={draft.state ?? "Karnataka"}
            onChange={(e) => onChange("state", e.target.value)}
            className="w-full rounded-lg border border-navy-200 px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-600"
          >
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      );
    case "isIndianCitizen":
      return (
        <YesNoField
          legend={FIELD_QUESTION.isIndianCitizen}
          value={draft.isIndianCitizen}
          onAnswer={(v) => onChange("isIndianCitizen", v)}
        />
      );
    case "age":
      return (
        <div>
          <label htmlFor={id} className="block text-sm font-medium text-navy-800 mb-2">
            {FIELD_QUESTION.age}
          </label>
          <AgeInput id={id} value={draft.age} onAnswer={(v) => onChange("age", v)} />
        </div>
      );
    case "studentStatus":
      return (
        <OptionsField<StudentStatus>
          legend={FIELD_QUESTION.studentStatus}
          value={draft.studentStatus}
          options={[
            { value: "enrolled", label: "Currently enrolled" },
            { value: "graduated", label: "Recently graduated" },
            { value: "not_student", label: "Not a student" },
          ]}
          onAnswer={(v) => onChange("studentStatus", v)}
        />
      );
    case "hasPrototype":
      return (
        <YesNoField
          legend={FIELD_QUESTION.hasPrototype}
          value={draft.hasPrototype}
          onAnswer={(v) => onChange("hasPrototype", v)}
        />
      );
    case "dpiitStatus":
      return (
        <OptionsField<DpiitStatus>
          legend={FIELD_QUESTION.dpiitStatus}
          value={draft.dpiitStatus}
          options={[
            { value: "not_registered", label: "Not registered" },
            { value: "registered_not_dpiit", label: "Registered, not DPIIT-recognized" },
            { value: "dpiit_recognized", label: "DPIIT-recognized" },
          ]}
          onAnswer={(v) => onChange("dpiitStatus", v)}
        />
      );
    case "hasRevenue":
      return (
        <YesNoField
          legend={FIELD_QUESTION.hasRevenue}
          value={draft.hasRevenue}
          onAnswer={(v) => onChange("hasRevenue", v)}
        />
      );
  }
}

function YesNoField({
  legend,
  value,
  onAnswer,
}: {
  legend: string;
  value?: boolean;
  onAnswer: (v: boolean) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-navy-800 mb-2">{legend}</legend>
      <div className="flex gap-3">
        {([true, false] as const).map((v) => (
          <button
            key={String(v)}
            type="button"
            onClick={() => onAnswer(v)}
            aria-pressed={value === v}
            className={`flex-1 rounded-lg border py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-600 ${
              value === v ? "border-navy-600 bg-navy-600 text-white" : "border-navy-200 hover:bg-navy-50"
            }`}
          >
            {value === v && <span aria-hidden="true">✓ </span>}
            {v ? "Yes" : "No"}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function OptionsField<T extends string>({
  legend,
  value,
  options,
  onAnswer,
}: {
  legend: string;
  value?: T;
  options: { value: T; label: string }[];
  onAnswer: (v: T) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-navy-800 mb-2">{legend}</legend>
      <div className="flex flex-col gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onAnswer(o.value)}
            aria-pressed={value === o.value}
            className={`rounded-lg border py-2.5 px-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-600 ${
              value === o.value
                ? "border-navy-600 bg-navy-600 text-white"
                : "border-navy-200 hover:bg-navy-50"
            }`}
          >
            {value === o.value && <span aria-hidden="true">✓ </span>}
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function AgeInput({
  id,
  value,
  onAnswer,
}: {
  id: string;
  value?: number;
  onAnswer: (v: number) => void;
}) {
  const [local, setLocal] = useState(value !== undefined ? String(value) : "");

  return (
    <input
      id={id}
      autoFocus
      type="number"
      min={1}
      max={100}
      value={local}
      onChange={(e) => {
        setLocal(e.target.value);
        const n = Number(e.target.value);
        if (Number.isFinite(n) && n > 0) onAnswer(n);
      }}
      className="w-full rounded-lg border border-navy-200 px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-600"
      placeholder="e.g. 21"
    />
  );
}
