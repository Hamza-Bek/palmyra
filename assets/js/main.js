/* ==========================================================================
   Palmyra: Page behaviour
   Language switch, mobile navigation, contact links, inquiry form.
   ========================================================================== */

(function () {
  "use strict";

  var app = window.PALMYRA;
  var config = app.config;

  /* ---------- Language switch ---------- */

  function initLangSwitch() {
    var button = document.getElementById("lang-switch");
    if (button) button.addEventListener("click", app.toggleLang);
  }

  /* ---------- Mobile navigation ---------- */

  function initMobileNav() {
    var toggle = document.getElementById("nav-toggle");
    var nav = document.getElementById("site-nav");
    if (!toggle || !nav) return;

    function setOpen(open) {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("site-nav--open", open);
    }

    toggle.addEventListener("click", function () {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) setOpen(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        toggle.focus();
      }
    });

    document.addEventListener("click", function (event) {
      if (!nav.contains(event.target) && !toggle.contains(event.target)) setOpen(false);
    });
  }

  /* ---------- Contact links ---------- */

  function whatsappUrl(text) {
    var url = "https://wa.me/" + config.whatsappNumber;
    return text ? url + "?text=" + encodeURIComponent(text) : url;
  }

  /** WhatsApp buttons open with a short greeting in the visitor's language. */
  function refreshWhatsappLinks() {
    document.querySelectorAll("[data-whatsapp]").forEach(function (link) {
      link.href = whatsappUrl(app.t("message.greeting"));
    });
  }

  /** "Ask about a flight / hotel / package" pre-selects that service in the form. */
  function initServiceLinks() {
    var select = document.getElementById("inquiry-service");
    document.querySelectorAll("[data-service-link]").forEach(function (link) {
      link.addEventListener("click", function () {
        if (select) select.value = link.getAttribute("data-service-link");
      });
    });
  }

  /* ---------- Inquiry form → WhatsApp / email ---------- */

  function initInquiryForm() {
    var form = document.getElementById("inquiry-form");
    if (!form) return;

    var nameInput = form.querySelector("#inquiry-name");
    var nameError = form.querySelector("#inquiry-name-error");
    var serviceSelect = form.querySelector("#inquiry-service");
    var messageInput = form.querySelector("#inquiry-message");

    function showNameError(show) {
      nameInput.setAttribute("aria-invalid", String(show));
      nameError.hidden = !show;
    }

    nameInput.addEventListener("input", function () {
      if (nameInput.value.trim()) showNameError(false);
    });

    function composeMessage() {
      var serviceLabel = serviceSelect.options[serviceSelect.selectedIndex].text;
      var lines = [
        app.t("message.greeting"),
        "",
        app.t("message.name") + ": " + nameInput.value.trim(),
        app.t("message.service") + ": " + serviceLabel,
      ];
      var details = messageInput.value.trim();
      if (details) lines.push(app.t("message.details") + ": " + details);
      return lines.join("\n");
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!nameInput.value.trim()) {
        showNameError(true);
        nameInput.focus();
        return;
      }
      showNameError(false);

      var submitter = event.submitter || document.activeElement;
      var channel = submitter && submitter.getAttribute("data-channel");
      var text = composeMessage();

      if (channel === "email") {
        window.location.href =
          "mailto:" +
          config.email +
          "?subject=" +
          encodeURIComponent(app.t("message.subject")) +
          "&body=" +
          encodeURIComponent(text);
      } else {
        window.open(whatsappUrl(text), "_blank", "noopener");
      }
    });
  }

  /* ---------- Footer year ---------- */

  function setYear() {
    var year = document.getElementById("footer-year");
    if (year) year.textContent = String(new Date().getFullYear());
  }

  initLangSwitch();
  initMobileNav();
  initServiceLinks();
  initInquiryForm();
  refreshWhatsappLinks();
  setYear();

  document.addEventListener("palmyra:langchange", refreshWhatsappLinks);
})();
