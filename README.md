# Palmyra: Travel & Tourism website

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
    i18n/en.js, i18n/ar.js  All page text, one key per data-i18n attribute
    i18n/i18n.js            Language engine (text, attributes, lang/dir, persistence)
    animations.js           Scroll reveal, progress bar, parallax, process line, marquee
    main.js                 Language button, mobile menu, inquiry form → WhatsApp/email
  images/
    brand/                  Logo variants (blue for light backgrounds, sky for dark)
    hero/ services/ about/  Photography (AI-generated, WebP); hero = jet in Palmyra livery
  icons/                    Favicon and Apple touch icon
tools/
  build-logo.ps1            Rebuilds the transparent logo variants from the original artwork
```

## Editing

- **Text:** change it in `assets/js/i18n/en.js` and `ar.js`. The keys match the `data-i18n="…"` attributes in `index.html`.
- **Contact details:** `assets/js/config.js` updates the WhatsApp links and form. The visible numbers and `tel:` / `mailto:` links in `index.html` need updating too.
- **Colours and spacing:** `assets/css/tokens.css` only.
- **Logo:** replace `assets/images/brand/logo-original.jpg`, then run
  `powershell -ExecutionPolicy Bypass -File tools/build-logo.ps1 -Source assets/images/brand/logo-original.jpg`.

## Animations

- The hero shows the Palmyra jet full-width. The photo settles in with a slow zoom, the text enters in a stagger, and on wide screens the jet drifts slower than the page as you scroll.
- Sections and cards fade in as you scroll. Groups of cards appear one after another.
- The scroll progress bar, the shrinking header, light photo parallax, and the "How it works" line all follow the scroll position.
- All motion turns off when the visitor's system asks for reduced motion. Content stays fully readable without JavaScript.

## Wording note

The copy describes *booking and travel-arrangement services*. It never claims a tourism licence or official tourism-office status.
