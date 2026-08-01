/* Audio Mirror — site behaviour.
   Progressive enhancement only: everything here is optional polish, and
   the page is fully readable and navigable with JS disabled. */

(function () {
  'use strict';

  var reduced = window.matchMedia &&
                window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Scroll-in reveal ──────────────────────────────────────
     Cards start hidden via .reveal, so it is only applied when we can
     actually observe them -- otherwise a browser without
     IntersectionObserver would leave the page permanently blank. */
  var targets = document.querySelectorAll(
    '.prob-card, .step, .feat, .price-card, .faq details, .shot-frame'
  );

  if (!reduced && 'IntersectionObserver' in window) {
    Array.prototype.forEach.call(targets, function (el, i) {
      el.classList.add('reveal');
      // Stagger within a row so a grid animates in sequence, not as a slab.
      el.style.transitionDelay = (i % 3) * 60 + 'ms';
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        io.unobserve(entry.target);   // one-shot: no re-animation on scroll up
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    Array.prototype.forEach.call(targets, function (el) { io.observe(el); });
  }

  /* ── Animated delay-slider demo ────────────────────────────
     Walks the top slider from 0 to ~88ms, which is the gesture the app's
     per-device delay control is for. Runs only while on screen. */
  var demo = document.querySelector('.slider-demo');
  if (demo && !reduced && 'IntersectionObserver' in window) {
    var fill = demo.querySelector('.sd-fill');
    var knob = demo.querySelector('.sd-knob');
    var val  = demo.querySelector('.sd-val');
    var sync = demo.querySelector('.sd-sync');

    var MAX_MS = 400;          // matches MAX_DELAY_MS in the engine
    var TARGET = 88;
    var raf = null;

    function run() {
      var start = null;
      sync.style.visibility = 'hidden';

      function frame(ts) {
        if (start === null) start = ts;
        var t = Math.min((ts - start) / 1400, 1);
        var eased = 1 - Math.pow(1 - t, 3);
        var ms = Math.round(TARGET * eased);
        var pct = (ms / MAX_MS) * 100;

        fill.style.width = pct + '%';
        knob.style.left = pct + '%';
        val.textContent = ms + ' ms';

        if (t < 1) {
          raf = requestAnimationFrame(frame);
        } else {
          sync.style.visibility = 'visible';
          // Hold, then replay so a lingering visitor sees it more than once.
          raf = setTimeout(function () { run(); }, 2600);
        }
      }
      raf = requestAnimationFrame(frame);
    }

    function stop() {
      if (raf === null) return;
      cancelAnimationFrame(raf);
      clearTimeout(raf);
      raf = null;
    }

    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { if (raf === null) run(); }
        else { stop(); }
      });
    }, { threshold: 0.4 }).observe(demo);
  }

  /* ── FAQ accordion ────────────────────────────────────────
     Native <details> stays the source of truth; this only closes the
     others so the list never becomes a wall of open text. */
  var items = document.querySelectorAll('.faq details');
  Array.prototype.forEach.call(items, function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open) return;
      Array.prototype.forEach.call(items, function (other) {
        if (other !== d) other.open = false;
      });
    });
  });

  /* ── Download acknowledgement ─────────────────────────────
     The href does the real work; this is only feedback. Label is restored
     so a second download does not sit on a stale "Starting..." state. */
  var dls = document.querySelectorAll('a[download]');
  Array.prototype.forEach.call(dls, function (a) {
    a.addEventListener('click', function () {
      var original = a.textContent;
      a.textContent = 'Starting download…';
      setTimeout(function () { a.textContent = original; }, 2400);
    });
  });
})();
