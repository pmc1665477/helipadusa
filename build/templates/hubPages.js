const { renderPage } = require("./layout");
const { seoHead, BASE_URL } = require("../lib/seo");
const { escapeHtml } = require("../lib/html");

function breadcrumbList(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

function itemList(items) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${BASE_URL}${item.url}`,
    })),
  };
}

// items: [{ state, count, urlPath }]
function renderDirectoryIndex({ urlPath, pageTitle, description, heroTitle, intro, items, quickLinks }) {
  const cards = items
    .sort((a, b) => a.state.localeCompare(b.state))
    .map(
      (i) =>
        `<a class="guide-link" href="${i.urlPath}">${escapeHtml(i.state)} <span style="color:var(--muted);font-weight:400;">(${i.count})</span></a>`
    )
    .join("\n");

  const jsonLd = [
    itemList(items.map((i) => ({ url: i.urlPath }))),
    breadcrumbList([
      { name: "HelipadUSA", url: BASE_URL + "/" },
      { name: heroTitle, url: BASE_URL + urlPath },
    ]),
  ];

  const bodyHtml = `
  <p>${escapeHtml(intro)}</p>
  <h2>Browse by State</h2>
  <div class="fact-grid" style="grid-template-columns:repeat(auto-fill,minmax(200px,1fr));">
    ${items
      .sort((a, b) => a.state.localeCompare(b.state))
      .map(
        (i) =>
          `<a href="${i.urlPath}" style="text-decoration:none;"><div class="fact-card"><div class="fact-value">${escapeHtml(i.state)}</div><div class="fact-label">${i.count} listed</div></div></a>`
      )
      .join("\n")}
  </div>
  `.trim();

  const html = renderPage({
    seoHead: seoHead({ title: pageTitle, description, path: urlPath, jsonLd }),
    breadcrumbHtml: `<a href="/">HelipadUSA</a> › ${escapeHtml(heroTitle)}`,
    heroTitle: escapeHtml(heroTitle),
    heroMeta: `<span>${items.length} states listed</span>`,
    bodyHtml,
    quickLinks,
  });

  return { urlPath, html };
}

// cities: [{ city, count, urlPath }], ungroupedItems: [{ title, detailUrl }]
function renderStateHub({ urlPath, parentUrlPath, parentLabel, pageTitle, description, heroTitle, state, cities, ungroupedItems, quickLinks }) {
  const jsonLd = [
    itemList([...cities.map((c) => ({ url: c.urlPath })), ...ungroupedItems.map((i) => ({ url: i.detailUrl }))]),
    breadcrumbList([
      { name: "HelipadUSA", url: BASE_URL + "/" },
      { name: parentLabel, url: BASE_URL + parentUrlPath },
      { name: state, url: BASE_URL + urlPath },
    ]),
  ];

  const cityCards = cities
    .sort((a, b) => a.city.localeCompare(b.city))
    .map(
      (c) =>
        `<a href="${c.urlPath}" style="text-decoration:none;"><div class="fact-card"><div class="fact-value">${escapeHtml(c.city)}</div><div class="fact-label">${c.count} listed</div></div></a>`
    )
    .join("\n");

  const ungroupedHtml = ungroupedItems.length
    ? `<h2>More in ${escapeHtml(state)}</h2><ul>${ungroupedItems.map((i) => `<li><a href="${i.detailUrl}">${escapeHtml(i.title)}</a></li>`).join("")}</ul>`
    : "";

  const bodyHtml = `
  <p>Browse ${escapeHtml(parentLabel).toLowerCase()} across ${escapeHtml(state)}, organized by city.</p>
  <h2>Cities in ${escapeHtml(state)}</h2>
  <div class="fact-grid" style="grid-template-columns:repeat(auto-fill,minmax(200px,1fr));">${cityCards}</div>
  ${ungroupedHtml}
  `.trim();

  const html = renderPage({
    seoHead: seoHead({ title: pageTitle, description, path: urlPath, jsonLd }),
    breadcrumbHtml: `<a href="/">HelipadUSA</a> › <a href="${parentUrlPath}">${escapeHtml(parentLabel)}</a> › ${escapeHtml(state)}`,
    heroTitle: escapeHtml(heroTitle),
    heroMeta: `<span>${cities.length} cities</span>`,
    bodyHtml,
    quickLinks,
  });

  return { urlPath, html };
}

// items: [{ title, subtitle, detailUrl }]
function renderCityHub({ urlPath, parentUrlPath, parentLabel, stateUrlPath, state, city, pageTitle, description, heroTitle, items, quickLinks }) {
  const jsonLd = [
    itemList(items.map((i) => ({ url: i.detailUrl }))),
    breadcrumbList([
      { name: "HelipadUSA", url: BASE_URL + "/" },
      { name: parentLabel, url: BASE_URL + parentUrlPath },
      { name: state, url: BASE_URL + stateUrlPath },
      { name: city, url: BASE_URL + urlPath },
    ]),
  ];

  const itemsHtml = items
    .map((i) => `<li><a href="${i.detailUrl}"><strong>${escapeHtml(i.title)}</strong></a>${i.subtitle ? ` — ${escapeHtml(i.subtitle)}` : ""}</li>`)
    .join("\n");

  const bodyHtml = `
  <p>${items.length} listed in ${escapeHtml(city)}, ${escapeHtml(state)}.</p>
  <ul>${itemsHtml}</ul>
  `.trim();

  const html = renderPage({
    seoHead: seoHead({ title: pageTitle, description, path: urlPath, jsonLd }),
    breadcrumbHtml: `<a href="/">HelipadUSA</a> › <a href="${parentUrlPath}">${escapeHtml(parentLabel)}</a> › <a href="${stateUrlPath}">${escapeHtml(state)}</a> › ${escapeHtml(city)}`,
    heroTitle: escapeHtml(heroTitle),
    heroMeta: `<span>📍 ${escapeHtml(city)}, ${escapeHtml(state)}</span>`,
    bodyHtml,
    quickLinks,
  });

  return { urlPath, html };
}

module.exports = { renderDirectoryIndex, renderStateHub, renderCityHub };
