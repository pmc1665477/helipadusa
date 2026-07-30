const { renderPage } = require("./layout");
const { seoHead } = require("../lib/seo");
const { slugify } = require("../lib/slugify");
const { escapeHtml, escapeAttr } = require("../lib/html");

function fmtPrice(price) {
  const n = Number(price);
  return Number.isFinite(n) ? `$${n.toLocaleString("en-US")}` : null;
}

function renderListingDetail(listing) {
  const slug = slugify(listing.title);
  const urlPath = `/helicopters-for-sale/listing/${listing.id}-${slug}/`;
  const photos = Array.isArray(listing.photo_urls) ? listing.photo_urls : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    description: listing.description || `${listing.title} helicopter for sale on HelipadUSA`,
    image: photos.length ? photos : undefined,
    offers: {
      "@type": "Offer",
      price: listing.price || undefined,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      areaServed: listing.location || undefined,
    },
  };

  const facts = [
    ["Year", listing.year],
    ["Make", listing.make],
    ["Model", listing.model],
    ["Total Time", listing.total_time],
    ["Engine Time", listing.engine_time],
    ["Location", listing.location],
  ].filter(([, v]) => v);

  const factCards = facts
    .map(([label, value]) => `<div class="fact-card"><div class="fact-label">${escapeHtml(label)}</div><div class="fact-value">${escapeHtml(value)}</div></div>`)
    .join("\n");

  const contactHtml = listing.seller_email
    ? `<div class="cta-box"><a href="mailto:${escapeAttr(listing.seller_email)}">Contact Seller →</a></div>`
    : "";

  const priceLine = fmtPrice(listing.price);

  const bodyHtml = `
  ${priceLine ? `<p style="font-family:'Barlow Condensed',sans-serif;font-size:32px;font-weight:900;color:var(--rotor);">${priceLine}</p>` : ""}
  ${photos[0] ? `<p><img src="${escapeAttr(photos[0])}" alt="${escapeAttr(listing.title)}" style="max-width:100%;border-radius:8px;margin:12px 0;"></p>` : ""}
  <div class="fact-grid">${factCards}</div>
  <h2>Description</h2>
  <p>${escapeHtml(listing.description || "Contact the seller for more details.")}</p>
  ${contactHtml}
  `.trim();

  const html = renderPage({
    seoHead: seoHead({
      title: `${listing.title}${priceLine ? " — " + priceLine : ""} | HelipadUSA`,
      description: (listing.description || `${listing.title} helicopter for sale.`).slice(0, 160),
      path: urlPath,
      jsonLd,
    }),
    breadcrumbHtml: `<a href="/">HelipadUSA</a> › <a href="/helicopter-for-sale.html">For Sale</a> › ${escapeHtml(listing.title)}`,
    heroTitle: escapeHtml(listing.title),
    heroMeta: `${listing.location ? `<span>📍 ${escapeHtml(listing.location)}</span>` : ""}${priceLine ? `<span>💵 ${priceLine}</span>` : ""}`,
    bodyHtml,
    quickLinks: [
      { href: "/helicopter-for-sale.html", label: "🚁 All Helicopters For Sale" },
      { href: "/how-much-does-a-helicopter-cost.html", label: "💵 How Much Does a Helicopter Cost?" },
      { href: "/#content-jobs", label: "💼 Helicopter Job Board" },
    ],
  });

  return { urlPath, html };
}

module.exports = { renderListingDetail, fmtPrice };
