const { escapeAttr } = require("./html");

const BASE_URL = "https://helipadusa.com";

// index.html's own canonical/OG tags point at the "www" host, but that host actually
// redirects (301) to the bare domain in production — so the bare domain is the real
// canonical one, and every new page here uses that rather than repeating the old mismatch.
function seoHead({ title, description, path, jsonLd }) {
  const canonical = `${BASE_URL}${path}`;
  const jsonLdBlocks = (Array.isArray(jsonLd) ? jsonLd : [jsonLd])
    .filter(Boolean)
    .map((obj) => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`)
    .join("\n");

  return `<title>${escapeAttr(title)}</title>
<meta name="description" content="${escapeAttr(description)}">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="website">
<meta property="og:url" content="${canonical}">
<meta property="og:title" content="${escapeAttr(title)}">
<meta property="og:description" content="${escapeAttr(description)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeAttr(title)}">
<meta name="twitter:description" content="${escapeAttr(description)}">
${jsonLdBlocks}`;
}

module.exports = { seoHead, BASE_URL };
