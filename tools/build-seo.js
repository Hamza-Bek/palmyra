/* ==========================================================================
   Palmyra: build FAQ markup + structured data (JSON-LD) into index.html
   Usage:  node tools/build-seo.js

   - FAQ items come from assets/js/i18n/en.js (faq.q1/faq.a1 ... faq.qN/faq.aN),
     so the visible questions and the FAQPage schema always match.
   - Rewrites only the regions between the START/END marker comments.
   ========================================================================== */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const INDEX = path.join(ROOT, "index.html");

global.window = { PALMYRA: { i18n: {} } };
require(path.join(ROOT, "assets/js/config.js"));
require(path.join(ROOT, "assets/js/i18n/en.js"));
const config = window.PALMYRA.config;
const en = window.PALMYRA.i18n.en;

const SITE = config.siteUrl;

const escapeHtml = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/* ---------- FAQ items ---------- */

const items = [];
for (let i = 1; en["faq.q" + i]; i++) items.push(i);

const faqHtml = items
  .map(
    (i) => `            <details class="faq-item" data-reveal>
              <summary class="faq-item__question">
                <span data-i18n="faq.q${i}">${escapeHtml(en["faq.q" + i])}</span>
                <span class="faq-item__toggle" aria-hidden="true"></span>
              </summary>
              <div class="faq-item__answer">
                <p data-i18n="faq.a${i}">${escapeHtml(en["faq.a" + i])}</p>
              </div>
            </details>`
  )
  .join("\n");

/* ---------- Structured data ---------- */

const services = [
  ["Flight tickets", en["services.flights.text"]],
  ["Hotel reservations", en["services.hotels.text"]],
  ["Travel packages", en["services.packages.text"]],
  ["Medical travel coordination", en["services.medical.text"]],
  ["Nature & eco trips", en["services.eco.text"]],
  ["Diving & golf", en["services.diving.text"]],
];

const graph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": SITE + "#organization",
      name: "Palmyra Tourism Services",
      alternateName: ["Palmyra", "بالميرا للخدمات السياحية"],
      url: SITE,
      logo: SITE + "assets/images/brand/logo-full-blue.png",
      image: SITE + "assets/images/og/og-image.jpg",
      slogan: "Navigating Skies, Creating Memories",
      description: en["meta.description"],
      email: config.email,
      telephone: config.phoneE164,
      address: { "@type": "PostalAddress", addressLocality: "Cairo", addressCountry: "EG" },
      areaServed: "Worldwide",
      knowsLanguage: ["ar", "en"],
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "customer service",
          telephone: config.phoneE164,
          email: config.email,
          availableLanguage: ["Arabic", "English"],
        },
      ],
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Tourism services",
        itemListElement: services.map(([name, description]) => ({
          "@type": "Offer",
          itemOffered: { "@type": "Service", name, description },
        })),
      },
    },
    {
      "@type": "WebSite",
      "@id": SITE + "#website",
      url: SITE,
      name: "Palmyra Tourism Services",
      inLanguage: ["en", "ar"],
      publisher: { "@id": SITE + "#organization" },
    },
    {
      "@type": "FAQPage",
      "@id": SITE + "#faq",
      url: SITE + "#faq",
      inLanguage: "en",
      mainEntity: items.map((i) => ({
        "@type": "Question",
        name: en["faq.q" + i],
        acceptedAnswer: { "@type": "Answer", text: en["faq.a" + i] },
      })),
    },
  ],
};

const jsonLd = `    <script type="application/ld+json">
${JSON.stringify(graph, null, 2)
  .split("\n")
  .map((l) => "      " + l)
  .join("\n")}
    </script>`;

/* ---------- Write ---------- */

function replaceRegion(html, name, body) {
  const re = new RegExp(`(<!-- ${name}:START -->)[\\s\\S]*?(\\n[ \\t]*<!-- ${name}:END -->)`);
  if (!re.test(html)) throw new Error("Marker " + name + " not found in index.html");
  return html.replace(re, (match, start, end) => start + "\n" + body + end);
}

let html = fs.readFileSync(INDEX, "utf8");
html = replaceRegion(html, "FAQ", faqHtml);
html = replaceRegion(html, "JSONLD", jsonLd);
fs.writeFileSync(INDEX, html);
console.log(`index.html updated: ${items.length} FAQ items, JSON-LD for Organization, WebSite, FAQPage.`);
