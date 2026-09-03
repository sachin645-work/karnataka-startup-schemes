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

type Step = { title: string; fields: FieldId[] };

// Grouped so related questions sit on one screen (proximity), while still
// moving one step at a time (sequential design) — down from 7 single-field
// screens to 4 grouped ones.
const STEPS: Step[] = [
  { title: "Where are you based?", fields: ["state", "isIndianCitizen"] },
  { title: "Tell us about yourself", fields: ["age", "studentStatus"] },
  { title: "Your venture's stage", fields: ["hasPrototype", "dpiitStatus"] },
  { title: "Traction so far", fields: ["hasRevenue"] },
];

function isAnswered(draft: Partial<Answers>, field: FieldId): boolean {
  return draft[field] !== undefined;
}

export function UnderstandMeFlow({
  user,
  onComplete,
}: {
  user: User | null;
  onComplete: (answers: Answers) => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<Partial<Answers>>({ state: "Karnataka" });
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
    setDraft((d) => ({ ...d, [field]: value }));
    track("question_answered", { question_id: field, value });
  }

  function goNext() {
    if (stepIndex + 1 < STEPS.length) {
      setStepIndex(stepIndex + 1);
    } else {
      onComplete(draft as Answers);
    }
  }

  function goBack() {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-navy-100 bg-white p-6 text-center">
        <p className="text-navy-800 mb-4">
          Sign in to see only the schemes you actually qualify for.
        </p>
        <button
          onClick={startSignIn}
          disabled={signingIn}
          className="rounded-lg bg-navy-900 px-5 py-2.5 text-white font-medium hover:bg-navy-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 disabled:opacity-60"
        >
          {signingIn ? "Opening Google sign-in…" : "Sign in with Google"}
        </button>
        {signInError && (
          <p role="alert" className="mt-3 text-sm text-red-600">
            {signInError}
          </p>
        )}
      </div>
    );
  }

  const step = STEPS[stepIndex];
  const stepComplete = step.fields.every((f) => isAnswered(draft, f));

  return (
    <div className="rounded-xl border border-navy-100 bg-white p-6">
      <div className="mb-4 flex items-center gap-2" aria-hidden="true">
        {STEPS.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 flex-1 rounded-full ${
              i <= stepIndex ? "bg-navy-700" : "bg-navy-100"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-navy-500 mb-2">
        Step {stepIndex + 1} of {STEPS.length}
      </p>
      <h3 className="text-lg font-medium text-navy-950 mb-4">{step.title}</h3>

      <div className="space-y-5">
        {step.fields.map((field) => (
          <FieldInput key={field} field={field} draft={draft} onChange={setField} />
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        {stepIndex > 0 ? (
          <button
            onClick={goBack}
            className="rounded-lg border border-navy-200 px-4 py-2 text-sm font-medium text-navy-700 hover:bg-navy-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
          >
            ← Back
          </button>
        ) : (
          <span />
        )}
        <button
          onClick={goNext}
          disabled={!stepComplete}
          className="rounded-lg bg-navy-900 px-5 py-2 text-sm font-medium text-white hover:bg-navy-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {stepIndex + 1 < STEPS.length ? "Continue" : "See my matches"}
        </button>
      </div>
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
  switch (field) {
    case "state":
      return (
        <LabeledField label="Which state are you in?">
          <select
            value={draft.state ?? "Karnataka"}
            onChange={(e) => onChange("state", e.target.value)}
            className="w-full rounded-lg border border-navy-200 px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
          >
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </LabeledField>
      );
    case "isIndianCitizen":
      return (
        <LabeledField label="Are you an Indian citizen?">
          <YesNo value={draft.isIndianCitizen} onAnswer={(v) => onChange("isIndianCitizen", v)} />
        </LabeledField>
      );
    case "age":
      return (
        <LabeledField label="What's your age?">
          <AgeInput value={draft.age} onAnswer={(v) => onChange("age", v)} />
        </LabeledField>
      );
    case "studentStatus":
      return (
        <LabeledField label="What's your student status?">
          <Options<StudentStatus>
            value={draft.studentStatus}
            options={[
              { value: "enrolled", label: "Currently enrolled" },
              { value: "graduated", label: "Recently graduated" },
              { value: "not_student", label: "Not a student" },
            ]}
            onAnswer={(v) => onChange("studentStatus", v)}
          />
        </LabeledField>
      );
    case "hasPrototype":
      return (
        <LabeledField label="Do you have a working prototype?">
          <YesNo value={draft.hasPrototype} onAnswer={(v) => onChange("hasPrototype", v)} />
        </LabeledField>
      );
    case "dpiitStatus":
      return (
        <LabeledField label="Is your startup registered or DPIIT-recognized?">
          <Options<DpiitStatus>
            value={draft.dpiitStatus}
            options={[
              { value: "not_registered", label: "Not registered" },
              { value: "registered_not_dpiit", label: "Registered, not DPIIT-recognized" },
              { value: "dpiit_recognized", label: "DPIIT-recognized" },
            ]}
            onAnswer={(v) => onChange("dpiitStatus", v)}
          />
        </LabeledField>
      );
    case "hasRevenue":
      return (
        <LabeledField label="Have you generated any revenue yet?">
          <YesNo value={draft.hasRevenue} onAnswer={(v) => onChange("hasRevenue", v)} />
        </LabeledField>
      );
  }
}

function LabeledField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-medium text-navy-800 mb-2">{label}</p>
      {children}
    </div>
  );
}

function YesNo({ value, onAnswer }: { value?: boolean; onAnswer: (v: boolean) => void }) {
  return (
    <div className="flex gap-3">
      <button
        onClick={() => onAnswer(true)}
        aria-pressed={value === true}
        className={`flex-1 rounded-lg border py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 ${
          value === true
            ? "border-navy-700 bg-navy-700 text-white"
            : "border-navy-200 hover:bg-navy-50"
        }`}
      >
        Yes
      </button>
      <button
        onClick={() => onAnswer(false)}
        aria-pressed={value === false}
        className={`flex-1 rounded-lg border py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 ${
          value === false
            ? "border-navy-700 bg-navy-700 text-white"
            : "border-navy-200 hover:bg-navy-50"
        }`}
      >
        No
      </button>
    </div>
  );
}

function Options<T extends string>({
  value,
  options,
  onAnswer,
}: {
  value?: T;
  options: { value: T; label: string }[];
  onAnswer: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onAnswer(o.value)}
          aria-pressed={value === o.value}
          className={`rounded-lg border py-2.5 px-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500 ${
            value === o.value
              ? "border-navy-700 bg-navy-700 text-white"
              : "border-navy-200 hover:bg-navy-50"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function AgeInput({ value, onAnswer }: { value?: number; onAnswer: (v: number) => void }) {
  const [local, setLocal] = useState(value !== undefined ? String(value) : "");

  return (
    <input
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
      className="w-full rounded-lg border border-navy-200 px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy-500"
      placeholder="e.g. 21"
    />
  );
}
