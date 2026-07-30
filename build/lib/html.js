// User-submitted content (job titles, school descriptions, etc.) gets baked directly into
// static HTML at build time, so every interpolated value must be escaped here — otherwise a
// submission containing `"><script>` would execute for every visitor to that page.
function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/"/g, "&quot;");
}

module.exports = { escapeHtml, escapeAttr };
