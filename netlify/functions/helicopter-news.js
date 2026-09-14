// Fetches Reddit and Flying Magazine RSS server-side, so the browser never talks to either
// directly. Both of those direct-from-browser calls were failing for structural reasons that
// no amount of client-side retrying can fix:
//   - Reddit's JSON endpoints don't send CORS headers for arbitrary browser origins, so a
//     browser fetch to reddit.com is blocked by the browser itself before any response body
//     is even read.
//   - The free rss2json.com proxy (used to work around the same CORS problem for RSS) shares
//     a rate-limited quota across all of its free users, which is the likely source of the
//     422 errors seen on the live site.
// A server fetching either source has no CORS restriction at all (CORS only limits browsers),
// so doing it here removes both failure points and the third-party proxy dependency entirely.

const RSS_ITEM_LIMIT = 6;

function parseRssItems(xml, limit) {
  const items = [];
  const itemBlocks = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
  for (const block of itemBlocks.slice(0, limit)) {
    const title = extractTag(block, "title");
    const link = extractTag(block, "link");
    const pubDate = extractTag(block, "pubDate");
    if (title && link) items.push({ title: decodeEntities(title), link: link.trim(), pubDate: pubDate || "" });
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
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'");
}

const ALLOWED_SUBS = new Set(["helicopters", "aviation", "flying", "aviationmaintenance", "militaryaviation"]);

exports.handler = async function (event) {
  const source = (event.queryStringParameters && event.queryStringParameters.source) || "reddit";
  const headers = { "Content-Type": "application/json", "Cache-Control": "public, max-age=300" };

  try {
    if (source === "flyingmag") {
      // /helicopters/feed/ looked like a category feed but is actually a dead WordPress
      // comments feed (empty, stale) — flyingmag.com no longer has a helicopters category
      // page at all (it 301s to an unrelated old article). Their main site feed is real and
      // updates daily; not helicopter-exclusive, but genuine, live aviation news.
      const res = await fetch("https://www.flyingmag.com/feed/", {
        headers: { "User-Agent": "HelipadUSA-NewsFetcher/1.0 (+https://helipadusa.com)" },
      });
      if (!res.ok) throw new Error(`Flying Mag feed returned ${res.status}`);
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
    const posts = ((data.data && data.data.children) || [])
      .map((c) => c.data)
      .filter((p) => !p.stickied)
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
