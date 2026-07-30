const { renderPage } = require("./layout");
const { seoHead } = require("../lib/seo");
const { slugify } = require("../lib/slugify");
const { escapeHtml, escapeAttr } = require("../lib/html");

// "City, ST" is the only shape this free-text field is ever entered in (verified against
// existing data) — best-effort split for JobPosting's required jobLocation.address, falling
// back to putting the whole string in addressLocality if it doesn't match.
function splitLocation(location) {
  const m = /^(.*),\s*([A-Za-z]{2,})$/.exec(String(location || "").trim());
  if (m) return { locality: m[1].trim(), region: m[2].trim() };
  return { locality: String(location || "").trim(), region: undefined };
}

function renderJobDetail(job) {
  const slug = slugify(job.job_title);
  const urlPath = `/helicopter-jobs/job/${job.id}-${slug}/`;
  const { locality, region } = splitLocation(job.location);
  const postedDate = job.created_at ? job.created_at.slice(0, 10) : undefined;
  const validThrough = job.created_at
    ? new Date(new Date(job.created_at).getTime() + 90 * 24 * 3600 * 1000).toISOString().slice(0, 10)
    : undefined;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.job_title,
    description: job.description || job.job_title,
    datePosted: postedDate,
    validThrough,
    employmentType: job.job_type ? String(job.job_type).toUpperCase().replace(/[^A-Z]+/g, "_") : undefined,
    hiringOrganization: { "@type": "Organization", name: job.company },
    jobLocation: {
      "@type": "Place",
      address: { "@type": "PostalAddress", addressLocality: locality, addressRegion: region, addressCountry: "US" },
    },
  };

  const photo = Array.isArray(job.photo_urls) && job.photo_urls[0];
  const applyHtml = job.apply_url
    ? `<div class="cta-box"><a href="${escapeAttr(job.apply_url)}" target="_blank" rel="noopener">Apply Now →</a></div>`
    : job.contact_email
      ? `<div class="cta-box"><a href="mailto:${escapeAttr(job.contact_email)}">Email to Apply →</a></div>`
      : "";

  const bodyHtml = `
  <p><strong>${escapeHtml(job.company)}</strong> &nbsp;·&nbsp; 📍 ${escapeHtml(job.location)}${job.job_type ? ` &nbsp;·&nbsp; ${escapeHtml(job.job_type)}` : ""}${job.is_featured ? " &nbsp;·&nbsp; ⭐ Featured" : ""}</p>
  ${photo ? `<p><img src="${escapeAttr(photo)}" alt="${escapeAttr(job.job_title)}" style="max-width:100%;border-radius:8px;margin:16px 0;"></p>` : ""}
  <h2>About This Position</h2>
  <p>${escapeHtml(job.description)}</p>
  ${applyHtml}
  `.trim();

  const html = renderPage({
    seoHead: seoHead({
      title: `${job.job_title} — ${job.company} | HelipadUSA Jobs`,
      description: (job.description || `${job.job_title} at ${job.company}, ${job.location}.`).slice(0, 160),
      path: urlPath,
      jsonLd,
    }),
    breadcrumbHtml: `<a href="/">HelipadUSA</a> › <a href="/#content-jobs">Jobs</a> › ${escapeHtml(job.job_title)}`,
    heroTitle: escapeHtml(job.job_title),
    heroMeta: `<span>🏢 ${escapeHtml(job.company)}</span><span>📍 ${escapeHtml(job.location)}</span>`,
    bodyHtml,
    quickLinks: [
      { href: "/#content-jobs", label: "💼 All Helicopter Jobs" },
      { href: "/#content-training", label: "🎓 Find a Flight School" },
      { href: "/helicopter-for-sale.html", label: "🚁 Helicopters For Sale" },
    ],
  });

  return { urlPath, html };
}

module.exports = { renderJobDetail };
