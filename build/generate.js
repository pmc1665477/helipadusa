const fs = require("node:fs");
const path = require("node:path");
const { fetchAll } = require("./lib/supabase");
const { parseLocation } = require("./lib/location");
const { buildHubsForType } = require("./lib/buildHubs");
const { renderJobDetail } = require("./templates/jobDetail");
const { renderTourDetail } = require("./templates/tourDetail");
const { renderListingDetail, fmtPrice } = require("./templates/listingDetail");
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

const JOB_QUICK_LINKS = [
  { href: "/#content-jobs", label: "💼 Post a Job / Latest Jobs" },
  { href: "/#content-training", label: "🎓 Find a Flight School" },
  { href: "/helicopter-for-sale.html", label: "🚁 Helicopters For Sale" },
];
const TOUR_QUICK_LINKS = [
  { href: "/#content-tours", label: "🌎 Latest Tours" },
  { href: "/best-helicopter-tours-usa.html", label: "🌎 Best Tours in the USA Guide" },
  { href: "/#content-jobs", label: "💼 Helicopter Job Board" },
];
const LISTING_QUICK_LINKS = [
  { href: "/helicopter-for-sale.html", label: "🚁 Latest Helicopters For Sale" },
  { href: "/how-much-does-a-helicopter-cost.html", label: "💵 How Much Does a Helicopter Cost?" },
  { href: "/#content-jobs", label: "💼 Helicopter Job Board" },
];
const SCHOOL_QUICK_LINKS = [
  { href: "/flight-schools/", label: "🎓 Browse All Flight Schools" },
  { href: "/how-to-become-a-helicopter-pilot.html", label: "🎓 How to Become a Helicopter Pilot" },
  { href: "/add-your-school.html", label: "➕ Add Your School" },
];

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
  const jobItems = [];
  const tourItems = [];
  const listingItems = [];
  const schoolItems = [];

  for (const job of jobs) {
    const { urlPath, html } = renderJobDetail(job);
    writePage(urlPath, html);
    count++;
    const { city, state } = parseLocation(job.location);
    jobItems.push({ id: job.id, title: job.job_title, subtitle: job.company, detailUrl: urlPath, state, city });
  }
  for (const tour of tours) {
    const { urlPath, html } = renderTourDetail(tour);
    writePage(urlPath, html);
    count++;
    const { city, state } = parseLocation(tour.location, tour.state);
    tourItems.push({ id: tour.id, title: tour.company_name, subtitle: undefined, detailUrl: urlPath, state, city });
  }
  for (const listing of listings) {
    const { urlPath, html } = renderListingDetail(listing);
    writePage(urlPath, html);
    legacyListingRedirects.push({ id: listing.id, urlPath });
    count++;
    const { city, state } = parseLocation(listing.location);
    listingItems.push({ id: listing.id, title: listing.title, subtitle: fmtPrice(listing.price), detailUrl: urlPath, state, city });
  }
  for (const school of schools) {
    const { urlPath, html } = renderSchoolDetail(school);
    writePage(urlPath, html);
    count++;
    schoolItems.push({ id: school.id, title: school.school_name, subtitle: undefined, detailUrl: urlPath, state: school.state, city: school.city });
  }

  updateRedirectsWithLegacyListings(legacyListingRedirects);

  const hubPages = [
    ...buildHubsForType({
      urlPrefix: "/helicopter-jobs",
      parentLabel: "Helicopter Jobs",
      pageNounSingular: "Job",
      pageNounPlural: "Helicopter Jobs",
      items: jobItems,
      quickLinks: JOB_QUICK_LINKS,
    }),
    ...buildHubsForType({
      urlPrefix: "/helicopter-tours",
      parentLabel: "Helicopter Tours",
      pageNounSingular: "Tour",
      pageNounPlural: "Helicopter Tours",
      items: tourItems,
      quickLinks: TOUR_QUICK_LINKS,
    }),
    ...buildHubsForType({
      urlPrefix: "/helicopters-for-sale",
      parentLabel: "Helicopters For Sale",
      pageNounSingular: "Listing",
      pageNounPlural: "Helicopters For Sale",
      items: listingItems,
      quickLinks: LISTING_QUICK_LINKS,
    }),
    ...buildHubsForType({
      urlPrefix: "/flight-schools",
      parentLabel: "Flight Schools",
      pageNounSingular: "Flight School",
      pageNounPlural: "Flight Schools",
      items: schoolItems,
      quickLinks: SCHOOL_QUICK_LINKS,
    }),
  ];

  for (const { urlPath, html } of hubPages) {
    writePage(urlPath, html);
    count++;
  }

  console.log(`HelipadUSA build: generated ${count} pages (including ${hubPages.length} hub pages).`);
}

main().catch((err) => {
  console.error("HelipadUSA build failed:", err);
  process.exit(1);
});
