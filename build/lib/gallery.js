const { escapeAttr } = require("./html");

// Renders every photo, not just the first — used by listing/job/tour detail pages, which all
// let the poster upload multiple photos but previously only ever displayed photos[0].
function renderGalleryHtml(photos, altText) {
  if (!photos || !photos.length) return "";
  const thumbs = photos.length > 1
    ? `<div class="listing-gallery-thumbs">${photos
        .map(
          (p, i) =>
            `<img src="${escapeAttr(p)}" alt="${escapeAttr(altText)} photo ${i + 1}" class="listing-gallery-thumb${i === 0 ? " active" : ""}" onclick="document.getElementById('lg-main').src=this.src;document.querySelectorAll('.listing-gallery-thumb').forEach(t=>t.classList.remove('active'));this.classList.add('active');">`
        )
        .join("\n")}</div>`
    : "";
  return `<div class="listing-gallery">
    <img id="lg-main" class="listing-gallery-main" src="${escapeAttr(photos[0])}" alt="${escapeAttr(altText)}">
    ${thumbs}
  </div>`;
}

module.exports = { renderGalleryHtml };
