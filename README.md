# Scheme Finder

Single-page discovery tool for Karnataka student entrepreneurs (with a working
prototype) to find which government schemes actually apply to them — not an
official government platform, links out to the real official pages.

## Setup

1. **Install dependencies** (already done if you cloned this as-is):
   ```
   npm install
   ```

2. **Create a Supabase project** at supabase.com.
   - In Authentication → Providers, enable **Google** and follow Supabase's
     guide to set the OAuth client ID/secret from Google Cloud Console.
   - In Authentication → URL Configuration, add `http://localhost:3000/auth/callback`
     (and your production URL once deployed) as a redirect URL.
   - Run `supabase/schema.sql` in the SQL editor (optional for v1 — the app's
     matching logic reads from `src/lib/schemes.ts` directly; this table is
     for reference/future admin editing).

3. **Get a Groq API key** at console.groq.com/keys — powers the chatbot.

4. **Get a Mixpanel project token** — Settings → Project Settings → Access
   Keys. Leave blank locally if you just want events logged to the console.

5. Copy `.env.local.example` to `.env.local` and fill in the four values.

6. Run it:
   ```
   npm run dev
   ```

7. Deploy: push this repo to GitHub, import it in Vercel, and add the same
   four environment variables in the Vercel project settings.

## What's deliberately not built

- No persisted user profiles — the question flow is re-asked fresh each
  session (locked decision, not an oversight).
- No "later" or partial-match messaging — a scheme either shows or it
  doesn't.
- No application processing — every card links out to the scheme's real
  official page.
- The chatbot never issues its own eligibility verdict — it always hands
  eligibility questions back to the "Understand Me" flow.

## Scheme data accuracy

The 8 seeded schemes come from secondary research. Any tagline marked with
an `unverifiedNote` in `src/lib/schemes.ts` has a fact (usually a funding
figure) that varied across sources during research and hasn't been checked
against the scheme's own official page — confirm before treating it as
settled, especially before showing this to real users.
