-- Scheme Finder — schemes table.
--
-- Design note: the app's matching LOGIC lives in src/lib/schemes.ts (typed,
-- testable, works offline). This table stores the same scheme content for
-- display/admin purposes and so scheme copy can be edited without a
-- redeploy. If you wire the browse view to read from here instead of the
-- static file, keep the two in sync manually until there's a real CMS need.

create table if not exists schemes (
  id text primary key,
  name text not null,
  tagline text not null,
  official_url text not null,
  unverified_note text,
  created_at timestamptz not null default now()
);

insert into schemes (id, name, tagline, official_url, unverified_note) values
  ('nidhi-prayas', 'NIDHI-PRAYAS', 'Ideation-to-prototype grant, applied through a NIDHI-supported incubator.', 'https://nidhi.dst.gov.in/prayas', 'Exact current funding cap varies by source — confirm on the official page before relying on it.'),
  ('nidhi-eir', 'NIDHI Entrepreneur-in-Residence (EIR)', 'A stipend to work full-time on your idea before you register a company.', 'https://nidhi.dst.gov.in/eir', 'Exact stipend range varies by source — confirm on the official page before relying on it.'),
  ('rgep', 'Rajiv Gandhi Entrepreneurship Program (RGEP)', '₹25,000/month for 12 months for Karnataka graduates with a pre-market idea.', 'https://eitbt.karnataka.gov.in/startup', null),
  ('dpiit-recognition', 'DPIIT Recognition / Startup India Registration', 'The gateway credential most later schemes require. Register once, unlock the rest.', 'https://www.startupindia.gov.in/content/sih/en/startup-scheme.html', null),
  ('sisfs', 'Startup India Seed Fund Scheme (SISFS)', 'Up to ₹20L grant plus ₹50L convertible-debt investment, via approved incubators.', 'https://www.startupindia.gov.in/content/sih/en/government-schemes/startup-india-seed-fund-scheme.html', null),
  ('elevate-nxt', 'ELEVATE / ELEVATE NxT (Karnataka)', '₹25L–₹1Cr grant-in-aid for incorporated Karnataka startups.', 'https://eitbt.karnataka.gov.in/startup', 'Exact grant band varies by source — confirm on the official page before relying on it.'),
  ('sipp', 'SIPP — Startups'' IP Protection Scheme', 'Government-subsidized patent, trademark, and design filing support.', 'https://ipindia.gov.in/', null),
  ('gem-startup-runway', 'GeM Startup Runway', 'Sell directly to government buyers without the usual turnover/experience barriers.', 'https://gem.gov.in/', null)
on conflict (id) do nothing;

alter table schemes enable row level security;

create policy "Schemes are publicly readable"
  on schemes for select
  using (true);
