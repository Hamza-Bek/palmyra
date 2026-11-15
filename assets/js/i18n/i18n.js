/* ==========================================================================
   Palmyra: i18n engine
   - data-i18n="key"                      → element text
   - data-i18n-attr="attr:key;attr2:key"  → element attributes
   Language is kept in localStorage and reflected on <html lang dir>.
   ========================================================================== */

(function () {
  "use strict";

  var app = window.PALMYRA;
  var config = app.config;
  var root = document.documentElement;

  function isSupported(lang) {
    return config.supportedLangs.indexOf(lang) !== -1;
  }

  function currentLang() {
    return isSupported(root.lang) ? root.lang : config.defaultLang;
  }

  /** Translate a key in the current (or given) language, falling back to English. */
  function t(key, lang) {
    var dict = app.i18n[lang || currentLang()] || {};
    if (key in dict) return dict[key];
    var fallback = app.i18n[config.defaultLang] || {};
    return key in fallback ? fallback[key] : key;
  }

  function render() {
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });

    document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      el.getAttribute("data-i18n-attr")
        .split(";")
        .forEach(function (pair) {
          var parts = pair.split(":");
          if (parts.length === 2) el.setAttribute(parts[0].trim(), t(parts[1].trim()));
        });
    });
  }

  function setLang(lang, options) {
    if (!isSupported(lang)) return;
    root.lang = lang;
    root.dir = lang === "ar" ? "rtl" : "ltr";
    try {
      localStorage.setItem(config.storageKey, lang);
    } catch (e) {
      /* storage unavailable: language simply won't persist */
    }
    render();
    if (!options || !options.silent) {
      document.dispatchEvent(new CustomEvent("palmyra:langchange", { detail: { lang: lang } }));
    }
  }

  /** Switch with a short cross-fade so the direction flip doesn't feel abrupt. */
  function toggleLang() {
    var next = currentLang() === "ar" ? "en" : "ar";
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return setLang(next);

    root.classList.add("is-switching-lang");
    window.setTimeout(function () {
      setLang(next);
      root.classList.remove("is-switching-lang");
    }, 170);
  }

  app.t = t;
  app.getLang = currentLang;
  app.setLang = setLang;
  app.toggleLang = toggleLang;

  // First paint: <html lang> was already set by the inline script in <head>
  setLang(currentLang(), { silent: true });
})();
