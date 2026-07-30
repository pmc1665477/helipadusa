const fs = require("node:fs");
const path = require("node:path");
const { fetchAll } = require("./lib/supabase");
const { renderJobDetail } = require("./templates/jobDetail");
const { renderTourDetail } = require("./templates/tourDetail");
const { renderListingDetail } = require("./templates/listingDetail");
const { renderSchoolDetail } = require("./templates/schoolDetail");

const ROOT = path.join(__dirname, "..");

function writePage(urlPath, html) {
  // urlPath like "/helicopter-jobs/job/abc-123/" -> write to <root>/helicopter-jobs/job/abc-123/index.html
  // so Netlify's default "serve index.html for a directory" behavior gives the clean URL.
  const dir = path.join(ROOT, urlPath.replace(/^\/|\/$/g, ""));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html, "utf-8");
}

const START_MARKER = "# BEGIN GENERATED LISTING REDIRECTS — written by build/generate.js, do not edit by hand.";
const END_MARKER = "# END GENERATED LISTING REDIRECTS";

function updateRedirectsWithLegacyListings(listingIds) {
  const redirectsPath = path.join(ROOT, "_redirects");
  const current = fs.readFileSync(redirectsPath, "utf-8");
  const startIdx = current.indexOf(START_MARKER);
  const endIdx = current.indexOf(END_MARKER);
  if (startIdx === -1 || endIdx === -1) {
    console.warn("HelipadUSA build: _redirects markers not found, skipping legacy listing redirects.");
    return;
  }

  const generatedBlock = [
    START_MARKER,
    "# One explicit 301 per existing /helicopter/:id listing, so anyone who already has that old",
    "# link keeps landing on the right page (preserving any SEO/link value it earned) instead of",
    "# just falling through to the generic wildcard rule below.",
    ...listingIds.map(({ id, urlPath }) => `/helicopter/${id}  ${urlPath}  301`),
    END_MARKER,
  ].join("\n");

  const before = current.slice(0, startIdx);
  const after = current.slice(endIdx + END_MARKER.length);
  fs.writeFileSync(redirectsPath, `${before}${generatedBlock}${after}`, "utf-8");
}

async function main() {
  console.log("HelipadUSA build: fetching data from Supabase...");
  const [jobs, tours, listings, schools] = await Promise.all([
    fetchAll("heli_jobs", "select=*"),
    fetchAll("heli_tours", "select=*"),
    fetchAll("heli_listings", "select=*"),
    fetchAll("heli_schools", "select=*&status=eq.published"),
  ]);
  console.log(`HelipadUSA build: ${jobs.length} jobs, ${tours.length} tours, ${listings.length} listings, ${schools.length} schools.`);

  let count = 0;
  const legacyListingRedirects = [];

  for (const job of jobs) {
    const { urlPath, html } = renderJobDetail(job);
    writePage(urlPath, html);
    count++;
  }
  for (const tour of tours) {
    const { urlPath, html } = renderTourDetail(tour);
    writePage(urlPath, html);
    count++;
  }
  for (const listing of listings) {
    const { urlPath, html } = renderListingDetail(listing);
    writePage(urlPath, html);
    legacyListingRedirects.push({ id: listing.id, urlPath });
    count++;
  }
  for (const school of schools) {
    const { urlPath, html } = renderSchoolDetail(school);
    writePage(urlPath, html);
    count++;
  }

  updateRedirectsWithLegacyListings(legacyListingRedirects);

  console.log(`HelipadUSA build: generated ${count} pages.`);
}

main().catch((err) => {
  console.error("HelipadUSA build failed:", err);
  process.exit(1);
});
