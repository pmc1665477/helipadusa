const { renderPage } = require("./layout");
const { seoHead } = require("../lib/seo");
const { escapeHtml, escapeAttr } = require("../lib/html");
const { stateSlug } = require("../lib/location");

function renderSchoolDetail(school) {
  const urlPath = `/flight-schools/school/${school.id}-${school.slug}/`;
  const cityState = school.city ? `${school.city}, ${school.state}` : school.state;
  const stateUrlPath = school.state ? `/flight-schools/${stateSlug(school.state)}/` : "/flight-schools/";

  const sameAs = [school.facebook, school.instagram, school.youtube].filter(Boolean);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: school.school_name,
    description: school.description || `Helicopter flight school in ${cityState}`,
    address: { "@type": "PostalAddress", addressLocality: school.city, addressRegion: school.state, addressCountry: "US" },
    url: school.website || undefined,
    telephone: school.phone || undefined,
    sameAs: sameAs.length ? sameAs : undefined,
  };

  const certBadges = [
    school.part61 && "Part 61",
    school.part141 && "Part 141",
    school.va_approved && "VA Approved",
    school.sevis && "SEVIS / F1 Visa",
  ]
    .filter(Boolean)
    .map((b) => escapeHtml(b))
    .join(" &nbsp;·&nbsp; ");

  const aircraft = Array.isArray(school.aircraft) && school.aircraft.length
    ? `<p><strong>Aircraft:</strong> ${school.aircraft.map(escapeHtml).join(", ")}</p>`
    : "";
  const certs = Array.isArray(school.certs) && school.certs.length
    ? `<p><strong>Certificates offered:</strong> ${school.certs.map(escapeHtml).join(", ")}</p>`
    : "";

  const websiteHtml = school.website
    ? `<div class="cta-box"><a href="${escapeAttr(school.website)}" target="_blank" rel="noopener">Visit Website →</a></div>`
    : `<div class="cta-box"><a href="https://www.google.com/search?q=${encodeURIComponent(school.school_name + " " + cityState + " helicopter flight school")}" target="_blank" rel="noopener">Find Website →</a></div>`;

  // Only the legacy-seeded schools (migrated from the old static list) have no owner — new
  // submissions are already owned by whoever submitted them, so this never shows for those.
  const claimHtml = school.user_id
    ? ""
    : `<div class="claim-box">Run this school? <a href="/login.html?claim=${encodeURIComponent(school.id)}&redirect=${encodeURIComponent(urlPath)}">Claim this listing</a> to edit it and add your own photos, website, and details.</div>`;

  const bodyHtml = `
  <p>📍 ${escapeHtml(cityState)}${school.airport ? ` &nbsp;·&nbsp; ✈️ ${escapeHtml(school.airport)}` : ""}</p>
  ${certBadges ? `<p style="margin-top:8px;"><strong>${certBadges}</strong></p>` : ""}
  <h2>About</h2>
  <p>${escapeHtml(school.about || school.description || "Contact this school for more details.")}</p>
  ${aircraft}
  ${certs}
  ${websiteHtml}
  ${claimHtml}
  `.trim();

  const html = renderPage({
    seoHead: seoHead({
      title: `${school.school_name} — Helicopter Flight School in ${cityState} | HelipadUSA`,
      description: (school.description || `${school.school_name}, a helicopter flight school in ${cityState}.`).slice(0, 160),
      path: urlPath,
      jsonLd,
    }),
    breadcrumbHtml: `<a href="/">HelipadUSA</a> › <a href="/flight-schools/">Flight Schools</a> › <a href="${stateUrlPath}">${escapeHtml(school.state)}</a> › ${escapeHtml(school.school_name)}`,
    heroTitle: escapeHtml(school.school_name),
    heroMeta: `<span>📍 ${escapeHtml(cityState)}</span>`,
    bodyHtml,
    quickLinks: [
      { href: "/flight-schools/", label: "🎓 All Flight Schools" },
      { href: stateUrlPath, label: `📍 More in ${escapeHtml(school.state || "")}` },
      { href: "/how-to-become-a-helicopter-pilot.html", label: "🎓 How to Become a Helicopter Pilot" },
      { href: "/add-your-school.html", label: "➕ Add Your School" },
    ],
  });

  return { urlPath, html };
}

module.exports = { renderSchoolDetail };
