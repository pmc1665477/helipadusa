// Fetches Reddit and Vertical Mag's RSS server-side, so the browser never talks to either
// directly. Both of those direct-from-browser calls were failing for structural reasons that
// no amount of client-side retrying can fix:
//   - Reddit's JSON endpoints don't send CORS headers for arbitrary browser origins, so a
//     browser fetch to reddit.com is blocked by the browser itself before any response body
//     is even read. (As of 2026-09-14, Reddit also outright 403s the same request even from
//     a server with no browser involved — confirmed by testing directly — so this endpoint
//     needs real OAuth via a registered Reddit API app before it will work at all again.)
//   - The free rss2json.com proxy (used to work around the same CORS problem for RSS) shares
//     a rate-limited quota across all of its free users, which is the likely source of the
//     422 errors seen on the live site. Also, the specific feed URL it was pointed at
//     (flyingmag.com/helicopters/feed/) turned out to be a dead WordPress *comments* feed,
//     not an article feed — flyingmag.com no longer has a helicopters category page at all.
// A server fetching either source has no CORS restriction at all (CORS only limits browsers),
// so doing it here removes both failure points and the third-party proxy dependency entirely.
//
// Every item from every source is filtered through isHelicopterRelated() before being
// returned — the site's own policy is helicopter content only, so even a nominally
// helicopter-focused source, or a broader aviation/military subreddit, gets narrowed down to
// just the posts that actually are about helicopters.

const RSS_ITEM_LIMIT = 6;

// Safety net so a nominally-helicopter-focused source can't slip an off-topic article
// through — every item's title must contain at least one of these before it's returned.
// Deliberately broad (models, roles, manufacturers) rather than just the word "helicopter".
const HELICOPTER_KEYWORDS = [
  "helicopter", "helicopters", "rotorcraft", "rotor", "chopper", "autorotation",
  "autogyro", "gyroplane", "vtol", "tiltrotor",
  "robinson r22", "robinson r44", "robinson r66", "bell 206", "bell 407", "bell 429",
  "airbus h125", "airbus h130", "airbus h135", "as350", "as355", "ec135", "ec145",
  "sikorsky", "black hawk", "blackhawk", "apache", "chinook", "seahawk", "kiowa",
  "md 500", "md500", "md helicopters", "enstrom", "schweizer", "hughes 500",
  "leonardo aw", "agustawestland", "eurocopter",
];

function isHelicopterRelated(text) {
  const t = text.toLowerCase();
  return HELICOPTER_KEYWORDS.some((k) => t.includes(k));
}

function parseRssItems(xml, limit) {
  const items = [];
  const itemBlocks = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
  for (const block of itemBlocks) {
    if (items.length >= limit) break;
    const title = extractTag(block, "title");
    const link = extractTag(block, "link");
    const pubDate = extractTag(block, "pubDate");
    if (!title || !link) continue;
    const decodedTitle = decodeEntities(title);
    if (!isHelicopterRelated(decodedTitle)) continue;
    items.push({ title: decodedTitle, link: link.trim(), pubDate: pubDate || "" });
  }
  return items;
}

function extractTag(block, tag) {
  const m = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  if (!m) return "";
  return m[1].replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "").trim();
}

function decodeEntities(s) {
  return s
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');
}

const ALLOWED_SUBS = new Set(["helicopters", "aviation", "flying", "aviationmaintenance", "militaryaviation"]);

exports.handler = async function (event) {
  const source = (event.queryStringParameters && event.queryStringParameters.source) || "reddit";
  const headers = { "Content-Type": "application/json", "Cache-Control": "public, max-age=300" };

  try {
    if (source === "verticalmag") {
      // Vertical Mag is a rotorcraft-only trade publication — verified this specific feed
      // directly (not their site's other feeds, some of which are dead or sponsored-content
      // spotlights) is live and updates daily with real industry news.
      const res = await fetch("https://verticalmag.com/news/feed/", {
        headers: { "User-Agent": "HelipadUSA-NewsFetcher/1.0 (+https://helipadusa.com)" },
      });
      if (!res.ok) throw new Error(`Vertical Mag feed returned ${res.status}`);
      const xml = await res.text();
      return { statusCode: 200, headers, body: JSON.stringify({ items: parseRssItems(xml, RSS_ITEM_LIMIT) }) };
    }

    const subParam = (event.queryStringParameters && event.queryStringParameters.sub) || "helicopters";
    const sub = ALLOWED_SUBS.has(subParam) ? subParam : "helicopters";
    const res = await fetch(`https://www.reddit.com/r/${sub}/hot.json?limit=15`, {
      headers: { "User-Agent": "HelipadUSA-NewsFetcher/1.0 (+https://helipadusa.com)" },
    });
    if (!res.ok) throw new Error(`Reddit returned ${res.status}`);
    const data = await res.json();
    // r/helicopters is helicopter-only by definition, so the keyword filter is skipped there
    // (some posts are just photos/questions with no aircraft model named in the title, and
    // shouldn't be dropped for that). The other subs (aviation, flying, maintenance,
    // military) are general-topic, so every post is filtered down to helicopter-specific
    // ones only, per the site's helicopter-only content policy.
    const posts = ((data.data && data.data.children) || [])
      .map((c) => c.data)
      .filter((p) => !p.stickied)
      .filter((p) => sub === "helicopters" || isHelicopterRelated(p.title + " " + (p.selftext || "")))
      .map((p) => ({
        title: p.title,
        url: p.url,
        permalink: p.permalink,
        selftext: p.selftext,
        score: p.score,
        created_utc: p.created_utc,
      }));
    return { statusCode: 200, headers, body: JSON.stringify({ posts }) };
  } catch (err) {
    return { statusCode: 502, headers, body: JSON.stringify({ error: String(err.message || err) }) };
  }
};
