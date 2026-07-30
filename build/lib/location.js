const { normalizeState } = require("./states");
const { slugify } = require("./slugify");

// Jobs/tours/listings only ever store a single free-text "location" field like "Dallas, TX"
// or "Grand Canyon, AZ" (verified against real data) — best-effort split into city + a
// normalized state name, so these can be grouped into the same state/city hub pages as
// schools (which already have real, separate city/state columns).
function parseLocation(location, preferredState) {
  const raw = String(location || "").trim();
  const preferred = preferredState ? normalizeState(preferredState) : null;

  const m = /^(.*),\s*([A-Za-z .]+)$/.exec(raw);
  if (m) {
    const state = preferred || normalizeState(m[2]);
    if (state) return { city: m[1].trim(), state };
  }
  if (preferred) return { city: raw || null, state: preferred };
  return { city: raw || null, state: null };
}

function stateSlug(stateFullName) {
  return slugify(stateFullName);
}

module.exports = { parseLocation, stateSlug };
