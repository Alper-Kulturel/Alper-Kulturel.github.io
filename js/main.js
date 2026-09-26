/* ==========================================================================
   ALPER KULTUREL — interactions
   Custom double cursor · typewriter · reveals · counters · contact form

   Every loop here parks itself as soon as it has nothing left to do, so an
   idle page costs nothing between frames.
   ========================================================================== */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canObserve = "IntersectionObserver" in window;

  function each(nodes, fn) {
    Array.prototype.forEach.call(nodes, fn);
  }

  /* ----------------------------------------------------------------------
     1. CUSTOM DOUBLE CURSOR
     A 32px ring lerped at 0.16 and a 5px dot at 0.55, difference-blended.
     The rAF loop stops the moment both have caught up with the pointer and
     restarts on the next move — previously this ran forever.
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

    var rafId = 0;
    var running = false;
    var dirty = false;

    function lerp(from, to, amount) {
      return from + (to - from) * amount;
    }

    function tick() {
      ringPos.x = lerp(ringPos.x, target.x, 0.16);
      ringPos.y = lerp(ringPos.y, target.y, 0.16);
      dotPos.x = lerp(dotPos.x, target.x, 0.55);
      dotPos.y = lerp(dotPos.y, target.y, 0.55);

      var settled =
        Math.abs(ringPos.x - target.x) < 0.06 &&
        Math.abs(ringPos.y - target.y) < 0.06 &&
        Math.abs(dotPos.x - target.x) < 0.06 &&
        Math.abs(dotPos.y - target.y) < 0.06;

      if (settled) {
        ringPos.x = dotPos.x = target.x;
        ringPos.y = dotPos.y = target.y;
      }

      if (dirty || settled) {
        ring.style.transform =
          "translate3d(" + ringPos.x.toFixed(2) + "px," + ringPos.y.toFixed(2) + "px,0)";
        dot.style.transform =
          "translate3d(" + dotPos.x.toFixed(2) + "px," + dotPos.y.toFixed(2) + "px,0)";
        dirty = false;
      }

      if (settled) {
        running = false;
        rafId = 0;
        return;
      }

      rafId = window.requestAnimationFrame(tick);
    }

    function wake() {
      if (running) return;
      running = true;
      rafId = window.requestAnimationFrame(tick);
    }

    window.addEventListener(
      "pointermove",
      function (event) {
        if (event.pointerType === "touch") return;
        var first = !running;
        target.x = event.clientX;
        target.y = event.clientY;
        dirty = true;
        if (first) {
          // avoid a long slide in from wherever the cursor last parked
          ringPos.x = dotPos.x = target.x;
          ringPos.y = dotPos.y = target.y;
        }
        wake();
      },
      { passive: true }
    );

    document.addEventListener("pointerleave", function () {
      ring.style.opacity = "0";
      dot.style.opacity = "0";
    });

    document.addEventListener("pointerenter", function () {
      ring.style.opacity = "";
      dot.style.opacity = "";
    });

    var HOVER_SELECTOR = "a[href], button, summary, .folder, .file__link, .next-folder__link";

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

    wake();
  }

  /* ----------------------------------------------------------------------
     2. TYPEWRITER SUBTITLE
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
        window.setTimeout(tick, 24);
      } else if (caret) {
        window.setTimeout(function () {
          caret.classList.add("is-done");
        }, 2600);
      }
    }

    window.setTimeout(tick, 650);
  }

  /* ----------------------------------------------------------------------
     3. REVEALS
     Folders stagger in, the dossier flap folds open, file rows cascade.
     Each observer unobserves the moment it has fired.
     ---------------------------------------------------------------------- */

  function initReveals() {
    var slots = document.querySelectorAll(".cabinet__slot");
    var dossiers = document.querySelectorAll(".dossier");
    var fileLists = document.querySelectorAll(".files");
    var creds = document.querySelectorAll(".cred");

    each(slots, function (slot, i) {
      slot.style.setProperty("--i", String(i));
    });

    each(creds, function (cred, i) {
      // capped, so a long history never crawls in
      cred.style.setProperty("--cred-delay", Math.min(i, 6) * 90 + "ms");
    });

    each(fileLists, function (list) {
      each(list.querySelectorAll(".file"), function (file, i) {
        // cap the cascade so a long list never crawls in
        file.style.setProperty("--i", String(Math.min(i, 11)));
      });
    });

    if (reduceMotion || !canObserve) {
      each(slots, function (n) { n.classList.add("is-in"); });
      each(dossiers, function (n) { n.classList.add("is-open"); });
      each(fileLists, function (n) { n.classList.add("is-in"); });
      each(creds, function (n) { n.classList.add("is-in"); });
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
    each(slots, function (slot) { slotObserver.observe(slot); });

    var dossierObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          window.setTimeout(function () {
            entry.target.classList.add("is-open");
          }, 150);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.04, rootMargin: "0px 0px -6% 0px" }
    );
    each(dossiers, function (dossier) { dossierObserver.observe(dossier); });

    var fileObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.02, rootMargin: "0px 0px -4% 0px" }
    );
    each(fileLists, function (list) { fileObserver.observe(list); });

    var credObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" }
    );
    each(creds, function (cred) { credObserver.observe(cred); });
  }

  /* ----------------------------------------------------------------------
     4. STAT COUNTERS
     Count up once when the bar scrolls into view.
     ---------------------------------------------------------------------- */

  function initStats() {
    var nums = document.querySelectorAll(".stat__num[data-count]");
    if (!nums.length) return;

    if (reduceMotion || !canObserve) return;

    function run(node) {
      var targetValue = parseFloat(node.getAttribute("data-count"));
      var suffix = node.getAttribute("data-suffix") || "";
      if (isNaN(targetValue)) return;

      var duration = 950;
      var start = 0;

      function step(now) {
        if (!start) start = now;
        var progress = Math.min((now - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        node.textContent = Math.round(targetValue * eased) + suffix;
        if (progress < 1) window.requestAnimationFrame(step);
      }

      node.textContent = "0" + suffix;
      window.requestAnimationFrame(step);
    }

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          run(entry.target);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.5 }
    );

    each(nums, function (node) { observer.observe(node); });
  }

  /* ----------------------------------------------------------------------
     5. FOOTER ICONS
     Three things happen here: the icons stagger in on scroll, they pause
     once the footer leaves the viewport (five infinite rotations are pure
     cost off screen), and they scale and brighten as the pointer approaches.
     The proximity pass only runs on pointermove, and only while the pointer
     is inside the footer.
     ---------------------------------------------------------------------- */

  function initFooterIcons() {
    var host = document.querySelector(".footer__icons");
    if (!host) return;

    var wraps = host.querySelectorAll(".footer__icon-wrap");

    each(wraps, function (wrap, i) {
      wrap.style.setProperty("--i", String(i));
    });

    var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (reduceMotion || !canObserve) {
      host.classList.add("is-in");
      return;
    }

    new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          host.classList.add("is-in");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.2 }
    ).observe(host);

    new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          host.classList.toggle("is-idle", !entry.isIntersecting);
        });
      },
      { rootMargin: "120px 0px" }
    ).observe(host);

    if (!fine || !wraps.length) return;

    var footer = host.closest(".site-footer") || host;
    var RADIUS = 190;
    var centres = null;
    var pointer = { x: 0, y: 0 };
    var ticking = false;

    // the centres only move on layout change, and scaling happens around
    // transform-origin 50% 50%, so the centre never shifts as an icon grows
    function measure() {
      centres = Array.prototype.map.call(wraps, function (wrap) {
        var box = wrap.getBoundingClientRect();
        return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
      });
    }

    function apply() {
      ticking = false;
      if (!centres) measure();

      each(wraps, function (wrap, i) {
        var dx = pointer.x - centres[i].x;
        var dy = pointer.y - centres[i].y;
        var near = 1 - Math.sqrt(dx * dx + dy * dy) / RADIUS;
        if (near < 0) near = 0;
        // smoothstep, so the falloff eases rather than ramping linearly
        near = near * near * (3 - 2 * near);
        wrap.style.setProperty("--near", near.toFixed(3));
      });
    }

    footer.addEventListener(
      "pointermove",
      function (event) {
        pointer.x = event.clientX;
        pointer.y = event.clientY;
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(apply);
      },
      { passive: true }
    );

    footer.addEventListener("pointerleave", function () {
      each(wraps, function (wrap) { wrap.style.setProperty("--near", "0"); });
    });

    window.addEventListener("resize", function () { centres = null; }, { passive: true });
    window.addEventListener("scroll", function () { centres = null; }, { passive: true });
  }

  /* ----------------------------------------------------------------------
     6. BACK TO TOP
     ---------------------------------------------------------------------- */

  function initToTop() {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "to-top";
    button.setAttribute("aria-label", "Back to top");
    button.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>';
    document.body.append(button);

    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });

    var ticking = false;

    function update() {
      ticking = false;
      button.classList.toggle("is-shown", window.scrollY > 700);
    }

    window.addEventListener(
      "scroll",
      function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(update);
      },
      { passive: true }
    );

    update();
  }

  /* ----------------------------------------------------------------------
     7. DOWNLOAD MENU
     <details> works without JS; this only adds outside-click and Escape.
     ---------------------------------------------------------------------- */

  function initDownloadMenu() {
    var menus = document.querySelectorAll(".dl");
    if (!menus.length) return;

    function closeAll(except) {
      each(menus, function (menu) {
        if (menu !== except) menu.removeAttribute("open");
      });
    }

    each(menus, function (menu) {
      menu.addEventListener("toggle", function () {
        if (menu.open) closeAll(menu);
      });

      each(menu.querySelectorAll(".dl__item"), function (item) {
        item.addEventListener("click", function () {
          menu.removeAttribute("open");
        });
      });
    });

    document.addEventListener("click", function (event) {
      var node = event.target;
      if (node instanceof Element && node.closest(".dl")) return;
      closeAll(null);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;
      var open = document.querySelector(".dl[open]");
      if (!open) return;
      open.removeAttribute("open");
      var summary = open.querySelector(".dl__btn");
      if (summary) summary.focus();
    });
  }

  /* ----------------------------------------------------------------------
     8. CONTACT FORM
     No backend: the submit handler composes a mailto: addressed to Alper
     with the fields already laid out in the body.
     ---------------------------------------------------------------------- */

  function initContactForm() {
    var form = document.getElementById("contact-form");
    if (!form) return;

    var status = document.getElementById("cform-status");
    var RECIPIENT = form.getAttribute("data-recipient") || "kulturelalper@gmail.com";

    function fieldOf(input) {
      return input.closest(".field");
    }

    function markInvalid(input, invalid) {
      var field = fieldOf(input);
      if (field) field.classList.toggle("is-invalid", invalid);
    }

    function validate() {
      var invalid = null;
      each(form.querySelectorAll("[required]"), function (input) {
        var empty = !String(input.value || "").trim();
        markInvalid(input, empty);
        if (empty && !invalid) invalid = input;
      });
      return invalid;
    }

    // clear the error as soon as the person fixes the field
    each(form.querySelectorAll("[required]"), function (input) {
      input.addEventListener("input", function () { markInvalid(input, false); });
      input.addEventListener("change", function () { markInvalid(input, false); });
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      var invalid = validate();
      if (invalid) {
        invalid.focus();
        return;
      }

      var data = new FormData(form);
      var name = String(data.get("name") || "").trim();
      var company = String(data.get("company") || "").trim();
      var purpose = String(data.get("purpose") || "").trim();
      var message = String(data.get("message") || "").trim();

      var subject = "Portfolio enquiry — " + purpose + (company ? " (" + company + ")" : "");

      var body = [
        "Name: " + name,
        "Company: " + (company || "—"),
        "Purpose: " + purpose,
        "",
        message,
        "",
        "—",
        "Sent from alper-kulturel.github.io"
      ].join("\n");

      var href =
        "mailto:" + RECIPIENT +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);

      window.location.href = href;

      if (status) {
        status.innerHTML =
          "Opening your email client with the message ready to send. " +
          "If nothing happens, write to " +
          '<a href="mailto:' + RECIPIENT + '"><strong>' + RECIPIENT + "</strong></a> directly.";
        status.classList.add("is-shown");
      }
    });
  }

  /* ----------------------------------------------------------------------
     9. COPY EMAIL
     ---------------------------------------------------------------------- */

  function initCopyEmail() {
    var buttons = document.querySelectorAll("[data-copy]");
    if (!buttons.length) return;

    each(buttons, function (button) {
      var original = button.innerHTML;

      button.addEventListener("click", function () {
        var value = button.getAttribute("data-copy") || "";

        function done(ok) {
          if (!ok) return;
          button.classList.add("is-copied");
          button.innerHTML = "Copied";
          window.setTimeout(function () {
            button.classList.remove("is-copied");
            button.innerHTML = original;
          }, 1900);
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(value).then(
            function () { done(true); },
            function () { done(false); }
          );
          return;
        }

        // older browsers: select the text so the person can copy manually
        var scratch = document.createElement("textarea");
        scratch.value = value;
        scratch.setAttribute("readonly", "");
        scratch.style.position = "fixed";
        scratch.style.opacity = "0";
        document.body.append(scratch);
        scratch.select();
        var ok = false;
        try { ok = document.execCommand("copy"); } catch (err) { ok = false; }
        document.body.removeChild(scratch);
        done(ok);
      });
    });
  }

  /* ---------------------------------------------------------------------- */

  function boot() {
    initCursor();
    initTypewriter();
    initReveals();
    initStats();
    initFooterIcons();
    initToTop();
    initDownloadMenu();
    initContactForm();
    initCopyEmail();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
