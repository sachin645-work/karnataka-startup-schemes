import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Single-page product: always bounce back to the home page. The page
  // itself reads the session client-side and resumes the question flow.
  return NextResponse.redirect(`${origin}/`);
}
