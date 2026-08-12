# HelipadUSA — status notes for Claude

Read this before doing anything else in this repo. It exists because Claude Code has no
memory between sessions, and re-discovering this the hard way each time wastes the user's
time and trust. Keep it updated as facts change — don't let it go stale.

## Who the user is (read this first)

The user is **not a programmer** and does not want to become one. They have health issues
that keep them from working outside the home and are trying to build real income from a
handful of small business sites. They also run `authorrally.com` (repo
`pmc1665477/authorrally`, hosted on Railway — a completely different architecture from this
site, don't assume they're built the same way), `janitorialmarket.com`, and
`seniorsafetymarket.com` (repo `pmc1665477/seniorsafetymarket`). They do not want jargon,
do not want to be asked to make infrastructure decisions they don't have context for, and
do not want to repeat context they've already given. When something is uncertain,
investigate before asking.

## How this site actually works (confirmed 2026-08-12 by reading the code directly)

**Not a framework app — a static site generator.** `build/generate.js` (run via `npm run
build` / `node build/generate.js`) generates the HTML pages from data. There's no server
running per-request the way AuthorRally has one on Railway.

**Deliberately many pages, not one.** The `build/templates/` directory (`listingDetail.js`,
`hubPages.js`, etc.) generates a separate static HTML page per listing, per city, per
category — e.g. every individual helicopter-for-sale listing or tour gets its own URL —
instead of one page holding everything. This was a multi-day rebuild specifically so each
listing is its own crawlable Google page (the user's words, 2026-08-12: "google hated the
static html... it wouldn't be a static html website anymore" — to be precise, it's still a
static site, just restructured into many individually-crawlable pages instead of one). Do
NOT "simplify" this back into a single page — that would undo the SEO work this was built
for.

**Hosting: Netlify.** See `netlify.toml` — build command `node build/generate.js`, publishes
the repo root (`.`) directly as the live site.

**Data: Supabase.** `build/lib/supabase.js` pulls listings (jobs, tours, schools, etc.) from
Supabase's REST API at build time. The project URL is:

```
https://jjmbchgiocozfmywrhgo.supabase.co
```

**Important cross-site fact:** in the Supabase dashboard, this project is labeled
**"janitorialmarket"** — HelipadUSA and janitorialmarket.com share the same Supabase
project and the same storage bucket (`listing-photos`), confirmed by the user 2026-08-12.
This is not a mistake to "fix," it's just how it's wired — but it means:
- Pausing, deleting, or hitting free-tier limits on the "janitorialmarket" Supabase project
  affects **both** sites at once, not just janitorialmarket.com.
- Don't reason about this project's capacity/usage as if it only serves one business.

**How the live site stays up to date:** most new content arrives by someone submitting
directly into Supabase (not via a git push), so Netlify's normal "rebuild on push" doesn't
catch it. Two mechanisms cover that (see `.github/workflows/daily-rebuild.yml`):
1. A Supabase Database Webhook triggers a near-instant Netlify rebuild when new data lands.
2. A GitHub Actions cron job runs daily at 13:17 UTC as a safety net, in case a webhook was
   missed — it just pings the Netlify build hook URL (stored as the `NETLIFY_BUILD_HOOK_URL`
   GitHub secret).

So this site is largely self-updating and doesn't need manual rebuild/redeploy steps for
new content — unlike `seniorsafetymarket.com`, which requires a manual FTP upload every
time (see that repo's CLAUDE.md).

## Known open questions

- **janitorialmarket.com's own repo location is still unknown.** `pmc1665477/janitorialmarket`
  does not exist/isn't accessible. Ask the user for its actual repo name/owner before
  assuming anything about its code — it very likely also uses the same shared Supabase
  project described above, based on client-side code seen directly from janitorialmarket.com
  (Stripe.js + supabase-js loaded client-side), but that hasn't been confirmed against its
  actual source yet.
- **Supabase plan/limits** — as of 2026-08-12 the user's Supabase org
  (`primebuildingsolutions@gmail.com's Org`) was on the free tier and already at its 2-free-
  project cap across `janitorialmarket` (used by this site too), `seniorsafetymarket`, and a
  third project `woodworkerexchange` (shown PAUSED, purpose unknown — not one of the 4 sites
  the user mentioned wanting to advertise). Free-tier Supabase projects auto-pause after 7
  days of inactivity, which would silently break both HelipadUSA's daily rebuild and
  janitorialmarket.com. Worth the user knowing this is a shared risk, not per-site.
