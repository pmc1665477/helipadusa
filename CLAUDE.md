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

**NEVER ask "do you want to stop here?" or anything like it.** The user told us explicitly
(2026-08-12, forcefully) that this is not welcome — they will tell you when they want to
stop. Just keep working, or state what you're doing next, without checking in about whether
to continue. Offering a natural pause point is fine ("that's done — next up is X") but do
not frame it as a question about whether to proceed.

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
new content. (Earlier notes here said `seniorsafetymarket.com` needed manual FTP uploads —
that's now out of date. As of 2026-08-18, seniorsafetymarket.com also runs on Netlify with
the same auto-deploy-on-push + Supabase-webhook pattern as this site. See that repo's own
CLAUDE.md.)

**Cloudflare (confirmed 2026-08-18):** `helipadusa.com` is managed through Cloudflare —
under the `Primebuildingsoluti...` account, Domains shows `helipadusa.com`, alongside a
Worker (`purple-silence-7321`) and Turnstile under Application security. This is the ONLY
one of the user's sites on Cloudflare — authorrally, janitorialmarket, and
seniorsafetymarket are NOT (confirmed the same night after a long, frustrating dead-end
chasing a Cloudflare-caching theory on seniorsafetymarket's actual bug, which turned out to
be unrelated — that domain's DNS is plain Hostinger-managed, not Cloudflare). Don't assume
Cloudflare is in the picture for any site other than this one without checking again.

## News feeds (News tab + Vertical Mag sidebar widget) — fixed 2026-09-14

Both were failing for a long time across multiple sessions before this. Root causes, found
by testing each source directly with `curl` rather than guessing from the browser:

- **Reddit is genuinely, hard-blocked** — confirmed with a clean server-side request (no
  browser, no CORS involved at all): `reddit.com/r/.../hot.json` returns a flat `403
  Blocked`. This is not a CORS problem and cannot be fixed by moving the fetch to a server —
  Reddit now requires a registered API app and OAuth even for read-only public JSON access.
  **Still unresolved** — needs the user to register a free "script" app at
  reddit.com/prefs/apps and hand over the client ID/secret (stored as Netlify env vars, never
  in the repo) before Reddit content can work again. Don't re-attempt a plain fetch to
  reddit.com expecting it to work — it won't, until OAuth is wired up.
- **flyingmag.com/helicopters/feed/ was never a working feed** — it's a dead WordPress
  *comments* feed (empty, stale since April 2025). flyingmag.com no longer has a helicopters
  category page at all (`/helicopters/` 301s to one unrelated old article). This is why the
  free rss2json.com proxy kept erroring — it wasn't a quota/CORS problem, the underlying feed
  URL was simply wrong.
- **Fix: switched to `verticalmag.com/news/feed/`** — Vertical Mag is a genuine rotorcraft-
  only trade publication; this specific feed (not their other feeds, some of which are dead
  or sponsored-content spotlights) is live and updates daily. Fetched server-side via a new
  Netlify Function (`netlify/functions/helicopter-news.js`) that also parses the RSS itself,
  removing the rss2json.com dependency entirely.
- **The user wants helicopter-only content, no exceptions** — the function applies a keyword
  filter (`isHelicopterRelated`, checks title/selftext against a list of helicopter terms,
  models, and manufacturers) to every item from every source before returning it. This also
  means the Reddit "Aviation/Flying/Maintenance/Military" topic buttons (once Reddit access
  is restored) return only helicopter-relevant posts from those broader subs, rather than
  needing to be removed for being too broad. r/helicopters itself skips the filter.
- General lesson for this repo: when a feed/API integration is reported broken, test the
  exact URL directly with `curl` first (server-side, real response) before touching any code
  — every failure here turned out to be a wrong or dead URL / a genuine platform-side block,
  not something fixable by retrying the same client-side approach again.

## Known open questions

- **RESOLVED 2026-08-12: janitorialmarket.com now has a repo** — `pmc1665477/janitorialmarket`,
  created today from a Hostinger file export (it had no repo before). Confirmed it shares
  this project's Supabase database. See that repo's own CLAUDE.md for details — it has no
  generator/build script (unlike this repo), just static output.
- **Supabase plan/limits** — as of 2026-08-12 the user's Supabase org
  (`primebuildingsolutions@gmail.com's Org`) was on the free tier and already at its 2-free-
  project cap across `janitorialmarket` (used by this site too), `seniorsafetymarket`, and a
  third project `woodworkerexchange` (shown PAUSED, purpose unknown — not one of the 4 sites
  the user mentioned wanting to advertise). Free-tier Supabase projects auto-pause after 7
  days of inactivity, which would silently break both HelipadUSA's daily rebuild and
  janitorialmarket.com. Worth the user knowing this is a shared risk, not per-site.
