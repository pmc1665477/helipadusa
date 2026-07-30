const { stateSlug } = require("./location");
const { slugify } = require("./slugify");
const { renderDirectoryIndex, renderStateHub, renderCityHub } = require("../templates/hubPages");

// items: [{ id, title, subtitle, detailUrl, state, city }] — state/city may be null for items
// whose location couldn't be parsed; those are simply excluded from the hub structure (they're
// still reachable via their own detail page and the top-level site, just not grouped anywhere).
function buildHubsForType({ urlPrefix, parentLabel, pageNounSingular, pageNounPlural, items, quickLinks }) {
  // An empty directory/state/city page (no listings at all) is exactly the kind of thin,
  // low-value programmatic page Google's guidelines warn against — skip generating any hub
  // pages for this type until it actually has real content. Once the first row is submitted,
  // the freshness pipeline rebuilds automatically and these start appearing on their own.
  if (!items.length) return [];

  const pages = [];
  const byState = new Map();

  for (const item of items) {
    if (!item.state) continue;
    if (!byState.has(item.state)) byState.set(item.state, new Map());
    const byCity = byState.get(item.state);
    const cityKey = item.city || "__unknown__";
    if (!byCity.has(cityKey)) byCity.set(cityKey, []);
    byCity.get(cityKey).push(item);
  }

  const directoryItems = [];

  for (const [state, byCity] of byState) {
    const sSlug = stateSlug(state);
    const stateUrlPath = `${urlPrefix}/${sSlug}/`;
    const cityHubs = [];
    const ungroupedItems = [];
    let stateTotal = 0;

    for (const [cityKey, cityItems] of byCity) {
      stateTotal += cityItems.length;
      if (cityKey === "__unknown__") {
        for (const item of cityItems) ungroupedItems.push({ title: item.title, detailUrl: item.detailUrl });
        continue;
      }
      const cSlug = slugify(cityKey);
      const cityUrlPath = `${stateUrlPath}${cSlug}/`;
      cityHubs.push({ city: cityKey, count: cityItems.length, urlPath: cityUrlPath });

      const { urlPath, html } = renderCityHub({
        urlPath: cityUrlPath,
        parentUrlPath: `${urlPrefix}/`,
        parentLabel,
        stateUrlPath,
        state,
        city: cityKey,
        pageTitle: `${pageNounPlural} in ${cityKey}, ${state} | HelipadUSA`,
        description: `${cityItems.length} ${pageNounPlural.toLowerCase()} in ${cityKey}, ${state}.`,
        heroTitle: `${pageNounPlural} in ${cityKey}, ${state}`,
        items: cityItems.map((i) => ({ title: i.title, subtitle: i.subtitle, detailUrl: i.detailUrl })),
        quickLinks,
      });
      pages.push({ urlPath, html });
    }

    directoryItems.push({ state, count: stateTotal, urlPath: stateUrlPath });

    const { urlPath, html } = renderStateHub({
      urlPath: stateUrlPath,
      parentUrlPath: `${urlPrefix}/`,
      parentLabel,
      pageTitle: `${pageNounPlural} in ${state} | HelipadUSA`,
      description: `Browse ${pageNounPlural.toLowerCase()} across ${state}, organized by city.`,
      heroTitle: `${pageNounPlural} in ${state}`,
      state,
      cities: cityHubs,
      ungroupedItems,
      quickLinks,
    });
    pages.push({ urlPath, html });
  }

  const { urlPath: indexUrlPath, html: indexHtml } = renderDirectoryIndex({
    urlPath: `${urlPrefix}/`,
    pageTitle: `${pageNounPlural} by State | HelipadUSA`,
    description: `Browse ${pageNounPlural.toLowerCase()} across every US state on HelipadUSA.`,
    heroTitle: parentLabel,
    intro: `Every ${pageNounSingular.toLowerCase()} on HelipadUSA, organized by state so you can find what's near you.`,
    items: directoryItems,
    quickLinks,
  });
  pages.push({ urlPath: indexUrlPath, html: indexHtml });

  return pages;
}

module.exports = { buildHubsForType };
