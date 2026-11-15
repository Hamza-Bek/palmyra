/* ==========================================================================
   Palmyra: Motion
   Scroll reveals, scroll-linked effects (progress bar, header, parallax,
   process line), marquee. Everything is skipped under reduced motion.
   ========================================================================== */

(function () {
  "use strict";

  var root = document.documentElement;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var STAGGER_MS = 90;

  /* ---------- Scroll reveal ---------- */

  function initReveal() {
    var items = document.querySelectorAll("[data-reveal]");

    // Children of a group reveal one after another
    document.querySelectorAll("[data-reveal-group]").forEach(function (group) {
      group.querySelectorAll("[data-reveal]").forEach(function (item, index) {
        item.style.setProperty("--reveal-delay", index * STAGGER_MS + "ms");
      });
    });

    if (reduceMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (item) {
        item.classList.add("is-revealed", "is-settled");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var item = entry.target;
          item.classList.add("is-revealed");
          observer.unobserve(item);

          // Once the entrance has finished, give hover transitions back to the component
          var delay = parseFloat(item.style.getPropertyValue("--reveal-delay")) || 0;
          window.setTimeout(function () {
            item.classList.add("is-settled");
            item.style.removeProperty("--reveal-delay");
          }, delay + 950);
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );

    items.forEach(function (item) {
      observer.observe(item);
    });
  }

  /* ---------- Marquee ---------- */

  function initMarquee() {
    var track = document.getElementById("marquee-track");
    if (!track) return;

    // Duplicate the items so the loop is seamless (translateX ±50%)
    Array.prototype.slice.call(track.children).forEach(function (item) {
      track.appendChild(item.cloneNode(true));
    });

    if (!reduceMotion) track.classList.add("marquee__track--running");
  }

  /* ---------- Scroll-linked effects (single rAF loop) ---------- */

  function initScrollEffects() {
    var header = document.getElementById("site-header");
    var fab = document.querySelector(".whatsapp-fab");
    var steps = document.getElementById("steps");
    var stepItems = steps ? steps.querySelectorAll(".step") : [];
    var parallaxItems = reduceMotion ? [] : document.querySelectorAll("[data-parallax]");
    var heroImage = reduceMotion ? null : document.querySelector("[data-hero-image]");
    // In the portrait layout the jet sits at the bottom edge, so it must not drift
    var portraitHero = window.matchMedia("(max-width: 56rem), (max-aspect-ratio: 5/4)");
    var verticalSteps = window.matchMedia("(max-width: 56rem)");
    var ticking = false;

    function clamp(value, min, max) {
      return Math.min(max, Math.max(min, value));
    }

    function update() {
      ticking = false;
      var scrollY = window.scrollY || window.pageYOffset;
      var viewport = window.innerHeight;
      var scrollable = document.documentElement.scrollHeight - viewport;

      root.style.setProperty("--scroll-progress", scrollable > 0 ? clamp(scrollY / scrollable, 0, 1) : 0);

      if (header) header.classList.toggle("site-header--scrolled", scrollY > 24);
      if (fab) fab.classList.toggle("whatsapp-fab--visible", scrollY > viewport * 0.6);

      // Process line fills as the steps travel up the viewport
      if (steps) {
        var rect = steps.getBoundingClientRect();
        var distance = verticalSteps.matches ? rect.height : viewport * 0.4;
        var progress = reduceMotion ? 1 : clamp((viewport * 0.82 - rect.top) / distance, 0, 1);
        steps.style.setProperty("--steps-progress", progress);

        var lastIndex = stepItems.length - 1;
        stepItems.forEach(function (step, index) {
          var threshold = lastIndex > 0 ? index / lastIndex : 0;
          step.classList.toggle("step--active", progress > 0.02 && progress >= threshold * 0.98);
        });
      }

      // Hero jet drifts slower than the page, so the text glides over it
      if (heroImage && scrollY < viewport * 1.2) {
        heroImage.style.translate = portraitHero.matches ? "" : "0 " + (scrollY * 0.28).toFixed(1) + "px";
      }

      // Gentle parallax on framed photos
      parallaxItems.forEach(function (image) {
        var frame = image.parentElement.getBoundingClientRect();
        if (frame.bottom < 0 || frame.top > viewport) return;
        var offset = (frame.top + frame.height / 2 - viewport / 2) * -parseFloat(image.dataset.parallax || 0.06);
        image.style.transform = "translate3d(0," + offset.toFixed(1) + "px,0)";
      });
    }

    function requestUpdate() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    document.addEventListener("palmyra:langchange", requestUpdate);
    update();
  }

  /* ---------- Active navigation link ---------- */

  function initActiveNav() {
    if (!("IntersectionObserver" in window)) return;
    var links = document.querySelectorAll(".site-nav__link");
    var byId = {};
    links.forEach(function (link) {
      byId[link.getAttribute("href").slice(1)] = link;
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          links.forEach(function (link) {
            link.classList.remove("site-nav__link--active");
            link.removeAttribute("aria-current");
          });
          var active = byId[entry.target.id];
          if (active) {
            active.classList.add("site-nav__link--active");
            active.setAttribute("aria-current", "true");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    Object.keys(byId).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) observer.observe(section);
    });
    var hero = document.getElementById("top");
    if (hero) observer.observe(hero);
  }


  initReveal();
  initMarquee();
  initScrollEffects();
  initActiveNav();
})();
