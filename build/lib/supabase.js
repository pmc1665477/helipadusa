const SUPABASE_URL = "https://jjmbchgiocozfmywrhgo.supabase.co";
// Same public/publishable key already embedded in every page's client-side JS — safe to use
// here too, since it carries no more access server-side than it already does in the browser.
const SUPABASE_KEY = "sb_publishable_VEts7rJyk3tGoysAAErRVg_4bEchQsy";

// PostgREST caps a single response at 1000 rows by default. Paginate with Range headers so
// this keeps working correctly once any table grows past that, instead of silently truncating.
async function fetchAll(table, query) {
  const pageSize = 1000;
  let all = [];
  let offset = 0;
  for (;;) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${query}`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        Range: `${offset}-${offset + pageSize - 1}`,
      },
    });
    if (!res.ok) {
      throw new Error(`Supabase fetch failed for ${table}: ${res.status} ${await res.text()}`);
    }
    const rows = await res.json();
    all = all.concat(rows);
    if (rows.length < pageSize) break;
    offset += pageSize;
  }
  return all;
}

module.exports = { fetchAll };
