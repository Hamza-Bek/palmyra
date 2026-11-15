# Palmyra Tourism Services website

Static, bilingual (English / Arabic RTL) one-page site. No build step and no dependencies.

## Run locally

```bash
python -m http.server 5510
# open http://127.0.0.1:5510
```

`?lang=ar` or `?lang=en` forces a language. Otherwise the site uses the visitor's last choice, then their browser language.

## Structure

```
index.html                  Page markup (sections: hero, services, process, why, contact)
assets/
  css/
    tokens.css              Design tokens: colour, type, spacing, radius, shadow, motion
    base.css                Reset, typography, Arabic font switch, utilities
    layout.css              Container, section shell, header, nav, footer
    components.css          Buttons, cards, form fields, contact channels, WhatsApp button
    sections.css            Section-specific layouts
    animations.css          Keyframes, hero entrance, scroll reveals, reduced-motion rules
  js/
    config.js               Phone, WhatsApp and email (edit contact details here)
    i18n/en.js, i18n/ar.js  All page text (incl. FAQ), one key per data-i18n attribute
    i18n/i18n.js            Language engine (text, attributes, lang/dir, persistence)
    animations.js           Scroll reveal, progress bar, parallax, process line, marquee
    main.js                 Language button, mobile menu, inquiry form → WhatsApp/email
  images/
    brand/                  Logo variants (blue for light backgrounds, sky for dark)
    hero/ services/ about/  Photography (AI-generated, WebP); hero = jet in Palmyra livery
  icons/                    Favicon and Apple touch icon
tools/
  build-logo.ps1            Rebuilds the transparent logo variants from the original artwork
  build-seo.js              Rebuilds FAQ markup + JSON-LD in index.html from en.js
```

## Editing

- **Text:** change it in `assets/js/i18n/en.js` and `ar.js`. The keys match the `data-i18n="…"` attributes in `index.html`.
- **Contact details:** `assets/js/config.js` updates the WhatsApp links and form. The visible numbers and `tel:` / `mailto:` links in `index.html` need updating too.
- **Colours and spacing:** `assets/css/tokens.css` only.
- **Logo:** replace `assets/images/brand/logo-original.jpg`, then run
  `powershell -ExecutionPolicy Bypass -File tools/build-logo.ps1 -Source assets/images/brand/logo-original.jpg`.

## SEO

- Title, description, canonical and `hreflang` links (English at `/`, Arabic at `/?lang=ar`). Switching language updates the canonical link and the address bar.
- Open Graph and Twitter tags with a 1200x630 share image (`assets/images/og/og-image.jpg`).
- JSON-LD structured data: Organization (contact, languages, services), WebSite and FAQPage.
- `robots.txt`, `sitemap.xml` and `site.webmanifest` at the root.
- **FAQ:** questions live in `assets/js/i18n/en.js` and `ar.js` as `faq.q1` / `faq.a1`, `faq.q2` / `faq.a2`, and so on. To add one, add the next number in both files, then run `node tools/build-seo.js`. That rebuilds the FAQ markup and the FAQPage data in `index.html`.
- If the site moves to its own domain, change `siteUrl` in `assets/js/config.js`, the URLs in the `<head>` of `index.html`, `robots.txt` and `sitemap.xml`, then run the build script.

## Animations

- The hero shows the Palmyra jet full-width. The photo settles in with a slow zoom, the text enters in a stagger, and on wide screens the jet drifts slower than the page as you scroll.
- Sections and cards fade in as you scroll. Groups of cards appear one after another.
- The scroll progress bar, the shrinking header, light photo parallax, and the "How it works" line all follow the scroll position.
- All motion turns off when the visitor's system asks for reduced motion. Content stays fully readable without JavaScript.

## Wording note

The copy presents Palmyra as *Tourism Services* (flight tickets, hotels, travel packages). It never claims a tourism licence or official tourism-office status.
