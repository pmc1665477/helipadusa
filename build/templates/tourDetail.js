const { renderPage } = require("./layout");
const { seoHead } = require("../lib/seo");
const { slugify } = require("../lib/slugify");
const { escapeHtml, escapeAttr } = require("../lib/html");

function renderTourDetail(tour) {
  const slug = slugify(tour.company_name);
  const urlPath = `/helicopter-tours/tour/${tour.id}-${slug}/`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: tour.company_name,
    description: tour.description || `Helicopter tours from ${tour.company_name}`,
    address: { "@type": "PostalAddress", addressLocality: tour.location, addressRegion: tour.state, addressCountry: "US" },
    url: tour.website_url || undefined,
    priceRange: tour.price_from ? String(tour.price_from) : undefined,
  };

  const photo = Array.isArray(tour.photo_urls) && tour.photo_urls[0];
  const bookHtml = tour.website_url
    ? `<div class="cta-box"><a href="${escapeAttr(tour.website_url)}" target="_blank" rel="noopener">Book Now →</a></div>`
    : tour.contact_email
      ? `<div class="cta-box"><a href="mailto:${escapeAttr(tour.contact_email)}">Contact to Book →</a></div>`
      : "";

  const bodyHtml = `
  <p>📍 ${escapeHtml(tour.location)}${tour.price_from ? ` &nbsp;·&nbsp; From ${escapeHtml(tour.price_from)}` : ""}</p>
  ${photo ? `<p><img src="${escapeAttr(photo)}" alt="${escapeAttr(tour.company_name)}" style="max-width:100%;border-radius:8px;margin:16px 0;"></p>` : ""}
  <h2>About This Tour</h2>
  <p>${escapeHtml(tour.description || "Details available upon request.")}</p>
  ${bookHtml}
  `.trim();

  const html = renderPage({
    seoHead: seoHead({
      title: `${tour.company_name} Helicopter Tours — ${tour.location} | HelipadUSA`,
      description: (tour.description || `Book a helicopter tour with ${tour.company_name} in ${tour.location}.`).slice(0, 160),
      path: urlPath,
      jsonLd,
    }),
    breadcrumbHtml: `<a href="/">HelipadUSA</a> › <a href="/#content-tours">Tours</a> › ${escapeHtml(tour.company_name)}`,
    heroTitle: escapeHtml(tour.company_name),
    heroMeta: `<span>📍 ${escapeHtml(tour.location)}</span>`,
    bodyHtml,
    quickLinks: [
      { href: "/#content-tours", label: "🌎 All Helicopter Tours" },
      { href: "/best-helicopter-tours-usa.html", label: "🌎 Best Tours in the USA Guide" },
      { href: "/#content-jobs", label: "💼 Helicopter Job Board" },
    ],
  });

  return { urlPath, html };
}

module.exports = { renderTourDetail };
