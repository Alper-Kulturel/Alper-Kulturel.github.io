/* ==========================================================================
   ALPER KULTUREL — interactions
   Custom double cursor · typewriter · reveal observers · flap entrance
   ========================================================================== */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----------------------------------------------------------------------
     1. CUSTOM DOUBLE CURSOR
     32px ring lerped at 0.16, 5px dot lerped at 0.55, difference blend.
     Pointer-fine devices only — touch keeps the native experience.
     ---------------------------------------------------------------------- */

  function initCursor() {
    var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine || reduceMotion) return;

    var ring = document.createElement("div");
    var dot = document.createElement("div");
    ring.className = "cursor cursor--ring";
    dot.className = "cursor cursor--dot";
    ring.setAttribute("aria-hidden", "true");
    dot.setAttribute("aria-hidden", "true");
    document.body.append(ring, dot);
    document.documentElement.classList.add("cursor-ready");

    var target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    var ringPos = { x: target.x, y: target.y };
    var dotPos = { x: target.x, y: target.y };
    var visible = false;

    window.addEventListener(
      "pointermove",
      function (event) {
        if (event.pointerType === "touch") return;
        target.x = event.clientX;
        target.y = event.clientY;
        if (!visible) {
          visible = true;
          ringPos.x = dotPos.x = target.x;
          ringPos.y = dotPos.y = target.y;
        }
      },
      { passive: true }
    );

    document.addEventListener("pointerleave", function () {
      visible = false;
      ring.style.opacity = "0";
      dot.style.opacity = "0";
    });

    document.addEventListener("pointerenter", function () {
      visible = true;
      ring.style.opacity = "";
      dot.style.opacity = "";
    });

    var HOVER_SELECTOR = "a[href], button, .folder, .file__link, .next-folder__link";

    document.addEventListener("pointerover", function (event) {
      var node = event.target;
      if (!(node instanceof Element)) return;
      if (node.closest(HOVER_SELECTOR)) ring.classList.add("is-active");
    });

    document.addEventListener("pointerout", function (event) {
      var node = event.target;
      if (!(node instanceof Element)) return;
      if (node.closest(HOVER_SELECTOR)) ring.classList.remove("is-active");
    });

    function lerp(from, to, amount) {
      return from + (to - from) * amount;
    }

    function frame() {
      ringPos.x = lerp(ringPos.x, target.x, 0.16);
      ringPos.y = lerp(ringPos.y, target.y, 0.16);
      dotPos.x = lerp(dotPos.x, target.x, 0.55);
      dotPos.y = lerp(dotPos.y, target.y, 0.55);

      ring.style.transform =
        "translate3d(" + ringPos.x.toFixed(2) + "px," + ringPos.y.toFixed(2) + "px,0)";
      dot.style.transform =
        "translate3d(" + dotPos.x.toFixed(2) + "px," + dotPos.y.toFixed(2) + "px,0)";

      window.requestAnimationFrame(frame);
    }

    window.requestAnimationFrame(frame);
  }

  /* ----------------------------------------------------------------------
     2. TYPEWRITER SUBTITLE
     26ms per character, starting 700ms after load.
     ---------------------------------------------------------------------- */

  function initTypewriter() {
    var host = document.querySelector("[data-typewriter]");
    if (!host) return;

    var text = host.getAttribute("data-typewriter") || "";
    var caret = host.querySelector(".hero__caret");

    if (reduceMotion) {
      host.textContent = text;
      if (caret) host.append(caret);
      return;
    }

    var index = 0;
    var node = document.createTextNode("");

    host.textContent = "";
    host.append(node);
    if (caret) host.append(caret);

    function tick() {
      index += 1;
      node.nodeValue = text.slice(0, index);

      if (index < text.length) {
        window.setTimeout(tick, 26);
      } else if (caret) {
        window.setTimeout(function () {
          caret.classList.add("is-done");
        }, 2400);
      }
    }

    window.setTimeout(tick, 700);
  }

  /* ----------------------------------------------------------------------
     3. REVEAL OBSERVERS
     Folders stagger in; the dossier flap folds open and the paper slides in.
     ---------------------------------------------------------------------- */

  function revealAll(nodes, className) {
    nodes.forEach(function (node) {
      node.classList.add(className);
    });
  }

  function initReveals() {
    var slots = Array.prototype.slice.call(document.querySelectorAll(".cabinet__slot"));
    var dossiers = Array.prototype.slice.call(document.querySelectorAll(".dossier"));

    slots.forEach(function (slot, i) {
      slot.style.setProperty("--i", String(i));
    });

    if (reduceMotion || !("IntersectionObserver" in window)) {
      revealAll(slots, "is-in");
      revealAll(dossiers, "is-open");
      return;
    }

    var slotObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    slots.forEach(function (slot) {
      slotObserver.observe(slot);
    });

    var dossierObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          window.setTimeout(function () {
            entry.target.classList.add("is-open");
          }, 160);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.06, rootMargin: "0px 0px -6% 0px" }
    );

    dossiers.forEach(function (dossier) {
      dossierObserver.observe(dossier);
    });
  }

  /* ---------------------------------------------------------------------- */

  function boot() {
    initCursor();
    initTypewriter();
    initReveals();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
