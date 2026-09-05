import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Insert-only anon client used purely to log completed assistant sessions, so the
 * team has a durable, queryable record of real usage (persona, answers, what was
 * recommended) to learn from. Null when env vars are absent, so the app runs fine
 * without Supabase.
 */
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;

export type SessionLog = {
  name: string | null;
  persona: string | null;
  answers: Record<string, string>;
  recommendations: { schemeId: string; tier: string }[];
  result_count: number;
  was_empty: boolean;
  internal: boolean;
};

/** True on the team's own devices (tagged once via ?internal=1), so their sessions can be filtered out. */
export function isInternal(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem("kss_internal") === "1";
  } catch {
    return false;
  }
}

/**
 * Fire-and-forget. Never throws into the chat flow: a Supabase outage must never
 * surface an error to the founder, matching the assistant's fail-safe design.
 */
export async function logSession(row: SessionLog): Promise<void> {
  if (!supabase) return;
  try {
    await supabase.from("chatbot_sessions").insert(row);
  } catch {
    // swallowed on purpose
  }
}
