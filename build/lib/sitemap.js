const fs = require("node:fs");
const path = require("node:path");
const { BASE_URL } = require("./seo");

function xmlEscape(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function urlEntry(loc, lastmod, changefreq, priority) {
  return `<url><loc>${xmlEscape(BASE_URL + loc)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}<changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`;
}

function writeSitemap(rootDir, filename, urlEntries) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries.join("\n")}\n</urlset>\n`;
  fs.writeFileSync(path.join(rootDir, filename), xml, "utf-8");
}

// Hand-curated — these are the real, publicly-indexable hand-authored pages. Deliberately
// excludes account/utility pages (login, signup, my-listings, password reset — already
// disallowed in robots.txt) and a couple of stray duplicate-looking files found in the repo
// (e.g. "How Much Does a Helicopter Cost.html", "helipadusa-index-US-ONLY.html") that aren't
// linked from anywhere and don't look like real routes.
const STATIC_PAGES = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/about.html", priority: "0.5", changefreq: "monthly" },
  { path: "/contact.html", priority: "0.3", changefreq: "yearly" },
  { path: "/terms.html", priority: "0.2", changefreq: "yearly" },
  { path: "/privacy-policy.html", priority: "0.2", changefreq: "yearly" },
  { path: "/merch.html", priority: "0.4", changefreq: "monthly" },
  { path: "/helicopter-for-sale.html", priority: "0.8", changefreq: "daily" },
  { path: "/submit-footage.html", priority: "0.3", changefreq: "monthly" },
  { path: "/add-your-school.html", priority: "0.4", changefreq: "monthly" },
  { path: "/helicopter-pilot-salary.html", priority: "0.7", changefreq: "monthly" },
  { path: "/how-to-become-a-helicopter-pilot.html", priority: "0.7", changefreq: "monthly" },
  { path: "/robinson-r22-vs-r44.html", priority: "0.6", changefreq: "monthly" },
  { path: "/best-helicopter-tours-usa.html", priority: "0.6", changefreq: "monthly" },
  { path: "/helicopter-emergency-procedures.html", priority: "0.5", changefreq: "monthly" },
  { path: "/famous-helicopter-pilots.html", priority: "0.5", changefreq: "monthly" },
  { path: "/helicopter-maintenance-guide.html", priority: "0.5", changefreq: "monthly" },
  { path: "/helicopter-jobs-no-experience.html", priority: "0.6", changefreq: "monthly" },
  { path: "/helicopter-world-records.html", priority: "0.4", changefreq: "monthly" },
  { path: "/best-helicopter-movies.html", priority: "0.4", changefreq: "monthly" },
  { path: "/helicopter-vs-airplane.html", priority: "0.5", changefreq: "monthly" },
  { path: "/how-much-does-a-helicopter-cost.html", priority: "0.6", changefreq: "monthly" },
  { path: "/helicopter-ownership-costs.html", priority: "0.5", changefreq: "monthly" },
  { path: "/drones-vs-helicopter-jobs.html", priority: "0.4", changefreq: "monthly" },
];

// pages: { schools, jobs, tours, listings } — each an array of { urlPath, lastmod } for every
// detail + hub page of that type (lastmod omitted for hub pages, which have no single natural
// "last modified" date — the sitemap spec treats a missing lastmod as perfectly valid).
function generateSitemaps(rootDir, pages) {
  writeSitemap(rootDir, "sitemap-pages.xml", STATIC_PAGES.map((p) => urlEntry(p.path, undefined, p.changefreq, p.priority)));
  writeSitemap(rootDir, "sitemap-schools.xml", pages.schools.map((p) => urlEntry(p.urlPath, p.lastmod, "weekly", "0.6")));
  writeSitemap(rootDir, "sitemap-jobs.xml", pages.jobs.map((p) => urlEntry(p.urlPath, p.lastmod, "daily", "0.6")));
  writeSitemap(rootDir, "sitemap-tours.xml", pages.tours.map((p) => urlEntry(p.urlPath, p.lastmod, "weekly", "0.6")));
  writeSitemap(rootDir, "sitemap-listings.xml", pages.listings.map((p) => urlEntry(p.urlPath, p.lastmod, "daily", "0.6")));

  const subSitemaps = ["sitemap-pages.xml", "sitemap-schools.xml", "sitemap-jobs.xml", "sitemap-tours.xml", "sitemap-listings.xml"];
  const indexXml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${subSitemaps
    .map((f) => `<sitemap><loc>${BASE_URL}/${f}</loc></sitemap>`)
    .join("\n")}\n</sitemapindex>\n`;
  fs.writeFileSync(path.join(rootDir, "sitemap-index.xml"), indexXml, "utf-8");
}

module.exports = { generateSitemaps };
