// One shared page shell for every page this generator produces, so a future header/footer/CSS
// change only has to happen here instead of across hundreds of generated files. The existing
// hand-authored pages (guides, about.html, etc.) intentionally keep their own copy-pasted
// version rather than being migrated onto this — see the project plan for why.
const STYLE = `
:root{--sky:#0a3d6b;--sky-light:#1565a8;--rotor:#e8a020;--rotor-light:#f5c050;--white:#fff;--offwhite:#f4f6f9;--text:#1a1a2e;--muted:#5a6070;--border:#dde2ec;--card-bg:#fff;}
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Source Sans 3',sans-serif;background:var(--offwhite);color:var(--text);font-size:16px;line-height:1.7;}
.top-bar{background:#071f35;display:flex;justify-content:space-between;align-items:center;padding:6px 24px;font-size:13px;color:#90aac8;flex-wrap:wrap;gap:6px;}
.top-bar a{color:var(--rotor);text-decoration:none;}
.header-main{display:flex;align-items:center;justify-content:space-between;padding:14px 24px;flex-wrap:wrap;gap:12px;background:var(--sky);}
.logo{display:flex;align-items:center;gap:14px;text-decoration:none;}
.logo-icon{width:54px;height:54px;background:var(--rotor);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;}
.logo-text h1{font-family:'Barlow Condensed',sans-serif;font-size:34px;font-weight:900;letter-spacing:1px;line-height:1;color:var(--white);}
.logo-text p{font-size:13px;color:#90aac8;letter-spacing:2px;text-transform:uppercase;}
nav{display:flex;gap:4px;flex-wrap:wrap;}
nav a{color:#ccdbe8;text-decoration:none;padding:7px 14px;border-radius:4px;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;transition:background .2s,color .2s;}
nav a:hover{background:var(--sky-light);color:var(--white);}
.ad-lb{background:#e8edf5;border-top:1px solid #c8d2e0;border-bottom:1px solid #c8d2e0;text-align:center;padding:10px;}
.ad-label{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:var(--muted);margin-bottom:4px;}
.article-hero{background:linear-gradient(135deg,#071f35 0%,var(--sky) 100%);padding:40px 24px;border-bottom:4px solid var(--rotor);}
.article-hero-inner{max-width:860px;margin:0 auto;}
.breadcrumb{font-size:13px;color:#90aac8;margin-bottom:12px;}
.breadcrumb a{color:var(--rotor);text-decoration:none;}
.breadcrumb a:hover{text-decoration:underline;}
.article-hero h1{font-family:'Barlow Condensed',sans-serif;font-size:clamp(28px,5vw,46px);font-weight:900;color:var(--white);line-height:1.15;margin-bottom:12px;}
.article-meta{font-size:13px;color:#90aac8;display:flex;gap:16px;flex-wrap:wrap;}
.article-wrap{max-width:1100px;margin:0 auto;padding:36px 16px 60px;display:grid;grid-template-columns:1fr 300px;gap:32px;align-items:start;}
@media(max-width:900px){.article-wrap{grid-template-columns:1fr;}}
.article-body{background:var(--white);border:1px solid var(--border);border-radius:10px;padding:36px;}
@media(max-width:600px){.article-body{padding:20px;}}
.article-body p{margin-bottom:18px;color:var(--text);font-size:16px;line-height:1.75;}
.article-body h2{font-family:'Barlow Condensed',sans-serif;font-size:24px;font-weight:700;color:var(--sky);border-left:4px solid var(--rotor);padding-left:12px;margin:26px 0 14px;text-transform:uppercase;letter-spacing:.5px;}
.article-body ul{margin:0 0 18px 20px;}
.article-body ul li{margin-bottom:8px;color:var(--text);font-size:16px;line-height:1.6;}
.article-body a{color:var(--rotor);text-decoration:none;font-weight:600;}
.article-body a:hover{text-decoration:underline;}
.article-body strong{color:var(--sky);}
.fact-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:14px;margin:20px 0;}
.fact-card{background:var(--offwhite);border:1px solid var(--border);border-radius:8px;padding:14px 16px;}
.fact-card .fact-label{font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:var(--muted);margin-bottom:4px;}
.fact-card .fact-value{font-family:'Barlow Condensed',sans-serif;font-size:19px;font-weight:700;color:var(--sky);}
.cta-box{background:linear-gradient(135deg,var(--rotor) 0%,var(--rotor-light) 100%);border-radius:8px;padding:22px;margin:24px 0;text-align:center;}
.cta-box a{display:inline-block;background:var(--sky);color:var(--white);font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:16px;padding:11px 30px;border-radius:6px;text-decoration:none;text-transform:uppercase;}
.cta-box a:hover{background:var(--sky-light);}
.claim-box{background:var(--offwhite);border:1px dashed var(--border);border-radius:8px;padding:16px 20px;margin:20px 0;text-align:center;}
.claim-box a{color:var(--rotor);font-weight:700;}
.sidebar>*{margin-bottom:24px;}
.sidebar-card{background:var(--white);border:1px solid var(--border);border-radius:8px;overflow:hidden;}
.sidebar-card-head{background:var(--sky);color:var(--white);font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:16px;text-transform:uppercase;letter-spacing:1px;padding:10px 14px;}
.sidebar-card-body{padding:14px;}
.guide-link{display:block;text-decoration:none;color:var(--sky);font-size:14px;font-weight:600;padding:7px 0;border-bottom:1px solid var(--border);transition:color .15s;}
.guide-link:last-child{border-bottom:none;}
.guide-link:hover{color:var(--rotor);}
.sell-ad-box{background:linear-gradient(135deg,var(--sky) 0%,var(--sky-light) 100%);border-radius:8px;padding:18px;text-align:center;color:var(--white);}
.sell-ad-box h3{font-family:'Barlow Condensed',sans-serif;font-size:20px;font-weight:700;text-transform:uppercase;margin-bottom:6px;}
.sell-ad-box p{font-size:13px;color:#b0cce0;margin-bottom:12px;}
.sell-ad-box a{display:inline-block;background:var(--rotor);color:var(--sky);font-weight:700;font-size:13px;padding:8px 18px;border-radius:4px;text-decoration:none;text-transform:uppercase;}
footer{background:#071f35;color:#6080a0;text-align:center;padding:24px 16px;font-size:13px;margin-top:30px;}
footer a{color:var(--rotor);text-decoration:none;}
footer p{margin-bottom:6px;}
`.trim();

const HEADER = `
<div class="top-bar">
  <span>🚁 The #1 Helicopter Enthusiast Resource in the USA</span>
  <span>Advertise: <a href="mailto:helipadusa@yahoo.com">helipadusa@yahoo.com</a></span>
</div>
<header>
  <div class="header-main">
    <a class="logo" href="/">
      <div class="logo-icon">🚁</div>
      <div class="logo-text"><h1>HelipadUSA</h1><p>News · Videos · Gear · Community</p></div>
    </a>
    <nav>
      <a href="/">Home</a>
      <a href="/#content-news">News</a>
      <a href="/#content-videos">Videos</a>
      <a href="/#content-gear">Gear</a>
      <a href="/#content-training">Training</a>
      <a href="/#content-heliports">Heliports</a>
      <a href="/#content-jobs">Jobs</a>
      <a href="/helicopter-for-sale.html">For Sale</a>
      <a href="/#content-tours">Tours</a>
      <a href="/merch.html" style="background:var(--rotor);color:var(--sky);">🛒 Merch</a>
      <a href="/about.html">About</a>
      <a href="/contact.html">Contact</a>
      <a href="/#content-advertise" style="background:var(--rotor);color:var(--sky);">🌟 Advertise!</a>
    </nav>
  </div>
</header>

<div class="ad-lb">
  <div class="ad-label">Advertisement</div>
  <ins class="adsbygoogle" style="display:inline-block;width:728px;height:90px" data-ad-client="ca-pub-4424452765069931" data-ad-slot="7359632924"></ins>
  <script>(adsbygoogle=window.adsbygoogle||[]).push({});</script>
</div>
`.trim();

const FOOTER = `
<footer>
  <p>© 2026 <strong style="color:#cce0f0;">HelipadUSA</strong> · All Rights Reserved · America's #1 Helicopter Resource</p>
  <p><a href="/privacy-policy.html">Privacy Policy</a> · <a href="/#content-advertise">Advertise</a> · <a href="mailto:helipadusa@yahoo.com">Contact Us</a></p>
  <p style="margin-top:8px;font-size:11px;">HelipadUSA is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com.</p>
</footer>
`.trim();

function renderSidebar(quickLinks) {
  const links = quickLinks
    .map((l) => `<a class="guide-link" href="${l.href}">${l.label}</a>`)
    .join("\n");
  return `
<aside class="sidebar">
  <div class="sell-ad-box">
    <h3>Advertise Here</h3>
    <p>Reach thousands of helicopter pilots &amp; aviation professionals every month.</p>
    <a href="/#content-advertise">Get Ad Rates</a>
  </div>
  <div class="ad-sidebar">
    <div class="ad-label">Advertisement</div>
    <ins class="adsbygoogle" style="display:inline-block;width:300px;height:250px" data-ad-client="ca-pub-4424452765069931" data-ad-slot="1839844875"></ins>
    <script>(adsbygoogle=window.adsbygoogle||[]).push({});</script>
  </div>
  <div class="sidebar-card">
    <div class="sidebar-card-head">🚁 Quick Links</div>
    <div class="sidebar-card-body">
      ${links}
    </div>
  </div>
</aside>
`.trim();
}

// {seoHead, breadcrumbHtml, heroTitle, heroMeta, bodyHtml, quickLinks}
function renderPage({ seoHead, breadcrumbHtml, heroTitle, heroMeta, bodyHtml, quickLinks }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-R6MC2C0FM2"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-R6MC2C0FM2');</script>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
${seoHead}
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;900&family=Source+Sans+3:wght@400;600&display=swap" rel="stylesheet">
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4424452765069931" crossorigin="anonymous"></script>
<style>${STYLE}</style>
</head>
<body>

${HEADER}

<div class="article-hero">
  <div class="article-hero-inner">
    <div class="breadcrumb">${breadcrumbHtml}</div>
    <h1>${heroTitle}</h1>
    <div class="article-meta">${heroMeta}</div>
  </div>
</div>

<div class="article-wrap">
<article class="article-body">
${bodyHtml}
</article>
${renderSidebar(quickLinks)}
</div>

${FOOTER}
</body>
</html>
`;
}

module.exports = { renderPage };
