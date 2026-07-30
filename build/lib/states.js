const STATES = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "District of Columbia",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho", IL: "Illinois",
  IN: "Indiana", IA: "Iowa", KS: "Kansas", KY: "Kentucky", LA: "Louisiana",
  ME: "Maine", MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota",
  MS: "Mississippi", MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada",
  NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York",
  NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon",
  PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota",
  TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia",
  WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};

const FULL_NAME_TO_ABBR = Object.fromEntries(
  Object.entries(STATES).map(([abbr, full]) => [full.toLowerCase(), abbr])
);

// Accepts either "TX" or "Texas" (any case) and returns the canonical full name, or null if
// it doesn't match a real US state — used so jobs/tours (often "City, TX") and schools
// (already stored as "Texas") end up grouped under the exact same hub page.
function normalizeState(input) {
  const s = String(input || "").trim();
  if (!s) return null;
  const upper = s.toUpperCase();
  if (STATES[upper]) return STATES[upper];
  const full = FULL_NAME_TO_ABBR[s.toLowerCase()];
  return full ? STATES[full] : null;
}

module.exports = { STATES, normalizeState };
