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

type Step =
  | { id: "state"; question: string }
  | { id: "citizen"; question: string }
  | { id: "age"; question: string }
  | { id: "studentStatus"; question: string }
  | { id: "hasPrototype"; question: string }
  | { id: "dpiitStatus"; question: string }
  | { id: "hasRevenue"; question: string };

const STEPS: Step[] = [
  { id: "state", question: "Which state are you in?" },
  { id: "citizen", question: "Are you an Indian citizen?" },
  { id: "age", question: "What's your age?" },
  { id: "studentStatus", question: "What's your student status?" },
  { id: "hasPrototype", question: "Do you have a working prototype?" },
  { id: "dpiitStatus", question: "Is your startup registered or DPIIT-recognized?" },
  { id: "hasRevenue", question: "Have you generated any revenue yet?" },
];

export function UnderstandMeFlow({
  user,
  onComplete,
}: {
  user: User | null;
  onComplete: (answers: Answers) => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState<Partial<Answers>>({ state: "Karnataka" });

  async function startSignIn() {
    track("understand_me_clicked");
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  function answer(id: Step["id"], value: unknown) {
    const next = { ...draft, [id]: value };
    setDraft(next);
    track("question_answered", { question_id: id, value });

    if (stepIndex + 1 < STEPS.length) {
      setStepIndex(stepIndex + 1);
    } else {
      onComplete(next as Answers);
    }
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center">
        <p className="text-slate-700 mb-4">
          Sign in to see only the schemes you actually qualify for.
        </p>
        <button
          onClick={startSignIn}
          className="rounded-lg bg-slate-900 px-5 py-2.5 text-white font-medium hover:bg-slate-800"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  const step = STEPS[stepIndex];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <p className="text-xs text-slate-400 mb-2">
        Question {stepIndex + 1} of {STEPS.length}
      </p>
      <h3 className="text-lg font-medium text-slate-900 mb-4">{step.question}</h3>
      <StepInput step={step} onAnswer={answer} />
    </div>
  );
}

function StepInput({
  step,
  onAnswer,
}: {
  step: Step;
  onAnswer: (id: Step["id"], value: unknown) => void;
}) {
  switch (step.id) {
    case "state":
      return (
        <select
          autoFocus
          defaultValue="Karnataka"
          onChange={(e) => onAnswer("state", e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        >
          {INDIAN_STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      );
    case "citizen":
    case "hasPrototype":
    case "hasRevenue":
      return (
        <YesNo
          onAnswer={(v) => onAnswer(step.id, v)}
        />
      );
    case "age":
      return (
        <AgeInput onAnswer={(v) => onAnswer("age", v)} />
      );
    case "studentStatus":
      return (
        <Options<StudentStatus>
          options={[
            { value: "enrolled", label: "Currently enrolled" },
            { value: "graduated", label: "Recently graduated" },
            { value: "not_student", label: "Not a student" },
          ]}
          onAnswer={(v) => onAnswer("studentStatus", v)}
        />
      );
    case "dpiitStatus":
      return (
        <Options<DpiitStatus>
          options={[
            { value: "not_registered", label: "Not registered" },
            { value: "registered_not_dpiit", label: "Registered, not DPIIT-recognized" },
            { value: "dpiit_recognized", label: "DPIIT-recognized" },
          ]}
          onAnswer={(v) => onAnswer("dpiitStatus", v)}
        />
      );
  }
}

function YesNo({ onAnswer }: { onAnswer: (v: boolean) => void }) {
  return (
    <div className="flex gap-3">
      <button
        onClick={() => onAnswer(true)}
        className="flex-1 rounded-lg border border-slate-300 py-2.5 hover:bg-slate-50"
      >
        Yes
      </button>
      <button
        onClick={() => onAnswer(false)}
        className="flex-1 rounded-lg border border-slate-300 py-2.5 hover:bg-slate-50"
      >
        No
      </button>
    </div>
  );
}

function Options<T extends string>({
  options,
  onAnswer,
}: {
  options: { value: T; label: string }[];
  onAnswer: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onAnswer(o.value)}
          className="rounded-lg border border-slate-300 py-2.5 px-4 text-left hover:bg-slate-50"
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function AgeInput({ onAnswer }: { onAnswer: (v: number) => void }) {
  const [value, setValue] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const n = Number(value);
        if (Number.isFinite(n) && n > 0) onAnswer(n);
      }}
      className="flex gap-3"
    >
      <input
        autoFocus
        type="number"
        min={1}
        max={100}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="flex-1 rounded-lg border border-slate-300 px-3 py-2"
        placeholder="e.g. 21"
      />
      <button
        type="submit"
        className="rounded-lg bg-slate-900 px-5 py-2 text-white font-medium hover:bg-slate-800"
      >
        Next
      </button>
    </form>
  );
}
